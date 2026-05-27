// src/views/tender/TenderReceiveDispatch.tsx
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

export default function TenderReceiveDispatch() {
  const model = useTenderReceiveDispatchModel(MENU_CD);
  const ctrl = useTenderReceiveDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchDispatchList,
        onSearchCallback: ctrl.onSearchCallback,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        excludes: ["BOOKING"],
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS()}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
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
                  columnDefs={STOP_COLUMN_DEFS()}
                  codeMap={model.codeMap}
                  audit={false}
                />
              ),
            },
            SMS_HIS: {
              render: () => (
                <DataGrid
                  {...model.bind("sms")}
                  columnDefs={SMS_COLUMN_DEFS()}
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
                  columnDefs={AP_SETL_COLUMN_DEFS()}
                  codeMap={model.codeMap}
                  onCellValueChanged={ctrl.handleApSetlCellChange}
                  actions={ctrl.apSetlActions}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
      bottomSlot={ctrl.track.panel}
      bottomOpen={ctrl.track.open}
      bottomHeight={280}
    />
  );
}
