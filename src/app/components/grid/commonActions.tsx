// src/app/components/grid/commonActions.tsx
//
// 공통 그리드 버튼 액션 팩토리.
// Controller 파일들에 반복적으로 등장하던
// 추가(ADD), 저장(SAVE), 엑셀(EXCEL GROUP) 버튼을
// 개별 설정값으로 켜고 끌 수 있도록 제공한다.
//
// 주의: 각 액션 객체의 type/key/label 구조 및 onClick 시그니처는
// 기존 Controller 코드와 byte-for-byte 동일하게 유지한다.

import { downExcelSearch, downExcelSearched } from "@/views/common/common";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type AddActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export type SaveActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export type ExcelGroupActionConfig = {
  columns: any;
  menuName: string;
  fetchFn: () => Promise<any> | any;
  rows: any[];
  /** 조회된 모든 데이터 다운로드 버튼 숨김 */
  hideAll?: boolean;
  /** 보이는 데이터 다운로드 버튼 숨김 */
  hideVisible?: boolean;
  label?: string;
  key?: string;
  disabled?: boolean;
};

// ────────────────────────────────────────────────────────────────
// 개별 팩토리
// ────────────────────────────────────────────────────────────────

export const makeAddAction = (config: AddActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "BTN_ADD",
  label: config.label ?? "BTN_ADD",
  onClick: config.onClick ?? ((_e: any) => {}),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

export const makeSaveAction = (config: SaveActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "BTN_SAVE",
  label: config.label ?? "BTN_SAVE",
  onClick: config.onClick ?? ((_e: any) => {}),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

export const makeExcelGroupAction = (config: ExcelGroupActionConfig) => {
  const items: any[] = [];

  if (!config.hideAll) {
    items.push({
      type: "button" as const,
      key: "조회된모든데이터다운로드",
      label: "조회된모든데이터다운로드",
      onClick: () => {
        downExcelSearch({
          columns: config.columns,
          menuName: config.menuName,
          fetchFn: config.fetchFn,
        });
      },
    });
  }

  if (!config.hideVisible) {
    items.push({
      type: "button" as const,
      key: "보이는데이터다운로드",
      label: "보이는데이터다운로드",
      onClick: () => {
        downExcelSearched({
          columns: config.columns,
          menuName: config.menuName,
          rows: config.rows,
        });
      },
    });
  }

  return {
    type: "group" as const,
    key: config.key ?? "BTN_EXCEL",
    label: config.label ?? "BTN_EXCEL",
    items,
    ...(config.disabled !== undefined && { disabled: config.disabled }),
  };
};

// ────────────────────────────────────────────────────────────────
// 묶음 팩토리: 추가/저장/엑셀을 한 번에 구성
// ────────────────────────────────────────────────────────────────

export type CommonActionsConfig = {
  add?: boolean | AddActionConfig;
  save?: boolean | SaveActionConfig;
  excel?: ExcelGroupActionConfig;
};

/**
 * 설정값으로 추가/저장/엑셀 버튼을 묶어서 반환.
 * - add / save: `true` 또는 설정 객체
 * - excel: 엑셀 그룹이 필요할 때만 config 객체 전달
 *
 * Controller 코드에서 `[...preActions, ...makeCommonActions({...})]` 식으로 합성 가능.
 */
export function makeCommonActions(config: CommonActionsConfig = {}): any[] {
  const actions: any[] = [];

  if (config.add) {
    actions.push(makeAddAction(config.add === true ? {} : config.add));
  }
  if (config.save) {
    actions.push(makeSaveAction(config.save === true ? {} : config.save));
  }
  if (config.excel) {
    actions.push(makeExcelGroupAction(config.excel));
  }

  return actions;
}
