// src/views/menu/MenuConfigColumns.tsx

export const MAIN_COLUMN_DEFS = () => [
  {
    headerName: "메뉴코드 *",
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
    headerName: "메뉴명 *",
    field: "MENUNAME",
    width: 160,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    headerName: "응용프로그램",
    field: "APPLNAME",
    width: 200,
    cellRenderer: (p: any) =>
      p.data.isVirtualRoot ? (
        <span className="font-semibold">{p.value}</span>
      ) : (
        p.value
      ),
  },
  {
    headerName: "메뉴명 다국어키 *",
    field: "MSG_CD",
    width: 160,
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    headerName: "상위 메뉴 경로",
    field: "PARANT_MENU_CD",
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
    headerName: "정렬순서",
    field: "DSPLY_SEQ",
    width: 80,
    filter: false,
    floatingFilter: false,
    cellStyle: { textAlign: "right" },
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    headerName: "URL",
    field: "URL",
    minWidth: 200,
    flex: 1,
    cellStyle: { color: "#555", fontSize: 10 },
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
  {
    headerName: "사용여부",
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
    headerName: "소스",
    field: "RSRC_CNT",
    width: 55,
    filter: false,
    floatingFilter: false,
    cellStyle: { textAlign: "right" },
    cellRenderer: (p: any) => (p.data.isVirtualRoot ? "" : p.value),
  },
];
