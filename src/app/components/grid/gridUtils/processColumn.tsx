// src/app/components/grid/gridUtils/processColumn.tsx
// Shared column transformation helpers for DataGrid and TreeGrid.
//
// 컬럼 정의(ColDef) 변환 로직 — DataGrid 와 TreeGrid 모두 동일하게 사용.
//
// 처리 항목:
//   - codeKey → cellRenderer 자동 주입 (codeMap 의 코드 → 라벨 변환)
//   - type "combo" + editable + codeKey → cellEditor 로 ComboCellEditor 자동 주입
//     (평소엔 라벨 텍스트, 편집 시엔 dropdown — 옵션은 codeMap[codeKey] 전체)
//   - headerName Lang.get (noLang:true 면 원문 유지)
//   - ColGroupDef.children 재귀 변환
//   - align prop → cellStyle.textAlign + headerClass (type 정렬보다 우선)
//   - type "numeric" → 우측 정렬 + decimalPlaces 자동 포맷 (align prop 우선)
//   - type "date" / fieldType "date" → 중앙 정렬 + YYYY-MM-DD 슬라이스 (align prop 우선)
//   - field 이름 *DTTM* → Util.formatDttm 자동 포맷 + (type:"date" 면 중앙 정렬)
//   - field 이름 *_STS* → 중앙 정렬 (cellStyle/type/align 미지정 시)
//   - type 미지정 → "text" 자동 주입
//   - disableMaxWidth:true → maxWidth null

import React from "react";
import { Search } from "lucide-react";
import type { ColDef, ColGroupDef } from "ag-grid-community";

import { Lang } from "@/app/services/common/Lang";
import { Util } from "@/app/services/common/Util";
import { ComboCellEditor } from "@/app/components/grid/cellEditors/ComboCellEditor";
import { PasswordCellEditor } from "@/app/components/grid/cellEditors/PasswordCellEditor";
import { MaskedTextCellEditor } from "@/app/components/grid/cellEditors/MaskedTextCellEditor";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/app/components/ui/popover";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import {
  commitRowChange,
  commitRowChanges,
  commitSingleModeCheck,
} from "./rowStatus";

// CommonPopup 은 내부에서 DataGrid 를 렌더 → 정적 import 시 순환참조.
// lazy 로 끊고, 팝업 셀이 실제로 열릴 때만 로드한다.
const CommonPopup = React.lazy(() =>
  import("@/app/components/popup/CommonPopup").then((m) => ({
    default: m.CommonPopup,
  })),
);

// 주소찾기 팝업 — type "address" 셀이 열릴 때만 로드.
const AddressPop = React.lazy(() =>
  import("@/app/components/popup/AddressPop").then((m) => ({
    default: m.AddressPop,
  })),
);

// type "address" 컬럼이 그리드 행에 write-back 할 필드명 (센차 record* 매핑 대응).
// 컬럼의 addrFields 로 부분 오버라이드 가능.
const DEFAULT_ADDR_FIELDS = {
  ctryCd: "CTRY_CD",
  ctryNm: "CTRY_NM",
  sttCd: "STT_CD",
  sttNm: "STT_NM",
  ctyCd: "CTY_CD",
  ctyNm: "CTY_NM",
  zipCd: "ZIP_CD",
  dtlAddr1: "DTL_ADDR1",
  dtlAddr2: "DTL_ADDR2",
};

// insertable 은 ag-grid 표준이 아닌 프로젝트 자체 편집정책 prop (EDIT_STS 기반).
// AbstractColDef 에 선언 병합 → ColDef/ColGroupDef(=AnyCol) 전체가 1급 속성으로 보유.
declare module "ag-grid-community" {
  // 제네릭 시그니처는 ag-grid 원본과 동일해야 선언 병합됨 (본문 미사용은 정상).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AbstractColDef<TData = any, TValue = any> {
    insertable?: boolean;
  }
}

type AnyCol = ColDef<any> | ColGroupDef<any>;

export type ProcessOptions = {
  codeMap?: Record<string, Record<string, string>>;
  /** "No" 컬럼처럼 row 길이에 따른 width 가 필요한 경우 사용. (TreeGrid 는 미사용) */
  rowCountForNo?: number;
  /** ComboCellEditor 가 commit 시 React state 의 rows 배열을 갱신하기 위해 사용.
   *  ag-grid 의 cellEditor commit 흐름은 internal node.data 만 mutate 하고
   *  React state 까지 도달 못 해 stale row 로 reset 되는 케이스가 있음 →
   *  cellEditor 가 직접 setRowData 호출해 양쪽 동기화. */
  setRowData?: (updater: any) => void;
  /** type "popup"/"popuser" 셀이 팝업을 띄울 때 사용 — DataGrid 가 usePopup() 으로 주입. */
  openPopup?: (payload: {
    title?: string;
    content: React.ReactNode;
    width?: any;
  }) => void;
  closePopup?: () => void;
  /** 그리드 인라인 편집 전면 차단 — 폼(GridFormPage)이 편집 surface 인 화면.
   *  picker/돋보기/combo/native editable/체크박스 토글을 모두 끄고 표시 전용으로. */
  readOnly?: boolean;
  /** 화면 model — popup 컬럼의 extraParams(row, model) 2번째 인자로 전달.
   *  다른 그리드 선택행 값 공유에 사용 (예: model.grids.main.selectedRef.current). */
  model?: any;
};

const HEADER_PADDING = 32;
const CELL_PADDING = 24;

