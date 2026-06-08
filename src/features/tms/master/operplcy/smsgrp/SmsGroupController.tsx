import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { smsGroupApi as api } from "./SmsGroupApi";
import type { SmsGroupModel, GridKey } from "./SmsGroupModel";
import { Lang } from "@/app/services/common/Lang";

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

  const onSaveMain = useCallback(
    () => base.saveGrid("main", api.save),
    [base],
  );

  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !main.SMS_GRP_CD) {
      base.alert(Lang.get("MSG_NO_SELECTED"));
      return;
    }
    base.addRow("detail", { SMS_GRP_CD: main.SMS_GRP_CD });
  }, [model.grids.main, base]);

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.saveDetail, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (m) => api.getSmsGroupDetailList({ SMS_GRP_CD: m.SMS_GRP_CD }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: () => base.addRow("main", { USE_YN: "Y" }) }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [base, onSaveMain],
  );
  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
    ],
    [onAddDetail, onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
