import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { dfChargeRateApi as api } from "./DfChargeRateApi";
import { MENU_CODE } from "./DfChargeRate";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DfChargeRateModel, GridKey } from "./DfChargeRateModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import DfChargeRateCopyPop from "./popup/DfChargeRateCopyPop";
import DfChargeRateEachAddPop from "./popup/DfChargeRateEachAddPop";
import DfChargeRateAddVehPop from "./popup/DfChargeRateAddVehPop";
import DfChargeRateAddPop from "./popup/DfChargeRateAddPop";

interface Args {
  model: DfChargeRateModel;
}

export function useDfChargeRateController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onRtItemRowClicked = useCallback(
    (row: any) =>
      base.handleRowClick("rtItem", row, [
        {
          to: "rtItemVehTp",
          fetch: (r) =>
            api.getRateItmVehTypeList({ TRF_CD: r.TRF_CD, CHG_CD: r.CHG_CD }),
        },
        {
          to: "rtItemVeh",
          fetch: (r) =>
            api.getRateItmVehList({ TRF_CD: r.TRF_CD, CHG_CD: r.CHG_CD }),
        },
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      model.grids.main.setSelected(row);
      base.resetGrids([
        "rtItem",
        "rtCarr",
        "rtVehTp",
        "rtItemVehTp",
        "rtItemVeh",
      ]);
      if (!row) return;
      const [itemRows] = await Promise.all([
        base.searchSub("rtItem", api.getRateItemList({ TRF_CD: row.TRF_CD })),
        base.searchSub("rtCarr", api.getRateCarrList({ TRF_CD: row.TRF_CD })),
        base.searchSub("rtVehTp", api.getRateVehTpList({ TRF_CD: row.TRF_CD })),
      ]);
      if (itemRows[0]) onRtItemRowClicked(itemRows[0]);
    },
    [model, base, onRtItemRowClicked],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const requireMain = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return null;
    }
    return main;
  }, [model.grids.main, base]);

  // 공통코드 팝업으로 행 추가 (요율항목/운송사/차량유형)
  const addViaPopup = useCallback(
    (
      gridKey: GridKey,
      title: string,
      sqlId: string,
      extraParams: Record<string, string>,
      buildRow: (main: any, picked: any) => Record<string, any>,
      dupField: string,
    ) => {
      const main = requireMain();
      if (!main) return;
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
              const slot = (model.grids as any)[gridKey];
              const existing = new Set(
                (slot.rows ?? [])
                  .filter((r: any) => r.EDIT_STS === "I")
                  .map((r: any) => r[dupField]),
              );
              list
                .filter((p: any) => !existing.has(p.CODE))
                .forEach((p: any) => base.addRow(gridKey, buildRow(main, p)));
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [requireMain, openPopup, closePopup, model.grids, base],
  );

  // ── 요율 생성 (차량유형별 / 차량별) ────────────────────────
  const onGenerate = useCallback(
    (addType: "VEH_TP" | "VEH") => {
      openPopup({
        title: "LBL_GEN_DF_RATE_VEH",
        width: "full",
        content: (
          <DfChargeRateAddPop
            addType={addType}
            onApplied={() => {
              closePopup();
              base.search();
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [openPopup, closePopup, base],
  );

  // ── 계약서 복사 ────────────────────────────────────────────
  const onCopyChgRate = useCallback(() => {
    const main = requireMain();
    if (!main) return;
    openPopup({
      title: "LBL_TARIFF_COPY",
      width: "xl",
      content: (
        <DfChargeRateCopyPop
          initial={main}
          onConfirm={(params) => {
            closePopup();
            base.callAjax(api.addCopy(params), { mask: "main" }).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireMain, openPopup, closePopup, base]);

  // ── 차량유형별 금액 추가 (EachAddPop) ──────────────────────
  const onAddItmVehTp = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const chg = model.grids.rtItem.selectedRef.current;
    if (!main || !chg) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    openPopup({
      title: "LBL_VEHICLE_TYPE",
      width: "4xl",
      content: (
        <DfChargeRateEachAddPop
          extraParams={{
            lgstGrpCd: main.LGST_GRP_CD,
            trfCd: main.TRF_CD,
            chgCd: chg.CHG_CD,
          }}
          onConfirm={({ selectedRecord, addRowCnt }) => {
            closePopup();
            const newRows: any[] = [];
            selectedRecord.forEach((r: any) => {
              for (let j = 0; j < addRowCnt; j++) {
                newRows.push({
                  VEH_TP_CD: r.CODE,
                  VEH_TP_NM: r.NAME,
                  TRF_CD: main.TRF_CD,
                  CHG_CD: chg.CHG_CD,
                  RATE: 0,
                });
              }
            });
            base.addRow("rtItemVehTp", newRows);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main, model.grids.rtItem, openPopup, closePopup, base]);

  // ── 차량별 금액 추가 (AddVehPop) ───────────────────────────
  const onAddVeh = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    const chg = model.grids.rtItem.selectedRef.current;
    if (!main || !chg) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    openPopup({
      title: "LBL_ASSIGNED_VEHICLE",
      width: "full",
      content: (
        <DfChargeRateAddVehPop
          extraParams={{
            lgstGrpCd: main.LGST_GRP_CD,
            trfCd: main.TRF_CD,
            chgCd: chg.CHG_CD,
          }}
          onConfirm={({ selectedRecord, addRowCnt }) => {
            closePopup();
            const newRows: any[] = [];
            selectedRecord.forEach((r: any) => {
              for (let j = 0; j < addRowCnt; j++) {
                newRows.push({
                  VEH_TP_CD: r.VEH_TP_CD,
                  VEH_TP_NM: r.VEH_TP_NM,
                  VEH_ID: r.VEH_ID,
                  VEH_NO: r.VEH_NO,
                  TRF_CD: main.TRF_CD,
                  CHG_CD: chg.CHG_CD,
                  DRVR_NM: r.DRVR_NM,
                  RATE: 0,
                });
              }
            });
            base.addRow("rtItemVeh", newRows);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main, model.grids.rtItem, openPopup, closePopup, base]);

  // min/max 검증
  const checkMinMax = useCallback(
    (gridKey: GridKey): boolean => {
      const rows = (model.grids as any)[gridKey].rows ?? [];
      const bad = rows.some(
        (r: any) =>
          r.EDIT_STS &&
          r.MIN_RATE != null &&
          r.MAX_RATE != null &&
          Number(r.MIN_RATE) > Number(r.MAX_RATE),
      );
      if (bad) {
        base.alert(Lang.get("LBL_CHECK_MIN_MAX_VALUE"), Lang.get("TTL_ALERT"));
        return false;
      }
      return true;
    },
    [model.grids, base],
  );

  // 그리드별 cascade 재조회 저장 (main 기준)
  const saveFromMain = useCallback(
    (gridKey: GridKey, apiFn: (rows: { dsSave: any[] }) => Promise<any>) =>
      base.saveGrid(gridKey, apiFn, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (m: any) => {
            if (gridKey === "rtItem")
              return api.getRateItemList({ TRF_CD: m.TRF_CD });
            if (gridKey === "rtCarr")
              return api.getRateCarrList({ TRF_CD: m.TRF_CD });
            return api.getRateVehTpList({ TRF_CD: m.TRF_CD });
          },
        },
      }),
    [base],
  );

  const saveFromChg = useCallback(
    (gridKey: GridKey, apiFn: (rows: { dsSave: any[] }) => Promise<any>) => {
      if (!checkMinMax(gridKey)) return;
      base.saveGrid(gridKey, apiFn, {
        afterSave: {
          cascadeFrom: "rtItem",
          fetch: (c: any) =>
            gridKey === "rtItemVehTp"
              ? api.getRateItmVehTypeList({
                  TRF_CD: c.TRF_CD,
                  CHG_CD: c.CHG_CD,
                })
              : api.getRateItmVehList({ TRF_CD: c.TRF_CD, CHG_CD: c.CHG_CD }),
        },
      });
    },
    [base, checkMinMax],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "GEN_VEH_TP",
        label: "LBL_GEN_DF_RATE_VEH_TP",
        onClick: () => onGenerate("VEH_TP"),
      },
      {
        type: "button",
        key: "GEN_VEH",
        label: "LBL_GEN_DF_RATE_VEH",
        onClick: () => onGenerate("VEH"),
      },
      {
        type: "button",
        key: "COPY",
        label: "LBL_TARIFF_COPY",
        onClick: onCopyChgRate,
      },
      makeSaveAction({ onClick: () => base.saveGrid("main", api.save) }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
        // 메인만 엑셀업로드 / 엑셀양식다운로드 포함
        upload: { onUploaded: () => base.search() },
        templateDownload: {},
      }),
    ],
    [
      onGenerate,
      onCopyChgRate,
      base,
      menuName,
      model.filtersRef,
      model.grids.main,
    ],
  );

  const rtItemActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          addViaPopup(
            "rtItem",
            "LBL_RATE_ITEM",
            "selectTariffDfLgstChgList",
            {
              keyParam: main?.LGST_GRP_CD ?? "",
              param1: main?.TRF_CD ?? "",
            },
            (main, p) => ({
              TRF_CD: main.TRF_CD,
              CHG_CD: p.CODE,
              CHG_NM: p.NAME,
            }),
            "CHG_CD",
          );
        },
      }),
      makeSaveAction({ onClick: () => saveFromMain("rtItem", api.saveCharge) }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rtItem.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () =>
          api.getRateItemList({
            TRF_CD: model.grids.main.selectedRef.current?.TRF_CD,
          }),
        rows: () => model.grids.rtItem.rows,
      }),
    ],
    [addViaPopup, saveFromMain, menuName, model.grids.rtItem, model.grids.main],
  );

  const rtCarrActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          addViaPopup(
            "rtCarr",
            "LBL_PAY_CARRIER",
            "selectTariffDfLgstCarrList",
            {
              keyParam: main?.LGST_GRP_CD ?? "",
              param1: main?.TRF_CD ?? "",
            },
            (m, p) => ({
              TRF_CD: m.TRF_CD,
              CARR_CD: p.CODE,
              CARR_NM: p.NAME,
            }),
            "CARR_CD",
          );
        },
      }),
      makeSaveAction({ onClick: () => saveFromMain("rtCarr", api.saveCarr) }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rtCarr.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () =>
          api.getRateCarrList({
            TRF_CD: model.grids.main.selectedRef.current?.TRF_CD,
          }),
        rows: () => model.grids.rtCarr.rows,
      }),
    ],
    [addViaPopup, saveFromMain, menuName, model.grids.rtCarr, model.grids.main],
  );

  const rtVehTpActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          addViaPopup(
            "rtVehTp",
            "LBL_VEHICLE_TYPE",
            "selectVehTpListTariffDfOut",
            {
              keyParam: main?.TRF_CD ?? "",
            },
            (main, p) => ({
              TRF_CD: main.TRF_CD,
              VEH_TP_CD: p.CODE,
              VEH_TP_NM: p.NAME,
            }),
            "VEH_TP_CD",
          );
        },
      }),
      makeSaveAction({ onClick: () => saveFromMain("rtVehTp", api.saveVehTp) }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rtVehTp.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () =>
          api.getRateVehTpList({
            TRF_CD: model.grids.main.selectedRef.current?.TRF_CD,
          }),
        rows: () => model.grids.rtVehTp.rows,
      }),
    ],
    [
      addViaPopup,
      saveFromMain,
      menuName,
      model.grids.rtVehTp,
      model.grids.main,
    ],
  );

  const rtItemVehTpActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddItmVehTp }),
      makeSaveAction({
        onClick: () => saveFromChg("rtItemVehTp", api.saveItmVehTp),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rtItemVehTp.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () =>
          api.getRateItmVehTypeList({
            TRF_CD: model.grids.rtItem.selectedRef.current?.TRF_CD,
            CHG_CD: model.grids.rtItem.selectedRef.current?.CHG_CD,
          }),
        rows: () => model.grids.rtItemVehTp.rows,
      }),
    ],
    [
      onAddItmVehTp,
      saveFromChg,
      menuName,
      model.grids.rtItemVehTp,
      model.grids.rtItem,
    ],
  );

  const rtItemVehActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddVeh }),
      makeSaveAction({
        onClick: () => saveFromChg("rtItemVeh", api.saveItmVeh),
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.rtItemVeh.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () =>
          api.getRateItmVehList({
            TRF_CD: model.grids.rtItem.selectedRef.current?.TRF_CD,
            CHG_CD: model.grids.rtItem.selectedRef.current?.CHG_CD,
          }),
        rows: () => model.grids.rtItemVeh.rows,
      }),
    ],
    [
      onAddVeh,
      saveFromChg,
      menuName,
      model.grids.rtItemVeh,
      model.grids.rtItem,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRtItemRowClicked,
    mainActions,
    rtItemActions,
    rtCarrActions,
    rtVehTpActions,
    rtItemVehTpActions,
    rtItemVehActions,
  };
}
