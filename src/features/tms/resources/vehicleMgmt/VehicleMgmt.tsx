// src/views/vehicleMgmt/VehicleMgmt.tsx
"use client";

import { useState, useEffect } from "react";
import { GridFormPage } from "@/app/components/layout/presets/GridFormPage";
import { FormSheetOverlay } from "@/app/components/layout/FormSheet";
import DataGrid from "@/app/components/grid/DataGrid";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { commitRowChanges } from "@/app/components/grid/gridUtils/rowStatus";

import { useVehicleMgmtModel } from "./VehicleMgmtModel";
import { useVehicleMgmtController } from "./VehicleMgmtController";
import { FormBodyRenderer } from "@/app/components/common/FormBodyRenderer";
import { MAIN_COLUMN_DEFS } from "./VehicleMgmtColumns";
import { Lang } from "@/app/services/common/Lang";

export const MENU_CODE = "MENU_VEHICLE_MGMT";

type VehicleFormBodyProps = {
  data: any;
  setData: (updater: (prev: any) => any) => void;
  mode: "new" | "edit";
  onPopupSearch: (sqlId: string, codeField: string, nameField: string) => void;
  onPopupRender: (col: any) => void;
  codeMap: Record<string, Record<string, string>>;
};

// 적재율(SCALE_*) → 최대(MAX_*) 자동계산 매핑 (센차 calcScaleMax)
const SCALE_MAX_MAP: Record<string, [string, string]> = {
  SCALE_VOL: ["LDNG_VOL", "MAX_VOL"],
  SCALE_WGT: ["LDNG_WGT", "MAX_WGT"],
  SCALE_PBOX_QTY: ["LDNG_PBOX_QTY", "MAX_PBOX_QTY"],
  SCALE_BOX_QTY: ["LDNG_BOX_QTY", "MAX_BOX_QTY"],
  SCALE_PLT_QTY: ["LDNG_PLT_QTY", "MAX_PLT_QTY"],
  SCALE_RTNR_QTY: ["LDNG_RTNR_QTY", "MAX_RTNR_QTY"],
  SCALE_FLEX_QTY1: ["LDNG_FLEX_QTY1", "MAX_FLEX_QTY1"],
  SCALE_FLEX_QTY2: ["LDNG_FLEX_QTY2", "MAX_FLEX_QTY2"],
  SCALE_FLEX_QTY3: ["LDNG_FLEX_QTY3", "MAX_FLEX_QTY3"],
  SCALE_FLEX_QTY4: ["LDNG_FLEX_QTY4", "MAX_FLEX_QTY4"],
  SCALE_FLEX_QTY5: ["LDNG_FLEX_QTY5", "MAX_FLEX_QTY5"],
};

export function VehicleFormBody({
  data,
  setData,
  mode,
  onPopupSearch,
  onPopupRender,
  codeMap,
}: VehicleFormBodyProps) {
  const onChange = (field: string, value: any) =>
    setData((prev: any) => {
      const next = { ...prev, [field]: value };

      // 적재율 입력 시 최대치 자동계산 = 적재량 * (적재율/100)
      const scale = SCALE_MAX_MAP[field];
      if (scale) {
        const [ldngField, maxField] = scale;
        const s = parseFloat(value);
        const b = parseFloat(next[ldngField]);
        if (s > 0 && b > 0) next[maxField] = (b * (s / 100)).toFixed(1);
      }

      // 차량운영유형 변경 시 자동입찰/자동수락 플래그 (센차 changeVehOpTp)
      if (field === "VEH_OP_TP") {
        next.AUTO_TNDR_YN = "Y";
        if (value === "100") next.AUTO_TNDR_ACPT_YN = "Y";
        else if (value === "110" || value === "120")
          next.AUTO_TNDR_ACPT_YN = "N";
      }

      return next;
    });

  return (
    <FormBodyRenderer
      columns={MAIN_COLUMN_DEFS}
      data={data}
      onChange={onChange}
      onPopupSearch={onPopupSearch}
      onPopupRender={onPopupRender}
      codeMap={codeMap}
      mode={mode}
    />
  );
}

