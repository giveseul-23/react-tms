"use client";

// 매입문서생성(발행) 팝업 (서버 pop/ItmQtySettlMgmtCreateApDocPop)
// 날짜유형/기간/생성방식/지급운송협력사/적용UOM(다중) 입력 → publishApDoc 직접 호출(사이드이펙트) 후 onApplied.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { Lang } from "@/app/services/common/Lang";

type CodeOption = { CODE: string; NAME: string };

type Props = {
  initialValues: {
    DIV_CD: string;
    LGST_GRP_CD: string;
    FRM_DTTM: string;
    TO_DTTM: string;
    CARR_CD: string;
    CARR_NM: string;
  };
  dateTypeOptions: CodeOption[];
  creationMethodOptions: CodeOption[];
  uomOptions: CodeOption[];
  onPublish: (payload: Record<string, any>) => void; // 부모가 publishApDoc 호출
  onClose: () => void;
};

export function CreateApDocPop({
  initialValues,
  dateTypeOptions,
  creationMethodOptions,
  uomOptions,
  onPublish,
  onClose,
}: Props) {
  const [dateType, setDateType] = useState("DLVRY_DT"); // 서버 기본값
  const [frm, setFrm] = useState(initialValues.FRM_DTTM ?? "");
  const [to, setTo] = useState(initialValues.TO_DTTM ?? "");
  const [gnrtnTcd, setGnrtnTcd] = useState("");
  const [uoms, setUoms] = useState<string[]>([]);

  const toggleUom = (code: string) =>
    setUoms((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );

  // 서버 b4PublishValidation 대응
  const valid =
    !!dateType && !!frm && !!to && frm <= to && !!gnrtnTcd && uoms.length > 0;

  const onConfirm = () => {
    // RPBOX + 집계(AGGREGATION) 조합 금지 (서버 isRPBOXAndAggregation)
    if (gnrtnTcd === "AGGREGATION" && uoms.includes("RPBOX")) {
      // 부모에서 alert 처리하도록 빈 페이로드 대신 명시 — 여기서는 간단히 차단.
      return;
    }
    onPublish({
      DATE_TYPE: dateType,
      FRM_DTTM: frm,
      TO_DTTM: to,
      ITEMQTY_AP_GNRTN_TCD: gnrtnTcd,
      PAY_CARR_CD: initialValues.CARR_CD,
      ITEM_UOM_ARR: [...uoms, ""], // 서버 getUomList 가 빈문자 push
      DIV_CD: initialValues.DIV_CD,
      LGST_GRP_CD: initialValues.LGST_GRP_CD,
    });
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_PUBLISH")}
      isValid={valid}
      onCancel={onClose}
      onConfirm={onConfirm}
    >
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_DT_TP_NM")}
        value={dateType}
        onChange={setDateType}
        options={dateTypeOptions}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {Lang.get("LBL_FROM_DTTM")} <span className="text-red-500">*</span>
          </label>
          <DatePickerPopover value={frm} onChange={setFrm} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {Lang.get("LBL_TO_DTTM")} <span className="text-red-500">*</span>
          </label>
          <DatePickerPopover value={to} onChange={setTo} />
        </div>
      </div>
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_CREATE_METHOD")}
        value={gnrtnTcd}
        onChange={setGnrtnTcd}
        options={creationMethodOptions}
      />
      <Field
        layout="vertical"
        type="text"
        disabled
        label={Lang.get("LBL_PAY_CARRIER")}
        value={initialValues.CARR_NM ?? ""}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_ADJ_UOM")} <span className="text-red-500">*</span>
        </label>
        <div className="rounded-lg border border-gray-300 max-h-40 overflow-auto divide-y divide-gray-100">
          {uomOptions.map((o) => (
            <label
              key={o.CODE}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-50/40"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-emerald-600"
                checked={uoms.includes(o.CODE)}
                onChange={() => toggleUom(o.CODE)}
              />
              {o.NAME}
            </label>
          ))}
        </div>
      </div>
    </FormPopupLayout>
  );
}
