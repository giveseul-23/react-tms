import { useBaseController } from "@/app/feature/useBaseController";
import { commodityApi } from "@/features/tms/master/domain/commodity/CommodityApi";
import { MENU_CD } from "@/features/tms/master/domain/commodity/Commodity";
import type { CommodityModel, GridKey } from "@/features/tms/master/domain/commodity/CommodityModel";

interface Args {
  model: CommodityModel;
}

export function useCommodityController({ model }: Args) {
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => commodityApi.getCommodityList(MENU_CD, params),
      save: commodityApi.save,
    },
  });
}
