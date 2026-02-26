"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Search, Filter, RefreshCw, ChevronDown } from "lucide-react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

import { SearchFilter } from "@/app/components/search/SearchFilter";
import { CommonPopup } from "@/views/common/CommonPopup";
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
};

export function SearchFilters({
  meta,
  onSearch,
}: {
  meta: readonly SearchMeta[];
  onSearch: React.Dispatch<React.SetStateAction<[]>>;
}) {
  const { openPopup, closePopup } = usePopup();
  const [open, setOpen] = useState(false);

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

  const handleSearch = () => {
    const whereClause = Object.values(searchState)
      .map((v) => buildSearchCondition(v))
      .join("");

    const userId = sessionStorage.getItem("userId");

    tenderApi
      .getDispatchList({
        sesUserId: userId,
        userId,
        ACCESS_TOKEN: sessionStorage.getItem("ACCESS_TOKEN"),
        DYNAMIC_QUERY: whereClause,
        MENU_CD: "test",
      })
      .then((res: any) => {
        onSearch(res.data.result);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  return (
    <Card className="shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[rgb(var(--primary))]" />
            <h2 className="text-sm font-semibold">조회 조건</h2>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
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
                };

                switch (m.type) {
                  /* ---------- TEXT / COMBO ---------- */
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

                  /* ---------- DATE RANGE ---------- */
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

                  /* ---------- CHECKBOX ---------- */
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

                  /* ---------- POPUP ---------- */
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
              onClick={handleSearch}
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
