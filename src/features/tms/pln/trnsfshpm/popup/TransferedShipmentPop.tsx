"use client";

import { useCallback, useEffect, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { transferedShipmentMgmtApi as api } from "../TransferedShipmentMgmtApi";
import { POP_COLUMN_DEFS } from "../TransferedShipmentMgmtColumns";

type Props = {
  shpmId: string;
};

const parseRows = (res: any) =>
  res?.data?.result ??
  res?.data?.data?.dsOut ??
  res?.data?.data ??
  [];

export default function TransferedShipmentPop({ shpmId }: Props) {
  const [rows, setRows] = useState<any[]>([]);

  const fetchPop = useCallback(async () => {
    if (!shpmId) {
      setRows([]);
      return;
    }
    const res = await api.searchTrnfShpmPop({ SHPM_ID: shpmId });
    setRows(parseRows(res));
  }, [shpmId]);

  useEffect(() => {
    void fetchPop();
  }, [fetchPop]);

  return (
    <div className="flex h-[480px] flex-col gap-2">
      <DataGrid
        layoutType="plain"
        columnDefs={POP_COLUMN_DEFS}
        rowData={rows}
        audit={false}
        pagination={false}
      />
    </div>
  );
}
