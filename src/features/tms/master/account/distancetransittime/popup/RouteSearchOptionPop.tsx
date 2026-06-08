"use client";

// 경로탐색옵션 선택 팝업 (센차 RouteSearchOptionPop)
// MAP_RTNG_OPTN_TCD 콤보 선택값을 부모에 전달.

import { useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onConfirm: (mapRtngOptnTcd: string) => void;
  onClose: () => void;
};

export default function RouteSearchOptionPop({ onConfirm, onClose }: Props) {
  const [value, setValue] = useState("");
  const { stores } = useCommonStores({
    mapRtngOptnTcd: { sqlProp: "CODE", keyParam: "MAP_RTNG_OPTN_TCD" },
  });

  return (
    <FormPopupLayout
      confirmLabel={Lang.get("BTN_SAVE")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={!!value}
      onCancel={onClose}
      onConfirm={() => onConfirm(value)}
    >
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_ROUTE_SEARCH_OPTION")}
        value={value}
        onChange={setValue}
        options={stores.mapRtngOptnTcd ?? []}
      />
    </FormPopupLayout>
  );
}
