import { useEffect, useState } from "react";
import { commonApi } from "@/app/services/common/commonApi";
import { getSessionFields } from "@/app/services/auth/auth";

export function useCommonStores(params: Record<string, any>) {
  const [stores, setStores] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { userId, sesUserId, ACCESS_TOKEN, sesLang } = getSessionFields();

      try {
        const req = Object.values(params).map((p: any) => ({
          sesUserId,
          userId,
          sqlProp: p.sqlProp,
          keyParam: p.keyParam,
          ACCESS_TOKEN,
          sesLang,
        }));

        const res = await commonApi.fetchComboOptions(req);
        const result = res?.data || {};

        const mapped: Record<string, any[]> = {};
        Object.entries(params).forEach(([key, value]: any) => {
          mapped[key] = result[value.keyParam] || [];
        });

        if (!cancelled) setStores(mapped);
      } catch (e) {
        console.error("[useCommonStores]", e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // params는 오브젝트라 JSON.stringify로 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { stores };
}
