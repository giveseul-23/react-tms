import { useBaseController } from "@/app/feature/useBaseController";
import { egoShipmentManagementApi } from "./EgoShipmentManagementApi";
import { MENU_CODE } from "./EgoShipmentManagement";
import type { EgoShipmentManagementModel, GridKey } from "./EgoShipmentManagementModel";

interface Args {
  model: EgoShipmentManagementModel;
}

export function useEgoShipmentManagementController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => egoShipmentManagementApi.getList(MENU_CODE, params),
      save: egoShipmentManagementApi.save,
    },
  });
}
