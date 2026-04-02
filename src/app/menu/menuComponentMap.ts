import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";
import SearchCondition from "@/views/searchCondition/SearchCondition";
import MenuConfig from "@/views/MenuConfig/MenuConfig";

export const MENU_COMPONENT_MAP = {
  TENDER_RECEIVE: TenderReceiveDispatch,
  SEARCH_CONDITION: SearchCondition,
  MENU_CONFIG: MenuConfig,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
