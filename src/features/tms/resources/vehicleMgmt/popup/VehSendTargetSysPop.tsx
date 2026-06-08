"use client";

// 차량 일괄전송 대상시스템 팝업 (센차 VehSendTargetSysPop)
// 선택 차량 목록 + 디비전 재고관리시스템 목록(다건 선택) + 신규/수정 전송구분.
// 확인 시 선택 시스템과 전송구분(I/U)을 부모에 전달 → 부모가 sendVehicleIF 호출.

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { vehicleMgmtApi as api } from "../vehicleMgmtApi";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  vehRows: any[];
  onConfirm: (payload: { invSystems: any[]; ifTcd: "I" | "U" }) => void;
  onClose: () => void;
};

const VEH_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO" },
  { type: "text", headerName: "LBL_CARRIER", field: "CARR_NM" },
];

const INV_COLUMN_DEFS = [
  { type: "text", headerName: "LBL_INV_SYS_ID", field: "INV_SYS_ID", align: "center" },
  { type: "text", headerName: "LBL_INV_SYS_NM", field: "INV_SYS_NM" },
  { type: "text", headerName: "LBL_PLANT_CD", field: "PLANT_CD", align: "center" },
  { type: "text", headerName: "LBL_PLANT_NM", field: "PLANT_NM" },
];

export default function VehSendTargetSysPop({ vehRows, onConfirm, onClose }: Props) {
  const [invRows, setInvRows] = useState<any[]>([]);
  const [selectedInv, setSelectedInv] = useState<any[]>([]);
  const [ifTcd, setIfTcd] = useState<"I" | "U" | "">("");

  const first = vehRows?.[0] ?? {};
  const divLabel = `(${first.DIV_CD ?? ""}) ${first.DIV_NM ?? ""}`;

  useEffect(() => {
    api
      .searchDivInvSys({ DIV_CD: first.DIV_CD })
      .then((res: any) => {
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setInvRows(data);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = !!ifTcd && selectedInv.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 헤더 — 디비전 + 전송구분 */}
      <div className="flex items-center gap-6 text-[12px] px-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{Lang.get("LBL_DIV")}</span>
          <span className="text-muted-foreground">{divLabel}</span>
        </div>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="if_tcd"
            checked={ifTcd === "I"}
            onChange={() => setIfTcd("I")}
          />
          {Lang.get("LBL_NEW_SEND")}
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name="if_tcd"
            checked={ifTcd === "U"}
            onChange={() => setIfTcd("U")}
          />
          {`${Lang.get("LBL_UPDATE")}/${Lang.get("BTN_RESEND")}`}
        </label>
      </div>

      {/* 차량 / 시스템 그리드 */}
      <div className="flex gap-3" style={{ height: 380 }}>
        <div className="w-[45%]">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={VEH_COLUMN_DEFS}
            rowData={vehRows}
          />
        </div>
        <div className="flex-1">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={INV_COLUMN_DEFS}
            rowData={invRows}
            rowSelection="multiple"
            gridOptions={{
              onSelectionChanged: (e: any) =>
                setSelectedInv(e.api.getSelectedRows()),
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={!canSend}
          onClick={() => onConfirm({ invSystems: selectedInv, ifTcd: ifTcd as "I" | "U" })}
          className="btn-primary btn-primary:hover"
        >
          <Send className="w-3 h-3" />
          {Lang.get("BTN_SEND")}
        </Button>
      </div>
    </div>
  );
}
