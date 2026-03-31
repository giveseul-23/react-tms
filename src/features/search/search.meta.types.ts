// src/features/search/search.meta.types.ts

export type SearchMetaDataType = "STRING" | "NUMBER" | "DATE";

interface SearchMetaBase {
  key: string;
  label: string;
  span?: number;
  required?: boolean;
  condition?: string;
  conditionLocked?: boolean;
  dataType: SearchMetaDataType;
}

export interface TextSearchMeta extends SearchMetaBase {
  type: "TEXT";
}

export interface ComboSearchMeta extends SearchMetaBase {
  type: "COMBO";
  sqlProp: string;
  keyParam: string;
  includeAll?: boolean;
  filterValues?: string[];
  defaultValue?: string;
  options?: { CODE: string; NAME: string }[];
}

export interface PopupSearchMeta extends SearchMetaBase {
  type: "POPUP";
  sqlId: string;
}

export interface DateRangeSearchMeta extends SearchMetaBase {
  type: "YMD";
  mode?: "Y" | "N";
  granularity?: string;
}

export interface CheckboxSearchMeta extends SearchMetaBase {
  type: "CHECKBOX";
}

export type SearchMeta =
  | TextSearchMeta
  | ComboSearchMeta
  | PopupSearchMeta
  | DateRangeSearchMeta
  | CheckboxSearchMeta;

// ─────────────────────────────────────────────────────────────────────────────
//  서버 API 응답 원본 타입
//  키 이름: 소문자 (CSV/API 실제 확인)
//  값:      대문자 (e.g. type: "COMBO", "TEXT", "YMD", "POPUP")
// ─────────────────────────────────────────────────────────────────────────────
export interface ServerSearchConditionRow {
  DBCOLUMN: string; // DB 컬럼명 → key
  COLUMNDESCR: string; // 메시지코드 (fallback label)
  LINENUMBER: number; // 표시 순서
  COLUMNDESCR_LANG: string; // 한국어 라벨 → label
  TYPE: string; // "TEXT" | "COMBO" | "POPUP" | "YMD"
  DATATYPE: string; // "STRING" | "NUMBER" | "DATE"
  REQUIREMENT: string; // "Y" | "N"
  DEFAULTVALUE: string; // 기본값
  SQLPROP: string; // COMBO → "CODE" / POPUP → sqlId
  OPERATOR: string; // "1"=equal "2"=percent ...
  OPERATORFIX: string; // "Y" | "N"
  VALIDDAYS: number;
  KEYPARAM: string; // COMBO keyParam
  SQLPARAM1: string;
  SQLPARAM2: string;
  SQLPARAM3: string;
  PAGESIZE: number;
  MININPLEN: number;
  OPRUSEYN: string;
  OPRIN: string; // 포함 필터: "'2030','2040',..."
  OPRNOTIN: string;
  OPREQL: string;
  OPRLIKE: string;
  DATETYPE: string;
  DTCRTETP: string;
  DATASLCTTP: string;
  CHDRLTID: string;
  SRCHCONDTTLWDT: number; // span 계산용 전체 넓이
  SRCHCONDFLDWDT: number;
  SRCHCONDFLDDFTVAL: string;
  SRCHCONDALLYN: string; // includeAll "Y" | "N"
  POPUPDATSLCTTP: string;
  FLTRCMPONM: string;
  FLTRREFCOLNM: string;
  CMBDLSPTP: string;
  RNGSRCHYN: string;
  DFTDBCLMNCD: string;
}
