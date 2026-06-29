"use client";

// 마감 AP 생성 팝업 (서버 pop/ItemQtyConfirmCreatePop 대응)
// 진입 시 getApMonthlyDate 로 마감 시작/종료일 자동 세팅 → 생성 시 createApSettlQty.

import { useEffect, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";
import { itmQtyCfmMgmtApi as api } from "../ItmQtyCfmMgmtApi";

type Props = {
  params: { DIV_CD: string; LGST_GRP_CD: string; CARR_CD: string };
  onConfirm: (data: {
    DIV_CD: string;
    LGST_GRP_CD: string;
    CARR_CD: string;
    FRM_DTTM: string;
    TO_DTTM: string;
  }) => void;
  onClose: () => void;
};

export function ItemQtyConfirmCreatePop({ params, onConfirm, onClose }: Props) {
  const [frm, setFrm] = useState("");
  const [to, setTo] = useState("");

  // 마감일자 조회 (서버 onCalled 의 getApMonthlyDate)
  useEffect(() => {
    let alive = true;
    void api
      .getApMonthlyDate(params)
      .then((res: any) => {
        if (!alive) return;
        const row = res?.data?.data?.dsOut?.[0];
        if (row) {
          setFrm(String(row.FRM_DTTM ?? ""));
          setTo(String(row.TO_DTTM ?? ""));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [params]);

  const isValid = !!(frm && to) && frm <= to;

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_CREATE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({ ...params, FRM_DTTM: frm, TO_DTTM: to })
      }
    >
      <Field
        layout="vertical"
        type="text"
        disabled
        label={Lang.get("LBL_DIVISION")}
        value={params.DIV_CD}
      />
      <Field
        layout="vertical"
        type="text"
        disabled
        label={Lang.get("LBL_LOGISTICS_GROUP")}
        value={params.LGST_GRP_CD}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_FROM_DTTM")}
        </label>
        <DatePickerPopover value={frm} onChange={setFrm} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_TO_DTTM")}
        </label>
        <DatePickerPopover value={to} onChange={setTo} />
      </div>
    </FormPopupLayout>
  );
}
