"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import type { GridSearchField } from "@/app/components/popup/GridSearchPopupLayout";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { newRid } from "@/app/feature/useBaseModel";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { itineraryApi } from "../ItineraryApi";

type ItineraryAddStopPopProps = {
  itnrId: string;
  frmLocId: string;
  divCd: string;
  onApply: (rows: any[]) => void;
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

const STOP_COLUMN_DEFS = [
  { field: "ITNR_ID", hide: true },
  { field: "LOC_ID", hide: true },
  { field: "FRM_LOC_ID", hide: true },
  {
    type: "numeric",
    field: "STOP_SEQ",
    headerName: "LBL_SEQ",
    width: 70,
    insertable: true,
    editable: true,
    required: true,
  },
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
    type: "check",
    field: "USE_YN",
    headerName: "LBL_USE_YN",
    width: 80,
    insertable: true,
    editable: true,
  },
];

function sortStopsBySeq(rows: any[]) {
  return [...rows].sort((a, b) => Number(a.STOP_SEQ) - Number(b.STOP_SEQ));
}

function isSameLocId(a: unknown, b: unknown) {
  return String(a ?? "") === String(b ?? "");
}

function nextStopSeq(rows: any[]): number {
  const seqs = rows
    .filter((r) => String(r.EDIT_STS ?? "") !== ROW_STATUS.DELETE)
    .map((r) => Number(r.STOP_SEQ))
    .filter((n) => !Number.isNaN(n));
  const max = seqs.length ? Math.max(...seqs) : 1;
  return max >= 2 ? max + 1 : 2;
}

function markStopSeqAdjusted(row: any) {
  if (
    row.EDIT_STS === ROW_STATUS.INSERT ||
    row.EDIT_STS === ROW_STATUS.DELETE
  ) {
    return row;
  }
  return { ...row, EDIT_STS: ROW_STATUS.UPDATE };
}

