import { Lang } from "@/app/services/common/Lang";
import { Button } from "@/app/components/ui/button";
import { standardAudit } from "@/app/components/grid/columns/commonColumns";

export const MAIN_COLUMN_DEFS = (
  setGridData?: (updater: any) => void,
  onUpload?: (row: any) => void,
) => {
  const columns: any[] = [
    {
      headerName: "No",
    },
    {
      type: "combo",
      headerName: "LBL_FLAT_FORM",
      field: "PLATFORM",
      codeKey: "pltfrmTp",
      insertable: true,
      editable: false,
      width: 90,
    },
    {
      type: "text",
      headerName: "LBL_MBL_PCKG_NM",
      field: "PCKG_NM",
      editable: false,
      insertable: true,
    },
    {
      type: "text",
      headerName: "LBL_MBL_APP_CD",
      field: "VER_CD",
      editable: true,
      insertable: true,
    },
    {
      type: "text",
      headerName: "LBL_MBL_APP_VER",
      field: "VER_NM",
      editable: true,
      insertable: true,
      width: 90,
    },
    {
      type: "text",
      headerName: "LBL_URL_PATH",
      field: "DOWNURL",
      insertable: true,
      editable: false
    },
    {
      type: "text",
      headerName: "LBL_DESC",
      field: "RMK",
      insertable: true,
      editable: false,
    },
  ];

  if (onUpload) {
    columns.push({
      headerName: "",
      field: "__upload__",
      editable: false,
      insertable: false,
      filter: false,
      floatingFilter: false,
      sortable: false,
      width: 110,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      cellRenderer: (params: any) => (
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onUpload(params.data)}
          disabled={!params.data}
          className="h-7 min-w-[85px]"
        >
          {Lang.get("BTN_UPLOAD") || "Upload"}
        </Button>
      ),
    });
  }

  columns.push(...standardAudit(setGridData, {}));
  return columns;
};
