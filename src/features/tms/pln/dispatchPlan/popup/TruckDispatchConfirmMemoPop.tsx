"use client";

// 배차확정 메모 팝업 — 선택 배차행의 4개 메모(배차관리자/운송사제공/상차요청/고객사제공)를 일괄 등록.
// 서버 dspchplnveh.pop.memo.TruckDispatchConfirmMemoPop2 대응.
//   진입 시 searchDispatchMemo 로 기존 메모 로드 → 저장 시 saveDispatchMemo(단건 dsSave).
//   상단 정보(배차번호/운송일/상태/운송사/차량/운전자)는 조회조건 카드(PopupSearchCondition) 스타일로 표시.

import { useEffect, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import { dispatchPlanApi as api } from "../dispatchPlanApi";

const MEMO_DESC_MAX_LEN = 1000;

// 4개 메모 — 키/제목/설명. 레거시 TruckDispatchConfirmMemoPop2 와 동일.
const MEMO_FIELDS = [
  {
    key: "DSPCH_MNGR_MEMO",
    title: "LBL_TD_MEMO_GENERAL_TITLE",
    desc: "LBL_TD_MEMO_GENERAL_DESC",
  },
  {
    key: "CARR_MEMO",
    title: "LBL_TD_MEMO_CARRIER_TITLE",
    desc: "LBL_TD_MEMO_CARRIER_DESC",
  },
  {
    key: "LD_REQ_MEMO",
    title: "LBL_TD_MEMO_LOAD_REQ_TITLE",
    desc: "LBL_TD_MEMO_LOAD_REQ_DESC",
  },
  {
    key: "CUST_MEMO",
    title: "LBL_TD_MEMO_CUSTOMER_TITLE",
    desc: "LBL_TD_MEMO_CUSTOMER_DESC",
  },
] as const;

type MemoKey = (typeof MEMO_FIELDS)[number]["key"];
type MemoState = Record<MemoKey, string>;

const emptyMemos = (): MemoState => ({
  DSPCH_MNGR_MEMO: "",
  CARR_MEMO: "",
  LD_REQ_MEMO: "",
  CUST_MEMO: "",
});

// "YYYYMMDD" → "YYYY-MM-DD" (표시용)
function formatDate(v?: string): string {
  const d = String(v ?? "").replace(/[^0-9]/g, "");
  return d.length >= 8
    ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
    : String(v ?? "");
}

type Props = {
  // 선택 배차행 (DSPCH_NO / TRCK_NO / 헤더 정보 포함)
  row: Record<string, any>;
  // 배차운영상태 라벨 (Controller 가 codeMap 으로 변환해 전달)
  statusLabel: string;
  // 저장 성공 후 콜백 (보통 재조회)
  onSaved: () => void;
  onClose: () => void;
};

export default function TruckDispatchConfirmMemoPop({
  row,
  statusLabel,
  onSaved,
  onClose,
}: Props) {
  const showError = useErrorAlert();
  const [memos, setMemos] = useState<MemoState>(emptyMemos);

  // 진입 시 기존 메모 로드
  useEffect(() => {
    api
      .searchDispatchMemo({ DSPCH_NO: row.DSPCH_NO })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        const raw =
          res.data?.result ?? res.data?.data?.dsOut ?? res.data?.data ?? {};
        const memo = Array.isArray(raw) ? (raw[0] ?? {}) : raw;
        setMemos({
          DSPCH_MNGR_MEMO: String(memo.DSPCH_MNGR_MEMO ?? ""),
          CARR_MEMO: String(memo.CARR_MEMO ?? ""),
          LD_REQ_MEMO: String(memo.LD_REQ_MEMO ?? ""),
          CUST_MEMO: String(memo.CUST_MEMO ?? ""),
        });
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.DSPCH_NO]);

  const setMemo = (key: MemoKey, value: string) =>
    setMemos((prev) => ({ ...prev, [key]: value }));

  const onReset = () => setMemos(emptyMemos());

  const onConfirm = () => {
    const merged = {
      ...row,
      ...memos,
      DSPCH_NO: row.DSPCH_NO,
      TRCK_NO: row.TRCK_NO,
    };
    api
      .saveDispatchMemo(merged)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        onSaved();
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-3"
      confirmLabel="저장"
      onCancel={onClose}
      onConfirm={onConfirm}
    >
      {/* 배차 정보 — 조회조건(조건) 카드 스타일 직접 구성: 타이틀(안내문) + 헤더 우측 초기화 */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--grid-header-bg)]">
          <div className="flex items-center gap-1.5 leading-none min-w-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-color/80 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-color tracking-widest uppercase leading-none">
              선택한 배차번호에 대해 메모 4종을 일괄 등록합니다.
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1 flex-shrink-0"
            style={{ lineHeight: 1 }}
          >
            <RotateCcw className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">{Lang.get("LBL_INITIALIZE")}</span>
          </button>
        </div>
        <div
          className="grid divide-x divide-y divide-slate-100"
          style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
        >
          {[
            { label: "LBL_DISPATCH_NO", value: String(row.DSPCH_NO ?? "") },
            { label: "LBL_TD_TRANSPORT_DATE", value: formatDate(row.DLVRY_DT) },
            { label: "LBL_DISPATCH_OPERATIONAL_STATUS", value: statusLabel },
            { label: "LBL_CARRIER_NAME", value: String(row.CARR_NM ?? "") },
            { label: "LBL_VEHICLE_NUMBER", value: String(row.VEH_NO ?? "") },
            { label: "LBL_DRIVER_NAME", value: String(row.DRVR_NM ?? "") },
          ].map((f) => (
            <div
              key={f.label}
              className="flex flex-col px-3 py-2 bg-white min-w-0"
            >
              <label className="text-[10px] font-medium text-slate-400 mb-0.5">
                {Lang.get(f.label)}
              </label>
              <span className="text-[12px] text-slate-700 truncate">
                {f.value || "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 메모 4개 — 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {MEMO_FIELDS.map((f) => {
          const value = memos[f.key];
          return (
            <div
              key={f.key}
              className="flex flex-col rounded-lg border border-slate-200 p-3 bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-800">
                    {Lang.get(f.title)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {Lang.get(f.desc)}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {value.length} / {MEMO_DESC_MAX_LEN}
                </span>
              </div>
              <textarea
                value={value}
                maxLength={MEMO_DESC_MAX_LEN}
                onChange={(e) => setMemo(f.key, e.target.value)}
                placeholder={Lang.get("LBL_MEMO_ENTER_PLAIN")}
                className="mt-2 h-28 w-full resize-none rounded-md border border-slate-200 p-2 text-[12px] text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          );
        })}
      </div>
    </FormPopupLayout>
  );
}
