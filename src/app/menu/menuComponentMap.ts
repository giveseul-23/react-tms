import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";
import SearchCondition from "@/views/searchCondition/SearchCondition";
// import VehicleManage from ...
// import MemberList from ...

export const MENU_COMPONENT_MAP = {
  TENDER_RECEIVE: TenderReceiveDispatch,
  SEARCH_CONDITION: SearchCondition,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
