"use client";

// 구간상세 팝업 (서버 pop/ItmQtySettlMgmtLaneDetail)
// sub02 셀 더블클릭 시 해당 행(AP_ID/CHG_CD/LANE_ID)의 구간 금액 명세를 읽기전용 그리드로 표시.

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { itmQtySettlMgmtApi as api } from "../ItmQtySettlMgmtApi";

type Props = {
  apId: string;
  chgCd: string;
  laneId: string;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { type: "text", headerName: "LBL_RATE_ID", field: "RATE_ID", align: "center", width: 60 },
  { type: "numeric", headerName: "LBL_SEQ_IN_LANE", field: "RNG_SEQ", align: "center", width: 70 },
  { type: "numeric", headerName: "LBL_LANE_RANGE", field: "RNG_TO_VAL", width: 70 },
  { type: "numeric", headerName: "LBL_RATE", field: "RATE", width: 70 },
  { type: "text", headerName: "LBL_LANE_CALC_TYPE", field: "RNG_CALC_TCD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_RNG_CD", field: "RNG_CD", align: "center", width: 70 },
];

export function LaneDetailPop({ apId, chgCd, laneId, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const showError = useErrorAlert();

  useEffect(() => {
    api
      .getLaneDetailList({ AP_ID: apId, CHG_CD: chgCd, LANE_ID: laneId })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        setRows(res.data?.data?.dsOut ?? []);
      })
      .catch((err: any) => showError(err?.message ?? Lang.get("TTL_ERR")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div style={{ height: 300 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          disableAutoSize
        />
      </div>
      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
      </div>
    </div>
  );
}
