// src/app/components/grid/useGridActions.ts
//
// 그리드의 추가(Add) / 저장(Save) 공통 핸들러.
//   - useGridSave : 변경 행을 toDsSave 로 평탄 List<row>+rowStatus 변환 후 saveFn 호출,
//                   저장 성공 후 EDIT_STS 자동 정리까지 모두 hook 내부에서 처리.
//   - useGridAdd  : 빈/템플릿 행을 EDIT_STS = "I" 로 마킹해 그리드에 삽입.
//
// setRows 는 두 가지 모양 모두 자동 처리:
//   1) 배열 setter — TreeGrid 처럼 source: T[] 인 경우 (예: model.setSource)
//   2) 객체 setter — DataGrid 처럼 gridData: { rows, totalCount, page, limit } 인 경우
//      (예: model.setGridData) → 내부 adapter 가 prev.rows 만 갱신하고 나머지 필드는 보존
//
// saveFn 은 fetchFn 처럼 thin reference. payload 로 dsSave 와 rows(EDIT_STS 포함) 둘 다
// 받으므로 신규 dsSave 패턴/레거시 rows 패턴 양쪽 컨트롤러에서 모두 사용 가능.

import { useCallback } from "react";
import { dirtyRows, toDsSave } from "./gridCommon";
import { useApiHandler } from "@/hooks/useApiHandler";

/**
 * 서버 ValueChainData 프레임워크 dataset 형태 — List<row> + 각 row 에 rowStatus.
 *   getDataList(id) 가 (List)this.map.get(id) 로 캐스팅하므로 반드시 array 여야 함.
 */
export type DsSave = Array<Record<string, any>>;

/** rows 배열 setter 와 { rows, ... } 객체 setter 양쪽을 모두 받아 배열 setter 로 어댑팅. */
type AnySetter<T> = (updater: any) => void;
function adaptRowsSetter<T>(
  setter: AnySetter<T> | undefined,
): ((updater: (prev: T[]) => T[]) => void) | undefined {
  if (!setter) return undefined;
  return (rowsUpdater: (prev: T[]) => T[]) => {
    setter((prev: any) => {
      if (prev && typeof prev === "object" && Array.isArray(prev.rows)) {
        return { ...prev, rows: rowsUpdater(prev.rows) };
      }
      return rowsUpdater(prev as T[]);
    });
  };
}

// ────────────────────────────────────────────────────────────────
// useGridSave
// ────────────────────────────────────────────────────────────────

export type UseGridSaveOptions<T = any> = {
  /** 저장 대상 그리드 rows. 내부에서 변경 행만 추출 + rowStatus 매핑. */
  rows: T[] | null | undefined;
  /**
   * rows 의 setter. 저장 성공 후 EDIT_STS 자동 정리에 사용 (선택).
   * 배열 setter 또는 { rows, ... } 객체 setter 양쪽 모두 OK — hook 이 자동 어댑팅.
   */
  setRows?: AnySetter<T>;
  /**
   * 서버 호출 함수 — fetchFn 처럼 얇은 래퍼.
   * payload 안에 두 가지 표현이 다 들어옴:
   *   - dsSave : 신규 ValueChainData 컨벤션 (rowStatus 포함, EDIT_STS 제거)
   *   - rows   : EDIT_STS 가 살아있는 dirty 행 그대로 (레거시 API 용)
   * 컨트롤러가 자기 API 가 받는 모양을 골라 사용.
   */
  saveFn: (payload: { dsSave: DsSave; rows: T[] }) => Promise<any>;
  /** 저장 성공 토스트 메시지. */
  successMessage?: string;
  /** 저장 성공 후 콜백 (응답 전달). 재조회 등 추가 동작용. */
  onSaved?: (response?: any) => void;
  /** 변경된 행이 0개일 때 콜백 (선택). */
  onEmpty?: () => void;
};

/**
 * 공통 저장 핸들러 (fetchFn 패턴과 대칭).
 *   1) toDsSave 로 변경 행만 추출 + EDIT_STS → rowStatus 매핑 (서버 프레임워크 컨벤션)
 *   2) saveFn({ dsSave }) 호출 → handleApi 토스트 처리
 *   3) setRows 가 있으면 EDIT_STS 자동 정리
 *   4) onSaved 콜백 → 응답을 그대로 Promise 로 반환
 *
 * 추가 파라미터 등 커스터마이징이 필요하면 반환된 handleSave 를 감싸서 사용:
 *   const baseSave = useGridSave({ ... });
 *   const handleSave = useCallback(async () => {
 *     // pre 로직
 *     const res = await baseSave();
 *     // post 로직
 *   }, [baseSave]);
 */
export function useGridSave<T = any>({
  rows,
  setRows,
  saveFn,
  successMessage = "저장되었습니다.",
  onSaved,
  onEmpty,
}: UseGridSaveOptions<T>) {
  const { handleApi } = useApiHandler();

  return useCallback(async (): Promise<any | undefined> => {
    const dirty = dirtyRows(rows);
    if (dirty.length === 0) {
      onEmpty?.();
      return;
    }
    const dsSave = toDsSave(rows);
    const res = await handleApi(
      saveFn({ dsSave, rows: dirty }),
      successMessage,
    );
    // 저장 완료 후 EDIT_STS 플래그 자동 정리 (배열 / 객체 setter 자동 어댑팅)
    const adapted = adaptRowsSetter<T>(setRows);
    adapted?.((prev: T[]) =>
      prev.map((r: any) => {
        const { EDIT_STS, ...rest } = r;
        return rest as T;
      }),
    );
    onSaved?.(res);
    return res;
  }, [rows, setRows, saveFn, successMessage, onSaved, onEmpty, handleApi]);
}

// ────────────────────────────────────────────────────────────────
// useGridAdd
// ────────────────────────────────────────────────────────────────

export type UseGridAddOptions<T = any> = {
  /**
   * rows 의 setter. 배열 setter / { rows, ... } 객체 setter 양쪽 모두 OK
   * — hook 이 자동 어댑팅 (객체 모델은 totalCount 등 다른 필드는 보존).
   */
  setRows: AnySetter<T>;
  /** 추가할 새 행 (객체 또는 매번 새 객체를 만드는 팩토리). */
  newRow: Partial<T> | (() => Partial<T>);
  /** 행 삽입 위치. 기본 "top". */
  position?: "top" | "bottom";
};

/**
 * 공통 추가 핸들러.
 *   - newRow 를 EDIT_STS = "I" 로 마킹해 그리드에 삽입.
 *   - 위치는 position 으로 지정 (기본 top).
 *   - 객체 모델({ rows, totalCount, ... })에 대해서는 totalCount 를 +1 자동 증가.
 */
export function useGridAdd<T = any>({
  setRows,
  newRow,
  position = "top",
}: UseGridAddOptions<T>) {
  return useCallback(() => {
    setRows((prev: any) => {
      const base =
        typeof newRow === "function"
          ? (newRow as () => Partial<T>)()
          : { ...(newRow as object) };
      const row = { ...(base as any), EDIT_STS: "I" } as T;

      if (prev && typeof prev === "object" && Array.isArray(prev.rows)) {
        const nextRows =
          position === "top" ? [row, ...prev.rows] : [...prev.rows, row];
        return {
          ...prev,
          rows: nextRows,
          totalCount:
            typeof prev.totalCount === "number"
              ? prev.totalCount + 1
              : prev.totalCount,
        };
      }

      const arr = Array.isArray(prev) ? prev : [];
      return position === "top" ? [row, ...arr] : [...arr, row];
    });
  }, [setRows, newRow, position]);
}
