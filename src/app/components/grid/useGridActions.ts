// src/app/components/grid/useGridActions.ts
//
// 그리드의 추가(Add) / 저장(Save) 공통 핸들러.
//   - useGridSave : 변경 행을 toDsSave 로 평탄 List<row>+rowStatus 변환 후 saveFn 호출,
//                   저장 성공 후 EDIT_STS 자동 정리까지 모두 hook 내부에서 처리.
//   - useGridAdd  : 빈/템플릿 행을 EDIT_STS = "I" 로 마킹해 그리드에 삽입.
//
// saveFn 은 fetchFn 처럼 thin reference (예: ctrl.saveMenuConfig).
// 페이로드 형태({ dsSave }) 와 EDIT_STS 정리는 hook 의 기본 동작.
// 커스터마이징(추가 파라미터 등)이 필요하면 hook 이 반환한 handleSave 를 감싸서 사용.

import { useCallback } from "react";
import { toDsSave } from "./gridCommon";
import { useApiHandler } from "@/hooks/useApiHandler";

/**
 * 서버 ValueChainData 프레임워크 dataset 형태 — List<row> + 각 row 에 rowStatus.
 *   getDataList(id) 가 (List)this.map.get(id) 로 캐스팅하므로 반드시 array 여야 함.
 */
export type DsSave = Array<Record<string, any>>;

// ────────────────────────────────────────────────────────────────
// useGridSave
// ────────────────────────────────────────────────────────────────

export type UseGridSaveOptions<T = any> = {
  /** 저장 대상 그리드 rows. 내부에서 변경 행만 추출 + rowStatus 매핑. */
  rows: T[] | null | undefined;
  /** rows 의 setter. 저장 성공 후 EDIT_STS 자동 정리에 사용 (선택). */
  setRows?: (updater: (prev: T[]) => T[]) => void;
  /**
   * 서버 호출 함수 — fetchFn 처럼 얇은 래퍼:
   *   const saveMenuConfig = useCallback((p) => menuApi.saveMenuConfig(p), []);
   * hook 이 `saveFn({ dsSave })` 형태로 호출 (dsSave 는 List<row>).
   */
  saveFn: (payload: { dsSave: DsSave }) => Promise<any>;
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
    const dsSave = toDsSave(rows);
    if (dsSave.length === 0) {
      onEmpty?.();
      return;
    }
    const res = await handleApi(saveFn({ dsSave }), successMessage);
    // 저장 완료 후 EDIT_STS 플래그 자동 정리
    setRows?.((prev: T[]) =>
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
  /** 그리드 rows 의 setter. 함수형 setter 시그니처. */
  setRows: (updater: (prev: T[]) => T[]) => void;
  /** 추가할 새 행 (객체 또는 매번 새 객체를 만드는 팩토리). */
  newRow: Partial<T> | (() => Partial<T>);
  /** 행 삽입 위치. 기본 "top". */
  position?: "top" | "bottom";
};

/**
 * 공통 추가 핸들러.
 *   - newRow 를 EDIT_STS = "I" 로 마킹해 그리드에 삽입.
 *   - 위치는 position 으로 지정 (기본 top).
 */
export function useGridAdd<T = any>({
  setRows,
  newRow,
  position = "top",
}: UseGridAddOptions<T>) {
  return useCallback(() => {
    setRows((prev) => {
      const base =
        typeof newRow === "function"
          ? (newRow as () => Partial<T>)()
          : { ...(newRow as object) };
      const row = { ...(base as any), EDIT_STS: "I" } as T;
      return position === "top" ? [row, ...prev] : [...prev, row];
    });
  }, [setRows, newRow, position]);
}
