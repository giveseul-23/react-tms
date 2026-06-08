// src/views/vehicleMgmt/VehicleMgmt.tsx
"use client";

import { useState, useEffect } from "react";
import { GridFormPage } from "@/app/components/layout/presets/GridFormPage";
import { FormSheetOverlay } from "@/app/components/layout/FormSheet";
import DataGrid from "@/app/components/grid/DataGrid";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";

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

  const handlePopupSearch = (
    targetData: any,
    setTargetData: (updater: (prev: any) => any) => void,
    sqlId: string,
    codeField: string,
    nameField: string,
  ) => {
    openPopup({
      title: "코드 검색",
      content: (
        <CommonPopup
          sqlId={sqlId}
          onApply={(row: any) => {
            closePopup();
            setTargetData((prev: any) => ({
              ...prev,
              [codeField]: row.CODE,
              [nameField]: row.NAME,
            }));
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
  ) =>
    handlePopupSearch(
      model.detailData,
      model.setDetailData,
      sqlId,
      codeField,
      nameField,
    );

  const newPopupSearch = (
    sqlId: string,
    codeField: string,
    nameField: string,
  ) =>
    handlePopupSearch(
      model.newFormData,
      model.setNewFormData,
      sqlId,
      codeField,
      nameField,
    );

  const detailHeaderActions = (
    <button
      onClick={ctrl.handleDeleteDetail}
      className="h-[26px] px-2.5 text-[11px] rounded-md border border-destructive text-destructive bg-background hover:bg-destructive/5"
    >
      {Lang.get("BTN_DEL")}
    </button>
  );

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
        onClick={() => model.setNewSlideOpen(false)}
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
            audit={false}
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
              setData={model.setDetailData}
              mode="edit"
              onPopupSearch={detailPopupSearch}
              codeMap={model.codeMap}
            />
          ),
          footer: detailFooter,
        }}
      />

      <FormSheetOverlay
        open={model.newSlideOpen}
        onOpenChange={model.setNewSlideOpen}
        badgeLabel={Lang.get("LBL_LCATION_CREATE_REPLACE")}
        title={Lang.get("MENU_VEHICLE_DETAIL")}
        footer={newFormFooter}
      >
        <VehicleFormBody
          data={model.newFormData}
          setData={model.setNewFormData}
          mode="new"
          onPopupSearch={newPopupSearch}
          codeMap={model.codeMap}
        />
      </FormSheetOverlay>
    </>
  );
}
