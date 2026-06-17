"use client";

import { useEffect, useState } from "react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { receiveShipmentManagementApi as api } from "../ReceiveShipmentManagementApi";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import ReceiveShipmentManagementLocationAddressPop from "./ReceiveShipmentManagementLocationAddressPop";

type Mode = "I" | "U";

type Props = {
  mode: Mode;
  initialValues?: Record<string, any>;
  onSaved: (row: any) => void;
  onClose: () => void;
};

type FormState = {
  SHPM_ID: string;
  IF_RCV_TP: string;
  DIV_CD: string;
  DIV_NM: string;
  LGST_GRP_CD: string;
  LGST_GRP_NM: string;
  CUST_CD: string;
  CUST_NM: string;
  AR_YN: string;
  AR_CNTRCT_LCD: string;
  AR_CNTRCT_CD: string;
  CUST_ORD_NO: string;
  ORD_NO: string;
  SHPM_TP: string;
  ORD_TP: string;
  DLVRY_DT: string;
  PICK_FRM_DTTM: string;
  PICK_TO_DTTM: string;
  DROP_FRM_DTTM: string;
  DROP_TO_DTTM: string;
  FRM_LOC_ID: string;
  FRM_LOC_CD: string;
  REQ_FRM_LOC_NM: string;
  FRM_CTRY_CD: string;
  FRM_CTRY_NM: string;
  FRM_STT_CD: string;
  FRM_STT_NM: string;
  FRM_CTY_CD: string;
  FRM_CTY_NM: string;
  FRM_DTL_ADDR1: string;
  FRM_ZIP_CD: string;
  FRM_LAT: string;
  FRM_LON: string;
  TO_LOC_ID: string;
  TO_LOC_CD: string;
  REQ_TO_LOC_NM: string;
  TO_CTRY_CD: string;
  TO_CTRY_NM: string;
  TO_STT_CD: string;
  TO_STT_NM: string;
  TO_CTY_CD: string;
  TO_CTY_NM: string;
  TO_DTL_ADDR1: string;
  TO_ZIP_CD: string;
  TO_LAT: string;
  TO_LON: string;
  UOM_SYSTEM: string;
  SHPM_RSN_DESC: string;
};

const emptyForm = (): FormState => ({
  SHPM_ID: "",
  IF_RCV_TP: "20",
  DIV_CD: "",
  DIV_NM: "",
  LGST_GRP_CD: "",
  LGST_GRP_NM: "",
  CUST_CD: "",
  CUST_NM: "",
  AR_YN: "Y",
  AR_CNTRCT_LCD: "CUSTOMER",
  AR_CNTRCT_CD: "",
  CUST_ORD_NO: "",
  ORD_NO: "",
  SHPM_TP: "",
  ORD_TP: "",
  DLVRY_DT: "",
  PICK_FRM_DTTM: "",
  PICK_TO_DTTM: "",
  DROP_FRM_DTTM: "",
  DROP_TO_DTTM: "",
  FRM_LOC_ID: "",
  FRM_LOC_CD: "",
  REQ_FRM_LOC_NM: "",
  FRM_CTRY_CD: "",
  FRM_CTRY_NM: "",
  FRM_STT_CD: "",
  FRM_STT_NM: "",
  FRM_CTY_CD: "",
  FRM_CTY_NM: "",
  FRM_DTL_ADDR1: "",
  FRM_ZIP_CD: "",
  FRM_LAT: "",
  FRM_LON: "",
  TO_LOC_ID: "",
  TO_LOC_CD: "",
  REQ_TO_LOC_NM: "",
  TO_CTRY_CD: "",
  TO_CTRY_NM: "",
  TO_STT_CD: "",
  TO_STT_NM: "",
  TO_CTY_CD: "",
  TO_CTY_NM: "",
  TO_DTL_ADDR1: "",
  TO_ZIP_CD: "",
  TO_LAT: "",
  TO_LON: "",
  UOM_SYSTEM: "METRIC",
  SHPM_RSN_DESC: "",
});

const compactDate = (value: string) => value.replace(/\D/g, "").slice(0, 8);

const compactDateTime = (value: string) => {
  const compact = value.replace(/\D/g, "");
  if (!compact) return "";
  return compact.padEnd(14, "0").slice(0, 14);
};

const toPickerDate = (value: any) => {
  const compact = String(value ?? "").replace(/\D/g, "");
  if (compact.length < 8) return String(value ?? "");
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
};

