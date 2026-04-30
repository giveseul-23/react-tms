"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { commonApi } from "@/app/services/common/commonApi";
import DataGrid from "@/app/components/grid/DataGrid";

/* =======================
 * Component
 * ======================= */
export function CommonPopup({
  sqlId,
  fetchFn,
  onApply,
  onClose,
  filterCol = "",
  filterValue = "",
  extraParams,
  initialCode = "",
  initialName = "",
}: {
  sqlId: string;
  fetchFn?: (params?: any) => Promise<any>;
  onApply: (row: any) => void;
  onClose: () => void;
  /** 결과 필터 컬럼 — 비우면 필터 미적용 */
  filterCol?: string;
  /** 결과 필터 값 — filterCol 과 함께 사용 */
  filterValue?: string;
  /** 동적 SQL 파라미터 — sqlParam1/sqlParam2/sqlParam3/keyParam 형태로 API에 포함 */
  extraParams?: Record<string, string>;
  /** popup 진입 시 미리 채울 코드 검색어 (Enter fallback 시 사용) */
  initialCode?: string;
  /** popup 진입 시 미리 채울 코드명 검색어 */
  initialName?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(initialName);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    handleSearch({
      ...(initialCode ? { code: initialCode } : {}),
      ...(initialName ? { name: initialName } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (extra: Record<string, any> = {}) => {
    // sqlId가 있으면 기존 commonApi 사용 — 세션은 commonApi 내부에서 URL 쿼리로 자동 부착
    if (sqlId) {
      commonApi
        .getCodesAndNames({
          key: "dsOut",
          sqlProp: sqlId,
          ...extraParams,
          ...extra,
        })
        .then((res: any) => {
          let datas = res.data.data.dsOut;
          let filterDatas;
          if (filterCol !== "") {
            filterDatas = datas.filter((x) => x[filterCol] === filterValue);
          } else {
            filterDatas = datas;
          }

          setRows(filterDatas ?? []);
        })
        .catch(console.error);
      return;
    }

    // fetchFn이 있으면 주입된 API 사용
    if (fetchFn) {
      fetchFn(extra)
        .then((res: any) => {
          // 응답 데이터를 { CODE, NAME } 형식으로 변환
          const result =
            res.data.result ?? res.data.rows ?? res.data.data ?? [];
          setRows(result);
        })
        .catch(console.error);
      return;
    }
  };

  const onSearch = () => {
    handleSearch({
      ...(code && { code }),
      ...(name && { name }),
    });
  };

  // Enter 키로 조회 버튼과 동일 동작
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full overflow-hidden">
      {/* ================= Search Area ================= */}
      <div className="shrink-0 grid grid-cols-[60px_1fr_60px_1fr_auto] gap-2 items-center">
        <span className="text-sm font-medium">코드</span>
        <Input
          value={code}
          placeholder="CODE"
          onChange={(e: any) => setCode(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />

        <span className="text-sm font-medium">코드명</span>
        <Input
          value={name}
          placeholder="NAME"
          onChange={(e: any) => setName(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={(e: any) => onSearch()}
          className="btn-primary btn-primary:hover"
        >
          <Search className="w-4 h-4 mr-1" />
          조회
        </Button>
      </div>

      {/* ================= Grid ================= */}
      <div style={{ height: "400px" }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={[
            {
              headerName: "No",
              width: 60,
            },
            {
              headerName: "LBL_CODE",
              field: "CODE",
              width: 120,
              cellStyle: { textAlign: "center" },
            },
            {
              headerName: "LBL_CODE_NM",
              field: "NAME",
              flex: 1,
              minWidth: 300,
              disableMaxWidth: true,
            },
          ]}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
          onRowDoubleClicked={(row: any) => onApply(row)}
          disableAutoSize={true}
        />
      </div>

      {/* 버튼 영역 */}
      <div className="shrink-0 flex justify-end gap-2 pt-3 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onApply(selectedRow)}
        >
          적용
        </Button>
        <Button size="sm" variant="outline" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}
