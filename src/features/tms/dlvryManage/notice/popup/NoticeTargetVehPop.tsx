"use client";

// 차량선택 팝업 (서버 pop/NoticeTargetVehPop 대응)
// 조회조건(물류운영그룹/협력사/차량번호/기사) + 3탭(전체차량 / 고정·자차 / 외부용차) 다중선택.
// 선택 차량들을 부모(공지대상차량 sub01)로 반환.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { GridTabs } from "@/app/components/grid/DataGrid/GridTabs";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import { noticeApi } from "../NoticeApi";

export type NoticeTargetVehResult = {
  VEH_ID: string;
  VEH_NO: string;
  CARR_CD: string;
  CARR_NM: string;
  DRVR_ID: string;
  DRVR_NM: string;
  VEH_OP_TP: string;
};

type Props = {
  lgstGrpCd: string;
  onApply: (rows: NoticeTargetVehResult[]) => void;
  onClose: () => void;
};

// 탭 → 조회 API (전체 / 고정·자차 / 외부용차)
const VEH_TABS = [
  { key: "all", label: "LBL_TOTAL", fetch: noticeApi.getTargetAllDriver },
  { key: "dedi", label: "LBL_DEDI_AND_DED_CON", fetch: noticeApi.getTargetDediDriver },
  { key: "con", label: "LBL_CON", fetch: noticeApi.getTargetConDriver },
] as const;

type TabKey = (typeof VEH_TABS)[number]["key"];

const VEH_COLUMN_DEFS = [
  { headerName: "No" },
  { field: "VEH_TP_CD", hide: true },
  { field: "DRVR_ID", hide: true },
  { field: "ASST_ID", hide: true },
  { field: "LGST_GRP_CD", hide: true },
  { field: "DIV_CD", hide: true },
  { type: "text", field: "CARR_CD", headerName: "LBL_CARRIER_CODE", align: "center", width: 90 },
  { type: "text", field: "CARR_NM", headerName: "LBL_CARRIER_NAME", align: "left", width: 100 },
  { type: "text", field: "VEH_ID", headerName: "LBL_VEHICLE_CODE", align: "center", width: 120 },
  { type: "text", field: "VEH_TP_CD", headerName: "LBL_VEHICLE_TYPE_CODE", align: "center", width: 90 },
  { type: "text", field: "VEH_TP_NM", headerName: "LBL_VEHICLE_TYPE_NAME", align: "left", width: 90 },
  { type: "text", field: "VEH_NO", headerName: "LBL_VEHICLE_NUMBER", align: "center", width: 120 },
  { type: "text", field: "DRVR_NM", headerName: "LBL_DRIVER_NAME", align: "left", width: 100 },
  {
    type: "combo",
    field: "VEH_OP_TP",
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    codeKey: "vehOpTp",
    align: "center",
    width: 90,
  },
];

function toPayload(row: any): NoticeTargetVehResult {
  return {
    VEH_ID: String(row?.VEH_ID ?? ""),
    VEH_NO: String(row?.VEH_NO ?? ""),
    CARR_CD: String(row?.CARR_CD ?? ""),
    CARR_NM: String(row?.CARR_NM ?? ""),
    DRVR_ID: String(row?.DRVR_ID ?? ""),
    DRVR_NM: String(row?.DRVR_NM ?? ""),
    VEH_OP_TP: String(row?.VEH_OP_TP ?? ""),
  };
}

export function NoticeTargetVehPop({ lgstGrpCd, onApply, onClose }: Props) {
  const showError = useErrorAlert();
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehNo, setVehNo] = useState("");
  const [drvrNm, setDrvrNm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [rowsByTab, setRowsByTab] = useState<Record<TabKey, any[]>>({
    all: [],
    dedi: [],
    con: [],
  });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const { codeMap } = useCommonStores({
    vehOpTp: { module: "TMS", sqlProp: "CODE", keyParam: "VEH_OP_TP" },
  });

  const buildParams = useCallback(
    () => ({ LGST_GRP_CD: lgstGrpCd, CARR_CD: carrCd, CARR_NM: carrNm, VEH_NO: vehNo, DRVR_NM: drvrNm }),
    [carrCd, carrNm, drvrNm, lgstGrpCd, vehNo],
  );

  const search = useCallback(async () => {
    try {
      const params = buildParams();
      const results = await Promise.all(
        VEH_TABS.map(async (tab) => {
          const res: any = await tab.fetch(params);
          if (res?.data?.success === false) {
            throw new Error(res.data?.msg ?? Lang.get("TTL_ERR"));
          }
          return { key: tab.key, rows: res?.data?.data?.dsOut ?? [] };
        }),
      );
      setRowsByTab(
        Object.fromEntries(results.map((r) => [r.key, r.rows])) as Record<TabKey, any[]>,
      );
      setSelectedRows([]);
    } catch (err: any) {
      showError(err?.response?.data?.error?.message ?? err?.message ?? Lang.get("TTL_ERR"));
    }
  }, [buildParams, showError]);

  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as TabKey);
    setSelectedRows([]);
  }, []);

  const handleApply = useCallback(() => {
    if (selectedRows.length === 0) {
      showError(Lang.get("MSG_EXCEPTION_VEHICLE_REPLACE"));
      return;
    }
    onApply(selectedRows.map(toPayload));
  }, [onApply, selectedRows, showError]);

  const activeRows = rowsByTab[activeTab];

  const searchFields = useMemo(
    () => [
      { label: Lang.get("LBL_LOGISTICS_GROUP_CODE"), value: lgstGrpCd, disable: true, onChange: () => {} },
      { label: Lang.get("LBL_CARRIER_CODE"), value: carrCd, onChange: setCarrCd },
      { label: Lang.get("LBL_CARRIER_NAME"), value: carrNm, onChange: setCarrNm },
      { label: Lang.get("LBL_VEHICLE_NUMBER"), value: vehNo, onChange: setVehNo },
      { label: Lang.get("LBL_DRVR_NM"), value: drvrNm, onChange: setDrvrNm },
    ],
    [carrCd, carrNm, drvrNm, lgstGrpCd, vehNo],
  );

  return (
    <div className="flex flex-col gap-3 w-full min-h-0" style={{ height: 560 }}>
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
            onClick={() => void search()}
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
                onKeyDown={(e) => e.key === "Enter" && void search()}
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
            tabs={VEH_TABS.map((t) => ({ key: t.key, label: Lang.get(t.label) }))}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>
        <div className="flex-1 min-h-0">
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={VEH_COLUMN_DEFS}
            rowData={activeRows}
            codeMap={codeMap}
            rowSelection="multiple"
            gridOptions={{
              onSelectionChanged: (e: any) => setSelectedRows(e.api.getSelectedRows()),
            }}
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
          disabled={selectedRows.length === 0}
          onClick={handleApply}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