const toPickerDateTime = (value: any) => {
  const compact = String(value ?? "").replace(/\D/g, "");
  if (compact.length < 8) return String(value ?? "");
  const time = compact.slice(8).padEnd(6, "0");
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`;
};

const toFormState = (values: Record<string, any>): Partial<FormState> => {
  const next = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value ?? "")]),
  ) as Partial<FormState>;
  if (values.DLVRY_DT != null) next.DLVRY_DT = toPickerDate(values.DLVRY_DT);
  if (values.PICK_FRM_DTTM != null) {
    next.PICK_FRM_DTTM = toPickerDateTime(values.PICK_FRM_DTTM);
  }
  if (values.PICK_TO_DTTM != null) {
    next.PICK_TO_DTTM = toPickerDateTime(values.PICK_TO_DTTM);
  }
  if (values.DROP_FRM_DTTM != null) {
    next.DROP_FRM_DTTM = toPickerDateTime(values.DROP_FRM_DTTM);
  }
  if (values.DROP_TO_DTTM != null) {
    next.DROP_TO_DTTM = toPickerDateTime(values.DROP_TO_DTTM);
  }
  return next;
};

const toSavePayload = (form: FormState, mode: Mode) => ({
  ...form,
  DLVRY_DT: compactDate(form.DLVRY_DT),
  PICK_FRM_DTTM: compactDateTime(form.PICK_FRM_DTTM),
  PICK_TO_DTTM: compactDateTime(form.PICK_TO_DTTM),
  DROP_FRM_DTTM: compactDateTime(form.DROP_FRM_DTTM),
  DROP_TO_DTTM: compactDateTime(form.DROP_TO_DTTM),
  rowStatus: mode === "I" ? "I" : "U",
});

export default function ReceiveShipmentManagementPop({ mode, initialValues = {}, onSaved, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const showError = useErrorAlert();
  const { stores } = useCommonStores({
    ordTpList: { sqlProp: "CODE", keyParam: "ORD_TP" },
    shpmTpList: { sqlProp: "CODE", keyParam: "SHPM_TP" },
    ynList: { sqlProp: "CODE", keyParam: "YN" },
    arCntrctlcdList: { sqlProp: "CODE", keyParam: "AR_CNTRCT_LCD" },
    uomSystemList: { sqlProp: "CODE", keyParam: "UOM_SYSTEM" },
  });

  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm(),
    ...toFormState(initialValues),
  }));

  useEffect(() => {
    setForm((prev) => ({
      ...emptyForm(),
      ...prev,
      ...toFormState(initialValues),
    } as FormState));
  }, [initialValues]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyLocation = (side: "FRM" | "TO", row: any) => {
    if (!row) return;
    setForm((prev) => ({
      ...prev,
      [`${side}_LOC_ID`]: String(row.LOC_ID ?? ""),
      [`${side}_LOC_CD`]: String(row.LOC_CD ?? ""),
      [`REQ_${side}_LOC_NM`]: String(row.LOC_NM ?? ""),
      [`${side}_CTRY_CD`]: String(row.CTRY_CD ?? ""),
      [`${side}_CTRY_NM`]: String(row.CTRY_NM ?? ""),
      [`${side}_STT_CD`]: String(row.STT_CD ?? ""),
      [`${side}_STT_NM`]: String(row.STT_NM ?? ""),
      [`${side}_CTY_CD`]: String(row.CTY_CD ?? ""),
      [`${side}_CTY_NM`]: String(row.CTY_NM ?? ""),
      [`${side}_DTL_ADDR1`]: String(row.DTL_ADDR1 ?? ""),
      [`${side}_ZIP_CD`]: String(row.ZIP_CD ?? ""),
      [`${side}_LAT`]: String(row.LAT ?? ""),
      [`${side}_LON`]: String(row.LON ?? ""),
    }));
  };

  const openLocationPopup = (side: "FRM" | "TO") => {
    openPopup({
      title: Lang.get(side === "FRM" ? "LBL_DEPARTURE" : "LBL_DESTINATION"),
      width: "4xl",
      content: (
        <ReceiveShipmentManagementLocationAddressPop
          initialValues={
            mode === "U"
              ? {}
              : {
                  LOC_CD: form[`${side}_LOC_CD` as keyof FormState],
                  LOC_NM: form[`REQ_${side}_LOC_NM` as keyof FormState],
                  CTRY_CD: form[`${side}_CTRY_CD` as keyof FormState],
                  CTRY_NM: form[`${side}_CTRY_NM` as keyof FormState],
                  STT_CD: form[`${side}_STT_CD` as keyof FormState],
                  STT_NM: form[`${side}_STT_NM` as keyof FormState],
                  CTY_CD: form[`${side}_CTY_CD` as keyof FormState],
                  CTY_NM: form[`${side}_CTY_NM` as keyof FormState],
                }
          }
          onApply={(row) => {
            applyLocation(side, row);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const openCustomerPopup = () => {
    openPopup({
      title: "LBL_CUSTOMER_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectCustomerCodeName"
          onApply={(picked: any) => {
            setForm((prev) => ({
              ...prev,
              CUST_CD: String(picked?.CODE ?? ""),
              CUST_NM: String(picked?.NAME ?? ""),
            }));
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const save = async (closeAfter: boolean) => {
    try {
      const payload = toSavePayload(form, mode);
      const res = await api.saveShipment({ dsSave: [payload] });
      const data = res?.data?.data ?? res?.data ?? {};
      onSaved(data);
      if (closeAfter) onClose();
      else setForm((prev) => ({ ...prev, ...data }));
    } catch (err: any) {
      showError(err?.response?.data?.error?.message ?? err?.message ?? "저장에 실패했습니다.");
    }
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={mode === "I" ? Lang.get("BTN_SHIPMENT_INSERT") : Lang.get("BTN_SHIPMENT_UPDATE")}
      isValid={!!(form.DIV_CD && form.LGST_GRP_CD && form.CUST_CD && form.CUST_ORD_NO && form.SHPM_TP && form.ORD_TP && form.DLVRY_DT)}
      onCancel={onClose}
      onConfirm={() => void save(true)}
    >
      <div className="flex items-center justify-between gap-3 pb-2 border-b">
        <div className="text-base font-semibold text-slate-800">{mode === "I" ? Lang.get("LBL_SHIPMENT_INSERT_POP") : Lang.get("LBL_SHIPMENT_UPDATE_POP")}</div>
        <div className="flex gap-2">
          <button type="button" className="h-9 px-3 rounded-lg border" onClick={() => void save(false)}>{Lang.get("BTN_SAVE")}</button>
          <button type="button" className="h-9 px-3 rounded-lg border" onClick={() => void save(true)}>{Lang.get("BTN_SAVE_CLOSE")}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field layout="vertical" type="text" label={Lang.get("LBL_DIVISION")} value={`${form.DIV_CD}${form.DIV_NM ? ` [${form.DIV_NM}]` : ""}`} disabled />
        <Field layout="vertical" type="text" label={Lang.get("LBL_LOGISTICS_GROUP")} value={`${form.LGST_GRP_CD}${form.LGST_GRP_NM ? ` [${form.LGST_GRP_NM}]` : ""}`} disabled />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_CUSTOMER_CODE")}</label>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            value={form.CUST_CD}
            disabled
            className="h-10 rounded-lg border border-gray-300 bg-gray-200 px-3 text-sm"
          />
          <input
            value={form.CUST_NM}
            disabled
            className="h-10 rounded-lg border border-gray-300 bg-gray-200 px-3 text-sm"
          />
          <button
            type="button"
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm"
            onClick={openCustomerPopup}
          >
            {Lang.get("BTN_SEARCH")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field layout="vertical" type="combo" label={Lang.get("LBL_AR_YN")} value={form.AR_YN} onChange={(v) => setField("AR_YN", v)} options={stores.ynList ?? []} />
        <Field layout="vertical" type="combo" label={Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE")} value={form.AR_CNTRCT_LCD} onChange={(v) => setField("AR_CNTRCT_LCD", v)} options={stores.arCntrctlcdList ?? []} />
      </div>
      <Field layout="vertical" type="text" label={Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE")} value={form.AR_CNTRCT_CD} onChange={(v) => setField("AR_CNTRCT_CD", v)} />
      <Field layout="vertical" type="text" label={Lang.get("LBL_CUSTOMER_ORDER_NO")} value={form.CUST_ORD_NO} onChange={(v) => setField("CUST_ORD_NO", v)} />
      <Field layout="vertical" type="text" label={Lang.get("LBL_ORDER_NO")} value={form.ORD_NO} onChange={(v) => setField("ORD_NO", v)} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field layout="vertical" type="combo" label={Lang.get("LBL_SHIPMENT_TYPE")} value={form.SHPM_TP} onChange={(v) => setField("SHPM_TP", v)} options={stores.shpmTpList ?? []} />
        <Field layout="vertical" type="combo" label={Lang.get("LBL_ORDER_TYPE")} value={form.ORD_TP} onChange={(v) => setField("ORD_TP", v)} options={stores.ordTpList ?? []} />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_REQUESTED_DELIVERY_DATE")}</label>
          <DatePickerPopover
            value={form.DLVRY_DT}
            onChange={(v) => setField("DLVRY_DT", v)}
            className="h-10 w-full"
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_PICK_FROM_TIME")}</label>
          <DatePickerPopover
            value={form.PICK_FRM_DTTM}
            onChange={(v) => setField("PICK_FRM_DTTM", v)}
            withTime
            className="h-10 w-full"
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_PICK_TO_TIME")}</label>
          <DatePickerPopover
            value={form.PICK_TO_DTTM}
            onChange={(v) => setField("PICK_TO_DTTM", v)}
            withTime
            className="h-10 w-full"
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_DROP_FROM_TIME")}</label>
          <DatePickerPopover
            value={form.DROP_FRM_DTTM}
            onChange={(v) => setField("DROP_FRM_DTTM", v)}
            withTime
            className="h-10 w-full"
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{Lang.get("LBL_DROP_TO_TIME")}</label>
          <DatePickerPopover
            value={form.DROP_TO_DTTM}
            onChange={(v) => setField("DROP_TO_DTTM", v)}
            withTime
            className="h-10 w-full"
            placeholder="YYYY-MM-DD HH:MM:SS"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border p-4">
          <div className="font-semibold text-sm text-slate-700">{Lang.get("LBL_DEPARTURE")}</div>
          <Field layout="vertical" type="text" label={Lang.get("LBL_DEPARTURE_CODE")} value={form.FRM_LOC_CD} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DEPARTURE_NAME")} value={form.REQ_FRM_LOC_NM} disabled />
          <button type="button" className="h-9 px-3 rounded-lg border bg-white text-sm" onClick={() => openLocationPopup("FRM")}>{Lang.get("BTN_SEARCH")}</button>
          <Field layout="vertical" type="text" label={Lang.get("LBL_FROM_COUNTRY_CD")} value={`${form.FRM_CTRY_CD}${form.FRM_CTRY_NM ? ` [${form.FRM_CTRY_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DEPARTURE_STATE")} value={`${form.FRM_STT_CD}${form.FRM_STT_NM ? ` [${form.FRM_STT_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_FROM_CITY")} value={`${form.FRM_CTY_CD}${form.FRM_CTY_NM ? ` [${form.FRM_CTY_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_FRM_DETAIL_ADDRESS_1")} value={form.FRM_DTL_ADDR1} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DEPARTURE_ZIP_CODE")} value={form.FRM_ZIP_CD} disabled />
          <div className="grid grid-cols-2 gap-2">
            <Field layout="vertical" type="text" label={Lang.get("LBL_FROM_LAT")} value={form.FRM_LAT} disabled />
            <Field layout="vertical" type="text" label={Lang.get("LBL_FROM_LON")} value={form.FRM_LON} disabled />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border p-4">
          <div className="font-semibold text-sm text-slate-700">{Lang.get("LBL_DESTINATION")}</div>
          <Field layout="vertical" type="text" label={Lang.get("LBL_DESTINATION_CODE")} value={form.TO_LOC_CD} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DESTINATION_NAME")} value={form.REQ_TO_LOC_NM} disabled />
          <button type="button" className="h-9 px-3 rounded-lg border bg-white text-sm" onClick={() => openLocationPopup("TO")}>{Lang.get("BTN_SEARCH")}</button>
          <Field layout="vertical" type="text" label={Lang.get("LBL_TO_COUNTRY_CD")} value={`${form.TO_CTRY_CD}${form.TO_CTRY_NM ? ` [${form.TO_CTRY_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DESTINATION_STATE")} value={`${form.TO_STT_CD}${form.TO_STT_NM ? ` [${form.TO_STT_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DESTINATION_CITY")} value={`${form.TO_CTY_CD}${form.TO_CTY_NM ? ` [${form.TO_CTY_NM}]` : ""}`} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_TO_DETAIL_ADDRESS_1")} value={form.TO_DTL_ADDR1} disabled />
          <Field layout="vertical" type="text" label={Lang.get("LBL_DESTINATION_ZIP_CODE")} value={form.TO_ZIP_CD} disabled />
          <div className="grid grid-cols-2 gap-2">
            <Field layout="vertical" type="text" label={Lang.get("LBL_TO_LAT")} value={form.TO_LAT} disabled />
            <Field layout="vertical" type="text" label={Lang.get("LBL_TO_LON")} value={form.TO_LON} disabled />
          </div>
        </div>
      </div>
      <Field layout="vertical" type="text" label={Lang.get("LBL_RMRK")} value={form.SHPM_RSN_DESC} onChange={(v) => setField("SHPM_RSN_DESC", v)} />
      <Field layout="vertical" type="combo" label={Lang.get("LBL_UOM_SYSTEM")} value={form.UOM_SYSTEM} onChange={(v) => setField("UOM_SYSTEM", v)} options={stores.uomSystemList ?? []} />
    </FormPopupLayout>
  );
}
