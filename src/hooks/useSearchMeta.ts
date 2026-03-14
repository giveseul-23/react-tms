// src/hooks/useSearchMeta.ts
import { useEffect, useRef, useState } from "react";
import { commonApi, comboOptRequest } from "@/app/services/common/commonApi";
import { getSessionFields } from "@/app/services/auth/auth";

export function useSearchMeta(baseMeta: readonly SearchMeta[]) {
  const [meta, setMeta] = useState<SearchMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // baseMeta는 보통 모듈 레벨 const지만, props로 내려올 경우를 위해
  // JSON.stringify로 안정적인 비교
  const baseMetaKey = JSON.stringify(baseMeta.map((m) => m.key));
  const baseMetaRef = useRef(baseMeta);
  baseMetaRef.current = baseMeta;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();
      const currentMeta = baseMetaRef.current;

      const comboMetas = currentMeta.filter(
        (m) => m.type === "combo" && m.sqlProp && m.keyParam,
      );

      if (comboMetas.length === 0) {
        if (!cancelled) {
          setMeta([...currentMeta]);
          setLoading(false);
        }
        return;
      }

      const emptyResolved = currentMeta.map((m) =>
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

        const resolved = currentMeta.map((m) => {
          if (m.type !== "combo" || !m.keyParam) return m;

          let options = optionMap[m.keyParam] ?? [];

          if (m.filterValues && Array.isArray(m.filterValues)) {
            options = options.filter((opt: any) =>
              m.filterValues.includes(opt.CODE),
            );
          }

          if (m.includeAll) {
            options = [{ CODE: "ALL", NAME: "모두" }, ...options];
          }

          return { ...m, options };
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
    return () => { cancelled = true; };
  // baseMetaKey로 안정적 deps 관리 (무한루프 방지)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMetaKey]);

  return { meta, loading };
}
