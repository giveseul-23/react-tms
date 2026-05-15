
export const MAIN_COLUMN_DEFS = [
  { 
    headerName: "No" 
  }, {
    // 고객사(회사) 코드
    type: "text",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
  },{
    // 고객사(회사) 명
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
  },{
    // 영업조직 코드
    type: "text",
    headerName: "LBL_SALES_ORG_CD",
    field: "SALES_ORG_CD",
  }, {
    // 영업조직 명
    type: "text",
    headerName: "LBL_SALES_ORG_NM",
    field: "SALES_ORG_NM",
  }, {
    // 플랜트 코드
    type: "text",
    headerName: "LBL_PLANT_CD",
    field: "PLANT_CD",
  }, {
    // 플랜트 명
    type: "text",
    headerName: "LBL_PLANT_NM",
    field: "PLANT_NM",
  }, {
    // 출하지점 명
    type: "text",
    headerName: "LBL_SHPNT_NM",
    field: "SHPNT_NM",
  }, {
    // BP코드
    type: "text",
    headerName: "LBL_BP_CD",
    field: "BP_CD",
  }, {
    // 저장위치
    type: "text",
    headerName: "LBL_SLOC_CD",
    field: "SLOC_CD",
  },{
    // 저장위치명
    type: "text",
    headerName: "LBL_SLOC_CD",
    field: "SLOC_CD",
  },{
    // 재고관리시스템
    type: "combo",
    headerName: "LBL_INV_SYS_ID",
    field: "INV_SYS_ID",
    codeKey: "invSysList",
    editable: true, insertable: true,
  },{
    // 우편번호
    type: "text",
    headerName: "LBL_ZIP_CD",
    field: "ZIP_CD",
  }, {
    // 주소
    type: "text",
    headerName: "LBL_ADDR",
    field: "DTL_ADDR1",
  }
];
