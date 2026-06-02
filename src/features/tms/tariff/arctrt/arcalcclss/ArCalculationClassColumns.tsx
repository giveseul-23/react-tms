import { Lang } from "@/app/services/common/Lang";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_CLASS_CODE",
    field: "CLSS_CD",
    required: true,
    insertable: true,
    align: "center",
  },
  {
    type: "text",
    headerName: "LBL_CLASS_NAME",
    field: "CLSS_NM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_CLASS_DIV",
    field: "CLSS_TP",
    codeKey: "clssTypeList",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_SQLID_NM",
    field: "SQL_ID",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_REMARK",
    field: "RMK",
    insertable: true,
    editable: true,
  },
];
