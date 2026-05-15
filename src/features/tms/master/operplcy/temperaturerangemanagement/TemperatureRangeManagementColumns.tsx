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
// ────────────────────────────────────────────────────────────────

// ── 메인 그리드 컬럼 — audit 자동 (model.bind 가 audit:true spread) ─
export const MAIN_COLUMN_DEFS = [
  { headerName: "No" }, // 자동 일련번호
  {
    type: "text",
    headerName: "LBL_TMPR_RNG_CD",
    field: "TMPR_RNG_CD",
    editable: (params: any) => params.data?.EDIT_STS === "I",
  },
  {
    type: "text",
    headerName: "LBL_TMPR_RNG_NM",
    field: "TMPR_RNG_NM",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_TMPR_FRM_VAL",
    field: "TMPR_FRM_VAL",
    editable: true,
  },
  {
    type: "text",
    headerName: "LBL_TMPR_TO_VAL",
    field: "TMPR_TO_VAL",
    editable: true,
  },  
  {
    type: "text",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    editable: true,
  }  ,
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
//   import { standardAudit } from "@/app/components/grid/commonColumns";
//   const cols = [...MAIN_COLUMN_DEFS, ...standardAudit(model.grids.main.setData, {
//     insertPersonOverrides: { width: 110 },
//   })];
//   <DataGrid columnDefs={cols} audit={false} ... />   // 자동 추가 끄기
// ────────────────────────────────────────────────────────────────
