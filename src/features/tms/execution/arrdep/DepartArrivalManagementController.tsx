import { useCallback, useMemo, useState } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { departArrivalManagementApi as api } from "./DepartArrivalManagementApi";
import { MENU_CD } from "./DepartArrivalManagement";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { dirtyRows } from "@/app/components/grid/gridUtils/rowStatus";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  DepartArrivalManagementModel,
  GridKey,
} from "./DepartArrivalManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import DriveHistoryPopup from "./popup/DriveHistoryPopup";
import InterStopETAPopup from "./popup/InterStopETAPopup";
import PodPopup from "./popup/PodPopup";
import RouteMapPopup from "./popup/RouteMapPopup";
import SrvcAtvtPopup from "./popup/SrvcAtvtPopup";
import StartWorkPopup from "./popup/StartWorkPopup";

interface Args {
  model: DepartArrivalManagementModel;
}

type SubGridKey = Exclude<GridKey, "main">;

const SUB_GRID_KEYS: SubGridKey[] = ["stopover", "assignedOrder", "shipmentDetail"];

const DEFAULT_SUB_PAGE_SIZE = 500;
const MAIN_TRACKED_EDIT_FIELDS = [
  "MEMO_DESC",
  ...Array.from({ length: 12 }, (_, index) => `REF_VAL_${index + 1}`),
];

const pick = (
  source: Record<string, any>,
  ...keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value != null && value !== "") return String(value);
  }
  return undefined;
};

const normalizeMainRows = (data: any) => ({
  ...data,
  rows: (data?.rows ?? []).map((row: any) => {
    const normalized = { ...row };
    MAIN_TRACKED_EDIT_FIELDS.forEach((field) => {
      if (!(field in normalized)) normalized[field] = "";
    });
    return normalized;
  }),
});

const compactDateTime = (value: any) => String(value ?? "").replace(/\D/g, "");

