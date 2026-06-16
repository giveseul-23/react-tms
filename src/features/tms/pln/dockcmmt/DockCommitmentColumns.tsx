// 메인 그리드 컬럼 (서버 DockCommitmentMain.js) — audit 컬럼은 OMIT(전 컬럼 읽기전용).
//   배차진행상태(DSPCH_OP_STS) / 착지구분(STOP_TP) 는 combo+codeKey → 코드 라벨.
//   도크확약상태(DOCK_CMMT_YN) Y → 핑크 배경(센차 onRenderer 대응 cellStyle).

import type { CellClassParams } from "ag-grid-community";

// 배차진행상태 색상 (센차 setDispatchOperationStatusColor 대응) — TODO: 서버 색상맵 미확인,
//   상태값별 색 매핑이 명확해지면 채운다. 현재는 기본(무채색).
const dispatchStatusCellStyle = (_p: CellClassParams) => null;

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DISPATCH_NO",
    field: "DSPCH_NO",
    align: "center",
  },
  {
    type: "combo",
    headerName: "LBL_DISPATCH_OPERATIONAL_STATUS",
    field: "DSPCH_OP_STS",
    codeKey: "dspchOpStsList",
    align: "center",
    width: 140,
    cellStyle: dispatchStatusCellStyle,
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    align: "center",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    align: "left",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
    align: "center",
    hide: true,
  },
  {
    type: "combo",
    headerName: "LBL_PICKDROP_DIV",
    field: "STOP_TP",
    codeKey: "stopTpList",
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
    align: "left",
    width: 260,
  },
  {
    type: "text",
    headerName: "LBL_DOCK_CMMT_STATUS",
    field: "DOCK_CMMT_YN",
    align: "center",
    width: 120,
    cellStyle: (p: CellClassParams) =>
      p.value === "Y"
        ? { color: "#ffffff", backgroundColor: "#CA1957" }
        : null,
  },
];