function AddStopSearchFields({
  fields,
  onSearch,
}: {
  fields: GridSearchField[];
  onSearch: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
          onClick={onSearch}
          className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1"
          style={{ lineHeight: 1 }}
        >
          <Search className="w-3 h-3 flex-shrink-0" />
          <span className="leading-none">조회</span>
        </Button>
      </div>

      <div
        className="grid divide-x divide-y divide-slate-100"
        style={{
          gridTemplateColumns: `repeat(${Math.min(fields.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {fields.map((f) => {
          if (f.type === "popup" || f.type === "combo") return null;
          return (
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
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                disabled={f.disable}
                className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full disabled:cursor-not-allowed disabled:text-slate-400"
                placeholder={f.placeholder ?? "입력"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ItineraryAddStopPop({
  itnrId,
  frmLocId,
  divCd,
  onApply,
  onClose,
}: ItineraryAddStopPopProps) {
  const showError = useErrorAlert();
  const [locCd, setLocCd] = useState("");
  const [locNm, setLocNm] = useState("");
  const [dtlAddr, setDtlAddr] = useState("");
  const [zipCd, setZipCd] = useState("");
  const [custCd, setCustCd] = useState("");
  const [custNm, setCustNm] = useState("");
  const [locPopRows, setLocPopRows] = useState<any[]>([]);
  const [stopRows, setStopRows] = useState<any[]>([]);
  const [selectedStopRow, setSelectedStopRow] = useState<any>(null);

  const withRid = useCallback((rows: any[]) => {
    let touched = false;
    const mapped = rows.map((r) => {
      if (r?.__rid__) return r;
      touched = true;
      return { ...r, __rid__: newRid() };
    });
    return touched ? mapped : rows;
  }, []);

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

  const notLocLst = useMemo(
    () =>
      stopRows
        .filter((r) => String(r.EDIT_STS ?? "") !== ROW_STATUS.DELETE)
        .map((r) => r.LOC_CD)
        .filter(Boolean),
    [stopRows],
  );

  const notLocLstKey = useMemo(
    () => [...notLocLst].sort().join("|"),
    [notLocLst],
  );

  const searchFields: GridSearchField[] = useMemo(
    () => [
      {
        label: Lang.get("LBL_CODE"),
        value: locCd,
        onChange: setLocCd,
        placeholder: Lang.get("LBL_INPUT"),
      },
      {
        label: Lang.get("LBL_CODE_NM"),
        value: locNm,
        onChange: setLocNm,
        placeholder: Lang.get("LBL_INPUT"),
      },
      {
        label: Lang.get("LBL_ADDR"),
        value: dtlAddr,
        onChange: setDtlAddr,
        placeholder: Lang.get("LBL_INPUT"),
      },
      {
        label: Lang.get("LBL_ZIP_CODE"),
        value: zipCd,
        onChange: setZipCd,
        placeholder: Lang.get("LBL_INPUT"),
      },
      {
        label: Lang.get("LBL_CUSTOMER_CODE"),
        value: custCd,
        onChange: setCustCd,
        placeholder: Lang.get("LBL_INPUT"),
      },
      {
        label: Lang.get("LBL_CUSTOMER_NAME"),
        value: custNm,
        onChange: setCustNm,
        placeholder: Lang.get("LBL_INPUT"),
      },
    ],
    [custCd, custNm, dtlAddr, locCd, locNm, zipCd],
  );

  const fetchStopList = useCallback(async () => {
    const rows = await runSearch(
      itineraryApi.getDetailList({ ITNR_ID: itnrId }),
    );
    setStopRows(withRid(sortStopsBySeq(rows)));
  }, [itnrId, runSearch, withRid]);

  const fetchLocPopList = useCallback(async () => {
    const rows = await runSearch(
      itineraryApi.searchItineraryLocationPop({
        ITNR_ID: itnrId,
        DIV_CD: divCd,
        NOT_LOC_LST: notLocLst,
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
    itnrId,
    locCd,
    locNm,
    notLocLst,
    runSearch,
    zipCd,
  ]);

  const setStopRowData = useCallback(
    (updater: any) => {
      setStopRows((prev) => {
        const cur = { rows: prev, totalCount: prev.length };
        const raw = typeof updater === "function" ? updater(cur) : updater;
        if (raw === cur) return prev;
        const rows = Array.isArray(raw) ? raw : (raw?.rows ?? prev);
        if (rows === prev) return prev;
        const next = withRid(rows);
        return next === prev ? prev : next;
      });
    },
    [withRid],
  );

  useEffect(() => {
    setSelectedStopRow((prev) => {
      if (!prev?.__rid__) return prev;
      const matched = stopRows.find((r) => r.__rid__ === prev.__rid__);
      if (!matched || matched === prev) return prev;
      return matched;
    });
  }, [stopRows]);

  useEffect(() => {
    void fetchStopList();
  }, [fetchStopList]);

  useEffect(() => {
    void fetchLocPopList();
  }, [notLocLstKey]);

  const applyLocToStops = useCallback(
    (candidates: any[]) => {
      if (!candidates.length) return;

      setStopRows((prev) => {
        let seq = nextStopSeq(prev);
        const added = candidates.map((row) => ({
          ITNR_ID: itnrId,
          FRM_LOC_ID: frmLocId,
          LOC_ID: row.LOC_ID,
          LOC_CD: row.CODE,
          LOC_NM: row.NAME,
          STOP_SEQ: seq++,
          USE_YN: "Y",
          EDIT_STS: ROW_STATUS.INSERT,
          __rid__: newRid(),
        }));
        return withRid(sortStopsBySeq([...prev, ...added]));
      });

      const pickedIds = new Set(candidates.map((r) => r.LOC_ID));
      setLocPopRows((prev) => prev.filter((r) => !pickedIds.has(r.LOC_ID)));
    },
    [frmLocId, itnrId, withRid],
  );

  const handleAdjustStopSeq = useCallback(
    (delta: number, row: any) => {
      const targetRow = row ?? selectedStopRow;
      if (!targetRow) return;

      setStopRows((prev) => {
        const target =
          prev.find(
            (r) => targetRow.__rid__ && r.__rid__ === targetRow.__rid__,
          ) ??
          prev.find((r) => isSameLocId(r.LOC_ID, targetRow.LOC_ID));
        if (!target) return prev;

        const active = sortStopsBySeq(
          prev.filter((r) => String(r.EDIT_STS ?? "") !== ROW_STATUS.DELETE),
        );
        const idx = active.findIndex((r) => r.__rid__ === target.__rid__);
        if (idx < 0) return prev;

        const adjIdx = idx + delta;
        if (adjIdx < 0 || adjIdx >= active.length) {
          showError(
            Lang.get(
              delta > 0
                ? "MSG_LAST_STOP_SEQ"
                : "MSG_STOP_SEQUENCE_PREVIOUS_STOP_VALID_CHK",
            ),
          );
          return prev;
        }

        const curr = active[idx];
        const adj = active[adjIdx];
        const currSeq = curr.STOP_SEQ;
        const adjSeq = adj.STOP_SEQ;

        const nextActive = active.map((r, i) => {
          if (i === idx) return markStopSeqAdjusted({ ...r, STOP_SEQ: adjSeq });
          if (i === adjIdx)
            return markStopSeqAdjusted({ ...r, STOP_SEQ: currSeq });
          return r;
        });

        const deleted = prev.filter(
          (r) => String(r.EDIT_STS ?? "") === ROW_STATUS.DELETE,
        );

        return withRid(sortStopsBySeq([...nextActive, ...deleted]));
      });
    },
    [selectedStopRow, showError, withRid],
  );

  const onSave = useCallback(() => onApply(stopRows), [onApply, stopRows]);

  const locPopActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_APPLY",
        label: "BTN_APPLY",
        onClick: ({ data }: { data: any[] }) => applyLocToStops(data ?? []),
      },
    ],
    [applyLocToStops],
  );

  const stopActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_MINUS",
        label: "BTN_ADJUST_STOP_SEQ_MINUS",
        onClick: ({ data }: { data: any[] }) =>
          handleAdjustStopSeq(-1, data?.[0] ?? selectedStopRow),
      },
      {
        type: "button",
        key: "BTN_ADJUST_STOP_SEQ_PLUS",
        label: "BTN_ADJUST_STOP_SEQ_PLUS",
        onClick: ({ data }: { data: any[] }) =>
          handleAdjustStopSeq(1, data?.[0] ?? selectedStopRow),
      },
      {
        type: "button",
        key: "BTN_SAVE",
        label: "BTN_SAVE",
        onClick: onSave,
      },
    ],
    [handleAdjustStopSeq, onSave, selectedStopRow],
  );

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <AddStopSearchFields fields={searchFields} onSearch={fetchLocPopList} />

      <div style={{ height: 500 }} className="min-h-0">
        <SplitPane
          direction="horizontal"
          defaultSizes={[62, 38]}
          minSizes={[30, 25]}
          handleThickness="1.5"
        >
          <DataGrid
            layoutType="plain"
            actions={locPopActions}
            columnDefs={LOC_POP_COLUMN_DEFS}
            rowData={locPopRows}
            rowSelection="multiple"
            pagination={false}
            audit={false}
            disableAutoSize
            onRowDoubleClicked={(row) => applyLocToStops([row])}
          />
          <DataGrid
            layoutType="plain"
            actions={stopActions}
            columnDefs={STOP_COLUMN_DEFS}
            rowData={stopRows}
            setRowData={setStopRowData}
            rowSelection="single"
            selectedRow={selectedStopRow}
            onSelectionChanged={(row) => setSelectedStopRow(row)}
            pagination={false}
            audit={{ delete: true, rowStatus: true }}
            disableAutoSize
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
