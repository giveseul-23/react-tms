import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Tariff";

type CommonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

// dsSave 저장 공용 — params 에 세션/MENU_CD 주입.
const saveDsSave = (url: string, payload: any) => {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    url,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...rest,
      },
    },
  );
};

export const tariffApi = {
  // ── 메인(요율) ──────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/tariffService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  save(payload: any) {
    return saveDsSave(`/tariffService/save`, payload);
  },

  // ── 요율항목(sub01) ─────────────────────────────────────────────
  getChargeInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/tariffService/searchChargeInfoList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveChargeInfo(payload: any) {
    return saveDsSave(`/tariffService/saveChargeInfo`, payload);
  },

  // ── 차량유형(sub02) ─────────────────────────────────────────────
  getVehicleTypeInfoList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/tariffService/searchVehicleTypeInfoList`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  saveVehicleTypeInfo(payload: any) {
    return saveDsSave(`/tariffService/saveVehicleTypeInfo`, payload);
  },

  // ── 요율 엑셀 다운로드 (선택 행 기준, 서버 2단계: prepare → 다운로드) ──
  // 1) downloadTariffPrepare 로 선택 행(dsSave)을 세션에 저장
  // 2) downloadTariff 로 blob 다운로드
  downloadTariffPrepare(rows: any[]) {
    return apiClient.post<{ success?: boolean; msg?: string }>(
      `/tariffService/downloadTariffPrepare`,
      { dsSave: rows },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
        },
      },
    );
  },
  downloadTariff() {
    return apiClient.post(
      `/tariffService/downloadTariff`,
      {},
      {
        params: { MENU_CD: MENU_CODE },
        responseType: "blob",
      },
    );
  },
};
