"use client";

import { Lang } from "@/app/services/common/Lang";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatusChartRow } from "./UseStatusModel";

type Props = {
  data: StatusChartRow[];
  colors: Record<string, string>;
  onClickBar?: (categoryKey: "dedi" | "con", statusKey: string, statusLabel: string) => void;
};

const STATUS_SPECS = [
  { key: "mbl_sts1", label: "LBL_MBL_STS_NO_HIS" },
  { key: "mbl_sts2", label: "LBL_MBL_STS_LOGOUT" },
  { key: "mbl_sts3", label: "LBL_MBL_STS_KEEP" },
  { key: "mbl_sts4", label: "LBL_MBL_STS_LOGIN" },
] as const;

export default function UseStatusColumnChart({
  data,
  colors,
  onClickBar,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        {Lang.get("MSG_NO_DATA")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 12, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.14)" />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="categoryName"
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip />
        <Legend />
        {STATUS_SPECS.map((spec) => (
          <Bar
            key={spec.key}
            dataKey={spec.key}
            stackId="status"
            fill={colors[spec.key]}
            name={Lang.get(spec.label)}
            onClick={(payload: any) => {
              const row = payload?.payload;
              if (!row) return;
              onClickBar?.(row.categoryKey, spec.key, Lang.get(spec.label));
            }}
          >
            <LabelList
              dataKey={spec.key}
              position="inside"
              formatter={(value: any) => (Number(value) > 0 ? value : "")}
              fill="#ffffff"
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
