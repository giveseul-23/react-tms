"use client";

// 평균유가 추이 차트 (서버 OilPriceByGasStationChartPanel / makeTimeLineOption 대응)
// 선택 주유소의 일자별 평균유가(OIL_PRICE) 시계열 라인.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Lang } from "@/app/services/common/Lang";
import type { OilPricePoint } from "./OilPriceByGasStationModel";

type Props = {
  data: OilPricePoint[];
};

export default function OilPriceByGasStationChartPanel({ data }: Props) {
  return (
    <div className="h-full min-h-0 border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="text-sm font-semibold text-slate-700">
          {Lang.get("LBL_AVG_OIL_PRICE")}
        </div>
      </div>
      <div className="flex-1 min-h-[260px] p-3">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
            {Lang.get("MSG_NO_DATA")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={52}
                domain={["auto", "auto"]}
              />
              <Tooltip
                formatter={(value: any) => [
                  value ?? "-",
                  Lang.get("LBL_AVG_OIL_PRICE"),
                ]}
                labelFormatter={(label) => `${Lang.get("LBL_DT")}: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="OIL_PRICE"
                stroke="#00BAED"
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 0, fill: "#00BAED" }}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#00BAED" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
