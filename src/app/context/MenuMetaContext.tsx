// src/app/context/MenuMetaContext.tsx
//
// 화면(페이지)이 열릴 때 HomePage 가 그 메뉴의 메타정보를 주입한다.
// 사이드바 메뉴 데이터(useDynamicMenu)는 HomePage 가 이미 들고 있으므로,
// 각 화면은 추가 조회 없이 useMenuMeta() 로 자기 메뉴정보를 읽는다.
import { createContext, useContext } from "react";

export type MenuMeta = {
  /** 현재 화면의 메뉴 코드 */
  menuCode: string;
  /** 메뉴명(MENUNAME, 없으면 MENUCODE) — 엑셀 파일명 등에 사용 */
  menuName: string;
  /** 메뉴 표시 라벨 */
  label: string;
};

const EMPTY_MENU_META: MenuMeta = { menuCode: "", menuName: "", label: "" };

const MenuMetaContext = createContext<MenuMeta>(EMPTY_MENU_META);

export const MenuMetaProvider = MenuMetaContext.Provider;

/** 현재 렌더 중인 화면의 메뉴 메타정보. Provider 밖에서는 빈 값. */
export function useMenuMeta(): MenuMeta {
  return useContext(MenuMetaContext);
}
