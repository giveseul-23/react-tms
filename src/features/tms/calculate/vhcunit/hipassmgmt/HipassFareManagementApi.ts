import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./HipassFareManagement";

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

// dsSave 패턴 저장 (확정/확정취소/취소 공용 — 선택 행 rowStatus='U')
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/hipassFareManagementService/${url}`,
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

export const hipassFareManagementApi = {
  // 메인 조회 (하이패스매입정산문서 단위)
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/hipassFareManagementService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 상세 조회 (차량단위)
  getDetailList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/hipassFareManagementService/searchDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 확정
  updateToConfirm(payload: any) {
    return postSave("updateToConfirm", payload);
  },
  // 확정취소
  updateToConfirmCancel(payload: any) {
    return postSave("updateToConfirmCancel", payload);
  },
  // 취소
  updateToCancel(payload: any) {
    return postSave("updateToCancel", payload);
  },
};
