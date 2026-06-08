"use client";

// 보험료 일괄 등록 팝업 (센차 IaciPop / IaciDfPop 공통)
// AP_PROC_TP(10 용차·회당 / 20 월대) + chgSqlProp(연결코드 목록) 만 다름.
// 입력 요율을 부모에 전달 → 부모가 선택 물류그룹행에 머지 후 saveBatch.

import { useEffect, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { useCommonStores } from "@/hooks/useCommonStores";
import { commonApi } from "@/app/services/common/commonApi";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  apProcTp: "10" | "20";
  chgSqlProp: string;
  onConfirm: (params: Record<string, any>) => void;
  onClose: () => void;
};

const todayDash = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function IaciCreatePop({ apProcTp, chgSqlProp, onConfirm, onClose }: Props) {
  const [chgCd, setChgCd] = useState("");
  const [frm, setFrm] = useState(todayDash());
  const [to, setTo] = useState(todayDash());
  const [deduction, setDeduction] = useState("0.303");
  const [insurance, setInsurance] = useState("0.018");
  const [bud, setBud] = useState("0.5");
  const [sppt, setSppt] = useState("0.5");
  const [extra1, setExtra1] = useState("1");
  const [extra2, setExtra2] = useState("1");
  const [rdng1, setRdng1] = useState("9999");
  const [rdng2, setRdng2] = useState("0300");
  const [chgOptions, setChgOptions] = useState<{ CODE: string; NAME: string }[]>([]);
  const { stores } = useCommonStores({ rdngRcd: { sqlProp: "CODE", keyParam: "RDNG_RCD" } });

  useEffect(() => {
    commonApi
      .getCodesAndNames({ key: "dsOut", sqlProp: chgSqlProp })
      .then((r: any) => setChgOptions(r?.data?.data?.dsOut ?? r?.data?.result ?? []))
      .catch(console.error);
  }, [chgSqlProp]);

  const valid = !!chgCd && !!frm && !!to && frm <= to;

  const numField = (label: string, value: string, set: (v: string) => void) => (
    <div className="grid grid-cols-3 items-center gap-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type="number" step="0.001" value={value} onChange={(e) => set(e.target.value)} className="col-span-2 h-9 rounded-lg border border-gray-300 px-3 text-sm text-right" />
    </div>
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-2.5 max-h-[70vh] overflow-auto"
      confirmLabel={Lang.get("BTN_CREATE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={valid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          CHG_CD: chgCd,
          FRM_DTTM: frm.replace(/-/g, ""),
          TO_DTTM: to.replace(/-/g, ""),
          AP_PROC_TP: apProcTp,
          DEDUCTION_RATE: deduction,
          INSURANCE_RATE: insurance,
          BUD_RATE: bud,
          SPPT_RATE: sppt,
          EXTRA_RATE1: extra1,
          EXTRA_RATE2: extra2,
          RDNG_RCD1: rdng1,
          RDNG_RCD2: rdng2,
        })
      }
    >
      <Field layout="horizontal" type="combo" required label={Lang.get("LBL_CONN_CD")} value={chgCd} onChange={setChgCd} options={chgOptions} />
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">{Lang.get("LBL_FROM_DTTM")}</label>
        <input type="date" value={frm} onChange={(e) => setFrm(e.target.value)} className="col-span-2 h-9 rounded-lg border border-gray-300 px-3 text-sm" />
      </div>
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">{Lang.get("LBL_TO_DTTM")}</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="col-span-2 h-9 rounded-lg border border-gray-300 px-3 text-sm" />
      </div>
      {numField(Lang.get("LBL_DEDUCTION"), deduction, setDeduction)}
      {numField(Lang.get("LBL_INSURANCE_RATE"), insurance, setInsurance)}
      <Field layout="horizontal" type="combo" label={`${Lang.get("LBL_RDNG_RCD")}1`} value={rdng1} onChange={setRdng1} options={stores.rdngRcd ?? []} />
      {numField(Lang.get("LBL_BUD_RATE"), bud, setBud)}
      {numField(Lang.get("LBL_SPPT_RATE"), sppt, setSppt)}
      {numField(`${Lang.get("LBL_ADD_RATE")}1`, extra1, setExtra1)}
      {numField(`${Lang.get("LBL_ADD_RATE")}2`, extra2, setExtra2)}
      <Field layout="horizontal" type="combo" label={`${Lang.get("LBL_RDNG_RCD")}2`} value={rdng2} onChange={setRdng2} options={stores.rdngRcd ?? []} />
    </FormPopupLayout>
  );
}
