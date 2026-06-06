"use client";
// 서버 리소스 권한(dsUserMenuAuth) → 컴포넌트 활성/비활성.
// 센차 ExFieldSetSearchArea.loadConditions 의 권한 적용을 React 로 포팅.
//
// 모델: 서버는 사용자에게 해당되는 권한 행(그의 그룹들, USR_GRP_CD 별)을 내려준다.
//   사용자는 그룹이 여러 개일 수 있으므로 resource 별로 OR(합집합) — 한 그룹이라도 부여하면 허용.
//   - byId       : authId 별 권한 플래그(반환 행들의 OR)
//   - controlled : 매트릭스에 등장하는 모든 authId — "권한 통제 대상" 여부
// 적용: 통제 대상(controlled)인데 어느 그룹도 권한을 안 주면 비활성/숨김.
//       매트릭스에 없는 authId(통제 대상 아님)는 제한하지 않는다.
import { createContext, useContext } from "react";

// defAuthProp 고정 순서 — CONCAT_CNFG_VAL 비트0..6 에 1:1 대응.
//   S(조회) E(엑셀) C(저장) U(수정) D(삭제) P(출력) I(추가)
export const AUTH_CODES = ["S", "E", "C", "U", "D", "P", "I"] as const;
export type AuthCode = (typeof AUTH_CODES)[number];
export type AuthFlags = Record<AuthCode, boolean>;

// CONCAT_CNFG_VAL(정수) → 권한 플래그. LSB 부터 비트 → AUTH_CODES 순서 매핑.
export function decodeAuthFlags(concatVal: unknown): AuthFlags {
  const n = parseInt(String(concatVal ?? "0"), 10) || 0;
  const out = {} as AuthFlags;
  AUTH_CODES.forEach((code, i) => {
    out[code] = ((n >> i) & 1) === 1;
  });
  return out;
}

// 여러 그룹의 권한 합집합 — 한 그룹이라도 부여하면 허용 (OR).
export function orAuthFlags(a: AuthFlags, b: AuthFlags): AuthFlags {
  const out = {} as AuthFlags;
  AUTH_CODES.forEach((c) => {
    out[c] = a[c] || b[c];
  });
  return out;
}

// 모든 권한이 0 → 리소스 자체 접근 불가 (센차 configValue == 0).
export function isResourceDenied(flags: AuthFlags | null | undefined): boolean {
  if (!flags) return false;
  return AUTH_CODES.every((c) => !flags[c]);
}

export type AuthMap = Record<string, AuthFlags>; // { [authId]: 내 그룹 flags }

export type MenuAuth = {
  byId: AuthMap; // 내 그룹 권한
  controlled: Set<string>; // 매트릭스에 존재하는 authId 전체
};

const MenuAuthContext = createContext<MenuAuth | null>(null);
export const MenuAuthProvider = MenuAuthContext.Provider;

export type ResourceAccess = {
  /** 권한 통제 대상(매트릭스에 authId 존재). authId 미전달/미존재 → false. */
  controlled: boolean;
  /** 내 그룹 권한 플래그. 없으면 null. */
  flags: AuthFlags | null;
};

export function useResourceAccess(authId?: string): ResourceAccess {
  const ctx = useContext(MenuAuthContext);
  if (!authId || !ctx) return { controlled: false, flags: null };
  return {
    controlled: ctx.controlled.has(authId),
    flags: ctx.byId[authId] ?? null,
  };
}

// 그리드: 통제 대상인데 내 그룹 조회(S) 권한 없으면 비활성.
export function isGridDenied(access: ResourceAccess): boolean {
  return access.controlled && !access.flags?.S;
}

// 메뉴: 통제 대상인데 내 그룹 권한이 전무(행 없음/all-zero)면 숨김.
export function isMenuDenied(access: ResourceAccess): boolean {
  return access.controlled && (!access.flags || isResourceDenied(access.flags));
}
