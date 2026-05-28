import VehicleAssignPopup from "./popup/VehicleAssignPopup";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    type: "text",
    field: "LGST_GRP_NM",
    hide: true,
  },
  {
    type: "text",
    headerName: "LBL_ID",
    field: "BASE_RTN_CNT_ID",
    align: "center",
  },
  {
    type: "popuser",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    popupTitle: "BTN_SELECT_VEH",
    renderPopup: ({ row, commit, close }) => (
      <VehicleAssignPopup
        initialValues={row}
        onConfirm={(picked) => {
          commit({
            VEH_ID: picked.VEH_ID,
            VEH_NO: picked.VEH_NO,
            VEH_TP_CD: picked.VEH_TP_CD,
            DRVR_ID: picked.DRVR_ID,
            DRVR_NM: picked.DRVR_NM,
          });
          close();
        }}
        onClose={close}
      />
    ),
    required: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_VEHICLE_TYPE",
    field: "VEH_TP_CD",
    codeKey: "vehTp",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "START_DTTM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "END_DTTM",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "number",
    headerName: "LBL_BASE_RTN_CNT",
    field: "BASE_RTN_CNT",
    required: true,
    insertable: true,
    editable: true,
    align: "right",
  },
];
