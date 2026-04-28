// src/views/tender/TenderReceiveDispatchController.ts
// ──────────────────────────────────────────────────────────────────
//  센차 TenderReceiveDispatchController.js 대응
//
//  센차 Controller에 정의된 handler 함수들을
//  React useCallback 으로 1:1 대응시킵니다.
//
//  [Sencha handler → React handler 매핑]
//  onActionAfterSearch   → handleSearch (조회 콜백)
//  onMainGridClick       → handleRowClicked (행 클릭)
//  onMainInfoCallback    → handleSearch 내부 초기화 로직
//  searchConnectedGrid   → handleRowClicked 내부 Promise.all
//  onTenderAccepted      → mainActions 내 '운송요청수락' onClick
//  onTenderRejected      → mainActions 내 '운송요청거절' onClick
//  onVehicleChange       → mainActions 내 '모바일가입용차' onClick
//  onChangeRegVeh        → mainActions 내 '지입차' onClick
//  onChangeTempVeh       → mainActions 내 '임시용차' onClick
//  onVehicleCancel       → mainActions 내 '운송요청수락취소' onClick
//  sendSMSForAppInstall  → mainActions 내 '앱설치SMS' onClick
//  onSaveCarrierRate     → apSetlActions 내 '저장' onClick
//  onAddCarrierBookingRate→ apSetlActions 내 '추가' onClick
//  onCarrierRateExcelAll → mainActions 내 '운송비양식다운로드' onClick
//  onActionAfterSearch(엑셀)→ mainActions 내 '엑셀' 그룹 onClick
// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { tenderApi } from "@/features/tms/pln/tender/tenderApi.ts";
import { useApiHandler } from "@/hooks/useApiHandler";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch } from "@/views/common/common";
import { makeExcelGroupAction } from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import TenderRejectPopup from "@/features/tms/pln/tender/popup/TenderRejectPopup";
import TemporaryVehicleChangePopup from "@/features/tms/pln/tender/popup/TemporaryVehicleChangePopup";
import AppInstallSmsPopup from "@/features/tms/pln/tender/popup/AppInstallSmsPopup";
import VehicleChangePopup from "@/features/tms/pln/tender/popup/VehicleChangePopup";
import VehicleAssignPopup from "@/features/tms/pln/tender/popup/VehicleAssignPopup";
import { TenderReceiveDispatchModel } from "./TenderReceiveDispatchModel";
import { MAIN_COLUMN_DEFS } from "./TenderReceiveDispatchColumns.tsx";

