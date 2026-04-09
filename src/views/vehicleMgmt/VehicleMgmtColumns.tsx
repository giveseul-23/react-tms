// src/views/vehicleMgmt/VehicleMgmtColumns.tsx
import { VEH_OP_STS_COLOR_MAP } from "./VehicleMgmtModel";

export type FieldType =
  | "text"
  | "popup"
  | "select"
  | "check"
  | "date"
  | "number";

export type ColumnDef = {
  headerName: string;
  field?: string;
  areaNo?: number; // 폼 그룹 번호
  areaLabel?: string; // 섹션 제목 (areaNo별 첫 컬럼에만 선언)
  fieldType?: FieldType; // 폼 입력 타입
  required?: boolean;
  hide?: boolean; // 그리드에서 숨김
  formHide?: boolean; // 폼에서 숨김
  readOnly?: boolean;
  // popup 타입일 때
  sqlProp?: string;
  nameField?: string; // 코드에 대응하는 명칭 field
  // select 타입일 때
  optionsKey?: string; // codeMap의 key
};

export const AREA_LABELS: Record<number, string> = {
  0: "기본 정보",
  1: "차량 제원",
  2: "차고지 정보",
  3: "운영 설정",
};

export const MAIN_COLUMN_DEFS: ColumnDef[] = [
  { headerName: "No" },
  // ── areaNo: 0 기본 정보 ────────────────────────────────────
  {
    headerName: "차량코드",
    field: "VEH_ID",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "차량번호",
    field: "VEH_NO",
    areaNo: 0,
    fieldType: "text",
    required: true,
  },
  {
    headerName: "디비전코드",
    field: "DIV_CD",
    areaNo: 0,
    fieldType: "popup",
    required: true,
    sqlProp: "selectDivisionCodeName",
    nameField: "DIV_NM",
  },
  {
    headerName: "디비전명",
    field: "DIV_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "물류운영그룹",
    field: "LGST_GRP_CD",
    areaNo: 0,
    fieldType: "popup",
    required: true,
    sqlProp: "selectLogisticsgroupCodeName",
    nameField: "LGST_GRP_NM",
  },
  {
    headerName: "물류운영그룹명",
    field: "LGST_GRP_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "운송협력사코드",
    field: "CARR_CD",
    areaNo: 0,
    fieldType: "popup",
    required: true,
    sqlProp: "selectCarrList",
    nameField: "CARR_NM",
  },
  {
    headerName: "운송협력사명",
    field: "CARR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "지급운송협력사코드",
    field: "PAY_CARR_CD",
    areaNo: 0,
    fieldType: "popup",
    sqlProp: "selectCarrList",
    nameField: "PAY_CARR_NM",
  },
  {
    headerName: "지급운송협력사명",
    field: "PAY_CARR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "운전자코드",
    field: "DRVR_ID",
    areaNo: 0,
    fieldType: "popup",
    required: true,
    sqlProp: "selectDrvrListUserCust",
    nameField: "DRVR_NM",
  },
  {
    headerName: "운전자명",
    field: "DRVR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "보조원코드",
    field: "ASST_ID",
    areaNo: 0,
    fieldType: "popup",
    sqlProp: "selectAsstList",
    nameField: "ASST_NM",
    hide: true,
  },
  {
    headerName: "보조원명",
    field: "ASST_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "정산처리구분",
    field: "AP_PROC_TP",
    areaNo: 0,
    fieldType: "select",
    optionsKey: "apProcTp",
  },
  {
    headerName: "매입정산물류운영그룹",
    field: "PAY_LGST_GRP_CD",
    areaNo: 0,
    fieldType: "popup",
    sqlProp: "selectLogisticsgroupCodeName",
    nameField: "PAY_LGST_GRP_NM",
  },
  {
    headerName: "매입정산물류운영그룹명",
    field: "PAY_LGST_GRP_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },

  // ── areaNo: 1 차량 제원 ────────────────────────────────────
  {
    headerName: "차량유형코드",
    field: "VEH_TP_CD",
    areaNo: 1,
    fieldType: "popup",
    required: true,
    sqlProp: "selectLgstGrpVehTpCd",
    nameField: "VEH_TP_NM",
  },
  {
    headerName: "차량유형명",
    field: "VEH_TP_NM",
    areaNo: 1,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "도로공사차종구분",
    field: "EX_VEH_TCD",
    areaNo: 1,
    fieldType: "select",
    optionsKey: "exVehTcd",
  },
  {
    headerName: "상세차종구분",
    field: "VEH_DTL_TCD",
    areaNo: 1,
    fieldType: "select",
    optionsKey: "vehDtlTcd",
  },
  {
    headerName: "연료유형",
    field: "FUEL_TCD",
    areaNo: 1,
    fieldType: "select",
    required: true,
    optionsKey: "fuelTcd",
  },
  { headerName: "CBM(㎥)", field: "LDNG_VOL", areaNo: 1, fieldType: "number" },
  { headerName: "중량(Kg)", field: "LDNG_WGT", areaNo: 1, fieldType: "number" },
  {
    headerName: "파렛트수량",
    field: "LDNG_PLT_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "롤테이너수량",
    field: "LDNG_RTNR_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "P박스수량",
    field: "LDNG_PBOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "박스수량",
    field: "LDNG_BOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "최대CBM",
    field: "MAX_VOL",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    headerName: "최대중량(Kg)",
    field: "MAX_WGT",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    headerName: "최대파렛트수량",
    field: "MAX_PLT_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "최대롤테이너수량",
    field: "MAX_RTNR_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "CBM적용비율(%)",
    field: "SCALE_VOL",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    headerName: "중량적용비율(%)",
    field: "SCALE_WGT",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    headerName: "공차중량",
    field: "EMPTY_VEH_WGT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "차량길이",
    field: "VEH_LENGTH",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "차량너비",
    field: "VEH_WIDTH",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "차량높이",
    field: "VEH_HEIGHT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    headerName: "제조사",
    field: "MFR_TCD",
    areaNo: 1,
    fieldType: "select",
    optionsKey: "mfrTcd",
  },
  { headerName: "차량명", field: "MODEL", areaNo: 1, fieldType: "text" },
  { headerName: "연식", field: "MFR_YEAR", areaNo: 1, fieldType: "text" },
  {
    headerName: "차량등록일",
    field: "VEH_REG_DT",
    areaNo: 1,
    fieldType: "date",
  },

  // ── areaNo: 2 차고지 정보 ──────────────────────────────────
  {
    headerName: "착지코드",
    field: "LOC_CD",
    areaNo: 2,
    fieldType: "popup",
    required: true,
    sqlProp: "selectLocationCodeName",
    nameField: "LOC_NM",
  },
  {
    headerName: "착지명",
    field: "LOC_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "국가",
    field: "CTRY_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "국가명",
    field: "CTRY_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "주(State)코드",
    field: "STT_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "주(State)명",
    field: "STT_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "도시코드",
    field: "CTY_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "도시명",
    field: "CTY_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "주소1",
    field: "DTL_ADDR1",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "주소2",
    field: "DTL_ADDR2",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    headerName: "위도",
    field: "LAT",
    areaNo: 2,
    fieldType: "number",
    readOnly: true,
  },
  {
    headerName: "경도",
    field: "LON",
    areaNo: 2,
    fieldType: "number",
    readOnly: true,
  },
  {
    headerName: "우편번호",
    field: "ZIP_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },

  // ── areaNo: 3 운영 설정 ────────────────────────────────────
  {
    headerName: "보험료계산여부",
    field: "INSRNC_RATE_CALC_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "자동운송요청",
    field: "AUTO_TNDR_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "자동운송요청수락",
    field: "AUTO_TNDR_ACPT_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "차량구분",
    field: "VEH_OP_TP",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "vehOpTp",
  },
  {
    headerName: "수/배송구분",
    field: "TRANS_TCD",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "transTcd",
  },
  {
    headerName: "고정차량운영여부",
    field: "DED_OP_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "외부시스템배차차량여부",
    field: "EXT_SYS_DSPCH_VEH_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "온도구분",
    field: "VEH_TEMP_TCD",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "vehTempTcd",
  },
  {
    headerName: "채널A온도범위",
    field: "CHN_A_TMPR_RNG_CD",
    areaNo: 3,
    fieldType: "select",
    optionsKey: "vehicleTemperatureRange",
  },
  {
    headerName: "채널B온도범위",
    field: "CHN_B_TMPR_RNG_CD",
    areaNo: 3,
    fieldType: "select",
    optionsKey: "vehicleTemperatureRange",
  },
  {
    headerName: "스케줄링모드",
    field: "SCHED_TCD",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "schedTcd",
  },
  {
    headerName: "첫하차지기준",
    field: "FIRST_DROP_TCD",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "distTcd",
  },
  {
    headerName: "운영상태구분",
    field: "VEH_OPER_SCD",
    areaNo: 3,
    fieldType: "select",
    required: true,
    optionsKey: "vehOperScd",
  },
  {
    headerName: "차량그룹",
    field: "VEH_GRP_CD",
    areaNo: 3,
    fieldType: "select",
    optionsKey: "vehGrpCd",
  },
  {
    headerName: "배차유형",
    field: "VEH_DISPATCH_TP",
    areaNo: 3,
    fieldType: "select",
    optionsKey: "vehDspchTp",
  },
  { headerName: "근무시작", field: "WORK_STIME", areaNo: 3, fieldType: "text" },
  { headerName: "근무종료", field: "WORK_ETIME", areaNo: 3, fieldType: "text" },
  {
    headerName: "계약시작일",
    field: "CONTRACT_SDATE",
    areaNo: 3,
    fieldType: "date",
    required: true,
  },
  {
    headerName: "계약종료일",
    field: "CONTRACT_EDATE",
    areaNo: 3,
    fieldType: "date",
    required: true,
  },
  {
    headerName: "DTG_NO",
    field: "DTG_NO",
    areaNo: 3,
    fieldType: "popup",
    sqlProp: "selectDtgList",
  },
  { headerName: "차량 RFID", field: "RFID", areaNo: 3, fieldType: "text" },
  {
    headerName: "서명필요여부",
    field: "SIGNATURE_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "봉인필요여부",
    field: "SEAL_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "LMO운송차량여부",
    field: "LMO_YN",
    areaNo: 3,
    fieldType: "check",
  },
  {
    headerName: "축산차량등록번호",
    field: "LIVESTOCK_VEHICLE_NO",
    areaNo: 3,
    fieldType: "text",
  },
  { headerName: "휴무요일", field: "OFF_DAYS", areaNo: 3, fieldType: "text" },
  { headerName: "사용자코드1", field: "UDF1", areaNo: 3, fieldType: "text" },
  { headerName: "사용자코드2", field: "UDF2", areaNo: 3, fieldType: "text" },

  // ── 등록/수정 정보 (폼에서 숨김) ──────────────────────────
  {
    headerName: "등록자",
    field: "CRE_USR_ID",
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "등록일시",
    field: "CRE_DTTM",
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "수정자",
    field: "UPD_USR_ID",
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    headerName: "수정일시",
    field: "UPD_DTTM",
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
];

export const MAIN_GRID_COLUMN_DEFS = (
  codeMap: Record<string, Record<string, string>>,
) =>
  MAIN_COLUMN_DEFS.map((col) => {
    if (col.field === "VEH_OPER_SCD") {
      return {
        ...col,
        cellRenderer: (params: any) => {
          const label =
            codeMap.vehOperScd?.[String(params.value)] ?? params.value;
          const cls =
            VEH_OP_STS_COLOR_MAP[String(params.value)] ??
            "bg-gray-100 text-gray-600";
          return (
            <span className={`px-2 py-0.5 rounded-lg text-xs ${cls}`}>
              {label}
            </span>
          );
        },
      };
    }
    return col;
  });
