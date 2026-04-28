// src/app/components/grid/gridUtils/cellChangeHandler.ts
//
// onCellValueChanged 자동 EDIT_STS 마킹 데코레이터.
// - pinnedBottom (합계) 행은 skip
// - EDIT_STS 컬럼 자체의 변경은 무시 (재귀 발화 방지)
// - INSERT/DELETE 마킹된 행은 그대로 유지
// - 그 외 → node.setDataValue("EDIT_STS", "U") 로 갱신
//
// 단순 객체 mutation (`row.EDIT_STS = "U"`) 만 하면 AG Grid 의 value cache 가
// stale 한 채로 남아 EDIT_STS 셀의 cellRenderer 가 옛 값을 그대로 그림.
// setDataValue 는 (1) 값 갱신 (2) cache 무효화 (3) 셀 redraw 까지 일괄 처리하므로
// 편집 즉시 rowStatus 가 "수정" 라벨로 바뀜.

import { ROW_STATUS } from "./rowStatus";

export function withRowStatusTracking(
  userHandler?: (params: any) => void,
): (params: any) => void {
  return (params: any) => {
    if (!params || params.node?.rowPinned) return;
    // EDIT_STS 자체 변경은 추적하지 않음 (setDataValue 가 다시 onCellValueChanged 발화 → 무한 루프 방지)
    if (params.colDef?.field === "EDIT_STS") return;

    const data = params.data;
    if (data && params.node) {
      const cur = data.EDIT_STS;
      if (cur !== ROW_STATUS.INSERT && cur !== ROW_STATUS.DELETE) {
        params.node.setDataValue("EDIT_STS", ROW_STATUS.UPDATE);
      }
    }
    userHandler?.(params);
  };
}
