import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./PodReport";

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

// dsSave 패턴 저장 공용
function postSave(url: string, payload: any) {
  const { dsSave, ...rest } = payload ?? {};
  return apiClient.post<CommonResponse>(
    `/podService/${url}`,
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

export const podReportApi = {
  // 인수증(POD) 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 인수상품정보 조회 (sub01)
  getPodDetail(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podService/searchPodDetail`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 거절·반품 조회 (sub02)
  getPodRejected(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podService/searchPodRejected`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // POD 이미지 파일목록 조회 (sub03)
  getPodFile(payload: any) {
    return apiClient.post<CommonResponse>(
      `/podService/searchPodFile`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 거절·반품 저장 (서버 saveItemReject)
  saveItemReject(payload: any) {
    return postSave("saveItemReject", payload);
  },
  // 인수증 확인 (서버 confirmPod)
  confirmPod(payload: any) {
    return postSave("confirmPod", payload);
  },
  // POD 파일 삭제 (dsSave: [{ POD_ID, FILE_ID, DEL_YN:"Y" }])
  deletePodFile(payload: any) {
    return postSave("deletePodFile", payload);
  },
  // POD 파일 업로드 (multipart — UPLOAD_FILE + MENU_CD/POD_ID/JSON_READ_PASS)
  uploadPodFile(formData: FormData) {
    return apiClient.post<CommonResponse>(`/podService/uploadPodFile`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  // POD 이미지 파일 다운로드 (binary) — 서버 /fileService/downloadFile (FILE_DMN_TCD:"POD")
  downloadFile(payload: { KEY_ID: string; FILE_ID: string }) {
    return apiClient.get(`/fileService/downloadFile`, {
      params: withSession({ MENU_CD: MENU_CODE, FILE_DMN_TCD: "POD", ...payload }),
      responseType: "blob",
    });
  },
};
