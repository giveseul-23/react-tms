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
  type: "text" | "combo" | "popup" | "dateRange" | "checkbox";
  label: string;
  span?: number;
  mode?: string;
  sqlId?: string;
  condition?: string;
  required?: boolean;
  granularity?: string;
  options?: { value: string; label: string }[];
};

export function SearchFilters({
  meta,
  value,
  onChange,
}: {
  meta: readonly SearchMeta[];
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  const initialState = useMemo(() => {
    const s: Record<string, any> = {};
    meta.forEach((m) => {
      if (m.type === "dateRange") {
        s[`${m.key}From`] = "";
        s[`${m.key}To`] = "";
      } else if (m.type === "popup") {
        s[`${m.key}Code`] = "";
        s[`${m.key}Name`] = "";
      } else if (m.type === "checkbox") {
        s[m.key] = false;
      } else {
        s[m.key] = "";
      }
      s[`${m.key}Condition`] = m.condition ?? "equal";
    });
    return s;
  }, [meta]);

  const { openPopup, closePopup } = usePopup();

  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    console.log("검색 payload:", value);
  };

  const handleReset = () => {
    onChange(initialState);
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
                const common = {
                  key: m.key,
                  type: m.type,
                  label: m.label,
                  span: m.span ?? 1,
                  mode: m.mode,
                  granularity: m.granularity,
                  required: m.required,
                  condition: value[`${m.key}Condition`],
                  onConditionChange: (v: string) =>
                    onChange({
                      ...value,
                      [m.key]: v,
                    }),
                };

                switch (m.type) {
                  case "text":
                  case "combo":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        value={value[m.key]}
                        options={m.options}
                        onChange={(v: string) =>
                          onChange({
                            ...value,
                            [m.key]: v,
                          })
                        }
                      />
                    );

                  case "popup":
                    const key = m.key.replace("_CD", "");
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        code={value[`${key}_CD`]}
                        name={value[`${key}_NM`]}
                        codeId={value[`${key}_CD`]}
                        nameId={value[`${key}_NM`]}
                        sqlId={m.sqlId}
                        onChangeCode={(v: string) =>
                          onChange({
                            ...value,
                            [`${key}_CD`]: v,
                          })
                        }
                        onChangeName={(v: string) =>
                          onChange({
                            ...value,
                            [`${key}_NM`]: v,
                          })
                        }
                        onClickSearch={() =>
                          openPopup({
                            title: m.label,
                            content: (
                              <CommonPopup
                                sqlId={m.sqlId}
                                onApply={(row: any) => {
                                  onChange({
                                    ...value,
                                    [`${key}_CD`]: row.CODE,
                                    [`${key}_NM`]: row.NAME,
                                  });
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

                  case "dateRange":
                    return (
                      <SearchFilter
                        {...common}
                        key={m.key}
                        fromValue={value[`${m.key}From`]}
                        toValue={value[`${m.key}To`]}
                        onChangeFrom={(v: string) =>
                          onChange({
                            ...value,
                            [`${m.key}From`]: v,
                          })
                        }
                        onChangeTo={(v: string) =>
                          onChange({
                            ...value,
                            [`${m.key}To`]: v,
                          })
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
                        checked={Boolean(value[m.key])}
                        onCheckedChange={(checked: any) =>
                          onChange({
                            ...value,
                            [m.key]: checked,
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

          {/* Footer */}
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
