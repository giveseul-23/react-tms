import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./VehicleDailyBaseRtnMgmt";

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

export const vehicleDailyBaseRtnMgmtApi = {
  // ── 메인 조회 ─────────────────────────────────────────────────
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/vehicleDailyBaseRtnMgmtService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // ── 저장 (추가/수정/삭제 한 번에) — dsSave 패턴 ─────────────────
  // useBaseController.saveGrid 가 { dsSave: [...] } 형태로 호출.
  save(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post<CommonResponse>(
      `/vehicleDailyBaseRtnMgmtService/save`,
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

  // 팝업 차량조회
  getVehicleCodeName(payload: any) {
    return apiClient.post<CommonResponse>(
      `/tmsCommonService/searchVehicleCodeName`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
