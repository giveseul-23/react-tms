"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import type { GridSearchField } from "@/app/components/popup/GridSearchPopupLayout";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { PopupSearchCondition } from "@/app/components/popup/PopupSearchCondition";
import { newRid } from "@/app/feature/useBaseModel";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { zoneApi } from "../ZoneApi";

export type ZoneAddStopPopProps = {
  expZnCd: string;
  divCd: string;
  lgstGrpCd: string;
  notLocLst: string[];
  onApply: (rows: Record<string, any>[]) => void;
  onClose: () => void;
};

const LOC_POP_COLUMN_DEFS = [
  { headerName: "No", width: 40 },
  { field: "LOC_ID", hide: true },
  { field: "CODE", headerName: "LBL_CODE", width: 90 },
  { field: "NAME", headerName: "LBL_CODE_NM", flex: 1 },
  { field: "DTL_ADDR1", headerName: "LBL_ADDR", flex: 1 },
  { field: "ZIP_CD", headerName: "LBL_ZIP_CODE", width: 90 },
  { field: "CUST_CD", headerName: "LBL_CUSTOMER_CODE", width: 100 },
  { field: "CUST_NM", headerName: "LBL_CUSTOMER_NAME", flex: 1 },
];

const SELECTED_LOC_COLUMN_DEFS = [
  { headerName: "No", width: 40 },
  { field: "LOC_ID", hide: true },
  { field: "ADDR_ID", hide: true },
  { field: "CTY_NM", hide: true },
  { field: "STT_NM", hide: true },
  { field: "CTRY_NM", hide: true },
  {
    type: "text",
    field: "LOC_CD",
    headerName: "LBL_DESTINATION_CODE",
    width: 110,
  },
  {
    type: "text",
    field: "LOC_NM",
    headerName: "LBL_DESTINATION_NAME",
    flex: 1,
  },
  {
    type: "text",
    field: "DTL_ADDR1",
    headerName: "LBL_ADDR",
    flex: 1,
  },
];

function mapLocPopToSelected(row: any) {
  return {
    LOC_ID: row.LOC_ID,
    LOC_CD: row.CODE ?? row.LOC_CD,
    LOC_NM: row.NAME ?? row.LOC_NM,
    DTL_ADDR1: row.DTL_ADDR1,
    ADDR_ID: row.ADDR_ID,
    ZIP_CD: row.ZIP_CD,
    CUST_CD: row.CUST_CD,
    CUST_NM: row.CUST_NM,
    CTY_NM: row.CTY_NM,
    STT_NM: row.STT_NM,
    CTRY_NM: row.CTRY_NM,
    __rid__: newRid(),
  };
}

function mapSelectedToLocPop(row: any) {
  return {
    LOC_ID: row.LOC_ID,
    CODE: row.LOC_CD,
    NAME: row.LOC_NM,
    DTL_ADDR1: row.DTL_ADDR1,
    ADDR_ID: row.ADDR_ID,
    ZIP_CD: row.ZIP_CD,
    CUST_CD: row.CUST_CD,
    CUST_NM: row.CUST_NM,
    CTY_NM: row.CTY_NM,
    STT_NM: row.STT_NM,
    CTRY_NM: row.CTRY_NM,
  };
}

