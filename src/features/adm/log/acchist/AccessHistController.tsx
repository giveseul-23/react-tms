import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { accessHistApi } from "./AccessHistApi";
import type { AccessHistModel, GridKey } from "./AccessHistModel";

type ControllerProps = {
  menuCd: string;
  model: AccessHistModel;
};

export function useAccessHistController({
  menuCd,
  model,
}: ControllerProps) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => accessHistApi.getAccessHist({ ...params }),
    },
  });

    const fetchList = useCallback(
      (params: Record<string, unknown>) =>
        accessHistApi.getAccessHist(params),
      [],
    );
  

  return {
    fetchList,
    handleSearch: base.onSearchCallback,
  };
}
