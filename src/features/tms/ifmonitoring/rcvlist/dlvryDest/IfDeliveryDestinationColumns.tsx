// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 컬럼 정의 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureColumns.tsx)
// 2. 각 컬럼 headerName(LBL_*) / field / cellRenderer 를 실제 스펙에 맞게 교체
// 3. audit 컬럼(삭제/상태/생성자/생성일/수정자/수정일) 은 DataGrid 가 자동 추가.
//    부분 토글이 필요하면 View 의 DataGrid 에 audit prop 으로 명시.
//
// 공통 패턴
// - headerName 은 LBL_* 다국어 키 사용 (Lang.get 자동 적용)
// - field 에 "DTTM" 포함 시 DataGrid 가 자동 날짜 포맷팅
// - field 가 "_STS" 로 끝나면 자동 중앙 정렬
// - type: "numeric" / dataType: "number" → 우측 정렬
// - "No" headerName 은 자동 일련번호 + 고정 너비
//
// 편집 가능 여부 (EDIT_STS 기반 자동 변환)
// - insertable: true              → 추가 상태(EDIT_STS:"I") 행에서만 편집
// - editable: true                → 수정 상태(EDIT_STS:"I" 아닌 행)에서만 편집
// - insertable: true, editable: true → 항상 편집 가능
// - 둘 다 미지정/false            → 편집 불가
// → PK 컬럼은 보통 isPrimaryKey:true + insertable:true (추가 시 입력 / 수정 시 잠금)
// ────────────────────────────────────────────────────────────────

import { CommonPopup } from "@/app/components/popup/CommonPopup";

// ── 메인 그리드 컬럼 — audit 자동 (model.bind 가 audit:true spread) ─
// 키 컬럼에 isPrimaryKey:true 표시 — DataGrid 가 첫행 자동선택을 자동 활성화.
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_RECEIVE_DATE", field: "CRE_DTTM" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  {
    type: "text",
    headerName: "LBL_INTERFACE_TCD",
    field: "IF_TCD",
    codeKey: "interfaceType",
  },
  { type: "text", headerName: "LBL_USR_RE_PRCS_YN", field: "RE_PRCS_BY_USR_YN" },
  {
    type: "text",
    headerName: "LBL_PRCS_STS",
    field: "IF_PRCS_STS",
    codeKey: "interfaceStatus",
    statusStyle: "IF_PRCS_STS",
  },
  {
    type: "text",
    headerName: "LBL_PRCS_MSG",
    field: "IF_PRCS_MSG_CD",
    codeKey: "interfaceMessage",
  },
  { type: "text", headerName: "LBL_PRCS_MSG_DESC", field: "IF_PRCS_MSG_DESC" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_CUST_NM_FOR_CENTER", field: "LOC_NM" },
  { type: "text", headerName: "LBL_CUST_GRP_CD", field: "CUST_GRP_CD" },
  { type: "text", headerName: "LBL_ZIP_CODE", field: "ZIP_CD" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS1", field: "DTL_ADDR1" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS2", field: "DTL_ADDR2" },
  { type: "text", headerName: "LBL_ROLE_TYPE", field: "RLTYP" },
  { type: "text", headerName: "LBL_BIZ_REG_CD", field: "BIZ_REG_NO" },
  { type: "text", headerName: "LBL_REPRESENTITIVE", field: "REP_NM" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_TEL_NO", field: "REP_TEL_NO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_MBL_NO", field: "REP_MBL_NO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_FAX", field: "REP_FAX_NO" },
  { type: "text", headerName: "LBL_REPRESENTATIVE_EMAIL", field: "REP_EMAIL" },
  { type: "text", headerName: "LBL_BIZ_TP_CD", field: "BIZ_TP_CD" },
  { type: "text", headerName: "LBL_BIZ_ITEM_CD", field: "BIZ_ITEM_CD" },
  { type: "text", headerName: "LBL_REP_CUST_CD", field: "REP_CUST_CD" },
  { type: "text", headerName: "LBL_SEND_TIME", field: "TRANS_DATE" },
  { type: "text", headerName: "LBL_ISSU_BY", field: "SYSID" },
  { type: "text", headerName: "LBL_CLIENT", field: "CLIENT_CD" },
];

// ── 상세 그리드 컬럼 ───────────────────────────────────────────────
// 공통코드 → 라벨 치환은 컬럼에 codeKey 만 지정하고,
// DataGrid 에 codeMap prop 을 전달하면 자동으로 cellRenderer 가 주입됩니다.
export const ROLE_TYPE_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { type: "text", headerName: "LBL_DEL_FLAG", field: "DEL_FLAG" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_ROLE_TYPE", field: "ROLE_TP" },
];

export const SALES_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { type: "text", headerName: "LBL_DEL_FLAG", field: "DEL_FLAG" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_BIZUNIT_GCD", field: "SALES_ORG_CD" },
  { type: "text", headerName: "LBL_SALES_ORG_NM", field: "SALES_ORG_NM" },
  { type: "text", headerName: "LBL_DISTBUTE_CHANNEL", field: "DIST_CHANNEL" },
  { type: "text", headerName: "LBL_ITEM_LINE", field: "ITEM_LINE" },
  { type: "text", headerName: "LBL_SALES_DIST_CD", field: "SALES_DIST_CD" },
  { type: "text", headerName: "LBL_SALES_DIST_NM", field: "SALES_DIST_NM" },
  { type: "text", headerName: "LBL_CSTMR_GROUP_CD", field: "CSTMR_GROUP_CD" },
  { type: "text", headerName: "LBL_CSTMR_GROUP_NM", field: "CSTMR_GROUP_NM" },
  { type: "text", headerName: "LBL_POB_CD", field: "POB_CD" },
  { type: "text", headerName: "LBL_POB_NM", field: "POB_NM" },
  { type: "text", headerName: "LBL_SALES_GRP_CD", field: "SALES_GRP_CD" },
  { type: "text", headerName: "LBL_SALES_GRP_NM", field: "SALES_GRP_NM" },
  { type: "text", headerName: "LBL_DELI_PRTY", field: "DELI_PRTY" },
  { type: "text", headerName: "LBL_DELI_PLANT_CD", field: "DELI_PLANT_CD" },
  { type: "text", headerName: "LBL_BUYER_GRP_CD1", field: "BUYER_GRP_CD1" },
  { type: "text", headerName: "LBL_BUYER_GRP_NM1", field: "BUYER_GRP_NM1" },
  { type: "text", headerName: "LBL_BUYER_GRP_CD2", field: "BUYER_GRP_CD2" },
  { type: "text", headerName: "LBL_BUYER_GRP_NM2", field: "BUYER_GRP_NM2" },
  { type: "text", headerName: "LBL_BUYER_GRP_CD3", field: "BUYER_GRP_CD3" },
  { type: "text", headerName: "LBL_BUYER_GRP_NM3", field: "BUYER_GRP_NM3" },
  { type: "text", headerName: "LBL_PLT_USE_YN", field: "PLT_USE_YN" },
  { type: "text", headerName: "LBL_CUST_ORD_HLD", field: "CUST_ORD_HLD" },
  {
    type: "text",
    headerName: "LBL_LOC_PRIME_TP",
    field: "PRIME_FLAG",
    codeKey: "locPrimeTp",
  },
];

export const ADDR_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { type: "text", headerName: "LBL_DEL_FLAG", field: "DEL_FLAG" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_ADDR_TYPE", field: "ADR_KIND" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS1", field: "CITY1" },
  { type: "text", headerName: "LBL_DETAIL_ADDRESS2", field: "STREET" },
  { type: "text", headerName: "LBL_ZIP_CODE", field: "POST_CODE1" },
];

