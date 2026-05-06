// 화면 고유 Controller — useGridController 베이스 훅에 featureConfig 주입.
// 화면 고유 액션(동기화 등)은 base.actions 에 합성해 추가 반환.

import { MutableRefObject, useMemo } from "react";
import { useGridController } from "@/hooks/useGridFeature/useGridController";
import { useApiHandler } from "@/hooks/useApiHandler";
import { divisionConfigMasterApi } from "./DivisionConfigMasterApi";
import {
  divisionConfigMasterFeatureConfig,
  type DivisionConfigMasterModel,
} from "./DivisionConfigMasterModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

interface ControllerArgs {
  model: DivisionConfigMasterModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
}

export function useDivisionConfigMasterController({
  model,
  searchRef,
  filtersRef,
}: ControllerArgs) {
  const { handleApi } = useApiHandler();

  const base = useGridController({
    config: divisionConfigMasterFeatureConfig,
    model,
    searchRef,
    filtersRef,
  });

  // ── 화면 고유: 동기화 버튼 (config 그리드 액션에 합성) ────────
  const configActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_SYNC",
        label: "LBL_SYNC",
        onClick: () => {
          handleApi(
            divisionConfigMasterApi.syncConfig({}),
            "동기화되었습니다.",
          ).then(() => searchRef.current?.());
        },
      },
      ...(base.actions.config ?? []),
    ],
    [base.actions.config, handleApi, searchRef],
  );

  return {
    ...base,
    configActions,
  };
}
