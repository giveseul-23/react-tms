import { standardAudit } from "@/app/components/grid/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  {
    type: "text",
    headerName: "LBL_MENU_CD",
    field: "MENUCODE",
    width: 160,
    cellRenderer: (p: any) =>
      p.data.isVirtualRoot ? (
        <span className="text-gray-400">-1</span>
      ) : (
        p.value
      ),
  },
  {
    type: "text",
    headerName: "LBL_MENU_NM",
    field: "MENUNAME",
    width: 160,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    type: "text",
    headerName: "LBL_APPL_CD",
    field: "APPLCODE",
    width: 200,
    codeKey: "codeList",
  },
  {
    type: "text",
    headerName: "LBL_MLT_LANG_KEY",
    field: "MSG_CD",
    width: 160,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    type: "text",
    headerName: "LBL_OLDER_MENU_PATH",
    field: "SUPERMENUCODE",
    width: 120,
    cellRenderer: (p: any) => {
      if (p.data.isVirtualRoot) return "";
      return p.value === "-1" ? (
        <span className="text-gray-400">-1</span>
      ) : (
        p.value
      );
    },
  },
  {
    type: "numeric",
    headerName: "LBL_ORDER_BY",
    field: "DSPLY_SEQ",
    width: 80,
    filter: false,
    floatingFilter: false,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    type: "text",
    headerName: "LBL_URL_PATH",
    field: "URL",
    minWidth: 200,
    flex: 1,
    editable: true,
    cellStyle: { color: "#555", fontSize: 10 },
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    width: 70,
    filter: false,
    floatingFilter: false,
    cellRenderer: (p: any) =>
      p.data.isVirtualRoot ? null : (
        <input
          type="checkbox"
          checked={p.value === "Y"}
          readOnly
          style={{ cursor: "default" }}
        />
      ),
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  {
    type: "numeric",
    headerName: "LBL_RSRC_CNT",
    field: "RSRC_CNT",
    width: 55,
    filter: false,
    floatingFilter: false,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  ...standardAudit(setGridData, {
    delete: false,
    rowStatus: true,
    insertPerson: false,
    insertDate: false,
    updatePerson: false,
    updateTime: false,
  }),
];
