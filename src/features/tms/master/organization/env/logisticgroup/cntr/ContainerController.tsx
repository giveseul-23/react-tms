import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { containerApi as api } from "./ContainerApi";
import { MENU_CODE } from "./Container";
import type { ContainerModel, GridKey } from "./ContainerModel";

interface ControllerArgs {
  model: ContainerModel;
}

export function useContainerController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;

    return api.getList({
      DIV_CD: srchObj.SRCH_DIV_CD,
      LGST_GRP_CD: srchObj.SRCH_LGST_GRP_CD,
    });
  }, [model.rawFiltersRef]);

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) =>
            api.getDetailList({
              DIV_CD: r.DIV_CD,
              LGST_GRP_CD: r.LGST_GRP_CD,
              LGST_GRP_NM: r.LGST_GRP_NM,
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

  const appendContainers = useCallback(
    (callbackRows: any[]) => {
      const main = model.grids.main.selectedRef.current;
      if (!main) return;

      const activeCodes = new Set(
        model.grids.detail.rows
          .filter((row) => !row.delStatus)
          .map((row) => row.CNTR_CD)
          .filter(Boolean),
      );

      const newRows = callbackRows
        .filter((row) => row?.CODE && !activeCodes.has(row.CODE))
        .map((row) => {
          activeCodes.add(row.CODE);
          return {
            EDIT_STS: "I",
            LGST_GRP_CD: main.LGST_GRP_CD,
            CNTR_CD: row.CODE,
            CNTR_NM: row.NAME,
          };
        });

      if (!newRows.length) return;

      model.grids.detail.setData((prev) => ({
        ...prev,
        rows: [...(prev?.rows ?? []), ...newRows],
      }));
    },
    [model.grids.detail, model.grids.main.selectedRef],
  );

  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_LOGISTICS_GROUP_CODE"))) {
      return;
    }

    openPopup({
      title: "BTN_ADD",
      width: "2xl",
      content: (
        <CommonPopup
          rowSelection="multiple"
          sqlId="selectCntrCodeName"
          extraParams={{ LGST_GRP_CD: main.LGST_GRP_CD }}
          onApply={(callbackRows: any) => {
            closePopup();
            appendContainers(
              Array.isArray(callbackRows) ? callbackRows : [callbackRows],
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [appendContainers, base, closePopup, model.grids.main.selectedRef, openPopup]);

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.save, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) =>
            api.getDetailList({
              DIV_CD: main.DIV_CD,
              LGST_GRP_CD: main.LGST_GRP_CD,
              LGST_GRP_NM: main.LGST_GRP_NM,
            }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({
                DIV_CD: main.DIV_CD,
                LGST_GRP_CD: main.LGST_GRP_CD,
                LGST_GRP_NM: main.LGST_GRP_NM,
              })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [menuName, model.grids.detail, model.grids.main.selectedRef, onAddDetail, onSaveDetail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
