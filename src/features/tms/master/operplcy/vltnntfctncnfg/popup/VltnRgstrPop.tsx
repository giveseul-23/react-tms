"use client";

// 위반템플릿 등록 팝업 (센차 VltnRgstrPop)
// 기간(FRM/TO) 조회조건 + 위반유형별 기본 템플릿 목록(다건 선택, 횟수 인라인 편집) → 선택분을 부모에 전달.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { useCommonStores } from "@/hooks/useCommonStores";
import { vltnNtfctnCnfgApi as api } from "../VltnNtfctnCnfgApi";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = {
  onConfirm: (rows: any[]) => void;
  onClose: () => void;
};

const todayDash = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const COLUMN_DEFS = [
  { headerName: "No" },
  {
    field: "VLTN_NTFCTN_TCD",
    headerName: "LBL_VLTN_NTFCTN_TCD",
    codeKey: "vltnNtfctnTcd",
    flex: 1,
    minWidth: 160,
  },
  {
    type: "numeric",
    field: "CNSCTV_VLTN_CNT",
    headerName: "LBL_CNSCTV_VLTN_CNT",
    width: 130,
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    field: "MAX_VLTN_NTFCTN_CNT",
    headerName: "LBL_MAX_VLTN_NTFCTN_CNT",
    width: 140,
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    field: "VLTN_NTFCTN_INTRVL",
    headerName: "LBL_VLTN_NTFCTN_INTRVL",
    width: 130,
    editable: true,
    insertable: true,
  },
];

export default function VltnRgstrPop({ onConfirm, onClose }: Props) {
  const [frm, setFrm] = useState(todayDash());
  const [to, setTo] = useState("2029-12-31");
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { codeMap } = useCommonStores({
    vltnNtfctnTcd: { sqlProp: "CODE", keyParam: "VLTN_NTFCTN_TCD" },
  });

  const search = () => {
    api
      .searchRgstrPop({
        FRM_DTTM: frm.replace(/-/g, ""),
        TO_DTTM: to.replace(/-/g, ""),
      })
      .then((res: any) => {
        const data: any[] = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setRows(
          data.map((r) => ({
            VLTN_NTFCTN_TCD: r.VLTN_NTFCTN_TCD,
            CNSCTV_VLTN_CNT: Number(r.CNSCTV_VLTN_CNT ?? 0),
            MAX_VLTN_NTFCTN_CNT: Number(r.MAX_VLTN_NTFCTN_CNT ?? 1),
            VLTN_NTFCTN_INTRVL: Number(r.VLTN_NTFCTN_INTRVL ?? 30),
          })),
        );
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchFields: GridSearchField[] = [
    { type: "date", label: Lang.get("LBL_FROM_DATE"), value: frm, onChange: setFrm },
    { type: "date", label: Lang.get("LBL_TO_DATE"), value: to, onChange: setTo },
  ];

  const onSave = () => {
    if (selectedRows.length === 0) return;
    onConfirm(
      selectedRows.map((r) => ({
        FRM_DTTM: frm.replace(/-/g, ""),
        TO_DTTM: to.replace(/-/g, ""),
        VLTN_NTFCTN_TCD: r.VLTN_NTFCTN_TCD,
        CNSCTV_VLTN_CNT: r.CNSCTV_VLTN_CNT,
        MAX_VLTN_NTFCTN_CNT: r.MAX_VLTN_NTFCTN_CNT,
        VLTN_NTFCTN_INTRVL: r.VLTN_NTFCTN_INTRVL,
      })),
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 조회조건 — 공통 컴포넌트 (기간) */}
      <PopupSearchCondition
        fields={searchFields}
        onSearch={search}
        columns={2}
      />

      {/* 위반유형 목록 — 다건 선택 + 횟수 인라인 편집 */}
      <div style={{ height: 360 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          setRowData={setRows}
          codeMap={codeMap}
          rowSelection="multiple"
          audit={false}
          gridOptions={{
            onSelectionChanged: (e: any) =>
              setSelectedRows(e.api.getSelectedRows()),
          }}
          disableAutoSize
        />
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={selectedRows.length === 0}
          onClick={onSave}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
