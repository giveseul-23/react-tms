"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Field } from "@/app/components/popup/Field";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import ReceiveShipmentManagementLocationAddressPop from "../../rcvshpm/popup/ReceiveShipmentManagementLocationAddressPop";

type Side = "FRM" | "TO";

export type ShipLocationPayload = {
  LOC_CD: string;
  LOC_NM: string;
  LOC_ID: string;
  CTRY_CD: string;
  CTRY_NM: string;
  STT_CD: string;
  STT_NM: string;
  CTY_CD: string;
  CTY_NM: string;
  DTL_ADDR1: string;
  DTL_ADDR2: string;
  ZIP_CD: string;
  LAT: string;
  LON: string;
  ADDR_ID: string;
};

type Props = {
  side: Side;
  record: Record<string, any>;
  onApply: (payload: ShipLocationPayload) => void;
  onClose: () => void;
};

const valueOf = (record: Record<string, any>, side: Side, field: string) =>
  String(record?.[`${side}_${field}`] ?? "");

const fromRow = (row: Record<string, any>): ShipLocationPayload => ({
  LOC_CD: String(row.LOC_CD ?? row.CODE ?? ""),
  LOC_NM: String(row.LOC_NM ?? row.NAME ?? ""),
  LOC_ID: String(row.LOC_ID ?? ""),
  CTRY_CD: String(row.CTRY_CD ?? ""),
  CTRY_NM: String(row.CTRY_NM ?? ""),
  STT_CD: String(row.STT_CD ?? ""),
  STT_NM: String(row.STT_NM ?? ""),
  CTY_CD: String(row.CTY_CD ?? ""),
  CTY_NM: String(row.CTY_NM ?? ""),
  DTL_ADDR1: String(row.DTL_ADDR1 ?? ""),
  DTL_ADDR2: String(row.DTL_ADDR2 ?? ""),
  ZIP_CD: String(row.ZIP_CD ?? ""),
  LAT: String(row.LAT ?? ""),
  LON: String(row.LON ?? ""),
  ADDR_ID: String(row.ADDR_ID ?? ""),
});

export default function ChangeShipLocationPop({
  side,
  record,
  onApply,
  onClose,
}: Props) {
  const { openPopup, closePopup } = usePopup();
  const [form, setForm] = useState<ShipLocationPayload>(() =>
    fromRow({
      LOC_CD: valueOf(record, side, "LOC_CD"),
      LOC_NM: valueOf(record, side, "LOC_NM"),
      LOC_ID: valueOf(record, side, "LOC_ID"),
      CTRY_CD: valueOf(record, side, "CTRY_CD"),
      CTRY_NM: valueOf(record, side, "CTRY_NM"),
      STT_CD: valueOf(record, side, "STT_CD"),
      STT_NM: valueOf(record, side, "STT_NM"),
      CTY_CD: valueOf(record, side, "CTY_CD"),
      CTY_NM: valueOf(record, side, "CTY_NM"),
      DTL_ADDR1: valueOf(record, side, "DTL_ADDR1"),
      DTL_ADDR2: valueOf(record, side, "DTL_ADDR2"),
      ZIP_CD: valueOf(record, side, "ZIP_CD"),
      LAT: valueOf(record, side, "LAT"),
      LON: valueOf(record, side, "LON"),
      ADDR_ID: valueOf(record, side, "ADDR_ID"),
    }),
  );

  const locLabel = side === "FRM" ? "LBL_DEPARTURE" : "LBL_DESTINATION";
  const latLonLabel = side === "FRM" ? "LBL_FROM_LAT_LON" : "LBL_TO_LAT_LON";

  const setField = (key: keyof ShipLocationPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openLocationSearch = () => {
    openPopup({
      title: locLabel,
      width: "4xl",
      content: (
        <ReceiveShipmentManagementLocationAddressPop
          initialValues={{}}
          onApply={(row) => {
            setForm(fromRow(row));
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  return (
    <FormPopupLayout
      cardClassName="space-y-3"
      confirmLabel={Lang.get("BTN_APPLY")}
      isValid={!!(form.LOC_CD && form.DTL_ADDR1)}
      onCancel={onClose}
      onConfirm={() => onApply(form)}
    >
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get(locLabel)} <span className="text-red-500">*</span>
        </label>
        <input
          value={form.LOC_CD}
          onChange={(e) => setField("LOC_CD", e.target.value)}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <Button
          type="button"
          variant="outline"
          onClick={openLocationSearch}
          className="h-10 gap-2"
        >
          <Search className="h-4 w-4" />
          {Lang.get("BTN_SEARCH")}
        </Button>
      </div>
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_LOCATION_NAME")}
        value={form.LOC_NM}
        onChange={(v) => setField("LOC_NM", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_COUNTRY")}
        value={form.CTRY_NM || form.CTRY_CD}
        onChange={(v) => setField("CTRY_NM", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_ZIP_CODE")}
        value={form.ZIP_CD}
        onChange={(v) => setField("ZIP_CD", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_STATE")}
        value={form.STT_NM || form.STT_CD}
        onChange={(v) => setField("STT_NM", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_CITY")}
        value={form.CTY_NM || form.CTY_CD}
        onChange={(v) => setField("CTY_NM", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_ADDR")}
        required
        value={form.DTL_ADDR1}
        onChange={(v) => setField("DTL_ADDR1", v)}
      />
      <Field
        layout="horizontal"
        type="text"
        label={Lang.get("LBL_DETAIL_ADDRESS")}
        value={form.DTL_ADDR2}
        onChange={(v) => setField("DTL_ADDR2", v)}
      />
      <div className="grid grid-cols-3 items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
          {Lang.get(latLonLabel)}
        </label>
        <input
          value={form.LAT}
          onChange={(e) => setField("LAT", e.target.value)}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          value={form.LON}
          onChange={(e) => setField("LON", e.target.value)}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </FormPopupLayout>
  );
}
