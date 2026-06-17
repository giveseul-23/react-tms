import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { ItineraryVehPop } from "./popup/ItineraryVehPop";
import { itineraryApi } from "./ItineraryApi";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_ITINERARY_CODE",
    field: "ITNR_ID",
    isPrimaryKey: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_ITINERARY_NAME",
    field: "ITNR_NM",
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    insertable: true,
    editable: true,
  },
  {
    type: "popuser",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    popupTitle: "LBL_VEHICLE_CODE",
    popupWidth: "2xl",
    renderPopup: ({ row, commit, close }) => (
      <ItineraryVehPop
        lgstGrpCd={String(row?.LGST_GRP_CD ?? "")}
        onApply={(picked) => {
          commit({
            VEH_ID: picked.VEH_ID,
            VEH_NO: picked.VEH_NO,
            CARR_CD: picked.CARR_CD,
            CARR_NM: picked.CARR_NM,
            DRVR_ID: picked.DRVR_ID,
            DRVR_NM: picked.DRVR_NM,
          });
          close();
        }}
        onClose={close}
      />
    ),
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },
  {
    type: "text",
    headerName: "LBL_ITNR_GRP_CD",
    field: "ITNR_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_ITNR_GRP_NM",
    field: "ITNR_GRP_NM",
  },
  {
    type: "popuser",
    headerName: "LBL_PLAN_ID",
    field: "PLN_ID",
    popupTitle: "LBL_PLAN_ID",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        sqlId="selectUsrPlanCodeName"
        extraParams={{
          keyParam: row?.LGST_GRP_CD ?? "",
        }}
        onApply={(picked: any) => {
          commit({
            PLN_ID: picked.CODE,
            PLN_NM: picked.NAME,
          });
          close();
        }}
        onClose={close}
      />
    ),
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_PLAN_NAME",
    field: "PLN_NM",
  },
  {
    type: "popuser",
    headerName: "LBL_DEPARTURE_CODE",
    field: "LOC_CD",
    popupTitle: "LBL_DEPARTURE_CODE",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        fetchFn={(params) =>
          itineraryApi.searchItineraryLocationPop({
            DIV_CD: row?.DIV_CD ?? "",
            code: params?.code ?? "",
            name: params?.name ?? "",
          })
        }
        onApply={(picked: any) => {
          commit({
            LOC_ID: picked.LOC_ID,
            LOC_CD: picked.CODE,
            LOC_NM: picked.NAME,
          });
          close();
        }}
        onClose={close}
      />
    ),
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DEPARTURE_NAME",
    field: "LOC_NM",
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "numeric",
    headerName: "LBL_STOP_SEQUENCE",
    field: "STOP_SEQ",
    insertable: true,
    editable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_CODE",
    field: "LOC_CD",
  },
  {
    type: "text",
    headerName: "LBL_DESTINATION_NAME",
    field: "LOC_NM",
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    insertable: true,
    editable: true,
  },
];
