// ──────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────
import { useCallback, MutableRefObject } from "react";
import { currencyApi } from "@/features/tms/master/domain/currency/CurrencyApi.ts";
import { CurrencyModel } from "./CurrencyModel";

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

  const mainActions = [
    {
      type: "button",
      key: "저장",
      label: "저장",
      onClick: (e: any) => {},
    },
  ];

  return {
    fetchDispatchList,
    handleSearch,
    mainActions,
  };
}
