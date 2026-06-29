"use client";

// 수량분할 팝업 — 선택 품목(상세) 행의 계획수량을 분할.
// 서버 credspch.pop.SplitQtyPop 대응. 저장: /createDispatchService/saveSplitShipmentQty.
//   분할수량(SPLT_PLN_QTY)만 입력, 0 초과 & 계획수량(PLN_QTY) 미만 검증.

import { useMemo, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";

type Props = {
  // 부모가 넘기는 분할 대상 상세 행 (DSPCH_NO 병합 후)
  record: Record<string, any>;
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

export default function SplitQtyPop({ record, onConfirm, onClose }: Props) {
  const planQty = Number(record.PLN_INV_QTY ?? 0);
  const [splitQty, setSplitQty] = useState("");

  const qtyNum = Number(splitQty);
  const isValid = useMemo(
    () => splitQty !== "" && qtyNum > 0 && qtyNum < planQty,
    [splitQty, qtyNum, planQty],
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="확인"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        // rowStatus "U" + 입력 분할수량을 머지해 부모로 반환 → 부모가 saveSplitShipmentQty 호출
        onConfirm({ ...record, SPLT_PLN_QTY: qtyNum, rowStatus: "U" })
      }
    >
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="고객주문번호"
        value={record.CUST_ORD_NO ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="운송번호"
        value={record.SHPM_NO ?? ""}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="품목"
        value={`${record.CUST_ITEM_CD ?? ""} ${record.CUST_ITEM_NM ?? ""}`.trim()}
      />
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="계획수량"
        value={String(planQty)}
      />
      <Field
        layout="horizontal"
        type="text"
        required
        label="분할수량"
        value={splitQty}
        onChange={(v: string) => setSplitQty(v.replace(/[^0-9.]/g, ""))}
        placeholder="계획수량 미만으로 입력"
      />
    </FormPopupLayout>
  );
}
