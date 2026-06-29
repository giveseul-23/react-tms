// src/app/components/grid/gridUtils/rowStatus.ts
//
// 그리드 행의 편집 상태(EDIT_STS) 단일 진실 소스.
//   "I" = Insert (신규 추가)
//   "U" = Update (수정)
//   "D" = Delete (삭제 마킹)
//   ""  = 변경 없음 (initial)
//
// 추가/수정/삭제 모두 EDIT_STS 한 필드로 추적. _isNew / _isDirty 플래그는 사용하지 않음.

export const ROW_STATUS = {
  INSERT: "I",
  UPDATE: "U",
  DELETE: "D",
} as const;

export type RowStatus = (typeof ROW_STATUS)[keyof typeof ROW_STATUS] | "";

/** 신규 행 마킹 — 무조건 "I" 로 덮어씀. */
export function markInsert(row: any): void {
  if (!row) return;
  row.EDIT_STS = ROW_STATUS.INSERT;
}

/** 수정 마킹 — 이미 "I" 인 신규 행은 그대로 유지 (저장 시 INSERT 로 처리). "D" 마킹된 행도 그대로. */
export function markUpdate(row: any): void {
  if (!row) return;
  if (row.EDIT_STS === ROW_STATUS.INSERT) return;
  if (row.EDIT_STS === ROW_STATUS.DELETE) return;
  row.EDIT_STS = resolveUpdateSts(row);
}

/** 삭제 마킹 — 직전 상태("" / "U") 를 보조필드에 기억한 뒤 "D" 로 덮어씀.
 *  (unmarkDelete 로 해제 시 직전 상태로 복원하기 위함) */
