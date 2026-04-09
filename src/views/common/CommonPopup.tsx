"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { commonApi } from "@/app/services/common/commonApi";
import DataGrid from "@/app/components/grid/DataGrid";
import { getSessionFields } from "@/app/services/auth/auth";

/* =======================
 * Component
 * ======================= */
export function CommonPopup({
  sqlId,
  fetchFn,
  onApply,
  onClose,
}: {
  sqlId: string;
  fetchFn?: (params?: any) => Promise<any>;
  onApply: (row: any) => void;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = (extra: Record<string, any> = {}) => {
    const { userId, ACCESS_TOKEN } = getSessionFields();
    // sqlId가 있으면 기존 commonApi 사용
    if (sqlId) {
      commonApi
        .getCodesAndNames({
          sesUserId: userId,
          userId,
          sqlProp: sqlId,
          ACCESS_TOKEN,
          ...extra,
        })
        .then((res: any) => setRows(res.data.data.dsOut ?? []))
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

  return (
    <div className="flex flex-col gap-3 w-full h-full overflow-hidden">
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
