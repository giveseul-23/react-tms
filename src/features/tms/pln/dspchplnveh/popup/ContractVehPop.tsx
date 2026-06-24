"use client";

// 계약차 신규배차 팝업 (센차 cntrveh/ContractVehPop).
//  운수사명/차량유형 검색 → 계약차량(VEH_OP_TP '110') 목록 조회 → 차량 선택
//  → onConfirm(선택행). 부모가 saveCreateEmptyDispatchCntrVeh 호출.

import { useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { Button } from "@/app/components/ui/button";
import { Search } from "lucide-react";
import { dispatchPlanVehApi as api } from "../DispatchPlanVehApi";

type Props = {
  initialValues: { LGST_GRP_CD?: string };
  onConfirm: (row: any) => void;
  onClose: () => void;
};

const COLS = [
  { headerName: "No", width: 50 },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", hide: true },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", align: "left", width: 160 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", align: "left", flex: 1 },
  { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "left", width: 120 },
];

const rowsOf = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function ContractVehPop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const lgstGrpCd = initialValues.LGST_GRP_CD ?? "";
  const [carrNm, setCarrNm] = useState("");
  const [vehTpNm, setVehTpNm] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);

  const search = () => {
    setSel(null);
    api
      .searchVehiclePop({
        lgstGrpCd,
        carrNm,
        vehTpNm,
        vehOpTp: "110",
      })
      .then((res) => setRows(rowsOf(res)));
  };

  useEffect(search, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "60vh" }}>
      <div className="flex items-center gap-2 px-1 flex-wrap">
        <span className="text-[11px] text-slate-500">운수사명</span>
        <input
          value={carrNm}
          onChange={(e) => setCarrNm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="h-7 px-2 text-[11px] border border-input rounded-md bg-input-background outline-none"
        />
        <span className="text-[11px] text-slate-500">차량유형</span>
        <input
          value={vehTpNm}
          onChange={(e) => setVehTpNm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="h-7 px-2 text-[11px] border border-input rounded-md bg-input-background outline-none"
        />
        <Button size="sm" variant="outline" onClick={search} className="h-7 px-3 text-xs gap-1">
          <Search className="w-3 h-3" /> 조회
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <DataGrid
          layoutType="plain"
          actions={[]}
          audit={false}
          columnDefs={COLS}
          rowData={rows}
          rowSelection="single"
          onRowClicked={(row: any) => setSel(row)}
          onRowDoubleClicked={(row: any) => onConfirm(row)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button size="sm" variant="outline" onClick={onClose} className="h-7 px-4 text-xs">
          취소
        </Button>
        <Button
          size="sm"
          disabled={!sel}
          onClick={() => onConfirm(sel)}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30"
        >
          적용
        </Button>
      </div>
    </div>
  );
}
