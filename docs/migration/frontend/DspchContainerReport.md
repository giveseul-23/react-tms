# DspchContainerReport 작업 기록

### 2026-06-29 - 활성 탭 단건 조회
- 수정:
  - 조회 버튼 클릭 시 `DAY`, `LOC`, `VEH` 중 현재 활성 탭의 API만 호출하고 해당 grid에만 결과를 반영하도록 변경했다.
  - 탭을 선택할 때마다 선택한 탭의 API를 호출하도록 변경했다.
  - 모든 탭 조회 payload에 조회조건의 `LGST_GRP_CD`를 명시적으로 포함했다.
- 비교한 React 참고:
  - 공통 `DataGrid`의 controlled `activeTab`과 `onTabChange` 패턴을 사용했으며 공통 컴포넌트는 변경하지 않았다.
- 검증:
  - `npm run build`: 통과. 기존 Vite dynamic/static import 경고만 발생했다.
  - 로컬 ESLint 실행 파일이 없어 대상 폴더 lint는 실행하지 못했다.

## 화면 정보
- React 경로: `src/features/tms/execution/cntrrpt`
- React 파일: `DspchContainerReport.tsx`, `DspchContainerReportController.tsx`, `DspchContainerReportModel.ts`, `DspchContainerReportColumns.tsx`, `DspchContainerReportApi.ts`
- Sencha 경로: `SENCHA_VIEW_ROOT\vc\view\mdl\tms\execution\cntrrpt`
- Sencha 파일: 로컬 `.env.local`에 `SENCHA_VIEW_ROOT`가 없어 이번 작업에서는 직접 확인하지 못함

## 현재 알려진 주요 이슈
- container 수량 컬럼은 물류그룹 기준 `searchLgstGrpCntr` 결과로 동적 생성한다.
- report 조회 row key는 `R1_IN_COUNT`, `R1_OUT_COUNT`처럼 `${containerCode}_IN_COUNT`, `${containerCode}_OUT_COUNT` 형식을 사용한다.
- `D_CNTR_CD`가 `CD_R1`처럼 `CD_` 접두어를 포함해 내려오면 접두어를 제거해 report row key와 맞춘다.
- 물류그룹 코드가 조회조건에서 확인되지 않으면 container 동적 컬럼은 생성되지 않고 P1~P3 팔레트 컬럼만 남는다.

## 작업 이력

### 2026-06-26 - container 수량 컬럼 동적 구성
- 작업 범위:
  - DspchContainerReport의 R1/R2/R3/O1~O5 고정 container 컬럼을 제거하고 물류그룹 container 목록 기반 동적 컬럼으로 변경했다.
  - 일자별/점포별/차량별 3개 탭 모두 같은 container 목록으로 컬럼을 재구성하도록 연결했다.
- 확인한 기준 문서:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/claude/screen-architecture.md`
  - `docs/claude/column-rules.md`
  - `docs/claude/search-style.md`
  - `docs/claude/local-environment.md`
  - `docs/claude/frontend-audit.md`
- 확인한 Sencha 소스:
  - `.env.local`에 `SENCHA_VIEW_ROOT`가 없어 직접 확인하지 못했다.
- 비교한 React 참고 화면:
  - `src/features/tms/execution/cntr2/DspchContainer2Columns.tsx`: container 목록 기반 동적 컬럼 생성과 `D_CNTR_CD` 정규화 방식 참고.
  - `src/features/tms/execution/cntr2/DspchContainer2Controller.tsx`: 조회 전 `searchLgstGrpCntr` 호출 후 columnDefs state 갱신 패턴 참고.
- 원인 분석:
  - 기존 report 컬럼은 R1/R2/R3/O1~O5가 고정 정의되어 있어 물류그룹별 container 구성이 달라져도 화면 컬럼이 따라가지 못했다.
  - report 조회 결과 key는 기존 컬럼 기준으로 `${code}_IN_COUNT`, `${code}_OUT_COUNT` 형식이므로 cntr2의 `CD_${code}_DLVRY_QTY` 형식과는 별도 빌더가 필요했다.
- 수정 파일과 변경 이유:
  - `DspchContainerReportColumns.tsx`: P1~P3 고정 컬럼과 container 동적 컬럼을 분리하고, 3개 그리드용 `build*ColumnDefs(containers)` 함수를 추가했다.
  - `DspchContainerReportApi.ts`: cntr2와 같은 container 목록 조회 API `searchLgstGrpCntr`를 추가했다.
  - `DspchContainerReportController.tsx`: 조회/엑셀 전체 다운로드 전에 물류그룹 container 목록을 조회해 main/sub01/sub02 columnDefs state를 갱신하도록 변경했다.
  - `DspchContainerReport.tsx`: 고정 컬럼 상수 대신 Controller의 동적 columnDefs를 각 탭 DataGrid에 전달하도록 변경했다.
- 알려진 미구현/주의사항:
  - Sencha 원본은 로컬 경로 미설정으로 직접 비교하지 못했다.
  - 실제 서버의 report row key가 `${code}_IN_COUNT`/`${code}_OUT_COUNT`인지 운영 데이터로 수동 확인이 필요하다.
- 검증 결과:
  - `rg "QTY_GROUPS|R1_IN_COUNT|O5_OUT_COUNT" src\features\tms\execution\cntrrpt`: 고정 container 컬럼 참조 없음.
  - `npm run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고로 빌드 실패는 아님.
  - `npx eslint src\features\tms\execution\cntrrpt --ext .ts,.tsx`: 실패. 최초 실행은 npm 캐시/레지스트리 접근 권한 오류, 권한 승인 후 재실행은 `@eslint/js` 모듈을 찾지 못해 중단됨.
- 수동 검증 체크리스트:
  - 물류그룹 선택 후 조회 시 해당 물류그룹 container 컬럼만 표시되는지 확인.
  - container 코드 R1/O1/O5 등이 내려올 때 `R1_IN_COUNT`, `O1_OUT_COUNT` 값이 셀에 표시되는지 확인.
  - 일자별/점포별/차량별 탭 모두 같은 동적 container 컬럼 구성을 사용하는지 확인.
  - 각 탭 엑셀 전체 다운로드 시 동적 컬럼 헤더와 데이터가 현재 조회조건 기준으로 맞는지 확인.
- 다음에 먼저 볼 것:
  - `searchLgstGrpCntr` 응답의 `D_CNTR_CD`와 report 조회 row key prefix가 다른 경우 `buildContainerQtyColumnDefs`의 field 생성 규칙을 먼저 확인한다.

### 2026-06-26 - PALLET_QTY_GROUPS 제거
- 작업 범위:
  - 사용자 지시에 따라 P1/P2/P3 고정 팔레트 그룹도 제거했다.
  - report 수량 컬럼은 오직 `searchLgstGrpCntr` container 목록 기반으로만 생성한다.
- 수정 파일과 변경 이유:
  - `DspchContainerReportColumns.tsx`: `PALLET_QTY_GROUPS`와 `buildQtyGroups`를 제거하고, 3개 그리드 빌더가 `buildContainerQtyColumnDefs(containers)`만 spread하도록 정리했다.
- 검증 결과:
  - `rg "PALLET_QTY_GROUPS|P1_IN_COUNT|P2_IN_COUNT|P3_IN_COUNT|buildQtyGroups" src\features\tms\execution\cntrrpt`: 매칭 없음.
  - `npm run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고로 빌드 실패는 아님.
