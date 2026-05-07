import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeSaveAction } from "@/app/components/grid/commonActions";
import { currencyApi } from "./CurrencyApi";
import { MENU_CD } from "./Currency";
import type { CurrencyModel, GridKey } from "./CurrencyModel";

interface Args {
  model: CurrencyModel;
}

export function useCurrencyController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      currencyApi.getCurrencyList(MENU_CD, { ...params }),
    [],
  );

  const handleSearch = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const mainActions = useMemo(() => [makeSaveAction()], []);

  // base 사용은 향후 확장 대비 (현재 화면 고유 액션 없음)
  void base;

  return {
    fetchList,
    handleSearch,
    mainActions,
  };
}
