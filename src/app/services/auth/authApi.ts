import { apiClient } from "@/app/api/client";

export type LoginRequest = {
  userId: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

export const authApi = {
  loginMobile({ userId, password }: LoginRequest) {
    return apiClient.post<LoginResponse>("/sessionService/loginMobile", {
      USERID: btoa(userId),
      PASSWORD: btoa(password),
    });
  },
};
