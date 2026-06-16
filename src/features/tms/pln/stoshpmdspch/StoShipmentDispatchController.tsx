import { useBaseController } from "@/app/feature/useBaseController";
import { stoShipmentDispatchApi } from "./StoShipmentDispatchApi";
import { MENU_CODE } from "./StoShipmentDispatch";
import type { StoShipmentDispatchModel, GridKey } from "./StoShipmentDispatchModel";

interface Args {
  model: StoShipmentDispatchModel;
}

export function useStoShipmentDispatchController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => stoShipmentDispatchApi.getList(MENU_CODE, params),
      save: stoShipmentDispatchApi.save,
    },
  });
}
