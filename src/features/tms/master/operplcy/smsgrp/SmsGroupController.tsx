import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { smsGroupApi as api } from "./SmsGroupApi";
import type { SmsGroupModel, GridKey } from "./SmsGroupModel";

interface Args {
  model: SmsGroupModel;
}

export function useSmsGroupController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getSmsGroupList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getSmsGroupDetailList({ SMS_GRP_CD: r.SMS_GRP_CD }),
        },
      ]),
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
    () => [makeAddAction(), makeSaveAction()],
    [],
  );
  const detailActions: ActionItem[] = useMemo(
    () => [makeAddAction(), makeSaveAction()],
    [],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
