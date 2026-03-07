import { apiClient } from "@/app/api/client";

type commonResponse = {
  rows: [];
};

// ✅ 공통 payload 주입 헬퍼
const withSession = (payload: any = {}) => {
  const userId = sessionStorage.getItem("userId");
  const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");
  const REFRESH_TOKEN = sessionStorage.getItem("REFRESH_TOKEN");

  return {
    userId,
    sesUserId: userId,
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    ...payload,
  };
};

export const tenderApi = {
  ////// SEARCH
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      `/openapina/carrier/getDspchList`,
      withSession(payload),
    );
  },

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchStopList",
      withSession(payload),
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchSmsHisList",
      withSession(payload),
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchApSetlList",
      withSession(payload),
    );
  },

  /////// ACTION

  //운송요청수락
  onTenderAccepted(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderAccepted",
      withSession(payload),
    );
  },

  //운송요청거절
  onTenderRejected(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderRejected",
      withSession(payload),
    );
  },

  //지입차 변경
  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeRegVeh",
      withSession(payload),
    );
  },

  //임시용차 변경
  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeTempVeh",
      withSession(payload),
    );
  },

  //모바일가입용차 변경
  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleChange",
      withSession(payload),
    );
  },

  //차량취소
  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleCancel",
      withSession(payload),
    );
  },

  //SMS 전송
  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/sendSMSForAppInstall",
      withSession(payload),
    );
  },

  // 엑셀 관련
  //운송비양식다운로드
  onCarrierRateExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onCarrierRateExcelAll",
      withSession(payload),
    );
  },

  //운송비양식업로드
  gridExcelUpload(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelUpload",
      withSession(payload),
    );
  },

  //엑셀 - 조회된 모든 데이터 다운로드
  gridExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelAll",
      withSession(payload),
    );
  },

  //엑셀 - 보이는 데이터 다운로드
  gridExcel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcel",
      withSession(payload),
    );
  },
};
