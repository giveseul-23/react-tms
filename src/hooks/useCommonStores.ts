import { useEffect, useState } from "react";
import { apiClient } from "@/app/http/client";
import { commonApi } from "@/app/services/common/commonApi";
import { getSessionFields } from "@/app/services/auth/auth";

export function useCommonStores(
  params: Record<string, { sqlProp: string; keyParam?: string }>,
) {
  const [stores, setStores] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionFields = getSessionFields();
        const mapped: Record<string, any[]> = {};

        // sqlProp에 '/'가 포함된 항목: 해당 경로로 개별 호출
        const customEntries = Object.entries(params).filter(([, v]) =>
          v.sqlProp.includes("/"),
        );
        // 나머지: 기존 일괄 호출
        const batchEntries = Object.entries(params).filter(
          ([, v]) => !v.sqlProp.includes("/"),
        );

        // 개별 호출
        const customPromises = customEntries.map(async ([key, value]) => {
          const res = await apiClient.post(value.sqlProp, {
            ...sessionFields,
            keyParam: value.keyParam ?? value.sqlProp,
          });
          mapped[key] = res?.data?.data?.dsOut ?? res?.data?.data ?? [];
        });

        // 일괄 호출
        let batchPromise: Promise<void> | null = null;
        if (batchEntries.length > 0) {
          batchPromise = (async () => {
            const req = batchEntries.map(([key, value]) => ({
              key,
              sqlProp: value.sqlProp,
              keyParam: value.keyParam ?? value.sqlProp,
              ...sessionFields,
            }));
            const res = await commonApi.fetchComboOptions(req);
            const result = res?.data?.data || {};
            if (result?.success) {
              batchEntries.forEach(([key]) => {
                mapped[key] = result[key] || [];
              });
            }
          })();
        }

        await Promise.all([...customPromises, batchPromise].filter(Boolean));

        if (!cancelled) setStores(mapped);
      } catch (e) {
        console.error("[useCommonStores]", e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { stores };
}