export const BANK_ACCOUNT_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { type: "text", headerName: "LBL_DEL_FLAG", field: "DEL_FLAG" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_BANK_ACCOUNT_ID", field: "BANK_ACNT_ID" },
  { type: "text", headerName: "LBL_BANK_KEY", field: "BANK_KEY" },
  { type: "text", headerName: "LBL_BANK_ACNT_HOLDER", field: "ACNT_HOLDER" },
  { type: "text", headerName: "LBL_BANK_ACCOUNT_DESCR", field: "ACNT_DESCR" },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD" },
  { type: "text", headerName: "LBL_INSERT_DATE", field: "CRE_DTTM" },
  { type: "text", headerName: "LBL_UPDATE_PERSON_ID", field: "UPD_USR_ID" },
  { type: "text", headerName: "LBL_UPDATE_TIME", field: "UPD_DTTM" },
];

export const COMPANY_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_INTERFAE_ID", field: "IF_ID" },
  { type: "text", headerName: "LBL_DEL_FLAG", field: "DEL_FLAG" },
  { type: "text", headerName: "LBL_CUST_CD_FOR_CENTER", field: "LOC_CD" },
  { type: "text", headerName: "LBL_CUSTOMER_CODE", field: "CUST_CD" },
  { type: "text", headerName: "LBL_PAYMENT_TERM", field: "PAYMENT_TERM" },
];

// ── 서브 상세 그리드 컬럼 ──────────────────────────────────────────
export const SUB_DETAIL_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "LBL_XXX_CODE", field: "XXX_CD" },
  { type: "text", headerName: "LBL_XXX_NAME", field: "XXX_NM" },
];

