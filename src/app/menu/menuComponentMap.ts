// src/app/menu/menuComponentMap.ts
import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";
import SearchCondition from "@/views/searchCondition/SearchCondition";
import MenuConfig from "@/views/MenuConfig/MenuConfig";
import Welcome from "@/views/welcome/WelCome";
import VehicleMgmt from "@/views/vehicleMgmt/VehicleMgmt";
import LgstgrpOprConfigMst from "@/views/lgstgrpOprConfigMst/LgstgrpOprConfigMst";
import InTrnstVehCtrl from "@/views/inTrnstVehCtrl/InTrnstVehCtrl";

export const MENU_COMPONENT_MAP = {
  // 기본 홈 화면
  __WELCOME__: Welcome,

  // 기존 하드코딩 키
  // TENDER_RECEIVE: TenderReceiveDispatch,
  // SEARCH_CONDITION: SearchCondition,
  // MENU_CONFIG: MenuConfig,

  // 서버 실제 MENUCODE
  MENU_CFG_CNFG: MenuConfig,
  MENU_CFG_SRCH_COND: SearchCondition,
  MENU_PLAN_TENDER_RECEIVE: TenderReceiveDispatch,
  MENU_VEHICLE_MGMT: VehicleMgmt,
  MENU_LGSTGRP_OPR_CONFIG_MST: LgstgrpOprConfigMst,
  MENU_IN_TRNST_VEH_CTRL: InTrnstVehCtrl,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
