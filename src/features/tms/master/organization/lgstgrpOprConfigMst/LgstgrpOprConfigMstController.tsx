// 화면 고유 Controller — useGridController 베이스 훅에 featureConfig 주입.
// 화면 고유 액션(동기화 등)은 base.actions 에 합성해 추가 반환.

import { MutableRefObject, useMemo } from "react";
import { useGridController } from "@/hooks/useGridFeature/useGridController";
import { useApiHandler } from "@/hooks/useApiHandler";
import { lgstgrpOprConfigApi } from "./LgstgrpOprConfigApi";
import {
  lgstgrpFeatureConfig,
  type LgstgrpOprConfigMstModel,
} from "./LgstgrpOprConfigMstModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

interface ControllerArgs {
  model: LgstgrpOprConfigMstModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
}

export function useLgstgrpOprConfigMstController({
  model,
  searchRef,
  filtersRef,
}: ControllerArgs) {
  const { handleApi } = useApiHandler();

  const base = useGridController({
    config: lgstgrpFeatureConfig,
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
            lgstgrpOprConfigApi.syncConfig({}),
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
    /** config 그리드용 — 동기화 버튼 합성된 액션 (View 에서 bind override 로 주입) */
    configActions,
  };
}
