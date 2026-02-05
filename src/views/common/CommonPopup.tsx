"use client";

import { useState, useMemo } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import DataGrid from "@/app/components/grid/DataGrid";

/* =======================
 * Mock Data
 * ======================= */
const mockRows = [
  { CODE: "GD3011", NAME: "PC 군포센터" },
  { CODE: "SD1001", NAME: "시화센터" },
  { CODE: "SD1002", NAME: "성남센터" },
  { CODE: "SS1000", NAME: "성남/서울합송" },
  { CODE: "ST1003", NAME: "대구센터" },
  { CODE: "ST1004", NAME: "호남센터" },
  { CODE: "ST1005", NAME: "충주센터" },
  { CODE: "ST1006", NAME: "청주센터" },
  { CODE: "ST1007", NAME: "서천센터" },
  { CODE: "ST1008", NAME: "세종센터" },
];

/* =======================
 * Component
 * ======================= */
export function CommonPopup({
  onApply,
  onClose,
}: {
  onApply: (row: any) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);

  /* ======================= filtering ======================= */
  const filteredRows = useMemo(() => {
    return mockRows.filter((row) => {
      const codeMatch = !code || row.CODE.includes(code);

      const nameMatch = !name || row.NAME.includes(name);

      return codeMatch && nameMatch;
    });
  }, [code, name]);

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* ================= Search Area ================= */}
      <div className="shrink-0 grid grid-cols-[60px_1fr_60px_1fr_auto] gap-2 items-center">
        <span className="text-sm font-medium">코드</span>
        <Input
          value={code}
          placeholder="CODE"
          onChange={(e) => setCode(e.target.value)}
        />

        <span className="text-sm font-medium">코드명</span>
        <Input
          value={name}
          placeholder="NAME"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* ================= Grid ================= */}
      <div className="flex-1 min-h-[300px]">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={[
            {
              headerName: "No",
              width: 60,
              valueGetter: (p: any) => p.node.rowIndex + 1,
            },
            {
              headerName: "코드",
              field: "CODE",
              width: 120,
            },
            {
              headerName: "코드명",
              field: "NAME",
              flex: 1,
            },
          ]}
          rowData={filteredRows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
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
