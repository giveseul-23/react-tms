export const LOGISTIC_COLUMN_DEFS = [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    isPrimaryKey: true,
    cellStyle: { textAlign: "center" },
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    cellStyle: { textAlign: "left" },
  },
];

export const LOGISTIC_CARRIER_INFO_COLUMN_DEFS = [
  {
    type: "popup",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    required: true,
    sqlId: "selectCarrList",
    nameField: "CARR_NM",
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "numeric",
    headerName: "LBL_DSPCH_AP_FROM_DAY_ADJ",
    field: "DSPCH_AP_FRM_DAY_ADJ",
    cellStyle: { textAlign: "right" },
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_DSPCH_AP_TO_DAY_ADJ",
    field: "DSPCH_AP_TO_DAY_ADJ",
    editable: true,
    insertable: true,
    cellStyle: { textAlign: "right" },
  },
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    width: 70,
    editable: true,
    insertable: true,
    cellRenderer: (params: any) => (
      <div className="flex items-center justify-center h-full">
        <input
          type="checkbox"
          className="ag-input-field-input ag-checkbox-input"
          checked={params.value === "Y"}
          readOnly
        />
      </div>
    ),
  },
];

export const LOGISTIC_CARRIER_DETAIL_INFO_COLUMN_DEFS = [
  {
    type: "combo",
    headerName: "LBL_EMAIL_GROUP",
    field: "EMAIL_OP_CD",
    codeKey: "emailOpCd",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_EMAIL_ADDR",
    field: "EMAIL_ADDR",
    fieldType: "text",
    required: true,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_EMAIL_RCVR_NM",
    field: "EMAIL_RCVR_NM",
    fieldType: "text",
    required: true,
    editable: true,
    insertable: true,
  },
];
