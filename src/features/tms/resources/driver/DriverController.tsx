import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelUploadAction,
  makeExcelTemplateDownloadAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import {
  ROW_STATUS,
  dirtyRows,
  toDsSave,
} from "@/app/components/grid/gridCommon";
import {
  downExcelSearch,
  downExcelSearched,
} from "@/app/services/common/excelService";
import { driverApi as api } from "./DriverApi";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./DriverColumns";
import type { DriverModel, GridKey } from "./DriverModel";

const DRVR_ID_PATTERN = /^[a-zA-Z0-9_]+$/;
const MENU_CD = "MENU_DRVR_MGMT";
// 서버 메인 그리드 authId — 업로드 GRID_ID / 양식 다운로드 키 (센차 grid.authId 대응).
const GRID_ID = "MAIN_GRID_DRVR_MGMT";

interface ControllerArgs {
  model: DriverModel;
}

export function useDriverController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { resetGrids, requireParentRow } = base;

  const fetchList = useCallback((params: Record<string, unknown>) => {
    const next = { ...params };
    const cust = next.SRCH_AU_CUST_CD;
    if (cust != null && cust !== "") {
      next.CUST_CD = cust;
    }
    return api.getList(next);
  }, []);

  const fetchSub01 = useCallback(
    (mainRow: any) => {
      if (!mainRow?.DRVR_ID || mainRow.EDIT_STS === ROW_STATUS.INSERT) {
        return Promise.resolve({ data: { data: { dsOut: [] } } });
      }
      return api.getCustList({ DRVR_ID: mainRow.DRVR_ID });
    },
    [],
  );

  const loadSub01 = useCallback(
    async (mainRow: any) => {
      resetGrids(["sub01"]);
      if (!mainRow) return;

      if (mainRow.EDIT_STS === ROW_STATUS.INSERT) {
        base.addRow("sub01", { DRVR_ID: mainRow.DRVR_ID ?? "" });
        return;
      }

      await base.searchSub("sub01", fetchSub01(mainRow));
    },
    [base, fetchSub01, resetGrids],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      if (!row) return;

      if (row.EDIT_STS === ROW_STATUS.INSERT) {
        model.grids.main.setSelected(row);
        resetGrids(["sub01"]);
        base.addRow("sub01", { DRVR_ID: row.DRVR_ID ?? "" });
        return;
      }

      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: fetchSub01,
        },
      ]);
    },
    [base, fetchSub01, model.grids.main, resetGrids],
  );

  const applyUnmaskedPhone = useCallback(
    (row: any, phone: string) => {
      const rowKey = row.__rid__;
      model.grids.main.setData((prev: any) => {
        const rows = prev?.rows ?? [];
        let changed = false;
        const nextRows = rows.map((gridRow: any) => {
          if (gridRow !== row && gridRow?.__rid__ !== rowKey) return gridRow;
          if (gridRow.MBL_PHN_NO === phone && gridRow.MBL_PHN_NO_DEC === phone) {
            return gridRow;
          }
          changed = true;
          return {
            ...gridRow,
            MBL_PHN_NO_DEC: phone,
            MBL_PHN_NO: phone,
            unmaskLoaded: true,
          };
        });
        return changed ? { ...prev, rows: nextRows } : prev;
      });
    },
    [model.grids.main],
  );

  const onMainCellEditingStarted = useCallback(
    async (params: any) => {
      if (params.colDef?.field !== "MBL_PHN_NO") return;

      const row = params.data;
      if (!row) return;

      if (
        row.EDIT_STS === ROW_STATUS.INSERT ||
        row.EDIT_STS === ROW_STATUS.UPDATE
      ) {
        return;
      }

      if (row.unmaskLoaded || row.MBL_PHN_NO_LOADING) return;

      const mblPhnNo = String(row.MBL_PHN_NO ?? "").trim();
      if (!mblPhnNo || !mblPhnNo.includes("*")) return;

      row.MBL_PHN_NO_LOADING = true;
      params.api?.stopEditing?.(true);

      try {
        const res: any = await api.searchDrvrPhnNoOne({
          DRVR_ID: row.DRVR_ID,
          rowStatus: "S",
        });
        const dsOut = res?.data?.data?.dsOut ?? res?.data?.dsOut;
        const phone = String(dsOut?.MBL_PHN_NO ?? "");
        applyUnmaskedPhone(row, phone);

        requestAnimationFrame(() => {
          row.MBL_PHN_NO_LOADING = false;
          params.api?.startEditingCell?.({
            rowIndex: params.rowIndex,
            colKey: "MBL_PHN_NO",
          });
        });
      } catch {
        row.MBL_PHN_NO_LOADING = false;
        base.alert(Lang.get("MSG_EXCEPTION_LOADING_DATA"));
      }
    },
    [applyUnmaskedPhone, base],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;
      if (firstMain) {
        model.grids.main.setSelected(firstMain);
        await loadSub01(firstMain);
      } else {
        resetGrids(["sub01"]);
      }
    },
    [loadSub01, model.grids.main, resetGrids],
  );

  const hasPendingInsert = useCallback(() => {
    const mainHasInsert = model.grids.main.rows.some(
      (r: any) => r.EDIT_STS === ROW_STATUS.INSERT,
    );
    const subHasInsert = model.grids.sub01.rows.some(
      (r: any) => r.EDIT_STS === ROW_STATUS.INSERT,
    );
    return mainHasInsert || subHasInsert;
  }, [model.grids.main.rows, model.grids.sub01.rows]);

  const onAddMain = useCallback(() => {
    if (hasPendingInsert()) {
      base.alert(Lang.get("MSG_SAVE_BEFORE_ADD"));
      return;
    }
    resetGrids(["sub01"]);
    base.addRow("main", {});
    const added = model.grids.main.selectedRef.current;
    if (added) {
      base.addRow("sub01", { DRVR_ID: added.DRVR_ID ?? "" });
    }
  }, [base, hasPendingInsert, model.grids.main.selectedRef, resetGrids]);

  const validateMainBeforeSave = useCallback(() => {
    const mainDirty = dirtyRows(model.grids.main.rows);
    const subRows = model.grids.sub01.rows;

    for (const row of mainDirty) {
      if (row.EDIT_STS === ROW_STATUS.DELETE) continue;

      if (
        row.EDIT_STS === ROW_STATUS.INSERT &&
        !DRVR_ID_PATTERN.test(String(row.DRVR_ID ?? ""))
      ) {
        base.alert(Lang.get("MSG_REGEX_TEXT"));
        return false;
      }
      if (row.EDIT_STS === ROW_STATUS.INSERT) {
        const subDirty = dirtyRows(subRows);
        const custRow = subDirty[0] ?? subRows[0];
        if (!String(custRow?.CUST_CD ?? "").trim()) {
          base.alert(Lang.get("MSG_CHECK_ADD_DRVR_CUST"));
          return false;
        }
      }
    }
    return true;
  }, [base, model.grids.main.rows, model.grids.sub01.rows]);

  const checkDrvrPhnNo = useCallback(
    async (row: any): Promise<boolean> => {
      if (!String(row.MBL_PHN_NO ?? "").trim()) return true;

      try {
        const res: any = await api.searchDrvrPhnNo({
          DRVR_ID: row.DRVR_ID,
          MBL_PHN_NO: row.MBL_PHN_NO,
          rowStatus: row.EDIT_STS,
        });
        const dsOut = res?.data?.data?.dsOut ?? res?.data?.dsOut;
        if (!dsOut?.MSG_CD) return true;

        return await new Promise<boolean>((resolve) => {
          base.confirm(String(dsOut.MSG_CD), () => resolve(true), "");
        });
      } catch {
        return false;
      }
    },
    [base],
  );

  const onSaveMain = useCallback(async () => {
    const mainDirty = dirtyRows(model.grids.main.rows);

    if (!validateMainBeforeSave()) return;

    const subRows = model.grids.sub01.rows;
    const custCdList = subRows
      .map((r: any) => r.CUST_CD)
      .filter(Boolean)
      .join(",");

    for (const row of mainDirty) {
      row.MENU_CD = "MENU_DRVR_MGMT";
      row.CUST_CD_LIST = custCdList;
      if (row.EDIT_STS === ROW_STATUS.INSERT) {
        const subDirty = dirtyRows(subRows);
        const custRow = subDirty[0] ?? subRows[0];
        row.CUST_CD = custRow?.CUST_CD;
      }

      if (
        row.EDIT_STS !== ROW_STATUS.DELETE &&
        !(await checkDrvrPhnNo(row))
      ) {
        return;
      }
    }

    await base.saveGrid("main", api.save);
  }, [base, checkDrvrPhnNo, model.grids.main, model.grids.sub01.rows, validateMainBeforeSave]);

  const onInitPasswd = useCallback(async () => {
    const selected = model.grids.main.selectedRef.current;
    if (!selected) {
      base.alert(Lang.get("MSG_SELECT_USER"));
      return;
    }
    await base.callAjax(
      api.initPasswd({
        dsSave: toDsSave([{ ...selected, EDIT_STS: ROW_STATUS.UPDATE }]),
      }),
    );
  }, [base, model.grids.main.selectedRef]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!requireParentRow(main, Lang.get("LBL_DRIVER_CODE"))) return;
    if (!String(main.DRVR_ID ?? "").trim()) {
      base.alert(Lang.get("MSG_NOT_SELECTED_DRIVER"));
      return;
    }
    base.addRow("sub01",
      { DRVR_ID: main.DRVR_ID }
    );
  }, [base, model.grids.main.selectedRef, requireParentRow]);

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveDetail, {
        beforeSave: () => {
          const main = model.grids.main.selectedRef.current;
          if (!String(main?.DRVR_ID ?? "").trim()) {
            base.alert(Lang.get("MSG_CHK_DRVR_ID_NO_INPUT"));
            return false;
          }
          return true;
        },
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getCustList({ DRVR_ID: main.DRVR_ID }),
        },
      }),
    [base, model.grids.main.selectedRef],
  );

  // 엑셀 업로드(드라이버 전용 URL) / 양식 다운로드 — 공통 버튼. (센차 onUploadDrvrExcel / gridExcelTemplateDownload)
  const excelUploadAction = useMemo(
    () =>
      makeExcelUploadAction({
        menuCode: MENU_CD,
        gridId: GRID_ID,
        url: "/driverService/uploadDrvr",
        onUploaded: () => base.search(),
      }),
    [base],
  );
  const excelTemplateDownloadAction = useMemo(
    () =>
      makeExcelTemplateDownloadAction({
        menuCode: MENU_CD,
        gridId: GRID_ID,
        fileName: Lang.get("MENU_DRIVER_MANAGER"),
      }),
    [],
  );

  const getExcelSearchParams = useCallback(() => {
    const params = { ...(model.filtersRef.current ?? {}) };
    const cust = params.SRCH_AU_CUST_CD;
    if (cust != null && cust !== "") {
      params.CUST_CD = cust;
    }
    return params;
  }, [model.filtersRef]);

  const getSub01ExcelSearchParams = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    return main?.DRVR_ID ? { DRVR_ID: main.DRVR_ID } : {};
  }, [model.grids.main.selectedRef]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_INIT_PASSWD",
        label: "BTN_INIT_PASSWD",
        onClick: onInitPasswd,
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "group",
        key: "BTN_EXCEL",
        label: "BTN_EXCEL",
        items: [
          {
            type: "button",
            key: "BTN_EXCEL_DOWN_ALL",
            label: "BTN_EXCEL_DOWN_ALL",
            onClick: () =>
              downExcelSearch({
                columns: MAIN_COLUMN_DEFS(),
                searchParams: getExcelSearchParams(),
                menuName: Lang.get("MENU_DRIVER_MANAGER"),
                fetchFn: (params) => fetchList(params),
              }),
          },
          {
            type: "button",
            key: "BTN_EXCEL_DOWN_GRID",
            label: "BTN_EXCEL_DOWN_GRID",
            onClick: () =>
              downExcelSearched({
                columns: MAIN_COLUMN_DEFS(),
                rows: model.grids.main.rows,
                menuName: Lang.get("MENU_DRIVER_MANAGER"),
              }),
          },
          excelUploadAction,
          excelTemplateDownloadAction,
        ],
      },
    ],
    [
      model,
      getExcelSearchParams,
      fetchList,
      onAddMain,
      onInitPasswd,
      onSaveMain,
      excelUploadAction,
      excelTemplateDownloadAction,
    ],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
      {
        type: "group",
        key: "BTN_EXCEL",
        label: "BTN_EXCEL",
        items: [
          {
            type: "button",
            key: "BTN_EXCEL_DOWN_ALL",
            label: "BTN_EXCEL_DOWN_ALL",
            onClick: () =>
              downExcelSearch({
                columns: SUB01_COLUMN_DEFS(),
                searchParams: getSub01ExcelSearchParams(),
                menuName: Lang.get("MENU_DRIVER_MANAGER"),
                fetchFn: (params) => api.getCustList(params),
              }),
          },
          {
            type: "button",
            key: "BTN_EXCEL_DOWN_GRID",
            label: "BTN_EXCEL_DOWN_GRID",
            onClick: () =>
              downExcelSearched({
                columns: SUB01_COLUMN_DEFS(),
                rows: model.grids.sub01.rows,
                menuName: Lang.get("MENU_DRIVER_MANAGER"),
              }),
          },
        ],
      },
    ],
    [model, getSub01ExcelSearchParams, onAddSub01, onSaveSub01],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onMainCellEditingStarted,
    mainActions,
    sub01Actions,
  };
}
