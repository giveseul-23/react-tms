import { useCallback, useMemo, useRef } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { transferedShipmentMgmtApi as api } from "./TransferedShipmentMgmtApi";
import { MENU_CODE } from "./TransferedShipmentMgmt";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  TransferedShipmentMgmtModel,
  GridKey,
} from "./TransferedShipmentMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import TransferedShipmentPop from "./popup/TransferedShipmentPop";

interface Args {
  model: TransferedShipmentMgmtModel;
}

function buildSearchParams(
  model: TransferedShipmentMgmtModel,
  params: Record<string, unknown> = {},
) {
  const srch = model.rawFiltersRef.current ?? {};
  return {
    ...params,
    LGST_GRP_CD: srch.SRCH_SHPM_LGST_GRP_CD,
  };
}

const parseRows = (res: any) =>
  res?.data?.result ??
  res?.data?.data?.dsOut ??
  res?.data?.data ??
  [];

const toSearchResult = (res: any, page: number, limit: number) => {
  const rows = parseRows(res);
  return {
    rows,
    totalCount:
      rows[0]?.TOTALCOUNT != null ? Number(rows[0].TOTALCOUNT) : rows.length,
    page,
    limit,
  };
};

export function useTransferedShipmentMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup } = usePopup();
  const rcvSearchResultRef = useRef<any>(null);

  const fetchDetail = useCallback(
    (row: any) =>
      row?.SHPM_ID
        ? api.searchDetail({ SHPM_ID: row.SHPM_ID })
        : Promise.resolve({ data: { result: [] } }),
    [],
  );

  const onSendMainClick = useCallback(
    (row: any) =>
      base.handleRowClick("sendMain", row, [
        { to: "sendDetail", fetch: fetchDetail },
      ]),
    [base, fetchDetail],
  );

  const onRcvMainClick = useCallback(
    (row: any) =>
      base.handleRowClick("rcvMain", row, [
        { to: "rcvDetail", fetch: fetchDetail },
      ]),
    [base, fetchDetail],
  );

  const openTrnfHistPop = useCallback(
    (row: any) => {
      if (!row?.SHPM_ID) return;
      openPopup({
        title: Lang.get("LBL_TRNF_HIST"),
        width: "xl",
        content: <TransferedShipmentPop shpmId={String(row.SHPM_ID)} />,
      });
    },
    [openPopup],
  );

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const merged = buildSearchParams(model, params);
      const page = Number(params.page ?? 1);
      const limit = Number(params.limit ?? 20);

      const [sendRes, rcvRes] = await Promise.all([
        api.search(merged),
        api.searchReceive(merged),
      ]);
      rcvSearchResultRef.current = { res: rcvRes, page, limit };
      return sendRes;
    },
    [model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.sendMain.setData(data);
      onSendMainClick(data?.rows?.[0]);

      const pending = rcvSearchResultRef.current;
      if (pending?.res) {
        const rcvData = toSearchResult(pending.res, pending.page, pending.limit);
        model.grids.rcvMain.setData(rcvData);
        onRcvMainClick(rcvData.rows?.[0]);
      }
    },
    [model, onSendMainClick, onRcvMainClick],
  );

  const sendMainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sendMain.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.search(buildSearchParams(model, model.filtersRef.current)),
        rows: () => model.grids.sendMain.rows,
      }),
    ],
    [model, menuName],
  );

  const rcvMainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.rcvMain.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.searchReceive(buildSearchParams(model, model.filtersRef.current)),
        rows: () => model.grids.rcvMain.rows,
      }),
    ],
    [model, menuName],
  );

  return {
    fetchList,
    onSearchCallback,
    onSendMainClick,
    onRcvMainClick,
    onSendMainDoubleClick: openTrnfHistPop,
    onRcvMainDoubleClick: openTrnfHistPop,
    sendMainActions,
    rcvMainActions,
  };
}