type ControllerProps = {
  model: TenderReceiveDispatchModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

/**
 * useTenderReceiveDispatchController
 *
 * 센차 Controller의 handler 함수들을 React 방식으로 구현합니다.
 * - useApiHandler: 센차의 saveGrid / callAjax 역할
 * - usePopup: 센차의 openWindow 역할
 * - useGuard: 센차의 isCheckSelectRecord 역할
 */
export function useTenderReceiveDispatchController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) => tenderApi.getDispatchList(params),
    [],
  );

  // ── handleSearch (센차: onMainInfoCallback + gridsReset) ──────
  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
    },
    [model],
  );

  // ── handleRowClicked (센차: onMainGridClick + searchConnectedGrid) ──
  // 행 클릭 시 3개 서브 API를 Promise.all 로 병렬 조회
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      Promise.all([
        tenderApi.getDispatchStopList({ DSPCH_NO: row.DSPCH_NO }),
        tenderApi.getDispatchSmsHisList({ DSPCH_NO: row.DSPCH_NO }),
        tenderApi.getDispatchApSetlList({ DSPCH_NO: row.DSPCH_NO }),
      ])
        .then(([stopRes, smsRes, apSetlRes]: any[]) => {
          model.setSubStopRowData(
            stopRes.data.result ?? stopRes.data.data.dsOut ?? [],
          );
          model.setSubSmsHisRowData(
            smsRes.data.result ?? stopRes.data.data.dsOut ?? [],
          );
          model.setSubApSetlRowData(
            apSetlRes.data.result ?? stopRes.data.data.dsOut ?? [],
          );
        })
        .catch((err) => {
          console.error(
            "[TenderReceiveDispatch] row click sub-fetch failed",
            err,
          );
        });
    },
    [model],
  );

  // ── handleApSetlCellChange (센차: carrRate grid cell edit) ────
  const handleApSetlCellChange = useCallback(
    (params: any) => {
      model.setSubApSetlRowData((prev: any) =>
        prev.map((row: any) =>
          row === params.data
            ? {
                ...row,
                [params.colDef.field]: params.newValue,
                ...(!row._isNew && { _isDirty: true }),
              }
            : row,
        ),
      );
    },
    [model],
  );

  // ── 메인 그리드 액션 (센차: TenderReceiveDispatchMain dockedItems toolbar) ──
  const mainActions: ActionItem[] = [
    // 센차: BTN_TENDER_ACCEPT handler:'onTenderAccepted'
    {
      type: "button",
      key: "LBL_AR_TRACE",
      label: "LBL_AR_TRACE",
      onClick: (e: any) => {
        if (!e.data?.length) return;
        model.setTrackRows(e.data);
        model.setTrackOpen(true);
      },
    },
    {
      type: "button",
      key: "BTN_TENDER_ACCEPT",
      label: "BTN_TENDER_ACCEPT",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(tenderApi.onTenderAccepted(e.data), "저장되었습니다.");
      },
    },
    // 센차: BTN_TENDER_REJECT handler:'onTenderRejected' → openWindow RejectReasonPop
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
              reasons={[]}
              onConfirm={(ie: any) => {
                closePopup();
                handleApi(
                  tenderApi.onTenderRejected(
                    e.data.map((row: any) => ({ ...row, ...ie.data })),
                  ),
                  "저장되었습니다.",
                ).then(() => searchRef.current?.());
              }}
              onClose={closePopup}
            />
          ),
          width: "lg",
        });
      },
    },
    // 센차: BTN_VEHICLE_CHANGE menu 그룹 → 지입차/모바일가입용차/임시용차
    {
      type: "group",
      key: "BTN_VEHICLE_CHANGE",
      label: "BTN_VEHICLE_CHANGE",
      items: [
        // 센차: BTN_CHANGE_REG_DED_VEH handler:'onChangeRegVeh'
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
                      tenderApi.onChangeRegVeh(
                        e.data.map((row: any) => ({ ...row, ...ie })),
                      ),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
                  }}
                  onClose={closePopup}
                />
              ),
              width: "2xl",
            });
          },
        },
        // 센차: BTN_CHANGE_REG_MBL_VEH handler:'onVehicleChange'
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
                      tenderApi.onChangeTempVeh({ ...e.data[0], ...ie }),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
                  }}
                  onClose={closePopup}
                />
              ),
              width: "lg",
            });
          },
        },
        // 센차: BTN_REG_TEMP_VEH handler:'onChangeTempVeh'
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
                      tenderApi.onVehicleChange(
                        e.data.map((row: any) => ({ ...row, ...ie })),
                      ),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
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
    // 센차: BTN_VEHICLE_CANCEL handler:'onVehicleCancel'
    {
      type: "button",
      key: "BTN_VEHICLE_CANCEL",
      label: "BTN_VEHICLE_CANCEL",
      onClick: (e: any) =>
        handleApi(tenderApi.onVehicleCancel(e.data), "저장되었습니다."),
    },
    // 센차: BTN_SEND_SMS_FOR_INSTALL handler:'sendSMSForAppInstall' → openWindow SendSMSPop
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
              reasons={[]}
              onConfirm={(ie: any) => {
                closePopup();
                handleApi(
                  tenderApi.sendSMSForAppInstall({ ...e.data, ...ie.data }),
                  "저장되었습니다..",
                ).then(() => searchRef.current?.());
              }}
              onClose={closePopup}
            />
          ),
          width: "lg",
        });
      },
    },
    // 센차: BTN_CARRIER_RATE_EXCEL_MGMT menu 그룹 → 양식다운/업로드
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
              columns: MAIN_COLUMN_DEFS({}),
              searchParams: filtersRef.current,
              menuName: "운송수배현황",
              fetchFn: (params) => tenderApi.getDispatchList(params),
            });
          },
        },
        {
          type: "button",
          key: "운송비업로드",
          label: "운송비업로드",
          onClick: () => {
            handleApi(
              tenderApi.gridExcelUpload(filtersRef.current),
              "업로드가 완료되었습니다.",
            );
          },
        },
      ],
    },
    // 센차: BTN_EXCEL menu 그룹 → gridExcelAll / gridExcel
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS({}),
      menuName: "운송사요청목록",
      fetchFn: () => tenderApi.getDispatchList(filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  // ── 운송비내역 서브그리드 액션 (센차: TenderReceiveDispatchCarrRate toolbar) ──
  const apSetlActions: ActionItem[] = [
    // 센차: BTN_ADD handler:'onAddCarrierBookingRate' → openWindow CommonPop
    {
      type: "button",
      key: "운송비추가",
      label: "BTN_ADD",
      onClick: () => {
        if (!guardHasData(model.selectedHeaderRowRef.current)) return;
        openPopup({
          title: "항목코드",
          content: (
            <CommonPopup
              fetchFn={(params: any) => tenderApi.getBookingChgCodeName(params)}
              onApply={(row: any) => {
                closePopup();
                model.setSubApSetlRowData((prev: any) => [
                  ...prev,
                  {
                    _isNew: true,
                    DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
                    CHG_CD: row.CODE,
                    CHG_NM: row.NAME,
                  },
                ]);
              }}
              onClose={closePopup}
            />
          ),
          width: "2xl",
        });
      },
    },
    // 센차: BTN_SAVE handler:'onSaveCarrierRate' → saveRecord '/tenderReceiveDispatchService/updateCarrierRate'
    {
      type: "button",
      key: "운송비저장",
      label: "BTN_SAVE",
      onClick: () => {
        model.apSetlGridRef.current?.api?.stopEditing();

        const saveRows = model.subApSetlRowDataRef.current.filter(
          (sub: any) => sub._isNew || sub._isDirty,
        );
        if (saveRows.length === 0) return;

        handleApi(
          tenderApi.updateCarrierRate(saveRows),
          "저장되었습니다.",
        ).then(() => {
          tenderApi
            .getDispatchApSetlList({
              DSPCH_NO: model.selectedHeaderRowRef.current.DSPCH_NO,
            })
            .then((res: any) =>
              model.setSubApSetlRowData(res.data.result ?? []),
            );
        });
      },
    },
  ];

  return {
    fetchDispatchList,
    handleSearch,
    handleRowClicked,
    handleApSetlCellChange,
    mainActions,
    apSetlActions,
  };
}
