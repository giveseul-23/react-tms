import { useBaseController } from "@/app/feature/useBaseController";
import { boxApMgmtApi } from "./BoxApMgmtApi";
import { MENU_CODE } from "./BoxApMgmt";
import type { BoxApMgmtModel, GridKey } from "./BoxApMgmtModel";

interface Args {
  model: BoxApMgmtModel;
}

export function useBoxApMgmtController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => boxApMgmtApi.getList(MENU_CODE, params),
      save: boxApMgmtApi.save,
    },
  });
}
