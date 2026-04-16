// src/app/config/menuComponentRegistry.ts
//
// 메뉴 컴포넌트 동적 로더.
//   - DB의 menu_code, url 로 화면 컴포넌트를 동적으로 import
//   - features/ 하위 모든 .tsx 를 build-time 에 import.meta.glob 으로 수집
//   - lazy() + Suspense 와 함께 사용 → 화면별 chunk 분리
//
// URL 규약 (옵션 A — 전체 파일 경로, .tsx 확장자 제외):
//   DB.url                              → 매칭 파일
//   ────────────────────────────────────  ──────────────────────────────────────────
//   tms/dispatchPlan/DispatchPlan        → /src/features/tms/dispatchPlan/DispatchPlan.tsx
//   tms/tender/TenderReceiveDispatch     → /src/features/tms/tender/TenderReceiveDispatch.tsx
//   adm/menuConfig/MenuConfig            → /src/features/adm/menuConfig/MenuConfig.tsx
//
// 정적 매핑 (Welcome 등 기본/공용 화면):
//   __WELCOME__ → views/common/welcome/WelCome (정적 import 유지, 자주 사용 + 사이즈 작음)

import { lazy, type ComponentType } from "react";
import Welcome from "@/views/common/welcome/WelCome";

// build-time 에 features/ 하위 모든 컴포넌트의 lazy 로더 맵을 수집
const moduleLoaders = import.meta.glob<{ default: ComponentType }>(
  "/src/features/**/*.tsx",
);

// menuCode 로 직접 매핑하는 정적 컴포넌트 (DB url 무관하게 우선 적용)
const STATIC_COMPONENTS: Record<string, ComponentType> = {
  __WELCOME__: Welcome,
};

/**
 * menuCode + url 로 화면 컴포넌트 반환.
 *  - 정적 매핑 있으면 그대로 (Welcome)
 *  - url 이 features/ 아래 파일과 매칭되면 React.lazy 컴포넌트
 *  - 매칭 실패 시 null  → HomePage 에서 "(menuCode) 아직 화면이 없습니다" 표시
 */
export function resolveMenuComponent(
  menuCode: string,
  url: string | undefined,
): ComponentType | null {
  if (STATIC_COMPONENTS[menuCode]) {
    return STATIC_COMPONENTS[menuCode];
  }
  if (!url) return null;

  const path = `/src/features/${url}.tsx`;
  const loader = moduleLoaders[path];
  if (!loader) return null;

  return lazy(loader);
}

/**
 * features/ 하위의 모든 화면 chunk를 백그라운드로 미리 다운로드.
 * 로그인 직후 / HomePage 마운트 시 호출하여 메뉴 클릭 시점의 chunk 다운로드 지연 제거.
 *  - loader() 만 호출하면 Vite가 해당 chunk JS를 fetch & 파싱
 *  - React.lazy 는 같은 loader 가 다시 호출되어도 캐싱된 모듈을 즉시 반환 → 중복 비용 없음
 *  - 에러는 무시 (옵셔널 prefetch — 실패해도 클릭 시 lazy 가 재시도)
 */
export function prefetchAllMenuComponents(): void {
  for (const loader of Object.values(moduleLoaders)) {
    loader().catch(() => {});
  }
}
