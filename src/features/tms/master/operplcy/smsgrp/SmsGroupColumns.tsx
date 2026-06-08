import TmsUserAccountPop from "./popup/TmsUserAccountPop";

// SMS 그룹 (main) — 셀 편집
export const MAIN_COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_SMS_GRP_CD",
    field: "SMS_GRP_CD",
    isPrimaryKey: true,
    insertable: true,
    required: true,
    width: 90,
    validators: { max: 60 },
  },
  {
    type: "text",
    headerName: "LBL_SMS_GRP_DESC",
    field: "SMS_GRP_DESC",
    insertable: true,
    editable: true,
    required: true,
    width: 220,
    validators: { max: 200 },
  },
  {
    type: "check",
    headerName: "LBL_USE_Y/N",
    field: "USE_YN",
    insertable: true,
    editable: true,
    width: 70,
  },
];

// SMS 수신자 (sub01) — 셀 편집
export const DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_SMS_GRP_CD",
    field: "SMS_GRP_CD",
    align: "center",
    width: 100,
  },
  {
    type: "popup",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    sqlId: "selectLogisticsgroupCodeName",
    nameField: "LGST_GRP_NM",
    insertable: true,
    required: true,
    align: "center",
    width: 110,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    align: "center",
    width: 150,
  },
  {
    type: "popuser",
    headerName: "LBL_RECEIVER_ID",
    field: "USR_ID",
    insertable: true,
    required: true,
    align: "center",
    width: 130,
    renderPopup: ({ commit, close }: any) => (
      <TmsUserAccountPop
        onConfirm={(u: any) => {
          commit({ USR_ID: u.USR_ID, USR_NM: u.USR_NM });
          close();
        }}
        onClose={close}
      />
    ),
  },
  {
    type: "text",
    headerName: "LBL_RECEIVER_NM",
    field: "USR_NM",
    align: "center",
    width: 130,
  },
];
