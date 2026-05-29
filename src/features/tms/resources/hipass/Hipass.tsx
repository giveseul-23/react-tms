"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { markUpdate } from "@/app/components/grid/gridCommon";
import DataGrid from "@/app/components/grid/DataGrid";
import { usePopup } from "@/app/components/popup/PopupContext";

import { useHipassModel } from "./HipassModel";
import { useHipassController } from "./HipassController";
import { MAIN_COLUMN_DEFS } from "./HipassColumns";
import type { ColumnDef } from "./HipassColumns";
import { FormBodyRenderer } from "@/app/components/common/FormBodyRenderer";
import { GridFormPage } from "@/app/components/layout/presets/GridFormPage";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import type { DetailMode } from "./HipassModel";

export const MENU_CODE = "MENU_HIPASS_MGMT";

type HipassFormBodyProps = {
  data: any;
  setData: (updater: (prev: any) => any) => void;
  mode: DetailMode;
  onPopupSearch: (sqlId: string, codeField: string, nameField: string) => void;
  codeMap: Record<string, Record<string, string>>;
};

function formColumnsForRow(mode: DetailMode): ColumnDef[] {
  const isNew = mode === "new";
  return MAIN_COLUMN_DEFS.map((col) => {
    if (col.field === "LGST_GRP_CD" || col.field === "HIPASS_CARD_NO" || col.field === "VEH_ID") {
      return { ...col, readOnly: !isNew };
    }
    if (col.field === "CARD_COM_NM") {
      return { ...col, readOnly: !isNew };
    }
    return col;
  });
}

export function HipassFormBody({
  data,
  setData,
  mode,
  onPopupSearch,
  codeMap,
}: HipassFormBodyProps) {
  const onChange = (field: string, value: any) =>
    setData((prev: any) => ({ ...prev, [field]: value }));

  const columns = useMemo(() => formColumnsForRow(mode), [mode]);

  return (
    <FormBodyRenderer
      columns={columns}
      data={data}
      onChange={onChange}
      onPopupSearch={onPopupSearch}
      codeMap={codeMap}
      mode={mode === "new" ? "new" : "edit"}
    />
  );
}

export default function Hipass() {
  const model = useHipassModel(MENU_CODE);
  const ctrl = useHipassController({ model });

  const setDetailDataWithGrid = useCallback(
    (updater: ((prev: any) => any) | any) => {
      model.setDetailData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const selected = model.grids.main.selectedRef.current;
        if (selected && model.detailOpen) {
          const merged = { ...selected, ...next };
          markUpdate(merged);
          model.grids.main.setData((p) => ({
            ...p,
            rows: p.rows.map((r) => (r === selected ? merged : r)),
          }));
          model.grids.main.setSelected(merged);
        }
        return next;
      });
    },
    [model],
  );

  const { openPopup, closePopup } = usePopup();

  const [jumpInput, setJumpInput] = useState("");
  useEffect(() => {
    setJumpInput(String(model.detailIndex + 1));
  }, [model.detailIndex]);

  const handlePopupSearch = (
    sqlId: string,
    codeField: string,
    nameField: string,
  ) => {
    const isVehicle = sqlId === "selectVehicleCodeNameInOperation";
    openPopup({
      title: "코드 검색",
      content: (
        <CommonPopup
          sqlId={sqlId}
          filterCol={isVehicle ? "LGST_GRP_CD" : ""}
          filterValue={isVehicle ? String(model.detailData.LGST_GRP_CD ?? "") : ""}
          extraParams={isVehicle ? { keyParam: "100" } : undefined}
          onApply={(row: any) => {
            closePopup();
            const patch: Record<string, any> = {
              [codeField]: row.CODE,
            };
            if (nameField === "LBL_LOGISTICS_GROUP_NAME") {
              patch.LGST_GRP_NM = row.NAME;
            } else if (nameField === "LBL_VEH_NO") {
              patch.VEH_NO = row.NAME;
            }
            setDetailDataWithGrid((prev: any) => ({ ...prev, ...patch }));
          }}
          onClose={closePopup}
        />
      ),
      width: "2xl",
    });
  };

  const detailFooter = (
    <button
      onClick={model.closeDetail}
      className="flex-1 h-[34px] text-[13px] rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center"
    >
      닫기
    </button>
  );

  const detailTitle = model.detailData?.HIPASS_CARD_NO || "상세내역";

  return (
    <GridFormPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: [
          {
            column: "HI.HIPASS_CARD_NO",
            as: "HIPASS_CARD_NO"
          }
        ],
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
          codeMap={model.codeMap}
        />
      }
      form={{
        open: model.detailOpen,
        width: 390,
        badgeLabel: model.detailMode === "new" ? "신규" : "수정",
        title: detailTitle,
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
          <HipassFormBody
            data={model.detailData}
            setData={setDetailDataWithGrid}
            mode={model.detailMode}
            onPopupSearch={handlePopupSearch}
            codeMap={model.codeMap}
          />
        ),
        footer: detailFooter,
      }}
    />
  );
}
