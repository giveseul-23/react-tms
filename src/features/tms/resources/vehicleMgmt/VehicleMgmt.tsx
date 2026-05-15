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

export const MENU_CODE = "MENU_VEHICLE_MGMT";

type VehicleFormBodyProps = {
  data: any;
  setData: (updater: (prev: any) => any) => void;
  mode: "new" | "edit";
  onPopupSearch: (sqlId: string, codeField: string, nameField: string) => void;
  codeMap: Record<string, Record<string, string>>;
};

export function VehicleFormBody({
  data,
  setData,
  mode,
  onPopupSearch,
  codeMap,
}: VehicleFormBodyProps) {
  const onChange = (field: string, value: any) =>
    setData((prev: any) => ({ ...prev, [field]: value }));

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
      삭제
    </button>
  );

  const detailFooter = (
    <>
      <button
        onClick={model.closeDetail}
        className="flex-1 h-[34px] text-[13px] rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center"
      >
        닫기
      </button>
      <button
        onClick={ctrl.handleSaveDetail}
        className="flex-1 h-[34px] text-[13px] rounded-md text-white flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--primary))" }}
      >
        저장
      </button>
    </>
  );

  const newFormFooter = (
    <>
      <button
        onClick={() => model.setNewSlideOpen(false)}
        className="flex-1 h-9 text-[13px] rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center"
      >
        취소
      </button>
      <button
        onClick={ctrl.handleSaveNew}
        className="flex-[2] h-9 text-[13px] rounded-md text-white flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--primary))" }}
      >
        등록 완료
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
          onSearch: ctrl.onSearchCallback,
          searchRef: model.searchRef,
          filtersRef: model.filtersRef,
          pageSize: model.pageSize,
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
          headerActions: detailHeaderActions,
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
        badgeLabel="신규 등록"
        title="차량 신규 등록"
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
