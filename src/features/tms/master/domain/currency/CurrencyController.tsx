// ──────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { currencyApi } from "@/features/tms/master/domain/currency/CurrencyApi.ts";
import { CurrencyModel } from "./CurrencyModel";
import { makeSaveAction } from "@/app/components/grid/commonActions";

type ControllerProps = {
  menuCd: string;
  model: CurrencyModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useCurrencyController({
  menuCd,
  model,
  filtersRef,
}: ControllerProps) {
  // ── fetchDispatchList (센차: mainInfo store proxy url) ────────
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) =>
      currencyApi.getCurrencyList(menuCd, { ...params }),
    [],
  );

  // 조회 완료 시 SearchFilters → DataGrid 데이터 전달 및 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
    },
    [model],
  );

  const mainActions = [makeSaveAction()];

  return {
    fetchDispatchList,
    handleSearch,
    mainActions,
  };
}
