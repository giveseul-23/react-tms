// src/views/lgstgrpOprConfigMst/LgstgrpOprConfigMstModel.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { lgstgrpOprConfigApi } from "@/features/tms/organization/lgstgrpOprConfigMst/LgstgrpOprConfigApi";

export type GridData = {
  rows: any[];
  totalCount: number;
  page: number;
  limit: number;
};

const EMPTY_GRID: GridData = { rows: [], totalCount: 0, page: 1, limit: 20 };

export type ConfigTab = { key: string; label: string };

export function useLgstgrpOprConfigMstModel() {
  // ── 탭 (API에서 동적 로드) ─────────────────────────────────────
  const [configTabs, setConfigTabs] = useState<ConfigTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    lgstgrpOprConfigApi
      .getConfigTypeList()
      .then((res: any) => {
        const rows = res.data?.data?.dsOut ?? res.data?.result ?? [];
        const tabs: ConfigTab[] = rows.map((r: any) => ({
          key: r.CODE ?? r.CONFIG_TP_CD,
          label: r.NAME ?? r.CONFIG_TP_NM ?? r.CODE,
        }));
        setConfigTabs(tabs);
        if (tabs.length > 0 && !activeTab) {
          setActiveTab(tabs[0].key);
        }
      })
      .catch((err) =>
        console.error("[LgstgrpOprConfigMst] getConfigTypeList failed", err),
      );
  }, []);

  // ── 페이징 ─────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState(20);

  // ── Top-left: 플류운영그룹운영설정 ─────────────────────────────
  const [configData, setConfigData] = useState<GridData>(EMPTY_GRID);

  // ── Top-right: 설정상세 ────────────────────────────────────────
  const [detailData, setDetailData] = useState<GridData>(EMPTY_GRID);
  const detailDataRef = useRef<any[]>([]);
  const setDetailDataWithRef = useCallback((updater: any) => {
    setDetailData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      detailDataRef.current = next.rows ?? next;
      return next;
    });
  }, []);

  // ── Bottom-left: 설정코드다국어설정 ────────────────────────────
  const [i18nData, setI18nData] = useState<any[]>([]);
  const i18nDataRef = useRef<any[]>([]);
  const setI18nDataWithRef = useCallback((updater: any) => {
    const update = (prev: any[]) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      i18nDataRef.current = next;
      return next;
    };
    setI18nData(update);
  }, []);

  // ── Bottom-right: 설정상세코드다국어설정 ───────────────────────
  const [detailI18nData, setDetailI18nData] = useState<any[]>([]);
  const detailI18nDataRef = useRef<any[]>([]);
  const setDetailI18nDataWithRef = useCallback((updater: any) => {
    const update = (prev: any[]) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      detailI18nDataRef.current = next;
      return next;
    };
    setDetailI18nData(update);
  }, []);

  // ── 선택 행 ────────────────────────────────────────────────────
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const selectedConfigRef = useRef<any>(null);
  const setSelectedConfigWithRef = useCallback((row: any) => {
    setSelectedConfig(row);
    selectedConfigRef.current = row;
  }, []);

  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const selectedDetailRef = useRef<any>(null);
  const setSelectedDetailWithRef = useCallback((row: any) => {
    setSelectedDetail(row);
    selectedDetailRef.current = row;
  }, []);

  // ── 서브그리드 리셋 ────────────────────────────────────────────
  const resetSubGrids = useCallback(() => {
    setDetailDataWithRef(EMPTY_GRID);
    setI18nDataWithRef([]);
    setDetailI18nDataWithRef([]);
    setSelectedConfigWithRef(null);
    setSelectedDetailWithRef(null);
  }, [
    setDetailDataWithRef,
    setI18nDataWithRef,
    setDetailI18nDataWithRef,
    setSelectedConfigWithRef,
    setSelectedDetailWithRef,
  ]);

  const resetDetailI18n = useCallback(() => {
    setDetailI18nDataWithRef([]);
    setSelectedDetailWithRef(null);
  }, [setDetailI18nDataWithRef, setSelectedDetailWithRef]);

  return {
    // tab
    configTabs,
    activeTab,
    setActiveTab,
    // paging
    pageSize,
    setPageSize,
    // config (top-left)
    configData,
    setConfigData,
    // detail (top-right)
    detailData,
    setDetailData: setDetailDataWithRef,
    detailDataRef,
    // i18n (bottom-left)
    i18nData,
    setI18nData: setI18nDataWithRef,
    i18nDataRef,
    // detail i18n (bottom-right)
    detailI18nData,
    setDetailI18nData: setDetailI18nDataWithRef,
    detailI18nDataRef,
    // selected rows
    selectedConfig,
    setSelectedConfig: setSelectedConfigWithRef,
    selectedConfigRef,
    selectedDetail,
    setSelectedDetail: setSelectedDetailWithRef,
    selectedDetailRef,
    // reset
    resetSubGrids,
    resetDetailI18n,
  };
}

export type LgstgrpOprConfigMstModel = ReturnType<
  typeof useLgstgrpOprConfigMstModel
>;
