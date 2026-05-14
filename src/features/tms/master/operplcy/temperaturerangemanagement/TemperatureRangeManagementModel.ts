// ────────────────────────────────────────────────────────────────
// [가이드] Model 템플릿 — base hook 패턴 (센차 ViewModel.stores 대응)
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureModel.ts)
// 2. 훅 이름 / export 타입 교체 (useXxxModel / XxxModel)
// 3. GridKey 타입의 그리드 이름을 화면에 맞게 교체
// 4. 화면 고유 state(codeMap / 외부 탭 등)는 base 뒤에 useState 로 추가
//
// 핵심
// - useBaseModel(menuCode) 한 줄로 그리드 N개의 store + selection 자동 셋업
// - storageKey prefix 는 menuCode 에서 자동 변환됨 (MENU_FOO_BAR → foo-bar)
// - 그리드 슬롯은 Proxy lazy 등록 — DataGrid 가 실제 set 호출 순간 등록
// - layout 토글값은 localStorage 자동 동기화
// ────────────────────────────────────────────────────────────────

import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// ── 그리드 이름 union ────────────────────────────────────────────
// 오타 시 컴파일 에러 (model.grids.man → 에러). 그리드 추가 시 여기 union 에 추가.
//   main   : 메인 (master)
//   detail : 상세 (detail) — 메인 행 클릭 시 fetch
export type GridKey = "main" | "detail";

export function useTemperatureRangeManagementModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  return { ...base };
}

export type TemperatureRangeManagementModel = ReturnType<typeof useTemperatureRangeManagementModel>;

// ────────────────────────────────────────────────────────────────
// [참고] 화면 고유 state 추가 패턴 — 외부 탭, 다이얼로그, 화면별 플래그 등
//
//   import { useEffect, useState } from "react";
//
//   export function useFeatureModel(menuCode: string) {
//     const base = useBaseModel<GridKey>(menuCode);
//
//     // 외부 탭 (예: LgstgrpOprConfigMst 의 configType 탭)
//     const [tabs, setTabs] = useState<{ key: string; label: string }[]>([]);
//     const [activeType, setActiveType] = useState<string>("");
//
//     useEffect(() => {
//       featureApi.getTypeList().then((res: any) => {
//         const rows = res.data?.data?.dsOut ?? [];
//         setTabs(rows.map((r: any) => ({ key: r.CODE, label: r.NAME })));
//         if (rows.length > 0) setActiveType(rows[0].CODE);
//       });
//     }, []);
//
//     return { ...base, tabs, activeType, setActiveType };
//   }
//
// [참고] 그리드가 4개 이상인 화면 (LgstgrpOprConfigMst 패턴)
//   export type GridKey = "main" | "sub01" | "sub02" | "sub03";
//   const base = useBaseModel<GridKey>(menuCode);
//   // → model.grids.main / .sub01 / .sub02 / .sub03 자동 제공
// ────────────────────────────────────────────────────────────────

