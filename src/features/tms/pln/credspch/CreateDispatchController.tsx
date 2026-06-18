import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { createDispatchApi } from "./CreateDispatchApi";
import { MENU_CODE } from "./CreateDispatch";
import type { CreateDispatchModel, GridKey } from "./CreateDispatchModel";
import ChangeDeliveryDatePop from "./popup/ChangeDeliveryDatePop";
import CreateItineraryDispatchPop from "./popup/CreateItineraryDispatchPop";
import ItineraryPlanPop from "./popup/ItineraryPlanPop";
import CreateEmptyDispatchVehiclePop from "../dispatchPlan/popup/CreateEmptyDispatchVehiclePop";
import ShipmentTransferPop from "../rcvshpm/popup/ShipmentTransferPop";

interface Args {
  model: CreateDispatchModel;
}

export function useCreateDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => createDispatchApi.search(params),
    },
  });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const selectedMainRowsRef = useRef<any[]>([]);
  const selectedSub01RowsRef = useRef<any[]>([]);

  const toDsSave = useCallback(
    (rows: any[]) =>
      rows.map(({ EDIT_STS, __rid__, ...row }) => ({
        ...row,
        rowStatus: row.rowStatus ?? EDIT_STS ?? "U",
      })),
    [],
  );

  const selectedMainRows = useCallback(
    () => selectedMainRowsRef.current ?? [],
    [],
  );

  const requireMainRows = useCallback(
    (single = false) => {
      const rows = selectedMainRows();
      if (!rows.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return null;
      }
      if (single && rows.length !== 1) {
        base.alert(Lang.get("MSG_CHK_SELECT_CNT"));
        return null;
      }
      return rows;
    },
    [base, selectedMainRows],
  );

  const saveRows = useCallback(
    async (rows: any[], apiFn: (payload: any) => Promise<any>) => {
      await base.callAjax(apiFn({ dsSave: toDsSave(rows) }));
      base.search();
    },
    [base, toDsSave],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      row?.SHPM_ID
        ? createDispatchApi.searchDetail({ SHPM_ID: row.SHPM_ID })
        : Promise.resolve({ data: { data: { dsOut: [] } } }),
    [],
  );

  const loadSub01 = useCallback(
    async (row: any) => {
      base.resetGrids(["sub01"]);
      if (!row) return;
      const subRows = await base.searchSub("sub01", fetchSub01(row));
      const first = model.grids.sub01.ref.current?.rows?.[0] ?? subRows?.[0];
      if (first) model.grids.sub01.setSelected(first);
    },
    [base, fetchSub01, model.grids.sub01],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      model.grids.main.setSelected(row ?? null);
      void loadSub01(row);
    },
    [loadSub01, model.grids.main],
  );

  const onMainSelectionChanged = useCallback(
    (rows: any[] | null) => {
      selectedMainRowsRef.current = rows ?? [];
      const first = rows?.[0] ?? null;
      model.grids.main.setSelected(first);
      void loadSub01(first);
    },
    [loadSub01, model.grids.main],
  );

  const onSub01SelectionChanged = useCallback(
    (rows: any[] | null) => {
      selectedSub01RowsRef.current = rows ?? [];
      model.grids.sub01.setSelected(rows?.[0] ?? null);
    },
    [model.grids.sub01],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      selectedMainRowsRef.current = firstMain ? [firstMain] : [];
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        void loadSub01(firstMain);
      } else {
        base.resetGrids(["sub01"]);
      }
    },
    [base, loadSub01, model.grids.main],
  );

  const onManualPlan = useCallback(() => {
    const rows = requireMainRows();
    if (!rows) return;

    const lgstGrpCd = String(rows[0]?.LGST_GRP_CD ?? "");
    if (!lgstGrpCd) {
      base.alert(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"));
      return;
    }
    if (rows.some((row) => String(row?.LGST_GRP_CD ?? "") !== lgstGrpCd)) {
      base.alert(Lang.get("MSG_LOGISTICSGROUP_SELECT_CHK"));
      return;
    }

    openPopup({
      title: "BTN_MANUAL_PLAN",
      width: "4xl",
      content: (
        <CreateEmptyDispatchVehiclePop
          initialValues={{
            DIV_CD: rows[0]?.DIV_CD ?? "",
            LGST_GRP_CD: lgstGrpCd,
            DLVRY_DT: rows[0]?.DLVRY_DT ?? "",
            PLN_ID: rows[0]?.PLN_ID ?? "",
            DSPCH_TP: rows[0]?.DSPCH_TP ?? "",
          }}
          rowSelection="single"
          onConfirm={(vehicles) => {
            const vehicle = vehicles[0];
            if (!vehicle) return;
            closePopup();
            void saveRows(
              rows.map((row) => ({
                ...row,
                ...vehicle,
                rowStatus: "U",
              })),
              createDispatchApi.saveManualPlan,
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, openPopup, requireMainRows, saveRows]);

  const onCreateItineraryPlanDispatch = useCallback(() => {
    const f = model.rawFiltersRef.current ?? {};
    const initialValues = {
      DIV_CD: f.SRCH_SHPM_DIV_CD ?? "",
      LGST_GRP_CD: f.SRCH_SHPM_LGST_GRP_CD ?? "",
      PLN_ID: f.SRCH_SHPM_PLN_ID ?? "",
      DLVRY_DT: f.SRCH_SHPM_DLVRY_DT ?? "",
      BATCH_NO: 1,
    };
    if (
      !initialValues.DIV_CD ||
      !initialValues.LGST_GRP_CD ||
      !initialValues.PLN_ID ||
      !initialValues.DLVRY_DT
    ) {
      base.alert(Lang.get("MSG_DUMMY_DISPATCH_BUILD_MANDATORY_CHK"));
      return;
    }

    openPopup({
      title: "TTL_CREATE_ITINERARY_PLAN",
      width: "2xl",
      content: (
        <CreateItineraryDispatchPop
          initialValues={initialValues}
          onConfirm={(picked) => {
            closePopup();
            void base
              .callAjax(
                createDispatchApi.saveCreateItineraryGroupDispatch({
                  dsSave: picked.map((row) => ({
                    ...row,
                    ...initialValues,
                    rowStatus: row.rowStatus ?? "I",
                  })),
                }),
              )
              .then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.rawFiltersRef, openPopup]);

  const onItineraryPlan = useCallback(() => {
    const rows = requireMainRows();
    if (!rows) return;
    const first = rows[0];
    openPopup({
      title: "BTN_CREATE_ITINERARY_GRP_PLAN",
      width: "2xl",
      content: (
        <ItineraryPlanPop
          initialValues={{
            DIV_CD: first?.DIV_CD ?? "",
            LGST_GRP_CD: first?.LGST_GRP_CD ?? "",
            DLVRY_DT: first?.DLVRY_DT ?? "",
            PLN_ID: first?.PLN_ID ?? "",
            BATCH_NO: first?.BATCH_NO ?? 1,
          }}
          onConfirm={(itinerary) => {
            closePopup();
            void saveRows(
              rows.map((row) => ({
                ...row,
                ITNR_ID: itinerary.ITNR_ID,
                CARR_CD: itinerary.CARR_CD,
                PAY_CARR_CD: itinerary.PAY_CARR_CD,
                VEH_ID: itinerary.VEH_ID,
                VEH_TP_CD: itinerary.VEH_TP_CD,
                VEH_NO: itinerary.VEH_NO,
                DRVR_ID: itinerary.DRVR_ID,
                DRVR_NM: itinerary.DRVR_NM,
                ASST_ID: itinerary.ASST_ID,
                ASST_NM: itinerary.ASST_NM,
                AP_PROC_TP: itinerary.AP_PROC_TP,
                rowStatus: "U",
              })),
              createDispatchApi.saveItineraryPlan,
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [closePopup, openPopup, requireMainRows, saveRows]);

  const onChangeDeliveryDate = useCallback(() => {
    const rows = requireMainRows(true);
    if (!rows) return;
    const row = rows[0];
    openPopup({
      title: "BTN_DELIVERY_DATE_CHANGE",
      width: "lg",
      content: (
        <ChangeDeliveryDatePop
          initialValues={{
            DLVRY_DT: row?.DLVRY_DT ?? "",
            PLN_ID: row?.PLN_ID ?? "",
            LGST_GRP_CD: row?.LGST_GRP_CD ?? "",
          }}
          onConfirm={(payload) => {
            closePopup();
            void saveRows(
              rows.map((item) => ({ ...item, ...payload })),
              createDispatchApi.saveChangeDeliveryDate,
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [closePopup, openPopup, requireMainRows, saveRows]);

  const onShipmentTransfer = useCallback(() => {
    const rows = requireMainRows(true);
    if (!rows) return;
    const row = rows[0];
    openPopup({
      title: "BTN_SHIPMENT_TRANSFER",
      width: "lg",
      content: (
        <ShipmentTransferPop
          record={row}
          onApply={(payload) => {
            closePopup();
            void saveRows(
              rows.map((item) => ({ ...item, ...payload })),
              createDispatchApi.saveShipmentTransfer,
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [closePopup, openPopup, requireMainRows, saveRows]);

  const onChangeShipFrom = useCallback(() => {
    base.alert(`${Lang.get("BTN_SHIP_FROM_CHANGE")} popup is not implemented.`);
  }, [base]);

  const onChangeShipTo = useCallback(() => {
    base.alert(`${Lang.get("BTN_SHIP_TO_CHANGE")} popup is not implemented.`);
  }, [base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_MANUAL_PLAN",
        label: "BTN_MANUAL_PLAN",
        onClick: onManualPlan,
      },
      {
        type: "button",
        key: "BTN_CREATE_ITINERARY_PLAN",
        label: "BTN_CREATE_ITINERARY_PLAN",
        onClick: onCreateItineraryPlanDispatch,
      },
      {
        type: "button",
        key: "BTN_CREATE_ITINERARY_GRP_PLAN",
        label: "BTN_CREATE_ITINERARY_GRP_PLAN",
        onClick: onItineraryPlan,
      },
      {
        type: "button",
        key: "BTN_DELIVERY_DATE_CHANGE",
        label: "BTN_DELIVERY_DATE_CHANGE",
        onClick: onChangeDeliveryDate,
      },
      {
        type: "button",
        key: "BTN_SHIPMENT_TRANSFER",
        label: "BTN_SHIPMENT_TRANSFER",
        onClick: onShipmentTransfer,
      },
      {
        type: "button",
        key: "BTN_SHIP_FROM_CHANGE",
        label: "BTN_SHIP_FROM_CHANGE",
        onClick: onChangeShipFrom,
      },
      {
        type: "button",
        key: "BTN_SHIP_TO_CHANGE",
        label: "BTN_SHIP_TO_CHANGE",
        onClick: onChangeShipTo,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => createDispatchApi.search(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.filtersRef,
      model.grids.main,
      onChangeDeliveryDate,
      onChangeShipFrom,
      onChangeShipTo,
      onCreateItineraryPlanDispatch,
      onItineraryPlan,
      onManualPlan,
      onShipmentTransfer,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? fetchSub01(main)
            : Promise.resolve({ data: { data: { dsOut: [] } } });
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [fetchSub01, menuName, model.grids.main, model.grids.sub01],
  );

  return {
    ...base,
    onMainGridClick,
    onMainSelectionChanged,
    onSub01SelectionChanged,
    onSearchCallback,
    mainActions,
    sub01Actions,
  };
}
