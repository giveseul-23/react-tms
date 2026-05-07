import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/commonActions";
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

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const mainActions = useMemo(() => [makeAddAction(), makeSaveAction()], []);
  const detailActions = useMemo(() => [makeAddAction(), makeSaveAction()], []);

  return {
    fetchList,
    handleSearch,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
