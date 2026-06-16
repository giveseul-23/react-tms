// 상품수량 정산 등록 — 단일 그리드 (서버 RegisterSettlProductQtyMain 기준)
// audit 컬럼은 DataGrid 가 자동 추가(model.bind).

// 수량 입력 셀: 값 > 0 이면 파란색 강조 (서버 onRenderer 대응)
const qtyHighlight = (p: any) => {
  const n = Number(String(p?.value ?? "").replace(/,/g, "")) || 0;
  return n > 0
    ? { backgroundColor: "#e8f1ff", color: "#1565c0", fontWeight: "bold" }
    : null;
};

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  // 물류운영그룹
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center", width: 100 },
  // 물류운영그룹명
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_NAME", field: "LGST_GRP_NM", align: "left", width: 100 },
  // 납품일
  { type: "date", headerName: "LBL_DSPCH_DLVRY_DT", field: "DLVRY_DT", align: "center", width: 80, editable: false },
  // 요일
  { type: "combo", headerName: "LBL_DAYS", field: "DLVRY_DAY", codeKey: "dayOfWeeks", align: "center", width: 60, editable: false },
  // (실)납품일
  { type: "date", headerName: "LBL_REAL_DELIVERY_DT", field: "ITEMQTY_DLVRY_DT", align: "center", width: 80, editable: true },
  // (실)요일
  { type: "combo", headerName: "LBL_REAL_DAYS", field: "ITMQTY_DAY", codeKey: "dayOfWeeks", align: "center", width: 60, editable: false },
  // 진행상황
  { type: "combo", headerName: "LBL_PROGRESS_STATUS", field: "ITEMQTY_OP_STS", codeKey: "itmQtyOpSts", align: "center", width: 80, editable: false },
  // 배차번호
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center", width: 90 },
  // 운송협력사
  { type: "text", headerName: "LBL_CARRIER", field: "CARR_CD", align: "center", width: 90 },
  // 운송협력사명
  { type: "text", headerName: "LBL_CARRIER_NAME", field: "CARR_NM", align: "center", width: 100 },
  // 출발지명
  { type: "text", headerName: "LBL_FROM_LOC_NM", field: "FRM_LOC_NM", align: "left", width: 90 },
  // 도착지명
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "TO_LOC_NM", align: "left", width: 250 },
  // 낱개
  { type: "numeric", headerName: "LBL_EA", field: "EA", align: "right", width: 100, editable: true, validators: { min: 0, max: 999 }, cellStyle: qtyHighlight },
  // 스낵(CVS)
  { type: "numeric", headerName: "LBL_PLT", field: "PLT", align: "right", width: 100, editable: true, validators: { min: 0, max: 999 }, cellStyle: qtyHighlight },
  // PVC(CVS)
  { type: "numeric", headerName: "LBL_BOX", field: "BOX", align: "right", width: 100, editable: true, validators: { min: 0, max: 999 }, cellStyle: qtyHighlight },
  // PVS회수(CVS)
  { type: "numeric", headerName: "LBL_WEIGHT_KG", field: "KG", align: "right", width: 100, editable: true, validators: { min: 0, max: 999 }, cellStyle: qtyHighlight },
  // 항공수수료(CVS)
  { type: "numeric", headerName: "LBL_ROLLTAINER", field: "RT", align: "right", width: 100, editable: true, validators: { min: 0, max: 999 }, cellStyle: qtyHighlight },
];
