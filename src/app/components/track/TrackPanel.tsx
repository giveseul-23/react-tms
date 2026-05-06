// 공통 추적 패널.
// 호출자(Tender 등)는 trackType + dspchNos만 props로 넘기면 됨.
// 패널 내부에서 trackApi 호출 → DataGrid 렌더까지 자체 처리.

import { useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { trackApi } from "./trackApi";
import {
  TRACK_COLUMN_DEFS_MAP,
  TRACK_TITLE_MAP,
  TrackType,
} from "./trackColumns";

type TrackPanelProps = {
  open: boolean;
  onClose: () => void;
  trackType: TrackType | null;
  dspchNos: string[];
};

export function TrackPanel({
  open,
  onClose,
  trackType,
  dspchNos,
}: TrackPanelProps) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!open || !trackType || dspchNos.length === 0) {
      setRows([]);
      return;
    }
    trackApi
      .getTrackList({ trackType, DSPCH_NO_LIST: dspchNos })
      .then((res: any) => setRows(res.data?.result ?? []))
      .catch((err) => {
        console.error("[TrackPanel] fetch failed", err);
        setRows([]);
      });
  }, [open, trackType, dspchNos]);

  return (
    <DataGrid
      layoutType="plain"
      actions={[
        {
          type: "button",
          key: "LBL_CLOSE",
          label: "LBL_CLOSE",
          onClick: onClose,
        },
      ]}
      columnDefs={trackType ? TRACK_COLUMN_DEFS_MAP[trackType]() : []}
      rowData={rows}
      subTitle={trackType ? `${TRACK_TITLE_MAP[trackType]} 추적` : "추적"}
    />
  );
}
