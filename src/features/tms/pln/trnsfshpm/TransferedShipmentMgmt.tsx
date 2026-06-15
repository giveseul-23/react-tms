"use client";

import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import DataGrid from "@/app/components/grid/DataGrid";

import { useTransferedShipmentMgmtModel } from "./TransferedShipmentMgmtModel";
import { useTransferedShipmentMgmtController } from "./TransferedShipmentMgmtController";
import {
  SEND_MAIN_COLUMN_DEFS,
  RCV_MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
} from "./TransferedShipmentMgmtColumns";

export const MENU_CODE = "MENU_TRNSF_SHPM";

export const AUTH = {
  grids: {
    sendMain: "MAIN_GRID_TRNSF_SHPM",
    sendDetail: "SUB01_GRID_TRNSF_SHPM",
    rcvMain: "SUB02_GRID_TRNSF_SHPM",
    rcvDetail: "SUB03_GRID_TRNSF_SHPM",
  },
};

export default function TransferedShipmentMgmt() {
  const model = useTransferedShipmentMgmtModel(MENU_CODE);
  const ctrl = useTransferedShipmentMgmtController({ model });

  return (
    <GridOnlyPage
      menuCode={MENU_CODE}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        excludes: ["SHPM.LGST_GRP_CD"],
        ...model.bindSearch(),
      }}
      grid={
        <DataGrid
          layoutType="tab"
          tabs={[
            { key: "SEND", label: "LBL_SEND" },
            { key: "RCV", label: "LBL_RCV" },
          ]}
          onTabChange={() => {
            model.searchRef.current?.();
          }}
          presets={{
            SEND: {
              render: () => (
                <SplitPane
                  direction="vertical"
                  defaultSizes={[60, 40]}
                  minSizes={[30, 20]}
                  handleThickness="1.5"
                  storageKey={model.storageKeys.top}
                >
                  <DataGrid
                    {...model.bind("sendMain")}
                    columnDefs={SEND_MAIN_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    authId={AUTH.grids.sendMain}
                    actions={ctrl.sendMainActions}
                    onRowClicked={ctrl.onSendMainClick}
                    onRowDoubleClicked={ctrl.onSendMainDoubleClick}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("sendDetail")}
                    columnDefs={DETAIL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    authId={AUTH.grids.sendDetail}
                    audit={false}
                    pagination={false}
                  />
                </SplitPane>
              ),
            },
            RCV: {
              render: () => (
                <SplitPane
                  direction="vertical"
                  defaultSizes={[60, 40]}
                  minSizes={[30, 20]}
                  handleThickness="1.5"
                  storageKey={model.storageKeys.bottom}
                >
                  <DataGrid
                    {...model.bind("rcvMain")}
                    columnDefs={RCV_MAIN_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    authId={AUTH.grids.rcvMain}
                    actions={ctrl.rcvMainActions}
                    onRowClicked={ctrl.onRcvMainClick}
                    onRowDoubleClicked={ctrl.onRcvMainDoubleClick}
                    audit={false}
                  />
                  <DataGrid
                    {...model.bind("rcvDetail")}
                    columnDefs={DETAIL_COLUMN_DEFS}
                    codeMap={model.codeMap}
                    authId={AUTH.grids.rcvDetail}
                    audit={false}
                    pagination={false}
                  />
                </SplitPane>
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
