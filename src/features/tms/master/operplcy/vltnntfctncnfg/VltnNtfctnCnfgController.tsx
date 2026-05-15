import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { vltnNtfctnCnfgApi as api } from "./VltnNtfctnCnfgApi";
import { NTFC_TARGET_COLUMN_DEFS } from "./VltnNtfctnCnfgColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VltnNtfctnCnfgModel, GridKey } from "./VltnNtfctnCnfgModel";

interface Args {
  model: VltnNtfctnCnfgModel;
}

export function useVltnNtfctnCnfgController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getVltnNtfctnCnfgList(params),
    [],
  );

  // detail 클릭 → channel + target 동시 fetch
  const onDetailGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("detail", row, [
        {
          to: "channel",
          fetch: (r) =>
            api.getVltnNtfctnCnfgChannelList({
              VLTN_NTFCTN_CNFG_ID: r.VLTN_NTFCTN_CNFG_ID,
            }),
        },
        {
          to: "target",
          fetch: (r) =>
            api.getVltnNtfctnCnfgTargetList({
              VLTN_NTFCTN_CNFG_ID: r.VLTN_NTFCTN_CNFG_ID,
            }),
        },
      ]),
    [base],
  );

  // main 클릭 → detail fetch + channel/target 도 alsoReset
  const onMainGridClick = useCallback(
    (row: any) =>
      base
        .handleRowClick(
          "main",
          row,
          [
            {
              to: "detail",
              fetch: (r) =>
                api.getVltnNtfctnCnfgDetailList({
                  LGST_GRP_CD: r.LGST_GRP_CD,
                }),
            },
          ],
          { alsoReset: ["channel", "target"] },
        ),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BUTTON_COPY_CONTRACT",
        label: "BUTTON_COPY_CONTRACT",
        onClick: () => {},
      },
      makeSaveAction(),
    ],
    [],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_TEMPLATE_COPY",
        label: "BTN_TEMPLATE_COPY",
        onClick: () => {},
      },
      makeAddAction(),
      makeSaveAction(),
    ],
    [],
  );

  const channelActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_TEMPLATE_UPDATE",
        label: "BTN_TEMPLATE_UPDATE",
        onClick: () => {},
      },
      makeAddAction(),
      makeSaveAction(),
    ],
    [],
  );

  const targetActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_USR_REGI",
        label: "LBL_USR_REGI",
        onClick: () => {},
      },
      makeAddAction(),
      makeSaveAction(),
      makeExcelGroupAction({
        columns: NTFC_TARGET_COLUMN_DEFS,
        menuName: "위반알림설정관리",
        fetchFn: () => api.getVltnNtfctnCnfgList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onDetailGridClick,
    mainActions,
    detailActions,
    channelActions,
    targetActions,
  };
}
