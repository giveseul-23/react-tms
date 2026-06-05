import { useState, useCallback, useMemo } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";

export type DetailMode = "view" | "edit" | "new";

export type GridKey = "main";

export function useHipassModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>("view");
  const [detailIndex, setDetailIndex] = useState(-1);
  const [navigating, setNavigating] = useState(false);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    base.grids.main.setSelected(null);
    setDetailIndex(-1);
  }, [base.grids.main]);

  const codeMap = useMemo(() => ({} as Record<string, Record<string, string>>), []);

  return {
    ...base,
    detailOpen,
    setDetailOpen,
    detailMode,
    setDetailMode,
    detailIndex,
    setDetailIndex,
    navigating,
    setNavigating,
    closeDetail,
    codeMap,
  };
}

export type HipassModel = ReturnType<typeof useHipassModel>;
