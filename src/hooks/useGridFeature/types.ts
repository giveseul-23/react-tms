// 그리드 N개를 선언적으로 관리하는 framework 타입.
// useGridModel + useGridController 가 이 config 를 받아 동작.

import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { LayoutType } from "@/app/components/layout/LayoutToggleButton";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

export const EMPTY_GRID: GridData = {
  rows: [],
  totalCount: 0,
  page: 1,
  limit: 20,
};

export interface GridConfig {
  /** "paginated" → state는 GridData, "array" → state는 any[] */
  type: "paginated" | "array";

  /** API 메서드 매핑 — config.api 객체의 메서드명 (string) */
  api?: {
    /** 행 데이터 조회 메서드명 (예: "getConfigList") */
    fetch?: string;
    /** 저장 메서드명 (예: "saveConfig"). dsSave payload 패턴 가정 */
    save?: string;
  };

  /** autoSelectFirstRow의 이전 선택 매칭 키 */
  rowKey?: string | string[];

  /** useGridAdd 패턴 — 신규행 템플릿. (model) => 빈 row 객체 */
  newRow?: (model: any) => any;

  /** "행 클릭 시 자동 fetch" — source 그리드 key */
  fetchOnRowClickFrom?: string;

  /** fetchOnRowClickFrom 동작 시 API params 매핑. (sourceRow, model) => params */
  paramMap?: (row: any, model: any) => Record<string, any>;

  /** add/save 외 추가 액션 (예: 동기화 버튼) */
  extraActions?: ActionItem[];

  /** DataGrid subTitle */
  subTitle?: string;

  /** 자동 첫 행 선택 (기본 true — rowKey 가 있을 때만 동작) */
  autoSelectFirstRow?: boolean;
}

export interface FeatureConfig {
  /** 메뉴 코드 — framework 내부에선 사용 안 함. View 의 useSearchMeta 등에서 사용 */
  menuCode?: string;

  /** 화면별 API 객체 — fetch/save 메서드 호출 대상 */
  api: Record<string, (...args: any[]) => Promise<any>>;

  /** 그리드 정의 — 선언 순서가 cascade 흐름 결정 (첫 그리드 → 마지막) */
  grids: Record<string, GridConfig>;

  /** state + ref 로 selectedRow 를 추적할 그리드 keys */
  selections?: string[];

  /** 첫 그리드 fetchList 호출 시 추가로 보낼 param.
   *  값은 model 참조 함수 — 예: { LGST_GRP_CNFG_GRP_CD: (m) => m.activeTab } */
  fetchListExtraParams?: Record<string, (model: any) => any>;

  /** 화면별 추가 state — Hook 내부에서 호출되어 model 에 spread 됨.
   *  (예: 외부 탭 state, useEffect 로 옵션 로딩 등) */
  extras?: () => Record<string, any>;

  /** 페이지 크기 (기본 500) */
  pageSize?: number;

  /** 외부 탭 등 model 의 특정 key 값이 바뀌면 모든 그리드 + selection 클리어 후 1페이지 재조회.
   *  값은 extras 결과의 key 이름. 첫 마운트는 자동 스킵, 빈 값(falsy)도 스킵. */
  resetOnChange?: string;

  /** Master/Detail 분할 방향 초기값 — model.layout 으로 노출 (기본 "side") */
  defaultLayout?: LayoutType;
}
