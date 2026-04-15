// src/views/welcome/Welcome.tsx
"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Truck,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react";

const monthlyShipments = [
  { month: "1월", 운송건수: 1240, 완료: 1180 },
  { month: "2월", 운송건수: 980, 완료: 920 },
  { month: "3월", 운송건수: 1520, 완료: 1460 },
  { month: "4월", 운송건수: 1380, 완료: 1310 },
  { month: "5월", 운송건수: 1650, 완료: 1590 },
  { month: "6월", 운송건수: 1820, 완료: 1750 },
  { month: "7월", 운송건수: 2010, 완료: 1940 },
  { month: "8월", 운송건수: 1890, 완료: 1820 },
  { month: "9월", 운송건수: 2150, 완료: 2080 },
  { month: "10월", 운송건수: 2340, 완료: 2260 },
  { month: "11월", 운송건수: 2180, 완료: 2100 },
  { month: "12월", 운송건수: 2560, 완료: 2470 },
];

const carrierPerformance = [
  { name: "현대로지스틱스", 운송건: 420 },
  { name: "CJ대한통운", 운송건: 380 },
  { name: "한진택배", 운송건: 290 },
  { name: "롯데글로벌", 운송건: 260 },
  { name: "우체국택배", 운송건: 210 },
  { name: "로젠택배", 운송건: 180 },
];

const statusDistribution = [
  { name: "운송중", value: 342, color: "#00BAED" },
  { name: "배송완료", value: 1284, color: "#10b981" },
  { name: "대기중", value: 156, color: "#f59e0b" },
  { name: "취소/반송", value: 78, color: "#ef4444" },
];

const weeklyTrend = [
  { day: "월", 요청: 320, 처리: 298 },
  { day: "화", 요청: 280, 처리: 271 },
  { day: "수", 요청: 410, 처리: 389 },
  { day: "목", 요청: 375, 처리: 362 },
  { day: "금", 요청: 490, 처리: 468 },
  { day: "토", 요청: 210, 처리: 207 },
  { day: "일", 요청: 140, 처리: 138 },
];

const KPI_DATA = [
  {
    label: "이번달 총 운송",
    value: "2,560",
    unit: "건",
    change: "+10.4%",
    up: true,
    icon: Truck,
    color: "text-[rgb(var(--primary))]",
    bg: "bg-[rgba(0,186,237,0.08)]",
  },
  {
    label: "운송 완료율",
    value: "96.5",
    unit: "%",
    change: "+1.2%",
    up: true,
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    label: "평균 처리시간",
    value: "1.8",
    unit: "일",
    change: "-0.3일",
    up: true,
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    label: "운송 요청 대기",
    value: "156",
    unit: "건",
    change: "+12건",
    up: false,
    icon: Package,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-bold">{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// 카드 공통 래퍼 — flex-col, 높이 100% 채움
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col min-h-0">
      <div className="shrink-0 mb-2">
        <h2 className="text-sm font-semibold text-[rgb(var(--fg))]">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {/* 차트 영역 — 남은 공간 전부 */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export default function Welcome() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    // 전체: 스크롤 없이 화면 꽉 채움
    <div className="h-full min-h-0 overflow-hidden bg-[rgb(var(--bg))] flex flex-col px-6 py-4 gap-3">
      {/* 헤더 */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[rgb(var(--fg))] tracking-tight">
            운송관리 대시보드
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{today}</p>
        </div>
        <span className="text-xs bg-[rgba(0,186,237,0.08)] text-[rgb(var(--primary))] px-3 py-1.5 rounded-full font-medium">
          실시간 데이터
        </span>
      </div>

      {/* KPI 카드 4개 — 고정 높이 */}
      <div className="shrink-0 grid grid-cols-4 gap-3">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">
                  {kpi.label}
                </p>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-[rgb(var(--fg))]">
                  {kpi.value}
                </span>
                <span className="text-xs text-slate-400 mb-0.5">
                  {kpi.unit}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${kpi.up ? "text-emerald-500" : "text-rose-500"}`}
              >
                {kpi.up ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {kpi.change} 전월 대비
              </div>
            </div>
          );
        })}
      </div>

      {/* 차트 2×2 — 남은 높이 전부 차지 */}
      <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-3">
        {/* ① 월별 운송 현황 */}
        <ChartCard title="월별 운송 현황" subtitle="연간 운송건수 및 완료 추이">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyShipments}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gShipment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00BAED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00BAED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gComplete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.1)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="운송건수"
                stroke="#00BAED"
                strokeWidth={2}
                fill="url(#gShipment)"
              />
              <Area
                type="monotone"
                dataKey="완료"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gComplete)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ② 운송사별 처리 실적 */}
        <ChartCard
          title="운송사별 처리 실적"
          subtitle="이번달 운송사별 처리건수"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={carrierPerformance}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={16}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="운송건" fill="#00BAED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ③ 운송 상태 분포 */}
        <ChartCard
          title="운송 상태 분포"
          subtitle="현재 전체 운송 건의 상태별 비율"
        >
          <div className="flex items-center h-full gap-4">
            <div className="flex-1 min-w-0 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="shrink-0 flex flex-col gap-2.5 pr-2">
              {statusDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-500">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--fg))]">
                    {item.value.toLocaleString()}건
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 mt-1 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">합계</span>
                <span className="text-xs font-bold text-[rgb(var(--fg))]">
                  {statusDistribution
                    .reduce((s, i) => s + i.value, 0)
                    .toLocaleString()}
                  건
                </span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* ④ 이번주 일별 처리 현황 */}
        <ChartCard
          title="이번주 일별 처리 현황"
          subtitle="요청 대비 처리건수 비교"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyTrend}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(100,116,139,0.1)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="요청"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={{ fill: "#94a3b8", r: 3 }}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="처리"
                stroke="#00BAED"
                strokeWidth={2.5}
                dot={{ fill: "#00BAED", r: 3.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
