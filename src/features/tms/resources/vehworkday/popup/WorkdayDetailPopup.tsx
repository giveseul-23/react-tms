"use client";

import { useCallback, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

const WORK_TP_WORK = "WDT_1000";
const WORK_TP_DAY_OFF = "WDT_1100";

type WorkdayDetailPopupProps = {
  dataIndex: string;
  record: Record<string, any>;
  onConfirm: (data: {
    workDayTp: string;
    workDayDtlTp: string;
    memo: string;
  }) => void;
  onClose: () => void;
};

export default function WorkdayDetailPopup({
  dataIndex,
  record,
  onConfirm,
  onClose,
}: WorkdayDetailPopupProps) {
  const oriWorkDayTp = record[dataIndex] ?? "";
  const oriDtlTp = record[`${dataIndex}_DTL_TP`] ?? "";
  const oriMemo = record[`${dataIndex}_MEMO`] ?? "";

  const [workDayTp, setWorkDayTp] = useState(oriWorkDayTp);
  const [workDayDtlTp, setWorkDayDtlTp] = useState(() => {
    if (
      oriWorkDayTp &&
      oriWorkDayTp !== WORK_TP_WORK &&
      oriWorkDayTp !== WORK_TP_DAY_OFF &&
      oriDtlTp
    ) {
      return oriDtlTp;
    }
    return "";
  });
  const [memo, setMemo] = useState(oriMemo);

  const { stores } = useCommonStores({
    workDayTp: { sqlProp: "CODE", keyParam: "WORK_DAY_TP" },
    WDT_2000: { sqlProp: "CODE", keyParam: "WDT_2000" },
    WDT_2100: { sqlProp: "CODE", keyParam: "WDT_2100" },
    WDT_2200: { sqlProp: "CODE", keyParam: "WDT_2200" },
    WDT_2300: { sqlProp: "CODE", keyParam: "WDT_2300" },
    WDT_2400: { sqlProp: "CODE", keyParam: "WDT_2400" },
    WDT_2500: { sqlProp: "CODE", keyParam: "WDT_2500" },
    WDT_3000: { sqlProp: "CODE", keyParam: "WDT_3000" },
    WDT_4000: { sqlProp: "CODE", keyParam: "WDT_4000" },
    WDT_7000: { sqlProp: "CODE", keyParam: "WDT_7000" },
  });

  const isDetailReadOnly =
    workDayTp === WORK_TP_WORK || workDayTp === WORK_TP_DAY_OFF;
  const isMemoReadOnly = workDayTp === WORK_TP_WORK;
  const dtlOptions = isDetailReadOnly
    ? []
    : ((stores[workDayTp] as { CODE: string; NAME: string }[] | undefined) ??
      []);
  const isDetailRequired = !!workDayTp && !isDetailReadOnly;
  const isValid = !!workDayTp && (!isDetailRequired || !!workDayDtlTp);

  const handleWorkDayTpChange = useCallback(
    (value: string) => {
      setWorkDayTp(value);
      setWorkDayDtlTp("");
      if (value === WORK_TP_WORK) {
        setMemo("");
      }
      if (
        value === oriWorkDayTp &&
        oriDtlTp &&
        value !== WORK_TP_WORK &&
        value !== WORK_TP_DAY_OFF
      ) {
        setWorkDayDtlTp(oriDtlTp);
      }
    },
    [oriWorkDayTp, oriDtlTp],
  );

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="확인"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ workDayTp, workDayDtlTp, memo })}
    >
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_WORKINGDAY_TYPE")}
        value={workDayTp}
        onChange={handleWorkDayTpChange}
        options={stores.workDayTp ?? []}
        placeholder="선택하세요"
      />

      <Field
        layout="vertical"
        type="combo"
        disabled={isDetailReadOnly}
        label={Lang.get("LBL_WORKINGDAY_DTL")}
        value={workDayDtlTp}
        onChange={setWorkDayDtlTp}
        options={dtlOptions}
        placeholder="선택하세요"
      />

      <Field
        layout="vertical"
        type="textarea"
        disabled={isMemoReadOnly}
        label={Lang.get("LBL_MEMO")}
        rows={5}
        value={memo}
        onChange={setMemo}
        placeholder="상세 내용을 입력하세요"
      />
    </FormPopupLayout>
  );
}