// ag-grid 가 모르는 우리 커스텀 colDef 키들 — 내부 processColumn 분기에서만
// 활용하고 ag-grid 에 넘기기 전에 strip. 그대로 두면:
//   1) "invalid colDef property" 경고 발생
//   2) colDef.type 이 columnTypes 에 없으면 ag-grid 의 valueGetter 동작이
//      일관되지 않아 cellRenderer 의 params.value 가 undefined 로 들어옴
const CUSTOM_KEYS = new Set([
  "type",
  "align",
  "codeKey",
  "fieldType",
  "decimalPlaces",
  "disableMaxWidth",
  "noLang",
  "summable",
  "defaultValue",
  "dateUnit",
  "regex",
  "regexText",
  "maskRe",
  "editAllowField",
  "editDisableMsg",
  "validators",
  "isPrimaryKey",
  "insertable",
  "inputType",
  "required",
  // popup / popuser 컬럼 전용
  "sqlId",
  "fetchFn",
  "nameField",
  "popupTitle",
  "popupWidth",
  "renderPopup",
  "keyParam",
  "extraParams",
  "callback",
  // address 컬럼 전용
  "addrFields",
]);

function stripCustomKeys<T extends Record<string, any>>(col: T): T {
  const out: Record<string, any> = {};
  for (const k of Object.keys(col)) {
    if (!CUSTOM_KEYS.has(k)) out[k] = col[k];
  }
  return out as T;
}

let canvasRef: HTMLCanvasElement | null = null;
function measureTextWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!canvasRef) canvasRef = document.createElement("canvas");
  const ctx = canvasRef.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = "11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif";
  return ctx.measureText(text).width;
}

const translate = (col: any): string =>
  col?.noLang ? col.headerName : Lang.get(col.headerName);

function walkChildren(
  children: any[] | undefined,
  opts: ProcessOptions,
): any[] | undefined {
  if (!Array.isArray(children)) return children;
  const { codeMap, setRowData } = opts;
  return children.map((child) => {
    const withRenderer = injectCodeRenderer(child, codeMap) as any;
    const withEditor = injectComboEditor(
      withRenderer,
      codeMap,
      setRowData,
    ) as any;
    const withPassword = injectPasswordEditor(withEditor, setRowData) as any;
    const withMask = injectMaskEditor(withPassword, setRowData) as any;
    const withText = injectValidation(withMask) as any;
    const withCheck = injectCheckRenderer(
      withText,
      setRowData,
      opts.readOnly,
    ) as any;
    const withPopup = injectPopupCell(withCheck, opts) as any;
    const withAddress = injectAddressCell(withPopup, opts) as any;
    const withDate = injectDateCell(withAddress, opts) as any;
    const withPolicy = applyEditPolicy(withDate, opts.readOnly) as any;
    const withRequired =
      (child as any).required === true ||
      (child as any).validators?.required === true
        ? mergeHeaderClass(withPolicy, "ag-header-required")
        : withPolicy;
    return stripCustomKeys({
      ...withRequired,
      headerName: translate(withRequired),
      children: walkChildren(withRequired.children, opts),
    });
  });
}

/** codeKey 가 있는 컬럼에 자동 cellRenderer 주입 (이미 cellRenderer 있으면 유지). */
function injectCodeRenderer(
  col: AnyCol,
  codeMap?: Record<string, Record<string, string>>,
): AnyCol {
  const codeKey = (col as any).codeKey as string | undefined;
  if (!codeKey || (col as any).cellRenderer) return col;
  return {
    ...col,
    cellRenderer: (params: any) => {
      const code = params.value;
      // 빈값(빈 문자열 / null / undefined) 은 회색 "―" 로 표시.
      // 실제 데이터는 그대로 두고 표시만 변경 — 저장 시 빈값 그대로 전송됨.
      if (code === "" || code == null) {
        return (
          <span className="px-2 py-0.5 rounded-lg text-xs text-gray-400">
            -
          </span>
        );
      }
      const label = codeMap?.[codeKey]?.[String(code)] ?? code;
      return <span className="px-2 py-0.5 rounded-lg text-xs">{label}</span>;
    },
  } as AnyCol;
}

/**
 * type "check" 컬럼에 체크박스 cellRenderer 자동 주입.
 *   - 표시: row[field] === "Y" → checked, 아니면 unchecked
 *   - 클릭: "Y" ↔ "N" 토글 → commitRowChange 로 React state 갱신 + EDIT_STS 마킹
 *   - 이미 cellRenderer 가 정의돼 있으면 유지
 *   - 신규 행의 default 값 자동 주입은 DataGrid 가 column.defaultValue 으로 처리
 *     (check 는 defaultValue 미선언 시 "N" 기본)
 */
