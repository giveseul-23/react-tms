// src/app/components/grid/gridUtils/wrapActions.ts
//
// 액션 배열 래핑 — DataGrid · TreeGrid 공유.
// - label 에 Lang.get 자동 적용
// - onClick 호출 시 selectedRows 를 { data } 로 주입
// - "group" / "dropdown" 모두 동일하게 처리

import { Lang } from "@/app/services/common/Lang";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

export function wrapActions(
  actions: ActionItem[] | undefined,
  selectedRows: any[],
): ActionItem[] {
  return (actions ?? []).map((action) => {
    if (action.type === "button") {
      return {
        ...action,
        label: Lang.get(action.label),
        onClick: () => action.onClick?.({ data: selectedRows } as any),
      };
    }
    if (action.type === "group" || action.type === "dropdown") {
      return {
        ...action,
        label: action.label ? Lang.get(action.label) : action.label,
        items: action.items.map((item) => ({
          ...item,
          label: Lang.get(item.label),
          onClick: () => item.onClick?.({ data: selectedRows } as any),
        })),
      };
    }
    return action;
  });
}
