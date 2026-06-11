"use client";
// 주소찾기 팝업 (센차 vc.view.common.pop.AddressPop 대응 — 코어).
//   - 국가 → 주 → 도시 3단 연계 코드검색 (CommonPopup, keyParam 으로 부모코드 전달)
//   - 우편번호 / 상세주소 직접 입력
//   - 적용: 매핑된 필드(CTRY/STT/CTY/ZIP/DTL_ADDR…) 를 patch 로 반환 → 그리드 행에 write-back
//   - 삭제: 전 필드 비움 / 취소: 닫기
//   ※ 도로명 우편번호검색(AddressSearchPop) · 위경도 지오코딩(LAT/LON) 은 후속.

import { useState } from "react";
import { Search, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { usePopup } from "./PopupContext";
import { CommonPopup } from "./CommonPopup";
import { AddressSearchPop } from "./AddressSearchPop";
import { Lang } from "@/app/services/common/Lang";

export type AddressFieldMap = {
  ctryCd: string;
  ctryNm: string;
  sttCd: string;
  sttNm: string;
  ctyCd: string;
  ctyNm: string;
  zipCd: string;
  dtlAddr1: string;
  dtlAddr2: string;
};

type Props = {
  row: Record<string, any>;
  fields: AddressFieldMap;
  onApply: (patch: Record<string, any>) => void;
  onClose: () => void;
};

function PickerField({
  code,
  name,
  placeholder,
  disabled,
  onSearch,
}: {
  code: string;
  name: string;
  placeholder?: string;
  disabled?: boolean;
  onSearch: () => void;
}) {
  const display = code ? (name ? `${code} | ${name}` : code) : "";
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <div className="flex-1 min-w-0 h-7 px-2 flex items-center text-[12px] border border-input rounded-md bg-input-background truncate text-slate-700">
        {display || (
          <span className="text-muted-foreground">{placeholder ?? ""}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onSearch}
        disabled={disabled}
        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md border border-input text-slate-400 hover:text-[rgb(var(--primary))] disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={Lang.get("LBL_FIND_ADDRESS")}
      >
        <Search className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function AddressPop({ row, fields, onApply, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();

  const region = new Intl.Locale(navigator.language).maximize().region;
  let regionNm: string;
  if (region) {
    regionNm = new Intl.DisplayNames(["ko"], { type: "region" }).of(
      new Intl.Locale(navigator.language).maximize().region,
    );
  }

  const [ctryCd, setCtryCd] = useState(
    String(row?.[fields.ctryCd] ?? region ?? ""),
  );
  const [ctryNm, setCtryNm] = useState(
    String(row?.[fields.ctryNm] ?? regionNm ?? ""),
  );
  const [sttCd, setSttCd] = useState(String(row?.[fields.sttCd] ?? ""));
  const [sttNm, setSttNm] = useState(String(row?.[fields.sttNm] ?? ""));
  const [ctyCd, setCtyCd] = useState(String(row?.[fields.ctyCd] ?? ""));
  const [ctyNm, setCtyNm] = useState(String(row?.[fields.ctyNm] ?? ""));
  const [zipCd, setZipCd] = useState(String(row?.[fields.zipCd] ?? ""));
  const [dtlAddr1, setDtlAddr1] = useState(
    String(row?.[fields.dtlAddr1] ?? ""),
  );
  const [dtlAddr2, setDtlAddr2] = useState(
    String(row?.[fields.dtlAddr2] ?? ""),
  );

  const openZipPopup = () =>
    openPopup({
      title: "LBL_ADDR", // "주소" (PopupShell 이 Lang.get 적용)
      width: "3xl",
      content: (
        <AddressSearchPop
          onConfirm={(p: Record<string, any>) => {
            setZipCd(p.ZIP_CD ?? "");
            setSttCd(p.STT_CD ?? "");
            setSttNm(p.STT_NM ?? "");
            setCtyCd(p.CTY_CD ?? "");
            setCtyNm(p.CTY_NM ?? "");
            setDtlAddr1(p.DTL_ADDR1 ?? "");
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });

  // 코드검색 팝업 오픈 헬퍼 — keyParam 으로 부모코드 전달(주=국가, 도시=주).
  const openLookup = (
    sqlId: string,
    title: string,
    extraParams: Record<string, string> | undefined,
    onPick: (r: any) => void,
  ) => {
    openPopup({
      title,
      width: "2xl",
      content: (
        <CommonPopup
          sqlId={sqlId}
          extraParams={extraParams}
          onApply={(r: any) => {
            onPick(r);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const pickCountry = () =>
    openLookup(
      "selectCountryCodeName",
      Lang.get("LBL_COUNTRY"),
      undefined,
      (r) => {
        setCtryCd(r.CODE);
        setCtryNm(r.NAME);
        setSttCd("");
        setSttNm("");
        setCtyCd("");
        setCtyNm("");
      },
    );

  const pickState = () =>
    openLookup(
      "selectStateCodeName",
      Lang.get("LBL_STATE"),
      { keyParam: ctryCd },
      (r) => {
        setSttCd(r.CODE);
        setSttNm(r.NAME);
        setCtyCd("");
        setCtyNm("");
      },
    );

  const pickCity = () =>
    openLookup(
      "selectCityCodeName",
      Lang.get("LBL_CITY"),
      { keyParam: sttCd },
      (r) => {
        setCtyCd(r.CODE);
        setCtyNm(r.NAME);
      },
    );

  const buildPatch = (vals: {
    ctryCd: string;
    ctryNm: string;
    sttCd: string;
    sttNm: string;
    ctyCd: string;
    ctyNm: string;
    zipCd: string;
    dtlAddr1: string;
    dtlAddr2: string;
  }) => ({
    [fields.ctryCd]: vals.ctryCd,
    [fields.ctryNm]: vals.ctryNm,
    [fields.sttCd]: vals.sttCd,
    [fields.sttNm]: vals.sttNm,
    [fields.ctyCd]: vals.ctyCd,
    [fields.ctyNm]: vals.ctyNm,
    [fields.zipCd]: vals.zipCd,
    [fields.dtlAddr1]: vals.dtlAddr1,
    [fields.dtlAddr2]: vals.dtlAddr2,
  });

  const apply = () =>
    onApply(
      buildPatch({
        ctryCd,
        ctryNm,
        sttCd,
        sttNm,
        ctyCd,
        ctyNm,
        zipCd,
        dtlAddr1,
        dtlAddr2,
      }),
    );

  const clearAll = () =>
    onApply(
      buildPatch({
        ctryCd: "",
        ctryNm: "",
        sttCd: "",
        sttNm: "",
        ctyCd: "",
        ctyNm: "",
        zipCd: "",
        dtlAddr1: "",
        dtlAddr2: "",
      }),
    );

  const labelCls = "w-20 shrink-0 text-right text-[12px] text-slate-600";
  const rowCls = "flex items-center gap-2";

  return (
    <div className="flex flex-col gap-2.5 w-full p-1">
      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_COUNTRY")}</label>
        <PickerField code={ctryCd} name={ctryNm} onSearch={pickCountry} />
      </div>

      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_ZIP_CODE")}</label>
        <PickerField code={zipCd} name={""} onSearch={openZipPopup} />
      </div>

      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_STATE")}</label>
        <PickerField
          code={sttCd}
          name={sttNm}
          disabled={!ctryCd}
          onSearch={pickState}
        />
      </div>

      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_CITY")}</label>
        <PickerField
          code={ctyCd}
          name={ctyNm}
          disabled={!sttCd}
          onSearch={pickCity}
        />
      </div>

      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_DETAIL_ADDRESS")}</label>
        <Input
          value={dtlAddr1}
          onChange={(e) => setDtlAddr1(e.target.value)}
          className="flex-1 h-7 text-[12px]"
        />
      </div>

      <div className={rowCls}>
        <label className={labelCls}>{Lang.get("LBL_DETAIL_ADDRESS2")}</label>
        <Input
          value={dtlAddr2}
          onChange={(e) => setDtlAddr2(e.target.value)}
          className="flex-1 h-7 text-[12px]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearAll}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <Trash2 className="w-3 h-3" />
          {Lang.get("LBL_DELETE")}
        </Button>
        <Button
          size="sm"
          onClick={apply}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_APPLY")}
        </Button>
      </div>
    </div>
  );
}
