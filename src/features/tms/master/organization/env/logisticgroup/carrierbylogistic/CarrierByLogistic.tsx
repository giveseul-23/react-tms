"use client";

import { SplitPane } from "@/app/components/layout/SplitPane";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useCarrierByLogisticModel } from "./CarrierByLogisticModel";
import { useCarrierByLogisticController } from "./CarrierByLogisticController";
import {
  LOGISTIC_COLUMN_DEFS,
  LOGISTIC_CARRIER_INFO_COLUMN_DEFS,
  LOGISTIC_CARRIER_DETAIL_INFO_COLUMN_DEFS,
} from "./CarrierByLogisticColumns";

export const MENU_CODE = "MENU_LGST_GRP_CARR";

export default function CarrierByLogistic() {
  const model = useCarrierByLogisticModel(MENU_CODE);
  const ctrl = useCarrierByLogisticController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultSizes={[55, 45]}
      storageKey={model.storageKeys.outer}
      master={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.top}
        >
          {/* 메인 그리드 (top-left) */}
          <DataGrid
            {...model.bind("main")}
            columnDefs={LOGISTIC_COLUMN_DEFS}
            onRowClicked={ctrl.onMainGridClick}
          />
          {/* 상세 그리드 (top-right) */}
          <DataGrid
            {...model.bind("sub01")}
            columnDefs={LOGISTIC_CARRIER_INFO_COLUMN_DEFS}
            onRowClicked={ctrl.onSub01GridClick}
            actions={ctrl.sub01Actions}
          />
        </SplitPane>
      }
      detail={
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          {/* detail-i18n (bottom-left) — 상세 행에 종속 */}
          <DataGrid
            {...model.bind("sub02")}
            columnDefs={LOGISTIC_CARRIER_DETAIL_INFO_COLUMN_DEFS}
            subTitle="LBL_CNFG_CD_LANG_SETTING"
            actions={ctrl.sub02Actions}
          />
        </SplitPane>
      }
    />
  );
}