function injectCheckRenderer(
  col: AnyCol,
  setRowData?: (updater: any) => void,
  readOnly?: boolean,
): AnyCol {
  const c = col as any;
  if (c.type !== "check") return col;
  if (c.cellRenderer) return col;
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;

  // 선언형 확장 (옵션 — 없으면 기존 단순 동작):
  //   checkEditable(params): 셀별 편집 가능 여부. false → disabled + 회색 배경.
  //   checkGroup({ total, members }): 전체↔개별 cascade.
  //     - field === total: 토글 시 total + 모든 members 일괄 set
  //     - members 중 하나: 토글 시 자신 set + total 재계산(members 전부 Y면 Y)
  const checkEditable = c.checkEditable as
    | ((params: any) => boolean)
    | undefined;
  const group = c.checkGroup as
    | { total: string; members: string[] }
    | undefined;
  // editAllowField: 토글 허용 조건 필드 — row[editAllowField] === "Y" 일 때만 토글.
  //   아니면 editDisableMsg(있으면) 안내 후 토글 차단. (센차 excheckcolumn editAllowField)
  const editAllowField = c.editAllowField as string | undefined;
  const editDisableMsg = c.editDisableMsg as string | undefined;
  const singleMode = c.singleMode as boolean | undefined;
  const extended = !!checkEditable || !!group;
  const isOn = (v: any) => v === "Y" || (extended && v === true);

  return {
    ...col,
    // 편집 불가 셀 회색 처리 (checkEditable 지정 시, 기존 cellStyle 없을 때만).
    ...(checkEditable && !c.cellStyle
      ? {
          cellStyle: (params: any) =>
            checkEditable(params)
              ? { textAlign: "center" }
              : { textAlign: "center", backgroundColor: "#f3f4f6" },
        }
      : {}),
    cellRenderer: (params: any) => {
      const checked = isOn(params.value);
      const cellDisabled =
        readOnly || (checkEditable ? !checkEditable(params) : false);
      return (
        <div className="flex items-center justify-center h-full">
          <input
            type="checkbox"
            className="ag-input-field-input ag-checkbox-input"
            checked={checked}
            disabled={cellDisabled}
            onChange={
              cellDisabled
                ? undefined
                : () => {
                    const next = checked ? "N" : "Y";
                    const row = params.node?.data;
                    // editAllowField: 허용('Y') 아니면 안내 후 토글 차단.
                    if (editAllowField && row?.[editAllowField] !== "Y") {
                      if (editDisableMsg)
                        showInfoModal(Lang.get(editDisableMsg));
                      return;
                    }
                    if (singleMode) {
                      commitSingleModeCheck(
                        setRowData,
                        row,
                        field,
                        next as "Y" | "N",
                      );
                    } else if (group && field === group.total) {
                      const patch: Record<string, any> = {
                        [group.total]: next,
                      };
                      group.members.forEach((m) => (patch[m] = next));
                      commitRowChanges(setRowData, row, patch);
                    } else if (group) {
                      const allOn = group.members.every((m) =>
                        m === field ? next === "Y" : isOn(row?.[m]),
                      );
                      commitRowChanges(setRowData, row, {
                        [field]: next,
                        [group.total]: allOn ? "Y" : "N",
                      });
                    } else {
                      commitRowChange(setRowData, row, field, next);
                    }
                  }
            }
          />
        </div>
      );
    },
  } as AnyCol;
}

/**
 * type "combo" + codeKey 컬럼에 cellEditor 자동 주입.
 *   - 평소엔 위 injectCodeRenderer 가 라벨 텍스트로 표시
 *   - 편집 시엔 ComboCellEditor 가 codeMap[codeKey] 모든 코드/명을 dropdown 으로 노출
 *   - 이미 cellEditor 가 정의돼 있으면 유지
 */
function injectComboEditor(
  col: AnyCol,
  codeMap?: Record<string, Record<string, string>>,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (c.type !== "combo") return col;
  const codeKey = c.codeKey as string | undefined;
  if (!codeKey || c.cellEditor) return col;
  return {
    ...col,
    cellEditor: ComboCellEditor,
    cellEditorParams: {
      ...(c.cellEditorParams ?? {}),
      codeMap: codeMap?.[codeKey] ?? {},
      setRowData,
    },
    cellEditorPopup: c.cellEditorPopup ?? true,
  } as AnyCol;
}

function injectPasswordEditor(
  col: AnyCol,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (c.inputType !== "password") return col;

  return {
    ...col,
    ...(c.cellEditor ? {} : { cellEditor: PasswordCellEditor }),
    cellEditorParams: {
      ...(c.cellEditorParams ?? {}),
      setRowData,
    },
    ...(c.cellRenderer
      ? {}
      : {
          cellRenderer: (params: any) => {
            const value = String(params.value ?? "");
            return "*".repeat(Math.min(value.length, 6));
          },
        }),
  } as AnyCol;
}

/** type "text" + maskRe(정규식) 컬럼에 입력마스크 에디터 주입 (센차 maskRe 대응).
 *   - maskRe 와 매칭되는 문자만 입력 허용. 이미 cellEditor 가 있으면 유지. */
function injectMaskEditor(
  col: AnyCol,
  setRowData?: (updater: any) => void,
): AnyCol {
  const c = col as any;
  if (!(c.maskRe instanceof RegExp)) return col;
  if (c.type !== "text") return col;
  if (c.cellEditor) return col;

  return {
    ...col,
    cellEditor: MaskedTextCellEditor,
    cellEditorParams: {
      ...(c.cellEditorParams ?? {}),
      maskRe: c.maskRe,
      setRowData,
      ...(c.validators?.max != null
        ? { maxLength: Number(c.validators.max) }
        : {}),
    },
  } as AnyCol;
}

const GCODE_REGEX = /^[a-zA-Z0-9_ ]+$/;
const PHONE_REGEX = /^(01[016789])[-]?\d{3,4}[-]?\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNumberType = (col: any) =>
  col?.type === "numeric" ||
  col?.type === "number" ||
  col?.dataType === "number" ||
  col?.cellDataType === "number";

/** 컬럼의 검증 regex 반환 — type "text" + (regex | validators.regexTp). 없으면 undefined. */
export function getColumnRegex(col: any): RegExp | undefined {
  if (col?.type !== "text") return undefined;
  if (col.regex instanceof RegExp) return col.regex;
  if (col.validators?.regexTp === "GCODE") return GCODE_REGEX;
  if (col.validators?.regexTp === "PHONE") return PHONE_REGEX;
  if (col.validators?.regexTp === "EMAIL") return EMAIL_REGEX;
  return undefined;
}

/** number 컬럼의 자릿수 검증 — integerLength(정수부)/pointLength(소수부) 위반 시 메시지, 통과 null.
 *  (min/max 는 메시지 없이 valueSetter 에서 입력 자체를 막으므로 여기서 안 봄) */
function getNumberError(col: any, value: any): string | null {
  const v = col?.validators;
  if (!v) return null;
  const s = String(value).replace(/,/g, "");
  if (s === "" || Number.isNaN(Number(s))) return null;
  const headerName = col.noLang ? col.headerName : Lang.get(col.headerName);

  if (v.integerLength != null) {
    const intLen = s.split(".")[0].replace("-", "").length;
    if (intLen > Number(v.integerLength)) {
      return Lang.get(
        "MSG_VALID_INT_LEN_MAX",
        headerName,
        String(v.integerLength),
      );
    }
  }
  if (v.pointLength != null) {
    const dot = s.indexOf(".");
    const decLen = dot === -1 ? 0 : s.length - dot - 1;
    if (Number(v.pointLength) === 0 && decLen > 0) {
      return Lang.get("MSG_VALID_NUM_INT", headerName);
    }
    if (decLen > Number(v.pointLength)) {
      return Lang.get(
        "MSG_VALID_POINT_LEN_MAX",
        headerName,
        String(v.pointLength),
      );
    }
  }
  return null;
}

