import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./Notice";

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
    `/noticeMgmtService/${url}`,
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

export const noticeApi = {
  // 공지 조회
  getList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/search`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 공지대상차량 조회
  getTargetDriverList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/searchNotiTargetDriver`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 공지 저장
  save(payload: any) {
    return postSave("saveNotice", payload);
  },
  // 공지대상차량(기사) 저장
  saveTargetDriver(payload: any) {
    return postSave("saveNoticeTargetDrvr", payload);
  },
  // 첨부 이미지 삭제
  deleteFile(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/deleteFile`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 첨부 이미지 다운로드 (binary)
  downloadFile(payload: any) {
    return apiClient.post(`/noticeMgmtService/downloadFile`, withSession({ MENU_CD: MENU_CODE, ...payload }), {
      responseType: "blob",
    });
  },
  // 첨부 이미지 업로드 (multipart)
  uploadImgFile(formData: FormData) {
    return apiClient.post<CommonResponse>(`/noticeMgmtService/uploadImgFile`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── 차량선택 팝업 — 3탭(전체/고정·자차/외부용차) 조회 ──────────────
  getTargetAllDriver(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/searchTargetAllDriver`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  getTargetDediDriver(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/searchTargetDediDriver`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  getTargetConDriver(payload: any) {
    return apiClient.post<CommonResponse>(
      `/noticeMgmtService/searchTargetConDriver`,
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
