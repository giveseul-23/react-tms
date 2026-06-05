"use client";

import { Lang } from "@/app/services/common/Lang";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  TemperatureHistoryPoint,
  TemperatureStandard,
} from "./DtgDailyTemperHisModel";

type Props = {
  fridgeData: TemperatureHistoryPoint[];
  frozenData: TemperatureHistoryPoint[];
  standard: TemperatureStandard | null;
};

function hasControlledTarget(from: number | undefined, to: number | undefined) {
  return !(from === -9999 && to === 9999);
}

function TemperatureChartCard({
  title,
  color,
  data,
  dataKey,
  rangeFrom,
  rangeTo,
}: {
  title: string;
  color: string;
  data: TemperatureHistoryPoint[];
  dataKey: "CHLD_TMPR" | "FRZN_TMPR";
  rangeFrom?: number;
  rangeTo?: number;
}) {
  const showRange = hasControlledTarget(rangeFrom, rangeTo);

  return (
    <div className="flex-1 min-h-0 border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
      </div>
      <div className="h-[calc(100%-41px)] min-h-[260px] p-3">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
            {Lang.get("MSG_NO_DATA")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: -10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" />
              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value: any) => [value ?? "-", title]}
                labelFormatter={(label) => `${Lang.get("LBL_TIME")}: ${label}`}
              />
              {showRange && rangeFrom != null && rangeTo != null ? (
                <>
                  <ReferenceArea
                    y1={Math.min(rangeFrom, rangeTo)}
                    y2={Math.max(rangeFrom, rangeTo)}
                    fill={color}
                    fillOpacity={0.08}
                  />
                  <ReferenceLine
                    y={rangeFrom}
                    stroke={color}
                    strokeDasharray="6 4"
                    ifOverflow="extendDomain"
                  />
                  <ReferenceLine
                    y={rangeTo}
                    stroke={color}
                    strokeDasharray="6 4"
                    ifOverflow="extendDomain"
                  />
                </>
              ) : null}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 2, strokeWidth: 0, fill: color }}
                activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default function DtgDailyTemperHisChartPanel({
  fridgeData,
  frozenData,
  standard,
}: Props) {
  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <TemperatureChartCard
        title={Lang.get("LBL_CHLD_TMPR")}
        color="#7dd3fc"
        data={fridgeData}
        dataKey="CHLD_TMPR"
        rangeFrom={standard?.chldFrom}
        rangeTo={standard?.chldTo}
      />
      <TemperatureChartCard
        title={Lang.get("LBL_FRZN_TMPR")}
        color="#1d4ed8"
        data={frozenData}
        dataKey="FRZN_TMPR"
        rangeFrom={standard?.frznFrom}
        rangeTo={standard?.frznTo}
      />
    </div>
  );
}
