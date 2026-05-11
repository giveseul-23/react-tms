"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useApSettlMgmtModel } from "./ApSettlMgmtModel";
import { useApSettlMgmtController } from "./ApSettlMgmtController";
import {
  MAIN_COLUMN_DEFS,
  SUMMARY_COLUMN_DEFS,
  MONTHLY_FARE_COLUMN_DEFS,
  HIRE_DISPATCH_PAY_COLUMN_DEFS,
  FREIGHT_PAY_COLUMN_DEFS,
  INDIRECT_PAY_COLUMN_DEFS,
  COST_CENTER_COLUMN_DEFS,
  MATERIAL_COST_COLUMN_DEFS,
  EVIDENCE_COLUMN_DEFS,
} from "./ApSettlMgmtColumns";

export const MENU_CODE = "MENU_AP_SETTL_MGMT";

export default function ApSettlMgmt() {
  const model = useApSettlMgmtModel(MENU_CODE);
  const ctrl = useApSettlMgmtController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[45, 55]}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
      }}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("config")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "SUMMARY", label: "LBL_SUMMARY_LIST" },
            { key: "COST_CENTER", label: "LBL_EACH_COST_ACCOUNT" },
            { key: "MATERIAL", label: "MENU_FI_AP_SETL_ITM" },
            { key: "EVIDENCE", label: "LBL_SPRT_DOC" },
          ]}
          presets={{
            SUMMARY: {
              columnDefs: SUMMARY_COLUMN_DEFS,
              actions: ctrl.summaryActions,
            },
            COST_CENTER: {
              columnDefs: COST_CENTER_COLUMN_DEFS,
              actions: ctrl.costCenterActions,
            },
            MATERIAL: {
              columnDefs: MATERIAL_COST_COLUMN_DEFS,
              actions: ctrl.materialCostActions,
            },
            EVIDENCE: {
              columnDefs: EVIDENCE_COLUMN_DEFS,
              actions: ctrl.evidenceActions,
            },
          }}
          rowData={{
            SUMMARY: model.grids.summary.rows,
            COST_CENTER: model.grids.costCenter.rows,
            MATERIAL: model.grids.materialCost.rows,
            EVIDENCE: model.grids.evidence.rows,
          }}
          codeMap={model.codeMap}
          actions={[]}
          mainPanelSize={30}
          rightPanelSize={70}
          renderRightGrid={(activeTabKey) => {
            if (activeTabKey === "SUMMARY") {
              return (
                <DataGrid
                  layoutType="tab"
                  tabs={[
                    { key: "MONTHLY_FARE", label: "LBL_FIXED_VEH_CHARGE" },
                    { key: "HIRE_DISPATCH", label: "LBL_DSPCH_CHARGE" },
                    { key: "FREIGHT", label: "LBL_ITM_QTY_RATE" },
                    { key: "INDIRECT", label: "LBL_OVERHEAD_CHARGE" },
                  ]}
                  presets={{
                    MONTHLY_FARE: {
                      columnDefs: MONTHLY_FARE_COLUMN_DEFS,
                      actions: [],
                    },
                    HIRE_DISPATCH: {
                      columnDefs: HIRE_DISPATCH_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                    FREIGHT: {
                      columnDefs: FREIGHT_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                    INDIRECT: {
                      columnDefs: INDIRECT_PAY_COLUMN_DEFS,
                      actions: [],
                    },
                  }}
                  rowData={{
                    MONTHLY_FARE: model.grids.monthlyFare.rows,
                    HIRE_DISPATCH: model.grids.hireDispatchPay.rows,
                    FREIGHT: model.grids.freightPay.rows,
                    INDIRECT: model.grids.indirectPay.rows,
                  }}
                  actions={[]}
                />
              );
            }
            return null;
          }}
        />
      }
    />
  );
}
