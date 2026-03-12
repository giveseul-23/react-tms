"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
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
import { tenderApi } from "@/app/services/tender/tenderApi";

type SearchMeta = {
  key: string;
  type: "text" | "combo" | "popup" | "dateRange" | "checkbox";
  label: string;
  span?: number;
  mode?: string;
  sqlId?: string;
  condition?: string;
  requaluired?: boolean;
  granularity?: string;
  options?: { value: string; label: string }[];
  dataType: string;
  required?: boolean;
};

// ← onSearch 타입 변경: rows/totalCount/page/limit 를 담은 객체를 전달
export function SearchFilters({
  meta,
  onSearch,
  searchRef,
  filtersRef,
  pageSize = 20,
}: {
  meta: readonly SearchMeta[];
  onSearch: (data: {
    rows: any[];
    totalCount: number;
    page: number;
    limit: number;
  }) => void;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  pageSize?: number;
}) {
  const { openPopup, closePopup } = usePopup();
  const [open, setOpen] = useState(false);
  const [limit] = useState(pageSize);

  const [searchState, setSearchState] = useState<
    Record<string, SearchCondition>
  >({});

  const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const buildInitialSearchState = () => {
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
  };

  useEffect(() => {
    if (!meta?.length) return;
    setSearchState(buildInitialSearchState());
  }, [meta]);

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

  // ← targetPage 파라미터 추가 (페이지 변경 시 재조회에 사용)
  const handleSearch = useCallback(
    (targetPage = 1) => {
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
              .filter((o) => o.CODE !== "ALL")
              .map((o) => `'${o.CODE}'`)
              .join(",");

            conditions.push(` AND ${v.key} IN (${codes})`);
          }
        } else {
          conditions.push(buildSearchCondition(v));
        }
      });

      const whereClause = conditions.join("");
      const userId = sessionStorage.getItem("userId");

      if (filtersRef) {
        filtersRef.current = {
          DYNAMIC_QUERY: whereClause,
          MENU_CD: "test",
        };
      }

      tenderApi
        .getDispatchList({
          sesUserId: userId,
          userId,
          ACCESS_TOKEN: sessionStorage.getItem("ACCESS_TOKEN"),
          REFRESH_TOKEN: sessionStorage.getItem("REFRESH_TOKEN"),
          DYNAMIC_QUERY: whereClause,
          MENU_CD: "test",
          page: targetPage, // ← 추가
          limit, // ← 추가
        })
        .then((res: any) => {
          const rows = res.data.result ?? [];
          const totalCount = rows[0]?.TOTALCOUNT ?? 0; // ← 첫 번째 row에서 추출

          onSearch({
            rows,
            totalCount,
            page: targetPage,
            limit,
          });
        })
        .catch((err: any) => {
          console.error(err);
        });
    },
    [searchState, meta, limit, onSearch],
  );

  useEffect(() => {
    if (searchRef) {
      searchRef.current = handleSearch;
    }
  }, [searchRef, handleSearch]);

  return (
    <Card className="shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={`flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] ${open ? "rounded-t-xl" : "rounded-xl"}`}
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
                  onConditionChange: (op: string) => {
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
                            m.condition ?? "equal",
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
                              m.condition ?? "equal",
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

                  case "popup":
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

                  default:
                    return null;
                }
              })}
            </div>
          </CardContent>

          <div className="flex justify-between px-2 py-1 border-t">
            <Button variant="outline" size="xs" onClick={handleReset}>
              <RefreshCw className="w-3 h-3" />
              초기화
            </Button>

            <Button
              variant="outline"
              size="xs"
              onClick={() => handleSearch(1)} // ← 조회 버튼은 항상 1페이지부터
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
