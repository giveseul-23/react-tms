import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { MENU_CODE } from "./CreateDispatch";

type CommonResponse = {
  data?: { dsOut?: any[] };
  result?: any[];
};

const withSession = (payload: any = {}) => {
  const sessionFields = getSessionFields();
  if (Array.isArray(payload)) {
    return payload.map((item) => ({ ...sessionFields, ...item }));
  }
  return { ...sessionFields, ...payload };
};

const post = (url: string, payload: any) =>
  apiClient.post<CommonResponse>(url, withSession({ MENU_CD: MENU_CODE, ...payload }));

export const createDispatchApi = {
  // 메인/상세 조회
  search(payload: any) {
    return post("/createDispatchService/search", payload);
  },
  searchDetail(payload: any) {
    return post("/createDispatchService/searchDetail", payload);
  },

  // 운송요청일변경 / 고정경로배차 / 택배배차 / 수기배차 저장 (메인행 dsSave)
  saveChangeDeliveryDate(payload: any) {
    return post("/createDispatchService/saveChangeDeliveryDate", payload);
  },
  saveItineraryPlan(payload: any) {
    return post("/createDispatchService/saveItineraryPlan", payload);
  },
  saveCreateItineraryGroupDispatch(payload: any) {
    return post("/dispatchPlanAdService/saveCreateItineraryGroupDispatch", payload);
  },
  saveParcelPlan(payload: any) {
    return post("/createDispatchService/saveParcelPlan", payload);
  },
  saveManualPlan(payload: any) {
    return post("/createDispatchService/saveManualPlan", payload);
  },

  // 주문병합 / 라인분할 / 수량분할
  saveMergeShipment(payload: any) {
    return post("/createDispatchService/saveMergeShipment", payload);
  },
  saveSplitShipmentLine(payload: any) {
    return post("/createDispatchService/saveSplitShipmentLine", payload);
  },
  saveSplitShipmentQty(payload: any) {
    return post("/createDispatchService/saveSplitShipmentQty", payload);
  },

  // 주문이관 / 출발지변경 / 배송처변경 (receiveShipmentManagementService 사용)
  saveShipmentTransfer(payload: any) {
    return post("/receiveShipmentManagementService/saveShipmentTransfer", payload);
  },
  saveChangeShipFrom(payload: any) {
    return post("/receiveShipmentManagementService/saveChangeShipFrom", payload);
  },
  saveChangeShipTo(payload: any) {
    return post("/receiveShipmentManagementService/saveChangeShipTo", payload);
  },

  // 팝업 조회
  searchItineraryPop(payload: any) {
    return post("/itineraryService/searchItineraryPop", payload);
  },
  searchVehiclePop(payload: any) {
    return post("/vehicleService/searchVehiclePop", payload);
  },
};
