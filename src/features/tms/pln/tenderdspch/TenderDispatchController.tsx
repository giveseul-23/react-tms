import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tenderDispatchApi as api } from "./TenderDispatchApi";
import { MENU_CODE } from "./TenderDispatch";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { Lang } from "@/app/services/common/Lang";
import { getSessionFields } from "@/app/services/auth/auth";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import ChangeVehiclePopup from "@/app/components/popup/ChangeVehiclePopup";
import RegiSpotPop from "../dispatchPlan/popup/RegiSpotPop";
import type { TenderDispatchModel, GridKey } from "./TenderDispatchModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: TenderDispatchModel;
}

const toDsSave = (rows: any[]) => ({ dsSave: rows });

const isPlanDispatchStatusOk = (rows: any[]) =>
  !rows.some((r) => String(r.DSPCH_OP_STS ?? "") >= "2103");

export function useTenderDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) => api.getDispatchList(params),
    [],
  );

  const onSub02GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub02", row, [
        {
          to: "sub03",
          fetch: (r) =>
            api.getAssignedShipmentDetailList({ SHPM_ID: r.SHPM_ID }),
        },
      ]),
    [base],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      base.handleRowClick(
        "main",
        row,
        row
          ? [
              {
                to: "sub01",
                fetch: (r) => api.getPlanStopList({ DSPCH_NO: r.DSPCH_NO }),
              },
            ]
          : undefined,
        { alsoReset: ["sub02", "sub03"] },
      );
      if (!row) return;
      const sub02Rows = await base.searchSub(
        "sub02",
        api.getAssignedShipmentList({ DSPCH_NO: row.DSPCH_NO }),
      );
      if (sub02Rows[0]) onSub02GridClick(sub02Rows[0]);
    },
    [base, onSub02GridClick],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      void onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const actTender = useCallback(
    (apiFn: (payload: any) => Promise<any>, e: any, mapRows?: (rows: any[]) => any[]) => {
      if (!guardHasData(e.data)) return;
      const rows = mapRows ? mapRows(e.data) : e.data;
      void base
        .callAjax(apiFn(toDsSave(rows)), { mask: "main" })
        .then(() => base.search());
    },
    [base, guardHasData],
  );

  const onChangeRegVeh = useCallback(
    (e: any) => {
      if (!guardHasData(e.data)) return;
      if (e.data.length !== 1) {
        base.alert(Lang.get("MSG_EXCEPTION_ONE_VEHICLE_REPLACE"));
        return;
      }
      if (!isPlanDispatchStatusOk(e.data)) {
        base.alert(Lang.get("MSG_NOT_CHG_VEH_MOER_PART_LOAD_REQ"));
        return;
      }
      const main = e.data[0];
      const openChange = () => {
        openPopup({
          title: "BTN_CHANGE_REG_VEH",
          width: "4xl",
          content: (
            <ChangeVehiclePopup
              fetchVehicles={(p) => api.searchChangeVehicle(p)}
              initialValues={{
                LGST_GRP_CD: main.LGST_GRP_CD,
                DSPCH_NO: main.DSPCH_NO,
                ORG_VEH_ID: main.VEH_ID,
                showType: "100",
              }}
              onConfirm={(picked) => {
                closePopup();
                void base
                  .callAjax(
                    api.saveChangeVehicle([
                      { ...main, ...picked, ORG_VEH_ID: main.VEH_ID },
                    ]),
                    { mask: "main" },
                  )
                  .then(() => base.search());
              }}
              onClose={closePopup}
            />
          ),
        });
      };
      if (main.TRIP_ID) {
        base.confirm(Lang.get("MSG_ALERT_TRIP_VEH_CHANGE"), openChange);
      } else {
        openChange();
      }
    },
    [base, closePopup, guardHasData, openPopup],
  );

  const onChangeTempVeh = useCallback(
    (e: any) => {
      if (!guardHasData(e.data)) return;
      if (e.data.length !== 1) {
        base.alert(Lang.get("MSG_SELECT_DEDICATED_DSPCH"));
        return;
      }
      if (!isPlanDispatchStatusOk(e.data)) {
        base.alert(Lang.get("MSG_NOT_CHG_VEH_MOER_PART_LOAD_REQ"));
        return;
      }
      const main = e.data[0];
      openPopup({
        title: "BTN_REG_SPOT_VEH",
        width: "md",
        content: (
          <RegiSpotPop
            initialValues={main}
            onConfirm={(patch) => {
              closePopup();
              void base
                .callAjax(
                  api.saveDspchSpotVeh({
                    DSPCH_NO: main.DSPCH_NO,
                    LGST_GRP_CD: main.LGST_GRP_CD,
                    DIV_CD: main.DIV_CD,
                    PLN_ID: main.PLN_ID,
                    DLVRY_DT: main.DLVRY_DT,
                    VEH_ID: main.VEH_ID,
                    VEH_OP_TP: main.VEH_OP_TP,
                    VEH_TP_NM: main.VEH_TP_NM,
                    DRVR_ID: main.DRVR_ID,
                    CARR_CD: main.CARR_CD,
                    CARR_NM: main.CARR_NM,
                    AP_PROC_TP: main.AP_PROC_TP,
                    MENU_CD: MENU_CODE,
                    VEH_NO: patch.VEH_NO,
                    DRVR_NM: patch.DRVR_NM,
                    MBL_PHN_NO: patch.MBL_PHN_NO,
                    VEH_TP_CD: patch.VEH_TP_CD,
                  }),
                  { mask: "main" },
                )
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, guardHasData, openPopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_TENDER",
        label: "BTN_TENDER",
        onClick: (e: any) => actTender(api.onTendered, e),
      },
      {
        type: "button",
        key: "BTN_TENDER_ACCEPT",
        label: "BTN_TENDER_ACCEPT",
        onClick: (e: any) => actTender(api.onTenderAccepted, e),
      },
      {
        type: "button",
        key: "BTN_TENDER_REJECT",
        label: "BTN_TENDER_REJECT",
        onClick: (e: any) =>
          actTender(api.onTenderRejected, e, (rows) => {
            const { userId } = getSessionFields();
            return rows.map((row) => ({ ...row, userId }));
          }),
      },
      {
        type: "button",
        key: "BTN_TENDER_CANCEL",
        label: "BTN_TENDER_CANCEL",
        onClick: (e: any) =>
          actTender(api.onTenderCanceled, e, (rows) => {
            const { userId } = getSessionFields();
            return rows.map((row) => ({ ...row, userId }));
          }),
      },
      {
        type: "button",
        key: "BTN_RETURN_TO_PLANNED",
        label: "BTN_RETURN_TO_PLANNED",
        onClick: (e: any) => actTender(api.onPlanConfirmChange, e),
      },
      {
        type: "group",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_REG_VEH",
            label: "BTN_CHANGE_REG_VEH",
            onClick: onChangeRegVeh,
          },
          {
            type: "button",
            key: "BTN_REG_SPOT_VEH",
            label: "BTN_REG_SPOT_VEH",
            onClick: onChangeTempVeh,
          },
        ],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => fetchDispatchList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      actTender,
      fetchDispatchList,
      menuName,
      model.filtersRef,
      model.grids.main,
      onChangeRegVeh,
      onChangeTempVeh,
    ],
  );

  return {
    fetchDispatchList,
    onSearchCallback,
    onMainGridClick,
    onSub02GridClick,
    mainActions,
  };
}
