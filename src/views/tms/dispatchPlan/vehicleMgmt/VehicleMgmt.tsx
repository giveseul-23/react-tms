// src/views/vehicleMgmt/VehicleMgmt.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { StandardPageLayout } from "@/app/components/layout/StandardPageLayout";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/views/common/CommonPopup";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";

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

  // ── 상세 패널 (우측 슬라이드) ──────────────────────────────────
  const detailPanel = model.detailOpen && (
    <div
      className="shrink-0 border-l border-border bg-background flex flex-col overflow-hidden"
      style={{
        width: 390,
        transition: "width 0.25s ease",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-[10px] bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]">
            수정
          </span>
          <span className="text-[13px] font-medium">
            {model.detailData?.VEH_NO ?? "상세내역"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={ctrl.handleDeleteDetail}
            className="h-[26px] px-2.5 text-[11px] rounded-md border border-destructive text-destructive bg-background hover:bg-destructive/5"
          >
            삭제
          </button>
          <button
            onClick={model.closeDetail}
            className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const num = Number(jumpInput);
                if (num >= 1 && num <= model.gridData.totalCount) {
                  ctrl.handleJumpTo(num);
                } else {
                  setJumpInput(String(model.detailIndex + 1));
                }
              }
            }}
            onBlur={() => setJumpInput(String(model.detailIndex + 1))}
            disabled={model.navigating}
            className="w-10 h-[22px] text-xs text-center border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-[rgb(var(--primary))]"
          />
          <span className="text-xs text-muted-foreground">
            / {model.gridData.totalCount}
          </span>
          {model.navigating && (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex gap-1">
          <button
            disabled={model.detailIndex <= 0 || model.navigating}
            onClick={() => ctrl.handleNavigate(-1)}
            className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={
              model.detailIndex >= model.gridData.totalCount - 1 ||
              model.navigating
            }
            onClick={() => ctrl.handleNavigate(1)}
            className="w-[26px] h-[26px] border border-input rounded-md bg-background flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-3.5">
        <VehicleFormBody
          data={model.detailData}
          setData={model.setDetailData}
          mode="edit"
          onPopupSearch={detailPopupSearch}
          codeMap={model.codeMap}
        />
      </div>

      {/* 푸터 */}
      <div className="flex gap-2 px-3.5 py-2.5 border-t border-border shrink-0">
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
      </div>
    </div>
  );

  // ── 그리드 + 상세패널 합쳐서 singleGrid 렌더 ──────────────────
  const gridContent = (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
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
      </div>
      {detailPanel}
    </div>
  );

  return (
    <>
      <StandardPageLayout
        meta={meta}
        moduleDefault="TMS"
        fetchFn={ctrl.fetchVehicleList}
        onSearch={ctrl.handleSearch}
        searchRef={searchRef}
        filtersRef={filtersRef}
        pageSize={model.pageSize}
        singleGrid={{ render: gridContent }}
      />

      {/* ── 신규 등록 슬라이드 오버레이 ─────────────────────────── */}
      <Sheet open={model.newSlideOpen} onOpenChange={model.setNewSlideOpen}>
        <SheetContent
          side="right"
          className="w-[520px] sm:max-w-[520px] p-0 gap-0 flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-[10px] bg-emerald-100 text-emerald-700">
                신규 등록
              </span>
              <span className="text-sm font-medium">차량 신규 등록</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto p-4">
            <VehicleFormBody
              data={model.newFormData}
              setData={model.setNewFormData}
              mode="new"
              onPopupSearch={newPopupSearch}
              codeMap={model.codeMap}
            />
          </div>

          {/* 푸터 */}
          <div className="flex gap-2 px-4 py-3 border-t border-border shrink-0">
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
