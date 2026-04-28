// src/views/inTrnstVehCtrl/InTrnstVehCtrlColumns.tsx
// 수송중 차량제어 그리드 컬럼 정의

export const MAIN_COLUMN_DEFS = () => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DT",
    field: "HIS_DATE",
    cellStyle: { textAlign: "center" },
  },
  {
    type: "text",
    headerName: "LBL_DRIVING_HIS_STS",
    field: "DRIVING_HIS_YN",
    cellStyle: { textAlign: "center" },
  },
];
