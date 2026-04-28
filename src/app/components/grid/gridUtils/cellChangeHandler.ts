// src/app/components/grid/gridUtils/cellChangeHandler.ts
//
// onCellValueChanged 자동 EDIT_STS 마킹 데코레이터.
// - pinnedBottom (합계) 행은 skip
// - INSERT 인 행은 그대로 유지
// - DELETE 마킹된 행은 그대로 유지
// - 그 외 → markUpdate 적용 후 사용자 핸들러 호출

import { markUpdate } from "./rowStatus";

export function withRowStatusTracking(
  userHandler?: (params: any) => void,
): (params: any) => void {
  return (params: any) => {
    if (!params || params.node?.rowPinned) return;
    if (params.data) markUpdate(params.data);
    userHandler?.(params);
  };
}
