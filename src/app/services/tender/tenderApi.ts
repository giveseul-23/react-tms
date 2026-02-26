import { apiClient } from "@/app/api/client";

type commonResponse = {
  rows: [];
};

export const tenderApi = {
  ////// SEARCH
  getDispatchList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchList",
      payload,
    );
  },

  getDispatchStopList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDspchStopList",
      payload,
    );
  },

  getDispatchSmsHisList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchSmsHisList",
      payload,
    );
  },

  getDispatchApSetlList(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/getDispatchApSetlList",
      payload,
    );
  },

  /////// ACTION

  //운송요청수락
  onTenderAccepted(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderAccepted",
      payload,
    );
  },

  //운송요청거절
  onTenderRejected(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onTenderRejected",
      payload,
    );
  },

  //지입차 변경
  onChangeRegVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeRegVeh",
      payload,
    );
  },

  //임시용차 변경
  onChangeTempVeh(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onChangeTempVeh",
      payload,
    );
  },

  //모바일가입용차 변경
  onVehicleChange(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleChange",
      payload,
    );
  },

  //차량취소
  onVehicleCancel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onVehicleCancel",
      payload,
    );
  },

  //SMS 전송
  sendSMSForAppInstall(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/sendSMSForAppInstall",
      payload,
    );
  },

  //운송비양식다운로드
  onCarrierRateExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/onCarrierRateExcelAll",
      payload,
    );
  },

  //운송비양식업로드
  gridExcelUpload(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelUpload",
      payload,
    );
  },

  //엑셀 - 조회된 모든 데이터 다운로드
  gridExcelAll(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcelAll",
      payload,
    );
  },

  //엑셀 - 보이는 데이터 다운로드
  gridExcel(payload: any) {
    return apiClient.post<commonResponse>(
      "/openapina/carrier/gridExcel",
      payload,
    );
  },
};
