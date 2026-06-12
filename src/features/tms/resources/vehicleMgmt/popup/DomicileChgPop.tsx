"use client";

// 소속(차고지) 일괄변경 팝업 (센차 DomicileChgPop)
// 조회조건 차량 목록을 띄워 다건 선택 → 변경 차고지(CHG_DOMI) 적용 후 changeDomicile 저장.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { PopupSearchCondition } from "@/app/components/popup/PopupSearchCondition";
import { usePopup } from "@/app/components/popup/PopupContext";
import { vehicleMgmtApi as api } from "../vehicleMgmtApi";
import { commonApi } from "@/app/services/common/commonApi";
import { Lang } from "@/app/services/common/Lang";
import { useCommonStores } from "@/hooks/useCommonStores";

type Props = {
  params: {
    DIV_CD?: string;
    LGST_GRP_CD?: string;
    VEH_OP_TP?: string;
    VEH_OPER_SCD?: string;
  };
  onApplied: () => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center" },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    align: "center",
  },
  { type: "text", headerName: "LBL_TON_TYPE", field: "VEH_TP_NM" },
  {
    type: "text",
    headerName: "LBL_DOMICILE_LOC_CD",
    field: "LOC_CD",
    align: "center",
  },
  { type: "text", headerName: "LBL_DOMICILE_LOC_NM", field: "LOC_NM" },
];

// 착지(차고지) 목록 (selectLocationCodeName)
const LOC_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_LOCATION_CODE",
    field: "CODE",
    align: "center",
  },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "NAME" },
];

export default function DomicileChgPop({ params, onApplied, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [rows, setRows] = useState<any[]>([]);
  const [locRows, setLocRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [locSelectedRow, setLocSelectedRow] = useState<any | null>(null);
  const [oldDomi, setOldDomi] = useState({ cd: "", nm: "" });

  const search = (locCd = "") => {
    api
      .searchDomicileChgPop({ ...params, LOC_CD: locCd })
      .then((res: any) => {
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setRows(data);
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // 착지(차고지) 목록 — 팝업 열릴 때 1회 조회 (selectLocationCodeName)
    commonApi
      .getCodesAndNames({ key: "dsOut", sqlProp: "selectLocationCodeName" })
      .then((res: any) => {
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setLocRows(data);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { stores } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    vehOperScd: { sqlProp: "CODE", keyParam: "VEH_OPER_SCD" },
  });

  // 차고지 코드 검색 팝업 (스택)
  const openDomiPicker = (onPick: (cd: string, nm: string) => void) => {
    openPopup({
      title: "LBL_DOMICILE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLocationCodeName"
          onApply={(r: any) => {
            closePopup();
            onPick(r.CODE, r.NAME);
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const onChange = () => {
    // 변경할 착지(우측 그리드) 단일 선택 검증
    if (!locSelectedRow) {
      openPopup({
        type: "check",
        width: "lg",
        content: (
          <div className="p-4 text-sm">{Lang.get("MSG_SELECT_NO_DATA")}</div>
        ),
      });
      return;
    }
    if (selectedRows.length === 0) return;
    const saveRows = selectedRows.map((r) => ({
      ...r,
      LOC_CD: locSelectedRow.CODE,
      LOC_NM: locSelectedRow.NAME,
      rowStatus: "U",
    }));
    api
      .changeDomicile(saveRows)
      .then(() => onApplied())
      .catch(console.error);
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 */}
      <PopupSearchCondition
        fields={[
          {
            type: "text",
            label: "LBL_LOGISTICS_GROUP",
            value: params.LGST_GRP_CD,
            disable: true,
            onChange: () => {},
          },
          {
            type: "combo",
            label: "LBL_VEHICLE_OPERATION_TYPE",
            value: params.VEH_OP_TP,
            disable: true,
            onChange: () => {},
            options: stores.vehOpTp,
          },
          {
            type: "combo",
            label: "LBL_VEH_OPER_SCD",
            value: params.VEH_OPER_SCD,
            disable: true,
            onChange: () => {},
            options: stores.vehOperScd,
          },
          {
            type: "popup",
            label: "LBL_OLD_DOMICILE",
            code: oldDomi.cd,
            name: oldDomi.nm,
            onChangeCode: (v) => setOldDomi((p) => ({ ...p, cd: v })),
            onChangeName: (v) => setOldDomi((p) => ({ ...p, nm: v })),
            onClickSearch: () =>
              openDomiPicker((cd, nm) => setOldDomi({ cd, nm })),
          },
        ]}
        onSearch={() => search(oldDomi.cd)}
      />

      {/* 그리드 — 좌: 차량 목록(다건 선택) / 우: 착지(차고지) 목록(단건 선택) */}
      <div
        className="grid grid-cols-[6fr_4fr] gap-3 shrink-0"
        style={{ height: 380 }}
      >
        <div className="h-full min-h-0">
          <DataGrid
            subTitle="LBL_VEHICLE_MANAGER"
            layoutType="plain"
            actions={[]}
            columnDefs={COLUMN_DEFS}
            rowData={rows}
            pagination
            pageSize={20}
            rowSelection="multiple"
            gridOptions={{
              onSelectionChanged: (e: any) =>
                setSelectedRows(e.api.getSelectedRows()),
            }}
          />
        </div>
        <div className="h-full min-h-0">
          <DataGrid
            subTitle="LBL_CHANGED_DOMICILE"
            layoutType="plain"
            actions={[]}
            columnDefs={LOC_COLUMN_DEFS}
            rowData={locRows}
            pagination
            pageSize={20}
            rowSelection="single"
            gridOptions={{
              onSelectionChanged: (e: any) =>
                setLocSelectedRow(e.api.getSelectedRows()[0] ?? null),
            }}
          />
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
          disabled={selectedRows.length === 0 || !locSelectedRow}
          onClick={onChange}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_CHG_DOMICILE")}
        </Button>
      </div>
    </div>
  );
}
