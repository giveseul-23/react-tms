import { useBaseController } from "@/app/feature/useBaseController";
import { freightClassApi } from "./FreightClassApi";
import { MENU_CD } from "./FreightClass";
import type {GridKey} from "./FreightClassModel";
import { FreightClassModel } from "./FreightClassModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useCallback, useMemo } from "react";
import { makeAddAction, makeExcelGroupAction, makeSaveAction } from "@/app/components/grid/actions/commonActions";
import { MAIN_COLUMN_DEFS } from "./FreightClassColumns";

interface Args {
  model: FreightClassModel;
}
export function useFreightClassController({ model}: Args) {
    const base = useBaseController<GridKey>({ model });

    const onAddMain = useCallback(() => {
        base.addRow("main", {
        });
    }, [base]);


    const onSaveMain = useCallback(
      () =>
        base.saveGrid("main", (payload) =>
          freightClassApi.save({
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
          makeExcelGroupAction({
              columns: MAIN_COLUMN_DEFS,
              menuCode: MENU_CD,
              fetchFn: () =>
                freightClassApi.getFreightClassList(
                  MENU_CD,
                  model.filtersRef.current
                ),
              rows: model.grids.main.rows,
            }),
        
      ],
      [model.filtersRef, model.grids.main.rows, onAddMain, onSaveMain],
    );
  
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      freightClassApi.getFreightClassList(MENU_CD, params),
    [],
  );
    
  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain = model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
      } else {
        base.resetGrids(["main"]);
      }
    },
    [base, model.grids.main],
  );

  return {
    fetchList,
    mainActions,
    onSaveMain,
    onAddMain,
    onSearchCallback
  };
}
