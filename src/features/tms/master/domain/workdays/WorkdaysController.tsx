import { useBaseController } from "@/app/feature/useBaseController";
import { WorkdaysApi } from "./WorkdaysApi";
import { MENU_CD } from "./Workdays";
import type { WorkdaysModel, GridKey } from "./WorkdaysModel";

interface Args {
  model: WorkdaysModel;
}

export function useWorkdaysController({ model }: Args) {
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => WorkdaysApi.getWorkdaysList(MENU_CD, params),
      save: WorkdaysApi.save,
    },
  });
}
