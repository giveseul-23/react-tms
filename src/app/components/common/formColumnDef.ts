// 폼/그리드 공용 컬럼 타입 단일 정의.
// FormBodyRenderer 기반 폼 화면(VehicleMgmt, Hipass 등)이 공유한다.
import type { ReactNode } from "react";
import type { ColDef } from "ag-grid-community";

export type FieldType =
  | "text"
  | "popup"
  | "popuser"
  | "select"
  | "check"
  | "date"
  | "time"
  | "number";

// popup/popuser 컬럼의 renderPopup 콜백 인자 — 그리드 injectPopupCell 과 동일 계약.
export type PopupRenderArgs = {
  row: any;
  commit: (patch: Record<string, any>) => void;
  close: () => void;
  callback?: (picked: any) => void;
};

// ag-grid ColDef(+ insertable augmentation) 를 기반으로 headerName/type/field/
// hide/editable/insertable 등은 ColDef 에서 상속하고, ag-grid 에 없는
// 화면(폼) 전용 prop 만 추가한다.
export type ColumnDef = ColDef<any> & {
  areaNo?: number; // 폼 그룹 번호
  areaLabel?: string; // 섹션 제목 (areaNo별 첫 컬럼에만 선언)
  fieldType?: FieldType; // 폼 입력 타입 (type 미지정 시 fallback)
  dateUnit?: "year" | "month" | "day"; // type "date" 단위
  required?: boolean;
  // type "text" 검증
  regex?: RegExp;
  validators?: {
    required?: boolean;
    max?: number;
    min?: number;
    integerLength?: number;
    pointLength?: number;
    regexTp?: string;
  };
  formHide?: boolean; // 폼에서 숨김
  readOnly?: boolean;
  defaultValue?: any; // 신규 행(EDIT_STS:"I") 빈 필드 자동 채움 (column-rules §6.5)
  // popup 타입일 때
  sqlProp?: string;
  nameValue?: string;
  nameField?: string; // 코드에 대응하는 명칭 field
  extraParams?: Record<string, any>; // popup 검색 시 서버로 보낼 추가 파라미터
  // popuser(커스텀 팝업) 타입일 때 — 그리드 injectPopupCell 과 동일 계약
  renderPopup?: (args: PopupRenderArgs) => ReactNode;
  callback?: (args: { picked: any; row: any; commit: (patch: Record<string, any>) => void }) => void;
  popupTitle?: string;
  popupWidth?: string;
  // select 타입일 때
  codeKey?: string; // codeMap의 key
};
