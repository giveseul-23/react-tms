"use client";

// ────────────────────────────────────────────────────────────────
// [가이드] 신규 화면 템플릿 — base hook 패턴 (LgstgrpOprConfigMst 기준)
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 / 컴포넌트명 교체
//    예) Guide_Feature.tsx → YourFeature.tsx
// 2. MENU_CODE 상수값을 메뉴 코드로 교체
// 3. import 경로를 실제 파일명에 맞게 수정
// 4. Guide_FeatureColumns / Guide_FeatureController / Guide_FeatureModel /
//    Guide_FeatureApi 4세트를 함께 교체할 것
//
// 이 템플릿이 보여주는 패턴
// - useBaseModel(MENU_CODE) — storageKey + grid 슬롯 자동 셋업
// - <DataGrid {...model.bind("xxx")} /> — DataGrid 표준 props spread
// - defaultDirection / layoutToggle 만 선언 — 토글값 / direction 매핑은 preset 내부 자동
// - SearchFilters 의 searchRef / filtersRef 연동
// - Master/Detail 1+1 기본 레이아웃 (확장 패턴은 하단 주석 참고)
// ────────────────────────────────────────────────────────────────

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useFeatureModel } from "./ShipmonitorModel";
import { useFeatureController } from "./ShipmonitorController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./ShipmonitorColumns";

// TODO: 실제 메뉴 코드로 교체
export const MENU_CODE = "MENU_SHIPMENT_MONITOR";

export default function Feature() {
  // useBaseModel 이 searchRef / filtersRef / storageKeys / pageSize 자동 셋업.
  // MasterDetailPage 가 menuCode 받으면 SearchMeta 자동 로드 + loading skeleton 자동.
  const model = useFeatureModel(MENU_CODE);
  const ctrl = useFeatureController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[40, 60]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      // 초기 분할 방향만 선언. 사용자 토글값은 localStorage 자동 동기화. (기본값 "horizontal")
      defaultDirection="vertical"
      // 토글 버튼 on/off — 기본 true. 그리드 1개라 숨길 화면에서만 false 명시.
      layoutToggle={true}
      // storageKey 들은 menuCode 에서 자동 생성됨 (model.storageKeys.*)
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={{
            delete: false,
          }}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.detailActions}
          audit={{
            delete: false,
          }}
        />
      }
    />
  );
}

// ────────────────────────────────────────────────────────────────
// 복잡도별 참조 화면 (CLAUDE.md §4 표 참조)
//   입문형      → src/features/tms/master/domain/currency/                       (GridOnlyPage 단일 그리드)
//   기본형      → src/features/tms/master/organization/env/division/divdft/      (이 템플릿 형태)
//   다중 sub    → src/features/tms/master/account/location/                      (메인 → 12개 sub fan-out)
//   동적 컬럼   → src/features/tms/calculate/vhcunit/dtrsptnrpt/                 (조회 시 컬럼 runtime 생성)
//   중첩 탭     → src/features/tms/calculate/apsettlmgmt/                        (탭 + SplitPane + 트리거 액션)
//   풀세트     → src/features/tms/master/organization/lgstgrpOprConfigMst/      (외부 탭 + 4그리드 + 동기화)
// ────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// [참고 1] detail 영역을 SplitPane 으로 분할 (3그리드)
//
//   import { SplitPane } from "@/app/components/layout/SplitPane";
//
//   detail={
//     <SplitPane
//       direction="horizontal"
//       defaultSizes={[50, 50]}
//       minSizes={[25, 25]}
//       handleThickness="1.5"
//       storageKey={model.storageKeys.bottom}    // ← 자동 생성된 키 사용
//     >
//       <DataGrid {...model.bind("sub01")} ... />
//       <DataGrid {...model.bind("sub02")} ... />
//     </SplitPane>
//   }
//
// [참고 2] 외부 탭 (LgstgrpOprConfigMst 의 configType 탭)
//
//   <MasterDetailPage
//     outerTabs={{
//       tabs: model.tabs,                      // [{ key, label }, ...]
//       activeTab: model.activeType,
//       onChange: ctrl.onTabChange,            // 탭 변경 시 reset + 재조회
//     }}
//     ...
//   />
//
// [참고 3] master/detail 둘 다 SplitPane (4그리드 — LgstgrpOprConfigMst 패턴)
//
//   master={
//     <SplitPane storageKey={model.storageKeys.top} ...>
//       <DataGrid {...model.bind("main")} ... />
//       <DataGrid {...model.bind("sub01")} ... />
//     </SplitPane>
//   }
//   detail={
//     <SplitPane storageKey={model.storageKeys.bottom} ...>
//       <DataGrid {...model.bind("sub03")} ... />
//       <DataGrid {...model.bind("sub02")} ... />
//     </SplitPane>
//   }
//
// [참고 4] 탭 그리드 (한 영역 안에 여러 탭으로 그리드 전환)
//
//   <DataGrid
//     layoutType="tab"
//     tabs={[
//       { key: "TAB_A", label: "탭 A" },
//       { key: "TAB_B", label: "탭 B" },
//     ]}
//     presets={{
//       TAB_A: { columnDefs: TAB_A_COLUMN_DEFS, actions: ctrl.tabAActions },
//       TAB_B: { columnDefs: TAB_B_COLUMN_DEFS, actions: ctrl.tabBActions },
//     }}
//     rowData={{
//       TAB_A: model.grids.tabA.rows,
//       TAB_B: model.grids.tabB.rows,
//     }}
//     actions={[]}
//   />
//
// [참고 5] 동적 컬럼 — 조회 시 메타 fetch → 컬럼 runtime 생성 (ApDailyManagement 패턴)
//
//   Model:
//     const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(DAILY_MAIN_COLUMN_DEFS);
//     return { ...base, mainColumnDefs, setMainColumnDefs };
//
//   Controller (fetchList 안에서 메타 fetch + setState):
//     const chgCacheRef = useRef<{ key: string; list: any[] }>({ key: "", list: [] });
//     const fetchList = useCallback(async (params) => {
//       const cacheKey = `${divCd}|${lgstGrpCd}`;
//       if (chgCacheRef.current.key !== cacheKey) {
//         const chgRes = await api.getUsedChgCd({ DIV_CD, LGST_GRP_CD });
//         const chgList = chgRes?.data?.result ?? [];
//         chgCacheRef.current = { key: cacheKey, list: chgList };
//         model.setMainColumnDefs(buildDailyColumns(HEAD, TAIL, chgList));
//       }
//       return api.getList({ dynamicColumns: chgCacheRef.current.list, ...params });
//     }, [model]);
//
//   View:
//     <DataGrid {...model.bind("main")} columnDefs={model.mainColumnDefs} ... />
// ────────────────────────────────────────────────────────────────
