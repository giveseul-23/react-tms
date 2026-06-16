import { useBaseController } from "@/app/feature/useBaseController";
import { dispatchPlanVehApi } from "./DispatchPlanVehApi";
import { MENU_CODE } from "./DispatchPlanVeh";
import type { DispatchPlanVehModel, GridKey } from "./DispatchPlanVehModel";

interface Args {
  model: DispatchPlanVehModel;
}

export function useDispatchPlanVehController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => dispatchPlanVehApi.getList(MENU_CODE, params),
      save: dispatchPlanVehApi.save,
    },
  });
}
