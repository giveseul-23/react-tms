// src/app/components/grid/commonActions.tsx
//
// 공통 그리드 버튼 액션 팩토리.
// Controller 파일들에 반복적으로 등장하던
// 추가(ADD), 저장(SAVE), 엑셀(EXCEL GROUP) 버튼을
// 개별 설정값으로 켜고 끌 수 있도록 제공한다.
//
// 주의: 각 액션 객체의 type/key/label 구조 및 onClick 시그니처는
// 기존 Controller 코드와 byte-for-byte 동일하게 유지한다.

import { useCallback, useMemo, useState } from "react";
import {
  downExcelSearch,
  downExcelSearched,
} from "@/app/services/common/excelService";
import { TrackPanel } from "@/app/components/track/TrackPanel";
import {
  TRACK_KEY_FIELD_MAP,
  type TrackType,
} from "@/app/components/track/trackColumns";
import { Lang } from "@/app/services/common/Lang";

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
  /** 정적 컬럼 defs (폴백). excelColumns 가 값을 주면 그쪽이 우선. */
  columns: any[];
  /** 클릭 시점에 "표시 중인 컬럼 defs(audit 포함 + 런타임 숨김/순서 반영)" 를 반환하는 getter.
   *  DataGrid 화면 권장: `() => model.grids.<key>.getExcelColumns()`.
   *  빈 배열이면(그리드 미마운트 등) columns 로 폴백. */
  excelColumns?: () => any[];
  /** 서버 MENU_CD — 엑셀 3단계 세션 키. 화면의 MENU_CD/MENU_CODE 상수. */
  menuCode: string;
  /** 다운로드 파일 표시명(시트 제목). 미지정 시 menuCode 로 폴백. */
  menuName?: string;
  fetchFn: () => Promise<any> | any;
  rows: any[];
  searchUrl?: string;
  /** 지정 시 클릭 시점에 표시 중인 colId 목록을 받아 columns 를 표시된 것만/표시 순서로 거른다.
   *  (런타임 컬럼 숨김/보임 반영) 미지정이면 정적 columns 그대로 사용. */
  getVisibleColIds?: () => string[] | null | undefined;
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

// ────────────────────────────────────────────────────────────────
// 추적 그룹 / 이력조회
// ────────────────────────────────────────────────────────────────

