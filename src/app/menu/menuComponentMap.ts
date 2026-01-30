import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";
// import VehicleManage from ...
// import MemberList from ...

export const MENU_COMPONENT_MAP = {
  TENDER_RECEIVE: TenderReceiveDispatch,
  // VEHICLE_MANAGE: VehicleManage,
  // MEMBER_LIST: MemberList,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
