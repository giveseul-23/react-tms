import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./RegisterSettlProductQty";

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

// dsSave 패턴 저장 (납품일등록취소 / 저장 공용)
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/registerSettlProductQtyService/${url}`,
    { dsSave },
    {
      params: {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        ...rest,
      },
    },
  );
}

export const registerSettlProductQtyApi = {
  // 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/registerSettlProductQtyService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 납품일 등록 — 조회조건 params 만 전송 (dsSave 없음)
  registerDeliveryDate(payload: any) {
    return apiClient.post<CommonResponse>(
      `/registerSettlProductQtyService/registerDeliveryDate`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 납품일 등록 취소
  cancelRegisterDeliveryDate(payload: any) {
    return postSave("cancelRegisterDeliveryDate", payload);
  },
  // (실)납품일/수량 저장
  saveItmUomValue(payload: any) {
    return postSave("saveItmUomValue", payload);
  },
};
