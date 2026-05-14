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
    if (sts === ROW_STATUS.INSERT || sts === ROW_STATUS.UPDATE || sts === ROW_STATUS.DELETE) {
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

/** row mutate 후 EDIT_STS 결정 — 신규 "I" / 삭제 "D" 는 유지, 그 외 "U". */
function nextEditSts(row: any): string {
  if (row?.EDIT_STS === ROW_STATUS.INSERT) return ROW_STATUS.INSERT;
  if (row?.EDIT_STS === ROW_STATUS.DELETE) return ROW_STATUS.DELETE;
  return ROW_STATUS.UPDATE;
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
  if (!setRowData || !targetRow || !field) return;
  setRowData((prev: any) => ({
    ...prev,
    rows: (prev?.rows ?? []).map((r: any) =>
      r === targetRow
        ? { ...r, [field]: value, EDIT_STS: nextEditSts(r) }
        : r,
    ),
  }));
}
