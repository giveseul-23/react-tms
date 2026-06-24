import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tenderApi as api } from "./tenderApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { Lang } from "@/app/services/common/Lang";
import { downExcelSearch } from "@/app/services/common/excelService";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeExcelUploadAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import TenderRejectPopup from "./popup/TenderRejectPopup";
import TemporaryVehicleChangePopup from "./popup/TemporaryVehicleChangePopup";
import AppInstallSmsPopup from "./popup/AppInstallSmsPopup";
import VehicleChangePopup from "./popup/VehicleChangePopup";
import VehicleAssignPopup from "./popup/VehicleAssignPopup";
import { AUTH, MENU_CD } from "./TenderReceiveDispatch";
import { buildCarrierRateExcelColumns } from "./TenderReceiveDispatchColumns";
import type {
  TenderReceiveDispatchModel,
  GridKey,
} from "./TenderReceiveDispatchModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: TenderReceiveDispatchModel;
}

export function useTenderReceiveDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();
  const chgFetchedRef = useRef(false);
  const carrierRateExcelColumnsRef = useRef<any[]>([]);

  const fetchDispatchList = useCallback(
    async (params: Record<string, unknown>) => {
      if (!chgFetchedRef.current) {
        const chgRes: any = await api.getCarrierChgList();
        const chgList =
          chgRes?.data?.result ??
          chgRes?.data?.data?.dsOut ??
          chgRes?.data?.dsOut ??
          [];
        carrierRateExcelColumnsRef.current =
          buildCarrierRateExcelColumns(chgList);
        chgFetchedRef.current = true;
      }
      return api.getDispatchList(params);
    },
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "stop",
          fetch: (r) =>
            api.getDispatchStopList({
              DSPCH_NO: r.DSPCH_NO,
              LGST_GRP_CD: r.LGST_GRP_CD,
            }),
        },
        {
          to: "sms",
          fetch: (r) =>
            api.getDispatchSmsHisList({
              DSPCH_NO: r.DSPCH_NO,
              LGST_GRP_CD: r.LGST_GRP_CD,
            }),
        },
        {
          to: "apSetl",
          fetch: (r) =>
            api.getDispatchApSetlList({
              DSPCH_NO: r.DSPCH_NO,
              LGST_GRP_CD: r.LGST_GRP_CD,
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

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_TENDER_ACCEPT",
        label: "BTN_TENDER_ACCEPT",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          void base
            .callAjax(api.onTenderAccepted({ dsSave: e.data }), { mask: "main" })
            .then(() => base.search());
        },
      },
      {
        type: "button",
        key: "BTN_TENDER_REJECT",
        label: "BTN_TENDER_REJECT",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          openPopup({
            title: "LBL_REGI_TNDR_RJT_RSN",
            content: (
              <TenderRejectPopup
                onConfirm={({ reasonCode, detail }) => {
                  closePopup();
                  void base
                    .callAjax(
                      api.onTenderRejected({
                        dsSave: e.data.map((row: any) => ({
                          ...row,
                          TNDR_RJT_RSN_CD: reasonCode,
                          TNDR_RJT_RSN_DESC: detail,
                        })),
                      }),
                      { mask: "main" },
                    )
                    .then(() => base.search());
                }}
                onClose={closePopup}
              />
            ),
            width: "lg",
          });
        },
      },
      {
        type: "group",
        key: "BTN_VEHICLE_CHANGE",
        label: "BTN_VEHICLE_CHANGE",
        items: [
          {
            type: "button",
            key: "BTN_CHANGE_REG_DED_VEH",
            label: "BTN_CHANGE_REG_DED_VEH",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              if (e.data.length !== 1) {
                base.alert(Lang.get("MSG_EXCEPTION_ONE_VEHICLE_REPLACE"));
                return;
              }
              if (
                e.data.some((row: any) => String(row.DSPCH_OP_STS ?? "") >= "2070")
              ) {
                base.alert(Lang.get("MSG_NOT_CHG_VEH_MOER_PART_LOAD_REQ"));
                return;
              }
              const openChange = () => {
                openPopup({
                  title: "BTN_CHANGE_REG_DED_VEH",
                  content: (
                    <VehicleChangePopup
                      initialValues={{ LGST_GRP_CD: e.data[0].LGST_GRP_CD }}
                      onConfirm={(patch: any) => {
                        closePopup();
                        void base
                          .callAjax(
                            api.onChangeRegVeh({
                              dsSave: e.data.map((row: any) => ({
                                ...row,
                                ...patch,
                                CHGVEH_MEMO: "운송사협력사 요청건",
                              })),
                            }),
                            { mask: "main" },
                          )
                          .then(() => base.search());
                      }}
                      onClose={closePopup}
                    />
                  ),
                  width: "2xl",
                });
              };
              if (e.data[0].TRIP_ID) {
                base.confirm(Lang.get("MSG_ALERT_TRIP_VEH_CHANGE"), openChange);
              } else {
                openChange();
              }
            },
          },
          {
            type: "button",
            key: "BTN_REG_TEMP_VEH",
            label: "BTN_REG_TEMP_VEH",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              if (e.data.length !== 1) {
                base.alert(Lang.get("MSG_SELECT_DEDICATED_DSPCH"));
                return;
              }
              if (
                e.data.some((row: any) => String(row.DSPCH_OP_STS ?? "") >= "2070")
              ) {
                base.alert(Lang.get("MSG_NOT_CHG_VEH_MOER_PART_LOAD_REQ"));
                return;
              }
              openPopup({
                title: "BTN_REG_TEMP_VEH",
                content: (
                  <TemporaryVehicleChangePopup
                    initialValues={{
                      VEH_TP_CD: e.data[0].VEH_TP_CD,
                      CARR_NM: e.data[0].CARR_NM,
                    }}
                    onConfirm={(patch) => {
                      closePopup();
                      void base
                        .callAjax(
                          api.onChangeTempVeh({
                            ...e.data[0],
                            ...patch,
                            MENU_CD: MENU_CD,
                          }),
                          { mask: "main" },
                        )
                        .then(() => base.search());
                    }}
                    onClose={closePopup}
                  />
                ),
                width: "lg",
              });
            },
          },
          {
            type: "button",
            key: "BTN_CHANGE_REG_MBL_VEH",
            label: "BTN_CHANGE_REG_MBL_VEH",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              if (e.data.length !== 1) {
                base.alert(Lang.get("MSG_EXCEPTION_ONE_VEHICLE_REPLACE"));
                return;
              }
              if (
                e.data.some((row: any) => String(row.DSPCH_OP_STS ?? "") >= "2070")
              ) {
                base.alert(Lang.get("MSG_NOT_CHG_VEH_MOER_PART_LOAD_REQ"));
                return;
              }
              const sts = String(e.data[0].DSPCH_OP_STS ?? "");
              if (sts < "2030" || sts > "2090") {
                base.alert(Lang.get("MSG_CHANGE_VEHICLE_STATUS_CARR_CHK"));
                return;
              }
              openPopup({
                title: "BTN_CHANGE_REG_MBL_VEH",
                content: (
                  <VehicleAssignPopup
                    onConfirm={(patch: any) => {
                      closePopup();
                      void base
                        .callAjax(
                          api.onVehicleChange({
                            dsSave: e.data.map((row: any) => ({
                              ...row,
                              ...patch,
                              CHGVEH_MEMO: "운송협력사 요청",
                            })),
                          }),
                          { mask: "main" },
                        )
                        .then(() => base.search());
                    }}
                    onClose={closePopup}
                  />
                ),
                width: "2xl",
              });
            },
          },
        ],
      },
      {
        type: "button",
        key: "BTN_VEHICLE_CANCEL",
        label: "BTN_VEHICLE_CANCEL",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          if (
            !e.data.every(
              (r: any) =>
                r.DSPCH_OP_STS === "2050" || r.DSPCH_OP_STS === "2080",
            )
          ) {
            base.alert(Lang.get("MSG_NOT_VALID_STATUS_TO_CANCEL"));
            return;
          }
          void base
            .callAjax(api.onVehicleCancel({ dsSave: e.data }), { mask: "main" })
            .then(() => base.search());
        },
      },
      {
        type: "button",
        key: "BTN_SEND_SMS_FOR_INSTALL",
        label: "BTN_SEND_SMS_FOR_INSTALL",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          const row = e.data[0];
          openPopup({
            title: "BTN_SEND_SMS_FOR_INSTALL",
            content: (
              <AppInstallSmsPopup
                onConfirm={({ phone }) => {
                  closePopup();
                  void base
                    .callAjax(
                      api.sendSMSForAppInstall({
                        PARAM1: phone,
                        DSPCH_NO: row.DSPCH_NO,
                        DIV_CD: row.DIV_CD,
                        LGST_GRP_CD: row.LGST_GRP_CD,
                        DRVR_ID: row.DRVR_ID,
                      }),
                      { mask: "main" },
                    )
                    .then(() => base.search());
                }}
                onClose={closePopup}
              />
            ),
            width: "lg",
          });
        },
      },
      makeSaveAction({
        onClick: () => base.saveGrid("main", api.saveTrackingNumber),
      }),
      {
        type: "group",
        key: "BTN_CARRIER_RATE_EXCEL_MGMT",
        label: "BTN_CARRIER_RATE_EXCEL_MGMT",
        items: [
          {
            type: "button",
            key: "BTN_CARRIER_RATE_EXCEL_FORM_DOWN",
            label: "BTN_CARRIER_RATE_EXCEL_FORM_DOWN",
            onClick: async (e: any) => {
              if (!guardHasData(e.data)) return;
              const dspchList = e.data
                .filter((r: any) => String(r.AP_PROC_TP) === "10")
                .map((r: any) => r.DSPCH_NO);
              if (!chgFetchedRef.current) {
                const chgRes: any = await api.getCarrierChgList();
                const chgList =
                  chgRes?.data?.result ??
                  chgRes?.data?.data?.dsOut ??
                  chgRes?.data?.dsOut ??
                  [];
                carrierRateExcelColumnsRef.current =
                  buildCarrierRateExcelColumns(chgList);
                chgFetchedRef.current = true;
              }
              void downExcelSearch({
                columns: carrierRateExcelColumnsRef.current,
                menuName,
                menuCd: MENU_CD,
                searchParams: { dspchList },
                fetchFn: (params) => api.getCarrierRateExcel(params),
              });
            },
          },
          makeExcelUploadAction({
            key: "BTN_CARRIER_RATE_EXCEL_UPLOAD",
            label: "BTN_CARRIER_RATE_EXCEL_UPLOAD",
            menuCode: MENU_CD,
            gridId: AUTH.grids.carrRateExcel,
            onUploaded: () => base.search(),
          }),
        ],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => fetchDispatchList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.grids.main,
      model.filtersRef,
      guardHasData,
      base,
      openPopup,
      closePopup,
      fetchDispatchList,
    ],
  );

  const apSetlActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        key: "BTN_AP_SETL_ADD",
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          if (!main || main.EDIT_STS === "I") {
            base.alert(Lang.get("MSG_CHK_SELECT_USR"));
            return;
          }
          if (String(main.AP_PROC_TP) !== "10") {
            base.alert(Lang.get("MSG_ONLY_DISPATCH_AP_CARRIER_BOOKING"));
            return;
          }
          if (String(main.AP_FI_STS) !== "4000") {
            base.alert(Lang.get("MSG_CREATED_AP_INFO"));
            return;
          }
          openPopup({
            title: "LBL_AP_CTG",
            content: (
              <CommonPopup
                sqlId="selectBookingChgCodeName"
                rowSelection="multiple"
                onApply={(callbackRows: any) => {
                  closePopup();
                  model.grids.apSetl.setData((prev) => ({
                    ...prev,
                    rows: [
                      ...prev.rows,
                      ...callbackRows.map((element: any) => ({
                        EDIT_STS: "I",
                        DSPCH_NO: main.DSPCH_NO,
                        CHG_CD: element.CODE,
                        CHG_NM: element.NAME,
                      })),
                    ],
                  }));
                }}
                onClose={closePopup}
              />
            ),
            width: "2xl",
          });
        },
      }),
      makeSaveAction({
        key: "BTN_AP_SETL_SAVE",
        onClick: () => base.saveGrid("apSetl", api.updateCarrierRate),
      }),
    ],
    [model.grids.main, model.grids.apSetl, base, openPopup, closePopup],
  );

  return {
    fetchDispatchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    apSetlActions,
  };
}
