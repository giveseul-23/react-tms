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

function canEditRoleAuthCell(
  row: any,
  selectedRoleType: string | null,
  field: string,
) {
  if (!row || row.rowStatus === "X") return false;
  const expectedType =
    ROLE_TYPE_TO_RESOURCE_TYPE[selectedRoleType ?? ""] ?? null;
  if (!expectedType) return false;
  if (String(row.RSRC_TP ?? "") !== expectedType) return false;
  if (selectedRoleType === "BUTTON") {
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
    width: 58,
    filter: false,
    floatingFilter: false,
    cellStyle: (params: any) =>
      canEditRoleAuthCell(params.data, selectedRoleType, field)
        ? { textAlign: "center" }
        : { textAlign: "center", backgroundColor: "#f3f4f6" },
    headerClass: "ag-header-center",
    cellRenderer: (params: any) => {
      const disabled = !canEditRoleAuthCell(
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
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    width: 150,
    editable: false,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_USER_NAME",
    field: "USR_NM",
    width: 150,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_PASSWORD",
    field: "PW",
    width: 100,
    editable: true,
    insertable: true,
    inputType: "password",
  },
  {
    type: "text",
    field: "TOOLTIP_TEST",
    hide: true,
  },
  {
    type: "numeric",
    headerName: "LBL_PWD_ERR_CNT",
    field: "PW_ERR_CNT",
    width: 120,
    editable: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_PWD_CHNG_DATE",
    field: "PW_UPD_DTTM",
    width: 140,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    width: 90,
    editable: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_VALID_START_DATE",
    field: "USE_STT_DT",
    width: 130,
    editable: true,
    insertable: true,
  },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
    width: 130,
    editable: true,
    insertable: true,
  },
  {
    type: "check",
    headerName: "LBL_VLD_CHK",
    field: "VLD_CHK",
    width: 90,
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_TIMEZONE",
    field: "USER_TZ",
    width: 160,
    codeKey: "timezoneStore",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_CUSTOMER",
    field: "CUST_CD",
    width: 120,
    codeKey: "custList",
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_GROUP",
    field: "CUST_GRP_CD",
    width: 120,
    editable: false,
    insertable: false,
  },
  {
    type: "check",
    headerName: "LBL_SSO_YN",
    field: "SSO_YN",
    width: 80,
    editable: false,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_TEL_NO",
    field: "TEL_NO",
    width: 120,
    hide: true,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_HP_NO",
    field: "MBL_PHN_NO",
    width: 130,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_EMAIL",
    field: "EMAIL_ADDR",
    width: 160,
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_DAY_TP",
    field: "DAY_TP",
    width: 100,
    codeKey: "dayType",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_DT_FRMT_TP",
    field: "DT_FRMT_TP",
    width: 120,
    codeKey: "dateFrmtType",
    editable: true,
    insertable: true,
  },
  {
    type: "combo",
    headerName: "LBL_TM_FRMT_TP",
    field: "TM_FRMT_TP",
    width: 120,
    codeKey: "timeFrmtType",
    editable: true,
    insertable: true,
  },
  {
    type: "numeric",
    headerName: "LBL_MAX_TAB_CNT",
    field: "MAX_TAB_CNT",
    width: 110,
    editable: true,
    insertable: true,
  },
  {
    type: "text",
    headerName: "LBL_USER_LOCALE",
    field: "LCL_CD",
    width: 100,
    editable: true,
    insertable: true,
  },
];

export const SUB01_COLUMN_DEFS = (setRowData?: (updater: any) => void) => [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_USER_ID",
    field: "USR_ID",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_NM",
    field: "USR_GRP_NM",
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_VALID_START_DATE",
    field: "USE_STT_DT",
    editable: false,
    insertable: false,
  },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
    editable: false,
    insertable: false,
  },
  ...makeAuditColumns({
    delete: true,
    deleteSetRowData: setRowData,
    rowStatus: true,
    insertPerson: true,
    insertDate: true,
  }),
];

export const SUB03_COLUMN_DEFS = [
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
    width: 120,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_RL_TP_NM",
    field: "RL_TP_NM",
    width: 160,
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_USR_GRP_CD",
    field: "USR_GRP_CD",
    width: 120,
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
          "LBL_DELETE",
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
      headerName: "LBL_USER_ID",
      field: "USR_ID",
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
