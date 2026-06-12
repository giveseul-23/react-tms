import { useCallback, useMemo, MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { oilPriceApi as api } from "./OilPriceApi";
import { MENU_CODE } from "./OilPrice";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { OilPriceModel, GridKey } from "./OilPriceModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";

interface Args {
  model: OilPriceModel;
  activeTabRef: MutableRefObject<string>;
}

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");

function buildSearchParams(
  model: OilPriceModel,
  params: Record<string, unknown> = {},
) {
  const srch = model.rawFiltersRef.current ?? {};
  return {
    ...params,
    LGST_GRP_CD: srch.SRCH_LGST_GRP_CD,
    SEARCH_FRM_DTTM: srch.SRCH_SEARCH_FRM_DTTM,
    SEARCH_FRM_DTTM_FRM: srch.SRCH_SEARCH_FRM_DTTM_FRM,
    SEARCH_FRM_DTTM_TO: srch.SRCH_SEARCH_FRM_DTTM_TO,
  };
}

export function useOilPriceController({ model, activeTabRef }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const merged = buildSearchParams(model, params);
      if (activeTabRef.current === "MONTH") {
        return api.getMonth(merged);
      }
      return api.getList(merged);
    },
    [model, activeTabRef],
  );

  const fetchDfOil = useCallback(
    (row: any) =>
      api.getDfOil({
        LGST_GRP_CD: row.LGST_GRP_CD,
      }),
    [],
  );

  const onMasterRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("master", row, [
        {
          to: "dfOil",
          fetch: fetchDfOil,
        },
      ]),
    [base, fetchDfOil],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      if (activeTabRef.current === "MONTH") {
        model.grids.month.setData(data);
        return;
      }
      model.grids.master.setData(data);
      onMasterRowClicked(data?.rows?.[0]);
    },
    [model, activeTabRef, onMasterRowClicked],
  );

  const handleDfOilAdd = useCallback(() => {
    const main = model.grids.master.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    base.addRow("dfOil", {
      LGST_GRP_CD: main.LGST_GRP_CD,
      LGST_GRP_NM: main.LGST_GRP_NM,
    });
  }, [model, base]);

  const handleDfOilSave = useCallback(
    () =>
      base.saveGrid("dfOil", api.saveDfOil, {
        beforeSave: () => {
          const rows = model.grids.dfOil.rows ?? [];
          if (
            rows.some((r: any) => {
              if (r.EDIT_STS === "D" || r.delStatus === true) return false;
              if (!r.FRM_DTTM || !r.TO_DTTM) return false;
              return stripSep(r.FRM_DTTM) >= stripSep(r.TO_DTTM);
            })
          ) {
            base.alert(Lang.get("MSG_DATE_SEQ_CHK"), Lang.get("TTL_ALERT"));
            return false;
          }
          return true;
        },
        afterSave: {
          cascadeFrom: "master",
          fetch: fetchDfOil,
        },
      }),
    [base, model.grids.dfOil, fetchDfOil],
  );

  const masterActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.master.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(buildSearchParams(model, model.filtersRef.current)),
        rows: model.grids.master.rows,
      }),
    ],
    [model, menuName],
  );

  const dfOilActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleDfOilAdd }),
      makeSaveAction({ onClick: handleDfOilSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.dfOil.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.master.selectedRef.current;
          return main
            ? fetchDfOil(main)
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.dfOil.rows,
      }),
    ],
    [handleDfOilAdd, handleDfOilSave, menuName, model, fetchDfOil],
  );

  const monthActions: ActionItem[] = useMemo(
    () =>
      makeCommonActions({
        excel: {
          excelColumns: () => model.grids.month.getExcelColumns(),
          menuCode: MENU_CODE,
          menuName: menuName,
          fetchFn: () =>
            api.getMonth(buildSearchParams(model, model.filtersRef.current)),
          rows: model.grids.month.rows,
        },
      }),
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    onMasterRowClicked,
    masterActions,
    dfOilActions,
    monthActions,
  };
}
