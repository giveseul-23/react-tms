import { useBaseController } from "@/app/feature/useBaseController";
import type { PchartModel, GridKey } from "./PchartModel";

interface Args {
  model: PchartModel;
}

// 서버 PchartController.js 는 onSearch 에서 동작 없는 테스트 ajax(/useStatusService/searchTest)만 호출하고
// iframe onload 로그만 찍는다(no-op). 화면 핸들러가 없으므로 base 헬퍼만 배선해 둔다.
// TODO: 임베드 토큰 방식으로 전환 시 토큰 fetch 핸들러 추가.
export function usePchartController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  return base;
}
