"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
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
        onSearch: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        menuCode: MENU_CODE,
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
          audit={{ delete: false, rowStatus: false }}
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
              // SUMMARY 탭만 좌(요약 그리드) + 우(nested 4 sub-tab) 좌우 분할.
              // outer DataGrid 의 renderRightGrid 와 preset.render 가 같이 동작 안 해서
              // SplitPane 으로 직접 조립.
              render: () => (
                <SplitPane direction="horizontal" defaultSizes={[30, 70]}>
                  <DataGrid
                    {...model.bind("summary")}
                    columnDefs={SUMMARY_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.summaryActions}
                    audit={{ delete: false, rowStatus: false }}
                  />
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
                        render: () => (
                          <DataGrid
                            {...model.bind("monthlyFare")}
                            columnDefs={MONTHLY_FARE_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            audit={{ delete: false, rowStatus: false }}
                          />
                        ),
                      },
                      HIRE_DISPATCH: {
                        render: () => (
                          <DataGrid
                            {...model.bind("hireDispatchPay")}
                            columnDefs={HIRE_DISPATCH_PAY_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            audit={{ delete: false, rowStatus: false }}
                          />
                        ),
                      },
                      FREIGHT: {
                        render: () => (
                          <DataGrid
                            {...model.bind("freightPay")}
                            columnDefs={FREIGHT_PAY_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            audit={{ delete: false, rowStatus: false }}
                          />
                        ),
                      },
                      INDIRECT: {
                        render: () => (
                          <DataGrid
                            {...model.bind("indirectPay")}
                            columnDefs={INDIRECT_PAY_COLUMN_DEFS}
                            codeMap={model.codeMap}
                            audit={{ delete: false, rowStatus: false }}
                          />
                        ),
                      },
                    }}
                    actions={[]}
                  />
                </SplitPane>
              ),
            },
            COST_CENTER: {
              render: () => (
                <DataGrid
                  {...model.bind("costCenter")}
                  columnDefs={COST_CENTER_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.costCenterActions}
                />
              ),
            },
            MATERIAL: {
              render: () => (
                <DataGrid
                  {...model.bind("materialCost")}
                  columnDefs={MATERIAL_COST_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.materialCostActions}
                  audit={{ delete: false, rowStatus: false }}
                />
              ),
            },
            EVIDENCE: {
              render: () => (
                <DataGrid
                  {...model.bind("evidence")}
                  columnDefs={EVIDENCE_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.evidenceActions}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
