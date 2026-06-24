"use client";

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  onApply: (row: Record<string, any>) => void;
  onClose: () => void;
};

type FormState = {
  ORD_LINE_NO: string;
  CUST_ITEM_CD: string;
  CUST_ITEM_NM: string;
  CMDT_CD: string;
  PLN_ORD_QTY: string;
  PLN_ORD_QTY_UOM: string;
  PLN_INV_QTY: string;
  PLN_INV_QTY_UOM: string;
  PLN_NET_VOL: string;
  PLN_GRS_VOL: string;
  PLN_NET_WGT: string;
  PLN_GRS_WGT: string;
  PLN_PLT_QTY: string;
  PLN_RTNR_QTY: string;
  PLN_PBOX_QTY: string;
  PLN_BOX_QTY: string;
  PLN_FLEX_QTY1: string;
  PLN_FLEX_QTY2: string;
  PLN_FLEX_QTY3: string;
  PLN_FLEX_QTY4: string;
  PLN_FLEX_QTY5: string;
  SHPM_DTL_RSN_DESC: string;
  REFER_ORD_NO: string;
  REFER_ORD_LINE_NO: string;
  SALES_OFC: string;
  SALES_GRP: string;
  DIST_CHANNEL: string;
};

const emptyForm = (): FormState => ({
  ORD_LINE_NO: "",
  CUST_ITEM_CD: "",
  CUST_ITEM_NM: "",
  CMDT_CD: "",
  PLN_ORD_QTY: "0",
  PLN_ORD_QTY_UOM: "",
  PLN_INV_QTY: "0",
  PLN_INV_QTY_UOM: "",
  PLN_NET_VOL: "0",
  PLN_GRS_VOL: "0",
  PLN_NET_WGT: "0",
  PLN_GRS_WGT: "0",
  PLN_PLT_QTY: "0",
  PLN_RTNR_QTY: "0",
  PLN_PBOX_QTY: "0",
  PLN_BOX_QTY: "0",
  PLN_FLEX_QTY1: "0",
  PLN_FLEX_QTY2: "0",
  PLN_FLEX_QTY3: "0",
  PLN_FLEX_QTY4: "0",
  PLN_FLEX_QTY5: "0",
  SHPM_DTL_RSN_DESC: "",
  REFER_ORD_NO: "",
  REFER_ORD_LINE_NO: "",
  SALES_OFC: "",
  SALES_GRP: "",
  DIST_CHANNEL: "",
});

const NUMERIC_FIELDS: Array<keyof FormState> = [
  "PLN_ORD_QTY",
  "PLN_INV_QTY",
  "PLN_NET_VOL",
  "PLN_GRS_VOL",
  "PLN_NET_WGT",
  "PLN_GRS_WGT",
  "PLN_PLT_QTY",
  "PLN_RTNR_QTY",
  "PLN_PBOX_QTY",
  "PLN_BOX_QTY",
  "PLN_FLEX_QTY1",
  "PLN_FLEX_QTY2",
  "PLN_FLEX_QTY3",
  "PLN_FLEX_QTY4",
  "PLN_FLEX_QTY5",
];

const toNumber = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return 0;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

const toPayload = (form: FormState) => {
  const payload: Record<string, any> = { ...form };
  for (const field of NUMERIC_FIELDS) {
    payload[field] = toNumber(form[field]);
  }
  return payload;
};

