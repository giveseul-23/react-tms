"use client";

// 간접비 요율 생성 팝업 (센차 OverheadTariffAddPopup)
// 계약정보(설명/운송사/기간/간접비유형) + 디비전(단일)→물류센터(다건)/간접비항목(다건) 선택 → createTariffOverhead.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useCommonStores } from "@/hooks/useCommonStores";
import DataGrid from "@/app/components/grid/DataGrid";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { commonApi } from "@/app/services/common/commonApi";
import { overheadTariffManagementApi as api } from "../OverheadTariffManagementApi";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = { onApplied: () => void; onClose: () => void };

const CODE_NAME_COLS = (codeLabel: string, nameLabel: string) => [
  {
    type: "text",
    headerName: codeLabel,
    field: "CODE",
    align: "center",
    width: 110,
  },
  { type: "text", headerName: nameLabel, field: "NAME" },
];

const todayDash = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const codeRows = (res: any): any[] =>
  res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function OverheadTariffAddPopup({ onApplied, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [desc, setDesc] = useState("");
  const [carr, setCarr] = useState({ cd: "", nm: "" });
  const [frm, setFrm] = useState(todayDash());
  const [to, setTo] = useState(todayDash());
  const [ovrhdTp, setOvrhdTp] = useState("");
  const [divRows, setDivRows] = useState<any[]>([]);
  const [lgstRows, setLgstRows] = useState<any[]>([]);
  const [chgRows, setChgRows] = useState<any[]>([]);
  const [selDiv, setSelDiv] = useState<any>(null);
  const [selLgst, setSelLgst] = useState<any[]>([]);
  const [selChg, setSelChg] = useState<any[]>([]);
  const { stores } = useCommonStores({
    ovrhdChgTp: { sqlProp: "CODE", keyParam: "OVRHD_CHG_TP" },
  });

  // 선택 대상 그리드(디비전 / 간접비항목) 로드 — 조회조건 "조회" 로도 재호출.
  const reload = () => {
    commonApi
      .getCodesAndNames({ key: "dsOut", sqlProp: "selectDivisionCodeName" })
      .then((r: any) => setDivRows(codeRows(r)))
      .catch(console.error);
    commonApi
      .getCodesAndNames({ key: "dsOut", sqlProp: "selectChgOvrhd" })
      .then((r: any) => setChgRows(codeRows(r)))
      .catch(console.error);
  };

  useEffect(() => {
    reload();
  }, []);

  const onSelectDiv = (row: any) => {
    setSelDiv(row);
    setLgstRows([]);
    setSelLgst([]);
    if (row?.CODE) {
      api
        .searchPopLgst({ keyParam: row.CODE })
        .then((r: any) => setLgstRows(codeRows(r)))
        .catch(console.error);
    }
  };

  const pickCarr = () =>
    openPopup({
      title: "LBL_CARRIER",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectCarrList"
          onApply={(r: any) => {
            closePopup();
            setCarr({ cd: r.CODE, nm: r.NAME });
          }}
          onClose={closePopup}
        />
      ),
    });

  const valid =
    !!desc.trim() &&
    !!carr.cd &&
    !!frm &&
    !!to &&
    frm <= to &&
    !!ovrhdTp &&
    !!selDiv &&
    selLgst.length > 0 &&
    selChg.length > 0;

  const onSave = () => {
    if (!valid) return;
    const defaults = {
      CARR_CD: carr.cd,
      CARR_NM: carr.nm,
      FRM_DTTM: frm.replace(/-/g, ""),
      TO_DTTM: to.replace(/-/g, ""),
      CONTRCT_DESC: desc.trim(),
      DIV_CD: selDiv.CODE,
      DIV_NM: selDiv.NAME,
      OVRHD_CHG_TP: ovrhdTp,
    };
    api
      .createTariffOverhead({
        LGST_GRP_CD_LIST: selLgst.map((r) => ({ ...r, ...defaults })),
        CHG_LIST: selChg.map((r) => ({ ...r, ...defaults })),
      })
      .then(() => onApplied())
      .catch(console.error);
  };

  const searchFields: GridSearchField[] = [
    {
      label: Lang.get("LBL_CONTRACT_DESCRIPTION"),
      value: desc,
      onChange: setDesc,
    },
    {
      type: "popup",
      label: Lang.get("LBL_CARRIER"),
      code: carr.cd,
      name: carr.nm,
      onChangeCode: (v) => setCarr((p) => ({ ...p, cd: v })),
      onChangeName: (v) => setCarr((p) => ({ ...p, nm: v })),
      onClickSearch: pickCarr,
    },
    {
      type: "date",
      label: Lang.get("LBL_FROM_DTTM"),
      value: frm,
      onChange: setFrm,
    },
    {
      type: "date",
      label: Lang.get("LBL_TO_DTTM"),
      value: to,
      onChange: setTo,
    },
    {
      type: "combo",
      label: Lang.get("LBL_OVRHD_CHG_TP"),
      value: ovrhdTp,
      onChange: setOvrhdTp,
      options: stores.ovrhdChgTp ?? [],
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 계약 정보 — 조회조건 카드 */}
      <PopupSearchCondition fields={searchFields} onSearch={reload} />

      {/* 3 그리드 */}
      <div className="flex gap-2" style={{ height: 360 }}>
        <div className="w-1/4 flex flex-col">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
            {Lang.get("LBL_DIVISION")}
          </div>
          <div className="flex-1">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={CODE_NAME_COLS(
                "LBL_DIVISION_CODE",
                "LBL_DIVISION_NAME",
              )}
              rowData={divRows}
              rowSelection="single"
              onRowSelected={onSelectDiv}
            />
          </div>
        </div>
        <div className="w-1/3 flex flex-col">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
            {Lang.get("LBL_LOGISTICS_GROUP")}
          </div>
          <div className="flex-1">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={CODE_NAME_COLS(
                "LBL_LOGISTICS_GROUP_CODE",
                "LBL_LOGISTICS_GROUP_NAME",
              )}
              rowData={lgstRows}
              rowSelection="multiple"
              gridOptions={{
                onSelectionChanged: (e: any) =>
                  setSelLgst(e.api.getSelectedRows()),
              }}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
            {Lang.get("LBL_RATE_ITEM")}
          </div>
          <div className="flex-1">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={CODE_NAME_COLS(
                "LBL_RATE_ITEM_CD",
                "LBL_RATE_ITEM_NM",
              )}
              rowData={chgRows}
              rowSelection="multiple"
              gridOptions={{
                onSelectionChanged: (e: any) =>
                  setSelChg(e.api.getSelectedRows()),
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={!valid}
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
