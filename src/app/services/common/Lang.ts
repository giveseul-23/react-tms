// app/services/common/Lang.ts
//
// 요구사항 6:
//   1) 로그인 시 서버에서 받은 언어팩을 localStorage에 캐시
//   2) 앱 재시작 시 캐시에서 먼저 복원 → 서버 요청 없이 즉시 사용
//   3) apiClient 인터셉터에서 401/세션만료 감지 시 자동 로그아웃 처리
//      (client.ts 의 response interceptor 와 함께 동작)

const LANG_CACHE_KEY = "lang_pack_cache";
const LANG_VERSION_KEY = "lang_pack_version";

export const Lang = {
  data: {} as Record<string, string>,

  /** 언어팩 세팅 + localStorage 캐시 저장 */
  setData(data: Record<string, string>, version?: string) {
    Lang.data = data;

    try {
      localStorage.setItem(LANG_CACHE_KEY, JSON.stringify(data));
      if (version) {
        localStorage.setItem(LANG_VERSION_KEY, version);
      }
    } catch (e) {
      // localStorage 용량 초과 등 무시
      console.warn("[Lang] 캐시 저장 실패", e);
    }
  },

  /**
   * localStorage 캐시에서 언어팩 복원
   * 로그인 후 새로고침 시 서버 재요청 없이 즉시 사용
   * @returns 복원 성공 여부
   */
  restoreFromCache(): boolean {
    try {
      const cached = localStorage.getItem(LANG_CACHE_KEY);
      if (!cached) return false;

      const parsed = JSON.parse(cached) as Record<string, string>;
      if (parsed && typeof parsed === "object") {
        Lang.data = parsed;
        return true;
      }
    } catch (e) {
      console.warn("[Lang] 캐시 복원 실패", e);
    }
    return false;
  },

  /** 캐시된 언어팩 버전 반환 */
  getCachedVersion(): string | null {
    return localStorage.getItem(LANG_VERSION_KEY);
  },

  /** 캐시 초기화 (로그아웃 시 호출) */
  clearCache() {
    localStorage.removeItem(LANG_CACHE_KEY);
    localStorage.removeItem(LANG_VERSION_KEY);
    Lang.data = {};
  },

  /** 언어팩에서 코드값으로 번역 텍스트 반환 */
  get(key: string): string {
    return Lang.data[key] ?? key + "***";
  },
};
