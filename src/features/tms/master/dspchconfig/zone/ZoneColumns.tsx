import { CommonPopup } from "@/app/components/popup/CommonPopup";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import { Lang } from "@/app/services/common/Lang";

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIVISION",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    isPrimaryKey: true,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_DIVISION",
    field: "DIV_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
  },
  {
    type: "text",
    headerName: "LBL_ZONE_CD",
    field: "ZN_CD",
    insertable: true,
    isPrimaryKey: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_ZONE_NM",
    field: "ZN_NM",
    editable: true,
    insertable: true,
    required: true,
  },
  {
    type: "popup",
    headerName: "LBL_COUNTRY_CODE",
    field: "CTRY_CD",
    sqlId: "selectCountryCodeName",
    popupTitle: "LBL_COUNTRY_CODE",
    editable: true,
    insertable: true,
    required: true,
  },
];

export const SUB02_COLUMN_DEFS = [
    { headerName: "No" },
    {
      type: "text",
      headerName: "LBL_DIVISION",
      field: "DIV_CD",
    },
    {
      type: "text",
      headerName: "LBL_LOGISTICS_GROUP_CODE",
      field: "LGST_GRP_CD",
    },
    {
      type: "text",
      headerName: "LBL_ZONE_CD",
      field: "ZN_CD",
    },
    {
      type: "text",
      headerName: "LBL_COUNTRY_CODE",
      field: "CTRY_CD",
      hide: true,
    },
    {
      type: "text",
      headerName: "LBL_ZIP_RNG_ID",
      field: "ZIP_RNG_ID",
      isPrimaryKey: true,
    },
    {
      type: "popuser",
      headerName: "LBL_STATE_CODE",
      field: "STT_CD",
      popupTitle: "LBL_STATE_CODE",
      editable: true,
      insertable: true,
      renderPopup: ({ row, commit, close }) => (
        <CommonPopup
          sqlId="selectStateCodeName"
          extraParams={{ keyParam: row?.CTRY_CD ?? "" }}
          onApply={(picked: any) => {
            commit({
              STT_CD: picked.CODE,
              STT_NM: picked.NAME,
              CTY_CD: "",
              CTY_NM: "",
            });
            close();
          }}
          onClose={close}
        />
      ),
    },
    {
      type: "text",
      headerName: "LBL_STATE_NAME",
      field: "STT_NM",
    },
    {
      type: "popuser",
      headerName: "LBL_CITY_CODE",
      field: "CTY_CD",
      popupTitle: "LBL_CITY_CODE",
      editable: true,
      insertable: true,
      renderPopup: ({ row, commit, close }) => {
        if (!String(row?.STT_CD ?? "").trim()) {
          return (
            <ConfirmModal
              type="check"
              title={Lang.get("TTL_CONFIRM")}
              description={Lang.get(
                "MSG_INPUT_PRE_CONDITIONS",
                Lang.get("LBL_STATE_CODE"),
              )}
              onClose={close}
            />
          );
        }
        return (
          <CommonPopup
            sqlId="selectCityCodeName"
            extraParams={{ keyParam: row?.STT_CD ?? "" }}
            onApply={(picked: any) => {
              commit({
                CTY_CD: picked.CODE,
                CTY_NM: picked.NAME,
              });
              close();
            }}
            onClose={close}
          />
        );
      },
    },
    {
      type: "text",
      headerName: "LBL_CITY_NAME",
      field: "CTY_NM",
    },
    {
      type: "text",
      headerName: "LBL_ZIP_FROM",
      field: "ZIP_FRM",
      editable: true,
      insertable: true,
    },
    {
      type: "text",
      headerName: "LBL_ZIP_TO",
      field: "ZIP_TO",
      editable: true,
      insertable: true,
    },
    {
      type: "text",
      headerName: "LBL_ZIP_REQ_YN",
      field: "CTRY_MSK_YN",
      hide: true,
    },
];

export const SUB03_COLUMN_DEFS = [
  { headerName: "No" },
  {
    field: "ZN_CD",
    hide: true
  },
  {
    field: "LOC_ID",
    hide: true, isPrimaryKey: true
  },
  {
    field: "DIV_CD",
    hide: true
  },
  {
    field: "LGST_GRP_CD",
    hide: true
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_ID",
    field: "LOC_CD",
  },
  {
    type: "text",
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
  },
  {
    type: "text",
    headerName: "LBL_DETAIL_ADDRESS",
    field: "DTL_ADDR1",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CITY_NAME",
    field: "CTY_NM",
  },
  {
    type: "text",
    headerName: "LBL_STATE",
    field: "STT_NM",
  },
  {
    type: "text",
    headerName: "LBL_COUNTRY_NAME",
    field: "CTRY_NM",
  },
];
