"use client";

import { useState } from "react";
import { Search, Filter, Download, RefreshCw, ChevronDown } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

import { SearchFilter } from "@/app/components/ui/searchFilterComponents/SearchFilter";

/* ======================
 * Options
 * ====================== */
const categoryOptions = [
  { value: "전체", label: "전체" },
  { value: "문학", label: "문학" },
  { value: "과학", label: "과학" },
  { value: "역사", label: "역사" },
  { value: "경제", label: "경제" },
  { value: "예술", label: "예술" },
];

/* ======================
 * Component
 * ====================== */
export function SearchFilters() {
  const [filters, setFilters] = useState({
    searchKeyword: "",
    category: "전체",
    dateFrom: "2025-01-01",
    dateTo: "2025-01-23",
    popupCode: "",
    popupName: "",
    onlySuccess: true,
  });

  /* 접기/펼치기 */
  const [open, setOpen] = useState(true);

  /* handlers */
  const handleSearch = () => {
    console.log("검색:", filters);
  };

  const handleReset = () => {
    setFilters({
      searchKeyword: "",
      category: "전체",
      dateFrom: "2025-01-01",
      dateTo: "2025-01-23",
      popupCode: "",
      popupName: "",
      onlySuccess: true,
    });
  };

  return (
    <Card className="shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* ================= Header ================= */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[rgb(var(--primary))]" />
            <h2 className="text-base font-semibold text-[rgb(var(--fg))]">
              조회 조건
            </h2>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[rgb(var(--fg))] hover:text-[rgb(var(--fg))]"
            >
              <span className="text-sm">{open ? "접기" : "펼치기"}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  open ? "rotate-180" : "rotate-0"
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* ================= Content ================= */}
        <CollapsibleContent>
          <CardContent className="p-4">
            <div className="grid grid-cols-12 gap-x-6 gap-y-3">
              {/* Text */}
              <SearchFilter
                type="text"
                label="텍스트"
                span={3}
                value={filters.searchKeyword}
                onChange={(v) => setFilters({ ...filters, searchKeyword: v })}
                // className="w-full"
                required
              />

              {/* Combo */}
              <SearchFilter
                type="combo"
                label="콤보"
                span={4}
                value={filters.category}
                onChange={(v) => setFilters({ ...filters, category: v })}
                options={categoryOptions}
                // className="w-full"
                required
              />

              {/* Date Range */}
              <SearchFilter
                type="dateRange"
                label="년월일"
                span={4}
                mode="range"
                granularity="datetime"
                fromValue={filters.fromDt}
                toValue={filters.toDt}
                onChangeFrom={(v) => setFilters({ ...filters, fromDt: v })}
                onChangeTo={(v) => setFilters({ ...filters, toDt: v })}
                className="w-full"
              />

              {/* Popup */}
              <SearchFilter
                type="popup"
                label="팝업"
                span={4}
                code={filters.popupCode}
                name={filters.popupName}
                onChangeCode={(v) => setFilters({ ...filters, popupCode: v })}
                onChangeName={(v) => setFilters({ ...filters, popupName: v })}
                onClickSearch={() => {
                  console.log("팝업 오픈");
                }}
                className="w-full"
              />

              {/* Checkbox */}
              <SearchFilter
                type="checkbox"
                id="onlySuccess"
                label="체크박스"
                span={3}
                checked={filters.onlySuccess}
                onCheckedChange={(v) =>
                  setFilters({ ...filters, onlySuccess: v })
                }
                className="w-fit"
                required
              />
            </div>

            {/* ================= Footer Buttons ================= */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="btn-outline gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                초기화
              </Button>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-outline gap-2"
                >
                  <Download className="w-4 h-4" />
                  엑셀 다운로드
                </Button>

                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="btn-primary gap-2"
                >
                  <Search className="w-4 h-4" />
                  조회
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
