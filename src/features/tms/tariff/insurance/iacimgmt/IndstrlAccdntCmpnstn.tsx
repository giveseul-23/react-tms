"use client";

// ────────────────────────────────────────────────────────────────
// [가이드] 신규 화면 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 / 컴포넌트명을 교체
//    예) Guide_Feature.tsx → YourFeature.tsx
// 2. MENU_CODE 상수값을 메뉴 코드로 교체
// 3. import 경로를 실제 파일명에 맞게 수정
// 4. Guide_FeatureColumns / Guide_FeatureController / Guide_FeatureModel
//    3세트를 함께 교체할 것
//
// 포함하는 공통 패턴
// - MasterDetailPage 기반 Master/Detail 레이아웃
// - 레이아웃 토글 (side / vertical)
// - SearchMeta 훅을 통한 조회 조건 자동 구성
// - pageSize / currentPage / totalCount 연동 페이지네이션
// - DataGrid 공통 props
// ────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useIndstrlAccdntCmpnstnModel } from "./IndstrlAccdntCmpnstnModel";
import { useIndstrlAccdntCmpnstnController } from "./IndstrlAccdntCmpnstnController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL01_COLUMN_DEFS,
  DETAIL02_COLUMN_DEFS,
} from "./IndstrlAccdntCmpnstnColumns";

// TODO: 실제 메뉴 코드로 교체
const MENU_CODE = "MENU_IACI_MGMT";

export default function IndstrlAccdntCmpnstn() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useIndstrlAccdntCmpnstnModel();

  // ── 조회 trigger / 조회 조건 / 검색 영역에서 제외할 key ────────
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useIndstrlAccdntCmpnstnController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      // 초기 Master/Detail 비율 (합=100)
      defaultSizes={[30, 70]}
      searchProps={{
        moduleDefault: "TMS",
        meta,
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      // localStorage 에 레이아웃/사이즈 저장용 고유 키 (화면별 유일값)
      storageKey="guide-feature"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          rowData={model.gridData.rows}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="guide-feature-sub"
        >
          <DataGrid
            layoutType="plain"
            columnDefs={DETAIL01_COLUMN_DEFS}
            codeMap={model.codeMap}
            rowData={model.subDetail01RowData.rows}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.handleSubRowClicked}
          />
          <DataGrid
            layoutType="plain"
            columnDefs={DETAIL02_COLUMN_DEFS}
            codeMap={model.codeMap}
            rowData={model.subDetail02RowData.rows}
            actions={ctrl.detailActions}
          />
        </SplitPane>
      }
    />
  );
}

// ────────────────────────────────────────────────────────────────
// [참고] SplitPane 으로 detail 영역을 더 분할할 때의 예시
//
// import { SplitPane } from "@/app/components/layout/SplitPane";
//
// detail={
//   <SplitPane
//     direction="vertical"
//     defaultSizes={[50, 50]}
//     minSizes={[25, 25]}
//     handleThickness="1.5"
//     storageKey="guide-feature-sub"
//   >
//     <DataGrid ... />
//     <DataGrid
//       layoutType="tab"
//       tabs={[
//         { key: "TAB_A", label: "탭 A" },
//         { key: "TAB_B", label: "탭 B" },
//       ]}
//       presets={{
//         TAB_A: { columnDefs: TAB_A_COLUMN_DEFS, actions: ctrl.tabAActions },
//         TAB_B: { columnDefs: TAB_B_COLUMN_DEFS, actions: ctrl.tabBActions },
//       }}
//       rowData={{
//         TAB_A: model.tabARowData,
//         TAB_B: model.tabBRowData,
//       }}
//       actions={[]}
//     />
//   </SplitPane>
// }
// ────────────────────────────────────────────────────────────────
