import { CommonPopup } from "@/app/components/popup/CommonPopup";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "popuser",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    popupTitle: "LBL_DIVISION_CODE",
    renderPopup: ({ commit, close }) => (
      <CommonPopup
        sqlId="selectDivisionCodeName"
        onApply={(picked: any) => {
          commit({
            DIV_CD: picked.CODE,
            DIV_NM: picked.NAME,
            LGST_GRP_CD: "",
            LGST_GRP_NM: "",
            FRM_ZN_CD: "",
            FRM_ZN_NM: "",
            TO_ZN_CD: "",
            TO_ZN_NM: "",
            VEH_ID: "",
            VEH_NO: "",
            CARR_CD: "",
            CARR_NM: "",
          });
          close();
        }}
        onClose={close}
      />
    ),
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
  },
  {
    type: "popuser",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    popupTitle: "LBL_LOGISTICS_GROUP_CODE",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        sqlId="selectLogisticsgroupCodeName"
        extraParams={{ keyParam: row?.DIV_CD ?? "" }}
        onApply={(picked: any) => {
          commit({
            LGST_GRP_CD: picked.CODE,
            LGST_GRP_NM: picked.NAME,
            FRM_ZN_CD: "",
            FRM_ZN_NM: "",
            TO_ZN_CD: "",
            TO_ZN_NM: "",
            VEH_ID: "",
            VEH_NO: "",
            CARR_CD: "",
            CARR_NM: "",
          });
          close();
        }}
        onClose={close}
      />
    ),
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
  {
    type: "text",
    headerName: "LBL_QTY_ITNR_CD",
    field: "QTY_ITNR_ID",
    isPrimaryKey: true,
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_QTY_ITNR_NM",
    field: "QTY_ITNR_NM",
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
  { // 차량팝업으로 수정 필요
    type: "popuser",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    popupTitle: "LBL_VEHICLE_CODE",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        sqlId="selectVehicleCodeName"
        extraParams={{ sqlParam1: row?.LGST_GRP_CD ?? "" }}
        onApply={(picked: any) => {
          commit({
            VEH_ID: picked.CODE,
            VEH_NO: picked.NAME,
            // CARR_CD: picked.CARR_CD, 
            // CARR_NM: picked.CARR_NM,
          });
          close();
        }}
        onClose={close}
      />
    ),
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
  },
  {
    type: "text",
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
  },
  {
    type: "popuser",
    headerName: "LBL_FROM_ZONE_CD",
    field: "FRM_ZN_CD",
    popupTitle: "LBL_FROM_ZONE_CD",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        sqlId="selectZoneCodeName"
        extraParams={{
          sqlParam1: row?.DIV_CD ?? "",
          sqlParam2: row?.LGST_GRP_CD ?? "",
        }}
        onApply={(picked: any) => {
          commit({
            FRM_ZN_CD: picked.CODE,
            FRM_ZN_NM: picked.NAME,
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
    headerName: "LBL_FROM_ZONE_NM",
    field: "FRM_ZN_NM",
  },
  {
    type: "popuser",
    headerName: "LBL_TO_ZONE_CD",
    field: "TO_ZN_CD",
    popupTitle: "LBL_TO_ZONE_CD",
    renderPopup: ({ row, commit, close }) => (
      <CommonPopup
        sqlId="selectZoneCodeName"
        extraParams={{
          sqlParam1: row?.DIV_CD ?? "",
          sqlParam2: row?.LGST_GRP_CD ?? "",
        }}
        onApply={(picked: any) => {
          commit({
            TO_ZN_CD: picked.CODE,
            TO_ZN_NM: picked.NAME,
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
    headerName: "LBL_TO_ZONE_NM",
    field: "TO_ZN_NM",
  },
];
