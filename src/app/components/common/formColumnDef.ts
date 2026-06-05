// 폼/그리드 공용 컬럼 타입 단일 정의.
// FormBodyRenderer 기반 폼 화면(VehicleMgmt, Hipass 등)이 공유한다.
import type { ColDef } from "ag-grid-community";

export type FieldType =
  | "text"
  | "popup"
  | "select"
  | "check"
  | "date"
  | "number";

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
  // popup 타입일 때
  sqlProp?: string;
  nameValue?: string;
  nameField?: string; // 코드에 대응하는 명칭 field
  // select 타입일 때
  codeKey?: string; // codeMap의 key
};
