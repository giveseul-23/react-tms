// 그리드 컬럼 정의 (서버 DispatchReasonMain / DispatchReasonSub01 기준)
// audit 컬럼(등록자/등록일시/수정자/수정일시)은 DataGrid 가 자동 추가(model.bind).
// PK 컬럼: isPrimaryKey:true — DataGrid 가 첫행 자동선택을 자동 활성화.

// ── 메인: 배차사유 ─────────────────────────────────────────────────
export const MAIN_COLUMN_DEFS = [
  { field: "DSPCH_RSN_ID", hide: true, isPrimaryKey: true },
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DSPCH_RSN_CODE",
    field: "DSPCH_RSN_CD",
    align: "center",
    width: 100,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DSPCH_RSN_NM",
    field: "DSPCH_RSN_NM",
    width: 150,
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_SEQ",
    field: "DSPLY_SEQ",
    align: "center",
    width: 50,
    editable: true,
    insertable: true,
  },
];

// ── sub01: 배차사유 상세 ───────────────────────────────────────────
export const DETAIL_COLUMN_DEFS = [
  { field: "DSPCH_RSN_ID", hide: true },
  { field: "DSPCH_RSN_DTL_ID", hide: true, isPrimaryKey: true },
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DSPCH_RSN_DTL_CODE",
    field: "DSPCH_RSN_DTL_CD",
    align: "center",
    width: 100,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_DSPCH_RSN_NM",
    field: "DSPCH_RSN_DTL_NM",
    width: 150,
    editable: true,
    insertable: true,
    required: true,
  },
];
