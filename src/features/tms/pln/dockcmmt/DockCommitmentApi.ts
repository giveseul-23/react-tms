import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./DockCommitment";

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

// 서비스 base: /dockCommitmentService (센차 Model proxy + Controller callAjax URL)
export const dockCommitmentApi = {
  // 메인 그리드(배차 목록) 조회 — 센차 mainInfo proxy /searchMain
  getMainList(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockCommitmentService/searchMain`,
      withSession({ module: "TMS", MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 선택 배차의 도크확약 이벤트 조회 — 센차 /search
  searchCommitments(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockCommitmentService/search`,
      withSession({ module: "TMS", MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 도크(스케줄러 리소스/컬럼) 조회 — 센차 /searchDock
  searchDock(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockCommitmentService/searchDock`,
      withSession({ module: "TMS", MENU_CD: MENU_CODE, ...payload }),
    );
  },

  // 도크확약 저장(등록/수정/삭제) — 센차 /save.
  //   센차는 단일 객체(rowStatus 포함)를 그대로 전송 → 동일하게 전달.
  save(payload: any) {
    return apiClient.post<CommonResponse>(
      `/dockCommitmentService/save`,
      withSession({ module: "TMS", MENU_CD: MENU_CODE, ...payload }),
    );
  },
};
