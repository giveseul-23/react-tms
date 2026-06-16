"use client";

// 평균유가 추세조회 팝업 (서버 pop/TrendPop + TrendPopController 대응)
// level 에 따라 전체/광역시도/시군구 시계열을 조회해 라인 차트로 표시.

import { useEffect, useState } from "react";
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
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { oilPriceByDayApi as api } from "../OilPriceByDayApi";
import type { OilPricePoint } from "../OilPriceByDayModel";

export type TrendLevel = "all" | "sido" | "sigun";

type Props = {
  level: TrendLevel;
  params: Record<string, any>;
};

// 서버 getTimeData — dsOut → [{ dateLabel, OIL_PRICE }]
function toChartPoints(rows: any[]): OilPricePoint[] {
  return rows.map((r) => {
    const price = Number(String(r.OIL_PRICE ?? "").replace(/,/g, ""));
    return {
      dateLabel: String(r.DLVRY_DT ?? ""),
      OIL_PRICE: Number.isFinite(price) ? price : null,
    };
  });
}

export function OilPriceTrendPop({ level, params }: Props) {
  const showError = useErrorAlert();
  const [data, setData] = useState<OilPricePoint[]>([]);

  useEffect(() => {
    // 서버 chartDraw: level 별 endpoint 분기
    const fetchFn =
      level === "sido"
        ? api.getTrendSido
        : level === "sigun"
          ? api.getTrendSigun
          : api.getTrendAll;
    void fetchFn(params)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("MSG_NO_DATA"));
          setData([]);
          return;
        }
        setData(toChartPoints(res?.data?.data?.dsOut ?? []));
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("MSG_NO_DATA"),
        );
        setData([]);
      });
  }, [level, params, showError]);

  return (
    <div className="h-[440px] min-h-0 border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
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
