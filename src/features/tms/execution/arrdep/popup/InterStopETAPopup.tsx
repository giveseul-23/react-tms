"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { Lang } from "@/app/services/common/Lang";
import { departArrivalManagementApi as api } from "../DepartArrivalManagementApi";

type Props = {
  dspchNo: string;
  onClose: () => void;
};

const getRows = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

const overtimeStyle = (params: any) => {
  const isOver = params?.data?.CHECK_OVERTIME === "OVER";
  return {
    backgroundColor: isOver ? "#fee2e2" : "#dcfce7",
    color: isOver ? "#dc2626" : "#16a34a",
    fontWeight: 700,
  };
};

const COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_INTER_STOP_NM",
    field: "LOC_NM",
    flex: 1,
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_APPOINTMENT_TIME_WINDOW",
    field: "REQ_DLVRY_ETIME",
    flex: 1,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_ETA_DTTM",
    field: "EXP_DLVRY_ETIME",
    flex: 1,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_DIFF",
    field: "DIFF_MIN",
    flex: 1,
    align: "right",
    cellStyle: overtimeStyle,
    valueFormatter: (params: any) =>
      params.value == null || params.value === ""
        ? ""
        : `${params.value}${Lang.get("LBL_MINUTE")}`,
  },
  {
    type: "text",
    headerName: "LBL_DIV",
    field: "DIFF_MENT",
    flex: 1,
    align: "center",
    cellStyle: overtimeStyle,
  },
];

export default function InterStopETAPopup({ dspchNo, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);

  const gridData = useMemo(
    () => ({ rows, totalCount: rows.length, page: 1, limit: rows.length || 10 }),
    [rows],
  );

  const search = useCallback(async () => {
    const res = await api.getInterStopEta({ DSPCH_NO: dspchNo });
    setRows(getRows(res));
  }, [dspchNo]);

  useEffect(() => {
    void search();
  }, [search]);

  return (
    <div className="flex h-[180px] min-h-0 flex-col gap-2">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => void search()}
          className="h-8 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {Lang.get("BTN_REPRO")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-8 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {Lang.get("BTN_CANCEL")}
        </button>
      </div>
      <DataGrid
        layoutType="plain"
        rowData={gridData.rows}
        totalCount={gridData.totalCount}
        currentPage={1}
        pageSize={gridData.limit}
        columnDefs={COLUMN_DEFS}
        actions={[]}
        pagination={false}
        audit={false}
      />
    </div>
  );
}