export type TrackGroupActionConfig = {
  // 추적 핸들러 — type 받아 (e) => void 반환. 다건 조회 지원 (e.data 가 배열).
  // 보통 useTrackPanel().openTrack 을 그대로 넘김.
  onTrack: (type: TrackType) => (e?: any) => void;
  // 표시 여부 (미지정 = true). false 명시한 항목만 그룹에서 제외.
  buy?: boolean;
  sell?: boolean;
  dispatch?: boolean;
  order?: boolean;
  stop?: boolean;
  pod?: boolean;
  // 기타
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeTrackGroupAction = (config: TrackGroupActionConfig) => ({
  type: "group" as const,
  key: config.key ?? "추적",
  label: config.label ?? "추적",
  items: [
    config.buy !== false && {
      type: "button" as const,
      key: "매입",
      label: "매입",
      onClick: config.onTrack("BUY"),
    },
    config.sell !== false && {
      type: "button" as const,
      key: "매출",
      label: "매출",
      onClick: config.onTrack("SELL"),
    },
    config.dispatch !== false && {
      type: "button" as const,
      key: "배차",
      label: "배차",
      onClick: config.onTrack("DSPCH"),
    },
    config.order !== false && {
      type: "button" as const,
      key: "주문",
      label: "주문",
      onClick: config.onTrack("ORD"),
    },
    config.stop !== false && {
      type: "button" as const,
      key: "경유지",
      label: "경유지",
      onClick: config.onTrack("STOP"),
    },
    config.pod !== false && {
      type: "button" as const,
      key: "인수증",
      label: "인수증",
      onClick: config.onTrack("POD"),
    },
  ].filter(Boolean),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// 추적 그룹 액션 + 패널을 한꺼번에 관리하는 통합 훅.
// 화면은 true/false 옵션만 명시 — 핸들러/state/panel/keyField 모두 자동.
//   const track = useTrackGroupAction();
//   const track = useTrackGroupAction({ pod: false });   // 인수증만 숨김
//
//   Controller: mainActions 에 track.action 변수 참조
//   View:       bottomSlot={track.panel} / bottomOpen={track.open}
export type TrackGroupActionVisibility = {
  buy?: boolean;
  sell?: boolean;
  dispatch?: boolean;
  order?: boolean;
  stop?: boolean;
  pod?: boolean;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export function useTrackGroupAction(
  visibility: TrackGroupActionVisibility = {},
) {
  const [open, setOpen] = useState(false);
  const [trackType, setTrackType] = useState<TrackType | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const close = useCallback(() => setOpen(false), []);

  // 다건 조회: e.data 가 배열 — 모든 행에서 keyField 값을 추출해 배열로 전달.
  const openTrack = useCallback(
    (type: TrackType) => (e?: any) => {
      if (!e?.data?.length) return;
      const keyField = TRACK_KEY_FIELD_MAP[type];
      const extracted = e.data
        .map((r: any) => r[keyField])
        .filter(Boolean) as string[];
      setTrackType(type);
      setKeys(extracted);
      setOpen(true);
    },
    [],
  );

  const action = useMemo(
    () => makeTrackGroupAction({ onTrack: openTrack, ...visibility }),
    [openTrack, visibility],
  );

  const panel = useMemo(
    () => (
      <TrackPanel
        open={open}
        onClose={close}
        trackType={trackType}
        dspchNos={keys}
      />
    ),
    [open, close, trackType, keys],
  );

  return { action, panel, open, close };
}

export type HistoryActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeHistoryAction = (config: HistoryActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "이력조회",
  label: config.label ?? "이력조회",
  onClick: config.onClick ?? (() => {}),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// 클릭 시점에 엑셀 columns 를 확정한다.
//  1순위: excelColumns() — DataGrid 표시 컬럼(audit 포함, 런타임 숨김/순서 반영). 비면 폴백.
//  폴백: 정적 columns. getVisibleColIds 가 있으면(TreeGrid) 그 표시 순서로 필터.
//  컬럼 매칭 키는 colId(트리 컬럼 등) → field 순.
const resolveExcelColumns = (config: ExcelGroupActionConfig) => {
  const fromGrid = config.excelColumns?.();
  if (fromGrid && fromGrid.length > 0) return fromGrid;

  const base = config.columns;
  const visible = config.getVisibleColIds?.();
  if (!visible || visible.length === 0) return base;
  const byKey = new Map<string, any>();
  for (const col of base) {
    const key = col?.colId ?? col?.field;
    if (key != null) byKey.set(key, col);
  }
  return visible.map((id) => byKey.get(id)).filter(Boolean);
};

export const makeExcelGroupAction = (config: ExcelGroupActionConfig) => {
  const items: any[] = [];

  if (!config.hideAll) {
    items.push({
      type: "button" as const,
      key: "조회된모든데이터다운로드",
      label: "BTN_EXCEL_DOWN_ALL",
      onClick: () => {
        downExcelSearch({
          columns: resolveExcelColumns(config),
          menuName: config.menuName ?? config.menuCode,
          menuCd: config.menuCode,
          fetchFn: config.fetchFn,
        });
      },
    });
  }

  if (!config.hideVisible) {
    items.push({
      type: "button" as const,
      key: "보이는데이터다운로드",
      label: "BTN_EXCEL_DOWN_GRID",
      onClick: () => {
        downExcelSearched({
          columns: resolveExcelColumns(config),
          menuName: config.menuName ?? config.menuCode,
          menuCd: config.menuCode,
          rows: config.rows,
          searchUrl: config.searchUrl,
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
