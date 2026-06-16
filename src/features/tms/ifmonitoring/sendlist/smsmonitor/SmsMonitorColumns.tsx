// 그리드 컬럼 정의 (서버 SmsMonitorMain 기준) — 읽기전용 조회 화면.
// audit 컬럼(등록자/수정자/수정일시)은 OMIT.

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  // 대상시스템전송일시
  { type: "datetime", headerName: "LBL_SEND_SMS_DTTM", field: "TRGT_SYS_SND_DTTM", align: "center" },
  // 문자메시지 ID (서버: LBL_SMS + LBL_ID 합성)
  { type: "text", headerName: "LBL_TXTMSG_ID", field: "TXTMSG_ID", align: "center" },
  // 대상시스템전송상태
  {
    type: "combo",
    headerName: "LBL_PRCS_STS",
    field: "TRGT_SYS_SND_STTS",
    codeKey: "interfaceStatus",
    align: "center",
    width: 70,
  },
  // 처리결과메시지
  { type: "text", headerName: "LBL_PRCS_RST_MSG", field: "TRGT_SYS_SND_STTS_MSG_DESC", align: "center" },
  // 수신정보(전화번호) (서버: LBL_RCV + LBL_TEL_NO 합성)
  { type: "text", headerName: "LBL_RCV_TEL_NO", field: "DRVR_HP", align: "center" },
  // 제목
  { type: "text", headerName: "LBL_TITLE", field: "TXT_SUBJECT", align: "center" },
  // 텍스트메시지
  { type: "text", headerName: "TTL_MSG", field: "TXT_MSG", align: "left" },
  { type: "text", headerName: "LBL_DIVISION_CODE", field: "DIV_CD", align: "center" },
  { type: "text", headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", align: "center" },
  { type: "text", headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", align: "center" },
  { type: "text", headerName: "LBL_LOCATION_CODE", field: "LOC_CD", align: "center" },
  { type: "text", headerName: "LBL_LOCATION_NAME", field: "LOC_NM", align: "left" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "left" },
  { type: "text", headerName: "LBL_DRVR_NM", field: "DRVR_NM", align: "center" },
  { type: "text", headerName: "LBL_RECEIVER_NM", field: "RCV_NM", align: "left" },
  // 생성일시
  { type: "datetime", headerName: "LBL_CRE_DTTM", field: "CRE_DTTM", align: "center", width: 150 },
];
