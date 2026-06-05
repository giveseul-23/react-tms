import { standardAudit } from "@/app/components/grid/columns/commonColumns";

export const MAIN_COLUMN_DEFS = (setGridData?: (updater: any) => void) => [
  {
    headerName: "No",
  },
  {
    type: "text",
    headerName: "LBL_APPL_CD",
    field: "APPL_CD",
    editable: true,
    insertable: true,
    validators: { max: 20, required: true }
  },
  {
    type: "text",
    headerName: "LBL_APPL_NM",
    field: "APPL_NM",
    editable: true,
    insertable: true,
    validators: { max: 60, required: true }
  },
  {
    type: "combo",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    codeKey: "useYn",
    editable: true,
    insertable: true,
  },
  ...standardAudit(setGridData, { delete: false }),
];
