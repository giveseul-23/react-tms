import { MutableRefObject, useMemo } from "react";
import { useGridController } from "@/hooks/useGridFeature/useGridController";
import { useApiHandler } from "@/hooks/useApiHandler";
import { divisionDefaultApi } from "./DivisionDefaultApi";
import {
  divisionDefaultConfig,
  type DivisionDefaultModel,
} from "./DivisionDefaultModel";

import type { ActionItem } from "@/app/components/ui/GridActionsBar";

interface ControllerArgs {
  model: DivisionDefaultModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
}

export function useDivisionDefaultController({
  model,
  searchRef,
  filtersRef,
}: ControllerArgs) {
  const base = useGridController({
    config: divisionDefaultConfig,
    model,
    searchRef,
    filtersRef,
  });

  return {
    ...base,
  };
}
