"use client";

// 물동량 배차생성 팝업 (센차 dspchplnad.pop.CreateQtyDispatchPop)
// 헤더 조회조건(물류그룹 고정 + 운송사/차량 필터) → 메인(물동배차노선/차량 후보, 다중선택)
// + 하단 대상주문(미할당 운송지시, 표시·건수확인용). 선택 메인행을 saveCreateQtyDispatch 로 배차생성.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { dispatchPlanApi as api } from "../dispatchPlanApi";
import { Lang } from "@/app/services/common/Lang";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Initial = {
  DIV_CD?: string;
  LGST_GRP_CD?: string;
  DLVRY_DT?: string;
  PLN_ID?: string;
  BATCH_NO?: string | number;
};

type Props = {
  initial: Initial;
  onApplied: () => void;
  onClose: () => void;
};

// 메인: 물동배차노선/차량 후보
const MAIN_COLS = [
  { type: "text", headerName: "LBL_FROM_ZONE_CD", field: "FRM_ZN_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_FROM_ZONE_NM", field: "FRM_ZN_NM", width: 120 },
  { type: "text", headerName: "LBL_QTY_ITNR_CD", field: "QTY_ITNR_ID", align: "center", width: 120 },
  { type: "text", headerName: "LBL_QTY_ITNR_NM", field: "QTY_ITNR_NM", width: 140 },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", align: "center", width: 80 },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", width: 110 },
  { type: "text", headerName: "LBL_CARRIER_CODE", field: "CARR_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", width: 120 },
  { type: "text", headerName: "LBL_TO_ZONE_CD", field: "TO_ZN_CD", align: "center", width: 100 },
  { type: "text", headerName: "LBL_TO_ZONE_NM", field: "TO_ZN_NM", width: 120 },
];

// 하단: 대상주문(미할당 운송지시) — 핵심 컬럼 subset(표시·건수확인용)
const SUB_COLS = [
  { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "FRM_LOC_NM", width: 120 },
  { type: "text", headerName: "LBL_ORDER_NO", field: "ORD_NO", align: "center", width: 120 },
  { type: "text", headerName: "LBL_DESTINATION_NAME", field: "TO_LOC_NM", width: 120 },
  { type: "text", headerName: "LBL_PLANT_CD", field: "PLANT_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_PLANT_NM", field: "PLANT_NM", width: 110 },
  { type: "numeric", headerName: "LBL_PLN_GRS_VOL", field: "PLN_GRS_VOL", decimalPlaces: 2, width: 90 },
  { type: "numeric", headerName: "LBL_PLN_GRS_WGT", field: "PLN_GRS_WGT", decimalPlaces: 2, width: 90 },
  { type: "numeric", headerName: "LBL_DIRECT_DIST", field: "DIST", width: 90 },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD", align: "center", width: 90 },
  { type: "text", headerName: "LBL_CUSTOMER_NAME", field: "CUST_NM", width: 120 },
];

const pickRows = (res: any): any[] =>
  res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function CreateQtyDispatchPop({
  initial,
  onApplied,
  onClose,
}: Props) {
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehId, setVehId] = useState("");
  const [vehTpCd, setVehTpCd] = useState("");
  const [vehNo, setVehNo] = useState("");
  const [mainRows, setMainRows] = useState<any[]>([]);
  const [subRows, setSubRows] = useState<any[]>([]);
  const [selMain, setSelMain] = useState<any[]>([]);

  const buildParams = () => ({
    DIV_CD: initial.DIV_CD ?? "",
    LGST_GRP_CD: initial.LGST_GRP_CD ?? "",
    CARR_CD: carrCd,
    CARR_NM: carrNm,
    VEH_ID: vehId,
    VEH_NO: vehNo,
    VEH_TP_CD: vehTpCd,
    PLN_ID: initial.PLN_ID ?? "",
    DLVRY_DT: initial.DLVRY_DT ?? "",
    QTY_DPSCH: "Y",
  });

  // 메인(물동배차노선/차량) + 하단 대상주문(미할당 운송지시) 동시 조회
  const reload = () => {
    if (!initial.LGST_GRP_CD) return;
    const params = buildParams();
    api
      .searchQtyItinerary(params)
      .then((res: any) => setMainRows(pickRows(res)))
      .catch(console.error);
    api
      .getUnallocOrderList(params)
      .then((res: any) => setSubRows(pickRows(res)))
      .catch(console.error);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = () => {
    if (selMain.length === 0) {
      showInfoModal(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    if (subRows.length <= 0) {
      showInfoModal(Lang.get("MSG_SHIPMENT_UNASSIGNED_COUNT"));
      return;
    }
    const rows = selMain.map((r) => ({
      ...r,
      BATCH_NO: initial.BATCH_NO ?? 1,
      DLVRY_DT: initial.DLVRY_DT ?? "",
      PLN_ID: initial.PLN_ID ?? "",
      DSPCH_TP: "10",
      rowStatus: "I",
    }));
    api
      .saveCreateQtyDispatch(rows)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        // 부모 닫기/재조회 먼저 → 성공 모달(스택 최상단 보존)
        onApplied();
        showInfoModal(Lang.get("MSG_SAVE_CMPLT"));
      })
      .catch((err: any) => showErrorModal(err?.message ?? Lang.get("TTL_ERR")));
  };

  const searchFields: GridSearchField[] = [
    {
      type: "text",
      label: "LBL_LOGISTICS_GROUP_CODE",
      value: initial.LGST_GRP_CD ?? "",
      onChange: () => {},
      disable: true,
    },
    { type: "text", label: "LBL_CARRIER_CODE", value: carrCd, onChange: setCarrCd },
    { type: "text", label: "LBL_CARRIER_NAME", value: carrNm, onChange: setCarrNm },
    { type: "text", label: "LBL_VEHICLE_CODE", value: vehId, onChange: setVehId },
    { type: "text", label: "LBL_VEHICLE_TYPE", value: vehTpCd, onChange: setVehTpCd },
    { type: "text", label: "LBL_VEH_NO", value: vehNo, onChange: setVehNo },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <PopupSearchCondition fields={searchFields} onSearch={reload} columns={3} />

      <div className="flex flex-col gap-2" style={{ height: 440 }}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
            {Lang.get("LBL_CREATE_DSPCH_QTY")}
          </div>
          <div className="flex-1 min-h-0">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={MAIN_COLS}
              rowData={mainRows}
              rowSelection="multiple"
              gridOptions={{
                onSelectionChanged: (e: any) =>
                  setSelMain(e.api.getSelectedRows()),
              }}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
            {Lang.get("LBL_TRGT_ORDER")}
          </div>
          <div className="flex-1 min-h-0">
            <DataGrid
              layoutType="plain"
              actions={[]}
              columnDefs={SUB_COLS}
              rowData={subRows}
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
          onClick={onSave}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_DISPATCH_CREATE")}
        </Button>
      </div>
    </div>
  );
}
