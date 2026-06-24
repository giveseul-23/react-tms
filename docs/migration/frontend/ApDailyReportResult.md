# ApDailyReportResult 작업 기록

## 화면 정보
- React 경로: `src/features/tms/calculate/vhcunit/dlyresult`
- React View: `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResult.tsx`
- React Controller: `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResultController.tsx`
- React Model: `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResultModel.ts`
- React Api: `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResultApi.ts`
- React Columns: `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResultColumns.tsx`
- Sencha 경로: `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\calculate\vhcunit\dlyresult`
- Sencha View: `ApDailyReportResult.js`
- Sencha Main Grid: `ApDailyReportResultMain.js`
- Sencha Controller: `ApDailyReportResultController.js`
- Sencha Model: `ApDailyReportResultModel.js`

## 현재 알려진 주요 이슈
- `/apDailyReportResultService/search` 호출 시 `CREATION_YN=ALL`이 서버 조건으로 전달되면 Sencha 정상 SQL과 달라진다. `ALL`은 조회 파라미터에서 제외해야 한다.
- `DLVRY_DT_FROM`, `DLVRY_DT_TO`, `CREATION_YN`은 Sencha `setCompToParamExclude(...)` 기준으로 동적 검색조건에서 제외되어야 한다.
- 시작일/종료일은 서버 파라미터 기준 `YYYYMMDD` 형태로 전달되어야 한다.
- Sencha 최초 화면은 `/apSettlMgmtService/searchApStartDay` 기준 AP 시작일을 시작일 조회조건에 표시한다.
- 현재 공통 `SearchFilters` 수정 없이 지정 화면 폴더만 수정하는 조건에서는 입력칸 표시값 자체를 비동기 AP 시작일로 바꾸기 어렵다. 현재 수정은 최초 조회 API 파라미터 보정 수준이다.
- 화면 입력칸 표시까지 Sencha처럼 맞추려면 공통 `SearchFilters`의 승인된 확장 또는 화면별 meta 직접 가공 예외 구조가 필요하다.

## 작업 이력

### 2026-06-23 - 조회 파라미터 누락/오염 확인 및 지정 폴더 내 보정
- 작업 범위:
  - `/apDailyReportResultService/search` 호출 파라미터가 Sencha 정상 호출과 다르게 구성되는 문제를 확인했다.
  - 수정은 사용자 지정 화면 경로인 `src/features/tms/calculate/vhcunit/dlyresult` 내부 파일로 제한했다.
  - 공통 `SearchFilters` 수정은 원복했고, 공통 컴포넌트는 변경하지 않았다.
