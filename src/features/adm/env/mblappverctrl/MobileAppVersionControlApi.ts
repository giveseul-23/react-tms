import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";

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

export const MobileAppVersionControlApi = {
  getMobileAppVersionControlList(menuCd: string, payload: any) {
    return apiClient.post<CommonResponse>(
      "/mobileAppVersionControlService/search",
      withSession({ MENU_CD: menuCd, ...payload }),
    );
  },

  saveMobileAppVersionControl(payload: any) {
    const { dsSave, ...rest } = payload ?? {};
    return apiClient.post(
      "/mobileAppVersionControlService/save",
      { dsSave },
      {
        params: {
          ...getSessionFields(),
          ...rest,
        },
      },
    );
  },

  uploadAppInstaller(file: File, params: Record<string, unknown>) {
    return apiClient.postForm(
      "/mobileAppVersionControlService/upload",
      {
        UPLOAD_FILE: file,
      },
      {
        params: {
          ...getSessionFields(),
          ...params,
        },
      },
    );
  },
};