// ── [위젯 타입 한 벌] 편집형 컬럼 타입별 예시 ──────────────────────
// 편집 가부는 insertable/editable 로 제어 (column-rules.md §2):
//   둘 다 미지정 → 추가행(EDIT_STS:"I")만 위젯 노출 / editable:true → 기존 행도 편집
export const WIDGET_COLUMN_DEFS = [
  {
    // combo — codeKey 로 옵션·라벨 자동 (ComboCellEditor)
    type: "combo",
    headerName: "LBL_XXX_TCD",
    field: "XXX_TCD",
    codeKey: "xxxTcd",
    insertable: true,
    editable: true,
  },
  {
    // check — Y/N 체크박스 (center 정렬 자동)
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    insertable: true,
    editable: true,
  },
  {
    // date — 데이트피커 (dateUnit: year/month/day)
    type: "date",
    headerName: "LBL_FROM_DT",
    field: "FRM_DT",
    dateUnit: "day",
    insertable: true,
    editable: true,
  },
  {
    // popup — sqlId 로 코드|명 2열 CommonPopup 자동. callback 없으면 CODE 만 field 에 입력
    type: "popup",
    headerName: "LBL_XXX_CODE",
    field: "XXX_CD",
    sqlId: "selectXxxCodeName",
    popupTitle: "LBL_XXX_CODE",
    insertable: true,
    editable: true,
    // 선택 행(picked)을 여러 필드로 commit (코드+코드명 등). 생략 시 CODE 만 자동 입력
    callback: ({ picked, commit }: any) =>
      commit({ XXX_CD: picked.CODE, XXX_NM: picked.NAME }),
  },
  {
    // popuser — 커스텀 팝업 직접 렌더(renderPopup). 의존 컬럼 파라미터 전달·다중 필드 commit
    type: "popuser",
    headerName: "LBL_STATE_CODE",
    field: "STT_CD",
    popupTitle: "LBL_STATE_CODE",
    insertable: true,
    editable: true,
    renderPopup: ({ row, commit, close }: any) => (
      <CommonPopup
        sqlId="selectStateCodeName"
        extraParams={{ keyParam: row?.CTRY_CD ?? "" }}
        onApply={(picked: any) => {
          commit({ STT_CD: picked.CODE, STT_NM: picked.NAME });
          close();
        }}
        onClose={close}
      />
    ),
  },
  {
    // address — "주소찾기" 버튼. 클릭 시 AddressPop → addrFields 매핑대로 다중 필드 write-back.
    // field 없는 액션 컬럼(colId 사용). 결과 필드(ZIP_CD/DTL_ADDR1·2/CTRY·STT·CTY)는 보통 별도 읽기전용 text 컬럼으로 표시.
    type: "address",
    headerName: "LBL_FIND_ADDRESS",
    colId: "ADDR_SEARCH",
    align: "center",
    width: 90,
    insertable: true,
    editable: true,
    // 기본 매핑(CTRY_CD/CTRY_NM/STT_CD/STT_NM/CTY_CD/CTY_NM/ZIP_CD/DTL_ADDR1/DTL_ADDR2)과
    // 다르면 부분 오버라이드: addrFields: { zipCd: "POST_CD", dtlAddr1: "ADDR1" },
  },
];

// ────────────────────────────────────────────────────────────────
// [참고] audit 컬럼 토글 — View 의 DataGrid prop 으로 제어
//
// // 1) 자동 (model.bind 사용 시 default — 모두 ON)
// <DataGrid {...model.bind("main")} columnDefs={MAIN_COLUMN_DEFS} />
//
// // 2) updatePerson 만 끄기
// <DataGrid
//   {...model.bind("main")}
//   columnDefs={MAIN_COLUMN_DEFS}
//   audit={{ updatePerson: false }}
// />
//
// // 3) 여러 필드 끄기
// <DataGrid
//   {...model.bind("main")}
//   columnDefs={MAIN_COLUMN_DEFS}
//   audit={{ updatePerson: false, updateTime: false }}
// />
//
// // 4) audit 자체 끄기
// <DataGrid {...model.bind("main")} columnDefs={MAIN_COLUMN_DEFS} audit={false} />
//
// [참고] width / fieldType 같은 개별 override 는 standardAudit 직접 호출 권장:
//   import { standardAudit } from "@/app/components/grid/columns/commonColumns";
//   const cols = [...MAIN_COLUMN_DEFS, ...standardAudit(model.grids.main.setData, {
//     insertPersonOverrides: { width: 110 },
//   })];
//   <DataGrid columnDefs={cols} audit={false} ... />   // 자동 추가 끄기
// ────────────────────────────────────────────────────────────────

