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
import { useSearchMeta } from "@/hooks/useSearchMeta";
import type { SearchMeta } from "@/features/search/search.meta.types";

interface ResolvedSearchMeta {
  meta: readonly SearchMeta[];
  /** loading 중이면 Skeleton, 아니면 null. preset 시작 부분에서 `if (gate) return gate;` */
  gate: React.ReactNode | null;
}

export function useResolvedSearchMeta(
  menuCode: string | undefined,
  fallbackMeta?: readonly SearchMeta[],
): ResolvedSearchMeta {
  const auto = useSearchMeta(menuCode ?? "");
  const useAuto = !!menuCode;

  const meta = useAuto ? auto.meta : (fallbackMeta ?? []);
  const loading = useAuto ? auto.loading : false;
  const gate = loading ? <Skeleton className="h-24" /> : null;

  return { meta, gate };
}
