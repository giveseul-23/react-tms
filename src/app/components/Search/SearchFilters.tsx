"use client";

import React, { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  SlidersHorizontal,
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

type SearchMeta = {
  key: string;
  type: "text" | "combo" | "popup" | "dateRange" | "checkbox";
  label: string;
  span?: number;
  mode?: string;
  sqlId?: string;
  condition?: string;
  conditionLocked?: boolean;
  requaluired?: boolean;
  granularity?: string;
  options?: { value: string; label: string }[];
  dataType: string;
  required?: boolean;
};

export type SearchResult = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export function SearchFilters({
  meta,
  onSearch,
  searchRef,
  filtersRef,
  pageSize = 20,
  // fetchFn을 prop으로 주입받아 tenderApi 직접 의존 제거
  fetchFn,
  layoutToggle,
}: {
  meta: readonly SearchMeta[];
  onSearch: (data: SearchResult) => void;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  pageSize?: number;
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  /** DataGrid 두 개인 화면에서만 전달 — 초기화 버튼 옆에 렌더링 */
  layoutToggle?: ReactNode;
}) {
  const { openPopup, closePopup } = usePopup();
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(pageSize);
  const limitRef = useRef(pageSize);

  const [searchState, setSearchState] = useState<
    Record<string, SearchCondition>
  >({});

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

  const buildInitialSearchState = useCallback(() => {
    const today = getToday();
    const initial: Record<string, SearchCondition> = {};

    meta.forEach((m) => {
      if (m.type !== "dateRange") return;

      if (m.mode === "single") {
        initial[m.key] = {
          key: m.key,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: today,
        };
      } else {
        const fromKey = `${m.key}_FRM`;
        const toKey = `${m.key}_TO`;

        initial[fromKey] = {
          key: fromKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: today,
        };

        initial[toKey] = {
          key: toKey,
          operator: m.condition ?? "equal",
          dataType: m.dataType,
          value: today,
        };
      }
    });

    return initial;
  }, [meta]);

  useEffect(() => {
    if (!meta?.length) return;
    setSearchState(buildInitialSearchState());
  }, [meta, buildInitialSearchState]);

  const getCondition = (key: string) => searchState[key];

  const updateCondition = (
    key: string,
    newValue: string,
    operator: keyof typeof CONDITION_ICON_MAP,
    dataType: string,
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
    setSearchState(buildInitialSearchState());
  };

  const handleSearch = useCallback(
    (targetPage = 1, showToast = true) => {
      const missingFields = meta
        .filter((m) => m.required === true)
        .filter((m) => {
          if (m.type === "dateRange") {
            if (m.mode === "single") {
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

      Object.values(searchState).forEach((v) => {
        if (v.value === "ALL") {
          const metaItem = meta.find((m) => m.key === v.key);

          if (metaItem?.options) {
            const codes = metaItem.options
              .filter((o: any) => o.CODE !== "ALL")
              .map((o: any) => `'${o.CODE}'`)
              .join(",");

            conditions.push(` AND ${v.key} IN (${codes})`);
          }
        } else {
          conditions.push(buildSearchCondition(v));
        }
      });

      const whereClause = conditions.join("");

      const params: Record<string, unknown> = {
        DYNAMIC_QUERY: whereClause,
        MENU_CD: "test",
        page: targetPage,
        limit: limitRef.current,
      };

      if (filtersRef) {
        filtersRef.current = {
          DYNAMIC_QUERY: whereClause,
          MENU_CD: "test",
        };
      }

      fetchFn(params)
        .then((res: any) => {
          const rows = res.data.result ?? [];
          const totalCount = rows[0]?.TOTALCOUNT ?? 0;

          onSearch({ rows, totalCount, page: targetPage, limit: limitRef.current });

          // 조회 완료 토스트 (페이지 이동 시에는 표시 안 함)
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
        });
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
            <span className="text-sm font-semibold text-white uppercase leading-none">
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
                  mode: m.mode,
                  granularity: m.granularity,
                  requaluired: m.requaluired,
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
                  case "text":
                  case "combo":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        value={condition?.value ?? ""}
                        options={m.options}
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

                  case "dateRange":
                    if (m.mode === "single") {
                      return (
                        <SearchFilter
                          {...common}
                          key={m.key}
                          value={getCondition(m.key)?.value ?? ""}
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
                    }

                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
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

                  case "checkbox":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        type="checkbox"
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

                  case "popup": {
                    const baseKey = m.key.replace("_CD", "");

                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
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
              className="btn-primary btn-primary:hover"
            >
              <Search className="w-3 h-3" />
              조회
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
