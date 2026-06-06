// src/app/components/grid/gridUtils/wrapActions.ts
//
// 액션 배열 래핑 — DataGrid · TreeGrid 공유.
// - label 에 Lang.get 자동 적용
// - onClick 호출 시 selectedRows 를 { data } 로 주입
// - "group" / "dropdown" 모두 동일하게 처리

import { Lang } from "@/app/services/common/Lang";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { AuthFlags } from "@/app/feature/menuAuth";

export function wrapActions(
  actions: ActionItem[] | undefined,
  selectedRows: any[],
  gridAuth?: AuthFlags | null,
): ActionItem[] {
  // authCls 가 있고 그리드 권한이 그 클래스를 불허하면 비활성. (권한정보 없으면 변화 없음)
  const denied = (authCls?: string): boolean =>
    !!authCls && !!gridAuth && (gridAuth as any)[authCls] === false;

  return (actions ?? []).map((action) => {
    if (action.type === "button") {
      return {
        ...action,
        label: Lang.get(action.label),
        disabled: action.disabled || denied(action.authCls),
        onClick: () => action.onClick?.({ data: selectedRows } as any),
      };
    }
    if (action.type === "group" || action.type === "dropdown") {
      return {
        ...action,
        label: action.label ? Lang.get(action.label) : action.label,
        disabled: action.disabled || denied(action.authCls),
        items: action.items.map((item) => ({
          ...item,
          label: Lang.get(item.label),
          disabled: item.disabled || denied(item.authCls),
          onClick: () => item.onClick?.({ data: selectedRows } as any),
        })),
      };
    }
    return action;
  });
}
