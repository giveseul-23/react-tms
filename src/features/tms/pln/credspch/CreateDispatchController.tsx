import { useBaseController } from "@/app/feature/useBaseController";
import { createDispatchApi } from "./CreateDispatchApi";
import { MENU_CODE } from "./CreateDispatch";
import type { CreateDispatchModel, GridKey } from "./CreateDispatchModel";

interface Args {
  model: CreateDispatchModel;
}

export function useCreateDispatchController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => createDispatchApi.getList(MENU_CODE, params),
      save: createDispatchApi.save,
    },
  });
}
