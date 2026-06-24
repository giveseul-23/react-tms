"use client";

// 차량단위 배차계획 — 좌(운송처 배차현황: 물동형/배차내역) + 우(차량 작업영역: 고정/임시) 2단 커스텀 레이아웃.
// 상단 조회조건(SearchFilters)은 GridOnlyPage 셸 재사용, 내부 패널은 커스텀.
//  - 좌/우 패널: SplitPane(가로)로 크기조정. 좌측은 접기 가능.
//  - 우측 분할: SplitPane(세로)로 고정/임시 위아래 + 크기조정.
//  - 차량작업영역 그리드는 서치트리거(floating filter) 제거.
// Phase 2(예정): 분할 시 고정↔임시 그리드 간 드래그드랍, Phase 3: 더블클릭 상세 슬라이드.

import { useEffect, useState } from "react";
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { OuterTabs } from "@/app/components/layout/OuterTabs";
import { usePopup } from "@/app/components/popup/PopupContext";
import VehicleLocationSidePanel from "@/app/components/map/VehicleLocationSidePanel";
import FixedVehiclePanel from "./panel/FixedVehiclePanel";
import DispatchDetailPop from "./popup/DispatchDetailPop";
import { dispatchPlanVehApi as api } from "./DispatchPlanVehApi";
import { useDispatchPlanVehModel } from "./DispatchPlanVehModel";
import { useDispatchPlanVehController } from "./DispatchPlanVehController";
import {
  LOCATION_SHPM_VOLUME_COLUMN_DEFS,
  LOCATION_DSPCH_COLUMN_DEFS,
  DEDICATED_TRUCK_COLUMN_DEFS,
  TEMP_TRUCK_COLUMN_DEFS,
} from "./DispatchPlanVehColumns";
import { Lang } from "@/app/services/common/Lang";

export const MENU_CODE = "MENU_DISPATCH_PLAN_VEH";

const LEFT_TABS = [
  { key: "VOLUME", label: Lang.get("LBL_SHPM_VOLUME") },
  { key: "DSPCH", label: Lang.get("LBL_DISPATCH_DETAILS") },
];
const RIGHT_TABS = [
  { key: "FIXED", label: Lang.get("LBL_DED_VEH_PLAN") },
  { key: "TEMP", label: Lang.get("LBL_SPOT_VEH_PLAN") },
];

// 차량 작업영역 그리드 — 서치트리거(floating filter) 제거(나머지 기본은 유지)
const NO_FILTER_COLDEF = {
  resizable: true,
  sortable: true,
  minWidth: 40,
  filter: false,
  floatingFilter: false,
};

