// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTenderReceiveDispatchModel } from "./TenderReceiveDispatchModel";
import { useTenderReceiveDispatchController } from "./TenderReceiveDispatchController";
import {
  MAIN_COLUMN_DEFS,
  STOP_COLUMN_DEFS,
  SMS_COLUMN_DEFS,
  AP_SETL_COLUMN_DEFS,
} from "./TenderReceiveDispatchColumns";
import { TrackPanel } from "@/app/components/track/TrackPanel";

export const MENU_CD = "MENU_PLAN_TENDER_RECEIVE";

export default function TenderReceiveDispatch() {
  const model = useTenderReceiveDispatchModel(MENU_CD);
  const ctrl = useTenderReceiveDispatchController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CD}
      searchProps={{
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef: model.searchRef,
        filtersRef: model.filtersRef,
        pageSize: model.pageSize,
        excludes: ["BOOKING"],
        menuCode: MENU_CD,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS()}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.onMainGridClick}
          codeMap={model.codeMap}
          audit={false}
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
            STOP: { columnDefs: STOP_COLUMN_DEFS() },
            SMS_HIS: { columnDefs: SMS_COLUMN_DEFS() },
            AP_SETL: {
              gridRef: model.apSetlGridRef,
              columnDefs: AP_SETL_COLUMN_DEFS(model.grids.apSetl.setData),
              onCellValueChanged: ctrl.handleApSetlCellChange,
              actions: ctrl.apSetlActions,
            },
          }}
          rowData={{
            STOP: model.grids.stop.rows,
            SMS_HIS: model.grids.sms.rows,
            AP_SETL: model.grids.apSetl.rows,
          }}
          actions={[]}
          codeMap={model.codeMap}
        />
      }
      bottomSlot={
        <TrackPanel
          open={model.trackOpen}
          onClose={() => model.setTrackOpen(false)}
          dspchNos={model.trackDspchNos}
          trackType={model.trackType}
        />
      }
      bottomOpen={model.trackOpen}
      bottomHeight={280}
    />
  );
}
