// src/views/tender/TenderReceiveDispatchController.ts
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tenderApi as api } from "./tenderApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch } from "@/app/services/common/excelService";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeHistoryAction,
  useTrackGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows, isInserted } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import TenderRejectPopup from "@/features/tms/pln/tender/popup/TenderRejectPopup";
import TemporaryVehicleChangePopup from "@/features/tms/pln/tender/popup/TemporaryVehicleChangePopup";
import AppInstallSmsPopup from "@/features/tms/pln/tender/popup/AppInstallSmsPopup";
import VehicleChangePopup from "@/features/tms/pln/tender/popup/VehicleChangePopup";
import VehicleAssignPopup from "@/features/tms/pln/tender/popup/VehicleAssignPopup";
import { MAIN_COLUMN_DEFS } from "./TenderReceiveDispatchColumns";
import type {
  TenderReceiveDispatchModel,
  GridKey,
} from "./TenderReceiveDispatchModel";

interface Args {
  model: TenderReceiveDispatchModel;
}

export function useTenderReceiveDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();
  const track = useTrackGroupAction();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDispatchList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "stop",
          fetch: (r) => api.getDispatchStopList({ DSPCH_NO: r.DSPCH_NO }),
        },
        {
          to: "sms",
          fetch: (r) => api.getDispatchSmsHisList({ DSPCH_NO: r.DSPCH_NO }),
        },
        {
          to: "apSetl",
          fetch: (r) => api.getDispatchApSetlList({ DSPCH_NO: r.DSPCH_NO }),
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

  const handleApSetlCellChange = useCallback(
    (params: any) => {
      model.grids.apSetl.setData((prev) => ({
        ...prev,
        rows: prev.rows.map((row: any) =>
          row === params.data
            ? {
                ...row,
                [params.colDef.field]: params.newValue,
                ...(!isInserted(row) && { EDIT_STS: "U" }),
              }
            : row,
        ),
      }));
    },
    [model.grids.apSetl],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      track.action,
      makeHistoryAction(),
      {
        type: "button",
        key: "BTN_TENDER_ACCEPT",
        label: "BTN_TENDER_ACCEPT",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          base.callAjax(api.onTenderAccepted({ dsSave: e.data }));
        },
      },
      {
        type: "button",
        key: "BTN_TENDER_REJECT",
        label: "BTN_TENDER_REJECT",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          openPopup({
            title: "BTN_TENDER_REJECT",
            content: (
              <TenderRejectPopup
                onConfirm={(ie: any) => {
                  closePopup();
                  base
                    .callAjax(
                      api.onTenderRejected({
                        dsSave: e.data.map((row: any) => ({
                          ...row,
                          ...ie.data,
                        })),
                      }),
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
              openPopup({
                title: "BTN_CHANGE_REG_DED_VEH",
                content: (
                  <VehicleChangePopup
                    initialValues={{ LGST_GRP_CD: e.data[0].LGST_GRP_CD }}
                    onConfirm={(ie: any) => {
                      closePopup();
                      base
                        .callAjax(
                          api.onChangeRegVeh({
                            dsSave: e.data.map((row: any) => ({
                              ...row,
                              ...ie,
                              CHGVEH_MEMO: "운송사협력사 요청건",
                            })),
                          }),
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
          {
            type: "button",
            key: "BTN_CHANGE_REG_MBL_VEH",
            label: "BTN_CHANGE_REG_MBL_VEH",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              openPopup({
                title: "BTN_CHANGE_REG_MBL_VEH",
                content: (
                  <TemporaryVehicleChangePopup
                    initialValues={{
                      VEH_TP_CD: e.data[0].VEH_TP_CD,
                      CARR_NM: e.data[0].CARR_NM,
                    }}
                    onConfirm={(ie: any) => {
                      closePopup();
                      base
                        .callAjax(api.onChangeTempVeh({ ...e.data[0], ...ie }))
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
            key: "BTN_REG_TEMP_VEH",
            label: "BTN_REG_TEMP_VEH",
            onClick: (e: any) => {
              if (!guardHasData(e.data)) return;
              openPopup({
                title: "BTN_REG_TEMP_VEH",
                content: (
                  <VehicleAssignPopup
                    onConfirm={(ie: any) => {
                      closePopup();
                      base
                        .callAjax(
                          api.onVehicleChange({
                            dsSave: e.data.map((row: any) => ({
                              ...row,
                              ...ie,
                              CHGVEH_MEMO: "운송협력사 요청",
                            })),
                          }),
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
        onClick: (e: any) =>
          base.callAjax(api.onVehicleCancel({ dsSave: e.data })),
      },
      {
        type: "button",
        key: "BTN_SEND_SMS_FOR_INSTALL",
        label: "BTN_SEND_SMS_FOR_INSTALL",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          openPopup({
            title: "BTN_SEND_SMS_FOR_INSTALL",
            content: (
              <AppInstallSmsPopup
                onConfirm={(ie: any) => {
                  closePopup();
                  base
                    .callAjax(
                      api.sendSMSForAppInstall({
                        dsSave: { ...e.data, ...ie.data },
                      }),
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
        key: "운송비엑셀관리",
        label: "운송비엑셀관리",
        items: [
          {
            type: "button",
            key: "BTN_CARRIER_RATE_EXCEL_FORM_DOWN",
            label: "BTN_CARRIER_RATE_EXCEL_FORM_DOWN",
            onClick: () => {
              downExcelSearch({
                columns: MAIN_COLUMN_DEFS(),
                searchParams: model.filtersRef.current,
                menuName: "운송수배현황",
                fetchFn: (params) => api.getDispatchList(params),
              });
            },
          },
          {
            type: "button",
            key: "운송비업로드",
            label: "운송비업로드",
            onClick: () => {
              base.callAjax(
                api.gridExcelUpload(model.filtersRef.current),
                "업로드가 완료되었습니다.",
              );
            },
          },
        ],
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS(),
        menuName: "운송사요청목록",
        fetchFn: () => api.getDispatchList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [base, openPopup, closePopup, guardHasData, model, track.action],
  );

  const apSetlActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({
        key: "BTN_AP_SETL_ADD",
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          if (!guardHasData(main)) return;
          openPopup({
            title: "LBL_OPER_TCD",
            content: (
              <CommonPopup
                rowSelection="multiple"
                fetchFn={(params: any) => api.getBookingChgCodeName(params)}
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
        onClick: () => {
          const rows = model.grids.apSetl.ref.current?.rows ?? [];
          const saveRows = dirtyRows(rows);
          if (saveRows.length === 0) return;

          base.callAjax(api.updateCarrierRate(saveRows)).then(() => {
            const main = model.grids.main.selectedRef.current;
            if (main) {
              base.searchSub(
                "apSetl",
                api.getDispatchApSetlList({ DSPCH_NO: main.DSPCH_NO }),
              );
            }
          });
        },
      }),
    ],
    [model, base, openPopup, closePopup, guardHasData],
  );

  return {
    fetchDispatchList: fetchList,
    onSearchCallback,
    onMainGridClick,
    handleApSetlCellChange,
    mainActions,
    apSetlActions,
    track,
  };
}
