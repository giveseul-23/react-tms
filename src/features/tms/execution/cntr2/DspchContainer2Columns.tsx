// 그리드 컬럼 정의 (서버 DspchContainer2Main 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)·EDIT_STS 는 DataGrid 가 자동 추가(model.bind).

import { TempTonGroupChangePop } from "./popup/TempTonGroupChangePop";

export type ContainerColumnMeta = {
  CNTR_CD?: string;
  CNTR_NM?: string;
  D_CNTR_CD?: string;
};

const normalizeContainerQtyCode = (container: ContainerColumnMeta, index: number) => {
  const rawCode = String(container.D_CNTR_CD || container.CNTR_CD || `C${index + 1}`);
  return rawCode.replace(/^CD_/i, "");
};

// 수량 셀 하이라이트 (서버 highlightQty 대응)
//  - 값 0 이면 기본 스타일
//  - IN_COUNT 필드는 빨강(입고), 그 외(OUT_COUNT)는 초록(출고)
const qtyCellStyle = (p: any) => {
  const field = String(p?.colDef?.field ?? "");
  const n = parseInt(String(p?.value ?? ""), 10);
  if (!n || n === 0) return null;
  if (field.includes("_IN_")) {
    return { backgroundColor: "#FBE4E4", color: "#D9534F", fontWeight: "bold" };
  }
  return { backgroundColor: "#E4F7E4", color: "#3C9A3C", fontWeight: "bold" };
};

// 입/출고 수량 쌍 그룹 생성 헬퍼 — In(출고)/Out(입고) 컬럼은 editType:number, 셀 편집(editable), 하이라이트.
const qtyPair = (
  headerName: string,
  dlvryField: string,
  rtrnField: string,
  groupOpts: Record<string, any> = {},
) => ({
  headerName,
  ...groupOpts,
  children: [
    {
      type: "numeric",
      headerName: "LBL_INBOUND_COUNT",
      field: dlvryField,
      editable: true,
      validators: { min: 0 },
      width: 50,
      cellStyle: qtyCellStyle,
    },
    {
      type: "numeric",
      headerName: "LBL_OUTBOUND_COUNT",
      field: rtrnField,
      editable: true,
      validators: { min: 0 },
      width: 50,
      cellStyle: qtyCellStyle,
    },
  ],
});

export const BASE_MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "date", headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", align: "center", width: 70 },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 80 },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpStsList",
    statusStyle: "DSPCH_OP_STS",
    width: 80,
    editable: false,
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
        popupTitle: "BTN_CHANGE_TON_TYPE",
        popupWidth: "2xl",
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
];

export const buildContainerQtyColumnDefs = (containers: ContainerColumnMeta[] = []) => {
  const sorted = [...containers].sort((a, b) => String(a.CNTR_CD ?? "").localeCompare(String(b.CNTR_CD ?? "")));
  return sorted.map((container, index) => {
    const dynamicCode = normalizeContainerQtyCode(container, index);
    const cntrName = String(container.CNTR_NM || container.CNTR_CD || dynamicCode);
    return qtyPair(
      cntrName,
      `CD_${dynamicCode}_DLVRY_QTY`,
      `CD_${dynamicCode}_RTRN_QTY`,
      { noLang: true },
    );
  });
};

export const buildDspchContainer2ColumnDefs = (containers: ContainerColumnMeta[] = []) => [
  ...BASE_MAIN_COLUMN_DEFS,
  ...buildContainerQtyColumnDefs(containers),
];

export const MAIN_COLUMN_DEFS = buildDspchContainer2ColumnDefs();
