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
import { ROW_STATUS, markUpdate } from "@/app/components/grid/gridCommon";
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
      const data = model.grids.main.data;
      let localIdx = data.rows.findIndex(
        (r: any) =>
          r === row ||
          (row.__rid__ != null && r.__rid__ === row.__rid__) ||
          (row.HIPASS_ID != null && r.HIPASS_ID === row.HIPASS_ID),
      );
      if (localIdx < 0 && row.EDIT_STS === ROW_STATUS.INSERT) {
        localIdx = data.rows.length;
      }
      const globalIdx = (data.page - 1) * data.limit + localIdx;
      model.grids.main.setSelected(row);
      model.setDetailData({ ...row });
      model.setDetailMode(
        row.EDIT_STS === ROW_STATUS.INSERT || !row.HIPASS_ID ? "new" : "edit",
      );
      model.setDetailIndex(globalIdx);
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
        model.setDetailData({ ...row, ...one });
      } finally {
        model.setNavigating(false);
      }
    },
    [model],
  );

  const handleNavigate = useCallback(
    async (dir: number) => {
      const data = model.grids.main.data;
      const nextGlobalIdx = model.detailIndex + dir;
      if (nextGlobalIdx < 0 || nextGlobalIdx >= data.totalCount) return;

      const pageSize = data.limit;
      const currentPage = data.page;
      const nextPage = Math.floor(nextGlobalIdx / pageSize) + 1;
      const localIdx = nextGlobalIdx % pageSize;

      if (nextPage === currentPage) {
        const nextRow = data.rows[localIdx];
        model.grids.main.setSelected(nextRow);
        model.setDetailData({ ...nextRow });
        model.setDetailMode("edit");
        model.setDetailIndex(nextGlobalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getList({
            ...model.filtersRef.current,
            page: nextPage,
            limit: pageSize,
          });
          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            [];
          const nextRow = rows[localIdx];
          if (nextRow) {
            model.grids.main.setSelected(nextRow);
            model.setDetailData({ ...nextRow });
            model.setDetailMode("edit");
            model.setDetailIndex(nextGlobalIdx);
          }
        } finally {
          model.setNavigating(false);
        }
      }
    },
    [model],
  );

  const handleJumpTo = useCallback(
    async (targetNum: number) => {
      const data = model.grids.main.data;
      const globalIdx = targetNum - 1;
      if (globalIdx < 0 || globalIdx >= data.totalCount) return;
      if (globalIdx === model.detailIndex) return;

      const pageSize = data.limit;
      const currentPage = data.page;
      const targetPage = Math.floor(globalIdx / pageSize) + 1;
      const localIdx = globalIdx % pageSize;

      if (targetPage === currentPage) {
        const row = data.rows[localIdx];
        model.grids.main.setSelected(row);
        model.setDetailData({ ...row });
        model.setDetailMode("edit");
        model.setDetailIndex(globalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getList({
            ...model.filtersRef.current,
            page: targetPage,
            limit: pageSize,
          });
          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            [];
          const row = rows[localIdx];
          if (row) {
            model.grids.main.setSelected(row);
            model.setDetailData({ ...row });
            model.setDetailMode("edit");
            model.setDetailIndex(globalIdx);
          }
        } finally {
          model.setNavigating(false);
        }
      }
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
    const selected = model.grids.main.selectedRef.current;
    if (selected && model.detailOpen) {
      const merged = { ...selected, ...model.detailData };
      markUpdate(merged);
      model.grids.main.setData((prev) => ({
        ...prev,
        rows: prev.rows.map((r) => (r === selected ? merged : r)),
      }));
      model.grids.main.setSelected(merged);
    }

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
