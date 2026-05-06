// 공통 추적 API.
// endpoint는 placeholder — 사용자가 실제 endpoint로 교체.

import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import type { TrackType } from "./trackColumns";

const MENU_CD = "MENU_TRACK";

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

export type TrackListParams = {
  trackType: TrackType;
  DSPCH_NO_LIST: string[];
};

export const trackApi = {
  MENU_CD,

  // TODO: 실제 endpoint로 교체 (trackType별로 분기 필요하면 내부에서 분기)
  getTrackList(params: TrackListParams) {
    return apiClient.post(
      "/trackService/getTrackList",
      withSession({
        MENU_CD,
        ...params,
      }),
    );
  },
};
