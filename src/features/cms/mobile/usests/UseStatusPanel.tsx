"use client";

import { Lang } from "@/app/services/common/Lang";
import UseStatusColumnChart from "./UseStatusColumnChart";
import type { StatusChartRow } from "./UseStatusModel";

type Props = {
  data: StatusChartRow[];
  colors: Record<string, string>;
  onClickBar?: (categoryKey: "dedi" | "con", statusKey: string, statusLabel: string) => void;
};

export default function UseStatusPanel({ data, colors, onClickBar }: Props) {
  return (
    <div className="h-full rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
        {Lang.get("MENU_MBL_USE_STS")}
      </div>
      <div className="h-[calc(100%-41px)] p-3">
        <UseStatusColumnChart
          data={data}
          colors={colors}
          onClickBar={onClickBar}
        />
      </div>
    </div>
  );
}
