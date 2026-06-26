"use client";

// 용차 톤급변경 팝업 (센차 tmptongrpchg/TempTonGroupChangePop).
//  톤그룹(master) 클릭 → 그룹별 톤급(sub) 조회 → 톤급 선택 → onConfirm({ VEH_TP_CD, VEH_TP_NM }).

import { useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { Button } from "@/app/components/ui/button";
import { dispatchPlanVehApi as api } from "../DispatchPlanVehApi";

type Props = {
  onConfirm: (data: { VEH_TP_CD: string; VEH_TP_NM: string }) => void;
  onClose: () => void;
};

const GRP_COLS = [
  { headerName: "No", width: 50 },
  {
    type: "text",
    headerName: "LBL_VEH_TP_GRP",
    field: "VEH_TP_GRP",
    align: "left",
    flex: 1,
  },
  {
    type: "text",
    headerName: "LBL_VEH_TP_GRP_NM",
    field: "VEH_TP_GRP_NM",
    align: "left",
    flex: 1,
  },
];
const TYPE_COLS = [
  {
    type: "text",
    headerName: "VEH_TP_CD",
    noLang: true,
    field: "VEH_TP_CD",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_NM",
    align: "left",
    flex: 1,
  },
];

const rowsOf = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function TonGroupChangePop({ onConfirm, onClose }: Props) {
  const [groups, setGroups] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);

  useEffect(() => {
    api.searchTempTonGroupToChange({}).then((res) => setGroups(rowsOf(res)));
  }, []);

  const onGroupClick = (row: any) => {
    setTypes([]);
    setSel(null);
    if (!row?.VEH_TP_GRP) return;
    api
      .searchVehicleTypeToChange({ VEH_TP_GRP: row.VEH_TP_GRP })
      .then((res) => setTypes(rowsOf(res)));
  };

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "56vh" }}>
      <div className="flex-1 min-h-0 flex gap-2">
        <div className="w-[42%] min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            audit={false}
            columnDefs={GRP_COLS}
            rowData={groups}
            rowSelection="single"
            onRowClicked={onGroupClick}
          />
        </div>
        <div className="flex-1 min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            audit={false}
            columnDefs={TYPE_COLS}
            rowData={types}
            rowSelection="single"
            onRowClicked={(row: any) => setSel(row)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs"
        >
          취소
        </Button>
        <Button
          size="sm"
          disabled={!sel}
          onClick={() =>
            onConfirm({ VEH_TP_CD: sel.VEH_TP_CD, VEH_TP_NM: sel.VEH_TP_NM })
          }
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30"
        >
          적용
        </Button>
      </div>
    </div>
  );
}
