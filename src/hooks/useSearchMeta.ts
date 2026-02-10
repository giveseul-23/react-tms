// src/hooks/useSearchMeta.ts
import { useEffect, useState } from "react";
import { commonApi, comboOptRequest } from "@/app/services/common/commonApi";

export function useSearchMeta(baseMeta: readonly SearchMeta[]) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false; // 👈 언마운트 안전장치

    async function load() {
      setLoading(true);

      const userId = sessionStorage.getItem("userId") ?? "";
      const sesUserId = sessionStorage.getItem("sesUserId") ?? "";
      const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN") ?? "";

      const comboMetas = baseMeta.filter(
        (m) => m.type === "combo" && m.sqlProp && m.keyParam,
      );

      // combo가 없으면 그대로 반환
      if (comboMetas.length === 0) {
        if (!cancelled) setMeta([...baseMeta]);
        setLoading(false);
        return;
      }

      // 기본값: 모든 combo 옵션은 빈 배열
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
        }));

        const res = await commonApi.fetchComboOptions(payload);

        const optionMap = res?.data ?? {};

        const resolved = baseMeta.map((m) =>
          m.type === "combo" && m.keyParam
            ? { ...m, options: optionMap[m.keyParam] ?? [] }
            : m,
        );

        if (!cancelled) setMeta(resolved);
      } catch (e) {
        console.error("[useSearchMeta] fetchComboOptions failed", e);

        // ❗ 실패 시에도 UI는 정상 렌더
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
