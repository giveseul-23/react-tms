"use client";

import DataGrid from "@/app/components/grid/DataGrid";
import { Button } from "@/app/components/ui/button";
import { Lang } from "@/app/services/common/Lang";
import { FILTER_COLUMN_DEFS } from "./UseStatusColumns";
import type { UseStatusModel } from "./UseStatusModel";

type Props = {
  model: UseStatusModel;
  title: string;
  onClose: () => void;
};

export default function UseStatusFilterGrid({
  model,
  title,
  onClose,
}: Props) {
  return (
    <div className="h-full min-h-0 rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
      </div>
      <div className="h-[calc(100%-41px)]">
        <DataGrid
          {...model.bind("filter")}
          columnDefs={FILTER_COLUMN_DEFS}
          headerCheckbox={false}
          audit={false}
          actions={[]}
          pagination={false}
        />
      </div>
    </div>
  );
}
