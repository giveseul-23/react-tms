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
  row.EDIT_STS = ROW_STATUS.UPDATE;
}

/** 삭제 마킹 — 무조건 "D" 로 덮어씀. */
export function markDelete(row: any): void {
  if (!row) return;
  row.EDIT_STS = ROW_STATUS.DELETE;
}

/** 변경 여부 — EDIT_STS 가 truthy 면 변경된 행. */
export function isDirty(row: any): boolean {
  return !!row?.EDIT_STS;
}

/** 변경된 행만 추출 — save 핸들러에서 사용. */
export function dirtyRows<T = any>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).filter(isDirty);
}

/** 신규(INSERT) 행 여부. */
export function isInserted(row: any): boolean {
  return row?.EDIT_STS === ROW_STATUS.INSERT;
}

/** 삭제(DELETE) 마킹 여부. */
export function isDeleted(row: any): boolean {
  return row?.EDIT_STS === ROW_STATUS.DELETE;
}
