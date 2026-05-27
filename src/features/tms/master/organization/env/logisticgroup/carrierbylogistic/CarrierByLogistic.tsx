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
import { useRef } from "react";
import { useMemo } from "react";

export const MENU_CODE = "MENU_LGST_GRP_CARR";

export default function CarrierByLogistic() {
  const model = useCarrierByLogisticModel(MENU_CODE);
  const rawFiltersRef = useRef<Record<string, string>>({});
  const ctrl = useCarrierByLogisticController({ model, rawFiltersRef });
  const columnDefs = useMemo(
    () => LOGISTIC_COLUMN_DEFS(model.grids.main.setData),
    [model.grids.main.setData],
  );

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        rawFiltersRef,
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
            columnDefs= {columnDefs}
            onRowClicked={ctrl.onMainGridClick}
            actions={ctrl.mainActions}
            audit={{ delete: false , rowStatus: false}}
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
          <DataGrid
            {...model.bind("sub02")}
            columnDefs={LOGISTIC_CARRIER_DETAIL_INFO_COLUMN_DEFS}
            actions={ctrl.sub02Actions}
          />
        </SplitPane>
      }
    />
  );
}