// 커스텀 카드 셸 (공통 프리셋 미사용). 헤더는 subtitle 스타일.
function Card({
  title,
  className,
  headerRight,
  children,
}: {
  title: string;
  className?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col min-h-0 rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden ${className ?? ""}`}
    >
      <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b shrink-0">
        <span className="text-[11px] font-semibold text-[rgb(var(--primary))]">
          {title}
        </span>
        {headerRight}
      </div>
      <div className="flex-1 flex flex-col min-h-0 p-1.5 gap-1.5">
        {children}
      </div>
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border-b shrink-0">
      {title}
    </div>
  );
}

export default function DispatchPlanVeh() {
  const model = useDispatchPlanVehModel(MENU_CODE);
  const ctrl = useDispatchPlanVehController({ model });
  const { openPopup, closePopup } = usePopup();

  // 회전 클릭 / 임시용차 로우 클릭 → 배차상세정보 팝업
  const openDetail = () =>
    openPopup({
      width: "full",
      content: <DispatchDetailPop onClose={closePopup} />,
    });

  const [leftTab, setLeftTab] = useState("VOLUME");
  const [rightTab, setRightTab] = useState("FIXED");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [splitView, setSplitView] = useState(false);

  const onLeftTabChange = (key: string) => {
    setLeftTab(key);
  };

  // 차량위치 우측 패널 열리면 좌측(운송처 배차현황) 자동 접기
  useEffect(() => {
    if (model.vehLocPanelOpen) setLeftCollapsed(true);
  }, [model.vehLocPanelOpen]);

  // 차량위치 패널 — 선택 차량 ID + 위치 조회(getLatestVehicleLocation)
  const vehLocIds = (model.vehLocRows ?? [])
    .map((r: any) => r?.VEH_ID)
    .filter(Boolean)
    .map(String);
  const fetchVehPositions = (ids: string[]) =>
    api
      .getLatestVehicleLocation({ VEH_ID: ids })
      .then((res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? []);

  const tempGrid = (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        <DataGrid
          {...model.bind("tempTruck")}
          columnDefs={TEMP_TRUCK_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowSelection="multiple"
          actions={ctrl.conActions}
          audit={false}
          onRowDoubleClicked={openDetail}
          gridOptions={{ defaultColDef: NO_FILTER_COLDEF }}
        />
      </div>
    </div>
  );

  // 비분할 고정차량 탭 — 자차 배차 그리드(회전 1~8 컬럼)
  const dedicatedGrid = (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        <DataGrid
          {...model.bind("dedicatedTruck")}
          columnDefs={DEDICATED_TRUCK_COLUMN_DEFS}
          codeMap={model.codeMap}
          rowSelection="multiple"
          actions={ctrl.dedActions}
          audit={false}
          onRowDoubleClicked={openDetail}
          gridOptions={{ defaultColDef: NO_FILTER_COLDEF }}
        />
      </div>
    </div>
  );

  const leftGrid =
    leftTab === "VOLUME" ? (
      <DataGrid
        {...model.bind("locationShpmVolume")}
        columnDefs={LOCATION_SHPM_VOLUME_COLUMN_DEFS}
        codeMap={model.codeMap}
        actions={[]}
        audit={false}
      />
    ) : (
      <DataGrid
        {...model.bind("locationDspch")}
        columnDefs={LOCATION_DSPCH_COLUMN_DEFS}
        codeMap={model.codeMap}
        actions={[]}
        audit={false}
      />
    );

  const leftCard = (
    <Card
      title={Lang.get("LBL_SHIP_TO_PLAN")}
      className="h-full"
      headerRight={
        <button
          type="button"
          onClick={() => setLeftCollapsed(true)}
          title="접기"
          className="p-1 rounded hover:bg-slate-100 text-slate-500"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      }
    >
      <OuterTabs
        tabs={LEFT_TABS}
        activeTab={leftTab}
        onChange={onLeftTabChange}
      />
      <div className="flex-1 min-h-0">{leftGrid}</div>
    </Card>
  );

  const leftStrip = (
    <div className="w-8 shrink-0 flex flex-col items-center gap-2 rounded-lg border border-gray-200 shadow-sm bg-white py-1.5">
      <button
        type="button"
        onClick={() => setLeftCollapsed(false)}
        title="펼치기"
        className="p-1 rounded hover:bg-slate-100 text-slate-500"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <span
        className="text-[11px] font-semibold text-[rgb(var(--primary))]"
        style={{ writingMode: "vertical-rl" }}
      >
        운송처 배차현황
      </span>
    </div>
  );

  const rightCard = (
    <Card title={Lang.get("LBL_VEH_PLAN")} className="h-full">
      {/* 탭 + 분할 토글 버튼 */}
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          <OuterTabs
            tabs={RIGHT_TABS}
            activeTab={rightTab}
            onChange={setRightTab}
          />
        </div>
        <button
          type="button"
          onClick={() => setSplitView((v) => !v)}
          className={`shrink-0 ml-1 mr-1 h-6 px-2 inline-flex items-center gap-1 rounded border text-[11px] font-medium transition-colors ${
            splitView
              ? "bg-[var(--grid-header-bg)] text-[rgb(var(--primary))] border-[rgb(var(--primary))]"
              : "text-slate-500 border-gray-300 hover:bg-slate-50"
          }`}
        >
          <ArrowLeftRight className="w-3 h-3" />
          분할
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {splitView ? (
          // 분할: 고정차량(운전자정보 카드) 상단 + 임시용차 그리드 하단
          <SplitPane
            direction="vertical"
            defaultSizes={[55, 45]}
            minSizes={[25, 20]}
            storageKey="DSPCH_PLAN_VEH_RIGHT_SPLIT"
          >
            <FixedVehiclePanel
              rows={model.grids.dedicatedTruck.rows}
              onOpenDetail={openDetail}
              onShowVehLocation={ctrl.onShowVehLocation}
              onVehLocRefresh={ctrl.refreshVehLoc}
            />
            {tempGrid}
          </SplitPane>
        ) : rightTab === "FIXED" ? (
          dedicatedGrid
        ) : (
          tempGrid
        )}
      </div>
    </Card>
  );

  return (
    <>
      <GridOnlyPage
        menuCode={MENU_CODE}
        searchProps={{
          moduleDefault: "TMS",
          fetchFn: ctrl.fetchList,
          onSearchCallback: ctrl.onSearchCallback,
          ...model.bindSearch(),
        }}
        grid={
          leftCollapsed ? (
            <div className="flex gap-2 h-full min-h-0">
              {leftStrip}
              <div className="flex-1 min-w-0 min-h-0">{rightCard}</div>
            </div>
          ) : (
            <SplitPane
              direction="horizontal"
              defaultSizes={[34, 66]}
              minSizes={[18, 40]}
              storageKey="DSPCH_PLAN_VEH_OUTER"
            >
              {leftCard}
              {rightCard}
            </SplitPane>
          )
        }
      />

      <VehicleLocationSidePanel
        open={model.vehLocPanelOpen}
        onClose={() => model.setVehLocPanelOpen(false)}
        vehIds={vehLocIds}
        fetchPositions={fetchVehPositions}
      />
    </>
  );
}
