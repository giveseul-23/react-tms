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

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useFeatureModel } from "./IfPlantModel";
import { useFeatureController } from "./IfPlantController";
import { MAIN_COLUMN_DEFS } from "./IfPlantColumns";

export const MENU_CODE = "MENU_IF_RCV_PLANT";

export default function IfPlant() {
  const model = useFeatureModel(MENU_CODE);
  const ctrl = useFeatureController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          {...model.bind("main")}
          rowSelection="multiple"
          authId="MAIN_GRID_IF_RCV_PLANT"
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
    />
  );
}
