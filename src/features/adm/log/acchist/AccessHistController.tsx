import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { accessHistApi } from "./AccessHistApi";
import { MAIN_COLUMN_DEFS } from "./AccessHistColumns";
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
      search: (params) => accessHistApi.getAccessHist(menuCd, { ...params }),
    },
  });

    const fetchList = useCallback(
      (params: Record<string, unknown>) =>
        accessHistApi.getAccessHist(menuCd, params),
      [],
    );
  

  return {
    fetchList,
    handleSearch: base.onSearchCallback,
  };
}
