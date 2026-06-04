import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/app/http/client";
import { commonApi } from "@/app/services/common/commonApi";
import { getSessionFields } from "@/app/services/auth/auth";

// sqlProp 외 임의 키들은 모두 body 에 그대로 spread.
//   { sqlProp, keyParam: "..." }       → { keyParam: "...", ... } 로 전송
//   { sqlProp, CNFG_CD: "..." }        → { CNFG_CD: "...", ... } 로 전송
//   { sqlProp, CNFG_CD, AGRMT_NO }     → 여러 키 조합도 가능
export type CommonStoreSpec =
  | ({ sqlProp: string } & Record<string, any>)
  | Array<Record<string, any>>;

export function useCommonStores(params: Record<string, CommonStoreSpec>) {
  const [stores, setStores] = useState<Record<string, any[]>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionFields = getSessionFields();
        const mapped: Record<string, any[]> = {};

        // 1) 정적 배열: API 호출 없이 바로 주입
        const staticEntries = Object.entries(params).filter(([, v]) =>
          Array.isArray(v),
        ) as [string, Array<Record<string, any>>][];
        staticEntries.forEach(([key, arr]) => {
          mapped[key] = arr;
        });

        // 이하 API 스펙 항목만 처리
        const apiParams = Object.fromEntries(
          Object.entries(params).filter(([, v]) => !Array.isArray(v)),
        ) as Record<string, { sqlProp: string } & Record<string, any>>;

        // sqlProp에 '/'가 포함된 항목: 해당 경로로 개별 호출
        const customEntries = Object.entries(apiParams).filter(([, v]) =>
          v.sqlProp.includes("/"),
        );
        // 나머지: 기존 일괄 호출
        const batchEntries = Object.entries(apiParams).filter(
          ([, v]) => !v.sqlProp.includes("/"),
        );

        // 개별 호출 — sqlProp 외 spec 키는 그대로 body 로 spread
        const customPromises = customEntries.map(async ([key, value]) => {
          const { sqlProp, ...rest } = value;
          const res = await apiClient.post(sqlProp, {
            ...sessionFields,
            ...rest,
          });
          mapped[key] = res?.data?.data?.dsOut ?? res?.data?.data ?? [];
        });

        // 일괄 호출
        let batchPromise: Promise<void> | null = null;
        if (batchEntries.length > 0) {
          batchPromise = (async () => {
            const req = batchEntries.map(([key, value]) => {
              const { sqlProp, keyParam, ...rest } = value;
              return {
                key,
                sqlProp,
                keyParam: keyParam,
                ...rest,
                ...sessionFields,
              };
            });
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

  // ── codeMap 자동 생성 (CODE → NAME) ──────────────────────────
  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  return { stores, codeMap };
}
