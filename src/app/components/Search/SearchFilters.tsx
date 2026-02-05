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
  /** 🔹 초기 state 생성 */
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
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[rgb(var(--primary))]" />
            <h2 className="text-sm font-semibold">조회 조건</h2>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
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
              p-3
              [&_input]:h-8
              [&_input]:text-sm
              [&_select]:h-8
              [&_select]:text-sm
              [&_button]:h-8
            "
          >
            {/* Filters */}
            <div className="grid grid-cols-12 gap-x-4 gap-y-2">
              {meta.map((m) => {
                const common = {
                  key: m.key,
                  type: m.type,
                  label: m.label,
                  span: m.span,
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
                    return (
                      <SearchFilter
                        {...common}
                        value={filters[m.key]}
                        onChange={(v: string) =>
                          setFilters((p) => ({ ...p, [m.key]: v }))
                        }
                      />
                    );

                  case "combo":
                    return (
                      <SearchFilter
                        {...common}
                        value={filters[m.key]}
                        options={m.options ?? []}
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
                          setFilters((p) => ({ ...p, [`${m.key}Code`]: v }))
                        }
                        onChangeName={(v: string) =>
                          setFilters((p) => ({ ...p, [`${m.key}Name`]: v }))
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
                          setFilters((p) => ({ ...p, [`${m.key}From`]: v }))
                        }
                        onChangeTo={(v: string) =>
                          setFilters((p) => ({ ...p, [`${m.key}To`]: v }))
                        }
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-2 pt-2 border-t">
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
