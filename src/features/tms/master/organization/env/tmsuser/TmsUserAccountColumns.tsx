import { CommonPopup } from "@/app/components/popup/CommonPopup";

export const MAIN_COLUMN_DEFS: any[] = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_USER_NAME",
    field: "USR_NM",
    width: 120,
  },
  {
    type: "combo",
    headerName: "LBL_CUSTOMER",
    field: "CUST_CD",
    codeKey: "custList",
    width: 140,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_MOBILE_APP_USE",
    field: "MBL_USE",
    width: 100,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    width: 60,
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_VALID_START_DATE",
    field: "USE_STT_DT",
    width: 100,
  },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
    width: 100,
  },
  { type: "text", headerName: "LBL_TEL_NO", field: "TEL_NO", hide: true },
  { type: "text", headerName: "LBL_HP_NO", field: "MBL_PHN_NO", hide: true },
  { type: "text", headerName: "LBL_EMAIL", field: "EMAIL_ADDR", hide: true },
  {
    type: "combo",
    headerName: "LBL_USR_TP",
    field: "USR_TP",
    codeKey: "usrTpList",
    width: 140,
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "popuser",
    headerName: "LBL_USR_CARR_CD",
    field: "USR_CARR_CD",
    nameField: "USR_CARR_NM",
    width: 120,
    editable: true,
    insertable: true,
    renderPopup: ({ row, commit, close }: any) => (
      <CommonPopup
        sqlId="selectCarrList"
        extraParams={{ sqlParam1: String(row?.USR_ID ?? "") }}
        onApply={(picked: any) => {
          commit({
            USR_CARR_CD: picked?.CODE,
            USR_CARR_NM: picked?.NAME,
          });
          close();
        }}
        onClose={close}
      />
    ),
  },
  {
    type: "text",
    headerName: "LBL_USR_CARR_NM",
    field: "USR_CARR_NM",
    width: 120,
  },
];

export const SUB01_COLUMN_DEFS: any[] = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_USER_ID", field: "USR_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    width: 150,
  },
  {
    type: "combo",
    headerName: "LBL_CUSTOMER",
    field: "CUST_CD",
    codeKey: "custList",
    width: 140,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    width: 80,
    editable: true,
    insertable: true,
    singleMode: true,
  },
];

export const SUB02_COLUMN_DEFS: any[] = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_USER_ID", field: "USR_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    width: 150,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP",
    field: "LGST_GRP_NM",
    width: 150,
  },
  {
    type: "check",
    headerName: "LBL_DFT_VAL_NM",
    field: "DFT_YN",
    width: 80,
    editable: true,
    insertable: true,
    singleMode: true,
  },
];

export const SUB03_COLUMN_DEFS: any[] = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_USER_ID", field: "USR_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_USR_LOC_CD",
    field: "LOC_CD",
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_LOC_NM",
    field: "LOC_NM",
    required: true,
  },
];
