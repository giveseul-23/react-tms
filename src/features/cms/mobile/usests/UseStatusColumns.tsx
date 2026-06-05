const valueFrom = (field: string, aliases: string[] = []) => {
  return (params: any) => {
    const row = params?.data ?? {};
    const keys = [field, ...aliases];
    for (const key of keys) {
      const value = row?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return "";
  };
};

export const FILTER_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    width: 100,
    editable: false,
    insertable: false,
    valueGetter: valueFrom("USR_ID", ["USER_ID", "LOGIN_ID"]),
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    width: 100,
    editable: false,
    insertable: false,
    valueGetter: valueFrom("DRVR_NM", ["DRIVER_NM"]),
  },
  {
    type: "text",
    headerName: "LBL_VEH_LGST_GRP",
    field: "VEH_LGST_GRP",
    width: 120,
    align: "center",
    editable: false,
    insertable: false,
  },
];

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    width: 110,
    editable: false,
    insertable: false,
    valueGetter: valueFrom("USR_ID", ["USER_ID", "LOGIN_ID"]),
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    width: 90,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("DRVR_NM", ["DRIVER_NM", "USR_NM", "USER_NM"]),
  },
  {
    type: "combo",
    headerName: "LBL_LOGIN_STATUS",
    field: "LOGIN_STATUS",
    codeKey: "loginType",
    align: "left",
    width: 300,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_PLATFORM",
    field: "PLATFORM",
    width: 90,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_MBL_APP_VER",
    field: "VER_NM",
    width: 100,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("VER_NM", ["APP_VER", "MBL_APP_VER"]),
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_GAP",
    field: "VIEW_UPDATE_GAP",
    width: 130,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("VIEW_UPDATE_GAP", ["LAST_CONN_DTTM", "LATEST_CONN_DTTM"]),
  },
  {
    type: "combo",
    headerName: "MBL_LOGIN_HISTORY",
    field: "MBL_STS",
    codeKey: "stsType",
    align: "left",
    width: 360,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEH_LGST_GRP",
    field: "VEH_LGST_GRP",
    width: 120,
    align: "center",
    editable: false,
    insertable: false,
  },
];

export const CARRIER_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    width: 100,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("USR_ID", ["USER_ID", "LOGIN_ID"]),
  },
  {
    type: "text",
    headerName: "LBL_DRVR_NM",
    field: "DRVR_NM",
    width: 90,
    editable: false,
    insertable: false,
    valueGetter: valueFrom("DRVR_NM", ["DRIVER_NM", "USR_NM", "USER_NM"]),
  },
  {
    type: "combo",
    headerName: "LBL_LOGIN_STATUS",
    field: "LOGIN_STATUS",
    codeKey: "loginType",
    align: "left",
    width: 260,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_PLATFORM",
    field: "PLATFORM",
    width: 100,
    align: "center",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_MBL_APP_VER",
    field: "VER_NM",
    width: 100,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("VER_NM", ["APP_VER", "MBL_APP_VER"]),
  },
  {
    type: "text",
    headerName: "LBL_UPDATE_GAP",
    field: "VIEW_UPDATE_GAP",
    width: 130,
    align: "center",
    editable: false,
    insertable: false,
    valueGetter: valueFrom("VIEW_UPDATE_GAP", ["LAST_CONN_DTTM", "LATEST_CONN_DTTM"]),
  },
  {
    type: "combo",
    headerName: "MBL_LOGIN_HISTORY",
    field: "MBL_STS",
    codeKey: "stsType",
    align: "left",
    width: 360,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_VEH_LGST_GRP",
    field: "VEH_LGST_GRP",
    width: 120,
    align: "center",
    editable: false,
    insertable: false,
  },
];
