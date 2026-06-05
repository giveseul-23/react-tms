"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { GridTabs } from "@/app/components/grid/DataGrid/GridTabs";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import { itineraryApi } from "../ItineraryApi";

export type ItineraryVehPopResult = {
  CARR_CD: string;
  CARR_NM: string;
  VEH_ID: string;
  VEH_NO: string;
  DRVR_ID: string;
  DRVR_NM: string;
};

type ItineraryVehPopProps = {
  lgstGrpCd: string;
  onApply: (row: ItineraryVehPopResult) => void;
  onClose: () => void;
};

const VEH_POP_TABS = [
  { key: "100", label: "BTN_CHANGE_REG_DED_VEH" },
  { key: "110", label: "LBL_DC_DSPCH_QTY" },
  { key: "999", label: "LBL_VIRTUAL_VEH" },
] as const;

type VehOpTabKey = (typeof VEH_POP_TABS)[number]["key"];

const VEH_POP_COLUMN_DEFS = [
  { headerName: "No" },
  { field: "AP_PROC_TP", hide: true },
  { field: "VEH_TP_CD", hide: true },
  { field: "DRVR_ID", hide: true },
  { field: "ASST_ID", hide: true },
  { field: "LGST_GRP_CD", hide: true },
  { field: "DIV_CD", hide: true },
  { field: "CARR_CD", headerName: "LBL_CARRIER_CODE" },
  { field: "CARR_NM", headerName: "LBL_CARRIER_NAME" },
  { field: "VEH_ID", headerName: "LBL_VEHICLE_CODE" },
  { field: "VEH_NO", headerName: "LBL_VEH_NO" },
  { field: "VEH_TP_NM", headerName: "LBL_VEHICLE_TYPE_NAME" },
  { field: "DRVR_NM", headerName: "LBL_DRIVER_NAME" },
  {
    field: "VEH_OP_TP",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    codeKey: "vehOpTp",
  },
  { field: "ASST_NM", headerName: "LBL_HELPER_NAME" },
];

function toApplyPayload(row: any): ItineraryVehPopResult {
  return {
    CARR_CD: String(row?.CARR_CD ?? ""),
    CARR_NM: String(row?.CARR_NM ?? ""),
    VEH_ID: String(row?.VEH_ID ?? ""),
    VEH_NO: String(row?.VEH_NO ?? ""),
    DRVR_ID: String(row?.DRVR_ID ?? ""),
    DRVR_NM: String(row?.DRVR_NM ?? ""),
  };
}

export function ItineraryVehPop({
  lgstGrpCd,
  onApply,
  onClose,
}: ItineraryVehPopProps) {
  const showError = useErrorAlert();
  const [carrNm, setCarrNm] = useState("");
  const [vehId, setVehId] = useState("");
  const [vehNo, setVehNo] = useState("");
  const [vehTpCd, setVehTpCd] = useState("");
  const [drvrNm, setDrvrNm] = useState("");
  const [activeTab, setActiveTab] = useState<VehOpTabKey>("100");
  const [rowsByTab, setRowsByTab] = useState<Record<VehOpTabKey, any[]>>({
    "100": [],
    "110": [],
    "999": [],
  });
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const { codeMap } = useCommonStores({
    vehOpTp: { module: "TMS", sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  const buildSearchParams = useCallback(
    (vehOpTp: string) => ({
      lgstGrpCd,
      carrNm,
      vehId,
      vehNo,
      vehTpCd,
      drvrNm,
      vehOpTp,
      page: 1,
      limit: 500,
    }),
    [carrNm, drvrNm, lgstGrpCd, vehId, vehNo, vehTpCd],
  );

  const fetchAllTabs = useCallback(async () => {
    if (!lgstGrpCd.trim()) {
      showError(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"));
      return;
    }

    try {
      const results = await Promise.all(
        VEH_POP_TABS.map(async (tab) => {
          const res: any = await itineraryApi.searchVehiclePop(
            buildSearchParams(tab.key),
          );
          if (res?.data?.success === false) {
            throw new Error(res.data?.msg ?? "조회에 실패했습니다.");
          }
          return {
            key: tab.key,
            rows: res?.data?.data?.dsOut ?? res?.data?.result ?? [],
          };
        }),
      );

      setRowsByTab(
        Object.fromEntries(results.map((r) => [r.key, r.rows])) as Record<
          VehOpTabKey,
          any[]
        >,
      );
      setSelectedRow(null);
    } catch (err: any) {
      showError(
        err?.response?.data?.error?.message ??
          err?.message ??
          "조회에 실패했습니다.",
      );
    }
  }, [buildSearchParams, lgstGrpCd, showError]);

  useEffect(() => {
    void fetchAllTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as VehOpTabKey);
    setSelectedRow(null);
  }, []);

  const handleApply = useCallback(() => {
    if (!selectedRow) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    onApply(toApplyPayload(selectedRow));
  }, [onApply, selectedRow, showError]);

  const activeRows = rowsByTab[activeTab];

  const searchFields = useMemo(
    () => [
      {
        label: Lang.get("LBL_LOGISTICS_GROUP_CODE"),
        value: lgstGrpCd,
        disable: true,
        onChange: () => {},
      },
      {
        label: Lang.get("LBL_CARRIER_NAME"),
        value: carrNm,
        onChange: setCarrNm,
      },
      {
        label: Lang.get("LBL_VEHICLE_CODE"),
        value: vehId,
        onChange: setVehId,
      },
      {
        label: Lang.get("LBL_VEH_NO"),
        value: vehNo,
        onChange: setVehNo,
      },
      {
        label: Lang.get("LBL_VEHICLE_TYPE_CODE"),
        value: vehTpCd,
        onChange: setVehTpCd,
      },
      {
        label: Lang.get("LBL_DRIVER_NAME"),
        value: drvrNm,
        onChange: setDrvrNm,
      },
    ],
    [carrNm, drvrNm, lgstGrpCd, vehId, vehNo, vehTpCd],
  );

  return (
    <div
      className="flex flex-col gap-3 w-full min-h-0"
      style={{ height: 560 }}
    >
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm shrink-0">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--grid-header-bg)]">
          <div className="flex items-center gap-1.5 leading-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-color/80 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-color tracking-widest uppercase leading-none">
              조회조건
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => void fetchAllTabs()}
            className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1"
            style={{ lineHeight: 1 }}
          >
            <Search className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">조회</span>
          </Button>
        </div>
        <div
          className="grid divide-x divide-y divide-slate-100"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {searchFields.map((f) => (
            <div
              key={f.label}
              className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group"
            >
              <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
                {f.label}
              </label>
              <input
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void fetchAllTabs()}
                disabled={f.disable}
                className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full disabled:cursor-not-allowed disabled:text-slate-400"
                placeholder={Lang.get("LBL_INPUT")}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 border border-gray-200 rounded-md bg-[rgb(var(--bg))]">
        <div className="shrink-0 px-3 border-b border-gray-100">
          <GridTabs
            tabs={[...VEH_POP_TABS]}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>
        <div className="flex-1 min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={VEH_POP_COLUMN_DEFS}
            rowData={activeRows}
            codeMap={codeMap}
            rowSelection="single"
            selectedRow={selectedRow}
            onSelectionChanged={setSelectedRow}
            onRowDoubleClicked={handleApply}
            pagination={false}
            audit={false}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_TMS_SELECT")}
        </Button>
      </div>
    </div>
  );
}
