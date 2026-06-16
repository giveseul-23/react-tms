import { useBaseController } from "@/app/feature/useBaseController";
import { dockCommitmentApi } from "./DockCommitmentApi";
import { MENU_CODE } from "./DockCommitment";
import type { DockCommitmentModel, GridKey } from "./DockCommitmentModel";

interface Args {
  model: DockCommitmentModel;
}

export function useDockCommitmentController({ model }: Args) {
  // 기본 위임(조회/저장). 화면 고유 핸들러(행추가/cascade/팝업 등)는 base 헬퍼로 추가 구현. TODO
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => dockCommitmentApi.getList(MENU_CODE, params),
      save: dockCommitmentApi.save,
    },
  });
}
