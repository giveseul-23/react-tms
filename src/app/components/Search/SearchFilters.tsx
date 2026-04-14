"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

import { SearchFilter } from "@/app/components/Search/SearchFilter";
import { CommonPopup } from "@/views/common/CommonPopup";
import ConfirmModal from "@/views/common/ConfirmPopup";
import {
  buildSearchCondition,
  SearchCondition,
} from "@/features/search/search.builder";

import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";
import { showSearchToast } from "@/app/components/ui/SearchToast";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { commonApi } from "@/app/services/common/commonApi";

import { type TreeGridHandle } from "@/app/components/grid/TreeGrid";

export type SearchResult = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function SearchFilters({
  meta,
  onSearch,
  treeGridRef,
  searchRef,
  filtersRef,
  rawFiltersRef,
  pageSize = 20,
  // fetchFn을 prop으로 주입받아 tenderApi 직접 의존 제거
  fetchFn,
  layoutToggle,
  excludeKeysRef,
  computeTotalCount,
  moduleDefault,
  moduleDefaultParams,
  moduleDefaultRemove,
  moduleDefaultSearchParams,
}: {
  meta: readonly SearchMeta[];
  onSearch: (data: SearchResult) => void;
  treeGridRef?: React.MutableRefObject<TreeGridHandle>;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  pageSize?: number;
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  /** DataGrid 두 개인 화면에서만 전달 — 초기화 버튼 옆에 렌더링 */
  layoutToggle?: ReactNode;
  excludeKeysRef?: React.MutableRefObject<Set<string>>;
  /** 모듈 기본값 조회 — 모듈명 (예: "TMS"). falsy면 비활성 */
  moduleDefault?: string;
  /** 모듈 기본값 API에 추가 전달할 파라미터 */
  moduleDefaultParams?: Record<string, unknown>;
  /** 모듈 기본값 응답에서 제외할 키 목록 (센차 remove 대응) */
  moduleDefaultRemove?: string[];
  /** 모듈 기본값 API 호출 시 다른 검색조건 값을 파라미터로 전달 (센차 searchParams 대응)
   *  예: { DIV_CD: "DIV_CD" } → DIV_CD 검색필드의 현재 값을 API param DIV_CD로 전달 */
  moduleDefaultSearchParams?: Record<string, string>;
}) {
  const { openPopup, closePopup } = usePopup();
  const [open, setOpen] = useState(true);
  const [limit, setLimit] = useState(pageSize);
  const limitRef = useRef(pageSize);

  const [searchState, setSearchState] = useState<
    Record<string, SearchCondition>
  >({});
  const [searching, setSearching] = useState(false);

  // ── 모듈 기본값 관련 refs ──────────────────────────────────────
  const moduleDefaultLoaded = useRef(false);
  const moduleDefaultCache = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    // limit을 ref에 즉시 반영 (state 비동기 업데이트 우회)
    limitRef.current = pageSize;
    setLimit(pageSize);
  }, [pageSize]);

  // pageSize가 바뀌면 자동 재조회 (초기 마운트는 제외)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleSearch(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // YMDT 전용: datetime 포맷 ("YYYY-MM-DDTHH:MM:SS")
  const getNowLocal = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  };

  // YMDT range 기본값: 오늘 00:00:00 ~ 오늘 23:59:59
  const getTodayAt = (hms: "00:00:00" | "23:59:59") => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hms}`;
  };

  const buildInitialSearchState = useCallback(() => {
    const today = getToday();
    const now = getNowLocal();
    const initial: Record<string, SearchCondition> = {};

    meta.forEach((m) => {
      if (m.type !== "YMD" && m.type !== "YMDT") return;

      if (m.mode === "N") {
        // 단일: YMD=오늘 / YMDT=지금(초까지)
        initial[m.key] = {
          key: m.key,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: m.type === "YMDT" ? now : today,
        };
      } else {
        // 범위: YMD=오늘~오늘 / YMDT=오늘 00:00:00 ~ 오늘 23:59:59
        const fromKey = `${m.key}_FRM`;
        const toKey = `${m.key}_TO`;

        const fromVal = m.type === "YMDT" ? getTodayAt("00:00:00") : today;
        const toVal = m.type === "YMDT" ? getTodayAt("23:59:59") : today;

        initial[fromKey] = {
          key: fromKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: fromVal,
        };

        initial[toKey] = {
          key: toKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: toVal,
        };
      }
    });

    return initial;
  }, [meta]);

  useEffect(() => {
    if (!meta?.length) return;
    const initialState = buildInitialSearchState();
    setSearchState(initialState);

    // ── 모듈 기본값 자동 조회 (센차 setModuleDefaultValue 대응) ──
    if (moduleDefault && !moduleDefaultLoaded.current) {
      moduleDefaultLoaded.current = true;

      const apiParams: Record<string, unknown> = { ...moduleDefaultParams };

      // searchParams: 다른 검색필드의 현재 값을 API 파라미터로 전달
      if (moduleDefaultSearchParams) {
        for (const [paramKey, fieldKey] of Object.entries(
          moduleDefaultSearchParams,
        )) {
          apiParams[paramKey] = initialState[fieldKey]?.value ?? "";
        }
      }

      commonApi
        .fetchModuleDefaultValue(moduleDefault, apiParams)
        .then((res: any) => {
          const data = res.data?.data?.dsOut?.[0];
          if (!data) return;

          const removeSet = new Set(moduleDefaultRemove ?? []);
          const defaults: Record<string, string> = {};

          // API 응답 key(예: LGST_GRP_CD)로 meta를 찾는 헬퍼
          // meta key가 DTL.LGST_GRP_CD 처럼 prefix가 붙어있을 수 있으므로
          // 정확 일치 → '.' + key 로 끝나는 것 순으로 탐색
          const findMeta = (apiKey: string) =>
            meta.find((m) => m.key === apiKey || m.key.endsWith("." + apiKey));

          for (const [key, rawValue] of Object.entries(data)) {
            if (removeSet.has(key)) continue;
            const parts = String(rawValue).split("^SPLT^");
            const code = parts[0] ?? "";
            const name = parts[1] ?? "";

            const m = findMeta(key);
            if (!m) continue; // meta에 없는 key는 세팅하지 않음
            const metaKey = m.key;

            if (m.type === "POPUP") {
              // POPUP: _CD = code, _NM = name (meta key 기준)
              const baseKey = metaKey.replace("_CD", "");
              defaults[`${baseKey}_CD`] = code;
              if (name) defaults[`${baseKey}_NM`] = name;
            } else {
              // COMBO / TEXT 등: code만 세팅 (meta key 기준)
              defaults[metaKey] = code;
            }
          }

          // 캐시 저장 (초기화 시 재적용용)
          moduleDefaultCache.current = defaults;

          setSearchState((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(defaults)) {
              if (next[k]) {
                next[k] = { ...next[k], value: v };
              } else {
                // 아직 사용자 입력이 없어 searchState에 없는 필드(COMBO/TEXT/POPUP _NM 등)에 기본값 세팅
                next[k] = {
                  key: k,
                  operator: "equal",
                  dataType: "STRING",
                  value: v,
                  sourceType: k.endsWith("_NM") ? "POPUP" : "NORMAL",
                };
              }
            }
            return next;
          });
        })
        .catch((err: any) =>
          console.error("[SearchFilters] fetchModuleDefaultValue failed", err),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, buildInitialSearchState]);

  const getCondition = (key: string) => searchState[key];

  type SearchDataType = "STRING" | "NUMBER" | "DATE";

  const updateCondition = (
    key: string,
    newValue: string,
    operator: keyof typeof CONDITION_ICON_MAP,
    dataType: SearchDataType,
    sourceType: "POPUP" | "NORMAL" = "NORMAL",
  ) => {
    setSearchState((prev) => ({
      ...prev,
      [key]: {
        key,
        operator,
        dataType,
        value: newValue ?? "",
        sourceType,
      },
    }));
  };

  const handleReset = () => {
    const initial = buildInitialSearchState();

    // 모듈 기본값이 캐시되어 있으면 초기화 시에도 재적용
    if (moduleDefaultCache.current) {
      for (const [k, v] of Object.entries(moduleDefaultCache.current)) {
        if (initial[k]) {
          initial[k] = { ...initial[k], value: v };
        } else {
          initial[k] = {
            key: k,
            operator: "equal",
            dataType: "STRING",
            value: v,
            sourceType: k.endsWith("_NM") ? "POPUP" : "NORMAL",
          };
        }
      }
    }

    setSearchState(initial);
  };

  const handleSearch = useCallback(
    (targetPage = 1, showToast = true) => {
      const missingFields = meta
        .filter((m) => m.required === true)
        .filter((m) => {
          if (m.type === "YMD" || m.type === "YMDT") {
            if (m.mode === "N") {
              return !searchState[m.key]?.value;
            }
            return (
              !searchState[`${m.key}_FRM`]?.value ||
              !searchState[`${m.key}_TO`]?.value
            );
          }
          return !searchState[m.key]?.value;
        });

      if (missingFields.length > 0) {
        const labels = missingFields.map((m) => m.label).join(", ");
        openPopup({
          title: "",
          content: (
            <ConfirmModal
              type="error"
              title="필수 항목 누락"
              description={`다음 항목을 입력해주세요 : ${labels}`}
              onClose={closePopup}
            />
          ),
          width: "sm",
        });
        return;
      }

      const conditions: string[] = [];
      const extraParams: Record<string, any> = {};

      Object.values(searchState).forEach((v) => {
        if (excludeKeysRef?.current.has(v.key)) {
          extraParams[v.key] = v.value;
          return;
        }

        if (v.value === "ALL") {
          return;
        } else {
          conditions.push(buildSearchCondition(v));
        }
      });

      // ── 요구사항 3: DYNAMIC_QUERY 는 항상 "1=1" 로 시작
      //    buildSearchCondition 이 " AND ..." 를 반환하므로
      //    앞에 "1=1" 을 붙이면 최종적으로 "1=1 AND ..." 가 된다.
      const filteredConditions = conditions.filter(Boolean);
      const whereClause = "1=1" + filteredConditions.join("");

      const params: Record<string, unknown> = {
        DYNAMIC_QUERY: whereClause,
        MENU_CD: "test",
        page: targetPage,
        limit: limitRef.current,
        ...extraParams,
      };

      if (filtersRef) {
        filtersRef.current = {
          DYNAMIC_QUERY: whereClause,
          MENU_CD: "test",
          ...extraParams,
        };
      }

      // rawFiltersRef: 개별 key-value 원본 (DYNAMIC_QUERY 컴파일 전 값)
      // 네이밍: DSPCH.DIV_CD → SRCH_DSPCH_DIV_CD (dot → _, SRCH_ 접두)
      if (rawFiltersRef) {
        const raw: Record<string, string> = {};
        Object.values(searchState).forEach((v) => {
          if (v.value != null && v.value !== "" && v.value !== "ALL") {
            const key = `SRCH_${v.key.replace(/\./g, "_")}`;
            raw[key] = String(v.value);
          }
        });
        rawFiltersRef.current = raw;
      }

      setSearching(true);
      fetchFn(params)
        .then((res: any) => {
          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            [];

          const totalCount = computeTotalCount
            ? computeTotalCount(rows) // 외부 함수로 직접 계산
            : rows[0]?.TOTALCOUNT != null
              ? Number(rows[0].TOTALCOUNT) // TOTALCOUNT 필드 있으면 사용
              : rows.length; // 없으면 배열 길이 fallback

          onSearch({
            rows,
            totalCount,
            page: targetPage,
            limit: limitRef.current,
          });
          if (showToast) showSearchToast(totalCount);
        })
        .catch((err: any) => {
          const message =
            err?.response?.data?.error?.message ??
            String(err?.response?.data?.error ?? err?.message ?? err);

          openPopup({
            title: "",
            content: (
              <ConfirmModal
                type="error"
                title="조회 오류"
                description={message}
                onClose={closePopup}
              />
            ),
            width: "sm",
          });
        })
        .finally(() => setSearching(false));
    },
    [
      searchState,
      meta,
      limit,
      onSearch,
      fetchFn,
      filtersRef,
      openPopup,
      closePopup,
    ],
  );

  useEffect(() => {
    if (searchRef) {
      searchRef.current = handleSearch;
    }
  }, [searchRef, handleSearch]);

  return (
    <Card className="shadow-sm rounded-lg">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={`flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] ${open ? "rounded-t-lg" : "rounded-lg"}`}
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-white mt-px" />
            <span className="text-[13px] font-semibold text-white uppercase leading-none">
              조회조건
            </span>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-slate-200 hover:bg-transparent hover:text-white hover:font-bold"
            >
              {open ? "접기" : "펼치기"}
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <CardContent
            className="
            p-2
            text-[12px]

            [&_input]:h-6
            [&_input]:px-2
            [&_input]:py-0
            [&_input]:text-[11px]

            [&_select]:h-6
            [&_[role=combobox]]:h-6
            [&_button]:h-6
            "
          >
            <div className="grid grid-cols-20 gap-x-2 gap-y-1">
              {meta.map((m) => {
                const condition = getCondition(m.key);

                const common = {
                  key: m.key,
                  type: m.type,
                  label: m.label,
                  span: m.span ?? 1,
                  requaluired: m.required,
                  condition:
                    getCondition(m.key)?.operator ?? m.condition ?? "equal",
                  dataType: m.dataType,
                  conditionLocked: m.conditionLocked,
                  onConditionChange: m.conditionLocked
                    ? undefined
                    : (op: string) => {
                        const currentValue = getCondition(m.key)?.value ?? "";
                        updateCondition(m.key, currentValue, op, m.dataType);
                      },
                  required: m.required ? m.required : false,
                };

                switch (m.type) {
                  case "TEXT":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="TEXT"
                        value={condition?.value ?? ""}
                        onChange={(v: string) =>
                          updateCondition(
                            m.key,
                            v,
                            (getCondition(m.key)?.operator ??
                              m.condition ??
                              "equal") as any,
                            m.dataType ?? "STRING",
                          )
                        }
                      />
                    );

                  case "COMBO":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="COMBO"
                        value={condition?.value ?? ""}
                        options={m.options ?? []}
                        onChange={(v: string) =>
                          updateCondition(
                            m.key,
                            v,
                            (getCondition(m.key)?.operator ??
                              m.condition ??
                              "equal") as any,
                            m.dataType ?? "STRING",
                          )
                        }
                      />
                    );

                  case "YMD":
                    if (m.mode === "N") {
                      return (
                        <SearchFilter
                          {...common}
                          key={m.key}
                          type="YMD"
                          mode="N"
                          fromValue={getCondition(m.key)?.value ?? ""}
                          toValue=""
                          onChangeFrom={(v: string) =>
                            updateCondition(
                              m.key,
                              v,
                              (getCondition(m.key)?.operator ??
                                m.condition ??
                                "equal") as any,
                              m.dataType ?? "STRING",
                            )
                          }
                        />
                      );
                    }

                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="YMD"
                        mode="Y"
                        fromValue={getCondition(`${m.key}_FRM`)?.value ?? ""}
                        toValue={getCondition(`${m.key}_TO`)?.value ?? ""}
                        onChangeFrom={(v: string) =>
                          updateCondition(
                            `${m.key}_FRM`,
                            v,
                            m.condition ?? "equal",
                            m.dataType ?? "STRING",
                          )
                        }
                        onChangeTo={(v: string) =>
                          updateCondition(
                            `${m.key}_TO`,
                            v,
                            m.condition ?? "equal",
                            m.dataType ?? "STRING",
                          )
                        }
                      />
                    );

                  case "YMDT":
                    if (m.mode === "N") {
                      return (
                        <SearchFilter
                          {...common}
                          key={m.key}
                          type="YMDT"
                          mode="N"
                          fromValue={getCondition(m.key)?.value ?? ""}
                          toValue=""
                          onChangeFrom={(v: string) =>
                            updateCondition(
                              m.key,
                              v,
                              (getCondition(m.key)?.operator ??
                                m.condition ??
                                "equal") as any,
                              m.dataType ?? "STRING",
                            )
                          }
                        />
                      );
                    }

                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="YMDT"
                        mode="Y"
                        fromValue={getCondition(`${m.key}_FRM`)?.value ?? ""}
                        toValue={getCondition(`${m.key}_TO`)?.value ?? ""}
                        onChangeFrom={(v: string) =>
                          updateCondition(
                            `${m.key}_FRM`,
                            v,
                            m.condition ?? "equal",
                            m.dataType ?? "STRING",
                          )
                        }
                        onChangeTo={(v: string) =>
                          updateCondition(
                            `${m.key}_TO`,
                            v,
                            m.condition ?? "equal",
                            m.dataType ?? "STRING",
                          )
                        }
                      />
                    );

                  case "CHECKBOX":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="CHECKBOX"
                        id={m.key}
                        checked={Boolean(condition?.value)}
                        onCheckedChange={(checked: boolean) =>
                          updateCondition(
                            m.key,
                            checked ? "Y" : "",
                            "equal",
                            m.dataType ?? "STRING",
                          )
                        }
                      />
                    );

                  case "POPUP": {
                    const baseKey = m.key.replace("_CD", "");

                    if (m.filterComponent && m.filterRefColumn) {
                      let filterM = meta.filter(
                        (x) => x.key.indexOf(m.filterComponent) > -1,
                      );
                      filterM[0].filterCol = m.filterRefColumn;
                      filterM[0].filterValueKey = m.key;
                    }

                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="POPUP"
                        code={getCondition(`${baseKey}_CD`)?.value ?? ""}
                        name={getCondition(`${baseKey}_NM`)?.value ?? ""}
                        sqlId={m.sqlId}
                        onClickSearch={() =>
                          openPopup({
                            title: m.label,
                            content: (
                              <CommonPopup
                                sqlId={m.sqlId}
                                onApply={(row: any) => {
                                  updateCondition(
                                    `${baseKey}_CD`,
                                    row.CODE,
                                    "equal",
                                    m.dataType ?? "STRING",
                                    "POPUP",
                                  );
                                  updateCondition(
                                    `${baseKey}_NM`,
                                    row.NAME,
                                    "equal",
                                    m.dataType ?? "STRING",
                                    "POPUP",
                                  );
                                  closePopup();
                                }}
                                onClose={closePopup}
                                filterCol={m.filterCol ? m.filterCol : ""}
                                filterValue={
                                  m.filterValueKey
                                    ? getCondition(m.filterValueKey).value
                                    : ""
                                }
                              />
                            ),
                            width: "2xl",
                          })
                        }
                      />
                    );
                  }

                  default:
                    return null;
                }
              })}
            </div>
          </CardContent>

          <div className="flex justify-between px-2 py-1 border-t">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="xs" onClick={handleReset}>
                <RefreshCw className="w-3 h-3" />
                초기화
              </Button>
              {layoutToggle}
            </div>

            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSearch(1)}
              disabled={searching}
              className="btn-primary btn-primary:hover"
            >
              {searching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
              {searching ? "조회중..." : "조회"}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
