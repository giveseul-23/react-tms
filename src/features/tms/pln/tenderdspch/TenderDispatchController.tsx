import { useBaseController } from "@/app/feature/useBaseController";
import { tenderDispatchApi } from "./TenderDispatchApi";
import { MENU_CODE } from "./TenderDispatch";
import type { TenderDispatchModel, GridKey } from "./TenderDispatchModel";

interface Args {
  model: TenderDispatchModel;
}

export function useTenderDispatchController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => tenderDispatchApi.getList(MENU_CODE, params),
      save: tenderDispatchApi.save,
    },
  });
}
