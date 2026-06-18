"use client";

// 운송요청일변경 팝업 (서버 pop/ChangeDeliveryDatePop 대응)
// 계획ID(PLN_ID, 물류운영그룹 기준 콤보) + 운송요청일(DLVRY_DT) 입력 → 부모가 saveChangeDeliveryDate 호출.

import { useEffect, useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initialValues: { DLVRY_DT?: string; PLN_ID?: string; LGST_GRP_CD?: string };
  onConfirm: (data: { DLVRY_DT: string; PLN_ID: string }) => void;
  onClose: () => void;
};

export default function ChangeDeliveryDatePop({
  initialValues,
  onConfirm,
  onClose,
}: Props) {
  const [dlvryDt, setDlvryDt] = useState(initialValues.DLVRY_DT ?? "");
  const [planId, setPlanId] = useState(initialValues.PLN_ID ?? "");

  // 물류운영그룹 기준 계획ID 목록 (서버 selectUsrPlanCodeNameLgstGrpDesc / keyParam=LGST_GRP_CD)
  const { stores } = useCommonStores({
    planId: {
      sqlProp: "selectUsrPlanCodeNameLgstGrpDesc",
      keyParam: initialValues.LGST_GRP_CD || "__EMPTY__",
    },
  });

  // 초기 계획ID 가 목록에 없으면 첫 항목으로
  useEffect(() => {
    const list = stores.planId ?? [];
    if (!list.length) return;
    if (!list.some((item: any) => item.CODE === planId)) {
      setPlanId(initialValues.PLN_ID && list.some((i: any) => i.CODE === initialValues.PLN_ID) ? initialValues.PLN_ID : list[0].CODE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores.planId]);

  const isValid = !!(planId && dlvryDt);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_SAVE")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ DLVRY_DT: dlvryDt, PLN_ID: planId })}
    >
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_PLAN_ID")}
        required
        value={planId}
        onChange={setPlanId}
        options={stores.planId ?? []}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {Lang.get("LBL_DLVRY_DATE")}
        </label>
        <DatePickerPopover value={dlvryDt} onChange={setDlvryDt} />
      </div>
    </FormPopupLayout>
  );
}
