"use client";

// 요율 생성 팝업 (센차 DfChargeRateAddPop)
// 기간 + 수배송구분 + 물류그룹(단일)/운송사(다건)/차량유형(다건) 선택 → addChargeRate 생성.
// ADD_TYPE='VEH' 이면 차량유형 그리드 숨김.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useCommonStores } from "@/hooks/useCommonStores";
import DataGrid from "@/app/components/grid/DataGrid";
import { dfChargeRateApi as api } from "../DfChargeRateApi";
import { Lang } from "@/app/services/common/Lang";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = {
  addType: "VEH_TP" | "VEH";
  onApplied: () => void;
  onClose: () => void;
};

const LGST_COLS = [
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM" },
];
const CARR_COLS = [
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM" },
];
const VEHTP_COLS = [
  { type: "text", headerName: "LBL_VEHICLE_TYPE_CODE", field: "VEH_TP_CD", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", width: 120 },
  { type: "text", headerName: "LBL_VEH_TP_GRP", field: "VEH_TP_GRP", align: "center", width: 80 },
];

export default function DfChargeRateAddPop({ addType, onApplied, onClose }: Props) {
  const [frm, setFrm] = useState("");
  const [to, setTo] = useState("");
  const [transTcd, setTransTcd] = useState("");
  const [lgstRows, setLgstRows] = useState<any[]>([]);
  const [carrRows, setCarrRows] = useState<any[]>([]);
  const [vehTpRows, setVehTpRows] = useState<any[]>([]);
  const [selLgst, setSelLgst] = useState<any>(null);
  const [selCarr, setSelCarr] = useState<any[]>([]);
  const [selVehTp, setSelVehTp] = useState<any[]>([]);
  const { stores } = useCommonStores({ transTcd: { sqlProp: "CODE", keyParam: "TRANS_TCD" } });

  // 선택 대상 그리드(물류그룹 / 차량유형) 로드 — 조회조건 "조회" 버튼으로도 재호출.
  const reload = () => {
    api
      .searchLgstPop({})
      .then((res: any) =>
        setLgstRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []),
      )
      .catch(console.error);
    if (addType === "VEH_TP") {
      api
        .searchVehicleType({})
        .then((res: any) =>
          setVehTpRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []),
        )
        .catch(console.error);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectLgst = (row: any) => {
    setSelLgst(row);
    setCarrRows([]);
    setSelCarr([]);
    if (row?.LGST_GRP_CD) {
      api.searchCarrPop({ LGST_GRP_CD: row.LGST_GRP_CD }).then((res: any) => setCarrRows(res?.data?.data?.dsOut ?? res?.data?.result ?? [])).catch(console.error);
    }
  };

  const onAdd = () => {
    // 항목별 검증 (센차 onAdd 동일 — 누락 시 안내 후 중단)
    if (!frm || !to) {
      showInfoModal(Lang.get("MSG_ENTER_DTTM"));
      return;
    }
    if (!selLgst) {
      showInfoModal(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"));
      return;
    }
    if (selCarr.length === 0) {
      showInfoModal(Lang.get("MSG_CARR_SELECT_CHK"));
      return;
    }
    if (!transTcd) {
      showInfoModal(Lang.get("MSG_TRANS_TCD_SELECT_CHK"));
      return;
    }
    if (addType === "VEH_TP" && selVehTp.length === 0) {
      showInfoModal(Lang.get("MSG_VEHTP_SELECT_CHK"));
      return;
    }
    const params = {
      FRM_DTTM: frm.replace(/-/g, ""),
      TO_DTTM: to.replace(/-/g, ""),
      DIV_CD: selLgst.DIV_CD,
      TRANS_TCD: transTcd,
      LGST_GRP_CD: selLgst.LGST_GRP_CD,
      LGST_GRP_NM: selLgst.LGST_GRP_NM,
      CARR_LST: JSON.stringify(selCarr),
      VEH_TP_LST: JSON.stringify(selVehTp),
      DF_TRF_CRE_TCD: "VEH_TP_BASED",
      ADD_TYPE: addType,
    };
    api
      .addChargeRate(params)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        // AddPop 을 먼저 닫고(onApplied=closePopup+재조회) → 성공 모달을 띄운다.
        // 순서가 반대면 closePopup 이 방금 연 성공 모달(최상단)을 닫아버린다.
        onApplied();
        showInfoModal(Lang.get("MSG_SAVE_CMPLT"));
      })
      .catch((err: any) => showErrorModal(err?.message ?? Lang.get("TTL_ERR")));
  };

  const searchFields: GridSearchField[] = [
    {
      type: "date",
      label: "LBL_FROM_DATE",
      value: frm,
      onChange: setFrm,
      max: to,
    },
    {
      type: "date",
      label: "LBL_TO_DATE",
      value: to,
      onChange: setTo,
      min: frm,
    },
    {
      type: "combo",
      label: "LBL_VEH_TRANS_TCD",
      value: transTcd,
      onChange: setTransTcd,
      options: stores.transTcd ?? [],
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition
        fields={searchFields}
        onSearch={reload}
        columns={3}
      />

      <div className="flex gap-2" style={{ height: 420 }}>
        <div className="flex-1 flex flex-col">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">{Lang.get("LBL_LOGISTICS_GROUP")}</div>
          <div className="flex-1">
            <DataGrid layoutType="plain" actions={[]} columnDefs={LGST_COLS} rowData={lgstRows} rowSelection="single" onRowSelected={onSelectLgst} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">{Lang.get("LBL_PAY_CARRIER")}</div>
          <div className="flex-1">
            <DataGrid layoutType="plain" actions={[]} columnDefs={CARR_COLS} rowData={carrRows} rowSelection="multiple" gridOptions={{ onSelectionChanged: (e: any) => setSelCarr(e.api.getSelectedRows()) }} />
          </div>
        </div>
        {addType === "VEH_TP" && (
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">{Lang.get("LBL_VEHICLE_TYPE")}</div>
            <div className="flex-1">
              <DataGrid layoutType="plain" actions={[]} columnDefs={VEHTP_COLS} rowData={vehTpRows} rowSelection="multiple" gridOptions={{ onSelectionChanged: (e: any) => setSelVehTp(e.api.getSelectedRows()) }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button variant="outline" size="xs" onClick={onAdd} className="btn-primary btn-primary:hover">
          <Check className="w-3 h-3" />
          {Lang.get("BTN_ADD")}
        </Button>
      </div>
    </div>
  );
}
