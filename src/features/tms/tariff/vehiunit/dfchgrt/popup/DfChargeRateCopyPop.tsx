"use client";

// 계약서(요율) 복사 팝업 (센차 DfChargeRateCopyPop)
// 대상 디비전/물류그룹 + 적용기간 + 수배송구분 → 부모가 addCopy 호출.

import { useState } from "react";
import { Search } from "lucide-react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  initial: any;
  onConfirm: (params: any) => void;
  onClose: () => void;
};

const toDash = (v: any) => {
  const s = String(v ?? "").replace(/[^0-9]/g, "");
  return s.length >= 8
    ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
    : "";
};

export default function DfChargeRateCopyPop({
  initial,
  onConfirm,
  onClose,
}: Props) {
  const { openPopup, closePopup } = usePopup();
  const [div, setDiv] = useState({
    cd: initial?.DIV_CD ?? "",
    nm: initial?.DIV_NM ?? "",
  });
  const [lgst, setLgst] = useState({
    cd: initial?.LGST_GRP_CD ?? "",
    nm: initial?.LGST_GRP_NM ?? "",
  });
  const [frm, setFrm] = useState(toDash(initial?.FRM_DTTM));
  const [to, setTo] = useState(toDash(initial?.TO_DTTM));
  const [transTcd, setTransTcd] = useState(initial?.TRANS_TCD ?? "");
  const { stores } = useCommonStores({
    transTcd: { sqlProp: "CODE", keyParam: "TRANS_TCD" },
  });

  const pick = (sqlId: string, onPick: (cd: string, nm: string) => void) =>
    openPopup({
      title: "BTN_SEARCH",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId={sqlId}
          onApply={(r: any) => {
            closePopup();
            onPick(r.CODE, r.NAME);
          }}
          onClose={closePopup}
        />
      ),
    });

  const valid = !!(div.cd && lgst.cd && frm && to && transTcd);

  return (
    <FormPopupLayout
      cardClassName="space-y-3"
      confirmLabel={Lang.get("LBL_TARIFF_COPY")}
      cancelLabel={Lang.get("BTN_CANCEL")}
      isValid={valid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          TRF_CD: initial?.TRF_CD,
          COPY_TRF_CD: initial?.TRF_CD,
          FRM_DTTM: frm.replace(/-/g, ""),
          TO_DTTM: to.replace(/-/g, ""),
          DIV_CD: div.cd,
          LGST_GRP_CD: lgst.cd,
          TRANS_TCD: transTcd,
          rowStatus: "I",
        })
      }
    >
      <PickerField
        label={Lang.get("LBL_DIVISION_CODE")}
        value={div}
        onSearch={() =>
          pick("selectDivisionCodeName", (cd, nm) => setDiv({ cd, nm }))
        }
      />
      <PickerField
        label={Lang.get("LBL_LOGISTICS_GROUP_CODE")}
        value={lgst}
        onSearch={() =>
          pick("selectLogisticsgroupCodeName", (cd, nm) => setLgst({ cd, nm }))
        }
      />
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          {Lang.get("LBL_FROM_DATE")}
        </label>
        <input
          type="date"
          value={frm}
          max={to}
          onChange={(e) => setFrm(e.target.value)}
          className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm"
        />
      </div>
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          {Lang.get("LBL_TO_DATE")}
        </label>
        <input
          type="date"
          value={to}
          min={frm}
          onChange={(e) => setTo(e.target.value)}
          className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm"
        />
      </div>
      <Field
        layout="horizontal"
        type="combo"
        label={Lang.get("LBL_VEH_TRANS_TCD")}
        required
        value={transTcd}
        onChange={setTransTcd}
        options={stores.transTcd ?? []}
      />
    </FormPopupLayout>
  );
}

function PickerField({
  label,
  value,
  onSearch,
}: {
  label: string;
  value: { cd: string; nm: string };
  onSearch: () => void;
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-3">
      <label className="text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500"> *</span>
      </label>
      <div className="col-span-2 flex items-center gap-1">
        <input
          readOnly
          value={value.cd}
          className="w-24 h-10 rounded-lg border border-gray-300 px-3 text-sm bg-gray-100"
        />
        <input
          readOnly
          value={value.nm}
          className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm bg-gray-100 min-w-0"
        />
        <button
          type="button"
          onClick={onSearch}
          className="h-10 w-10 shrink-0 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
