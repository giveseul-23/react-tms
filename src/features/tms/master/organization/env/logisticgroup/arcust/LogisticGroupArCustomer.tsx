import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useLogisticGroupArCustomerModel } from "./LogisticGroupArCustomerModel";
import { useLogisticGroupArCustomerController } from "./LogisticGroupArCustomerController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./LogisticGroupArCustomerColumns";

export const MENU_CODE = "MENU_LGST_GRP_AR_CUST";

export default function LogisticGroupArCustomer() {
  const model = useLogisticGroupArCustomerModel(MENU_CODE);
  const ctrl = useLogisticGroupArCustomerController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[30, 70]}
      searchProps={{
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
          audit={false}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          actions={ctrl.detailActions}
        />
      }
    />
  );
}
