import { useCallback, useMemo, MutableRefObject} from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { AccountReceivableChargeManagementApi as api } from "./AccountReceivableChargeManagementApi";
import {
    makeAddAction,
    makeExcelGroupAction,
    makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { AccountReceivableChargeModel, GridKey } from "./AccountReceivableChargeManagementModel";
import { MAIN_COLUMN_DEFS } from "./AccountReceivableChargeManagementColumns";
import { Lang } from "@/app/services/common/Lang";
import { usePopup } from "@/app/components/popup/PopupContext";
import ArChargeAddPopup from "./popup/ArChargeAddPopup";

interface Args {
  model: AccountReceivableChargeModel;
}
const MENU_CD = "MENU_ACCOUNT_RECEIVABLE_CONTRACT_MANAGEMENT";

export function useAccountReceivableChargeController({
  model,
}: Args) {
  const { openPopup, closePopup } = usePopup();
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {

      return api.getArChargeList({
        ...params,
      });
    },
    [model],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "sub01",
            fetch: (r) => api.getArChargeDetail({
                AR_TRF_CD: r.AR_TRF_CD,
                AR_CHG_CD: r.AR_CHG_CD
            }),
          }
        ],
      ),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
    },
    [model],
  );

  const onAddMain = useCallback(() => {
    base.resetGrids(["sub01"]);
    openPopup({
      title: Lang.get("MENU_ACCOUNT_RECEIVABLE_CONTRACT_MANAGEMENT"),
      width: "2xl",
      content: (
        <ArChargeAddPopup
          onClose={closePopup}
          onApply={(picked: any) => {
            closePopup();
            const items = Array.isArray(picked) ? picked : [picked];
            for (const item of items) {
              base.addRow("main", {
                CUST_CD: item.CUST_CD,
                CUST_NM: item.CUST_NM,
                AR_TRF_LCD: item.AR_TRF_LCD,
                CUST_CNTRCT_CD: item.CUST_CNTRCT_CD,
                CUST_CNTRCT_NM: item.CUST_CNTRCT_NM,
                AR_TRF_CD: item.AR_TRF_CD,
                AR_TRF_NM: item.AR_TRF_NM,
                SUPERSEDE_YN: 'N',
                RDNG_RCD: '0300',
                USE_YN: 'Y'
              });
            }
          }}
        />
      ),
    });

    }, [base]);

    const onSaveMain = useCallback(
      () =>
        base.saveGrid("main", (payload) =>
          api.saveArCharge({
            ...payload,
            MENU_CD,
          }),
        ),
      [base],
    );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuCode: MENU_CD,
      fetchFn: () => api.getArChargeList({ MENU_CD, ...model.filtersRef.current }),
      rows: model.grids.main.rows
    }),
    ],
    [model.filtersRef, model.grids.main.rows, onAddMain, onSaveMain],
  );

  return {
    fetchList,
    onMainGridClick,
    onSearchCallback,
    mainActions,
  };
}
