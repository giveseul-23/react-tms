"use client";

import { useMemo, useState } from "react";
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

type SearchMeta = {
  key: string;
  type: "text" | "combo" | "popup" | "dateRange";
  label: string;
  span?: number;
  condition?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export function SearchFilters({ meta }: { meta: readonly SearchMeta[] }) {
  const initialState = useMemo(() => {
    const s: Record<string, any> = {};
    meta.forEach((m) => {
      if (m.type === "dateRange") {
        s[`${m.key}From`] = "";
        s[`${m.key}To`] = "";
      } else if (m.type === "popup") {
        s[`${m.key}Code`] = "";
        s[`${m.key}Name`] = "";
      } else {
        s[m.key] = "";
      }
      s[`${m.key}Condition`] = m.condition ?? "equal";
    });
    return s;
  }, [meta]);

  const { openPopup } = usePopup();

  const [filters, setFilters] = useState(initialState);
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    console.log("검색 payload:", filters);
  };

  const handleReset = () => {
    setFilters(initialState);
  };

  return (
    <Card className="shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Header */}
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
          {/* 조회조건 영역 */}
          <div
            className="origin-top-left scale-[0.85] -mb-6"
            style={{ width: "117%" }}
          >
            <CardContent
              className="
        p-2
        [&_input]:h-7
        [&_input]:text-xs
        [&_select]:h-7
        [&_[role=combobox]]:h-7
        [&_button]:h-7
      "
            >
              <div className="grid grid-cols-17 gap-x-1 gap-y-1">
                {meta.map((m) => {
                  const common = {
                    key: m.key,
                    type: m.type,
                    label: m.label,
                    span: m.span ?? 1,
                    required: m.required,
                    condition: filters[`${m.key}Condition`],
                    onConditionChange: (c: string) =>
                      setFilters((p) => ({
                        ...p,
                        [`${m.key}Condition`]: c,
                      })),
                  };

                  switch (m.type) {
                    case "text":
                    case "combo":
                      return (
                        <SearchFilter
                          {...common}
                          value={filters[m.key]}
                          options={m.options}
                          onChange={(v: string) =>
                            setFilters((p) => ({ ...p, [m.key]: v }))
                          }
                        />
                      );

                    case "popup":
                      return (
                        <SearchFilter
                          {...common}
                          code={filters[`${m.key}Code`]}
                          name={filters[`${m.key}Name`]}
                          onChangeCode={(v: string) =>
                            setFilters((p) => ({
                              ...p,
                              [`${m.key}Code`]: v,
                            }))
                          }
                          onChangeName={(v: string) =>
                            setFilters((p) => ({
                              ...p,
                              [`${m.key}Name`]: v,
                            }))
                          }
                          onClickSearch={() =>
                            openPopup({
                              title: m.label,
                              content: <CommonPopup />,
                              width: "2xl",
                            })
                          }
                        />
                      );

                    case "dateRange":
                      return (
                        <SearchFilter
                          {...common}
                          fromValue={filters[`${m.key}From`]}
                          toValue={filters[`${m.key}To`]}
                          onChangeFrom={(v: string) =>
                            setFilters((p) => ({
                              ...p,
                              [`${m.key}From`]: v,
                            }))
                          }
                          onChangeTo={(v: string) =>
                            setFilters((p) => ({
                              ...p,
                              [`${m.key}To`]: v,
                            }))
                          }
                        />
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            </CardContent>
          </div>

          {/* Footer */}
          <div className="flex justify-between px-2 py-1.5 border-t">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-1" />
              초기화
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              className="btn-primary btn-primary:hover"
            >
              <Search className="w-4 h-4 mr-1" />
              조회
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
