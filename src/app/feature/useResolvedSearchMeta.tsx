// src/app/feature/useResolvedSearchMeta.tsx
//
// preset(MasterDetailPage / GridOnlyPage / GridFormPage / GridMapPage)에서
// menuCode 만으로 SearchMeta 를 자동 로드 + loading 시 Skeleton 게이트 제공.
//
// 사용 패턴 (preset 내부):
//   const { meta, gate } = useResolvedSearchMeta(menuCode, searchProps.meta);
//   if (gate) return gate;
//   const finalSearchProps = { ...searchProps, meta };
//
// menuCode 가 없으면 fallback(meta) 그대로 사용 — 기존 화면 호환.

import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import type { MenuAuth } from "@/app/feature/menuAuth";
import type { SearchMeta } from "@/features/search/search.meta.types";

interface ResolvedSearchMeta {
  meta: readonly SearchMeta[];
  /** loading 중이면 Skeleton, 아니면 null. preset 시작 부분에서 `if (gate) return gate;` */
  gate: React.ReactNode | null;
  /** 리소스 권한 — preset 이 MenuAuthProvider 로 주입. */
  menuAuth: MenuAuth;
}

export function useResolvedSearchMeta(
  menuCode: string | undefined,
  fallbackMeta?: readonly SearchMeta[],
  /** menuCode 미사용(직접 meta 로드) 화면의 로딩 신호 — 응답 전 게이트(Skeleton) 처리용. */
  fallbackLoading?: boolean,
): ResolvedSearchMeta {
  const auto = useSearchMeta(menuCode ?? "");
  const useAuto = !!menuCode;

  const meta = useAuto ? auto.meta : (fallbackMeta ?? []);
  const loading = useAuto ? auto.loading : (fallbackLoading ?? false);
  const error = useAuto ? auto.error : false;
  const menuAuth: MenuAuth = useAuto
    ? auto.menuAuth
    : { byId: {}, controlled: new Set<string>() };

  let gate: React.ReactNode | null = null;
  if (loading) {
    gate = <Skeleton className="h-24" />;
  } else if (error) {
    // 조회조건 로드가 재시도까지 실패 — 반쪽 화면 대신 재시도 버튼 노출
    gate = (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-slate-500">
        <span>조회조건을 불러오지 못했습니다</span>
        <Button variant="outline" size="sm" onClick={auto.retry}>
          다시 시도
        </Button>
      </div>
    );
  }

  return { meta, gate, menuAuth };
}
