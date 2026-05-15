import { useBaseController } from "@/app/feature/useBaseController";
import { userPlanApi } from "./UserPlanApi";
import { MENU_CD } from "./UserPlan";
import type { UserPlanModel, GridKey } from "./UserPlanModel";

interface Args {
  model: UserPlanModel;
}

export function useUserPlanController({ model }: Args) {
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => userPlanApi.getUserPlanList(MENU_CD, params),
      save: userPlanApi.save,
    },
  });
}