export function useDepartArrivalManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();
  const { menuName } = useMenuMeta();
  const [subGridPaging, setSubGridPaging] = useState<
    Record<SubGridKey, { page: number; pageSize: number }>
  >({
    stopover: { page: 1, pageSize: DEFAULT_SUB_PAGE_SIZE },
    assignedOrder: { page: 1, pageSize: DEFAULT_SUB_PAGE_SIZE },
    shipmentDetail: { page: 1, pageSize: DEFAULT_SUB_PAGE_SIZE },
  });

  const resetSubPages = useCallback((keys: SubGridKey[] = SUB_GRID_KEYS) => {
    setSubGridPaging((prev) => {
      let changed = false;
      const next = { ...prev };
      keys.forEach((key) => {
        if (next[key].page !== 1) {
          next[key] = { ...next[key], page: 1 };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  const getSubGridPageProps = useCallback(
    (gridKey: SubGridKey) => {
      const rows = model.grids[gridKey].rows ?? [];
      const paging = subGridPaging[gridKey];
      const totalPages = Math.max(1, Math.ceil(rows.length / paging.pageSize));
      const currentPage = Math.min(Math.max(paging.page, 1), totalPages);
      const start = (currentPage - 1) * paging.pageSize;

      return {
        rowData: rows.slice(start, start + paging.pageSize),
        totalCount: rows.length,
        currentPage,
        pageSize: paging.pageSize,
        onPageChange: (page: number) => {
          setSubGridPaging((prev) => ({
            ...prev,
            [gridKey]: {
              ...prev[gridKey],
              page: Math.min(Math.max(page, 1), totalPages),
            },
          }));
        },
        onPageSizeChange: (pageSize: number) => {
          setSubGridPaging((prev) => ({
            ...prev,
            [gridKey]: { page: 1, pageSize },
          }));
        },
      };
    },
    [model.grids, subGridPaging],
  );

  const buildSearchParams = useCallback((params: Record<string, unknown> = {}) => {
    const raw = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
    return {
      LGST_GRP_CD: pick(raw, "SRCH_LGST_GRP_CD", "LGST_GRP_CD") ?? params.LGST_GRP_CD ?? "",
      DIV_CD: pick(raw, "SRCH_DIV_CD", "DIV_CD") ?? params.DIV_CD ?? "",
      DLVRY_DT_FROM:
        pick(raw, "SRCH_DLVRY_DT_FRM", "SRCH_DLVRY_DT_FROM", "DLVRY_DT_FROM") ??
        params.DLVRY_DT_FROM ??
        "",
      DLVRY_DT_TO:
        pick(raw, "SRCH_DLVRY_DT_TO", "DLVRY_DT_TO") ??
        params.DLVRY_DT_TO ??
        "",
    };
  }, [model.rawFiltersRef]);

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      api.getList({ ...params, ...buildSearchParams(params) }),
    [buildSearchParams],
  );

  const onMainGridClick = useCallback(
    (row: any) => {
      resetSubPages(["stopover", "assignedOrder", "shipmentDetail"]);
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "stopover",
            fetch: (r) => api.getStopoverList({ DSPCH_NO: r.DSPCH_NO }),
          },
          {
            to: "assignedOrder",
            fetch: (r) => api.getAssignedOrderList({ DSPCH_NO: r.DSPCH_NO }),
          },
        ],
        { alsoReset: ["shipmentDetail"] },
      );
    },
    [base, resetSubPages],
  );

  const onAssignedOrderGridClick = useCallback(
    (row: any) => {
      resetSubPages(["shipmentDetail"]);
      if (!row?.SHPM_ID) {
        base.resetGrids(["shipmentDetail"]);
        return;
      }

      base.handleRowClick("assignedOrder", row, [
        {
          to: "shipmentDetail",
          fetch: (r) => api.getAssignedOrderDetailList({ SHPM_ID: r.SHPM_ID }),
        },
      ]);
    },
    [base, resetSubPages],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      const normalized = normalizeMainRows(data);
      model.grids.main.setData(normalized);
      const firstMain = normalized?.rows?.[0] ?? null;
      if (firstMain) onMainGridClick(firstMain);
      else base.resetGrids(["stopover", "assignedOrder", "shipmentDetail"]);
    },
    [base, model.grids.main, onMainGridClick],
  );

  const refetchSubTabs = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (row) onMainGridClick(row);
    else base.resetGrids(["stopover", "assignedOrder", "shipmentDetail"]);
  }, [base, model.grids.main, onMainGridClick]);

  // 선택행 기반 상태변경 액션
  const act = useCallback(
    (apiFn: (rows: any[]) => Promise<any>, e: any) => {
      const rows = (e?.data ?? []).map((row: any) => ({
        ...row,
        EDIT_STS: "U",
        rowStatus: "U",
        MENU_CD,
      }));
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      base.callAjax(apiFn(rows)).then(() => base.search());
    },
    [base],
  );

  const onStartWork = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }

      openPopup({
        title: "LBL_WORK_START_DATETIME_POPUP",
        width: "sm",
        content: (
          <StartWorkPopup
            onClose={closePopup}
            onConfirm={({ TRNS_STDT_DATE }) => {
              closePopup();
              const payload = rows.map((row: any) => ({
                ...row,
                ATA_DTTM: TRNS_STDT_DATE,
                EDIT_STS: "U",
                rowStatus: "U",
                MENU_CD,
              }));

              base.callAjax(api.startLoading(payload)).then(() => base.search());
            }}
          />
        ),
      });
    },
    [base, closePopup, openPopup],
  );

  const validateTransportDepartureTime = useCallback(
    (trnsStdtDate: string) => {
      const firstLoadingStop = [...(model.grids.stopover.rows ?? [])]
        .filter((row: any) => String(row.STOP_TP ?? "") === "10")
        .sort(
          (a: any, b: any) =>
            Number(a.STOP_SEQ ?? 0) - Number(b.STOP_SEQ ?? 0),
        )[0];

      const ataDttm = compactDateTime(firstLoadingStop?.ATA_DTTM);
      const transportDttm = compactDateTime(trnsStdtDate);
      if (!ataDttm || !transportDttm) return true;

      if (transportDttm < ataDttm) {
        base.alert(
          Lang.get("MSG_ARR_DEP_DEP_DATETIME_PRIOR_CHK"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }

      return true;
    },
    [base, model.grids.stopover.rows],
  );

  const validateStopoverTimes = useCallback(() => {
    const rows = [...(model.grids.stopover.rows ?? [])].sort(
      (a: any, b: any) => Number(a.STOP_SEQ ?? 0) - Number(b.STOP_SEQ ?? 0),
    );
    if (rows.length === 0) return true;

    let firstLoadingStop = rows[0];
    if (String(firstLoadingStop?.STOP_TP ?? "") === "99") {
      firstLoadingStop = rows[1];
    }

    const initSeq = Number(firstLoadingStop?.STOP_SEQ ?? 0);
    const initSeqDepDttm = compactDateTime(firstLoadingStop?.ATD_DTTM);

    for (const row of rows) {
      const depDttm = compactDateTime(row.ATD_DTTM);
      const arrDttm = compactDateTime(row.ATA_DTTM);
      const stopSeq = Number(row.STOP_SEQ ?? 0);

      if (stopSeq === 1 && depDttm && !arrDttm) continue;

      if (depDttm && !arrDttm) {
        base.alert(
          Lang.get("MSG_ARR_DEP_ARR_DATETIME_DEL_CHK"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }

      if (depDttm && arrDttm && depDttm < arrDttm) {
        base.alert(
          Lang.get("MSG_ARR_DEP_DEP_DATETIME_PRIOR_CHK"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }

      const prevRow = rows.find(
        (item: any) => Number(item.STOP_SEQ ?? 0) === stopSeq - 1,
      );
      const prevDepDttm = compactDateTime(prevRow?.ATD_DTTM);
      if (prevDepDttm && arrDttm && prevDepDttm > arrDttm) {
        base.alert(
          Lang.get("MSG_ARR_DEP_ARR_DATETIME_PRIOR_CHK"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }

      if (
        initSeqDepDttm &&
        initSeq === 1 &&
        ((depDttm && depDttm < initSeqDepDttm) ||
          (arrDttm && arrDttm < initSeqDepDttm))
      ) {
        base.alert(
          Lang.get("MSG_ARR_DEP_DATETIME_INIT_PRIOR_CHK"),
          Lang.get("TTL_ALERT"),
        );
        return false;
      }
    }

    return true;
  }, [base, model.grids.stopover.rows]);

  const onStartTransportation = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }

      openPopup({
        title: "LBL_TRANSPORTATION_START_DATETIME_POPUP",
        width: "sm",
        content: (
          <StartWorkPopup
            messageKey="MSG_INSERT_START_DATETIME"
            onClose={closePopup}
            onConfirm={({ TRNS_STDT_DATE }) => {
              if (!validateTransportDepartureTime(TRNS_STDT_DATE)) return;

              closePopup();
              const payload = rows.map((row: any) => ({
                ...row,
                ATD_DTTM: TRNS_STDT_DATE,
                EDIT_STS: "U",
                rowStatus: "U",
                MENU_CD,
              }));

              base.callAjax(api.startTransport(payload)).then(() => base.search());
            }}
          />
        ),
      });
    },
    [base, closePopup, openPopup, validateTransportDepartureTime],
  );

  const onShowPod = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      if (rows.length > 1) {
        base.alert(Lang.get("MSG_SELECT_ONLY_ONE"), Lang.get("TTL_CONFIRM"));
        return;
      }

      openPopup({
        title: "LBL_POD",
        width: "4xl",
        content: <PodPopup row={rows[0]} />,
      });
    },
    [base, openPopup],
  );

  const _onShowInterStopEta = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length !== 1) {
        base.alert(Lang.get("MSG_CHECK_SINGLE_RECORD"), Lang.get("TTL_ALERT"));
        return;
      }

      openPopup({
        title: "BTN_INTER_STOP_ETA",
        width: "2xl",
        content: (
          <InterStopETAPopup
            dspchNo={String(rows[0].DSPCH_NO ?? "")}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, closePopup, openPopup],
  );

  const onShowDriveHistory = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length !== 1) {
        base.alert(Lang.get("MSG_CHECK_SINGLE_RECORD"), Lang.get("TTL_ALERT"));
        return;
      }

      openPopup({
        title: "MENU_DRIVE_HISTORY",
        width: "full",
        content: <DriveHistoryPopup row={rows[0]} />,
      });
    },
    [base, openPopup],
  );

  const onShowRouteMap = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    if (!row) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }

    openPopup({
      title: "LBL_LANE",
      width: "full",
      content: <RouteMapPopup row={row} />,
    });
  }, [base, model.grids.main, openPopup]);

  const onStopoverCellClicked = useCallback(
    (params: any) => {
      if (params?.colDef?.field !== "SRVC_ATVT_YN") return;

      const row = params?.data;
      if (!row || String(row.STOP_TP ?? "") === "99") return;

      openPopup({
        title: "LBL_SERVICE_ACTIVITY",
        width: "2xl",
        content: (
          <SrvcAtvtPopup
            row={row}
            onClose={closePopup}
            onApplied={() => {
              void api
                .getStopoverList({ DSPCH_NO: row.DSPCH_NO })
                .then((res: any) => model.grids.stopover.setData(res.data));
            }}
          />
        ),
      });
    },
    [closePopup, model.grids.stopover, openPopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      // POD 조회 / 운행이력 — 팝업 기반(추후 보강)
      { type: "button", key: "BTN_SHOW_POD", label: "BTN_SHOW_POD", onClick: onShowPod },
      //해당ETA 과거 E-mart에서만 사용하므로 제거함 2026.06.25 jjh
      //{ type: "button", key: "BTN_INTER_STOP_ETA", label: "BTN_INTER_STOP_ETA", onClick: _onShowInterStopEta },
      { type: "button", key: "BTN_DRIVE_HISTORY", label: "BTN_DRIVE_HISTORY", onClick: onShowDriveHistory },
      { type: "button", key: "BTN_SP_START_WORK", label: "BTN_SP_START_WORK", onClick: onStartWork },
      { type: "button", key: "BTN_START_TRANSPORTATION", label: "BTN_START_TRANSPORTATION", onClick: onStartTransportation },
      { type: "button", key: "BTN_RETURN_TO_CONFIRM", label: "BTN_RETURN_TO_CONFIRM", onClick: (e: any) => act(api.cancelTransport, e) },
      { type: "button", key: "BTN_DLVRY_CONFIRM/OFF_CANCEL", label: "BTN_DLVRY_CONFIRM/OFF_CANCEL", onClick: (e: any) => act(api.cancelDeliveryComplete, e) },
      { type: "button", key: "LBL_DRV_OFF", label: "LBL_DRV_OFF", onClick: (e: any) => act(api.completeTransport, e) },
      {
        type: "dropdown",
        key: "BTN_RE_SET",
        label: "BTN_RE_SET",
        items: [
          { type: "button", key: "MOVE_DISIT", label: "LBL_MOVE_DISIT", onClick: (e: any) => act(api.resetDispatch, e) },
          { type: "button", key: "AP_CLS", label: "LBL_AP_CLASSIFICATION", onClick: (e: any) => act(api.changeDspchApProcTp, e) },
          { type: "button", key: "PLN_ID", label: "LBL_DSPCH_PLN_ID_CHG", onClick: (e: any) => act(api.changeDspchPlnId, e) },
        ],
      },
      makeSaveAction({
        onClick: () => {
          void base.saveGrid("main", api.save);
        },
      }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          api.getList({
            ...(model.filtersRef.current ?? {}),
            ...buildSearchParams(model.filtersRef.current ?? {}),
          }),
        rows: model.grids.main.rows,
      }),
    ],
    [act, buildSearchParams, menuName, model.grids.main, model.filtersRef, base, onShowDriveHistory, onShowPod, onStartTransportation, onStartWork],
  );

  const stopoverActions: ActionItem[] = useMemo(
    () => [
      // 경로 보기 — 팝업 기반(추후 보강)
      { type: "button", key: "BTN_SHOW_ROUTE", label: "BTN_SHOW_ROUTE", onClick: onShowRouteMap },
      makeSaveAction({
        onClick: () =>
          base.saveGrid("stopover", api.saveStopover, {
            beforeSave: validateStopoverTimes,
            afterSave: () => refetchSubTabs(),
          }),
      }),
      {
        type: "button",
        key: "BTN_SAVE_CNTR",
        label: "BTN_SAVE_CNTR",
        onClick: () => {
          const dirty = dirtyRows(model.grids.stopover.rows).map((row: any) => ({
            ...row,
            MENU_CD,
          }));
          if (dirty.length === 0) return;
          base.callAjax(api.confirmPBoxRecovery(dirty)).then(() => refetchSubTabs());
        },
      },
    ],
    [base, refetchSubTabs, model.grids.stopover, onShowRouteMap, validateStopoverTimes],
  );

  const assignedOrderActions: ActionItem[] = useMemo(() => [], []);

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onAssignedOrderGridClick,
    onStopoverCellClicked,
    mainActions,
    stopoverActions,
    assignedOrderActions,
    stopoverPageProps: getSubGridPageProps("stopover"),
    assignedOrderPageProps: getSubGridPageProps("assignedOrder"),
    shipmentDetailPageProps: getSubGridPageProps("shipmentDetail"),
  };
}
