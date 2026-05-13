import { useBaseController } from "@/app/feature/useBaseController";
import { plantApi } from "./PlantApi";
import { MENU_CD } from "./Plant";
import type { PlantModel, GridKey } from "./PlantModel";

interface Args {
  model: PlantModel;
}

export function usePlantController({ model }: Args) {
  return useBaseController<GridKey>({
    model,
    api: {
      search: (params) => plantApi.getPlantList(MENU_CD, params),
      save: plantApi.save,
    },
  });
}