/** 컬럼 값 검증 — 위반 시 에러 메시지(이미 Lang 적용), 통과 시 null.
 *  text: regex → MSG_REGEX_TEXT / number: integerLength·pointLength.
 *  빈값은 null(필수 여부는 required 정책에서 별도 처리). cellRenderer·saveGrid 공용. */
export function getColumnError(col: any, value: any): string | null {
  if (value == null || value === "") return null;
  if (col?.type === "text") {
    const re = getColumnRegex(col);
    if (re && !re.test(String(value))) {
      // regexText(커스텀 메시지 키/문자열) — validators 안 우선, 최상위 fallback. Lang.get 으로 키 번역.
      const msg = col.validators?.regexText ?? col.regexText;
      return msg ? Lang.get(msg) : Lang.get("MSG_REGEX_TEXT");
    }
    return null;
  }
  if (isNumberType(col)) return getNumberError(col, value);
  return null;
}

/**
 * type "text"/"number" 컬럼에 검증 주입 (저장은 saveGrid 에서 차단).
 *   - text  validators.max     → cellEditorParams.maxLength (입력 길이 제한)
 *   - text  regex/regexTp       → "!" 마커 + 셀 밖 floating 메시지 (getColumnError)
 *   - number validators.min/max → valueSetter 로 범위 밖 값 입력 거부(메시지 없음)
 *   - number integerLength/pointLength → "!" 마커 + 셀 밖 floating 메시지
 *   값이 유효해지면 사라짐(수정/추가 행 EDIT_STS I/U 에서만). required 는 기존 정책.
 *   - 이미 cellRenderer 가 있으면 마커 미주입.
 */
function injectValidation(col: AnyCol): AnyCol {
  const c = col as any;
  const isText = c.type === "text";
  const isNum = isNumberType(c);
  if (!isText && !isNum) return col;
  const v = c.validators;

  const out: any = { ...col };
  let changed = false;

  // text: 입력 길이 제한
  if (isText && v?.max != null) {
    out.cellEditor = c.cellEditor ?? "agTextCellEditor";
    out.cellEditorParams = {
      ...(c.cellEditorParams ?? {}),
      maxLength: Number(v.max),
    };
    changed = true;
  }

  // number: min/max → 범위 밖 값 입력 거부 (메시지 없이 원복)
  if (isNum && (v?.min != null || v?.max != null)) {
    const field = (c.field ?? c.colId) as string | undefined;
    if (field && !c.valueSetter) {
      const min = v.min != null ? Number(v.min) : undefined;
      const max = v.max != null ? Number(v.max) : undefined;
      out.valueSetter = (p: any) => {
        const raw = p.newValue;
        const num = Number(String(raw ?? "").replace(/,/g, ""));
        if (raw !== "" && raw != null && !Number.isNaN(num)) {
          if (min != null && num < min) return false;
          if (max != null && num > max) return false;
        }
        if (p.data) p.data[field] = raw;
        return true;
      };
      changed = true;
    }
  }

  // "!" 마커 + 셀 밖 floating 메시지 (text regex / number integer·pointLength)
  const hasMarker = isText
    ? !!getColumnRegex(c)
    : v?.integerLength != null || v?.pointLength != null;
  if (hasMarker && !c.cellRenderer) {
    const renderCol = c;
    out.cellRenderer = (p: any) => {
      if (!p.data || p.node?.rowPinned) return p.value ?? null;
      const display =
        p.valueFormatted ?? (p.value == null ? "" : String(p.value));
      const sts = p.data.EDIT_STS;
      const err =
        sts === "I" || sts === "U" ? getColumnError(renderCol, p.value) : null;
      if (!err) return <span className="truncate">{display}</span>;
      return (
        <Popover open>
          <PopoverAnchor asChild>
            <div
              className={`flex items-center gap-1 h-full w-full ${isNum ? "justify-end" : ""}`}
            >
              {isNum && (
                <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  !
                </span>
              )}
              <span className="min-w-0 truncate text-red-600">{display}</span>
              {!isNum && (
                <span className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  !
                </span>
              )}
            </div>
          </PopoverAnchor>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={2}
            hideWhenDetached
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-auto max-w-[260px] px-2 py-1 text-[11px] text-red-600 border border-red-200 bg-red-50 shadow rounded"
          >
            {err}
          </PopoverContent>
        </Popover>
      );
    };
    changed = true;
  }

  return changed ? (out as AnyCol) : col;
}

/**
 * type "popup" / "popuser" 컬럼에 셀 렌더러(값 + 돋보기) 자동 주입.
 *   - 편집(돋보기 노출) 정책은 다른 컬럼 타입과 동일하게 insertable/editable + EDIT_STS 로 제어:
 *       insertable → 추가행(EDIT_STS "I"), editable → 수정행, 둘 다 → 항상, 둘 다 미지정 → 노출 안 함.
 *     편집 불가 행은 돋보기 없이 표시값(라벨/원값) 텍스트만 렌더.
 *   - 돋보기 클릭:
 *       popup   → CommonPopup(sqlId/fetchFn) 오픈. 선택 시 field=CODE, nameField=NAME write-back.
 *       popuser → 컬럼의 renderPopup({ row, commit, close }) 결과를 openPopup content 로 띄움.
 *   - 이미 cellRenderer 가 있으면 유지.
 */
