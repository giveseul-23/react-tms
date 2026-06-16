"use client";

// 톤급변경 팝업 (서버 vc.view.mdl.tms.pln.dspchplnveh.pop.tmptongrpchg.TempTonGroupChangePop)
// 상단: 차량 톤그룹(VEH_TP_GRP) 검색 → 클릭 시 하단: 톤급(VEH_TP_CD/VEH_TP_NM) 조회.
// 하단 행 선택 → 적용 시 부모 그리드 행에 VEH_TP_CD / VEH_TP_NM write-back.

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { dspchContainer2Api as api } from "../DspchContainer2Api";

type Props = {
  onConfirm: (picked: { VEH_TP_CD: string; VEH_TP_NM: string }) => void;
  onClose: () => void;
};

const MAIN_COLS = [
  { type: "text", headerName: "LBL_VEH_TP_GRP", field: "VEH_TP_GRP", width: 150 },
];
const SUB_COLS = [
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD", align: "center", hide: true },
  { type: "text", headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_NM", width: 190 },
];

function extractRows(res: any): any[] {
  return res?.data?.data?.dsOut ?? res?.data?.dsOut ?? res?.rows ?? [];
}

export function TempTonGroupChangePop({ onConfirm, onClose }: Props) {
  const [groupRows, setGroupRows] = useState<any[]>([]);
  const [typeRows, setTypeRows] = useState<any[]>([]);
  const selectedType = useRef<any>(null);

  useEffect(() => {
    void api.searchTempTonGroupToChange({}).then((res) => {
      const rows = extractRows(res);
      setGroupRows(rows);
      if (rows[0]?.VEH_TP_GRP) void loadTypes(rows[0].VEH_TP_GRP);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTypes = useCallback((vehTpGrp: string) => {
    setTypeRows([]);
    selectedType.current = null;
    return api
      .searchVehicleTypeToChange({ VEH_TP_GRP: vehTpGrp })
      .then((res) => setTypeRows(extractRows(res)));
  }, []);

  const onGroupClick = useCallback(
    (row: any) => {
      if (row?.VEH_TP_GRP) void loadTypes(row.VEH_TP_GRP);
    },
    [loadTypes],
  );

  const onApply = useCallback(() => {
    const r = selectedType.current;
    if (!r) return;
    onConfirm({ VEH_TP_CD: r.VEH_TP_CD, VEH_TP_NM: r.VEH_TP_NM });
  }, [onConfirm]);

  return (
    <div className="flex flex-col gap-3 w-full" style={{ height: 380 }}>
      <div className="flex flex-1 gap-3 min-h-0">
        <div className="w-[42%] min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={MAIN_COLS}
            rowData={groupRows}
            rowSelection="single"
            onRowClicked={onGroupClick}
            disableAutoSize
          />
        </div>
        <div className="flex-1 min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={SUB_COLS}
            rowData={typeRows}
            rowSelection="single"
            onRowSelected={(row: any) => {
              selectedType.current = row;
            }}
            onRowDoubleClicked={onApply}
            disableAutoSize
          />
        </div>
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
          onClick={onApply}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
