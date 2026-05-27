import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLogisticGroupPlanIdModel } from "./LogisticGroupPlanIdModel";
import { useLogisticGroupPlanIdController } from "./LogisticGroupPlanIdController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./LogisticGroupPlanIdColumns";

export const MENU_CODE = "MENU_LGST_GRP_PLN_ID";

export default function LogisticGroupPlanId() {
  const model = useLogisticGroupPlanIdModel(MENU_CODE);
  const ctrl = useLogisticGroupPlanIdController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[30, 70]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        excludes: ["DIV_CD" , "LGST_GRP_CD"],// 기간 검색은 단일 필드로 통합
      }}
      defaultDirection="horizontal"
      layoutToggle={true}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          audit={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.detailActions}
        />
      }
    />
  );
}