import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { accountReceivableManagementApi as api } from "./AccountReceivableManagementApi";
import { MENU_CODE } from "./AccountReceivableManagement";
import type {
  AccountReceivableManagementModel,
  GridKey,
} from "./AccountReceivableManagementModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import AccountReceivableCopyPopup from "./popup/AccountReceivableCopyPopup";

interface Args {
  model: AccountReceivableManagementModel;
}

export function useAccountReceivableManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();
  const { menuName } = useMenuMeta();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      // 첫 행 자동 선택 (서버 onMainGridSearchCallback 대응)
      model.grids.main.setSelected(data?.rows?.[0] ?? null);
    },
    [model],
  );

  const onMainGridClick = useCallback(
    (row: any) => base.handleRowClick("main", row),
    [base],
  );

  // 행 추가 — 서버 onAddMainGrid 의 기본값/조회조건 디비전·물류운영그룹 승계
  const onAddMain = useCallback(() => {
    const raw = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
    const now = new Date();
    const ymd = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
        d.getDate(),
      ).padStart(2, "0")}`;
    const endDt = new Date(now);
    endDt.setFullYear(endDt.getFullYear() + 1);

    base.addRow("main", {
      STT_DT: ymd(now),
      END_DT: ymd(endDt),
      USE_YN: "Y",
      CURR_CD: "KRW",
      MIN_RATE: 0,
      MAX_RATE: 9999999,
      XCLD_AUTO_CALC: "N",
      FRM_APPLD_OIL_PRICE: 0,
      TO_APPLD_OIL_PRICE: 9999,
      DIV_CD: raw.SRCH_TRF_DIV_CD ?? "",
      DIV_NM: raw.SRCH_TRF_DIV_NM ?? "",
      LGST_GRP_CD: raw.SRCH_TRF_LGST_GRP_CD ?? "",
      LGST_GRP_NM: raw.SRCH_TRF_LGST_GRP_NM ?? "",
    });
  }, [base, model.rawFiltersRef]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        api.save({ ...payload, MENU_CD: MENU_CODE }),
      ),
    [base],
  );

  // 계약서 복사 — 단건 선택 검증 후 복사 팝업
  const onCopyContract = useCallback(() => {
    const sel = model.grids.main.selectedRef.current;
    if (!sel) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    openPopup({
      title: "LBL_COPY",
      width: "4xl",
      content: (
        <AccountReceivableCopyPopup
          srcRow={sel}
          arStlBaseDtTpMap={model.codeMap.arStlBaseDtTpList}
          onApplied={() => {
            closePopup();
            base.search();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, model.grids.main, model.codeMap, openPopup, closePopup]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "button",
        key: "BUTTON_COPY_CONTRACT",
        label: "BUTTON_COPY_CONTRACT",
        onClick: onCopyContract,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      onAddMain,
      onSaveMain,
      onCopyContract,
      menuName,
      model.filtersRef,
      model.grids.main,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
  };
}
