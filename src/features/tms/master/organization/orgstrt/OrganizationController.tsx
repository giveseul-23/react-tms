import { useCallback, useMemo, MutableRefObject} from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { OrganizationApi as api } from "./OrganizationApi";
import {
    makeAddAction,
    makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { OrganizationModel, GridKey } from "./OrganizationModel";

interface Args {
  model: OrganizationModel;
}
const MENU_CD = "MENU_ORGANIZATION_STRUCT";

export function useOrganizationController({
  model,
}: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {

      return api.getDivisionList({
        ...params,
      });
    },
    [model],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "sub01",
            fetch: (r) => api.getLogisticsList({
                DIV_CD: r.DIV_CD,
                CUST_CD: r.CUST_CD
            }),
          }
        ],
      ),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model],
  );
    const onAddMain = useCallback(() => {
        base.resetGrids(["sub01"]);
        base.addRow("main", {
        USE_YN: "Y"
        });
    }, [base]);

    const onSaveMain = useCallback(
      () =>
        base.saveGrid("main", (payload) =>
          api.saveDivision({
            ...payload,
            MENU_CD,
          }),
        ),
      [base],
    );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [model.filtersRef, model.grids.main.rows, onAddMain, onSaveMain],
  );

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) return;

    base.addRow("sub01", {
      DIV_CD: main.DIV_CD,
    });
  }, [base, model.grids.main]);

    const onSaveSub01 = useCallback(() =>
        base.saveGrid("sub01", (payload) =>
          api.saveLogistics({
            ...payload,
            MENU_CD,
          }),
        ),
      [base],
    );


    const sub01Actions: ActionItem[] = useMemo(() => [
        makeAddAction({ onClick: onAddSub01 }),
        makeSaveAction({ onClick: onSaveSub01 }),
    ],
    [model.filtersRef, model.grids.main.rows, onAddSub01, onSaveSub01],
  );

  return {
    fetchList,
    onMainGridClick,
    onSearchCallback,
    mainActions,
    sub01Actions
  };
}
