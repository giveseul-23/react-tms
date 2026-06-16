"use client";

// 매출계약 복사 팝업 (서버 pop/AccountReceivableCopyPopup 대응)
// 원본 계약서(읽기전용) ↔ 신규 계약서(입력) 2열 폼.
// [중복확인] 으로 매출계약코드 사용 가능 여부 확인 후 [복사생성] 활성 → copyAccountReceivable.

import { useMemo, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { usePopup } from "@/app/components/popup/PopupContext";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { DatePickerPopover } from "@/app/components/Search/filters/DatePickerPopover";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import { Lang } from "@/app/services/common/Lang";
import { Search } from "lucide-react";
import { accountReceivableManagementApi as api } from "../AccountReceivableManagementApi";

type Props = {
  srcRow: Record<string, any>;
  arStlBaseDtTpMap?: Record<string, string>;
  onApplied: () => void;
  onClose: () => void;
};

const normalizeYmd = (val: any): string => {
  if (val == null) return "";
  let s = String(val).trim();
  s = s.split(" ")[0].split("T")[0];
  const digits = s.replace(/[^0-9]/g, "");
  return digits.length >= 8 ? digits.substring(0, 8) : digits;
};

const ALLOWED_AR_STL_BASE_DT_TP = ["DEPART", "ARRIVE", "POD"];

export default function AccountReceivableCopyPopup({
  srcRow,
  arStlBaseDtTpMap,
  onApplied,
  onClose,
}: Props) {
  const { openPopup, closePopup } = usePopup();
  const { stores } = useCommonStores({
    arStlBaseDtTpList: { sqlProp: "CODE", keyParam: "AR_STL_BASE_DT_TP" },
  });

  const srcArTrfLcd = srcRow.AR_TRF_LCD;
  const isContract = srcArTrfLcd === "CONTRACT";
  const srcSttDt = normalizeYmd(srcRow.STT_DT);
  const srcEndDt = normalizeYmd(srcRow.END_DT);

  // 신규 계약서 입력값 (서버 onCalled 초기 세팅)
  const [custCd, setCustCd] = useState(srcRow.CUST_CD ?? "");
  const [custNm, setCustNm] = useState(srcRow.CUST_NM ?? "");
  const [custCntrctCd, setCustCntrctCd] = useState(
    isContract ? (srcRow.CUST_CNTRCT_CD ?? "") : "",
  );
  const [custCntrctNm, setCustCntrctNm] = useState(
    isContract ? (srcRow.CUST_CNTRCT_NM ?? "") : "",
  );
  const [arTrfCd, setArTrfCd] = useState("");
  const [arTrfNm, setArTrfNm] = useState("");
  const [arStlBaseDtTp, setArStlBaseDtTp] = useState("");
  const [sttDt, setSttDt] = useState(srcSttDt);
  const [endDt, setEndDt] = useState(srcEndDt);
  const [copyAllYn, setCopyAllYn] = useState(true);
  const [dupChecked, setDupChecked] = useState(false);

  const srcStlBaseDtTpName = useMemo(
    () => arStlBaseDtTpMap?.[srcRow.AR_STL_BASE_DT_TP] ?? srcRow.AR_STL_BASE_DT_TP ?? "",
    [arStlBaseDtTpMap, srcRow.AR_STL_BASE_DT_TP],
  );

  const openCustomerPopup = () => {
    openPopup({
      title: "LBL_CUSTOMER_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectCustomerCodeName"
          onApply={(picked: any) => {
            setCustCd(picked.CODE);
            setCustNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const onDupCheck = () => {
    if (!arTrfCd || arTrfCd.trim() === "") {
      showInfoModal(
        Lang.get("MSG_VALID_REQ", Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE")),
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    api
      .dupCheck(arTrfCd)
      .then((res: any) => {
        const dupExist = res?.data?.data?.dupExist === true;
        if (dupExist) {
          setDupChecked(false);
          showInfoModal(
            Lang.get("MESSAGE_DUPLICATE_ACCOUNT_RECEIVABLE_CODE"),
            Lang.get("TTL_ALERT"),
          );
        } else {
          setDupChecked(true);
          showInfoModal(
            Lang.get("MSG_DUP_CHECK_OK"),
            Lang.get("TTL_CONFIRM"),
          );
        }
      })
      .catch(() => {
        setDupChecked(false);
        showErrorModal(Lang.get("MSG_FAIL"));
      });
  };

  const onCopyCreate = () => {
    if (!dupChecked) {
      showInfoModal(Lang.get("MSG_NEED_DUP_CHECK"), Lang.get("TTL_ALERT"));
      return;
    }
    if (!arTrfCd || arTrfCd.trim() === "") {
      showInfoModal(
        Lang.get("MSG_VALID_REQ", Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE")),
        Lang.get("TTL_ALERT"),
      );
      return;
    }

    let custCrtCd: string | null = null;
    if (isContract) {
      custCrtCd = custCntrctCd;
      if (!custCrtCd || custCrtCd.trim() === "") {
        showInfoModal(
          Lang.get("MSG_VALID_REQ", Lang.get("LBL_CUSTOMER_CONTRACT_CODE")),
          Lang.get("TTL_ALERT"),
        );
        return;
      }
    }

    const finalArTrfNm = arTrfNm || srcRow.AR_TRF_NM;
    const finalStlBaseDtTp = arStlBaseDtTp || srcRow.AR_STL_BASE_DT_TP;
    const finalSttDt = normalizeYmd(sttDt) || srcSttDt;
    const finalEndDt = normalizeYmd(endDt) || srcEndDt;

    if (
      finalStlBaseDtTp &&
      ALLOWED_AR_STL_BASE_DT_TP.indexOf(finalStlBaseDtTp) === -1
    ) {
      showInfoModal(
        `${Lang.get("LBL_RATE_DATE_TYPE_CODE")} : DEPART, ARRIVE, POD`,
        Lang.get("TTL_ALERT"),
      );
      return;
    }
    if (finalSttDt && finalEndDt && finalSttDt > finalEndDt) {
      showInfoModal(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_ALERT"));
      return;
    }

    const derived = {
      CUST_CD: custCd || srcRow.CUST_CD,
      AR_TRF_LCD: srcRow.AR_TRF_LCD,
      CUST_CNTRCT_CD: custCrtCd,
      AR_TRF_CD: arTrfCd,
      AR_TRF_CD_OLD: srcRow.AR_TRF_CD,
      AR_TRF_NM: finalArTrfNm,
      AR_STL_BASE_DT_TP: finalStlBaseDtTp,
      AR_CALC_TCD: srcRow.AR_CALC_TCD,
      STT_DT: finalSttDt,
      END_DT: finalEndDt,
      MIN_RATE: srcRow.MIN_RATE,
      MAX_RATE: srcRow.MAX_RATE,
      CURR_CD: srcRow.CURR_CD,
      XCLD_AUTO_CALC: srcRow.XCLD_AUTO_CALC === true ? "Y" : srcRow.XCLD_AUTO_CALC,
      FRM_APPLD_OIL_PRICE: srcRow.FRM_APPLD_OIL_PRICE,
      TO_APPLD_OIL_PRICE: srcRow.TO_APPLD_OIL_PRICE,
      DIV_CD: srcRow.DIV_CD,
      LGST_GRP_CD: srcRow.LGST_GRP_CD,
      USE_YN: srcRow.USE_YN === true ? "Y" : srcRow.USE_YN === false ? "N" : srcRow.USE_YN,
      COPY_SUBSTRUCT_ALL_YN: copyAllYn ? "Y" : "N",
    };

    api
      .copyAccountReceivable(derived)
      .then(() => {
        showInfoModal(Lang.get("MSG_SAVE_CMPLT"), Lang.get("BTN_OK"), onApplied);
      })
      .catch(() => showErrorModal(Lang.get("MSG_FAIL")));
  };

  const labelCls = "w-[160px] shrink-0 text-sm text-gray-700";
  const roInputCls =
    "flex-1 h-9 rounded-md border border-gray-300 px-2 text-sm bg-gray-100 text-gray-600";
  const inputCls =
    "flex-1 h-9 rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

  const SrcRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-center gap-2">
      <span className={labelCls}>{Lang.get(label)}</span>
      <input className={roInputCls} value={value ?? ""} readOnly />
    </div>
  );

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* 하위구조 전체복사 */}
        <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-600"
            checked={copyAllYn}
            onChange={(e) => setCopyAllYn(e.target.checked)}
          />
          하위구조 전체복사
        </label>

        <div className="grid grid-cols-2 gap-6">
          {/* 원본 계약서 */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              원본 계약서
            </div>
            <SrcRow label="LBL_CUSTOMER_CODE" value={srcRow.CUST_CD} />
            <SrcRow label="LBL_CUSTOMER_NAME" value={srcRow.CUST_NM} />
            <SrcRow label="LBL_CUSTOMER_CONTRACT_CODE" value={srcRow.CUST_CNTRCT_CD} />
            <SrcRow label="LBL_CUSTOMER_CONTRACT_NAME" value={srcRow.CUST_CNTRCT_NM} />
            <SrcRow label="LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE" value={srcRow.AR_TRF_CD} />
            <SrcRow label="LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME" value={srcRow.AR_TRF_NM} />
            <SrcRow label="LBL_RATE_DATE_TYPE_CODE" value={srcStlBaseDtTpName} />
            <SrcRow label="LBL_FROM_DTTM" value={srcSttDt} />
            <SrcRow label="LBL_TO_DTTM" value={srcEndDt} />
          </div>

          {/* 신규 계약서 */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              신규 계약서
            </div>
            {/* 고객코드 (popcode) */}
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_CUSTOMER_CODE")}</span>
              <div className="flex-1 flex items-center gap-1">
                <input
                  className="w-[100px] h-9 rounded-md border border-gray-300 px-2 text-sm"
                  value={custCd}
                  onChange={(e) => setCustCd(e.target.value)}
                />
                <button
                  type="button"
                  onClick={openCustomerPopup}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-gray-300 text-slate-400 hover:text-[rgb(var(--primary))]"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_CUSTOMER_NAME")}</span>
              <input className={roInputCls} value={custNm} readOnly />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_CUSTOMER_CONTRACT_CODE")}</span>
              <input
                className={isContract ? inputCls : roInputCls}
                value={custCntrctCd}
                readOnly={!isContract}
                maxLength={60}
                onChange={(e) => setCustCntrctCd(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_CUSTOMER_CONTRACT_NAME")}</span>
              <input className={roInputCls} value={custCntrctNm} readOnly />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE")}</span>
              <input
                className={inputCls}
                value={arTrfCd}
                maxLength={60}
                onChange={(e) => {
                  setArTrfCd(e.target.value);
                  setDupChecked(false);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME")}</span>
              <input
                className={inputCls}
                value={arTrfNm}
                maxLength={60}
                onChange={(e) => setArTrfNm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_RATE_DATE_TYPE_CODE")}</span>
              <div className="flex-1">
                <ComboFilter
                  value={arStlBaseDtTp}
                  onChange={setArStlBaseDtTp}
                  options={stores.arStlBaseDtTpList ?? []}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_FROM_DTTM")}</span>
              <div className="flex-1">
                <DatePickerPopover value={sttDt} onChange={setSttDt} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={labelCls}>{Lang.get("LBL_TO_DTTM")}</span>
              <div className="flex-1">
                <DatePickerPopover value={endDt} onChange={setEndDt} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          {Lang.get("BTN_CANCEL")}
        </button>
        <button
          type="button"
          onClick={onDupCheck}
          className="flex-1 h-11 rounded-lg border border-[rgb(var(--primary))] text-[rgb(var(--primary))] font-medium hover:bg-blue-50 transition"
        >
          {Lang.get("BTN_DUP_CHECK")}
        </button>
        <button
          type="button"
          disabled={!dupChecked}
          onClick={onCopyCreate}
          className="flex-1 h-11 rounded-lg bg-[rgb(var(--primary))] text-white font-medium hover:bg-[rgb(var(--primary-hover))] disabled:opacity-40 transition"
        >
          {Lang.get("BTN_COPY_CREATE")}
        </button>
      </div>
    </div>
  );
}
