import { CommonPopup } from "@/app/components/popup/CommonPopup";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "numeric",
    headerName: "LBL_DEPARTURE_ID",
    field: "FRM_LOC_ID",
    hide: true,
  },
  {
    type: "popuser",
    headerName: "LBL_DEPARTURE_CODE",
    field: "FRM_LOC_CD",
    popupTitle: "LBL_DEPARTURE_CODE",
    renderPopup: ({ commit, close }) => (
      <CommonPopup
        sqlId="selectLocationCodeName"
        onApply={(picked: any) => {
          commit({
            FRM_LOC_CD: picked.CODE,
            FRM_LOC_NM: picked.NAME,
            FRM_LOC_ID: picked.LOC_ID,
          });
          close();
        }}
        onClose={close}
      />
    ),
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "FRM_LOC_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_DESTINATION_ID",
    field: "TO_LOC_ID",
    hide: true,
  },
  {
    type: "popuser",
    headerName: "LBL_DESTINATION_CODE",
    field: "TO_LOC_CD",
    popupTitle: "LBL_DESTINATION_CODE",
    renderPopup: ({ commit, close }) => (
      <CommonPopup
        sqlId="selectLocationCodeName"
        onApply={(picked: any) => {
          commit({
            TO_LOC_CD: picked.CODE,
            TO_LOC_NM: picked.NAME,
            TO_LOC_ID: picked.LOC_ID,
          });
          close();
        }}
        onClose={close}
      />
    ),
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NAME",
    field: "TO_LOC_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_TRIP_COUNT",
    field: "TRIP_CNT",
    editable: true,
    insertable: true,
  },
];