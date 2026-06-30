// 컬럼 끝의 standardAudit 은 DataGrid 가 audit prop(model.bind 자동) 으로 추가.
// popuser — LGST_GRP_CD 는 행 값 우선, 없으면 조회조건 SRCH_PLN_LGST_GRP_CD (센차 keyParmField).

import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { userPlanApi } from "./UserPlanApi";

const mapPopupRows = (res: any, codeField: string, nameField: string) => {
  const rows =
    res?.data?.data?.dsOut ??
    res?.data?.result ??
    res?.data?.rows ??
    res?.data?.data ??
    [];

  return {
    ...res,
    data: {
      ...res?.data,
      data: {
        ...(res?.data?.data ?? {}),
        dsOut: rows.map((row: any) => ({
          ...row,
          CODE: row?.[codeField] ?? "",
          NAME: row?.[nameField] ?? "",
        })),
      },
    },
  };
};

/** 승인된사용자 — 동일 USR_ID 중복 제거 */
const dedupeByUsrId = (rows: any[]) => {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = String(row?.USR_ID ?? "").trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const resolveLgstGrpCd = (row: any, getLgstGrpCd: () => string) =>
  String(row?.LGST_GRP_CD ?? getLgstGrpCd() ?? "").trim();

export function MAIN_COLUMN_DEFS(getLgstGrpCd: () => string): any[] {
  return [
    { headerName: "No" },
    {
      type: "popuser",
      headerName: "LBL_AUTHORIZED_USER",
      field: "USR_ID",
      insertable: true,
      required: true,
      popupTitle: "LBL_AUTHORIZED_USER",
      renderPopup: ({ row, commit, close }: any) => (
        <CommonPopup
          fetchFn={(params: any) =>
            userPlanApi
              .searchApprovedUser({
                USR_ID: params?.code ?? "",
                USR_NM: params?.name ?? "",
                LGST_GRP_CD: resolveLgstGrpCd(row, getLgstGrpCd),
              })
              .then((res: any) => {
                const raw =
                  res?.data?.data?.dsOut ??
                  res?.data?.result ??
                  res?.data?.rows ??
                  [];
                return mapPopupRows(
                  {
                    ...res,
                    data: {
                      ...res?.data,
                      data: { dsOut: dedupeByUsrId(raw) },
                    },
                  },
                  "USR_ID",
                  "USR_NM",
                );
              })
          }
          onApply={(picked: any) => {
            commit({
              USR_ID: picked?.USR_ID ?? picked?.CODE,
              USR_NM: picked?.USR_NM ?? picked?.NAME,
              USR_TP: picked?.USR_TP,
            });
            close();
          }}
          onClose={close}
        />
      ),
    },
    {
      type: "text",
      headerName: "LBL_AUTHORIZED_USER_NAME",
      field: "USR_NM",
    },
    {
      type: "popuser",
      headerName: "LBL_PLAN_ID",
      field: "PLN_ID",
      insertable: true,
      required: true,
      popupTitle: "LBL_PLAN_ID",
      renderPopup: ({ row, commit, close }: any) => (
        <CommonPopup
          fetchFn={(params: any) =>
            userPlanApi
              .searchPlanId({
                PLN_ID: params?.code ?? "",
                PLN_NM: params?.name ?? "",
                LGST_GRP_CD: resolveLgstGrpCd(row, getLgstGrpCd),
              })
              .then((res: any) => mapPopupRows(res, "PLN_ID", "PLN_NM"))
          }
          onApply={(picked: any) => {
            commit({
              PLN_ID: picked?.PLN_ID ?? picked?.CODE,
              PLN_NM: picked?.PLN_NM ?? picked?.NAME,
            });
            close();
          }}
          onClose={close}
        />
      ),
    },
    {
      type: "text",
      headerName: "LBL_PLAN_NAME",
      field: "PLN_NM",
    },
    {
      type: "text",
      headerName: "LBL_LOGISTICS_GROUP_CODE",
      field: "LGST_GRP_CD",
      hide: true,
    },
    {
      type: "text",
      headerName: "USR_TP",
      field: "USR_TP",
      hide: true,
    },
    {
      type: "check",
      headerName: "LBL_DEFAULT",
      field: "DFT_YN",
      insertable: true,
      editable: true,
      singleMode: true,
    },
  ];
}
