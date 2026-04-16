// src/views/vehicleMgmt/VehicleMgmt.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridFormPage } from "@/app/components/layout/presets/GridFormPage";
import { FormSheetOverlay } from "@/app/components/layout/FormSheet";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";

import { useVehicleMgmtModel } from "./VehicleMgmtModel.ts";
import { useVehicleMgmtController } from "./VehicleMgmtController.tsx";
import { FormBodyRenderer } from "@/app/components/common/FormBodyRenderer";
import {
  MAIN_COLUMN_DEFS,
  MAIN_GRID_COLUMN_DEFS,
} from "./VehicleMgmtColumns.tsx";

const MENU_CODE = "MENU_VEHICLE_MGMT";

// ── 차량관리 폼 본문 (상세/신규 공통) ─────────────────────────────────

type VehicleFormBodyProps = {
  data: any;
  setData: (updater: (prev: any) => any) => void; // 추가
  mode: "new" | "edit";
  onPopupSearch: (sqlId: string, codeField: string, nameField: string) => void;
  codeMap: Record<string, Record<string, string>>; // 추가
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

// ═══════════════════════════════════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════════════════════════════════
export default function VehicleMgmt() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useVehicleMgmtModel();
  const { openPopup, closePopup } = usePopup();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});

  const ctrl = useVehicleMgmtController({ model, searchRef, filtersRef });

  // ── 번호 직접 입력 상태 ───────────────────────────────────────
  const [jumpInput, setJumpInput] = useState("");
  useEffect(() => {
    setJumpInput(String(model.detailIndex + 1));
  }, [model.detailIndex]);

  if (loading) return <Skeleton className="h-24" />;

  // ── 팝업 검색 공통 핸들러 ──────────────────────────────────────
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

  // ── 상세 패널 팝업 검색 ────────────────────────────────────────
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

  // ── 신규 폼 팝업 검색 ─────────────────────────────────────────
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

  // ── 상세 패널 헤더 액션 (삭제) ─────────────────────────────────
  const detailHeaderActions = (
    <button
      onClick={ctrl.handleDeleteDetail}
      className="h-[26px] px-2.5 text-[11px] rounded-md border border-destructive text-destructive bg-background hover:bg-destructive/5"
    >
      삭제
    </button>
  );

  // ── 상세 패널 푸터 (닫기 / 저장) ───────────────────────────────
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

  // ── 신규등록 Sheet 푸터 ───────────────────────────────────────
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
        searchProps={{
          meta,
          moduleDefault: "TMS",
          fetchFn: ctrl.fetchVehicleList,
          onSearch: ctrl.handleSearch,
          searchRef,
          filtersRef,
          pageSize: model.pageSize,
        }}
        grid={
          <DataGrid
            layoutType="plain"
            columnDefs={MAIN_GRID_COLUMN_DEFS(model.codeMap)}
            rowData={model.gridData.rows}
            totalCount={model.gridData.totalCount}
            currentPage={model.gridData.page}
            pageSize={model.pageSize}
            onPageSizeChange={model.setPageSize}
            onPageChange={(page) => searchRef.current?.(page, false)}
            actions={ctrl.mainActions}
            onRowClicked={ctrl.handleRowClicked}
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
            total: model.gridData.totalCount,
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

      {/* ── 신규 등록 슬라이드 오버레이 ─────────────────────────── */}
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