export function ZoneAddStopPop({
  expZnCd,
  divCd,
  lgstGrpCd,
  notLocLst,
  onApply,
  onClose,
}: ZoneAddStopPopProps) {
  const showError = useErrorAlert();
  const [locCd, setLocCd] = useState("");
  const [locNm, setLocNm] = useState("");
  const [dtlAddr, setDtlAddr] = useState("");
  const [zipCd, setZipCd] = useState("");
  const [custCd, setCustCd] = useState("");
  const [custNm, setCustNm] = useState("");
  const [favorOnly, setFavorOnly] = useState(false);
  const [locPopRows, setLocPopRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const excludedLocCds = useMemo(() => {
    const staged = selectedRows.map((row) => String(row.LOC_CD ?? "").trim());
    return [...new Set([...notLocLst, ...staged].filter(Boolean))];
  }, [notLocLst, selectedRows]);

  const excludedLocCdsKey = useMemo(
    () => [...excludedLocCds].sort().join("|"),
    [excludedLocCds],
  );

  const runSearch = useCallback(
    (promise: Promise<any>): Promise<any[]> =>
      promise
        .then((res: any) => {
          if (res?.data?.success === false) {
            showError(res.data?.msg ?? "조회에 실패했습니다.");
            return [];
          }
          return res.data?.data?.dsOut ?? [];
        })
        .catch((err: any) => {
          showError(
            err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
          );
          return [];
        }),
    [showError],
  );

  const fetchLocPopList = useCallback(async () => {
    const rows = await runSearch(
      zoneApi.searchItineraryLocationPop({
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        EXP_ZN_CD: expZnCd,
        NOT_LOC_LST: excludedLocCds,
        favor: favorOnly ? "Y" : undefined,
        code: locCd,
        name: locNm,
        DTL_ADDR1: dtlAddr,
        ZIP_CD: zipCd,
        CUST_CD: custCd,
        CUST_NM: custNm,
      }),
    );
    setLocPopRows(rows);
  }, [
    custCd,
    custNm,
    divCd,
    dtlAddr,
    excludedLocCds,
    expZnCd,
    favorOnly,
    lgstGrpCd,
    locCd,
    locNm,
    runSearch,
    zipCd,
  ]);

  useEffect(() => {
    void fetchLocPopList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedLocCdsKey, favorOnly]);

  const searchFields: GridSearchField[] = useMemo(
    () => [
      { label: "LBL_CODE", value: locCd, onChange: setLocCd },
      { label: "LBL_CODE_NM", value: locNm, onChange: setLocNm },
      { label: "LBL_ADDR", value: dtlAddr, onChange: setDtlAddr },
      { label: "LBL_ZIP_CODE", value: zipCd, onChange: setZipCd },
      { label: "LBL_CUSTOMER_CODE", value: custCd, onChange: setCustCd },
      { label: "LBL_CUSTOMER_NAME", value: custNm, onChange: setCustNm },
    ],
    [custCd, custNm, dtlAddr, locCd, locNm, zipCd],
  );

  const addToSelected = useCallback((candidates: any[]) => {
    if (!candidates.length) return;

    setSelectedRows((prev) => {
      const existingIds = new Set(prev.map((row) => String(row.LOC_ID ?? "")));
      const next = [
        ...prev,
        ...candidates
          .filter((row) => !existingIds.has(String(row.LOC_ID ?? "")))
          .map(mapLocPopToSelected),
      ];
      return next;
    });

    const pickedIds = new Set(candidates.map((row) => String(row.LOC_ID ?? "")));
    setLocPopRows((prev) =>
      prev.filter((row) => !pickedIds.has(String(row.LOC_ID ?? ""))),
    );
  }, []);

  const removeFromSelected = useCallback((row: any) => {
    if (!row) return;

    setSelectedRows((prev) =>
      prev.filter((item) => item.__rid__ !== row.__rid__),
    );
    setLocPopRows((prev) => {
      const exists = prev.some(
        (item) => String(item.LOC_ID ?? "") === String(row.LOC_ID ?? ""),
      );
      if (exists) return prev;
      return [...prev, mapSelectedToLocPop(row)];
    });
  }, []);

  const handleApply = useCallback(() => {
    const active = selectedRows.filter(
      (row) => String(row.EDIT_STS ?? "") !== ROW_STATUS.DELETE,
    );
    if (!active.length) return;
    onApply(active);
  }, [onApply, selectedRows]);

  const setSelectedRowData = useCallback((updater: any) => {
    setSelectedRows((prev) => {
      const cur = { rows: prev, totalCount: prev.length };
      const raw = typeof updater === "function" ? updater(cur) : updater;
      const rows = Array.isArray(raw) ? raw : (raw?.rows ?? prev);
      if (rows === prev) return prev;

      const removed = prev.filter(
        (row) =>
          !rows.some(
            (next: any) =>
              next.__rid__ === row.__rid__ ||
              String(next.LOC_ID ?? "") === String(row.LOC_ID ?? ""),
          ),
      );
      if (removed.length) {
        setLocPopRows((left) => {
          const existingIds = new Set(left.map((r) => String(r.LOC_ID ?? "")));
          const restored = removed
            .map(mapSelectedToLocPop)
            .filter((row) => !existingIds.has(String(row.LOC_ID ?? "")));
          return restored.length ? [...left, ...restored] : left;
        });
      }

      return rows;
    });
  }, []);

  const selectedActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_APPLY",
        label: "BTN_APPLY",
        onClick: handleApply,
      },
    ],
    [handleApply],
  );

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <PopupSearchCondition fields={searchFields} onSearch={fetchLocPopList} />

      <div style={{ height: 500 }} className="min-h-0">
        <SplitPane
          direction="horizontal"
          defaultSizes={[62, 38]}
          minSizes={[30, 25]}
          handleThickness="1.5"
        >
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-end gap-2 px-2 py-1.5 border-b border-slate-200 bg-[var(--grid-header-bg)] shrink-0">
              <label className="flex items-center gap-1.5 text-[11px] text-color cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={favorOnly}
                  onChange={(e) => setFavorOnly(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
                {Lang.get("LBL_BOOKMARK")}
              </label>
            </div>
            <div className="flex-1 min-h-0">
              <DataGrid
                layoutType="plain"
                columnDefs={LOC_POP_COLUMN_DEFS}
                rowData={locPopRows}
                rowSelection="multiple"
                pagination={false}
                audit={false}
                disableAutoSize
                onRowDoubleClicked={(row) => addToSelected([row])}
              />
            </div>
          </div>
          <DataGrid
            layoutType="plain"
            actions={selectedActions}
            columnDefs={SELECTED_LOC_COLUMN_DEFS}
            rowData={selectedRows}
            setRowData={setSelectedRowData}
            rowSelection="single"
            pagination={false}
            audit={{
              insertPerson: false,
              insertDate: false,
              updatePerson: false,
              updateTime: false,
            }}
            disableAutoSize
            onRowDoubleClicked={(row) => removeFromSelected(row)}
          />
        </SplitPane>
      </div>

      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          {Lang.get("LBL_CLOSE")}
        </Button>
      </div>
    </div>
  );
}
