"use client";

// 화면 전용 조회조건 (센차 SettlementOrderContractController.onAfterRender / contractConditionDisable)
// 매출계약레벨·매출계약코드 연동만 이 화면에서 처리.

import React, {
  useState,
  useRef,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { SearchFilter } from "@/app/components/Search/SearchFilter";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { SearchFieldRenderer } from "@/app/components/Search/SearchFilters/SearchFieldRenderer";
import { useSearchState } from "@/app/components/Search/SearchFilters/useSearchState";
import { useModuleDefault } from "@/app/components/Search/SearchFilters/useModuleDefault";
import {
  useSearchExecute,
  type SearchResult,
  type ParamMode,
} from "@/app/components/Search/SearchFilters/useSearchExecute";
import {
  useSearchCondition,
  type ExcludeSpec,
} from "@/hooks/useSearchCondition";
import { popupNameKey } from "@/features/search/search.builder";
import { CONDITION_ICON_MAP } from "@/app/components/Search/conditionIcons";
import type { SearchMeta } from "@/features/search/search.meta.types";
import { Lang } from "@/app/services/common/Lang";

/* ── 매출계약코드 규칙 (센차 contractConditionDisable) ── */

const normalizeMetaKey = (metaKey: string) =>
  metaKey.toUpperCase().replace(/\./g, "_");

const endsWithKey = (metaKey: string, key: string) => {
  const nk = normalizeMetaKey(metaKey);
  const k = key.toUpperCase();
  return nk === k || nk.endsWith(`_${k}`) || nk.endsWith(`.${k}`);
};

const CUSTOMER_CONTRACT_SQL = /selectcustomercontract|selectcustcntrct/i;
const TARIFF_CODE_LABEL = /LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE/i;

type SearchDataType = "STRING" | "NUMBER" | "DATE";
type UpdateConditionFn = (
  key: string,
  value: string,
  operator: keyof typeof CONDITION_ICON_MAP,
  dataType: SearchDataType,
  sourceType?: "POPUP" | "NORMAL",
) => void;

function isArContractSearchField(m: SearchMeta): boolean {
  const nk = normalizeMetaKey(m.key);
  if (nk.endsWith("TRF_LCD") || nk.endsWith("CNTRCT_LCD")) return false;
  if (m.type === "POPUP" && m.sqlId && CUSTOMER_CONTRACT_SQL.test(m.sqlId)) {
    return true;
  }
  if (m.type === "COMBO") {
    const sql = String(m.sqlProp ?? "").toLowerCase();
    if (CUSTOMER_CONTRACT_SQL.test(sql)) return true;
    if (sql.includes("cntrct")) return true;
    const kp = String(m.keyParam ?? "").toUpperCase();
    if (kp.includes("AR_CNTRCT") || kp.includes("CNTRCT_CD")) return true;
  }
  if (nk.includes("AR_CNTRCT") || nk.endsWith("CNTRCT_CD")) return true;
  if (TARIFF_CODE_LABEL.test(m.label)) return true;
  return false;
}

function stripArContractMetaLinks(m: SearchMeta): SearchMeta {
  const base = {
    required: false,
    filterValueKey: undefined,
    filterCol: undefined,
    sqlParam1: undefined,
    sqlParam2: undefined,
    sqlParam3: undefined,
  };
  if (m.type === "COMBO" || m.type === "POPUP") {
    return { ...m, ...base, filterComponent: undefined, filterRefColumn: undefined };
  }
  return { ...m, ...base };
}

function findArTrfLcdMeta(meta: readonly SearchMeta[]) {
  return meta.find((m) => {
    if (m.type !== "COMBO") return false;
    if (endsWithKey(m.key, "AR_TRF_LCD")) return true;
    if (m.keyParam === "AR_TRF_LCD" || m.keyParam === "AR_CNTRCT_LCD") return true;
    return /TARIFF_LEVEL/i.test(m.label);
  });
}

function findArContractFieldMeta(meta: readonly SearchMeta[]) {
  return (
    meta.find((m) => m.type === "POPUP" && isArContractSearchField(m)) ??
    meta.find((m) => isArContractSearchField(m))
  );
}

function resolvePopupCodeStateKey(metaKey: string): string {
  if (metaKey.endsWith("_CD")) return metaKey;
  const base = metaKey.replace(/_CD$/, "");
  return `${base}_CD`;
}

function readConditionValue(
  getCondition: (key: string) => { value?: string } | undefined,
  ...keys: string[]
): string {
  for (const key of keys) {
    const v = getCondition(key)?.value;
    if (v) return String(v);
  }
  return "";
}

function isShpmCustCdSearchField(m: SearchMeta): boolean {
  if (m.type !== "POPUP") return false;
  const nk = normalizeMetaKey(m.key);
  if (nk.includes("CNTRCT")) return false;
  return nk.includes("CUST_CD");
}

function findShpmCustCdPopupMeta(meta: readonly SearchMeta[]) {
  return meta.find((m) => isShpmCustCdSearchField(m));
}

function getShpmCustCdValue(
  meta: readonly SearchMeta[],
  getCondition: (key: string) => { value?: string } | undefined,
): string {
  const cust = findShpmCustCdPopupMeta(meta);
  if (cust) {
    const codeKey = resolvePopupCodeStateKey(cust.key);
    const dotted = cust.key.replace(/_/g, ".");
    const underscored = cust.key.replace(/\./g, "_");
    return readConditionValue(
      getCondition,
      codeKey,
      cust.key,
      dotted,
      underscored,
      resolvePopupCodeStateKey(dotted),
      resolvePopupCodeStateKey(underscored),
    );
  }
  for (const key of ["SHPM.CUST_CD", "SHPM_CUST_CD", "CUST_CD"]) {
    const v = readConditionValue(
      getCondition,
      resolvePopupCodeStateKey(key),
      key,
      key,
      key.replace(/\./g, "_"),
    );
    if (v) return v;
  }
  return "";
}

function isShpmCustCdSelected(
  meta: readonly SearchMeta[],
  getCondition: (key: string) => { value?: string } | undefined,
): boolean {
  return String(getShpmCustCdValue(meta, getCondition) ?? "").trim() !== "";
}

function buildArContractPopupQuery(
  m: SearchMeta,
  meta: readonly SearchMeta[],
  getCondition: (key: string) => { value?: string } | undefined,
  contractEnabled: boolean,
) {
  if (!isArContractSearchField(m) || !contractEnabled) {
    return { filterCol: "", filterValue: "", extraParams: {} as Record<string, string> };
  }
  const custCd = getShpmCustCdValue(meta, getCondition);
  const sqlProp =
    m.type === "POPUP" ? m.sqlId : m.type === "COMBO" ? m.sqlProp : "";
  const sql = sqlProp.toLowerCase();
  if (sql.includes("custcntrct")) {
    return {
      filterCol: "",
      filterValue: "",
      extraParams: custCd ? { keyParam: custCd, sqlParam1: custCd } : {},
    };
  }
  return { filterCol: "CUST_CD", filterValue: custCd, extraParams: {} };
}

function getArTrfLcdValue(
  meta: readonly SearchMeta[],
  getCondition: (key: string) => { value?: string } | undefined,
): string {
  const fromMeta = findArTrfLcdMeta(meta);
  if (fromMeta) return String(getCondition(fromMeta.key)?.value ?? "");
  for (const m of meta) {
    if (
      m.type === "COMBO" &&
      (m.keyParam === "AR_TRF_LCD" || m.keyParam === "AR_CNTRCT_LCD")
    ) {
      return String(getCondition(m.key)?.value ?? "");
    }
  }
  return String(getCondition("AR_TRF_LCD")?.value ?? "");
}

function getArContractStateKeys(meta: readonly SearchMeta[]) {
  const field = findArContractFieldMeta(meta);
  if (!field) return null;
  if (field.type === "POPUP") {
    const baseKey = field.key.replace(/_CD$/, "");
    return { cdKey: `${baseKey}_CD`, nmKey: popupNameKey(field.key, meta) };
  }
  const nk = normalizeMetaKey(field.key);
  if (nk.endsWith("CNTRCT_CD") || field.key.endsWith("_CD")) {
    const baseKey = field.key.replace(/_CD$/, "");
    return { cdKey: field.key, nmKey: popupNameKey(`${baseKey}_CD`, meta) };
  }
  return { cdKey: field.key, nmKey: `${field.key}_NM` };
}

function isArContractStateKey(
  meta: readonly SearchMeta[],
  stateKey: string,
): boolean {
  for (const m of meta) {
    if (isArContractSearchField(m) && m.key === stateKey) return true;
  }
  const keys = getArContractStateKeys(meta);
  if (keys && (stateKey === keys.cdKey || stateKey === keys.nmKey)) return true;
  const nk = normalizeMetaKey(stateKey);
  if (nk.endsWith("TRF_LCD") || nk.endsWith("CNTRCT_LCD")) return false;
  if (!nk.includes("AR_CNTRCT")) return false;
  return (
    nk.endsWith("_CD") ||
    nk.endsWith("_NM") ||
    nk.endsWith("__NM") ||
    nk.endsWith("CNTRCT_CD") ||
    nk.endsWith("CNTRCT_NM")
  );
}

function listArContractStateKeys(meta: readonly SearchMeta[]): string[] {
  const out = new Set<string>();
  const keys = getArContractStateKeys(meta);
  if (keys) {
    out.add(keys.cdKey);
    out.add(keys.nmKey);
  }
  for (const m of meta) {
    if (!isArContractSearchField(m)) continue;
    if (m.type === "POPUP") {
      const base = m.key.replace(/_CD$/, "");
      out.add(`${base}_CD`);
      out.add(popupNameKey(m.key, meta));
    } else {
      out.add(m.key);
    }
  }
  return [...out];
}

/* ── 매출계약코드 전용 UI (공통 SearchFilter 레이아웃 유지, CUSTOMER 시 disable 만) ── */

function ContractSearchField({
  m,
  meta,
  contractEnabled,
  getCondition,
  updateCondition,
  writeCondition,
}: {
  m: SearchMeta;
  meta: readonly SearchMeta[];
  contractEnabled: boolean;
  getCondition: (key: string) => { value?: string; operator?: string } | undefined;
  updateCondition: UpdateConditionFn;
  writeCondition?: UpdateConditionFn;
}) {
  const { openPopup, closePopup } = usePopup();
  const fieldDisabled = !contractEnabled;
  const required = contractEnabled;
  const write = writeCondition ?? updateCondition;

  const contractKeys = getArContractStateKeys(meta);
  const cdKey = contractKeys?.cdKey ?? resolvePopupCodeStateKey(m.key);
  const nmKey = contractKeys?.nmKey ?? popupNameKey(m.key, meta);
  const curOp = () =>
    (getCondition(cdKey)?.operator ?? getCondition(m.key)?.operator ?? m.condition ?? "equal") as keyof typeof CONDITION_ICON_MAP;

  const disabledClass = fieldDisabled ? "opacity-50 pointer-events-none" : undefined;

  const common = {
    key: m.key,
    label: m.label,
    span: m.span ?? 1,
    required,
    condition: curOp(),
    conditionLocked: m.conditionLocked || fieldDisabled,
    className: disabledClass,
    onConditionChange:
      m.conditionLocked || fieldDisabled
        ? undefined
        : (op: string) => {
            const v = getCondition(m.key)?.value ?? "";
            updateCondition(m.key, v, op as any, m.dataType ?? "STRING");
          },
  };

  if (m.type === "TEXT") {
    return (
      <SearchFilter
        {...common}
        type="TEXT"
        value={getCondition(m.key)?.value ?? ""}
        onChange={(v: string) => {
          if (fieldDisabled) return;
          updateCondition(m.key, v, curOp(), m.dataType ?? "STRING");
        }}
      />
    );
  }

  if (m.type === "COMBO") {
    const custCd = getShpmCustCdValue(meta, getCondition);
    const filteredOptions =
      !fieldDisabled && custCd && custCd !== "ALL"
        ? (m.options ?? []).filter(
            (opt: { CODE: string; CUST_CD?: string }) =>
              opt.CODE === "ALL" || opt.CUST_CD === custCd,
          )
        : (m.options ?? []);
    const comboOptions =
      fieldDisabled || !isShpmCustCdSelected(meta, getCondition) ? [] : filteredOptions;
    const curVal = fieldDisabled ? "" : (getCondition(m.key)?.value ?? "");
    if (
      !fieldDisabled &&
      curVal &&
      curVal !== "ALL" &&
      !filteredOptions.some((opt) => opt.CODE === curVal)
    ) {
      requestAnimationFrame(() =>
        write(m.key, "", curOp(), m.dataType ?? "STRING"),
      );
    }
    return (
      <SearchFilter
        {...common}
        type="COMBO"
        value={curVal}
        options={comboOptions}
        onChange={(v: string) => {
          if (fieldDisabled) return;
          write(m.key, v, curOp(), m.dataType ?? "STRING");
        }}
      />
    );
  }

  if (m.type === "POPUP") {
    const codeVal = getCondition(cdKey)?.value ?? "";
    const nameVal = getCondition(nmKey)?.value ?? "";
    const popupQuery = buildArContractPopupQuery(m, meta, getCondition, contractEnabled);

    const openPickerPopup = (initialCode = "", initialName = "") => {
      if (fieldDisabled) return;
      openPopup({
        title: m.label,
        content: (
          <CommonPopup
            sqlId={m.sqlId}
            onApply={(row: { CODE?: string; code?: string; NAME?: string; name?: string }) => {
              write(
                cdKey,
                String(row?.CODE ?? row?.code ?? ""),
                curOp(),
                m.dataType ?? "STRING",
                "POPUP",
              );
              write(
                nmKey,
                String(row?.NAME ?? row?.name ?? ""),
                curOp(),
                m.dataType ?? "STRING",
                "POPUP",
              );
              closePopup();
            }}
            onClose={closePopup}
            filterCol={popupQuery.filterCol}
            filterValue={popupQuery.filterValue}
            extraParams={popupQuery.extraParams}
            initialCode={initialCode}
            initialName={initialName}
          />
        ),
        width: "2xl",
      });
    };

    return (
      <SearchFilter
        {...common}
        type="POPUP"
        code={codeVal}
        name={nameVal}
        sqlId={m.sqlId}
        onChangeCode={(v: string) => {
          if (fieldDisabled) return;
          write(cdKey, v, curOp(), m.dataType ?? "STRING", "POPUP");
          write(nmKey, "", curOp(), m.dataType ?? "STRING", "POPUP");
        }}
        onChangeName={(v: string) => {
          if (fieldDisabled) return;
          write(nmKey, v, curOp(), m.dataType ?? "STRING", "POPUP");
        }}
        onClickSearch={() => openPickerPopup()}
        onEnterSubmit={(code) => openPickerPopup(code, "")}
      />
    );
  }

  return null;
}

function SearchFields({
  meta,
  getCondition,
  updateCondition,
  writeCondition,
}: {
  meta: readonly SearchMeta[];
  getCondition: ReturnType<typeof useSearchState>["getCondition"];
  updateCondition: UpdateConditionFn;
  writeCondition: UpdateConditionFn;
}) {
  const contractEnabled = getArTrfLcdValue(meta, getCondition) === "CONTRACT";
  const arTrfLcdMeta = findArTrfLcdMeta(meta);
  const custMeta = findShpmCustCdPopupMeta(meta);

  const clearArContract = useCallback(() => {
    const keys = getArContractStateKeys(meta);
    if (!keys) return;
    const op = (getCondition(keys.cdKey)?.operator ?? "equal") as keyof typeof CONDITION_ICON_MAP;
    writeCondition(keys.cdKey, "", op, "STRING", "POPUP");
    writeCondition(keys.nmKey, "", op, "STRING", "POPUP");
  }, [meta, getCondition, writeCondition]);

  const dispatchUpdate = useCallback<UpdateConditionFn>(
    (key, value, operator, dataType, sourceType = "NORMAL") => {
      updateCondition(key, value, operator, dataType, sourceType);
      if (arTrfLcdMeta && key === arTrfLcdMeta.key) clearArContract();
      if (custMeta && sourceType === "POPUP" && value) {
        const cdKey = resolvePopupCodeStateKey(custMeta.key);
        const nmKey = popupNameKey(custMeta.key, meta);
        if (key === cdKey || key === nmKey) clearArContract();
      }
    },
    [arTrfLcdMeta, clearArContract, custMeta, meta, updateCondition],
  );

  return (
    <>
      {meta.map((m) =>
        isArContractSearchField(m) ? (
          <ContractSearchField
            key={m.key}
            m={m}
            meta={meta}
            contractEnabled={contractEnabled}
            getCondition={getCondition}
            updateCondition={updateCondition}
            writeCondition={writeCondition}
          />
        ) : (
          <SearchFieldRenderer
            key={m.key}
            meta={[m]}
            getCondition={getCondition}
            updateCondition={dispatchUpdate}
          />
        ),
      )}
    </>
  );
}

type SearchProps = {
  meta: readonly SearchMeta[];
  onSearchCallback: (data: SearchResult) => void;
  searchRef?: React.MutableRefObject<((page?: number) => void) | null>;
  filtersRef?: React.MutableRefObject<Record<string, unknown>>;
  rawFiltersRef?: React.MutableRefObject<Record<string, string>>;
  pageSize?: number;
  fetchFn: (params: Record<string, unknown>) => Promise<any>;
  layoutToggle?: ReactNode;
  excludes?: readonly ExcludeSpec[];
  computeTotalCount?: (rows: any) => number;
  moduleDefault?: string;
  moduleDefaultParams?: Record<string, unknown>;
  moduleDefaultRemove?: string[];
  moduleDefaultSearchParams?: Record<string, string>;
  paramMode?: ParamMode;
  menuCode?: string;
};

export function SettlementOrderContractSearch(props: SearchProps) {
  const {
    meta: rawMeta,
    onSearchCallback,
    searchRef,
    filtersRef,
    rawFiltersRef,
    pageSize = 20,
    fetchFn,
    layoutToggle,
    excludes,
    computeTotalCount,
    moduleDefault,
    moduleDefaultParams,
    moduleDefaultRemove,
    moduleDefaultSearchParams,
    paramMode,
    menuCode,
  } = props;

  const meta = useMemo(
    () =>
      rawMeta.map((m) =>
        isArContractSearchField(m) ? stripArContractMetaLinks(m) : m,
      ),
    [rawMeta],
  );

  const [open, setOpen] = useState(true);
  const moduleDefaultCacheRef = useRef<Record<string, string> | null>(null);

  const {
    searchState,
    setSearchState,
    getCondition,
    updateCondition,
    handleReset,
    buildInitialSearchState,
  } = useSearchState(meta, moduleDefaultCacheRef);

  const contractEnabled = getArTrfLcdValue(meta, getCondition) === "CONTRACT";
  const contractEnabledRef = useRef(contractEnabled);
  contractEnabledRef.current = contractEnabled;

  const guardedUpdateCondition = useCallback<UpdateConditionFn>(
    (key, value, operator, dataType, sourceType = "NORMAL") => {
      const nextValue = String(value ?? "").trim();
      if (isArContractStateKey(meta, key) && nextValue !== "") {
        if (!contractEnabledRef.current) return;
        if (
          contractEnabledRef.current &&
          sourceType !== "POPUP" &&
          !isShpmCustCdSelected(meta, getCondition)
        ) {
          return;
        }
      }
      updateCondition(key, value, operator, dataType, sourceType);
    },
    [meta, getCondition, updateCondition],
  );

  useEffect(() => {
    if (contractEnabled) return;
    const keys = listArContractStateKeys(meta);
    if (!keys.some((key) => searchState[key]?.value)) return;
    for (const key of keys) {
      const cur = searchState[key];
      if (!cur?.value) continue;
      updateCondition(
        key,
        "",
        (cur.operator ?? "equal") as keyof typeof CONDITION_ICON_MAP,
        cur.dataType ?? "STRING",
        cur.sourceType ?? (key.endsWith("_NM") ? "POPUP" : "NORMAL"),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractEnabled, searchState, meta]);

  useModuleDefault({
    meta,
    moduleDefault,
    moduleDefaultParams,
    moduleDefaultRemove,
    moduleDefaultSearchParams,
    buildInitialSearchState,
    setSearchState,
    moduleDefaultCacheRef,
    searchState,
  });

  const searchCondition = useSearchCondition({ meta, filtersRef, excludes });
  const wrappedFetchFn = useMemo(
    () =>
      excludes?.length
        ? (params: Record<string, unknown>) =>
            fetchFn(searchCondition.transformParams(params))
        : fetchFn,
    [excludes, fetchFn, searchCondition],
  );

  const executeMeta = useMemo(
    () =>
      meta.map((m) =>
        isArContractSearchField(m) ? { ...m, required: contractEnabled } : m,
      ),
    [meta, contractEnabled],
  );

  const searchStateForQuery = useMemo(() => {
    if (contractEnabled) return searchState;
    const stripped = { ...searchState };
    for (const key of listArContractStateKeys(meta)) {
      const cur = stripped[key];
      if (!cur?.value) continue;
      stripped[key] = { ...cur, value: "" };
    }
    return stripped;
  }, [searchState, contractEnabled, meta]);

  const { searching, handleSearch } = useSearchExecute({
    meta: executeMeta,
    searchState: searchStateForQuery,
    fetchFn: wrappedFetchFn,
    onSearchCallback,
    pageSize,
    filtersRef,
    rawFiltersRef,
    excludeKeysRef: searchCondition.excludeKeysRef,
    computeTotalCount,
    searchRef,
    menuCode,
    paramMode,
  });

  return (
    <Card className="shadow-sm rounded-lg">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={`flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] ${open ? "rounded-t-lg" : "rounded-lg"}`}
        >
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-white mt-px" />
            <span className="text-[13px] font-semibold text-white uppercase leading-none">
              조회조건
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            {layoutToggle}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => handleSearch(1)}
              disabled={searching}
              className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
            >
              {searching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Search className="w-3 h-3" />
              )}
              {searching ? Lang.get("LBL_SEARCHING") : Lang.get("LBL_SEARCH")}
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="h-6 px-2 bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[11px] font-semibold"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <CardContent
            onKeyDownCapture={(e) => {
              if (e.key !== "Enter" || e.nativeEvent.isComposing || searching) return;
              if ((e.target as HTMLElement)?.closest?.("[data-popup-field]")) return;
              e.preventDefault();
              e.stopPropagation();
              handleSearch(1);
            }}
            className="p-2 [&:last-child]:pb-2 text-[12px] [&_input]:h-6 [&_input]:px-2 [&_input]:py-0 [&_input]:text-[11px] [&_select]:h-6 [&_[role=combobox]]:h-6 [&_button]:h-6"
          >
            <div className="grid grid-cols-20 gap-x-2 gap-y-1">
              <SearchFields
                meta={meta}
                getCondition={getCondition}
                updateCondition={guardedUpdateCondition}
                writeCondition={updateCondition}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
