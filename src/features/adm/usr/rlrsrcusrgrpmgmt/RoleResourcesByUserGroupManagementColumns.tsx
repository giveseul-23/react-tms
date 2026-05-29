import React from "react";
import { makeAuditColumns } from "@/app/components/grid/columns/commonColumns";

export const AUTH_COLUMN_SPECS = [
  { field: "S_COLUMN", label: "BTN_SEARCH" },
  { field: "E_COLUMN", label: "BTN_EXCEL" },
  { field: "C_COLUMN", label: "BTN_SAVE" },
  { field: "U_COLUMN", label: "LBL_UPDATE" },
  { field: "D_COLUMN", label: "LBL_DELETE" },
  { field: "P_COLUMN", label: "BTN_PRINT" },
  { field: "I_COLUMN", label: "BTN_ADD" },
] as const;

const ROLE_TYPE_TO_RESOURCE_TYPE: Record<string, string> = {
  MENU: "10",
  GRID: "20",
  FORM: "30",
  BUTTON: "40",
};

const isChecked = (value: unknown) => value === true || value === "Y";

function canEditAuthCell(row: any, selectedRoleType: string | null, field: string) {
  if (!row || row.rowStatus === "X") return false;

  const expectedType =
    ROLE_TYPE_TO_RESOURCE_TYPE[String(selectedRoleType ?? "").toUpperCase()] ?? null;
  if (!expectedType) return false;
  if (String(row.RSRC_TP ?? "") !== expectedType) return false;

  if (selectedRoleType === "BUTTON" || selectedRoleType === "MENU") {
    return field === AUTH_COLUMN_SPECS[0].field || field === "DEL_AUTH_INFO";
  }

  return true;
}

function makeCheckboxColumn(
  field: string,
  headerName: string,
  setRoleTreeRows: (updater: any) => void,
  selectedRoleType: string | null,
) {
  const noLang =
    !headerName.startsWith("LBL_") && !headerName.startsWith("BTN_");

  return {
    type: "text",
    headerName,
    noLang,
    field,
    width: field === "AUTH_TOTAL" ? 65 : field === "DEL_AUTH_INFO" ? 80 : 50,
    filter: false,
    floatingFilter: false,
    cellStyle: (params: any) =>
      canEditAuthCell(params.data, selectedRoleType, field)
        ? { textAlign: "center" }
        : { textAlign: "center", backgroundColor: "#f3f4f6" },
    headerClass: "ag-header-center",
    cellRenderer: (params: any) => {
      const disabled = !canEditAuthCell(
        params.data,
        selectedRoleType,
        field,
      );
      const checked = isChecked(params.value);

      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            disabled={disabled}
            checked={checked}
            onChange={() => {
              if (disabled) return;

              if (field === "AUTH_TOTAL") {
                const next = checked ? "N" : "Y";
                setRoleTreeRows((prev: any[]) =>
                  prev.map((row) =>
                    row.__rid__ !== params.data.__rid__
                      ? row
                      : {
                          ...row,
                          AUTH_TOTAL: next,
                          ...Object.fromEntries(
                            AUTH_COLUMN_SPECS.map((spec) => [spec.field, next]),
                          ),
                          EDIT_STS: row.EDIT_STS === "I" ? "I" : "U",
                        },
                  ),
                );
                return;
              }

              const next = checked ? "N" : "Y";
              setRoleTreeRows((prev: any[]) =>
                prev.map((row) => {
                  if (row.__rid__ !== params.data.__rid__) return row;
                  const updated = {
                    ...row,
                    [field]: next,
                    EDIT_STS: row.EDIT_STS === "I" ? "I" : "U",
                  };
                  const authValues = AUTH_COLUMN_SPECS.map((spec) =>
                    spec.field === field ? next : updated[spec.field],
                  );
                  updated.AUTH_TOTAL = authValues.every(isChecked) ? "Y" : "N";
                  return updated;
                }),
              );
            }}
          />
        </div>
      );
    },
  };
}

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: false,
    flex: 1,
    minWidth: 120,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_NM",
    field: "USR_GRP_NM",
    editable: false,
    insertable: false,
    flex: 1,
    minWidth: 120,    
  },
];

export const SUB01_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_RL_CD",
    field: "RL_CD",
    width: 150,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_NM",
    field: "RL_NM",
    width: 200,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_TP_CD",
    field: "RL_TP_CD",
    width: 150,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_TP_NM",
    field: "RL_TP_NM",
    width: 200,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    width: 150,
    editable: false,
    insertable: false,
  },
];

export function makeRoleTreeColumnDefs(
  setRoleTreeRows: (updater: any) => void,
  selectedRoleType: string | null,
) {
  return [
    {
      type: "text",
      headerName: "LBL_RSRC_DESC",
      field: "RSRC_DESC",
      width: 220,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_MENU_NM",
      field: "MSG_DESC",
      width: 120,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_RL_CNFG_VAL",
      children: [
        makeCheckboxColumn(
          "AUTH_TOTAL",
          "LBL_TOTAL",
          setRoleTreeRows,
          selectedRoleType,
        ),
        ...AUTH_COLUMN_SPECS.map((spec) =>
          makeCheckboxColumn(
            spec.field,
            spec.label,
            setRoleTreeRows,
            selectedRoleType,
          ),
        ),
        makeCheckboxColumn(
          "DEL_AUTH_INFO",
          "LBL_AUTH_INFO_DEL",
          setRoleTreeRows,
          selectedRoleType,
        ),
      ],
    },
    {
      type: "text",
      headerName: "LBL_RL_CNFG_VAL",
      field: "RL_CNFG_VAL",
      hide: true,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_RSRC_TP",
      field: "RSRC_TP",
      hide: true,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_PRNT_RSRC_ID",
      field: "PRNT_RSRC_ID",
      hide: true,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_USR_GRP_CD",
      field: "USR_GRP_CD",
      hide: true,
      editable: false,
      insertable: false,
    },
    {
      type: "text",
      headerName: "LBL_RL_CD",
      field: "RL_CD",
      hide: true,
      editable: false,
      insertable: false,
    },
    ...makeAuditColumns({
      rowStatus: true,
      insertPerson: true,
      insertDate: true,
    }),
  ];
}
