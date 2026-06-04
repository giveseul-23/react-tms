import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { hipassApi as api } from "./HipassApi";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { HipassModel, GridKey } from "./HipassModel";
import { Lang } from "@/app/services/common/Lang";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { newRid } from "@/app/feature/useBaseModel";

const CARD_NO_PATTERN = /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/;

interface ControllerArgs {
  model: HipassModel;
}

export function useHipassController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.closeDetail();
    },
    [model],
  );

  const handleRowClicked = useCallback(
    async (row: any) => {
      const rows = model.grids.main.data.rows;
      let localIdx = rows.findIndex(
        (r: any) =>
          r === row ||
          (row.__rid__ != null && r.__rid__ === row.__rid__) ||
          (row.HIPASS_ID != null && r.HIPASS_ID === row.HIPASS_ID),
      );
      if (localIdx < 0 && row.EDIT_STS === ROW_STATUS.INSERT) {
        localIdx = rows.length;
      }
      model.grids.main.setSelected(row);
      model.setDetailMode(
        row.EDIT_STS === ROW_STATUS.INSERT || !row.HIPASS_ID ? "new" : "edit",
      );
      model.setDetailIndex(localIdx);
      model.setDetailOpen(true);

      if (row.EDIT_STS === ROW_STATUS.INSERT || !row.HIPASS_ID) {
        return;
      }

      try {
        model.setNavigating(true);
        const res: any = await api.searchOne({ HIPASS_ID: row.HIPASS_ID });
        const ds = res?.data?.data?.dsOut ?? res?.data?.dsOut;
        const one =
          ds && typeof ds === "object" && !Array.isArray(ds) ? ds : {};
        // 상세 재조회 값을 그리드 행에 반영. 새 객체라 __orig__ 가 재캡처되어
        // 비교 기준이 폼에 표시되는 값과 일치 → 원복 시 EDIT_STS 정상 해제.
        model.grids.main.setData((prev) => ({
          ...prev,
          rows: prev.rows.map((r) =>
            r.__rid__ === row.__rid__ ? { ...r, ...one } : r,
          ),
        }));
      } finally {
        model.setNavigating(false);
      }
    },
    [model],
  );

  const handleNavigate = useCallback(
    (dir: number) => {
      const rows = model.grids.main.data.rows;
      const nextLocal = model.detailIndex + dir;
      if (nextLocal < 0 || nextLocal >= rows.length) return;
      const nextRow = rows[nextLocal];
      model.grids.main.setSelected(nextRow);
      model.setDetailMode(
        nextRow.EDIT_STS === ROW_STATUS.INSERT || !nextRow.HIPASS_ID
          ? "new"
          : "edit",
      );
      model.setDetailIndex(nextLocal);
    },
    [model],
  );

  const handleJumpTo = useCallback(
    (targetNum: number) => {
      const rows = model.grids.main.data.rows;
      const localIdx = targetNum - 1;
      if (localIdx < 0 || localIdx >= rows.length) return;
      if (localIdx === model.detailIndex) return;
      const row = rows[localIdx];
      model.grids.main.setSelected(row);
      model.setDetailMode(
        row.EDIT_STS === ROW_STATUS.INSERT || !row.HIPASS_ID ? "new" : "edit",
      );
      model.setDetailIndex(localIdx);
    },
    [model],
  );

  const onAddMain = useCallback(() => {
    const filters = model.filtersRef.current ?? {};
    const added = {
      LGST_GRP_CD: filters.SRCH_GR_LGST_GRP_CD ?? filters.LGST_GRP_CD ?? "",
      LGST_GRP_NM: filters.SRCH_GR_LGST_GRP_NM ?? filters.LGST_GRP_NM ?? "",
      EDIT_STS: "I",
      __rid__: newRid(),
    };
    model.grids.main.setData((prev) => ({
      ...prev,
      rows: [...(prev?.rows ?? []), added],
    }));
    model.grids.main.setSelected(added);
    void handleRowClicked(added);
  }, [model, handleRowClicked]);

  const onSaveMain = useCallback(() => {
    base.saveGrid("main", api.save, {
      beforeSave: () => {
        for (const row of model.grids.main.rows) {
          if (
            row.EDIT_STS !== ROW_STATUS.INSERT &&
            row.EDIT_STS !== ROW_STATUS.UPDATE
          ) {
            continue;
          }
          if (
            row.EDIT_STS === ROW_STATUS.INSERT &&
            !CARD_NO_PATTERN.test(String(row.HIPASS_CARD_NO))
          ) {
            base.alert(Lang.get("MSG_HIPASS_INVALID_CARD_NO"));
            return false;
          }
        }
        return true;
      },
      afterSave: () => {
        model.closeDetail();
        base.search();
      },
    });
  }, [base, model]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [onAddMain, onSaveMain],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
    handleRowClicked,
    handleNavigate,
    handleJumpTo,
  };
}
