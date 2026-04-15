// src/app/config/menuComponentMap.ts
import TenderReceiveDispatch from "@/features/tms/tender/TenderReceiveDispatch";
import MenuConfig from "@/features/adm/menuConfig/MenuConfig";
import Welcome from "@/views/common/welcome/WelCome";
import VehicleMgmt from "@/features/tms/vehicleMgmt/VehicleMgmt";
import LgstgrpOprConfigMst from "@/features/tms/lgstgrpOprConfigMst/LgstgrpOprConfigMst";
import InTrnstVehCtrl from "@/features/cms/inTrnstVehCtrl/InTrnstVehCtrl";
import DispatchPlan from "@/features/tms/dispatchPlan/DispatchPlan";

export const MENU_COMPONENT_MAP = {
  // 기본 홈 화면
  __WELCOME__: Welcome,

  // 서버 실제 MENUCODE
  MENU_CFG_CNFG: MenuConfig,
  MENU_PLAN_TENDER_RECEIVE: TenderReceiveDispatch,
  MENU_VEHICLE_MGMT: VehicleMgmt,
  MENU_LGSTGRP_OPR_CONFIG_MST: LgstgrpOprConfigMst,
  MENU_IN_TRNST_VEH_CTRL: InTrnstVehCtrl,
  MENU_DISPATCH_PLAN: DispatchPlan,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
