"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { LayoutType } from "@/app/components/layout/LayoutToggleButton";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";

import { useVltnNtfctnCnfgModel } from "./VltnNtfctnCnfgModel.ts";
import { useVltnNtfctnCnfgController } from "./VltnNtfctnCnfgController.tsx";
import {
  MAIN_COLUMN_DEFS,
  DETAIL_COLUMN_DEFS,
  NTFC_CHANNEL_COLUMN_DEFS,
  NTFC_TARGET_COLUMN_DEFS,
} from "./VltnNtfctnCnfgColumns.tsx";
export const MENU_CODE = "MENU_VLTN_NTFCTN_CNFG";

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(MENU_CODE);
  const model = useVltnNtfctnCnfgModel();

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const excludeKeysRef = useRef<Set<string>>(new Set());

  const ctrl = useVltnNtfctnCnfgController({
    model,
    searchRef,
    filtersRef,
  });

  if (loading) return <Skeleton className="h-24" />;

  return (
    <MasterDetailPage
      defaultSizes={[20, 80]}
      searchProps={{
        meta,
        fetchFn: ctrl.fetchDispatchList,
        onSearch: ctrl.handleSearch,
        searchRef,
        filtersRef,
        pageSize: model.pageSize,
        excludeKeysRef,
        menuCode: MENU_CODE,
      }}
      direction={model.layout === "side" ? "horizontal" : "vertical"}
      layoutToggle={{
        layout: model.layout,
        onToggle: () =>
          model.setLayout((prev: LayoutType) =>
            prev === "side" ? "vertical" : "side",
          ),
      }}
      storageKey="division-default-dispatch"
      master={
        <DataGrid
          layoutType="plain"
          columnDefs={MAIN_COLUMN_DEFS}
          rowData={model.gridData.rows}
          onRowClicked={ctrl.handleRowClicked}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <SplitPane
          direction="vertical"
          defaultSizes={[50, 50]}
          minSizes={[25, 25]}
          handleThickness="1.5"
          storageKey="country-sub"
        >
          <DataGrid
            layoutType="plain"
            columnDefs={DETAIL_COLUMN_DEFS}
            codeMap={model.codeMap}
            rowData={model.subDetailRowData}
            actions={ctrl.detailActions}
            onRowClicked={ctrl.handleSubRowClicked}
          />
          <DataGrid
            layoutType="tab"
            tabs={[
              { key: "CHANNEL", label: "알림채널" },
              { key: "TARGET", label: "전송대상" },
            ]}
            codeMap={model.codeMap}
            presets={{
              CHANNEL: {
                columnDefs: NTFC_CHANNEL_COLUMN_DEFS,
                actions: ctrl.channelActions,
              },
              TARGET: {
                columnDefs: NTFC_TARGET_COLUMN_DEFS,
                actions: ctrl.targetActions,
              },
            }}
            rowData={{
              CHANNEL: model.subChannelRowData,
              TARGET: model.subTargetRowData,
            }}
            actions={[]}
          />
        </SplitPane>
      }
    />
  );
}
