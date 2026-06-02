import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { logisticGroupDefaultApi as api } from "./LogisticGroupDefaultApi";
import {
  CNFG_HEADER_COLUMN_DEFS,
  CNFG_DETAIL_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./LogisticGroupDefaultColumns";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  LogisticGroupDefaultModel,
  GridKey,
} from "./LogisticGroupDefaultModel";

import { MENU_CODE } from "./LogisticGroupDefault";
import { Lang } from "@/app/services/common/Lang";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";

import LgstSyncPopup from "./popup/LgstSyncPopup";

interface Args {
  model: LogisticGroupDefaultModel;
}

export function useLogisticGroupDefaultController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getLgstDefaultCnfgGrpList(params),
    [],
  );

  // header 클릭 → subCnfg fetch (detail alsoReset)
  const onHeaderGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "header",
        row,
        [
          {
            to: "subCnfg",
            fetch: (r) =>
              api.getLgstDefaultCnfgList({
                LGST_GRP_CNFG_GRP_CD: r.LGST_GRP_CNFG_GRP_CD,
              }),
          },
        ],
        { alsoReset: ["detail"] },
      ),
    [base],
  );

  // subCnfg 클릭 → detail fetch
  const onSubCnfgGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("subCnfg", row, [
        {
          to: "detail",
          fetch: (r) => api.getLgstDefaultDetailList({ CNFG_CD: r.CNFG_CD }),
        },
      ]),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.header.setData(data);
      onHeaderGridClick(data?.rows?.[0]);
    },
    [model.grids.header, onHeaderGridClick],
  );

  // ── Save ──────────────────────────────────────────────────────
  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "subCnfg",
          fetch: (main) =>
            api.getLgstDefaultDetailList({ CNFG_CD: main.CNFG_CD }),
        },
      }),
    [base],
  );

  const syncConfig = useCallback(
    () =>
      base
        .callAjax(api.syncConfig({}), Lang.get("MSG_CMPLT_SYNC"))
        .then(() => base.search()),
    [base],
  );

  const headerActions: ActionItem[] = useMemo(
    () => [
      {
        //todo : popup
        type: "button",
        key: "LBL_SYNC",
        label: "LBL_SYNC",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          openPopup({
            title: "LBL_SYNC",
            content: (
              <LgstSyncPopup
                onConfirm={(payload: any) => {
                  closePopup();
                  base
                    .callAjax(api.syncConfig(payload), Lang.get("MSG_CMPLT_SYNC"))
                    .then(() => base.search());
                }}
                onClose={closePopup}
              />
            ),
            width: "full",
          });
        },
      },
      makeExcelGroupAction({
        columns: CNFG_HEADER_COLUMN_DEFS,
        menuName: Lang.get(MENU_CODE),
        fetchFn: () => api.getLgstDefaultCnfgGrpList(model.filtersRef.current),
        rows: model.grids.header.rows,
      }),
    ],
    [model.filtersRef, model.grids.header.rows, syncConfig],
  );

  const subCnfgActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        columns: CNFG_DETAIL_COLUMN_DEFS,
        menuName: Lang.get(MENU_CODE),
        fetchFn: () => api.getLgstDefaultCnfgList(model.filtersRef.current),
        rows: model.grids.header.rows,
      }),
    ],
    [model.filtersRef, model.grids.header.rows],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        columns: DETAIL_COLUMN_DEFS,
        menuName: Lang.get(MENU_CODE),
        fetchFn: () => api.getLgstDefaultDetailList(model.filtersRef.current),
        rows: model.grids.header.rows,
      }),
    ],
    [model.filtersRef, model.grids.header.rows, onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onHeaderGridClick,
    onSubCnfgGridClick,
    headerActions,
    subCnfgActions,
    detailActions,
  };
}