export default function VehicleMgmt() {
  const model = useVehicleMgmtModel(MENU_CODE);
  const ctrl = useVehicleMgmtController({ model });
  const { openPopup, closePopup } = usePopup();

  const [jumpInput, setJumpInput] = useState("");
  useEffect(() => {
    setJumpInput(String(model.detailIndex + 1));
  }, [model.detailIndex]);

  // 신규 폼 입력을 그리드 행에 즉시 동기화 (newFormData ↔ 그리드 __rid__ 행)
  const setNewFormDataSynced = (updater: (prev: any) => any) => {
    const next =
      typeof updater === "function" ? updater(model.newFormData) : updater;
    model.setNewFormData(next);
    commitRowChanges(model.grids.main.setData, next, next);
  };

  // 수정 폼 입력을 그리드 행에 즉시 동기화 (detailData ↔ 그리드 __rid__ 행)
  const setDetailDataSynced = (updater: (prev: any) => any) => {
    const next =
      typeof updater === "function" ? updater(model.detailData) : updater;
    model.setDetailData(next);
    commitRowChanges(model.grids.main.setData, next, next);
  };

  const handlePopupSearch = (
    targetData: any,
    setTargetData: (updater: (prev: any) => any) => void,
    sqlId: string,
    codeField: string,
    nameField: string,
    extraParams?: Record<string, any>,
  ) => {
    // extraParams 는 { 서버키: 폼필드명 } 매핑 — 현재 폼 데이터에서 실제 값으로 해석.
    const resolvedParams = extraParams
      ? Object.fromEntries(
          Object.entries(extraParams).map(([serverKey, formField]) => [
            serverKey,
            targetData[formField as string] ?? "",
          ]),
        )
      : undefined;
    openPopup({
      title: "LBL_CODE",
      content: (
        <CommonPopup
          sqlId={sqlId}
          extraParams={resolvedParams}
          onApply={(row: any) => {
            closePopup();
            setTargetData((prev: any) => {
              const next = {
                ...prev,
                [codeField]: row.CODE,
                [nameField]: row.NAME,
              };
              // 물류운영그룹코드 변경 시 매입정산물류운영그룹 코드/명 지움
              if (codeField === "LGST_GRP_CD") {
                next.PAY_LGST_GRP_CD = "";
                next.PAY_LGST_GRP_NM = "";
              }
              return next;
            });
          }}
          onClose={closePopup}
        />
      ),
      width: "2xl",
    });
  };

  const detailPopupSearch = (
    sqlId: string,
    codeField: string,
    nameField: string,
    extraParams?: Record<string, any>,
  ) =>
    handlePopupSearch(
      model.detailData,
      setDetailDataSynced,
      sqlId,
      codeField,
      nameField,
      extraParams,
    );

  const newPopupSearch = (
    sqlId: string,
    codeField: string,
    nameField: string,
    extraParams?: Record<string, any>,
  ) =>
    handlePopupSearch(
      model.newFormData,
      setNewFormDataSynced,
      sqlId,
      codeField,
      nameField,
      extraParams,
    );

  // popuser(커스텀 팝업) 돋보기 — col.renderPopup 을 commit/close 와 함께 띄운다.
  // commit 은 동기화 setter 로 → 선택값이 폼 + 그리드 행에 동시 반영.
  const handlePopupRender = (
    targetData: any,
    setTargetData: (updater: (prev: any) => any) => void,
    col: any,
  ) => {
    const commit = (patch: Record<string, any>) =>
      // __rid__ 는 행 식별자 — 팝업 선택 행의 __rid__ 가 폼/그리드 행을 오염시키지 않도록 제외
      setTargetData((prev: any) => {
        const { __rid__, ...safe } = patch ?? {};
        return { ...prev, ...safe };
      });
    openPopup({
      title: col.popupTitle ?? col.headerName,
      width: col.popupWidth ?? "2xl",
      content: col.renderPopup({
        row: targetData,
        commit,
        close: closePopup,
        callback: (picked: any) =>
          col.callback?.({ picked, row: targetData, commit }),
      }),
    });
  };

  const detailPopupRender = (col: any) =>
    handlePopupRender(model.detailData, setDetailDataSynced, col);

  const newPopupRender = (col: any) =>
    handlePopupRender(model.newFormData, setNewFormDataSynced, col);

  const detailFooter = (
    <>
      <button
        onClick={model.closeDetail}
        className="flex-1 h-[34px] text-[13px] rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center"
      >
        {Lang.get("LBL_CLOSE")}
      </button>
      <button
        onClick={ctrl.handleSaveDetail}
        className="flex-1 h-[34px] text-[13px] rounded-md text-white flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--primary))" }}
      >
        {Lang.get("BTN_SAVE")}
      </button>
    </>
  );

  const newFormFooter = (
    <>
      <button
        onClick={ctrl.handleCancelNew}
        className="flex-1 h-9 text-[13px] rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center"
      >
        {Lang.get("BTN_CANCEL")}
      </button>
      <button
        onClick={ctrl.handleSaveNew}
        className="flex-[2] h-9 text-[13px] rounded-md text-white flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--primary))" }}
      >
        {Lang.get("BTN_REGISTRATION")}
      </button>
    </>
  );

  return (
    <>
      <GridFormPage
        menuCode={MENU_CODE}
        searchProps={{
          moduleDefault: "TMS",
          fetchFn: ctrl.fetchVehicleList,
          onSearchCallback: ctrl.onSearchCallback,
          ...model.bindSearch(),
        }}
        grid={
          <DataGrid
            {...model.bind("main")}
            columnDefs={MAIN_COLUMN_DEFS}
            actions={ctrl.mainActions}
            onRowClicked={ctrl.handleRowClicked}
            codeMap={model.codeMap}
            audit={{ delete: false }}
          />
        }
        form={{
          open: model.detailOpen,
          width: 390,
          badgeLabel: "수정",
          title: model.detailData?.VEH_NO ?? "상세내역",
          // headerActions: detailHeaderActions,
          onClose: model.closeDetail,
          nav: {
            current: model.detailIndex + 1,
            total: model.grids.main.data.totalCount,
            onPrev: () => ctrl.handleNavigate(-1),
            onNext: () => ctrl.handleNavigate(1),
            onJump: (n) => ctrl.handleJumpTo(n),
            navigating: model.navigating,
          },
          jumpInput,
          onJumpInputChange: setJumpInput,
          onJumpInputBlur: () => setJumpInput(String(model.detailIndex + 1)),
          body: (
            <VehicleFormBody
              data={model.detailData}
              setData={setDetailDataSynced}
              mode="edit"
              onPopupSearch={detailPopupSearch}
              onPopupRender={detailPopupRender}
              codeMap={model.codeMap}
            />
          ),
          footer: detailFooter,
        }}
      />

      <FormSheetOverlay
        open={model.newSlideOpen}
        onOpenChange={(open) => {
          if (!open) ctrl.handleCancelNew();
        }}
        badgeLabel={Lang.get("LBL_LCATION_CREATE_REPLACE")}
        title={Lang.get("MENU_VEHICLE_DETAIL")}
        footer={newFormFooter}
      >
        <VehicleFormBody
          data={model.newFormData}
          setData={setNewFormDataSynced}
          mode="new"
          onPopupSearch={newPopupSearch}
          onPopupRender={newPopupRender}
          codeMap={model.codeMap}
        />
      </FormSheetOverlay>
    </>
  );
}
