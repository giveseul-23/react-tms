"use client";

import { useRef, useCallback, useState } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SearchFilters } from "@/app/components/Search/SearchFilters.tsx";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

/** 센차 menuCode — 서버에서 dsSearchCondition을 가져오는 키 */
const MENU_CODE = "MENU_CFG_SRCH_COND";

export default function SearchCondition() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const subApSetlRowDataRef = useRef<any[]>([]);
  const [subApSetlRowData, setSubApSetlRowData] = useState<any[]>([]);

  const setSubApSetlRowDataWithRef = useCallback((updater: any) => {
    setSubApSetlRowData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      subApSetlRowDataRef.current = next;
      return next;
    });
  }, []);

  if (loading) {
    return <Skeleton className="h-24" />;
  }

  const columnDefs = [
    { headerName: "No", pinned: "left" },
    { headerName: "메뉴코드", field: "MENU_CD", pinned: "left" },
    { headerName: "메뉴명", field: "MENU_NM", pinned: "left" },
    { headerName: "데이터베이스컬럼명", field: "DB_CLMN_NM", pinned: "left" },
    { headerName: "표시순서", field: "DSPLY_SEQ", pinned: "left" },
    { headerName: "메시지코드", field: "MSG_CD", pinned: "left" },
    {
      headerName: "삭제",
      field: "_delete",
      width: 60,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        if (!params.data._isNew) return null;
        return (
          <div className="flex items-center justify-start h-full">
            <input
              type="checkbox"
              className="ag-input-field-input ag-checkbox-input"
              onChange={(e) => {
                if (e.target.checked) {
                  setSubApSetlRowDataWithRef((prev: any) =>
                    prev.filter((row: any) => row !== params.data),
                  );
                }
              }}
            />
          </div>
        );
      },
    },
    { headerName: "사용여부", field: "USE_YN" },
    { headerName: "표시유형", field: "DSPLY_TP" },
    { headerName: "데이터유형", field: "DATA_TP" },
    { headerName: "범위조회여부", field: "DATA_TP" },
    { headerName: "필수여부", field: "DATA_TP" },
    { headerName: "조회연산자", field: "DATA_TP" },
    { headerName: "조회연산자고정여부", field: "DATA_TP" },
    { headerName: "기본값", field: "DATA_TP" },
    { headerName: "날짜조회최대범위", field: "DATA_TP" },
    { headerName: "SQL아이디", field: "DATA_TP" },
    { headerName: "SQL핵심매개변수", field: "DATA_TP" },
    { headerName: "SQL매개변수1", field: "DATA_TP" },
    { headerName: "SQL매개변수2", field: "DATA_TP" },
    { headerName: "SQL매개변수3", field: "DATA_TP" },
    { headerName: "페이지당조회건수", field: "DATA_TP" },
    { headerName: "최소입력길이", field: "DATA_TP" },
    { headerName: "연산자사용여부", field: "DATA_TP" },
    { headerName: "연산자포함", field: "DATA_TP" },
    { headerName: "연산자미포함", field: "DATA_TP" },
    { headerName: "연산자일치", field: "DATA_TP" },
    { headerName: "연산자부분일치", field: "DATA_TP" },
    { headerName: "날짜유형", field: "DATA_TP" },
    { headerName: "날짜기준유형", field: "DATA_TP" },
    { headerName: "데이터선택유형", field: "DATA_TP" },
    { headerName: "자식관계ID", field: "DATA_TP" },
    { headerName: "조회조건전체넓이", field: "DATA_TP" },
    { headerName: "조회조건필드넓이", field: "DATA_TP" },
    { headerName: "조회조건필드기본값", field: "DATA_TP" },
    { headerName: "조회조건필드전체여부", field: "DATA_TP" },
    { headerName: "팝업데이터선택유형", field: "DATA_TP" },
    { headerName: "필터링컴포넌트명", field: "DATA_TP" },
    { headerName: "필터링참조컬럼명", field: "DATA_TP" },
    { headerName: "기본값컬럼코드", field: "DATA_TP" },
    { headerName: "콤보표시유형", field: "DATA_TP" },
    { headerName: "표시순서", field: "DATA_TP" },
    { headerName: "데이터베이스컬럼명", field: "DATA_TP" },
    { headerName: "등록일자", field: "CRE_DTTM" },
    { headerName: "작성자/등록자", field: "CRE_USR_ID" },
    { headerName: "수정일시", field: "UPD_DTTM" },
    { headerName: "수정자", field: "UPD_USR_ID" },
  ];

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      <SearchFilters
        meta={meta}
        onSearch={() => console.log("onSearch")}
        searchRef={searchRef}
        filtersRef={filtersRef}
        pageSize={20}
        fetchFn={() => console.log("fetchFn")}
      />

      <DataGrid layoutType="plain" columnDefs={columnDefs} />
    </div>
  );
}
