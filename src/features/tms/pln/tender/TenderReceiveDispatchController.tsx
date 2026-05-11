// src/views/tender/TenderReceiveDispatchController.ts
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { tenderApi as api } from "./tenderApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch } from "@/views/common/common";
import {
  makeExcelGroupAction,
  makeTrackGroupAction,
  makeHistoryAction,
} from "@/app/components/grid/commonActions";
import { dirtyRows, isInserted } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import TenderRejectPopup from "@/features/tms/pln/tender/popup/TenderRejectPopup";
import TemporaryVehicleChangePopup from "@/features/tms/pln/tender/popup/TemporaryVehicleChangePopup";
import AppInstallSmsPopup from "@/features/tms/pln/tender/popup/AppInstallSmsPopup";
import VehicleChangePopup from "@/features/tms/pln/tender/popup/VehicleChangePopup";
import VehicleAssignPopup from "@/features/tms/pln/tender/popup/VehicleAssignPopup";
import { MAIN_COLUMN_DEFS } from "./TenderReceiveDispatchColumns";
import type { TenderReceiveDispatchModel, GridKey } from "./TenderReceiveDispatchModel";

interface Args {
  model: TenderReceiveDispatchModel;
}

export function useTenderReceiveDispatchController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDispatchList(params),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        { to: "stop", fetch: (r) => api.getDispatchStopList({ DSPCH_NO: r.DSPCH_NO }) },
        { to: "sms", fetch: (r) => api.getDispatchSmsHisList({ DSPCH_NO: r.DSPCH_NO }) },
        { to: "apSetl", fetch: (r) => api.getDispatchApSetlList({ DSPCH_NO: r.DSPCH_NO }) },
      ]),
    [base],
  );

  const handleSearch = useCallback(
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

  const openTrack =
    (type: "BUY" | "SELL" | "DSPCH" | "ORD" | "STOP" | "POD") => (e?: any) => {
      if (!e?.data?.length) return;
      const dspchNos = e.data.map((r: any) => r.DSPCH_NO).filter(Boolean);
      model.setTrackType(type);
      model.setTrackDspchNos(dspchNos);
      model.setTrackOpen(true);
    };

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeTrackGroupAction({
        onBuy: openTrack("BUY"),
        onSell: openTrack("SELL"),
        onDispatch: openTrack("DSPCH"),
        onOrder: openTrack("ORD"),
        onStop: openTrack("STOP"),
        onPod: openTrack("POD"),
      }),
      makeHistoryAction(),
      {
        type: "button",
        key: "BTN_TENDER_ACCEPT",
        label: "BTN_TENDER_ACCEPT",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          handleApi(api.onTenderAccepted(e.data), "저장되었습니다.");
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
                  handleApi(
                    api.onTenderRejected(
                      e.data.map((row: any) => ({ ...row, ...ie.data })),
                    ),
                    "저장되었습니다.",
                  ).then(() => model.searchRef.current?.());
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
                title: "차량변경",
                content: (
                  <VehicleChangePopup
                    initialValues={{ LGST_GRP_CD: e.data[0].LGST_GRP_CD }}
                    onApply={(ie: any) => {
                      closePopup();
                      handleApi(
                        api.onChangeRegVeh(
                          e.data.map((row: any) => ({ ...row, ...ie })),
                        ),
                        "저장되었습니다.",
                      ).then(() => model.searchRef.current?.());
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
                      handleApi(
                        api.onChangeTempVeh({ ...e.data[0], ...ie }),
                        "저장되었습니다.",
                      ).then(() => model.searchRef.current?.());
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
                    onApply={(ie: any) => {
                      closePopup();
                      handleApi(
                        api.onVehicleChange(
                          e.data.map((row: any) => ({ ...row, ...ie })),
                        ),
                        "저장되었습니다.",
                      ).then(() => model.searchRef.current?.());
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
          handleApi(api.onVehicleCancel(e.data), "저장되었습니다."),
      },
      {
        type: "button",
        key: "BTN_SEND_SMS_FOR_INSTALL",
        label: "BTN_SEND_SMS_FOR_INSTALL",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          openPopup({
            title: "전화번호입력",
            content: (
              <AppInstallSmsPopup
                onConfirm={(ie: any) => {
                  closePopup();
                  handleApi(
                    api.sendSMSForAppInstall({ ...e.data, ...ie.data }),
                    "저장되었습니다..",
                  ).then(() => model.searchRef.current?.());
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
              handleApi(
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
    [handleApi, openPopup, closePopup, guardHasData, model],
  );

  const apSetlActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "운송비추가",
        label: "BTN_ADD",
        onClick: () => {
          const main = model.grids.main.selectedRef.current;
          if (!guardHasData(main)) return;
          openPopup({
            title: "항목코드",
            content: (
              <CommonPopup
                fetchFn={(params: any) => api.getBookingChgCodeName(params)}
                onApply={(row: any) => {
                  closePopup();
                  model.grids.apSetl.setData((prev) => ({
                    ...prev,
                    rows: [
                      ...prev.rows,
                      {
                        EDIT_STS: "I",
                        DSPCH_NO: main.DSPCH_NO,
                        CHG_CD: row.CODE,
                        CHG_NM: row.NAME,
                      },
                    ],
                  }));
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
        key: "운송비저장",
        label: "BTN_SAVE",
        onClick: () => {
          const rows = model.grids.apSetl.ref.current?.rows ?? [];
          const saveRows = dirtyRows(rows);
          if (saveRows.length === 0) return;

          handleApi(api.updateCarrierRate(saveRows), "저장되었습니다.").then(
            () => {
              const main = model.grids.main.selectedRef.current;
              if (main) {
                base.searchSub(
                  "apSetl",
                  api.getDispatchApSetlList({ DSPCH_NO: main.DSPCH_NO }),
                );
              }
            },
          );
        },
      },
    ],
    [model, base, handleApi, openPopup, closePopup, guardHasData],
  );

  return {
    fetchDispatchList: fetchList,
    handleSearch,
    onMainGridClick,
    handleApSetlCellChange,
    mainActions,
    apSetlActions,
  };
}
