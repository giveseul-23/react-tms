import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { carrierByLogisticApi as api } from "./CarrierByLogisticApi";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { CarrierByLogisticModel, GridKey } from "./CarrierByLogisticModel";
import { MENU_CODE } from "./CarrierByLogistic";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: CarrierByLogisticModel;
}

export function useCarrierByLogisticController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = model.rawFiltersRef.current;
      const divCd = srchObj["SRCH_DIV_CD"];
      const lgstGrpCd = srchObj["SRCH_LGST_GRP_CD"];

      return api.getLogisticsList({
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
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
            fetch: (r) =>
              api.getLogisticCarrierInfoList({
                DIV_CD: r.DIV_CD,
                LGST_GRP_CD: r.LGST_GRP_CD,
              }),
          },
        ],
        { alsoReset: ["sub02"] },
      ),
    [base],
  );

  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub01", row, [
        {
          to: "sub02",
          fetch: (r) =>
            api.getLogisticCarrierDetailInfoList({
              LGST_GRP_CD: r.LGST_GRP_CD,
              CARR_CD: r.CARR_CD,
            }),
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

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "물류운영그룹코드")) return;
    base.resetGrids(["sub02"]);
    base.addRow("sub01", {
      DIV_CD: main.DIV_CD,
      LGST_GRP_CD: main.LGST_GRP_CD,
      CARR_CD: "",
      DSPCH_AP_FRM_DAY_ADJ: 0,
      DSPCH_AP_TO_DAY_ADJ: 0,
      USE_YN: "Y",
    });
  }, [model, base]);

  const onAddSub02 = useCallback(() => {
    const sub01 = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(sub01, "운송협력사코드")) return;
    base.addRow("sub02", {
      DIV_CD: sub01.DIV_CD,
      LGST_GRP_CD: sub01.LGST_GRP_CD,
      CARR_CD: sub01.CARR_CD,
    });
  }, [model, base]);

  const fetchSub01 = useCallback(
    (row: any) =>
      api.getLogisticCarrierInfoList({
        DIV_CD: row.DIV_CD,
        LGST_GRP_CD: row.LGST_GRP_CD,
      }),
    [],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid(
        "sub01",
        (payload) =>
          api.saveLogisticCarrierInfo({
            ...payload,
            MENU_CD: MENU_CODE,
          }),
        {
          afterSave: {
            cascadeFrom: "main",
            fetch: (main) => fetchSub01(main),
          },
        },
      ),
    [base, fetchSub01],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
    ],
    [onAddSub01, onSaveSub01],
  );

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", api.saveLogisticCarrierDetail, {
        afterSave: {
          cascadeFrom: "sub01",
          fetch: (sub01) =>
            api.getLogisticCarrierDetailInfoList({
              LGST_GRP_CD: sub01.LGST_GRP_CD,
              CARR_CD: sub01.CARR_CD,
            }),
        },
      }),
    [base],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub02 }),
      makeSaveAction({ onClick: onSaveSub02 }),
    ],
    [onAddSub02, onSaveSub02],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getLogisticsList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    sub01Actions,
    sub02Actions,
    mainActions,
  };
}
