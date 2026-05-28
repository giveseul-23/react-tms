import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchOrganizationSettingModel } from "./DispatchOrganizationSettingModel";
import { useDispatchOrganizationSettingController } from "./DispatchOrganizationSettingController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./DispatchOrganizationSettingColumns";

export const MENU_CODE = "MENU_DSPCH_ORG_SET";

export default function DispatchOrganizationSetting() {
  const model = useDispatchOrganizationSettingModel(MENU_CODE);
  const ctrl = useDispatchOrganizationSettingController({ model });

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
          codeMap={model.codeMap}
          actions={ctrl.detailActions}
        />
      }
    />
  );
}
