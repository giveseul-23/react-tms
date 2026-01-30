import { Home, Truck, Users, BarChart3 } from "lucide-react";

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
    title: "기본관리",
    icon: Home,
    items: [
      { menuCode: "SYS_CONFIG", label: "시스템설정" },
      { menuCode: "VEHICLE_MANAGE", label: "차량관리" },
      { menuCode: "DRIVER_MANAGE", label: "운전자관리" },
    ],
  },
  {
    sectionCode: "TENDER",
    title: "운송협력사",
    icon: Truck,
    items: [
      { menuCode: "TENDER_RECEIVE", label: "운송사요청목록" },
      { menuCode: "TENDER_REQUEST", label: "운송요청" },
    ],
  },
  {
    sectionCode: "MEMBER",
    title: "회원관리",
    icon: Users,
    items: [
      { menuCode: "MEMBER_LIST", label: "회원목록조회" },
      { menuCode: "MEMBER_GRADE", label: "회원등급관리" },
      { menuCode: "MEMBER_STATS", label: "회원통계" },
    ],
  },
  {
    sectionCode: "REPORT",
    title: "통계/리포트",
    icon: BarChart3,
    items: [
      { menuCode: "STAT_1", label: "통계1" },
      { menuCode: "STAT_2", label: "통계2" },
      { menuCode: "STAT_3", label: "통계3" },
    ],
  },
];
