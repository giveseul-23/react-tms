import { useEffect, useState } from "react";
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

        const req = Object.entries(params).map(([key, value]) => ({
          key: key,
          sqlProp: value.sqlProp,
          keyParam: value.keyParam ?? value.sqlProp,
          ...sessionFields,
        }));

        const res = await commonApi.fetchComboOptions(req);

        const result = res?.data?.data || [];

        if (result?.success) {
          const mapped: Record<string, any[]> = {};
          Object.keys(params).forEach((key) => {
            mapped[key] = result[key] || [];
          });
          if (!cancelled) setStores(mapped);
        }
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
