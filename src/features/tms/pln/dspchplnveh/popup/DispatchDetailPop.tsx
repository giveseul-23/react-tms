"use client";

// 배차상세정보 팝업 — 배차상세정보.JPG 레이아웃(구조/영역만, 데이터·로직 미연동).
//  상단: 차량번호/운전자명/차량유형명
//  좌: 배차정보(+툴바) / 배송경로(+ETA·조정 툴바)
//  우: 할당주문·미할당주문(탭 + 주문할당취소) / 품목

import { useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";

type Props = {
  onClose: () => void;
};

// ── 컬럼 (구조용, 한글 리터럴 → noLang) ───────────────────────────
const DSPCH_INFO_COLS = [
  { headerName: "No" },
  { type: "text", headerName: "회전", field: "RTN", noLang: true, width: 50, align: "center" },
  { type: "text", headerName: "진행상태", field: "DSPCH_OP_STS_NM", noLang: true, width: 80, align: "center" },
  { type: "text", headerName: "착지", field: "TO_LOC_NM", noLang: true, width: 120 },
  { type: "text", headerName: "품목단위", field: "ITEM_UNIT", noLang: true, width: 90 },
  { type: "numeric", headerName: "적재율(%)", field: "LD_RT", noLang: true, width: 80 },
  { type: "numeric", headerName: "계획부피적재율", field: "PLN_VOL_RT", noLang: true, width: 110 },
  { type: "numeric", headerName: "계획총중량", field: "PLN_GRS_WGT", noLang: true, width: 100 },
  { type: "numeric", headerName: "적재율", field: "WGT_RT", noLang: true, width: 70 },
];

const ROUTE_COLS = [
  { headerName: "No" },
  { type: "numeric", headerName: "순번", field: "SEQ", noLang: true, width: 50, align: "center" },
  { type: "text", headerName: "착지명", field: "LOC_NM", noLang: true, width: 120 },
  { type: "text", headerName: "착지구분", field: "LOC_TP", noLang: true, width: 80, align: "center" },
  { type: "text", headerName: "예상도착시간", field: "ETA_DTTM", noLang: true, width: 120, align: "center" },
  { type: "text", headerName: "도착시각", field: "ATA_DTTM", noLang: true, width: 110, align: "center" },
  { type: "text", headerName: "출발시각", field: "ATD_DTTM", noLang: true, width: 110, align: "center" },
  { type: "text", headerName: "입점", field: "ENTER_YN", noLang: true, width: 60, align: "center" },
];

const ORDER_COLS = [
  { type: "text", headerName: "출발지명", field: "FRM_LOC_NM", noLang: true, width: 100 },
  { type: "text", headerName: "착지명", field: "TO_LOC_NM", noLang: true, width: 100 },
  { type: "text", headerName: "주문유형", field: "ORD_TP", noLang: true, width: 80, align: "center" },
  { type: "text", headerName: "온도구분", field: "TEMP_TCD", noLang: true, width: 80, align: "center" },
  { type: "numeric", headerName: "계획총부피", field: "PLN_GRS_VOL", noLang: true, width: 90 },
];

const ITEM_COLS = [
  { type: "text", headerName: "품목라인", field: "ITEM_LINE", noLang: true, width: 80, align: "center" },
  { type: "text", headerName: "품목코드", field: "ITEM_CD", noLang: true, width: 100 },
  { type: "text", headerName: "품목명", field: "ITEM_NM", noLang: true, width: 120 },
  { type: "numeric", headerName: "계획주문수량", field: "PLN_ORD_QTY", noLang: true, width: 100 },
];

const ORDER_TABS = [
  { key: "ALLOC", label: "할당주문" },
  { key: "UNALLOC", label: "미할당주문" },
];

// 구조용 툴바 버튼 (no-op)
function TBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="h-6 px-2 rounded border border-gray-300 text-[11px] text-slate-600 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-500 shrink-0">{label}</span>
      <input
        readOnly
        value={value ?? ""}
        className="h-7 w-[140px] px-2 text-[11px] border border-input rounded-md bg-slate-100 text-slate-700 outline-none"
      />
    </div>
  );
}

export default function DispatchDetailPop({ onClose }: Props) {
  const [orderTab, setOrderTab] = useState("ALLOC");

  return (
    <div className="flex flex-col gap-2 w-full" style={{ height: "74vh" }}>
      {/* 상단 폼 */}
      <div className="flex items-center gap-6 px-3 py-2 rounded-md border border-gray-200 bg-slate-50 shrink-0">
        <Field label="차량번호" />
        <Field label="운전자명" />
        <Field label="차량유형명" />
      </div>

      {/* 본문 2단 */}
      <div className="flex-1 min-h-0 flex gap-2">
        {/* 좌: 배차정보 + 배송경로 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
          {/* 배차정보 */}
          <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-end gap-1.5 px-2 py-1 bg-slate-50 border-b shrink-0">
              <TBtn>배차생성/취소 ▾</TBtn>
              <TBtn>메모 ▾</TBtn>
              <TBtn>계획확정 ▾</TBtn>
              <TBtn>저장</TBtn>
              <TBtn>경유순서자동조정</TBtn>
            </div>
            <div className="flex-1 min-h-0">
              <DataGrid layoutType="plain" actions={[]} columnDefs={DSPCH_INFO_COLS} rowData={[]} audit={false} />
            </div>
          </div>
          {/* 배송경로 */}
          <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between gap-1.5 px-2 py-1 bg-slate-50 border-b shrink-0">
              <span className="text-[11px] font-semibold text-slate-600">배송경로</span>
              <div className="flex items-center gap-1.5">
                <TBtn>ETA 예측</TBtn>
                <TBtn>ETA 계산</TBtn>
                <TBtn>상하차분할</TBtn>
                <TBtn>조정 ▲</TBtn>
                <TBtn>조정 ▼</TBtn>
                <TBtn>순번저장</TBtn>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <DataGrid layoutType="plain" actions={[]} columnDefs={ROUTE_COLS} rowData={[]} audit={false} />
            </div>
          </div>
        </div>

        {/* 우: 주문(할당/미할당) + 품목 */}
        <div className="w-[40%] shrink-0 flex flex-col gap-2 min-h-0">
          {/* 할당/미할당 주문 */}
          <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-1 bg-slate-50 border-b shrink-0">
              <div className="flex">
                {ORDER_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setOrderTab(t.key)}
                    className={`px-3 py-1.5 text-[11px] font-medium border-b-2 transition-colors ${
                      orderTab === t.key
                        ? "text-[rgb(var(--primary))] border-[rgb(var(--primary))]"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <TBtn>주문할당취소</TBtn>
            </div>
            <div className="flex-1 min-h-0">
              <DataGrid layoutType="plain" actions={[]} columnDefs={ORDER_COLS} rowData={[]} audit={false} />
            </div>
          </div>
          {/* 품목 */}
          <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-2 py-1 bg-slate-50 border-b shrink-0 text-[11px] font-semibold text-slate-600">
              품목
            </div>
            <div className="flex-1 min-h-0">
              <DataGrid layoutType="plain" actions={[]} columnDefs={ITEM_COLS} rowData={[]} audit={false} />
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className="flex justify-end shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="h-7 px-3 rounded border border-gray-300 text-[11px] text-slate-600 hover:bg-slate-50"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
