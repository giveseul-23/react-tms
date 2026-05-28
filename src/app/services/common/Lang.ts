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
  // get(key: string): string {
  //   return Lang.data[key] ?? key + "***";
  // },

  /** * 언어팩에서 코드값으로 번역 텍스트 반환
   * @param key 번역 키
   * @param args 플레이스홀더 치환에 사용할 값들 (문자열 또는 배열)
   */
  get(key: string, ...args: (string | string[])[]): string {
    const template = Lang.data[key];

    // 키가 존재하지 않을 때 처리
    if (!template) {
      return key + "***";
    }

    // 가변인자 / 단일 배열 인자 둘 다 지원
    // Lang.get("MSG", "a", "b") / Lang.get("MSG", ["a", "b"]) 동일 동작
    const flat = args.flat() as string[];

    if (flat.length === 0) return template;

    return template.replace(/{(\d+)}/g, (match, index) => {
      const raw = flat[Number(index)];
      if (raw === undefined) return match;
      // 인자 자체가 언어팩 키면 자동 번역, 아니면 그대로 사용
      return Lang.data[raw] ?? raw;
    });
  },
};
