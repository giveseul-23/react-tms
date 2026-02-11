"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { commonApi } from "@/app/services/common/commonApi";
import DataGrid from "@/app/components/grid/DataGrid";

const userId = sessionStorage.getItem("userId");
const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");

/* =======================
 * Component
 * ======================= */
export function CommonPopup({
  sqlId,
  onApply,
  onClose,
}: {
  sqlId: string;
  onApply: (row: any) => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    commonApi
      .getCodesAndNames({
        sesUserId: userId,
        userId, // 필요한 값만 payload로
        sqlProp: sqlId,
        ACCESS_TOKEN,
      })
      .then((res: any) => {
        setRows(res.data.result ?? []);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  const onSearch = () => {
    const payload = {
      sesUserId: userId,
      userId,
      sqlProp: sqlId,
      ACCESS_TOKEN,
      ...(code && { code }),
      ...(name && { name }),
    };

    commonApi
      .getCodesAndNames(payload)
      .then((res: any) => {
        setRows(res.data.result ?? []);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* ================= Search Area ================= */}
      <div className="shrink-0 grid grid-cols-[60px_1fr_60px_1fr_auto] gap-2 items-center">
        <span className="text-sm font-medium">코드</span>
        <Input
          value={code}
          placeholder="CODE"
          onChange={(e: any) => setCode(e.target.value)}
        />

        <span className="text-sm font-medium">코드명</span>
        <Input
          value={name}
          placeholder="NAME"
          onChange={(e: any) => setName(e.target.value)}
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
      <div className="flex-1 min-h-[300px]">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={[
            {
              headerName: "No",
              width: 60,
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
              minWidth: 300,
              disableMaxWidth: true,
            },
          ]}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
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
