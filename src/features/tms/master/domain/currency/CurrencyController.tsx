import { useBaseController } from "@/app/feature/useBaseController";
import { currencyApi } from "./CurrencyApi";
import { MENU_CD } from "./Currency";
import type { CurrencyModel, GridKey } from "./CurrencyModel";

interface Args {
  model: CurrencyModel;
}

export function useCurrencyController({ model }: Args) {
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => currencyApi.getCurrencyList(MENU_CD, params),
      save: currencyApi.save,
    },
  });
}
