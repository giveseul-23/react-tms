import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows } from "@/app/components/grid/gridUtils/rowStatus";
import { Lang } from "@/app/services/common/Lang";
import { dspchContainer2Api as api } from "./DspchContainer2Api";
import { MENU_CODE } from "./DspchContainer2";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { DspchContainer2Model, GridKey } from "./DspchContainer2Model";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: DspchContainer2Model;
}

export function useDspchContainer2Controller({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // 메인 조회 — 배송일(SRCH_A_DLVRY_DT) 단일값을 From/To 로 동시 전달 (서버 onSaveAfterSearch 대응)
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const s = getSearch();
      const dlvryDt = String(s.SRCH_A_DLVRY_DT ?? "");
      return api.getList({
        ...params,
        DLVRY_DT_FROM: dlvryDt,
        DLVRY_DT_TO: dlvryDt,
      });
    },
    [getSearch],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  // 저장 전 검증 — 변경된 행의 배차진행상태가 2050 미만이면 차단 (서버 checkBeforeSave 대응)
  const checkBeforeSave = useCallback((): boolean => {
    const dirty = dirtyRows(model.grids.main.rows);
    for (const r of dirty) {
      if (String(r.DSPCH_OP_STS ?? "") < "2050") {
        base.alert(Lang.get("MSG_VALIDATION_CNTR_DSPCH_OP_STS"));
        return false;
      }
    }
    return true;
  }, [base, model.grids.main]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: checkBeforeSave,
        afterSave: "refresh",
      }),
    [base, checkBeforeSave],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => fetchList(model.filtersRef.current ?? {}),
        rows: model.grids.main.rows,
      }),
    ],
    [fetchList, menuName, model.filtersRef, model.grids.main, onSaveMain],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
