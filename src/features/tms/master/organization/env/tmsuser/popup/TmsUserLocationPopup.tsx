"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";
import { commonApi } from "@/app/services/common/commonApi";

type Props = {
  keyParam: string;
  onConfirm: (rows: any[]) => void;
  onClose: () => void;
};

const DEFAULT_PAGE_SIZE = 100;

export default function TmsUserLocationPopup({
  keyParam,
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const search = useCallback(() => {
    void commonApi
      .getCodesAndNames({
        key: "dsOut",
        sqlProp: "selectLocationCodeName",
        keyParam,
        ...(code ? { code } : {}),
        ...(name ? { name } : {}),
      })
      .then((res: any) => {
        setRows(res?.data?.data?.dsOut ?? []);
        setSelectedRows([]);
        setCurrentPage(1);
      });
  }, [code, keyParam, name]);

  useEffect(() => {
    void commonApi
      .getCodesAndNames({
        key: "dsOut",
        sqlProp: "selectLocationCodeName",
        keyParam,
      })
      .then((res: any) => setRows(res?.data?.data?.dsOut ?? []));
  }, [keyParam]);

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [currentPage, pageSize, rows]);

  const fields: GridSearchField[] = [
    { label: "LBL_USR_LOC_CD", value: code, onChange: setCode },
    { label: "LBL_LOC_NM", value: name, onChange: setName },
  ];

  const columnDefs = [
    { headerName: "No", width: 60 },
    { type: "text", headerName: "LBL_USR_LOC_CD", field: "CODE", width: 160 },
    { type: "text", headerName: "LBL_LOC_NM", field: "NAME", width: 260 },
    { field: "LOC_ID", hide: true },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <PopupSearchCondition fields={fields} onSearch={search} />

      {selectedRows.length > 0 ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700 min-w-0">
          <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span className="truncate min-w-0">
            {selectedRows
              .map((row) => `${row.CODE} | ${row.NAME}`)
              .join(", ")}
          </span>
          <span className="ml-auto flex-shrink-0 text-[10px] text-blue-400 font-medium">
            {selectedRows.length}건 선택됨
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span>그리드에서 사용자 착지를 선택하세요</span>
        </div>
      )}

      <div className="shrink-0" style={{ height: 440 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={columnDefs}
          rowData={pageRows}
          rowSelection="multiple"
          totalCount={rows.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          gridOptions={{
            onSelectionChanged: (event: any) =>
              setSelectedRows(event.api.getSelectedRows()),
          }}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          취소
        </Button>
        <Button
          size="sm"
          disabled={selectedRows.length === 0}
          onClick={() => onConfirm(selectedRows)}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
