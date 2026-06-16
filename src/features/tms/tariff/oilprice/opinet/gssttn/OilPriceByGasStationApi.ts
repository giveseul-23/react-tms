import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./OilPriceByGasStation";

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

const BASE = "/oilPriceByGasStationService";

export const oilPriceByGasStationApi = {
  // 주유소 목록 (메인 그리드) — 서버 store mainInfo proxy
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchGasStation`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 주유소별 평균유가 (sub01 그리드 + 차트) — 서버 searchAvgOilPriceByGasStation
  getAvgOilPrice(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchAvgOilPriceByGasStation`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 팝업 — 오피넷 주유소 조회 (상호명 검색)
  getGasStationPop(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/searchGasStationPop`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 메인 저장 (상표/사용여부 등) — 서버 saveUrl saveMain (dsSave 패턴)
  saveMain(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `${BASE}/saveMain`,
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          MENU_CD: MENU_CODE,
          ...rest,
        },
      },
    );
  },
  // 오피넷 주유소 등록 (팝업 선택 후) — 서버 onGasSttnRegi
  registerGasStation(payload: any) {
    return apiClient.post<CommonResponse>(
      `${BASE}/onGasSttnRegi`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
