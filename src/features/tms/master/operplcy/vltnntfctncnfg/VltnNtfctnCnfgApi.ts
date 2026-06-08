import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./VltnNtfctnCnfg";

type commonResponse = {
  rows: [];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();

  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }

  return { ...sessionFields, ...payload };
};

export const vltnNtfctnCnfgApi = {
  ////// SEARCH
  getVltnNtfctnCnfgList(payload: any) {
    return apiClient.post<commonResponse>(
      `/vltnNtfctnCnfgService/searchLgst`,
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  getVltnNtfctnCnfgDetailList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchCnfg",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgChannelList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchChnl",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },
  getVltnNtfctnCnfgTargetList(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchRcvr",
      withSession({
        MENU_CD: MENU_CODE,
        ...payload,
      }),
    );
  },

  ////// SAVE
  // 위반알림설정(sub01) 저장
  saveCnfg(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/saveCnfg",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 알림채널(sub02) 저장
  saveChnl(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/saveChnl",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 알림수신자(sub03) 저장
  saveRcvr(payload: { dsSave: any[] }) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/saveRcvr",
      withSession({ MENU_CD: MENU_CODE, dsSave: payload.dsSave }),
    );
  },
  // 복사 (메인/sub01 공통 — COPYARRAY 포함 행)
  onCopyAll(rows: any[]) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/onCopyAll",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  // 위반템플릿 등록 (TMPLTARRAY 포함 메인행)
  onVltnTmpltRgstr(rows: any[]) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/onVltnTmpltRgstr",
      withSession({ MENU_CD: MENU_CODE, dsSave: rows }),
    );
  },
  // 템플릿(메시지) 수정
  onTmpltUpd(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/onTmpltUpd",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },

  ////// 팝업 검색
  // 위반템플릿등록 팝업 — 위반유형별 기본 템플릿 목록
  searchRgstrPop(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchRgstrPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
  // 사용자등록 팝업 — 사용자 목록
  searchUsrRegiPop(payload: any) {
    return apiClient.post<commonResponse>(
      "/vltnNtfctnCnfgService/searchUsrRegiPop",
      withSession({ MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
