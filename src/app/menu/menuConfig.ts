import { Map, Truck, Settings2 } from "lucide-react";

export type MenuItem = {
  menuCode: string;
  label: string;
};

export type MenuSection = {
  sectionCode: string;
  title: string;
  icon: any;
  items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    sectionCode: "BASE",
    title: "운송관리",
    icon: Truck,
    items: [
      { menuCode: "TENDER_RECEIVE", label: "운송사요청목록" },
      { menuCode: "TENDER_REQUEST", label: "운송요청" },
    ],
  },
  {
    sectionCode: "TENDER",
    title: "통합관제",
    icon: Map,
    items: [
      { menuCode: "STAT_1", label: "통계1" },
      { menuCode: "STAT_2", label: "통계2" },
      { menuCode: "STAT_3", label: "통계3" },
    ],
  },
  {
    sectionCode: "MEMBER",
    title: "시스템관리",
    icon: Settings2,
    items: [
      { menuCode: "SYS_CONFIG", label: "시스템설정" },
      { menuCode: "SEARCH_CONDITION", label: "조회조건" },
      { menuCode: "MENU_CONFIG", label: "메뉴구성" },
    ],
  },
  // {
  //   sectionCode: "REPORT",
  //   title: "통계/리포트",
  //   icon: BarChart3,
  //   items: [
  // { menuCode: "STAT_1", label: "통계1" },
  // { menuCode: "STAT_2", label: "통계2" },
  // { menuCode: "STAT_3", label: "통계3" },
  // //   ],
  // },
];
