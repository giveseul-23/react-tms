import { useBaseController } from "@/app/feature/useBaseController";
import { contractedVehiclePoolManagementApi } from "./ContractedVehiclePoolManagementApi";
import { MENU_CODE } from "./ContractedVehiclePoolManagement";
import type { ContractedVehiclePoolManagementModel, GridKey } from "./ContractedVehiclePoolManagementModel";

interface Args {
  model: ContractedVehiclePoolManagementModel;
}

export function useContractedVehiclePoolManagementController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => contractedVehiclePoolManagementApi.getList(MENU_CODE, params),
      save: contractedVehiclePoolManagementApi.save,
    },
  });
}
