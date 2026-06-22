import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { overheadTariffManagementApi as api } from "./OverheadTariffManagementApi";
import { MENU_CODE } from "./OverheadTariffManagement";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  OverheadTariffManagementModel,
  GridKey,
} from "./OverheadTariffManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import OverheadTariffAddPopup from "./popup/OverheadTariffAddPopup";
import OverheadTariffCopyPopup from "./popup/OverheadTariffCopyPopup";

interface Args {
  model: OverheadTariffManagementModel;
}

export function useOverheadTariffManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSubChgRowClicked = useCallback(
    (row: any) => {
      if (row?.EDIT_STS === "I") {
        model.grids.subChg.setSelected(row);
        base.resetGrids(["subChgDtl"]);
        return;
      }
      return base.handleRowClick("subChg", row, [
        {
          to: "subChgDtl",
          fetch: (r) =>
            api.getSubChgDtlList({
              TRF_CD: r.TRF_CD,
              LGST_GRP_CD: r.LGST_GRP_CD,
            }),
        },
      ]);
    },
    [base, model.grids.subChg],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids(["subChg", "subChgDtl"]);
      if (!row) return;
      if (row.EDIT_STS === "I") return;
      const subRows = await base.searchSub(
        "subChg",
        api.getSubChgList({ TRF_CD: row.TRF_CD }),
      );
      if (subRows[0]) onSubChgRowClicked(subRows[0]);
    },
    [model, base, onSubChgRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 생성 팝업 ──────────────────────────────────────────────
  const onOpenAdd = useCallback(() => {
    openPopup({
      title: "BTN_ADD",
      width: "full",
      content: (
        <OverheadTariffAddPopup
          onApplied={() => {
            closePopup();
            base.search();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [openPopup, closePopup, base]);

  // ── 복사 ───────────────────────────────────────────────────
  const onCopyTariff = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    openPopup({
      title: "LBL_COPY",
      width: "md",
      content: (
        <OverheadTariffCopyPopup
          onConfirm={({ FRM_DTTM, TO_DTTM }) => {
            closePopup();
            const row = [
              {
                ...main,
                rowStatus: "I",
                FRM_DTTM,
                TO_DTTM,
              },
            ];
            base
              .callAjax(api.copyTariffOverhead({ dsSave: row }), { mask: "main" })
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main, openPopup, closePopup, base]);

  // ── 공통코드 팝업으로 행 추가 ──────────────────────────────
  const addViaPopup = useCallback(
    (
      gridKey: GridKey,
      title: string,
      sqlId: string,
      extraParams: Record<string, string>,
      buildRow: (picked: any) => Record<string, any>,
    ) => {
      openPopup({
        title: title,
        width: "2xl",
        content: (
          <CommonPopup
            sqlId={sqlId}
            extraParams={extraParams}
            rowSelection="multiple"
            onApply={(picked: any) => {
              closePopup();
              const list = Array.isArray(picked) ? picked : [picked];
              base.addRow(gridKey, list.map(buildRow));
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [openPopup, closePopup, base],
  );

  const onAddLgstGrp = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || main.EDIT_STS === "I") {
      base.alert(Lang.get("MSG_PLS_SELECT_TRF"), Lang.get("TTL_CONFIRM"));
      return;
    }
    addViaPopup(
      "subChg",
      "LBL_LOGISTICS_GROUP",
      "selectLogisticsgroupCodeName",
      { keyParam: main.DIV_CD, param5: main.TRF_CD },
      (p) => ({
        TRF_CD: main.TRF_CD,
        LGST_GRP_CD: p.CODE,
        LGST_GRP_NM: p.NAME,
      }),
    );
  }, [model.grids.main, base, addViaPopup]);

  const onAddChg = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const lgst = model.grids.subChg.selectedRef.current;
    if (!main || main.EDIT_STS === "I") {
      base.alert(Lang.get("MSG_PLS_SELECT_TRF"), Lang.get("TTL_CONFIRM"));
      return;
    }
    if (!lgst || lgst.EDIT_STS === "I") {
      base.alert(Lang.get("MSG_PLS_SELECT_LGST"), Lang.get("TTL_CONFIRM"));
      return;
    }
    addViaPopup(
      "subChgDtl",
      "LBL_RATE_ITEM",
      "selectChgOvrhd",
      { keyParam: lgst.LGST_GRP_CD, param5: main.TRF_CD },
      (p) => ({
        TRF_CD: main.TRF_CD,
        CHG_CD: p.CODE,
        CHG_NM: p.NAME,
        LGST_GRP_CD: lgst.LGST_GRP_CD,
        UNIT_RATE: 0,
        APPLD_VAL: 0,
      }),
    );
  }, [model.grids.main, model.grids.subChg, base, addViaPopup]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_COPY",
        label: "LBL_COPY",
        onClick: onCopyTariff,
      },
      makeAddAction({ onClick: onOpenAdd }),
      makeSaveAction({ onClick: () => base.saveGrid("main", api.save) }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      onCopyTariff,
      onOpenAdd,
      base,
      menuName,
      model.filtersRef,
      model.grids.main,
    ],
  );

  const subChgActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddLgstGrp }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("subChg", api.saveOvrheadLgstGrp, {
            afterSave: {
              cascadeFrom: "main",
              fetch: (m: any) => api.getSubChgList({ TRF_CD: m.TRF_CD }),
            },
          }),
      }),
    ],
    [onAddLgstGrp, base],
  );

  const subChgDtlActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddChg }),
      makeSaveAction({
        onClick: () =>
          base.saveGrid("subChgDtl", api.saveOvrheadLgstGrpChg, {
            afterSave: {
              cascadeFrom: "subChg",
              fetch: (s: any) =>
                api.getSubChgDtlList({
                  TRF_CD: s.TRF_CD,
                  LGST_GRP_CD: s.LGST_GRP_CD,
                }),
            },
          }),
      }),
    ],
    [onAddChg, base],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSubChgRowClicked,
    mainActions,
    subChgActions,
    subChgDtlActions,
  };
}
