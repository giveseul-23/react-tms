import TenderReceiveDispatch from "@/views/tender/TenderReceiveDispatch";
import SearchCondition from "@/views/searchCondition/SearchCondition";
import Fileexplorerpage from "@/views/Flieexplorerpage/Fileexplorerpage";

export const MENU_COMPONENT_MAP = {
  TENDER_RECEIVE: TenderReceiveDispatch,
  SEARCH_CONDITION: SearchCondition,
  MENU_CONFIG: Fileexplorerpage,
} as const;

export type MenuCode = keyof typeof MENU_COMPONENT_MAP;
