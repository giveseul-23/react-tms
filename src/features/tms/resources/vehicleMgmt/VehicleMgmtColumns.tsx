import type { ColumnDef } from "@/app/components/common/formColumnDef";
import VehTpCdSearchPop from "./popup/VehTpCdSearchPop";
import { Lang } from "@/app/services/common/Lang";
import { CommonPopup } from "@/app/components/popup/CommonPopup";

export const AREA_LABELS: Record<number, string> = {
  0: Lang.get("LBL_GENERAL"),
  1: Lang.get("LBL_VEHICLE_TYPE"),
  2: Lang.get("LBL_DOMICILE"),
  3: Lang.get("LBL_ETC_SETTING"),
};

export const MAIN_COLUMN_DEFS: ColumnDef[] = [
  { headerName: "No" },
  // ── areaNo: 0 기본 정보 ────────────────────────────────────
  {
    type: "text",
    //차량코드
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //차량번호
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
    areaNo: 0,
    fieldType: "text",
    required: true,
  },
  {
    type: "popup",
    //디비전코드
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    areaNo: 0,
    required: true,
    sqlProp: "selectDivisionCodeName",
    nameValue: "DIV_NM",
    nameField: "LBL_DIVISION_NAME",
  },
  {
    type: "text",
    //디비전명
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "popup",
    //물류운영그룹코드
    headerName: "LBL_LOGISTICS_GROUP",
    field: "LGST_GRP_CD",
    areaNo: 0,
    required: true,
    sqlProp: "selectLogisticsgroupCodeName",
    nameValue: "LGST_GRP_NM",
    nameField: "LBL_LOGISTICS_GROUP_NAME",
    extraParams: { keyParam: "DIV_CD" }, // 선택된 DIV_CD 를 팝업 검색조건으로 전달
  },
  {
    type: "text",
    //물류운영그룹명
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    //협력사
    headerName: "LBL_CARRIER_CODE",
    field: "CARR_CD",
    areaNo: 0,
    fieldType: "popup",
    required: true,
    sqlProp: "selectCarrList",
    nameField: "LBL_CARRIER_NAME",
    nameValue: "CARR_NM",
  },
  {
    type: "text",
    //협력사명
    headerName: "LBL_CARRIER_NAME",
    field: "CARR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "popup",
    //지급운송협력사
    headerName: "LBL_PAY_CARRIER_CODE",
    field: "PAY_CARR_CD",
    areaNo: 0,
    sqlProp: "selectCarrList",
    nameField: "LBL_PAY_CARRIER_NAME",
    nameValue: "PAY_CARR_NM",
  },
  {
    type: "text",
    //지급운송협력사명
    headerName: "LBL_PAY_CARRIER_NAME",
    field: "PAY_CARR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "popup",
    //운전자아이디
    headerName: "LBL_DRIVER_CODE",
    field: "DRVR_ID",
    areaNo: 0,
    required: true,
    sqlProp: "selectDrvrListUserCust",
    nameField: "LBL_DRIVER_NAME",
    nameValue: "DRVR_NM",
  },
  {
    type: "text",
    //운전자명
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    //보조원코드
    headerName: "LBL_HELPER_CODE",
    field: "ASST_ID",
    areaNo: 0,
    fieldType: "popup",
    sqlProp: "selectAsstList",
    nameField: "LBL_HELPER_NAME",
    nameValue: "ASST_NM", //보조원명
    hide: true,
  },
  {
    type: "text",
    //보조원명
    headerName: "LBL_HELPER_NAME",
    field: "ASST_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    //정산처리구분
    headerName: "LBL_AP_CLASSIFICATION",
    field: "AP_PROC_TP",
    areaNo: 0,
    fieldType: "select",
    codeKey: "apProcTp",
    required: true,
  },
  {
    type: "popup",
    // 매입정산물류운영그룹 (코드)
    headerName: "LBL_AP_SETTL_LGST_GRP",
    field: "PAY_LGST_GRP_CD",
    areaNo: 0,
    sqlProp: "selectLogisticsgroupCodeName",
    nameField: "LBL_AP_SETTL_LGST_GRP_NM",
    nameValue: "PAY_LGST_GRP_NM",
  },
  {
    type: "text",
    // 매입정산물류운영그룹명
    headerName: "LBL_AP_SETTL_LGST_GRP_NM",
    field: "PAY_LGST_GRP_NM",
    areaNo: 0,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    //차량구분
    headerName: "LBL_VEHICLE_OPERATION_TYPE",
    field: "VEH_OP_TP",
    areaNo: 0,
    fieldType: "select",
    required: true,
    codeKey: "vehOpTp",
  },
  {
    type: "text",
    // 수/배송 구분
    headerName: "LBL_VEH_TRANS_TCD",
    field: "TRANS_TCD",
    areaNo: 0,
    fieldType: "select",
    required: true,
    codeKey: "transTcd",
  },
  {
    type: "combo",
    //차량온도구분
    headerName: "LBL_TEMPERATURE_CLASSIFICATION",
    field: "VEH_TEMP_TCD",
    areaNo: 0,
    required: true,
    codeKey: "vehTempTcd",
  },
  {
    type: "combo",
    headerName: "채널A온도범위",
    field: "CHN_A_TMPR_RNG_CD",
    areaNo: 0,
    codeKey: "vehicleTemperatureRange",
  },
  {
    type: "combo",
    headerName: "채널B온도범위",
    field: "CHN_B_TMPR_RNG_CD",
    areaNo: 0,
    codeKey: "vehicleTemperatureRange",
  },
  {
    type: "combo",
    //스케줄링모드
    headerName: "LBL_SCHED_MODE",
    field: "SCHED_TCD",
    areaNo: 0,
    required: true,
    codeKey: "schedTcd",
  },
  {
    type: "combo",
    //첫하차지기준
    headerName: "LBL_FIRST_DROP",
    field: "FIRST_DROP_TCD",
    areaNo: 0,
    required: true,
    codeKey: "distTcd",
  },
  {
    type: "check",
    //외부시스템배차차량여부
    headerName: "LBL_EXT_SYS_DSPCH_VEH_YN",
    field: "EXT_SYS_DSPCH_VEH_YN",
    areaNo: 0,
  },
  {
    type: "check",
    //보험료계산여부
    headerName: "LBL_INSRNC_RATE_CALC_YN",
    field: "INSRNC_RATE_CALC_YN",
    areaNo: 0,
  },
  {
    type: "check",
    //자동운송요청
    headerName: "LBL_AUTO_TENDER",
    field: "AUTO_TNDR_YN",
    areaNo: 0,
  },
  {
    type: "check",
    //자동운송요청수락
    headerName: "LBL_AUTO_TENDER_ACCEPTED",
    field: "AUTO_TNDR_ACPT_YN",
    areaNo: 0,
  },
  {
    type: "check",
    //차량구분
    headerName: "LBL_DSPCH_DSPLY_UI_CD",
    field: "DED_OP_YN",
    areaNo: 0,
  },

  // ── areaNo: 1 차량 제원 ────────────────────────────────────
  {
    type: "popuser",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "VEH_TP_CD",
    areaNo: 1,
    required: true,
    nameField: "LBL_VEHICLE_TYPE_NAME", // 명칭 라벨 (표시용)
    nameValue: "VEH_TP_NM", // 명칭 값 필드 (표시용)
    // 조회조건+그리드 팝업 — 선택 시 차량유형 + 제원(areaNo:1) 일괄 세팅
    renderPopup: ({ row, commit, close }) => (
      <VehTpCdSearchPop
        lgstGrpCd={row?.LGST_GRP_CD}
        onConfirm={(patch) => {
          commit(patch);
          close();
        }}
        onClose={close}
      />
    ),
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
    areaNo: 1,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    headerName: "LBL_EX_VEH_TCD",
    field: "EX_VEH_TCD",
    areaNo: 1,
    fieldType: "select",
    codeKey: "exVehTcd",
  },
  {
    type: "text",
    headerName: "LBL_VEH_DTL_TCD",
    field: "VEH_DTL_TCD",
    areaNo: 1,
    fieldType: "select",
    codeKey: "vehDtlTcd",
  },
  {
    type: "text",
    headerName: "LBL_FUEL_TCD",
    field: "FUEL_TCD",
    areaNo: 1,
    fieldType: "select",
    required: true,
    codeKey: "fuelTcd",
  },
  {
    type: "text",
    headerName: "LBL_VOL",
    field: "LDNG_VOL",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_WGT",
    field: "LDNG_WGT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_PALLET_QTY",
    field: "LDNG_PLT_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_ROLLTAINER_QTY",
    field: "LDNG_RTNR_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_PBOX_QTY",
    field: "LDNG_PBOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_BOX_QTY",
    field: "LDNG_BOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY1",
    field: "LDNG_FLEX_QTY1",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY2",
    field: "LDNG_FLEX_QTY2",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY3",
    field: "LDNG_FLEX_QTY3",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY4",
    field: "LDNG_FLEX_QTY4",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_FLEX_QTY5",
    field: "LDNG_FLEX_QTY5",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_VOL",
    field: "MAX_VOL",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_WGT",
    field: "MAX_WGT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_PALLET_QTY",
    field: "MAX_PLT_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_RT_QTY",
    field: "MAX_RTNR_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_PBOX_QTY",
    field: "MAX_PBOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_BOX_QTY",
    field: "MAX_BOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_FLEX_QTY1",
    field: "MAX_FLEX_QTY1",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_FLEX_QTY2",
    field: "MAX_FLEX_QTY2",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_FLEX_QTY3",
    field: "MAX_FLEX_QTY3",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_FLEX_QTY4",
    field: "MAX_FLEX_QTY4",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_MAX_FLEX_QTY5",
    field: "MAX_FLEX_QTY5",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_VOL",
    field: "SCALE_VOL",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_WGT",
    field: "SCALE_WGT",
    areaNo: 1,
    fieldType: "number",
    required: true,
  },
  {
    type: "text",
    headerName: "VEHICLE_MAIN_PALLET_SCALE_FACTOR",
    field: "SCALE_PLT_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "VEHICLE_MAIN_ROLLTAINER_SCALE_FACTOR",
    field: "SCALE_RTNR_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "VEHICLE_MAIN_P_BOX_SCALE_FACTOR",
    field: "SCALE_PBOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "VEHICLE_MAIN_PAPER_BOX_SCALE_FACTOR",
    field: "SCALE_BOX_QTY",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_FLEXQTY1",
    field: "SCALE_FLEX_QTY1",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_FLEXQTY2",
    field: "SCALE_FLEX_QTY2",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_FLEXQTY3",
    field: "SCALE_FLEX_QTY3",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_FLEXQTY4",
    field: "SCALE_FLEX_QTY4",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_SCALE_FACTOR_FLEXQTY5",
    field: "SCALE_FLEX_QTY5",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_EMPTY_VEH_WGT",
    field: "EMPTY_VEH_WGT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_CNTR_WGT",
    field: "CNTR_WGT",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_VEH_LENGTH",
    field: "VEH_LENGTH",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_VEH_WIDTH",
    field: "VEH_WIDTH",
    areaNo: 1,
    fieldType: "number",
  },
  {
    type: "text",
    headerName: "LBL_VEH_HEIGHT",
    field: "VEH_HEIGHT",
    areaNo: 1,
    fieldType: "number",
  },

  // ── areaNo: 2 차고지 정보 ──────────────────────────────────
  {
    type: "popuser",
    // 착지코드
    headerName: "LBL_LOCATION_CODE",
    field: "LOC_CD",
    areaNo: 2,
    required: true,
    sqlProp: "selectLocationCodeName",
    nameField: "LBL_LOCATION_NAME",
    nameValue: "LOC_NM",
    renderPopup: ({ commit, close }) => (
      <CommonPopup
        sqlId="selectLocationCodeName"
        pagination
        onApply={(p) => {
          commit({
            LOC_CD: p.CODE,
            LOC_NM: p.NAME,
            LOC_ID: p.LOC_ID,
            ADDR_ID: p.ADDR_ID,
            CTRY_CD: p.CTRY_CD,
            CTRY_NM: p.CTRY_NM,
            STT_CD: p.STT_CD,
            STT_NM: p.STT_NM,
            CTY_CD: p.CTY_CD,
            CTY_NM: p.CTY_NM,
            DTL_ADDR1: p.DTL_ADDR1,
            DTL_ADDR2: p.DTL_ADDR2,
            LAT: p.LAT,
            LON: p.LON,
            ZIP_CD: p.ZIP_CD,
          });
          close();
        }}
        onClose={close}
      />
    ),
  },
  {
    type: "text",
    // 착지명
    headerName: "LBL_LOCATION_NAME",
    field: "LOC_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
    formHide: true,
  },
  {
    type: "text",
    // 국가
    headerName: "LBL_COUNTRY",
    field: "CTRY_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    // 국가명
    headerName: "LBL_COUNTRY_NAME",
    field: "CTRY_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //시도코드
    headerName: "LBL_STATE_CODE",
    field: "STT_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //시도명
    headerName: "LBL_STATE_NAME",
    field: "STT_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //시군구코드
    headerName: "LBL_CITY_CODE",
    field: "CTY_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //시군구명
    headerName: "LBL_CITY_NAME",
    field: "CTY_NM",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //주소
    headerName: "LBL_ADDR",
    field: "DTL_ADDR1",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //상세주소
    headerName: "LBL_DETAIL_ADDRESS",
    field: "DTL_ADDR2",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },
  {
    type: "text",
    //위도
    headerName: "LBL_LATITUDE",
    field: "LAT",
    areaNo: 2,
    fieldType: "number",
    readOnly: true,
  },
  {
    type: "text",
    //경도
    headerName: "LBL_LONGITUDE",
    field: "LON",
    areaNo: 2,
    fieldType: "number",
    readOnly: true,
  },
  {
    type: "text",
    //우편번호
    headerName: "LBL_ZIP_CODE",
    field: "ZIP_CD",
    areaNo: 2,
    fieldType: "text",
    readOnly: true,
  },

  // ── areaNo: 3 운영 설정 ────────────────────────────────────
  {
    //근무시작시간
    type: "time",
    headerName: "LBL_WORK_STIME",
    field: "WORK_STIME",
    areaNo: 3,
    required: true,
    defaultValue: "000000",
  },
  {
    //근무종료시간
    type: "time",
    headerName: "LBL_WORK_ETIME",
    field: "WORK_ETIME",
    areaNo: 3,
    required: true,
    defaultValue: "235959",
  },
  {
    //계약시작일
    headerName: "LBL_CONTRACT_SDATE",
    field: "CONTRACT_SDATE",
    areaNo: 3,
    type: "date",
    required: true,
  },
  {
    //계약종료일
    headerName: "LBL_CONTRACT_EDATE",
    field: "CONTRACT_EDATE",
    areaNo: 3,
    type: "date",
    required: true,
  },
  {
    type: "combo",
    //운영상태구분
    headerName: "LBL_VEH_OPER_SCD",
    field: "VEH_OPER_SCD",
    areaNo: 3,
    required: true,
    codeKey: "vehOperScd",
  },
  {
    type: "combo",
    //차량그룹
    headerName: "LBL_VEH_GRP",
    field: "VEH_GRP_CD",
    areaNo: 3,
    codeKey: "vehGrpCd",
  },
  {
    type: "combo",
    //배차유형
    headerName: "LBL_VEH_DISPATCH_TP",
    field: "VEH_DISPATCH_TP",
    areaNo: 3,
    codeKey: "vehDspchTp",
  },
  {
    type: "text",
    //차량RFID
    headerName: "LBL_RFID",
    field: "RFID",
    areaNo: 3,
  },
  {
    type: "text",
    //사용자코드1
    headerName: "LBL_UDF1",
    field: "UDF1",
    areaNo: 3,
  },
  {
    type: "text",
    //사용자코드2
    headerName: "LBL_UDF2",
    field: "UDF2",
    areaNo: 3,
  },
  {
    type: "check",
    //서명필요여부
    headerName: "LBL_SIGNATURE_YN",
    field: "SIGNATURE_YN",
    areaNo: 3,
  },
  {
    type: "check",
    //봉인필요여부
    headerName: "LBL_SEAL_YN",
    field: "SEAL_YN",
    areaNo: 3,
  },
  {
    type: "text",
    //축산차량등록번호
    headerName: "LBL_LIVESTOCK_VEHICLE_NO",
    field: "LIVESTOCK_VEHICLE_NO",
    areaNo: 3,
  },
  {
    type: "check",
    //LMO운송차량여부
    headerName: "LBL_LMO_YN",
    field: "LMO_YN",
    areaNo: 3,
  },
  {
    type: "combo",
    //정기휴무일
    headerName: "LBL_OFF_DAYS",
    field: "OFF_DAYS",
    areaNo: 3,
    codeKey: "offDays",
  },

  // ── 등록/수정 정보 (폼에서 숨김) ──────────────────────────
  // {
  //   type: "text",
  //   headerName: "LBL_INSERT_PERSON_ID",
  //   field: "CRE_USR_ID",
  //   fieldType: "text",
  //   readOnly: true,
  //   formHide: true,
  // },
  // {
  //   type: "text",
  //   headerName: "LBL_INSERT_DATE",
  //   field: "CRE_DTTM",
  //   fieldType: "text",
  //   readOnly: true,
  //   formHide: true,
  // },
  // {
  //   type: "text",
  //   headerName: "LBL_UPDATE_PERSON_ID",
  //   field: "UPD_USR_ID",
  //   fieldType: "text",
  //   readOnly: true,
  //   formHide: true,
  // },
  // {
  //   type: "text",
  //   headerName: "LBL_UPDATE_TIME",
  //   field: "UPD_DTTM",
  //   fieldType: "text",
  //   readOnly: true,
  //   formHide: true,
  // },
];