export function markDelete(row: any): void {
  if (!row) return;
  if (row.EDIT_STS !== ROW_STATUS.DELETE) {
    // spread/JSON 에 안 잡히도록 non-enumerable — 서버 전송(toDsSave/dirtyRows)에 새지 않음.
    Object.defineProperty(row, "_prevSts", {
      value: row.EDIT_STS ?? "",
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
  row.EDIT_STS = ROW_STATUS.DELETE;
}

/** 삭제 마킹 해제 — markDelete 가 기억한 직전 상태로 복원 (없으면 무상태 ""). */
export function unmarkDelete(row: any): void {
  if (!row || row.EDIT_STS !== ROW_STATUS.DELETE) return;
  row.EDIT_STS = row._prevSts ?? "";
  delete row._prevSts;
}

/** 변경 여부 — EDIT_STS 가 truthy 면 변경된 행. */
export function isDirty(row: any): boolean {
  return !!row?.EDIT_STS;
}

/** 변경된 행만 추출 — save 핸들러에서 사용. */
export function dirtyRows<T = any>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).filter(isDirty);
}

/**
 * 변경된 행만 추출해 서버 dataset 형태(List<row>)로 변환.
 *   - EDIT_STS 가 I/U/D 인 행만 포함
 *   - 각 row 의 EDIT_STS → rowStatus 키로 변경 (ValueChainData 프레임워크 컨벤션)
 *   - 서버는 dsSave 를 List 로 캐스팅하므로 평탄 array 로 반환
 */
export function toDsSave<T = any>(
  rows: T[] | null | undefined,
): Array<Record<string, any>> {
  const out: Array<Record<string, any>> = [];
  for (const row of rows ?? []) {
    const sts = (row as any)?.EDIT_STS;
    if (
      sts === ROW_STATUS.INSERT ||
      sts === ROW_STATUS.UPDATE ||
      sts === ROW_STATUS.DELETE
    ) {
      // __rid__ 는 useBaseModel 이 ag-grid getRowId 용으로 부여한 클라이언트 전용 id — 서버 전송 제외
      const { EDIT_STS, __rid__, ...rest } = row as any;
      out.push({ ...rest, rowStatus: sts });
    }
  }
  return out;
}

/** 신규(INSERT) 행 여부. */
export function isInserted(row: any): boolean {
  return row?.EDIT_STS === ROW_STATUS.INSERT;
}

/** 삭제(DELETE) 마킹 여부. */
export function isDeleted(row: any): boolean {
  return row?.EDIT_STS === ROW_STATUS.DELETE;
}

// ── 서버 원본 스냅샷(__orig__) 기반 dirty 판정 ────────────────────────────
// 셀을 수정했다가 "서버에서 가져온 원래 값" 으로 되돌리면 EDIT_STS 를 "U" 가 아닌
// "" (미변경) 으로 되돌리기 위함. 원본은 조회 시점에 captureOrig 로 비열거(non-enum)
// 프로퍼티에 저장 → spread / 저장 페이로드(toDsSave)에 새지 않음.
const ORIG_KEY = "__orig__";
const ORIG_INTERNAL_KEYS = new Set([
  "EDIT_STS",
  "__rid__",
  ORIG_KEY,
  "_prevSts",
  "_delete",
]);

/** 조회 시점의 서버 원본을 비열거 스냅샷으로 저장 (이미 있으면 유지). */
export function captureOrig(row: any): void {
  if (!row || row[ORIG_KEY]) return;
  const snap: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    if (ORIG_INTERNAL_KEYS.has(k)) continue;
    snap[k] = row[k];
  }
  Object.defineProperty(row, ORIG_KEY, {
    value: snap,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

/** spread 로 새 객체가 되어도 원본 스냅샷(__orig__)을 옮겨 단다.
 *  폼→그리드 라이브 동기화처럼 `{...row}` 로 새 객체를 만든 뒤 markUpdate 하기 전에
 *  호출해야 "원래값으로 되돌림 → EDIT_STS 해제" 판정(resolveUpdateSts)이 동작한다. */
export function carryOrig(next: any, src: any): void {
  const orig = src?.[ORIG_KEY];
  if (!orig) return;
  Object.defineProperty(next, ORIG_KEY, {
    value: orig,
    enumerable: false,
    writable: true,
    configurable: true,
  });
}

// 날짜성 필드(DTTM)는 서버 포맷("2024-01-01")과 폼 입력 포맷(compact "20240101")이
// 달라도 같은 날짜면 동일하게 본다 — 구분자 제거 후 비교.
const stripDateSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");

/** 원본과 모든 필드가 동일한가 (number/string 차이는 문자열 비교로 흡수). */
function matchesOrig(row: any, orig: Record<string, any>): boolean {
  for (const k of Object.keys(orig)) {
    if (k.includes("DTTM")) {
      if (stripDateSep(row[k]) !== stripDateSep(orig[k])) return false;
    } else if (String(row[k] ?? "") !== String(orig[k] ?? "")) {
      return false;
    }
  }
  return true;
}

/** row mutate 후 EDIT_STS 결정 — 신규 "I" / 삭제 "D" 유지.
 *  원본 스냅샷이 있으면 원복(원본과 동일) → "" / 변경됨 → "U". 없으면 "U". */
export function resolveUpdateSts(row: any): RowStatus {
  if (row?.EDIT_STS === ROW_STATUS.INSERT) return ROW_STATUS.INSERT;
  if (row?.EDIT_STS === ROW_STATUS.DELETE) return ROW_STATUS.DELETE;
  const orig = row?.[ORIG_KEY];
  if (!orig) return ROW_STATUS.UPDATE;
  return matchesOrig(row, orig) ? "" : ROW_STATUS.UPDATE;
}

/**
 * cellEditor / cellRenderer 가 값 변경 시 호출 — React state 의 rows 배열에서
 * targetRow 의 field 값을 갱신하고 EDIT_STS 자동 마킹.
 *
 * ag-grid 의 onCellValueChanged 흐름에 의존하지 않고 React state 를 source of
 * truth 로 두기 위한 단일 진입점. 콤보/체크박스 등 모든 셀 commit 에서 공통 사용.
 */
export function commitRowChange(
  setRowData: ((updater: any) => void) | undefined,
  targetRow: any,
  field: string,
  value: any,
): void {
  if (!field) return;
  commitRowChanges(setRowData, targetRow, { [field]: value });
}

/** commitRowChange 의 다필드 버전 — patch 객체의 모든 필드를 한 번의 setRowData 로
 *  갱신하고 EDIT_STS 자동 마킹. (팝업 셀에서 CODE/NAME 동시 기록 등) */
export function commitRowChanges(
  setRowData: ((updater: any) => void) | undefined,
  targetRow: any,
  patch: Record<string, any>,
): void {
  if (!setRowData || !targetRow || !patch) return;
  setRowData((prev: any) => ({
    ...prev,
    rows: (prev?.rows ?? []).map((r: any) => {
      const isTarget =
        r === targetRow || (!!r?.__rid__ && r.__rid__ === targetRow.__rid__);
      if (!isTarget) return r;
      const next = { ...r, ...patch };
      carryOrig(next, r); // spread 로 사라진 원본 스냅샷 복원
      next.EDIT_STS = resolveUpdateSts(next); // 원복이면 "" 로 되돌림
      return next;
    }),
  }));
}

/** singleMode 체크 — Y 선택 시 대상 행만 Y, 나머지는 N. N 해제는 대상 행만 변경. */
export function commitSingleModeCheck(
  setRowData: ((updater: any) => void) | undefined,
  targetRow: any,
  field: string,
  value: "Y" | "N",
): void {
  if (!setRowData || !targetRow || !field) return;
  setRowData((prev: any) => ({
    ...prev,
    rows: (prev?.rows ?? []).map((r: any) => {
      const isTarget =
        r === targetRow || (!!r?.__rid__ && r.__rid__ === targetRow.__rid__);
      const nextVal =
        value === "Y" ? (isTarget ? "Y" : "N") : isTarget ? "N" : r[field];
      if (!isTarget && value === "N") return r;
      if (r[field] === nextVal) return r;
      const next = { ...r, [field]: nextVal };
      carryOrig(next, r);
      next.EDIT_STS = resolveUpdateSts(next);
      return next;
    }),
  }));
}
