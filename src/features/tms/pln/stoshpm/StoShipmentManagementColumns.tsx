import LocPlantPop from "./popup/LocPlantPop";

const locPlantPopup = (
  field: "FRM_LOC_CD" | "TO_LOC_CD",
  target: "from" | "to",
) => ({
  type: "popuser",
  headerName: target === "from" ? "LBL_DEPARTURE_CODE" : "LBL_DESTINATION_CD",
  field,
  popupTitle: "BTN_ADD_LOC",
  popupWidth: "4xl",
  align: "center",
  width: 80,
  required: true,
  insertable: true,
  editable: true,
  renderPopup: ({ row, commit, close }: any) => (
    <LocPlantPop
      divCd={row?.DIV_CD}
      onConfirm={(picked) => {
        if (target === "from") {
          commit({
            FRM_LOC_ID: picked.LOC_ID,
            PLANT_CD: picked.PLANT_CD,
            SLOC_CD: picked.SLOC_CD,
            SLOC_NM: picked.SLOC_NM,
            FRM_LOC_CD: picked.BP_CD,
            FRM_LOC_NM: picked.BP_NM,
          });
        } else {
          commit({
            TO_LOC_ID: picked.LOC_ID,
            TO_PLANT_CD: picked.PLANT_CD,
            TO_SLOC_CD: picked.SLOC_CD,
            TO_LOC_CD: picked.BP_CD,
            TO_LOC_NM: picked.BP_NM,
          });
        }
        close();
      }}
      onClose={close}
    />
  ),
});

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIV_CD",
    field: "DIV_CD",
    align: "center",
    width: 120,
    hide: true,
  },  
  {
    type: "text",
    headerName: "LBL_SHIPMENT_NO",
    field: "SHPM_NO",
    align: "center",
    width: 120,
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_DLVRY_REQ_DATE",
    field: "DLVRY_DT",
    align: "center",
    required: true,
    insertable: true,
    editable: true,
  },
  {
    type: "combo",
    headerName: "LBL_SPC_PROC",
    field: "SPCL_PRCS_CD",
    codeKey: "spclPrcsCd",
    align: "center",
    width: 100,
    required: true,
    insertable: true,
    editable: true,
  },
  locPlantPopup("FRM_LOC_CD", "from"),
  { type: "text", field: "PLANT_CD", hide: true },
  { type: "text", field: "FRM_LOC_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
    align: "left",
    width: 120,
    editable: false,
    insertable: false,
  },
  locPlantPopup("TO_LOC_CD", "to"),
  { type: "text", field: "TO_LOC_ID", hide: true },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NM",
    field: "TO_LOC_NM",
    align: "left",
    width: 120,
    editable: false,
    insertable: false,
  },
  {
    type: "combo",
    headerName: "LBL_SHIPMENT_OP_STATUS",
    field: "SHPM_OP_STS",
    codeKey: "shpmOpStsList",
    statusStyle: "SHPM_OP_STS",
    align: "center",
    width: 140,
    editable: false,
    insertable: false,
  },
  { type: "text", field: "LGST_GRP_CD", hide: true },
  { type: "text", field: "DIV_CD", hide: true },
  { type: "text", field: "PLN_ID", hide: true },
  { type: "text", field: "TO_PLANT_CD", hide: true },
  { type: "text", field: "SLOC_CD", hide: true },
  { type: "text", field: "SLOC_NM", hide: true },
  { type: "text", field: "TO_SLOC_CD", hide: true },
];
