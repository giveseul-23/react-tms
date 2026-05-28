// src/views/vehicleMgmt/VehicleMgmtController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { vehicleMgmtApi as api } from "./vehicleMgmtApi";
import { useGuard } from "@/hooks/useGuard";
import { MAIN_COLUMN_DEFS } from "./VehicleMgmtColumns";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VehicleMgmtModel, GridKey } from "./VehicleMgmtModel";

interface Args {
  model: VehicleMgmtModel;
}

export function useVehicleMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { guardHasData } = useGuard();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getVehicleList(params),
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
    (row: any) => {
      const data = model.grids.main.data;
      const localIdx = data.rows.findIndex((r: any) => r.VEH_ID === row.VEH_ID);
      const globalIdx = (data.page - 1) * data.limit + localIdx;
      model.grids.main.setSelected(row);
      model.setDetailData({ ...row });
      model.setDetailMode("edit");
      model.setDetailIndex(globalIdx);
      model.setDetailOpen(true);
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
        model.setDetailIndex(nextGlobalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getVehicleList({
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
        model.setDetailIndex(globalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getVehicleList({
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
            model.setDetailIndex(globalIdx);
          }
        } finally {
          model.setNavigating(false);
        }
      }
    },
    [model],
  );

  const handleSaveDetail = useCallback(() => {
    const data = model.detailData;
    if (!data.VEH_NO?.trim()) return;
    base
      .callAjax(api.updateVehicle(data), "MSG_SAVE_CMPLT")
      .then(() => base.search());
  }, [model, base]);

  const handleDeleteDetail = useCallback(() => {
    const data = model.detailData;
    base.confirm(`"${data.VEH_NO}" 차량을 삭제하시겠습니까?`, () => {
      base
        .callAjax(api.deleteVehicle({ VEH_CD: data.VEH_CD }), "삭제되었습니다.")
        .then(() => {
          model.closeDetail();
          base.search();
        });
    });
  }, [model, base]);

  const handleOpenNew = useCallback(() => {
    model.setNewFormData({
      VEH_NO: "",
      DIV_CD: "",
      DIV_NM: "",
      LGST_GRP_CD: "",
      LGST_GRP_NM: "",
      SETL_TP: "",
      CARR_CD: "",
      CARR_NM: "",
      DRVR_ID: "",
      DRVR_NM: "",
      HLPR_ID: "",
      HLPR_NM: "",
      PAY_CARR_CD: "",
      PAY_CARR_NM: "",
      VEH_OP_STS: "100",
      VEH_OP_TP: "",
      VEH_TP_CD: "",
      VEH_TP_NM: "",
      AP_LGST_GRP_CD: "",
      INSRNC_CALC_YN: "N",
      AUTO_DLVRY_REQ_YN: "N",
      AUTO_ACPT_YN: "N",
    });
    model.setNewSlideOpen(true);
  }, [model]);

  const handleSaveNew = useCallback(() => {
    const data = model.newFormData;
    if (!data.VEH_NO?.trim()) return;
    base.callAjax(api.insertVehicle(data), "등록되었습니다.").then(() => {
      model.setNewSlideOpen(false);
      base.search();
    });
  }, [model, base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "신규등록",
        label: "+ 신규 등록",
        variant: "primary",
        onClick: () => handleOpenNew(),
      },
      {
        type: "button",
        key: "차량전송IF",
        label: "차량전송(IF)",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          base
            .callAjax(api.sendVehicleIF(e.data), "차량전송(IF) 처리되었습니다.")
            .then(() => base.search());
        },
      },
      {
        type: "button",
        key: "연락처변경",
        label: "연락처변경",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          base
            .callAjax(api.changeContact(e.data), "연락처 변경되었습니다.")
            .then(() => base.search());
        },
      },
      {
        type: "button",
        key: "차고지일괄변경",
        label: "차고지일괄변경",
        onClick: (e: any) => {
          if (!guardHasData(e.data)) return;
          base
            .callAjax(
              api.changeGarageBatch(e.data),
              "차고지 일괄변경되었습니다.",
            )
            .then(() => base.search());
        },
      },
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "차량관리",
        fetchFn: () => api.getVehicleList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleOpenNew, base, guardHasData, model],
  );

  return {
    fetchVehicleList: fetchList,
    onSearchCallback,
    handleRowClicked,
    handleNavigate,
    handleJumpTo,
    handleSaveDetail,
    handleDeleteDetail,
    handleOpenNew,
    handleSaveNew,
    mainActions,
  };
}
