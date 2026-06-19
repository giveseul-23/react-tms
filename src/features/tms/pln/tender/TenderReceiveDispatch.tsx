"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTenderReceiveDispatchModel } from "./TenderReceiveDispatchModel";
import { useTenderReceiveDispatchController } from "./TenderReceiveDispatchController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  AP_SETL_COLUMN_DEFS,
} from "./TenderReceiveDispatchColumns";

export const MENU_CD = "MENU_PLAN_TENDER_RECEIVE";

export const AUTH = {
  grids: {
    main: "MAIN_GRID_PLAN_TENDER_RECEIVE",
    stop: "SUB01_GRID_PLAN_TENDER_RECEIVE",
    sms: "SUB04_GRID_PLAN_TENDER_RECEIVE",
    apSetl: "CARR_COST_GRID_PLAN_TENDER_RECEIVE",
    carrRateExcel: "CARR_RATE_EXCEL_GRID",
  },
};

export default function TenderReceiveDispatch() {
  const model = useTenderReceiveDispatchModel(MENU_CD);
  const ctrl = useTenderReceiveDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchDispatchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
        excludes: [
          { column: "BOOKING", as: "BOOKING" },
          { column: "DROP_LOC_NM", as: "DROP_LOC_NM" },
        ],
      }}
      defaultDirection="vertical"
      defaultSizes={[60, 40]}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={MAIN_COLUMN_DEFS}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          rowSelection="multiple"
          codeMap={model.codeMap}
          audit={{
            delete: false,
            rowStatus: false,
            insertPerson: true,
            insertDate: true,
            updatePerson: false,
            updateTime: false,
          }}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "STOP", label: "LBL_STOP" },
            { key: "SMS_HIS", label: "LBL_SMS_HISTORY" },
            { key: "AP_SETL", label: "LBL_TRANS_COST_HIS" },
          ]}
          presets={{
            STOP: {
              render: () => (
                <DataGrid
                  {...model.bind("stop")}
                  authId={AUTH.grids.stop}
                  columnDefs={STOP_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={false}
                />
              ),
            },
            SMS_HIS: {
              render: () => (
                <DataGrid
                  {...model.bind("sms")}
                  authId={AUTH.grids.sms}
                  columnDefs={SMS_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  audit={{
                    delete: false,
                    rowStatus: false,
                    insertPerson: true,
                    insertDate: true,
                    updatePerson: false,
                    updateTime: false,
                  }}
                />
              ),
            },
            AP_SETL: {
              render: () => (
                <DataGrid
                  {...model.bind("apSetl")}
                  authId={AUTH.grids.apSetl}
                  columnDefs={AP_SETL_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.apSetlActions}
                  audit={{ delete: false }}
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
