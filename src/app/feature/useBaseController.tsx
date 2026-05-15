// src/app/feature/useBaseController.tsx
//
// 센차 ViewController 대응. 자식 controller 가 import 해서
// base.callAjax / base.saveGrid / base.searchSub / base.resetGrids /
// base.alert / base.confirm / base.search 호출.
//
// 자식은 화면 고유 핸들러(onMainGridClick, onAddXxx, onSaveXxx 등)만 정의하면 됨.

import { useCallback, useMemo } from "react";
import { useApiHandler } from "@/hooks/useApiHandler";
import {
  dirtyRows,
  toDsSave,
} from "@/app/components/grid/gridUtils/rowStatus";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import { makeSaveAction } from "@/app/components/grid/commonActions";
import { newRid, type BaseModel, type GridSlot } from "./useBaseModel";

interface Args<K extends string> {
  model: BaseModel<K>;
  /** 표준 fetchList / onSearchCallback / mainActions 자동 생성용. 화면 고유 cascade/추가액션은 자식 controller 가 추가/오버라이드. */
  api?: {
    search?: (params: Record<string, unknown>) => Promise<any>;
    save?: (payload: { dsSave: any[] }) => Promise<any>;
  };
  searchOptions?: {
    transformParams?: (params: Record<string, unknown>) => Record<string, unknown>;
    onAfterSearch?: (data: any) => void;
  };
}

