// src/hooks/useSearchMeta.ts
import { useEffect, useState } from "react";
import { commonApi, comboOptRequest } from "@/app/services/common/commonApi";

export function useSearchMeta(baseMeta: readonly SearchMeta[]) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const userId = sessionStorage.getItem("userId") ?? "";
      const sesUserId = sessionStorage.getItem("sesUserId") ?? "";
      const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN") ?? "";
      const sesLang = sessionStorage.getItem("sesLang") ?? "";

      const comboMetas = baseMeta.filter(
        (m) => m.type === "combo" && m.sqlProp && m.keyParam,
      );

      if (comboMetas.length === 0) {
        if (!cancelled) setMeta([...baseMeta]);
        setLoading(false);
        return;
      }

      const emptyResolved = baseMeta.map((m) =>
        m.type === "combo" ? { ...m, options: [] } : m,
      );

      try {
        const payload: comboOptRequest[] = comboMetas.map((m) => ({
          sesUserId,
          userId,
          sqlProp: m.sqlProp!,
          keyParam: m.keyParam!,
          ACCESS_TOKEN,
          sesLang,
        }));

        const res = await commonApi.fetchComboOptions(payload);
        const optionMap = res?.data ?? {};

        const resolved = baseMeta.map((m) => {
          if (m.type !== "combo" || !m.keyParam) return m;

          let options = optionMap[m.keyParam] ?? [];

          /* ---------------------------
             1️⃣ 옵션 필터링
          --------------------------- */

          if (m.filterValues && Array.isArray(m.filterValues)) {
            options = options.filter((opt: any) =>
              m.filterValues.includes(opt.CODE),
            );
          }

          /* ---------------------------
             2️⃣ 전체 옵션 추가
          --------------------------- */

          if (m.includeAll) {
            options = [{ CODE: "ALL", NAME: "모두" }, ...options];
          }

          return {
            ...m,
            options,
          };
        });

        if (!cancelled) setMeta(resolved);
      } catch (e) {
        console.error("[useSearchMeta] fetchComboOptions failed", e);

        if (!cancelled) setMeta(emptyResolved);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [baseMeta]);

  return { meta, loading };
}