- 확인한 기준 문서:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/claude/screen-architecture.md`
  - `docs/claude/column-rules.md`
  - `docs/claude/search-style.md`
  - `docs/claude/excel-download.md`
  - `docs/standard-deviations.md`
- 확인한 Sencha 소스:
  - `ApDailyReportResult.js`: north 검색조건 + center 단일 grid, 메뉴 `MENU_DAILY_AP_RESULT`
  - `ApDailyReportResultMain.js`: main grid `authId: MAIN_DAILY_AP_RESULT_GRID`, checkbox multi selection, paging toolbar, 생성/취소 버튼
  - `ApDailyReportResultController.js`: `setModuleDefaultValue(cont, "TMS")`, `searchApStartDay`, `setCompToParamExclude('DLVRY_DT_FROM', 'DLVRY_DT_TO', 'CREATION_YN')`
  - `ApDailyReportResultModel.js`: 조회 URL `/apDailyReportResultService/search`, `creationYn` store
- 비교한 React 참고 화면:
  - `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagementController.tsx`: raw 검색값을 Controller에서 서버 파라미터로 정규화하는 패턴 참고
  - `src/features/tms/calculate/vhcunit/monthapmgmt/ApMonthlyManagementController.tsx`: AP 계열 조회 파라미터 처리 흐름 참고
  - `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagement.tsx`: `AUTH.grids` 및 `DataGrid authId` 연결 패턴 참고
- Sencha 비교 결과:
  - layout: 검색조건 north + main grid center
  - grid reference: `mainGrid`
  - grid authId: `MAIN_DAILY_AP_RESULT_GRID`
  - selection model: checkbox multi
  - toolbar: paging toolbar와 `LBL_DALY_AP_ADD`, `LBL_DALY_AP_DEL`
  - pagination: 있음
  - 조회 URL: `/apDailyReportResultService/search`
  - 생성 URL: `/apDailyReportResultService/createDailyApVehUnit`
  - 취소 URL: `/apDailyReportResultService/cancelDailyApVehUnit`
  - AP 시작일 URL: `/apSettlMgmtService/searchApStartDay`
  - 팝업 호출: 없음
- 원인 분석:
  - 첨부 스카우터 로그 기준 React 호출은 `DLVRY_DT_FROM >= TO_TIMESTAMP(...)`, `DLVRY_DT <= TO_TIMESTAMP(...)`, `CREATION_YN = 'ALL'` 조건이 추가되어 Sencha 정상 SQL과 달랐다.
  - 기존 React 구현은 SearchFilters 공통 파라미터를 그대로 사용하면서 Sencha의 exclude 및 top-level 명시 파라미터 흐름을 충분히 반영하지 못했다.
  - `CREATION_YN` 콤보의 전체값 `ALL`은 조회 조건으로 서버에 전달되면 안 된다.
- 수정 파일과 변경 이유:
  - `ApDailyReportResult.tsx`: Sencha 기준 grid authId `MAIN_DAILY_AP_RESULT_GRID`를 `AUTH.grids.main`으로 선언하고 `DataGrid authId`에 연결했다. `searchProps.excludes`에 `DLVRY_DT_FROM`, `DLVRY_DT_TO`, `CREATION_YN`을 지정했다.
  - `ApDailyReportResultController.tsx`: raw 검색값과 공통 params를 병합해 `DIV_CD`, `LGST_GRP_CD`, `DLVRY_DT_FROM`, `DLVRY_DT_TO`, `CREATION_YN`을 Sencha 기준으로 정규화했다. `CREATION_YN=ALL`은 제거하고 날짜는 `YYYYMMDD`로 보정했다.
  - `ApDailyReportResultController.tsx`: 최초 조회 API 파라미터는 `/apSettlMgmtService/searchApStartDay` 결과를 사용해 AP 시작일로 보정하도록 했다. 단, 화면 입력칸 표시값은 공통 SearchFilters 변경 없이 바꾸지 않았다.
  - `ApDailyReportResultController.tsx`: 엑셀 전체 다운로드도 화면 조회와 동일한 파라미터 보정 로직을 사용하도록 맞췄다.
  - `ApDailyReportResultApi.ts`: 생성/취소 API body를 Sencha `saveRecord` 기준인 `{ dsSave: [...] }` 형태로 정리하고 session/MENU_CD는 params로 유지했다.
- 알려진 미구현/주의사항:
  - 최초 화면의 시작일 입력칸 표시값을 Sencha처럼 AP 시작일로 바꾸는 기능은 현재 지정 폴더만 수정하는 조건에서는 구현하지 않았다.
  - 이 표시값까지 맞추려면 공통 `SearchFilters`의 비동기 초기값 prop 추가 또는 이 화면만 meta를 직접 가공하는 예외 구조가 필요하다.
  - 공통 컴포넌트는 사용자 지시에 따라 수정하지 않았다.
- 검증 결과:
  - `npx.cmd eslint src\features\tms\calculate\vhcunit\dlyresult --ext .ts,.tsx`: 통과
  - `npm.cmd run build`: 통과
  - build 중 Vite dynamic/static import chunk warning은 기존 공통 경고로 확인
- 수동 검증 체크리스트:
  - 조회 시 `/apDailyReportResultService/search` 파라미터에 `CREATION_YN=ALL`이 포함되지 않는지 확인
  - 조회 시 `DLVRY_DT_FROM`, `DLVRY_DT_TO`가 `YYYYMMDD`로 전달되는지 확인
  - 최초 조회 API 파라미터의 시작일이 `/apSettlMgmtService/searchApStartDay` 기준 AP 시작일로 보정되는지 확인
  - 화면 입력칸 표시값은 여전히 공통 기본값일 수 있음을 확인
  - main grid가 checkbox multi selection으로 동작하는지 확인
  - 생성/취소 API request body가 `{ dsSave: [...] }`인지 확인
  - 엑셀 전체 다운로드가 화면 조회와 동일한 보정 파라미터를 사용하는지 확인
- 다음에 먼저 볼 것:
  - SQL에 `CREATION_YN = 'ALL'`이 다시 보이면 `buildSearchParams`의 `allToUndefined`와 `searchProps.excludes`를 먼저 확인한다.
  - SQL에 `DLVRY_DT_FROM >= TO_TIMESTAMP` 같은 동적 조건이 다시 보이면 SearchMeta 실제 key와 `excludes` key 일치 여부를 먼저 확인한다.
  - 최초 화면 입력칸 표시까지 AP 시작일로 맞춰야 하면 공통 `SearchFilters` 확장 승인 여부를 먼저 확인한다.
  - 저장 오류가 발생하면 request body가 `{ dsSave: [...] }`, session/MENU_CD가 params인지 확인한다.
