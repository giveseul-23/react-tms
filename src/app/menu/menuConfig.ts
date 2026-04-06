// src/app/menu/menuConfig.ts
import { Map, Truck, Settings2 } from "lucide-react";

export type MenuItem = {
  menuCode: string;
  label: string;
};

// 재귀 중첩 지원
export type MenuNode =
  | { type: "item"; menuCode: string; label: string }
  | { type: "group"; code: string; label: string; icon?: any; children: MenuNode[] };

export type MenuSection = {
  sectionCode: string;
  title: string;
  icon: any;
  items: MenuItem[];       // 기존 호환 (label map 등에서 사용)
  nodes?: MenuNode[];      // 재귀 트리 (동적 메뉴에서 사용)
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    sectionCode: "BASE",
    title: "운송관리",
    icon: Truck,
    items: [
      { menuCode: "TENDER_RECEIVE", label: "운송사요청목록" },
    ],
  },
  {
    sectionCode: "MEMBER",
    title: "시스템관리",
    icon: Settings2,
    items: [
      { menuCode: "SEARCH_CONDITION", label: "조회조건" },
      { menuCode: "MENU_CONFIG", label: "메뉴구성" },
    ],
  },
];
