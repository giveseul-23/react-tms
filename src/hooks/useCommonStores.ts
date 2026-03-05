import { useEffect, useState } from "react";
import { commonApi } from "@/app/services/common/commonApi";

export function useCommonStores(params: Record<string, any>) {
  const [stores, setStores] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const userId = sessionStorage.getItem("userId") ?? "";
      const sesUserId = sessionStorage.getItem("sesUserId") ?? "";
      const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN") ?? "";
      const sesLang = sessionStorage.getItem("sesLang") ?? "";

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

        const result = res?.data?.result || {};

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
  }, []);

  return { stores };
}