function injectPopupCell(col: AnyCol, opts: ProcessOptions): AnyCol {
  const c = col as any;
  if (c.type !== "popup" && c.type !== "popuser") return col;
  if (c.cellRenderer) return col;
  if (opts.readOnly) return col; // 폼 화면 그리드: 돋보기 미주입(표시 전용)
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;

  const codeKey = c.codeKey as string | undefined;
  const isUser = c.type === "popuser";
  // 돋보기 노출(편집) 정책 — 다른 컬럼 타입과 동일 (resolveEditMode):
  //   둘 다 미지정 → 항상 노출, insertable → 추가행, editable → 수정행, 명시적 끔 → 노출 안 함.
  const mode = resolveEditMode(c);
  if (mode === "none") return col;

  return {
    ...col,
    // 팝업 셀은 ag-grid 네이티브 인라인 편집을 쓰지 않음 →
    // applyEditPolicy 의 기본값(true)이 인라인 에디터를 안 박도록 editable:false 로 strip.
    insertable: false,
    editable: false,
    cellRenderer: (params: any) => {
      if (!params.data || params.node?.rowPinned) return null;
      const { openPopup, closePopup, setRowData, codeMap } = opts;
      const raw = params.value;
      const display =
        raw === "" || raw == null
          ? ""
          : codeKey
            ? (codeMap?.[codeKey]?.[String(raw)] ?? raw)
            : raw;

      // 편집 가능 여부 (EDIT_STS 기반) — 안 되면 돋보기 없이 표시값만
      const editStsI = params.node?.data?.EDIT_STS === "I";
      const cellEditable = rowEditableByMode(mode, editStsI);
      if (!cellEditable) {
        return <span className="truncate">{display}</span>;
      }

      const row = params.node?.data;
      const close = () => closePopup?.();

      const onOpen = () => {
        if (!openPopup) return;
        if (isUser) {
          const content = c.renderPopup?.({
            row,
            commit: (patch: Record<string, any>) =>
              commitRowChanges(setRowData, row, patch),
            close,
            // popup 타입과 동일한 추가 세팅 콜백 — renderPopup 의 onApply 에서 callback(picked) 호출.
            callback: (picked: any) =>
              c.callback?.({
                picked,
                row,
                commit: (p: Record<string, any>) =>
                  commitRowChanges(setRowData, row, p),
              }),
          });
          if (content) {
            openPopup({
              title: c.popupTitle ?? c.headerName,
              width: c.popupWidth ?? "2xl",
              content,
            });
          }
        } else {
          // extraParams 평가 — 함수형이면 (row, model) 전달. 같은 행은 row,
          // 다른 그리드 값은 model.grids.<key>.selectedRef. 참조 중 throw 하면 "선택행 없음" 가드 모달.
          let resolvedExtra: Record<string, any>;
          try {
            resolvedExtra = {
              ...(c.keyParam ? { keyParam: c.keyParam } : {}),
              // 정적 객체 또는 (row, model)=>객체 — 같은 행 값(row) 또는 다른 그리드 선택행(model.grids.<key>.selectedRef)을 SQL 파라미터로 전달.
              ...(typeof c.extraParams === "function"
                ? c.extraParams(row, opts.model)
                : (c.extraParams ?? {})),
            };
          } catch (e: any) {
            openPopup({
              title: c.popupTitle ?? c.headerName,
              content: (
                <ConfirmModal
                  type="check"
                  title={Lang.get("TTL_CONFIRM")}
                  description={e?.message || "선택된 행이 없습니다."}
                  onClose={close}
                />
              ),
            });
            return;
          }
          openPopup({
            title: c.popupTitle ?? c.headerName,
            width: c.popupWidth ?? "2xl",
            content: (
              <React.Suspense fallback={null}>
                <CommonPopup
                  sqlId={c.sqlId}
                  fetchFn={c.fetchFn}
                  extraParams={resolvedExtra}
                  onApply={(picked: any) => {
                    const patch: Record<string, any> = { [field]: picked.CODE };
                    if (c.nameField) patch[c.nameField] = picked.NAME;
                    commitRowChanges(setRowData, row, patch);
                    // 선택 후 추가 세팅 콜백 (예: 종속 필드 초기화). 센차 callback(params,opener,receiveRecord) 대응.
                    c.callback?.({
                      picked,
                      row,
                      commit: (p: Record<string, any>) =>
                        commitRowChanges(setRowData, row, p),
                    });
                    close();
                  }}
                  onClose={close}
                />
              </React.Suspense>
            ),
          });
        }
      };

      return (
        <div className="flex items-center gap-1 h-full w-full">
          <span className="flex-1 truncate">{display}</span>
          <button
            type="button"
            onClick={onOpen}
            className="shrink-0 p-0.5 text-slate-400 hover:text-[rgb(var(--primary))]"
            aria-label="검색"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  } as AnyCol;
}

/**
 * type "address" 컬럼에 "주소찾기" 액션 셀 주입 (센차 excolumnaddress 대응).
 *   - 돋보기 노출(편집) 정책은 다른 타입과 동일 (resolveEditMode + EDIT_STS).
 *   - 클릭 → AddressPop 오픈. 적용 시 addrFields 매핑대로 다중필드 write-back.
 *   - field 가 없는 액션 컬럼이므로 표시값은 없고 버튼만 렌더.
 */
function injectAddressCell(col: AnyCol, opts: ProcessOptions): AnyCol {
  const c = col as any;
  if (c.type !== "address") return col;
  if (c.cellRenderer) return col;
  if (opts.readOnly) return col;
  const mode = resolveEditMode(c);
  if (mode === "none") return col;

  const fields = { ...DEFAULT_ADDR_FIELDS, ...(c.addrFields ?? {}) };

  return {
    ...col,
    insertable: false,
    editable: false,
    cellRenderer: (params: any) => {
      if (!params.data || params.node?.rowPinned) return null;
      const editStsI = params.node?.data?.EDIT_STS === "I";
      if (!rowEditableByMode(mode, editStsI)) return null;

      const { openPopup, closePopup, setRowData } = opts;
      const row = params.node?.data;
      const onOpen = () => {
        if (!openPopup) return;
        openPopup({
          title: "LBL_ADDR",
          width: c.popupWidth ?? "lg",
          content: (
            <React.Suspense fallback={null}>
              <AddressPop
                row={row}
                fields={fields}
                onApply={(patch: Record<string, any>) => {
                  commitRowChanges(setRowData, row, patch);
                  closePopup?.();
                }}
                onClose={() => closePopup?.()}
              />
            </React.Suspense>
          ),
        });
      };

      return (
        <div className="flex items-center justify-center h-full">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center justify-center p-0.5 text-slate-400 hover:text-[rgb(var(--primary))]"
            aria-label={Lang.get("LBL_FIND_ADDRESS")}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  } as AnyCol;
}

/** 외부 export — 우리 커스텀 키 (type, align, codeKey 등) 를 ag-grid 에
 *  그대로 노출하지 않도록 strip 한 결과를 반환. 내부 분기에서는 type 등을
 *  활용하지만 ag-grid 에는 표준 키만 전달. required:true 컬럼은 headerClass
 *  에 "ag-header-required" 가 자동 추가되어 헤더 텍스트 우측에 빨간 * 가 표시됨. */
export function processColumnDef(
  col: AnyCol,
  opts: ProcessOptions = {},
): AnyCol {
  const required =
    (col as any).required === true ||
    (col as any).validators?.required === true;
  const raw = processColumnDefRaw(col, opts);
  const withRequired = required
    ? mergeHeaderClass(raw, "ag-header-required")
    : raw;
  return stripCustomKeys(withRequired);
}

/** headerClass 에 클래스 한 개를 안전하게 머지. 기존이 string 이면 공백으로 합치고,
 *  배열이면 push, 함수이면 손대지 않는다(ag-grid 가 함수를 호출해 결과를 사용). */
function mergeHeaderClass(col: AnyCol, cls: string): AnyCol {
  const existing = (col as any).headerClass;
  let merged: any;
  if (!existing) merged = cls;
  else if (typeof existing === "string") merged = `${existing} ${cls}`;
  else if (Array.isArray(existing)) merged = [...existing, cls];
  else merged = existing;
  return { ...col, headerClass: merged } as AnyCol;
}

// ── 날짜 셀 picker: 표시값/저장값 포맷 변환 헬퍼 ──────────────────
//   화면의 저장 포맷은 검색 필터 컨벤션과 동일 (compact: 대시/콜론/T 제거).
//   DatePickerPopover 는 "YYYY-MM-DD" 또는 "YYYY-MM-DDTHH:MM:SS" 만 받음.
function pickerInputFromRaw(
  value: any,
  withTime: boolean,
  unit: "year" | "month" | "day" = "day",
): string {
  if (value == null || value === "") return "";
  const s = String(value).replace(/[\s\-:/T]/g, "");
  if (unit === "year") return s.length >= 4 ? s.slice(0, 4) : "";
  if (unit === "month")
    return s.length >= 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : "";
  if (s.length < 8) return "";
  const d = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  if (!withTime) return d;
  const t = s.slice(8, 14).padEnd(6, "0");
  return `${d}T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`;
}

function pickerOutputToCompact(v: string): string {
  return v.replace(/[\s\-:T]/g, "");
}

// 단위별 표시 포맷 — 년: "YYYY", 년월: "YYYY-MM".
function formatDateByUnit(value: any, unit: "year" | "month"): string {
  if (value == null || value === "") return "";
  const s = String(value).replace(/[\s\-:/T]/g, "");
  if (unit === "year") return s.slice(0, 4);
  return s.length >= 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : s;
}

// day 단위 날짜 표시 — 값에 시간이 있어도 떼고 "YYYY-MM-DD" 까지만.
//   (읽기전용 date 컬럼 표시 경로와 동일하게 맞춤)
function formatDateDay(value: any): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes("-")) return s.slice(0, 10);
  if (s.length >= 8)
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return s;
}

/** type "date" / "datetime" + (insertable|editable) 컬럼에 picker cellRenderer 주입.
 *   - 셀 안에 DatePickerPopover (border-less) → 클릭 시 조회조건과 동일한 데이트피커.
 *   - withTime = (type === "datetime") 으로 시간 입력 토글.
 *   - type "date" 는 dateUnit 으로 단위 지정 — "year"(YYYY) / "month"(YYYYMM) / "day"(YYYYMMDD, 기본).
 *     단위별로 데이트피커 화면(연/년월/일)과 저장·표시 포맷이 달라진다.
 *   - 편집 가능 row 판단 (insertable/editable + EDIT_STS) → 안 되면 plain 텍스트.
 *   - ag-grid 의 default cellEditor 와 충돌 막기 위해 insertable/editable 을
 *     strip 해서 반환 → applyEditPolicy 가 editable:true 함수를 안 박음.
 *   - 이미 cellRenderer 가 있으면 유지. */
function injectDateCell(col: AnyCol, opts: ProcessOptions): AnyCol {
  const c = col as any;
  if (c.type !== "date" && c.type !== "datetime") return col;
  if (c.cellRenderer) return col;
  if (opts.readOnly) return col; // 폼 화면 그리드: picker 미주입(표시 전용)
  const field = (c.field ?? c.colId) as string | undefined;
  if (!field) return col;
  const mode = resolveEditMode(c);
  if (mode === "none") return col;

  const withTime = c.type === "datetime";
  // 선택 단위 — datetime 은 항상 day(+시간), date 는 dateUnit 으로 년/년월/년월일 지정.
  const unit: "year" | "month" | "day" =
    c.type === "datetime" ? "day" : ((c.dateUnit as any) ?? "day");
  const { setRowData } = opts;

  return {
    ...col,
    insertable: false,
    editable: false,
    cellRenderer: (params: any) => {
      if (!params.data || params.node?.rowPinned) return null;
      const row = params.node?.data;
      const editStsI = row?.EDIT_STS === "I";
      const cellEditable = rowEditableByMode(mode, editStsI);
      const raw = params.value;

      // date(day) 는 무조건 YYYY-MM-DD, datetime 만 시간 표시.
      const display =
        unit !== "day"
          ? formatDateByUnit(raw, unit)
          : withTime
            ? Util.formatDttm(raw)
            : formatDateDay(raw);
      if (!cellEditable) {
        return <span>{display}</span>;
      }
      // popup 셀과 동일한 [값 + 작은 아이콘 버튼] 패턴 — 텍스트 가리지 않음
      return (
        <div className="flex items-center gap-1 h-full w-full">
          <span className="flex-1 truncate">{display}</span>
          <DatePickerPopover
            value={pickerInputFromRaw(raw, withTime, unit)}
            onChange={(v: string) => {
              const next = v ? pickerOutputToCompact(v) : "";
              commitRowChange(setRowData, row, field, next);
            }}
            withTime={withTime}
            precision={unit}
            iconOnly
          />
        </div>
      );
    },
  } as AnyCol;
}

type EditMode = "always" | "insert" | "update" | "none" | "custom";

// insertable/editable 미지정 시 "추가행에서만 편집 ON"(insert) 으로 둘 입력 위젯 타입.
// 기존행에는 picker/돋보기가 안 뜬다 — 기존행도 편집하려면 editable:true 를 명시.
// 그 외 타입(text/numeric/combo/표시용 등)은 미지정이면 읽기전용.
const DEFAULT_EDITABLE_TYPES = new Set([
  "date",
  "datetime",
  "popup",
  "popuser",
]);

/** insertable / editable + type 으로 편집 모드 결정.
 *   - 둘 다 미지정:
 *       입력 위젯 타입(date/datetime/popup/popuser) → "insert" (실제 추가된 행에서만 편집),
 *       그 외 타입 / field 없는 컬럼 → "none" (읽기전용 기본 — 안전장치).
 *   - 하나라도 명시하면 타입 무관하게 그 설정이 우선:
 *       insertable:true → "insert"(추가행), editable:true → "update"(수정행), 둘 다 true → "always",
 *       그 외(명시적 false 조합) → "none"
 *   - editable 이 함수/변수(boolean 아님) → "custom" (ag-grid 로 그대로 passthrough). */
function resolveEditMode(c: any): EditMode {
  if (
    typeof c.editable !== "undefined" &&
    c.editable !== true &&
    c.editable !== false
  ) {
    return "custom";
  }
  if (c.insertable === undefined && c.editable === undefined) {
    return (c.field || c.colId) && DEFAULT_EDITABLE_TYPES.has(c.type)
      ? "insert"
      : "none";
  }
  const ins = c.insertable === true;
  const edt = c.editable === true;
  if (ins && edt) return "always";
  if (ins) return "insert";
  if (edt) return "update";
  return "none";
}

/** mode + EDIT_STS 로 해당 행 편집 가능 여부. */
function rowEditableByMode(mode: EditMode, editStsI: boolean): boolean {
  return mode === "insert" ? editStsI : mode === "update" ? !editStsI : true;
}

/** insertable / editable 을 EDIT_STS 기반 editable 함수로 변환 (resolveEditMode 정책). */
function applyEditPolicy(col: AnyCol, readOnly?: boolean): AnyCol {
  const c = col as any;
  // 폼 화면 그리드: 명시 editable:true / 커스텀 함수까지 모두 무력화 (표시 전용).
  if (readOnly) return { ...c, editable: false } as AnyCol;
  const mode = resolveEditMode(c);
  if (mode === "custom" || mode === "none") return col;
  let editableFn: any;
  if (mode === "always") editableFn = true;
  else if (mode === "insert") editableFn = (p: any) => p.data?.EDIT_STS === "I";
  else editableFn = (p: any) => p.data?.EDIT_STS !== "I";
  return { ...c, editable: editableFn } as AnyCol;
}

function processColumnDefRaw(col: AnyCol, opts: ProcessOptions = {}): AnyCol {
  const codeMap = opts.codeMap;

  // codeKey → cellRenderer (라벨 표시) + type "combo" 면 cellEditor (dropdown) 주입
  // + type "check" 면 체크박스 cellRenderer 주입
  const prepared = applyEditPolicy(
    injectDateCell(
      injectAddressCell(
        injectPopupCell(
          injectCheckRenderer(
            injectValidation(
              injectMaskEditor(
                injectPasswordEditor(
                  injectComboEditor(
                    injectCodeRenderer(col, codeMap),
                    codeMap,
                    opts.setRowData,
                  ),
                  opts.setRowData,
                ),
                opts.setRowData,
              ),
            ),
            opts.setRowData,
            opts.readOnly,
          ),
          opts,
        ),
        opts,
      ),
      opts,
    ),
    opts.readOnly,
  );

  // "No" 컬럼 (DataGrid 전용 — rowCountForNo 가 없으면 일반 처리)
  if (
    "headerName" in prepared &&
    prepared.headerName === "No" &&
    typeof opts.rowCountForNo === "number"
  ) {
    const maxNum = String(opts.rowCountForNo || 1);
    const noWidth = Math.max(
      measureTextWidth("No") + HEADER_PADDING,
      measureTextWidth(maxNum) + CELL_PADDING,
    );
    return {
      ...prepared,
      headerName: "No",
      width: noWidth,
      minWidth: noWidth,
      maxWidth: noWidth,
      suppressHeaderMenuButton: true,
      sortable: false,
      filter: false,
      floatingFilter: false,
      getQuickFilterText: () => null,
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-center",
      valueGetter: (params: any) =>
        params.node?.rowPinned === "bottom"
          ? "Total"
          : (params.node?.rowIndex ?? 0) + 1,
    } as AnyCol;
  }

  const alignProp = (prepared as any).align as
    | "left"
    | "center"
    | "right"
    | undefined;
  const alignBlock = alignProp
    ? {
        cellStyle: { textAlign: alignProp },
        headerClass: `ag-header-${alignProp}`,
      }
    : null;
  const typeBlock = (prepared as any).type ? {} : { type: "text" };

  const translatedChildren = walkChildren((prepared as any).children, opts);

  if ((prepared as any).disableMaxWidth === true) {
    return {
      ...prepared,
      maxWidth: null,
      headerName: translate(prepared),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...(alignBlock ?? {}),
      ...typeBlock,
    } as AnyCol;
  }

  const colDef = prepared as ColDef<any>;
  const field = (colDef.field ?? colDef.colId ?? "") as string;

  // DTTM 필드: 자동 포맷 + 정렬(align prop > type:"date|datetime" → center > 미지정)
  if (field.includes("DTTM")) {
    const isDateTypedDttm =
      (colDef as any).type === "date" ||
      (colDef as any).type === "datetime" ||
      (colDef as any).fieldType === "date";
    const userDttmCellStyle = (colDef as any).cellStyle;
    const baseDttmCellStyle =
      userDttmCellStyle && typeof userDttmCellStyle === "object"
        ? userDttmCellStyle
        : {};
    const finalDttmAlign =
      alignProp ?? (isDateTypedDttm ? "center" : undefined);
    const dttmAlignBlock = finalDttmAlign
      ? {
          cellStyle: { ...baseDttmCellStyle, textAlign: finalDttmAlign },
          headerClass: `ag-header-${finalDttmAlign}`,
        }
      : null;
    return {
      ...prepared,
      headerName: translate(prepared),
      valueFormatter: (params: any) => Util.formatDttm(params.value),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...(dttmAlignBlock ?? {}),
      ...typeBlock,
    } as AnyCol;
  }

  // type:"date" / "datetime" / fieldType:"date" → 가운데 정렬 (align prop 우선)
  //   date     → YYYY-MM-DD 까지만
  //   datetime → "YYYY-MM-DD HH:MM:SS" (T 는 공백으로) — Util.formatDttm 과 동일 톤
  if (
    (colDef as any).type === "date" ||
    (colDef as any).type === "datetime" ||
    (colDef as any).fieldType === "date"
  ) {
    const isDatetime = (colDef as any).type === "datetime";
    const dateUnit = (colDef as any).dateUnit as
      | "year"
      | "month"
      | "day"
      | undefined;
    const userDateCellStyle = (colDef as any).cellStyle;
    const baseDateCellStyle =
      userDateCellStyle && typeof userDateCellStyle === "object"
        ? userDateCellStyle
        : {};
    const finalDateAlign = alignProp ?? "center";
    return {
      ...prepared,
      headerName: translate(prepared),
      valueFormatter: (params: any) =>
        isDatetime
          ? Util.formatDttm(params?.value)
          : dateUnit === "year" || dateUnit === "month"
            ? formatDateByUnit(params?.value, dateUnit)
            : (() => {
                const v = params?.value;
                if (v == null || v === "") return "";
                const s = String(v);
                if (s.includes("-")) return s.slice(0, 10);
                if (s.length >= 8)
                  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
                return s;
              })(),
      cellStyle: { ...baseDateCellStyle, textAlign: finalDateAlign },
      headerClass: `ag-header-${finalDateAlign}`,
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  // type:"numeric" → 우측 정렬 (align prop 우선) + decimalPlaces 포맷
  const isNumericType =
    (colDef as any).type === "numeric" ||
    (colDef as any).dataType === "number" ||
    (colDef as any).cellDataType === "number";
  if (isNumericType) {
    const decimalPlaces = (colDef as any).decimalPlaces as number | undefined;
    const hasCustomFormatter =
      typeof (colDef as any).valueFormatter === "function";
    const numberFormatter =
      !hasCustomFormatter && typeof decimalPlaces === "number"
        ? (params: any) => {
            const v = params?.value;
            if (v == null || v === "") return "";
            const n =
              typeof v === "number" ? v : Number(String(v).replaceAll(",", ""));
            if (Number.isNaN(n)) return String(v);
            return n.toLocaleString(undefined, {
              minimumFractionDigits: decimalPlaces,
              maximumFractionDigits: decimalPlaces,
            });
          }
        : undefined;
    const userCellStyle = (colDef as any).cellStyle;
    const baseCellStyle =
      userCellStyle && typeof userCellStyle === "object" ? userCellStyle : {};
    const finalAlign = alignProp ?? "right";
    return {
      ...prepared,
      headerName: translate(prepared),
      cellStyle: { ...baseCellStyle, textAlign: finalAlign },
      headerClass: `ag-header-${finalAlign}`,
      ...(numberFormatter ? { valueFormatter: numberFormatter } : {}),
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  // _STS 접미 → 중앙 정렬 (cellStyle/type/align 미지정 시)
  if (
    !(colDef as any).cellStyle &&
    !(colDef as any).type &&
    !alignProp &&
    field.endsWith("_STS")
  ) {
    return {
      ...prepared,
      headerName: translate(prepared),
      cellStyle: { textAlign: "center" },
      headerClass: "ag-header-center",
      ...(translatedChildren ? { children: translatedChildren } : {}),
      ...typeBlock,
    } as AnyCol;
  }

  return {
    ...prepared,
    headerName: (prepared as any).headerName
      ? translate(prepared)
      : (prepared as any).headerName,
    ...(translatedChildren ? { children: translatedChildren } : {}),
    ...(alignBlock ?? {}),
    ...typeBlock,
  } as AnyCol;
}

/** 컬럼 배열 일괄 변환. */
export function processColumnDefs(
  cols: AnyCol[] | undefined,
  opts: ProcessOptions = {},
): AnyCol[] {
  return (cols ?? []).map((c) => processColumnDef(c, opts));
}
