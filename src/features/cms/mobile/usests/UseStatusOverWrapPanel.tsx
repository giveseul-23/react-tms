"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { UseStatusModel } from "./UseStatusModel";
import UseStatusPanel from "./UseStatusPanel";
import UseStatusFilterGrid from "./UseStatusFilterGrid";
import UseStatusPieChart from "./UseStatusPieChart";
import UseStatusGrid from "./UseStatusGrid";
import UseStatusCarrGrid from "./UseStatusCarrGrid";

type Props = {
  model: UseStatusModel;
  mainActions: ActionItem[];
  carrierActions: ActionItem[];
  onClickBar: (categoryKey: "dedi" | "con", statusKey: string, statusLabel: string) => void;
  onCloseFilter: () => void;
};

export default function UseStatusOverWrapPanel({
  model,
  mainActions,
  carrierActions,
  onClickBar,
  onCloseFilter,
}: Props) {
  return (
    <SplitPane
      direction="vertical"
      defaultSizes={[47, 53]}
      minSizes={[28, 32]}
      storageKey={model.storageKeys.outer}
    >
      <SplitPane
        direction="horizontal"
        defaultSizes={[79, 21]}
        minSizes={[42, 18]}
        storageKey={model.storageKeys.top}
      >
        <UseStatusPanel
          data={model.statusChartData}
          colors={model.chartColors}
          onClickBar={onClickBar}
        />
        {model.showFilterPanel ? (
          <UseStatusFilterGrid
            model={model}
            title={model.filterTitle}
            onClose={onCloseFilter}
          />
        ) : (
          <div className="h-full">
            <div className="h-full rounded-lg border border-slate-200 bg-white overflow-hidden">
              <UseStatusPieChart />
            </div>
          </div>
        )}
      </SplitPane>

      <DataGrid
        layoutType="tab"
        tabs={[
          { key: "CENTER", label: "LBL_LGST_DRVR" },
          { key: "CARRIER", label: "LBL_CONTRACT_VEH_DRIVER" },
        ]}
        presets={{
          CENTER: {
            render: () => <UseStatusGrid model={model} actions={mainActions} />,
          },
          CARRIER: {
            render: () => (
              <UseStatusCarrGrid model={model} actions={carrierActions} />
            ),
          },
        }}
        actions={[]}
        pagination={false}
      />
    </SplitPane>
  );
}
