"use client";

// 고정차량 작업영역 — 운전자정보(좌, 접기 가능 · subtitle) + 선택 운전자의 회전별 경로 리스트(우).
//  좌: searchDedicatedTruckDispatchList 응답 행(운전자/차량 1건). 우: 선택 행의 RTN_PATH_B1_R1~R8.
//  회전 카드 / 임시용차 로우 더블클릭 → onOpenDetail(배차상세정보 팝업).

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

type Props = {
  rows?: any[];
  onOpenDetail?: () => void;
};

// 구조용 툴바 버튼 (no-op). title 로 그룹 하위 항목 안내.
function Btn({
  children,
  primary,
  title,
}: {
  children: React.ReactNode;
  primary?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`h-7 px-2 inline-flex items-center gap-1 rounded border text-[11px] font-medium transition-colors ${
        primary
          ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))] bg-[var(--grid-header-bg)]"
          : "border-gray-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function FixedVehiclePanel({ rows, onOpenDetail }: Props) {
  const vehicles = rows ?? [];
  const [selVeh, setSelVeh] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const selRow = vehicles[selVeh];

  // 선택 운전자의 1~8회전 (RTN_PATH_B1_Rn / DRVR_RESEQ_B1_Rn)
  const rotations = Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return {
      no: n,
      path: selRow?.[`RTN_PATH_B1_R${n}`] ?? "",
      reseq: !!selRow?.[`DRVR_RESEQ_B1_R${n}`],
    };
  });

  // 체크박스 선택 상태(전체선택 지원). 운전자는 VEH_ID 로 식별.
  const [vehChecked, setVehChecked] = useState<Set<string>>(new Set());
  const [rtnChecked, setRtnChecked] = useState<Set<number>>(new Set());

  // 새 조회로 운전자 목록이 바뀌면 선택 초기화
  useEffect(() => {
    setSelVeh(0);
    setVehChecked(new Set());
    setRtnChecked(new Set());
  }, [rows]);

  const allVeh = vehicles.length > 0 && vehChecked.size === vehicles.length;
  const allRtn = rotations.length > 0 && rtnChecked.size === rotations.length;
  const toggleVeh = (k: string) =>
    setVehChecked((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const toggleRtn = (k: number) =>
    setRtnChecked((p) => {
      const n = new Set(p);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const toggleAllVeh = () =>
    setVehChecked(
      allVeh ? new Set() : new Set(vehicles.map((v) => v.VEH_ID)),
    );
  const toggleAllRtn = () =>
    setRtnChecked(allRtn ? new Set() : new Set(rotations.map((r) => r.no)));

  return (
    <div className="flex h-full min-h-0 gap-2">
      {/* ── 좌: 운전자 정보 (접기 가능 · subtitle) ── */}
      {collapsed ? (
        <div className="w-8 shrink-0 flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white py-1.5">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="펼치기"
            className="p-1 rounded hover:bg-slate-100 text-slate-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span
            className="text-[11px] font-semibold text-[rgb(var(--primary))]"
            style={{ writingMode: "vertical-rl" }}
          >
            운전자 정보
          </span>
        </div>
      ) : (
        <div className="w-[300px] shrink-0 flex flex-col min-h-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
          {/* subtitle 헤더 + 접기 */}
          <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b shrink-0">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allVeh}
                onChange={toggleAllVeh}
                className="h-3.5 w-3.5 accent-[rgb(var(--primary))]"
              />
              <span className="text-[11px] font-semibold text-[rgb(var(--primary))]">
                운전자 정보
              </span>
            </label>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="접기"
              className="p-1 rounded hover:bg-slate-100 text-slate-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          {/* 검색 + 차량위치조회 */}
          <div className="flex flex-col gap-1.5 p-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  placeholder="운전자명, 차량번호 검색"
                  className="h-7 w-full pl-7 pr-2 text-[11px] border border-input rounded-md bg-input-background outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>
              <select className="h-7 px-2 text-[11px] border border-input rounded-md bg-input-background outline-none">
                <option>전체</option>
              </select>
            </div>
            <button
              type="button"
              className="h-7 w-full inline-flex items-center justify-center gap-1 rounded-md border border-gray-300 text-[11px] text-slate-600 hover:bg-slate-50"
            >
              <MapPin className="w-3 h-3" />
              차량위치조회
            </button>
          </div>
          {/* 카드 리스트 (체크박스 포함, 위아래 스크롤) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 flex flex-col gap-1.5">
            {vehicles.map((v, i) => (
              <button
                key={v.VEH_ID ?? i}
                type="button"
                onClick={() => setSelVeh(i)}
                className={`text-left rounded-lg border p-2 transition-colors ${
                  selVeh === i
                    ? "border-[rgb(var(--primary))] bg-[var(--grid-header-bg)]"
                    : "border-gray-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={vehChecked.has(v.VEH_ID)}
                      onChange={() => toggleVeh(v.VEH_ID)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 accent-[rgb(var(--primary))]"
                    />
                    <span className="text-[12px] font-semibold text-slate-800 truncate">
                      {v.VEH_NO}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 shrink-0">{v.VEH_TP_NM}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-600 truncate">{v.DRVR_NM} (기사)</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{v.WORK_STS}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 우: 액션 툴바 + 선택 차량 회전 ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
        {/* 큰 액션 툴바 (배차생성/취소 그룹 · 리포트 출력 · 엑셀) */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 border-b shrink-0 flex-wrap">
          <Btn primary title="배차취소 · 엑셀업로드 · 엑셀양식다운로드 · 복수상차양식다운로드">
            배차생성/취소 ▾
          </Btn>
          <Btn>리포트 출력</Btn>
          <Btn title="조회된 모든 데이터 · 보이는 데이터">엑셀 ▾</Btn>
        </div>

        {/* 선택 차량 헤더 */}
        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0 text-[12px] min-w-0">
          <span className="font-semibold text-slate-800">{selRow?.VEH_NO}</span>
          <span className="text-slate-500 truncate">
            {selRow?.DRVR_NM ? `${selRow.DRVR_NM} (기사)` : ""} · {selRow?.VEH_TP_NM}
          </span>
        </div>

        {/* 회전 영역 헤더 (메모 · 계획확정 그룹) */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-50 border-b shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={allRtn}
              onChange={toggleAllRtn}
              className="h-3.5 w-3.5 accent-[rgb(var(--primary))]"
            />
            <span className="text-[11px] font-semibold text-slate-600">회전</span>
          </label>
          <div className="flex items-center gap-1.5">
            <Btn title="메모 등록 · 취소">메모 ▾</Btn>
            <Btn title="계획확정 · 계획확정취소">계획확정 ▾</Btn>
          </div>
        </div>

        {/* 회전 리스트 (더블클릭 → 상세 팝업, 좁아지면 위아래 스크롤) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-1.5">
          {rotations.map((r) => (
            <div
              key={r.no}
              onDoubleClick={onOpenDetail}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {/* 회전수 타이틀 옆 체크박스 */}
              <div className="flex items-center gap-1.5 mb-1">
                <input
                  type="checkbox"
                  checked={rtnChecked.has(r.no)}
                  onChange={() => toggleRtn(r.no)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3.5 w-3.5 accent-[rgb(var(--primary))]"
                />
                <span className="text-[12px] font-semibold text-slate-800">{r.no}회전</span>
              </div>
              {r.path ? (
                <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      r.reseq ? "bg-[#d9f2d9] text-slate-800" : "bg-slate-100"
                    }`}
                  >
                    {r.path}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-300">착지 없음</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
