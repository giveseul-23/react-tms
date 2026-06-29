import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apDailyManagementApi as api } from "./ApDailyManagementApi";
import { AUTH, MENU_CODE } from "./ApDailyManagement";
import {
  DAILY_MAIN_HEAD,
  DAILY_MAIN_TAIL,
  DAILY_DETAIL_HEAD,
  DAILY_DETAIL_TAIL,
  buildDailyColumns,
} from "./ApDailyManagementColumns";
import {
  makeExcelGroupAction,
  makeMemoGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { dirtyRows, ROW_STATUS, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { ApDailyManagementModel, GridKey } from "./ApDailyManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";

interface Args {
  model: ApDailyManagementModel;
}

export function useApDailyManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // dynamicColumns 캐시 — DIV_CD + LGST_GRP_CD 조합이 바뀔 때만 재조회
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const srchObj = model.rawFiltersRef.current;
      const divCd = srchObj.SRCH_AP_DIV_CD ?? "";
      const lgstGrpCd = srchObj.SRCH_AP_LGST_GRP_CD ?? "";
      const cacheKey = `${divCd}|${lgstGrpCd}`;

      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await api.getUsedChgCd({
            DIV_CD: divCd,
            LGST_GRP_CD: lgstGrpCd,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];

          chgCacheRef.current = { key: cacheKey, list: chgList };

          model.setMainColumnDefs(
            buildDailyColumns(DAILY_MAIN_HEAD, DAILY_MAIN_TAIL, chgList, {
              isMainGrid: true,
            }),
          );
          model.setDetailColumnDefs(
            buildDailyColumns(DAILY_DETAIL_HEAD, DAILY_DETAIL_TAIL, chgList, {
              isMainGrid: false,
            }),
          );
        } catch (err) {
          console.error("getUsedChgCd failed", err);
        }
      }

      return api.getDailyList({
        ...params,
        dynamicColumns: chgCacheRef.current.list,
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        AP_FI_STS: params.AP_FI_STS,
        DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
        DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
      });
    },
    [model],
  );

  const buildSearchParams = useCallback(
    (params: Record<string, unknown> = {}) => {
      const srchObj = model.rawFiltersRef.current;
      return {
        ...params,
        DIV_CD: srchObj.SRCH_AP_DIV_CD ?? params.DIV_CD,
        LGST_GRP_CD: srchObj.SRCH_AP_LGST_GRP_CD ?? params.LGST_GRP_CD,
        DLVRY_DT_FROM:
          srchObj.SRCH_AP_DLVRY_DT_FRM ??
          srchObj.SRCH_AP_DLVRY_DT_FROM ??
          params.DLVRY_DT_FROM,
        DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO ?? params.DLVRY_DT_TO,
      };
    },
    [model.rawFiltersRef],
  );

  const buildReportParams = useCallback(() => {
    const params = buildSearchParams(model.filtersRef.current);
    return {
      ...params,
      DLYRY_DATE_FROM: params.DLVRY_DT_FROM,
      DLYRY_DATE_TO: params.DLVRY_DT_TO,
    };
  }, [buildSearchParams, model.filtersRef]);

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: () => {
            const srchObj = model.rawFiltersRef.current;
            return api.getDetailList({
              dynamicColumns: chgCacheRef.current.list,
              DIV_CD: srchObj.SRCH_AP_DIV_CD,
              LGST_GRP_CD: srchObj.SRCH_AP_LGST_GRP_CD,
              DLVRY_DT_FROM: srchObj.SRCH_AP_DLVRY_DT_FRM,
              DLVRY_DT_TO: srchObj.SRCH_AP_DLVRY_DT_TO,
            });
          },
        },
      ]),
    [base, model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) =>
      base.callAjax(apiCall(), { mask: "main" }).then(() => base.search()),
    [base],
  );

  const requireRows = useCallback(
    (rows: any[]) => {
      if (!rows?.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return false;
      }
      return true;
    },
    [base],
  );

  const rowsToUpdateDsSave = useCallback(
    (rows: any[]) =>
      toDsSave(
        rows.map((row) => ({
          ...row,
          EDIT_STS: ROW_STATUS.UPDATE,
          MENU_CD: MENU_CODE,
        })),
      ),
    [],
  );

  const saveSelected = useCallback(
    (rows: any[], apiFn: (payload: { dsSave: any[] }) => Promise<any>) => {
      if (!requireRows(rows)) return;
      void base
        .callAjax(apiFn({ dsSave: rowsToUpdateDsSave(rows) }), { mask: "main" })
        .then(() => base.search());
    },
    [base, requireRows, rowsToUpdateDsSave],
  );

  const onDlySetlSave = useCallback(
    (rows: any[], mode: "close" | "cancel") => {
      if (!requireRows(rows)) return;
      for (const row of rows) {
        if (mode === "close" && row.DLY_SETL_STS !== "10") {
          base.alert(Lang.get("MSG_CHECK_DLY_SETL_STS_NEW"));
          return;
        }
        if (
          mode === "cancel" &&
          (String(row.DLY_SETL_STS ?? "") < "15" || row.AP_FI_STS === "3000")
        ) {
          base.alert(Lang.get("MSG_CHECK_DLY_SETL_STS_CMPLT"));
          return;
        }
      }
      saveSelected(rows, mode === "close" ? api.closeDaily : api.cancelDailyClose);
    },
    [base, requireRows, saveSelected],
  );

  const uploadExcel = useCallback(
    (uploadFn: (file: File, params: any) => Promise<any>) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".xlsx,.xls";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        void base
          .callAjax(uploadFn(file, buildSearchParams()), { mask: "main" })
          .then(() => base.search());
      };
      input.click();
    },
    [base, buildSearchParams],
  );

  const downloadBlob = useCallback((res: any, fallbackName: string) => {
    const contentDisposition = String(
      res?.headers?.["content-disposition"] ?? "",
    );
    const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
    const fileName = match ? decodeURIComponent(match[1]) : fallbackName;
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const downloadTemplate = useCallback(
    (downloadFn: () => Promise<any>, fileName: string) => {
      void downloadFn().then((res) => downloadBlob(res, fileName));
    },
    [downloadBlob],
  );

  const downloadRateExcel = useCallback(() => {
    void base
      .callAjax(
        api.downloadRatePrepare({
          MENU_CD: AUTH.grids.main,
          DIV_CD: buildSearchParams().DIV_CD,
          LGST_GRP_CD: buildSearchParams().LGST_GRP_CD,
          FRM_DTTM: buildSearchParams().DLVRY_DT_FROM,
          TO_DTTM: buildSearchParams().DLVRY_DT_TO,
        }),
        { mask: "main" },
      )
      .then(() => api.downloadRate())
      .then((res) => downloadBlob(res, `${menuName || MENU_CODE}_rate.xlsx`));
  }, [base, buildSearchParams, downloadBlob, menuName],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_DAILY_EXPENSE",
        label: "BTN_CREATE_DAILY_EXPENSE",
        onClick: () =>
          doAction(() => api.createDailyResult(buildReportParams())),
      },
      {
        type: "button",
        key: "BTN_CANCEL_DAILY_EXPENSE",
        label: "BTN_CANCEL_DAILY_EXPENSE",
        onClick: () =>
          doAction(() => api.cancelDailyResult(buildReportParams())),
      },
      {
        type: "button",
        key: "BTN_DLY_SETL",
        label: "BTN_DLY_SETL",
        onClick: ({ data }: { data: any[] }) => onDlySetlSave(data, "close"),
      },
      {
        type: "button",
        key: "BTN_DLY_SETL_CANCEL",
        label: "BTN_DLY_SETL_CANCEL",
        onClick: ({ data }: { data: any[] }) => onDlySetlSave(data, "cancel"),
      },
      {
        type: "dropdown",
        key: "BTN_FUEL_MGMT",
        label: "BTN_FUEL_MGMT",
        items: [
          {
            type: "button",
            key: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            label: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            onClick: () =>
              downloadTemplate(
                api.downloadFuelFareTemplate,
                `${menuName || MENU_CODE}_fuel.xlsx`,
              ),
          },
          {
            type: "button",
            key: "BTN_UPLOAD_FUEL_EXCEL",
            label: "BTN_UPLOAD_FUEL_EXCEL",
            onClick: () => uploadExcel(api.uploadFuelFare),
          },
        ],
      },
      {
        type: "dropdown",
        key: "BTN_REGI_RATE_MGMT",
        label: "BTN_REGI_RATE_MGMT",
        items: [
          {
            type: "button",
            key: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            label: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            onClick: downloadRateExcel,
          },
          {
            type: "button",
            key: "BTN_EXCEL_UP",
            label: "BTN_EXCEL_UP",
            onClick: () => uploadExcel(api.uploadRate),
          },
        ],
      },
      makeMemoGroupAction({
        saveMemo: (rows, text) => api.saveMemo(rows, text),
        cancelMemo: (rows) => api.cancelMemo(rows),
        onDone: () => base.search(),
      }),
      {
        type: "dropdown",
        key: "BTN_RE_CALC",
        label: "BTN_RE_CALC",
        items: [
          {
            type: "button",
            key: "LBL_TOTAL_DISTANCE",
            label: "LBL_TOTAL_DISTANCE",
            onClick: ({ data }: { data: any[] }) =>
              base.confirm(Lang.get("LBL_AP_CONFIRM_MSG"), () =>
                saveSelected(data, api.calcDistance),
              ),
          },
          {
            type: "button",
            key: "BTN_FREIGHT",
            label: "BTN_FREIGHT",
            onClick: ({ data }: { data: any[] }) =>
              saveSelected(data, api.recalculate),
          },
        ],
      },
      makeSaveAction({
        onClick: (e: any) => {
          const saveRows = dirtyRows(e.data);
          if (saveRows.length === 0) return;
          base
            .callAjax(api.save(toDsSave(saveRows)), { mask: "main" })
            .then(() => base.search());
        },
      }),
      {
        type: "dropdown",
        key: "BTN_FREIGHT_EXCEL_UP",
        label: "BTN_FREIGHT_EXCEL_UP",
        items: [
          {
            type: "button",
            key: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            label: "BTN_DOWN_FUEL_EXCEL_TEMPLATE",
            onClick: () =>
              downloadTemplate(
                api.downloadFreightTemplate,
                `${menuName || MENU_CODE}_freight.xlsx`,
              ),
          },
          {
            type: "button",
            key: "BTN_UPLOAD_FUEL_EXCEL",
            label: "BTN_UPLOAD_FUEL_EXCEL",
            onClick: () => uploadExcel(api.uploadFreight),
          },
        ],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getDailyList(buildSearchParams(model.filtersRef.current)),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      base,
      buildReportParams,
      buildSearchParams,
      doAction,
      downloadRateExcel,
      downloadTemplate,
      menuName,
      model.filtersRef,
      model.grids.main,
      onDlySetlSave,
      saveSelected,
      uploadExcel,
    ],
  );

  const detailActions = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          return api.getDetailList({
            ...buildSearchParams(model.filtersRef.current),
            dynamicColumns: chgCacheRef.current.list,
          });
        },
        rows: () => model.grids.detail.rows,
      }),
    ],
    [buildSearchParams, menuName, model.filtersRef, model.grids.detail],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
  };
}
