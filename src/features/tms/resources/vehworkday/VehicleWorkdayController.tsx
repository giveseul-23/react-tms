import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelUploadAction,
  makeExcelTemplateDownloadAction,
} from "@/app/components/grid/actions/commonActions";
import { vehicleWorkdayApi as api } from "./VehicleWorkdayApi";
import {
  downExcelSearch,
  downExcelSearched,
} from "@/app/services/common/excelService";
import {
  MAIN_COLUMN_DEFS,
  buildVehicleWorkdayColumns,
  getDayFields,
  hasNumber,
  toYmdText,
} from "./VehicleWorkdayColumns";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VehicleWorkdayModel, GridKey } from "./VehicleWorkdayModel";
import { Lang } from "@/app/services/common/Lang";
import { ROW_STATUS } from "@/app/components/grid/gridUtils/rowStatus";
import { usePopup } from "@/app/components/popup/PopupContext";
import WorkdayDetailPopup from "./popup/WorkdayDetailPopup";

const MENU_CD = "MENU_VEH_WORKDAY_MGMT";
// 서버 메인 그리드 authId — 업로드 GRID_ID / 양식 다운로드 키 (센차 grid.authId 대응).
const GRID_ID = "MAIN_GRID_VEH_WORKDAY_MGMT";

interface ControllerArgs {
  model: VehicleWorkdayModel;
}

export function useVehicleWorkdayController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const dayList = getDayFields(params.SDATE as string, params.EDATE as string);
      model.setMainColumnDefs(
        buildVehicleWorkdayColumns(MAIN_COLUMN_DEFS, dayList)
      );
      return api.getList(params);
    }
    ,
    [model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const onCellDoubleClicked = useCallback(
    (params: any) => {
      const field = params.colDef?.field;
      if (!hasNumber(field)) return;

      const row = params.data;
      const cellData = row?.[field];
      if (cellData == null || String(cellData).trim() === "") return;

      openPopup({
        title: "LBL_WORKINGDAY_DTL",
        content: (
          <WorkdayDetailPopup
            dataIndex={field}
            record={row}
            onConfirm={(data) => {
              const needsDetail =
                data.workDayTp !== "WDT_1000" &&
                data.workDayTp !== "WDT_1100";
              const updatedRow: Record<string, any> = {
                ...row,
                [field]: data.workDayTp,
                [`${field}_MEMO`]: data.memo ?? "",
              };
              if (needsDetail) {
                updatedRow[`${field}_DTL_TP`] = data.workDayDtlTp ?? "";
              } else {
                updatedRow[`${field}_DTL_TP`] = "";
              }

              closePopup();
              base
                .callAjax(
                  api.saveWorkday({ ...updatedRow, WRK_DAY: field }),
                  "MSG_SAVE_CMPLT",
                )
                .then(() => {
                  base.search();
                });
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [openPopup, closePopup, base],
  );

  const getSearchDateRange = useCallback(() => {
    const srchObj = model.rawFiltersRef.current ?? {};
    return {
      SDATE: toYmdText(srchObj.SRCH_DTL_WRK_DAY_FRM),
      EDATE: toYmdText(srchObj.SRCH_DTL_WRK_DAY_TO),
    };
  }, [model.rawFiltersRef]);

  const setSearchParam = useCallback(() => {
    const { SDATE, EDATE } = getSearchDateRange();
    const rows = model.grids.main.ref.current?.rows ?? [];
    if (rows.length === 0) return false;
    for (const row of rows) {
      row.SDATE = SDATE;
      row.EDATE = EDATE;
      row.EDIT_STS = ROW_STATUS.UPDATE;
    }
    return true;
  }, [getSearchDateRange, model.grids.main]);

  const onSaveMain = useCallback(async () => {
    if (!setSearchParam()) {
      base.alert(Lang.get("MSG_NO_CHANGE_DATA"));
      return;
    }
    await base.saveGrid("main", api.save, {
      successMsg: "MSG_SAVE_CMPLT",
    });
  }, [base, setSearchParam]);

  const onInitialize = useCallback(
    (e?: { data?: unknown[] }) => {
      const selectedRows = Array.isArray(e?.data) ? e.data : [];
      if (selectedRows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }

      const { SDATE, EDATE } = getSearchDateRange();
      const dsSave = selectedRows.map((row: any) => ({
        ...row,
        SDATE,
        EDATE,
      }));

      base
        .callAjax(api.initWorkday({ dsSave }), "MSG_SAVE_CMPLT")
        .then(() => base.search());
    },
    [base, getSearchDateRange],
  );

  const getExcelSearchParams = useCallback(
    () => getSearchDateRange(),
    [getSearchDateRange],
  );

  // 엑셀 업로드 / 양식 다운로드 — 공통 버튼. (센차 gridExcelUpload / gridExcelTemplateDownload)
  const excelUploadAction = useMemo(
    () =>
      makeExcelUploadAction({
        menuCode: MENU_CD,
        gridId: GRID_ID,
        onUploaded: () => base.search(),
      }),
    [base],
  );
  const excelTemplateDownloadAction = useMemo(
    () =>
      makeExcelTemplateDownloadAction({
        menuCode: MENU_CD,
        gridId: GRID_ID,
        fileName: Lang.get("MENU_VEH_WORKDAY_MGMT"),
      }),
    [],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_INITIALIZE",
        label: "LBL_INITIALIZE",
        onClick: onInitialize,
      },
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
                columns: model.mainColumnDefs as any,
                searchParams: getExcelSearchParams(),
                menuName: Lang.get("MENU_VEH_WORKDAY_MGMT"),
                fetchFn: (params) => api.getList(params),
              }),
          },
          {
            type: "button",
            key: "BTN_EXCEL_DOWN_GRID",
            label: "BTN_EXCEL_DOWN_GRID",
            onClick: () =>
              downExcelSearched({
                columns: model.mainColumnDefs as any,
                rows: model.grids.main.rows,
                menuName: Lang.get("MENU_VEH_WORKDAY_MGMT"),
              }),
          },
          excelUploadAction,
          excelTemplateDownloadAction,
        ],
      },
    ],
    [
      onInitialize,
      onSaveMain,
      model,
      getExcelSearchParams,
      excelUploadAction,
      excelTemplateDownloadAction,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
    onCellDoubleClicked,
  };
}