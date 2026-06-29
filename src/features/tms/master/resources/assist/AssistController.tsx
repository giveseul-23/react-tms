import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

import { assistApi as api } from "./AssistApi";
import { MENU_CODE, AUTH } from "./Assist";
import LogisticsPop from "./popup/LogisticsPop";
import type { AssistModel, GridKey } from "./AssistModel";

interface Args {
  model: AssistModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useAssistController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // ── 소속(sub01) 조회 — ASST_ID 기준 ──────────────────────────────
  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow?.ASST_ID || mainRow.EDIT_STS === ROW_STATUS.INSERT) {
      return EMPTY_RESULT;
    }
    return api.getAssistLogisticsList({ ASST_ID: mainRow.ASST_ID });
  }, []);

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [{ to: "sub01", fetch: fetchSub01 }]),
    [base, fetchSub01],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 추가/저장 ────────────────────────────────────────────────
  const onAddMain = useCallback(() => {
    base.addRow("main", {});
  }, [base]);

  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.save),
    [base],
  );

  // ── 소속(sub01) 추가/저장 ─────────────────────────────────────────
  const onAddLogist = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_HELPER_NAME"))) return;
    base.addRow("sub01", { ASST_ID: main.ASST_ID });
  }, [base, model.grids.main.selectedRef]);

  const onSaveLogist = useCallback(
    () =>
      base.saveGrid("sub01", api.saveAsstLgstGrp, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => fetchSub01(main),
        },
      }),
    [base, fetchSub01],
  );

  // ── 소속등록 / 소속등록취소 (다건) — 물류운영그룹 선택 팝업 ────────
  const openRegiAffi = useCallback(
    (mainRows: any[], cancel: boolean) => {
      const rows = mainRows ?? [];
      if (!rows.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      openPopup({
        title: "LBL_REGI_AFFI",
        width: "2xl",
        content: (
          <LogisticsPop
            onConfirm={(payload) => {
              closePopup();
              const logiArray = (
                Array.isArray(payload) ? payload : [payload]
              ).map((p: any) => ({
                LGST_GRP_CD: p.LGST_GRP_CD,
                LGST_GRP_NM: p.LGST_GRP_NM,
              }));
              const dsSave = rows.map((r) => ({
                ...r,
                EDIT_STS: ROW_STATUS.UPDATE,
                LOGIARRAY: logiArray,
              }));
              const apiFn = cancel ? api.onRegiAffiCancle : api.onRegiAffi;
              void base.callAjax(apiFn(dsSave), { mask: "main" }).then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, openPopup, closePopup],
  );

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_REGI_AFFI",
        label: "LBL_REGI_AFFI",
        onClick: ({ data }: { data: any[] }) => openRegiAffi(data, false),
      },
      {
        type: "button",
        key: "LBL_REGI_AFFI_CANCEL",
        label: "LBL_REGI_AFFI_CANCEL",
        onClick: ({ data }: { data: any[] }) => openRegiAffi(data, true),
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main, fileName: menuName },
      }),
    ],
    [base, menuName, model.grids.main, model.filtersRef, onAddMain, onSaveMain, openRegiAffi],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddLogist }),
      makeSaveAction({ onClick: onSaveLogist }),
    ],
    [onAddLogist, onSaveLogist],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    sub01Actions,
  };
}