export default function ReceiveShipmentDetailAddPop({ onApply, onClose }: Props) {
  const { stores } = useCommonStores({
    itmUomList: { sqlProp: "CODE", keyParam: "ITEM_UOM" },
    cmdtTpList: {
      fields: ["field1"],
      module: "TMS",
      sqlProp: "selectCommodityCodeList",
    },
  });
  const [form, setForm] = useState<FormState>(() => emptyForm());

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_ADD")}
      isValid={!!(form.ORD_LINE_NO && form.CUST_ITEM_CD && form.CUST_ITEM_NM)}
      onCancel={onClose}
      onConfirm={() => onApply(toPayload(form))}
    >
      <div className="text-base font-semibold text-slate-800">
        {Lang.get("BTN_ADD")}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Field layout="vertical" type="text" label={Lang.get("LBL_ORD_LINE_NO")} required value={form.ORD_LINE_NO} onChange={(v) => setField("ORD_LINE_NO", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_ITEM_CD")} required value={form.CUST_ITEM_CD} onChange={(v) => setField("CUST_ITEM_CD", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_ITEM_NM")} required value={form.CUST_ITEM_NM} onChange={(v) => setField("CUST_ITEM_NM", v)} />
        <Field layout="vertical" type="combo" label={Lang.get("LBL_COMMODITY_CODE")} value={form.CMDT_CD} onChange={(v) => setField("CMDT_CD", v)} options={stores.cmdtTpList ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_ORD_QTY")} value={form.PLN_ORD_QTY} onChange={(v) => setField("PLN_ORD_QTY", v)} />
        <Field layout="vertical" type="combo" label={Lang.get("LBL_PLN_ORD_QTY_UOM")} value={form.PLN_ORD_QTY_UOM} onChange={(v) => setField("PLN_ORD_QTY_UOM", v)} options={stores.itmUomList ?? []} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_INV_QTY")} value={form.PLN_INV_QTY} onChange={(v) => setField("PLN_INV_QTY", v)} />
        <Field layout="vertical" type="combo" label={Lang.get("LBL_PLN_INV_QTY_UOM")} value={form.PLN_INV_QTY_UOM} onChange={(v) => setField("PLN_INV_QTY_UOM", v)} options={stores.itmUomList ?? []} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_NET_VOL")} value={form.PLN_NET_VOL} onChange={(v) => setField("PLN_NET_VOL", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_GRS_VOL")} value={form.PLN_GRS_VOL} onChange={(v) => setField("PLN_GRS_VOL", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_NET_WGT")} value={form.PLN_NET_WGT} onChange={(v) => setField("PLN_NET_WGT", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_GRS_WGT")} value={form.PLN_GRS_WGT} onChange={(v) => setField("PLN_GRS_WGT", v)} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_PLT_QTY")} value={form.PLN_PLT_QTY} onChange={(v) => setField("PLN_PLT_QTY", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_RTNR_QTY")} value={form.PLN_RTNR_QTY} onChange={(v) => setField("PLN_RTNR_QTY", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_PBOX_QTY")} value={form.PLN_PBOX_QTY} onChange={(v) => setField("PLN_PBOX_QTY", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLN_BOX_QTY")} value={form.PLN_BOX_QTY} onChange={(v) => setField("PLN_BOX_QTY", v)} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLANNED_FLEX_QTY1")} value={form.PLN_FLEX_QTY1} onChange={(v) => setField("PLN_FLEX_QTY1", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLANNED_FLEX_QTY2")} value={form.PLN_FLEX_QTY2} onChange={(v) => setField("PLN_FLEX_QTY2", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLANNED_FLEX_QTY3")} value={form.PLN_FLEX_QTY3} onChange={(v) => setField("PLN_FLEX_QTY3", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLANNED_FLEX_QTY4")} value={form.PLN_FLEX_QTY4} onChange={(v) => setField("PLN_FLEX_QTY4", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_PLANNED_FLEX_QTY5")} value={form.PLN_FLEX_QTY5} onChange={(v) => setField("PLN_FLEX_QTY5", v)} />
      </div>

      <Field layout="vertical" type="textarea" label={Lang.get("LBL_ITEM_REMARK")} value={form.SHPM_DTL_RSN_DESC} onChange={(v) => setField("SHPM_DTL_RSN_DESC", v)} rows={3} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field layout="vertical" type="text" label={Lang.get("LBL_REFER_ORD_NO")} value={form.REFER_ORD_NO} onChange={(v) => setField("REFER_ORD_NO", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_REFER_ORD_LINE_NO")} value={form.REFER_ORD_LINE_NO} onChange={(v) => setField("REFER_ORD_LINE_NO", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_DISTR_CHNL")} value={form.DIST_CHANNEL} onChange={(v) => setField("DIST_CHANNEL", v)} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field layout="vertical" type="text" label={Lang.get("LBL_SALES_OFC_CD")} value={form.SALES_OFC} onChange={(v) => setField("SALES_OFC", v)} />
        <Field layout="vertical" type="text" label={Lang.get("LBL_SALES_ORG_CD")} value={form.SALES_GRP} onChange={(v) => setField("SALES_GRP", v)} />
      </div>
    </FormPopupLayout>
  );
}
