"use client";

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";

import { useVltnNtfctnCnfgModel } from "./VltnNtfctnCnfgModel";
import { useVltnNtfctnCnfgController } from "./VltnNtfctnCnfgController";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
  NTFC_CHANNEL_COLUMN_DEFS,
  NTFC_TARGET_COLUMN_DEFS,
} from "./VltnNtfctnCnfgColumns";

export const MENU_CODE = "MENU_VLTN_NTFCTN_CNFG";

export default function VltnNtfctnCnfg() {
  const model = useVltnNtfctnCnfgModel(MENU_CODE);
  const ctrl = useVltnNtfctnCnfgController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[20, 80]}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey={model.storageKeys.bottom}
        >
          <DataGrid
            {...model.bind("detail")}
            columnDefs={DETAIL_COLUMN_DEFS}
            codeMap={model.codeMap}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.onDetailGridClick}
          />
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "CHANNEL", label: "LBL_NTFCTN_CHNL" },
              { key: "TARGET", label: "LBL_NTFCTN_RCVR" },
            ]}
            presets={{
              CHANNEL: {
                render: () => (
                  <DataGrid
                    {...model.bind("channel")}
                    columnDefs={NTFC_CHANNEL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.channelActions}
                    audit={false}
                  />
                ),
              },
              TARGET: {
                render: () => (
                  <DataGrid
                    {...model.bind("target")}
                    columnDefs={NTFC_TARGET_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    actions={ctrl.targetActions}
                    audit={false}
                  />
                ),
              },
            }}
            actions={[]}
          />
        </SplitPane>
      }
    />
  );
}
