"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { CARRIER_COLUMN_DEFS } from "./UseStatusColumns";
import type { UseStatusModel } from "./UseStatusModel";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type Props = {
  model: UseStatusModel;
  actions: ActionItem[];
};

export default function UseStatusCarrGrid({ model, actions }: Props) {
  return (
    <DataGrid
      {...model.bind("carrier")}
      columnDefs={CARRIER_COLUMN_DEFS}
      codeMap={model.codeMap}
      headerCheckbox={false}
      audit={false}
      actions={actions}
      pagination={false}
    />
  );
}
