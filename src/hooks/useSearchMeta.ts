// src/hooks/useSearchMeta.ts
import { useEffect, useState } from "react";
import { fetchComboOptions } from "@/app/services/common/commonAPi";

export function useSearchMeta(baseMeta: readonly SearchMeta[]) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const optionSources = Array.from(
        new Set(
          baseMeta
            .filter((m) => m.type === "combo" && m.optionSource)
            .map((m) => m.optionSource!),
        ),
      );

      if (optionSources.length === 0) {
        setMeta([...baseMeta]);
        setLoading(false);
        return;
      }

      const optionMap = await fetchComboOptions(optionSources);

      const resolved = baseMeta.map((m) =>
        m.type === "combo" && m.optionSource
          ? { ...m, options: optionMap[m.optionSource] ?? [] }
          : m,
      );

      setMeta(resolved);
      setLoading(false);
    }

    load();
  }, [baseMeta]);

  return { meta, loading };
}
