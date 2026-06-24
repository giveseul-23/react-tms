import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { hipassFareManagementApi as api } from "./HipassFareManagementApi";
import { MENU_CODE, AUTH } from "./HipassFareManagement";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { HipassFareManagementModel, GridKey } from "./HipassFareManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: HipassFareManagementModel;
}

export function useHipassFareManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getMainList(params),
    [],
  );

  // 선택 행 기준 상세(sub01) 조회
  const fetchDetail = useCallback(
    (row: any) =>
      api.getDetailList({ HIPASS_AP_ID: row?.HIPASS_AP_ID }),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [{ to: "sub01", fetch: fetchDetail }]),
    [base, fetchDetail],
  );

  // ── 조회 콜백 — 메인 set 후 첫 행 상세 조회 ───────────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 상태 검증 (서버 checkValidStatus) ─────────────────────────────
  // confirm: 4010 만 / confirmCancel: 4015 만 / cancel: 4015 미만
  const checkValidStatus = useCallback(
    (rows: any[], step: "confirm" | "confirmCancel" | "cancel") => {
      const map = {
        confirm: { status: "4010", msg: "MSG_NOT_VALID_HIPASS_CONFIRM_STATUS" },
        confirmCancel: { status: "4015", msg: "MSG_NOT_VALID_HIPASS_CONFIRM_CANCEL_STATUS" },
        cancel: { status: "4015", msg: "MSG_NOT_VALID_HIPASS_CANCEL_STATUS" },
      } as const;
      const { status, msg } = map[step];
      const valid = rows.every((r) =>
        step === "cancel"
          ? String(r.HIPASS_FI_STS) < status
          : String(r.HIPASS_FI_STS) === status,
      );
      if (!valid) base.alert(Lang.get(msg));
      return valid;
    },
    [base],
  );

  // ── 선택 행 저장 공용 (확정/확정취소/취소) ────────────────────────
  const saveSelected = useCallback(
    (
      selected: any[],
      apiFn: (payload: any) => Promise<any>,
      step: "confirm" | "confirmCancel" | "cancel",
    ) => {
      const list = selected ?? [];
      if (!list.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      if (!checkValidStatus(list, step)) return;
      const dsSave = toDsSave(
        list.map((r) => ({ ...r, EDIT_STS: ROW_STATUS.UPDATE })),
      );
      void base.callAjax(apiFn({ dsSave }), { mask: "main" }).then(() => base.search());
    },
    [base, checkValidStatus],
  );

  // ── 메인 그리드 액션 ──────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "CONFIRM",
        label: "CONFIRM",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.updateToConfirm, "confirm"),
      },
      {
        type: "button",
        key: "CONFIRM_CANCEL",
        label: "CONFIRM_CANCEL",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.updateToConfirmCancel, "confirmCancel"),
      },
      {
        type: "button",
        key: "BTN_CANCEL",
        label: "BTN_CANCEL",
        onClick: ({ data }: { data: any[] }) =>
          saveSelected(data, api.updateToCancel, "cancel"),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getMainList(model.filtersRef.current),
        rows: model.grids.main.rows,
        upload: {
          gridId: AUTH.grids.main,
          onUploaded: () => base.search(),
        },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, base, saveSelected],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
