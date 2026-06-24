"use client";

// 용차 운수사변경 팝업 (센차 tmpcarrchg/TempCarrierChangePop).
//  운수사명 검색 → 운수사(master) 클릭 → 운수사별 차량(sub) 조회 → 차량 선택
//  → onConfirm({ CARR_CD, VEH_ID }). 부모가 선택 행에 머지 후 saveChangeCarrier 호출.

import { useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { Button } from "@/app/components/ui/button";
import { Search } from "lucide-react";
import { dispatchPlanVehApi as api } from "../DispatchPlanVehApi";

type Props = {
  initialValues: { LGST_GRP_CD?: string };
  onConfirm: (data: { CARR_CD: string; VEH_ID: string }) => void;
  onClose: () => void;
};

const CARR_COLS = [
  { type: "text", headerName: "LBL_CARR_CD", field: "CARR_CD", align: "center", width: 130 },
  { type: "text", headerName: "LBL_CARR_NM", field: "CARR_NM", align: "left", flex: 1 },
];
const VEH_COLS = [
  { type: "text", headerName: "CARR_CD", noLang: true, field: "CARR_CD", hide: true },
  { type: "text", headerName: "VEH_ID", noLang: true, field: "VEH_ID", hide: true },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", align: "left", width: 130 },
  { type: "text", headerName: "LBL_PRMY_VEH_NO", field: "VEH_NO", align: "center", flex: 1 },
];

const rowsOf = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function CarrierChangePop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const lgstGrpCd = initialValues.LGST_GRP_CD ?? "";
  const [carrNm, setCarrNm] = useState("");
  const [carriers, setCarriers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);

  const searchCarriers = () => {
    setVehicles([]);
    setSel(null);
    api
      .searchTempCarrierToChange({ LGST_GRP_CD: lgstGrpCd, CARR_NM: carrNm })
      .then((res) => setCarriers(rowsOf(res)));
  };

  useEffect(searchCarriers, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onCarrClick = (row: any) => {
    setVehicles([]);
    setSel(null);
    if (!row?.CARR_CD) return;
    api
      .searchTempCarrierVehicleToChange({
        LGST_GRP_CD: lgstGrpCd,
        CARR_CD: row.CARR_CD,
      })
      .then((res) => setVehicles(rowsOf(res)));
  };

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "60vh" }}>
      {/* 검색 */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] text-slate-500">운수사명</span>
        <input
          value={carrNm}
          onChange={(e) => setCarrNm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCarriers()}
          className="h-7 px-2 text-[11px] border border-input rounded-md bg-input-background outline-none"
        />
        <Button size="sm" variant="outline" onClick={searchCarriers} className="h-7 px-3 text-xs gap-1">
          <Search className="w-3 h-3" /> 조회
        </Button>
      </div>
      <div className="flex-1 min-h-0 flex gap-2">
        <div className="w-[45%] min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            audit={false}
            columnDefs={CARR_COLS}
            rowData={carriers}
            rowSelection="single"
            onRowClicked={onCarrClick}
          />
        </div>
        <div className="flex-1 min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            audit={false}
            columnDefs={VEH_COLS}
            rowData={vehicles}
            rowSelection="single"
            onRowClicked={(row: any) => setSel(row)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button size="sm" variant="outline" onClick={onClose} className="h-7 px-4 text-xs">
          취소
        </Button>
        <Button
          size="sm"
          disabled={!sel}
          onClick={() => onConfirm({ CARR_CD: sel.CARR_CD, VEH_ID: sel.VEH_ID })}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30"
        >
          적용
        </Button>
      </div>
    </div>
  );
}
