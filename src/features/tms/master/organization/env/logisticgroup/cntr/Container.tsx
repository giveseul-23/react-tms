import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { Lang } from "@/app/services/common/Lang";
import type { SearchMeta } from "@/features/search/search.meta.types";

import { useContainerModel } from "./ContainerModel";
import { useContainerController } from "./ContainerController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./ContainerColumns";

export const MENU_CODE = "MENU_LGST_GRP_CNTR";

const SEARCH_META: readonly SearchMeta[] = [
  {
    key: "DIV_CD",
    label: Lang.get("LBL_DIVISION_CODE"),
    type: "POPUP",
    dataType: "STRING",
    condition: "equal",
    conditionLocked: true,
    span: 5,
    sqlId: "selectDivisionCodeName",
  },
  {
    key: "LGST_GRP_CD",
    label: Lang.get("LBL_LOGISTICS_GROUP_CODE"),
    type: "POPUP",
    dataType: "STRING",
    condition: "equal",
    conditionLocked: true,
    span: 5,
    sqlId: "selectLogisticsgroupCodeName",
    keyParam: "DIV_CD",
  },
];

export default function Container() {
  const model = useContainerModel(MENU_CODE);
  const ctrl = useContainerController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[30, 70]}
      searchProps={{
        meta: SEARCH_META,
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        excludes: ["DIV_CD", "LGST_GRP_CD"],
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
          audit={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.detailActions}
          authId="SUB01_GRID_CNTR_UOM_MGMT"
        />
      }
    />
  );
}
