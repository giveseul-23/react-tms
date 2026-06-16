// 그리드 컬럼 정의 (서버 DspchContainer2Main 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)·EDIT_STS 는 DataGrid 가 자동 추가(model.bind).

import { Lang } from "@/app/services/common/Lang";
import { TempTonGroupChangePop } from "./popup/TempTonGroupChangePop";

// 수량 셀 하이라이트 (서버 highlightQty 대응)
//  - 값 0 이면 기본 스타일
//  - IN_COUNT 필드는 빨강(입고), 그 외(OUT_COUNT)는 초록(출고)
const qtyCellStyle = (p: any) => {
  const field = String(p?.colDef?.field ?? "");
  const n = parseInt(String(p?.value ?? ""), 10);
  if (!n || n === 0) return null;
  if (field.includes("IN_COUNT")) {
    return { backgroundColor: "#FBE4E4", color: "#D9534F", fontWeight: "bold" };
  }
  return { backgroundColor: "#E4F7E4", color: "#3C9A3C", fontWeight: "bold" };
};

// 입/출고 수량 쌍 그룹 생성 헬퍼 — In(출고)/Out(입고) 컬럼은 editType:number, 셀 편집(editable), 하이라이트.
const qtyPair = (
  headerName: string,
  inField: string,
  inExcel: string,
  outField: string,
  outExcel: string,
  groupOpts: Record<string, any> = {},
) => ({
  headerName,
  ...groupOpts,
  children: [
    {
      type: "numeric",
      headerName: "LBL_OUTBOUND",
      field: inField,
      editable: true,
      validators: { min: 0 },
      width: 50,
      excelColName: inExcel,
      cellStyle: qtyCellStyle,
    },
    {
      type: "numeric",
      headerName: "LBL_INBOUND",
      field: outField,
      editable: true,
      validators: { min: 0 },
      width: 50,
      excelColName: outExcel,
      cellStyle: qtyCellStyle,
    },
  ],
});

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 70 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80 },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpStsList",
    align: "center",
    width: 80,
  },
  {
    type: "combo",
    headerName: "LBL_PICKDROP_DIV",
    field: "STOP_TP",
    codeKey: "stopTpList",
    align: "center",
    width: 80,
  },
  {
    headerName: "LBL_VEHICLE_MANAGER",
    children: [
      { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", align: "center", width: 90 },
      { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center", width: 90 },
      { type: "text", headerName: "LBL_DRIVER_NAME", field: "DRVR_NM", align: "center", width: 60 },
      { type: "text", headerName: "LBL_VEH_TP_CD", field: "OLD_VEH_TP_CD", align: "center", width: 60, hide: true },
      { type: "text", headerName: "LBL_VEH_TP_CD", field: "VEH_TP_CD", align: "center", width: 60, hide: true },
      {
        type: "popuser",
        headerName: "LBL_VEH_TP_NM",
        field: "VEH_TP_NM",
        popupTitle: "톤급변경",
        popupWidth: "sm",
        align: "center",
        width: 60,
        editable: true,
        insertable: true,
        required: true,
        validators: { required: true, max: 60 },
        renderPopup: ({ commit, close }: any) => (
          <TempTonGroupChangePop
            onConfirm={(picked: { VEH_TP_CD: string; VEH_TP_NM: string }) => {
              commit({ VEH_TP_CD: picked.VEH_TP_CD, VEH_TP_NM: picked.VEH_TP_NM });
              close();
            }}
            onClose={close}
          />
        ),
      },
      { type: "text", headerName: "LBL_VEHICLE_OPERATION_TYPE", field: "VEH_OP_TP", align: "center", width: 40, hide: true },
      { type: "text", headerName: "LBL_DIV", field: "TRCK_TYPE", align: "center", width: 40 },
    ],
  },
  {
    headerName: "LBL_DEPARTURE_INFO",
    children: [
      { type: "text", headerName: "LBL_DEPARTURE_CODE", field: "PICK_LOC_CD", align: "center", width: 70 },
      { type: "text", headerName: "LBL_DEPARTURE_NAME", field: "PICK_LOC_NM", align: "left", width: 80 },
    ],
  },
  {
    headerName: "LBL_LOC_INFO",
    children: [
      { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD", align: "center", width: 60 },
      { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM", align: "left", width: 70 },
      { type: "text", headerName: "STOP_ID", field: "STOP_ID", noLang: true, hide: true },
    ],
  },
  { type: "text", headerName: "LBL_CNTR_WEB_UPD_YN", field: "CNTR_WEB_UPD_YN", align: "center", width: 65 },
  qtyPair("KPP", "P1_IN_COUNT", "LBL_P1_OUTCOUNT", "P1_OUT_COUNT", "LBL_P1_OUTBOUND", { noLang: true }),
  qtyPair(Lang.get("LBL_AJU") + " PLT", "P2_IN_COUNT", "LBL_P2_INBOUND", "P2_OUT_COUNT", "LBL_P2_OUTBOUND", { noLang: true }),
  qtyPair(Lang.get("LBL_ETC_SETTING") + " PLT", "P3_IN_COUNT", "LBL_P3_INBOUND", "P3_OUT_COUNT", "LBL_P3_OUTBOUND", { noLang: true }),
  qtyPair("LBL_SLV_BOGIE", "R1_IN_COUNT", "LBL_R1_INBOUND", "R1_OUT_COUNT", "LBL_R1_OUTBOUND"),
  qtyPair("LBL_BLU_BOGIE", "R2_IN_COUNT", "LBL_R2_INBOUND", "R2_OUT_COUNT", "LBL_R2_OUTBOUND"),
  qtyPair("LBL_PICK_BOGIE", "R3_IN_COUNT", "LBL_R3_INBOUND", "R3_OUT_COUNT", "LBL_R3_OUTBOUND"),
  qtyPair("LBL_TRANSFER_BOGIE", "O1_IN_COUNT", "LBL_O1_INBOUND", "O1_OUT_COUNT", "LBL_O1_OUTBOUND"),
  qtyPair("LBL_LENDING_BORROWING", "O2_IN_COUNT", "LBL_O2_INBOUND", "O2_OUT_COUNT", "LBL_O2_OUTBOUND"),
  qtyPair("LBL_TRANSPORTATION", "O3_IN_COUNT", "LBL_O3_INBOUND", "O3_OUT_COUNT", "LBL_O3_OUTBOUND"),
  qtyPair("LBL_PICK_BOX_LENDING_BORROWING", "O4_IN_COUNT", "LBL_O4_INBOUND", "O4_OUT_COUNT", "LBL_O4_OUTBOUND"),
  qtyPair("LBL_PICK_BOX_TRANSPORTATION", "O5_IN_COUNT", "LBL_O5_INBOUND", "O5_OUT_COUNT", "LBL_O5_OUTBOUND"),
];