export function useBaseController<K extends string>({
  model,
  api,
  searchOptions,
}: Args<K>) {
  const searchRef = model.searchRef;
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();

  // 센차: me.callAjax — API Promise 한 번 감쌈 (성공/에러 토스트)
  const callAjax = useCallback(
    <T,>(apiCall: Promise<T>, successMsg = "처리되었습니다.") =>
      handleApi(apiCall, successMsg),
    [handleApi],
  );

  // 센차: Ext.Msg.alert
  const alertMsg = useCallback(
    (msg: string, title = "알림") => {
      openPopup({
        content: (
          <ConfirmModal
            title={title}
            description={msg}
            onClose={closePopup}
            type="check"
          />
        ),
        width: "lg",
      });
    },
    [openPopup, closePopup],
  );

  // 센차: Ext.Msg.confirm — ConfirmModal 의 단일 버튼 패턴.
  // "확인" 클릭 시 onYes 실행. (취소는 모달 외부 클릭/ESC)
  const confirmMsg = useCallback(
    (msg: string, onYes: () => void, title = "확인") => {
      openPopup({
        content: (
          <ConfirmModal
            title={title}
            description={msg}
            onClose={() => {
              closePopup();
              onYes();
            }}
            type="confirm"
          />
        ),
        width: "lg",
      });
    },
    [openPopup, closePopup],
  );

  // 센차: Util.gridsReset — 지정 그리드들의 data/selection 비우기
  const resetGrids = useCallback(
    (keys: K[]) => {
      keys.forEach((k) => {
        const slot = (model.grids as Record<string, GridSlot>)[k as string];
        slot.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
        slot.setSelected(null);
      });
    },
    [model.grids],
  );

  // 센차: me.getComp(key).search(params) — 임의 그리드에 결과 set
  const searchSub = useCallback(
    async (gridKey: K, apiCall: Promise<any>): Promise<any[]> => {
      try {
        const res: any = await apiCall;
        const rows = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        const slot = (model.grids as Record<string, GridSlot>)[
          gridKey as string
        ];
        slot.setData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: 20,
        });
        return rows;
      } catch (e) {
        console.error(`[searchSub:${String(gridKey)}]`, e);
        return [];
      }
    },
    [model.grids],
  );

  // 센차: me.saveGrid — dirty 추출 + dsSave + 후처리
  //
  // opts:
  //   beforeSave        — false 반환 시 저장 중단 (호출자가 alert 책임)
  //   confirmOnDelete   — 삭제 행 있으면 메시지로 confirm 후 진행
  //   afterSave
  //     "refresh"       → searchRef 호출 (메인 재조회) — 기본
  //     "none"          → 후처리 없음
  //     () => void      → 그 함수 호출
  //     { cascadeFrom, fetch } → 부모 행 → 본인 cascade 재조회
  const saveGrid = useCallback(
    async (
      gridKey: K,
      apiFn: (p: { dsSave: any[] }) => Promise<any>,
      opts?: {
        successMsg?: string;
        beforeSave?: () => boolean;
        confirmOnDelete?: string;
        afterSave?:
          | "refresh"
          | "none"
          | (() => void)
          | { cascadeFrom: K; fetch: (parent: any) => Promise<any> };
      },
    ) => {
      const slot = (model.grids as Record<string, GridSlot>)[gridKey as string];
      const rows = slot.ref.current?.rows ?? [];
      const dirty = dirtyRows(rows);
      if (dirty.length === 0) {
        alertMsg("변경된 데이터가 없습니다.");
        return;
      }

      // ── 사전 검증 ──────────────────────────────────────────
      if (opts?.beforeSave && opts.beforeSave() === false) return;

      // ── 본 저장 + 후처리 ──────────────────────────────────
      const doSave = async () => {
        await callAjax(
          apiFn({ dsSave: toDsSave(dirty) }),
          opts?.successMsg ?? "저장되었습니다.",
        );
        const after = opts?.afterSave ?? "refresh";
        if (after === "refresh") {
          searchRef.current?.();
        } else if (after === "none") {
          // no-op
        } else if (typeof after === "function") {
          after();
        } else if (after && typeof after === "object" && "cascadeFrom" in after) {
          const parentSlot = (model.grids as Record<string, GridSlot>)[
            after.cascadeFrom as string
          ];
          const parent = parentSlot?.selectedRef.current;
          if (parent) {
            try {
              const res: any = await after.fetch(parent);
              const newRows = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
              slot.setData({
                rows: newRows,
                totalCount: newRows.length,
                page: 1,
                limit: 20,
              });
            } catch (e) {
              console.error(`[saveGrid:cascade ${String(gridKey)}]`, e);
            }
          }
        }
      };

      // ── 삭제 행 confirm 분기 ──────────────────────────────
      const hasDelete = rows.some(
        (r: any) => r.EDIT_STS === "D" || r.delStatus === true,
      );
      if (opts?.confirmOnDelete && hasDelete) {
        confirmMsg(opts.confirmOnDelete, () => {
          doSave();
        });
      } else {
        await doSave();
      }
    },
    [model.grids, callAjax, searchRef, alertMsg, confirmMsg],
  );

  // 센차: me.onSearch — 메인 그리드 재조회 트리거
  const search = useCallback(
    (page?: number) => searchRef.current?.(page),
    [searchRef],
  );

  // 센차: onMainGridClick / onSubXxGridClick 공통 — selection + cascade reset/fetch.
  //
  // gridKey    : 클릭된 그리드 자기 자신
  // row        : 클릭된 행 (null/undefined 면 reset 만 하고 종료)
  // cascade    : 직계 자식들 — reset 후 row 가 있을 때 fetch
  // alsoReset  : cascade 외 reset 만 할 그리드 (손자 등)
  //
  // dirty 보호는 default: 클릭된 그리드에 I/U/D 행이 있으면 selection/reset/cascade 모두 skip
  // — 사용자가 편집 중인 데이터를 다른 행 클릭으로 잃어버리지 않도록.
  const handleRowClick = useCallback(
    (
      gridKey: K,
      row: any,
      cascade?: Array<{ to: K; fetch: (row: any) => Promise<any> }>,
      opts?: { alsoReset?: K[] },
    ) => {
      const slot = (model.grids as Record<string, GridSlot>)[gridKey as string];

      const rows = slot.ref.current?.rows ?? [];
      const hasDirty = rows.some(
        (r: any) =>
          r.EDIT_STS === "I" || r.EDIT_STS === "U" || r.EDIT_STS === "D",
      );
      if (hasDirty) return;

      // 같은 row 재클릭이면 selection/reset/cascade 모두 skip.
      // 더블클릭으로 cellEditor 가 열릴 때 ag-grid 가 발화하는 두 번째 click 으로
      // cascade fetch 가 재트리거 → sub setData → 부모 re-render →
      // cellEditor mount 가 차단되는 문제 회피.
      if (row != null && slot.selectedRef.current === row) return;

      slot.setSelected(row);

      const resetKeys: K[] = [
        ...(cascade?.map((c) => c.to) ?? []),
        ...(opts?.alsoReset ?? []),
      ];
      if (resetKeys.length > 0) resetGrids(resetKeys);

      if (!row) return;

      cascade?.forEach((c) => {
        void searchSub(c.to, c.fetch(row));
      });
    },
    [model.grids, resetGrids, searchSub],
  );

  // 센차: ExGridEditor.addRow — 그리드 끝에 신규 행 push (EDIT_STS: "I" 자동)
  // __rid__ 미리 부여 → setData 의 ensureRid 가 새 객체로 spread 하지 않고 그대로 사용.
  // setSelected 도 같은 reference → 셀 편집 시 selected sync 가 __rid__ 매칭으로 PK 갱신 추적.
  // 저장 후 autoSelectFirstRow 의 PK 매칭으로 추가한 행이 자동 재선택됨.
  const addRow = useCallback(
    (gridKey: K, newRow: Record<string, any>) => {
      const slot = (model.grids as Record<string, GridSlot>)[gridKey as string];
      const rowWithSts = { ...newRow, EDIT_STS: "I", __rid__: newRid() };
      slot.setData((prev) => ({
        ...prev,
        rows: [...(prev?.rows ?? []), rowWithSts],
      }));
      slot.setSelected(rowWithSts);
    },
    [model.grids],
  );

  // 센차: checkHeader / checkHeaderRecord — 부모 행이 선택+저장됐는지 검증.
  // 선택 안 된 경우 / 신규(저장 전) 인 경우 alert 후 false 반환.
  const requireParentRow = useCallback(
    (
      row: any,
      label: string,
      opts?: { notSelectedMsg?: string; notSavedMsg?: string },
    ): boolean => {
      if (!row) {
        alertMsg(opts?.notSelectedMsg ?? `${label} 선택 후 진행해주세요.`);
        return false;
      }
      if (row.EDIT_STS === "I") {
        alertMsg(opts?.notSavedMsg ?? `${label} 저장 후 진행해주세요.`);
        return false;
      }
      return true;
    },
    [alertMsg],
  );

  // ── 표준 fetchList / onSearchCallback / mainActions ────────────────
  // api 옵션을 넘긴 controller 가 자동으로 사용. 자식은 cascade/추가액션만 override.
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      if (!api?.search) {
        throw new Error("[useBaseController] api.search 미설정 — fetchList 호출 불가");
      }
      const transformed = searchOptions?.transformParams?.(params) ?? params;
      return api.search(transformed);
    },
    [api, searchOptions],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      const main = (model.grids as Record<string, GridSlot>)["main"];
      main?.setData(data);
      searchOptions?.onAfterSearch?.(data);
    },
    [model.grids, searchOptions],
  );

  const mainActions = useMemo(() => {
    if (!api?.save) return [];
    return [makeSaveAction({ onClick: () => saveGrid("main" as K, api.save!) })];
  }, [api, saveGrid]);

  return {
    callAjax,
    saveGrid,
    resetGrids,
    searchSub,
    search,
    addRow,
    requireParentRow,
    handleRowClick,
    alert: alertMsg,
    confirm: confirmMsg,
    fetchList,
    onSearchCallback,
    mainActions,
  };
}

export type BaseController<K extends string = string> = ReturnType<
  typeof useBaseController<K>
>;
