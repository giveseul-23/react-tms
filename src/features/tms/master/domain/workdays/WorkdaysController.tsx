import { useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { usePopup } from "@/app/components/popup/PopupContext";
import { makeAddAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
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

  const handleOpenHolidayPopup = () => {
    const lgstGrpCd = "MV01";
    const lgstGrpNm = "MV_백암센터";

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
              .callAjax(WorkdaysApi.saveWorkdays(requestPayload), "MSG_SAVE_CMPLT")
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
  };

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleOpenHolidayPopup }),
      ...base.mainActions,
    ],
    [handleOpenHolidayPopup, base.mainActions],
  );

  return {
    ...base,
    mainActions,
  };
}
