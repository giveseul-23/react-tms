import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { usePopup } from "@/app/components/popup/PopupContext";
import {
  makeAddAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { MAIN_COLUMN_DEFS } from "./WorkdaysColumns";
import { WorkdaysApi } from "./WorkdaysApi";
import { MENU_CD } from "./Workdays";
import type { WorkdaysModel, GridKey } from "./WorkdaysModel";
import WorkdaysHolidayPopup from "./popup/WorkdaysHolidayPopup";

interface Args {
  model: WorkdaysModel;
}

export function useWorkdaysController({ model }: Args) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => WorkdaysApi.getWorkdaysList(MENU_CD, params),
      save: WorkdaysApi.save,
    },
  });

  const { openPopup, closePopup } = usePopup();

  const handleOpenHolidayPopup = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;
    const lgstGrpCd = srchObj.SRCH_A_LGST_GRP_CD ?? "";
    const lgstGrpNm = srchObj.SRCH_A_LGST_GRP_NM ?? "";

    if (!lgstGrpCd) {
      base.alert("물류그룹을 선택해주세요.");
      return;
    }

    openPopup({
      title: "BTN_CREATE_WORKINGDATE",
      content: (
        <WorkdaysHolidayPopup
          lgstGrpCd={lgstGrpCd}
          lgstGrpNm={lgstGrpNm}
          onConfirm={(data) => {
            const saveItem = {
              operGrpCode: data.lgstGrpCd,
              startYear: data.startYear,
              refday: data.weekdays,
            };

            const requestPayload = {
              dsSave: [saveItem],
            };

            console.log("popup data", data);
            console.log("saveItem", saveItem);
            console.log("requestPayload", requestPayload);

            base
              .callAjax(
                WorkdaysApi.saveWorkdays(requestPayload),
                "MSG_SAVE_CMPLT",
              )
              .then(() => {
                closePopup();
                base.search();
              });
          }}
          onClose={closePopup}
        />
      ),
      width: "2xl",
    });
  }, [base, closePopup, openPopup, model]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleOpenHolidayPopup }),
      ...base.mainActions,
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        menuName: "MENU_WORKINGDAY_MANAGEMENT",
        fetchFn: () =>
          WorkdaysApi.getWorkdaysList(MENU_CD, model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [handleOpenHolidayPopup, base.mainActions, model],
  );

  return {
    ...base,
    mainActions,
  };
}
