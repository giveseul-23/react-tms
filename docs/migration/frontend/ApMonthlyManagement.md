# ApMonthlyManagement 작업 기록

## 화면 정보
- React 경로: `src/features/tms/calculate/vhcunit/monthapmgmt`
- React View: `ApMonthlyManagement.tsx`
- React Controller: `ApMonthlyManagementController.tsx`
- React Model: `ApMonthlyManagementModel.ts`
- React Api: `ApMonthlyManagementApi.ts`
- React Columns: `ApMonthlyManagementColumns.tsx`
- React Popup: `popup/CreateMonthlyApPop.tsx`
- Sencha 경로: `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\calculate\vhcunit\monthapmgmt`
- Sencha View: `ApMonthlyManagement.js`
- Sencha Main Grid: `ApMonthlyManagementMain.js`
- Sencha Controller: `ApMonthlyManagementController.js`
- Sencha Model: `ApMonthlyManagementModel.js`
- Sencha Popup: `pop\CreateMonthlyApPop.js`, `pop\CreateMonthlyApPopController.js`
- Java Service/Biz: `ApMonthlyManagementService.java`, `ApMonthlyManagementBiz.java`

## 현재 알려진 주요 이슈
- 저장 API는 Java Service가 `getDataList("dsSave")`를 사용하므로 body가 반드시 `{ dsSave: [...] }` 구조여야 한다.
- 월실적 생성은 Sencha처럼 `getApMonthlyDate` 조회 후 `CreateMonthlyApPop`에서 기간 확인을 거쳐 `/createMonthlyAp`를 호출한다.
- 메인 그리드는 Sencha `authId: MAIN_GRID_AP_MONTHLY_MGMT`, `checkboxmodel MULTI` 기준으로 React `authId`, `rowSelection="multiple"`을 유지해야 한다.
- Sencha의 `BTN_TOLL_MGMT`는 `hidden: true` 상태라 React에는 노출하지 않았다.
- `onReportApMonthly`는 Sencha Controller에 함수가 있으나 toolbar 버튼 연결이 확인되지 않아 React 버튼으로 추가하지 않았다.
- 수기비용 엑셀 업로드/템플릿 다운로드는 Sencha URL 기준으로 연결했으며, 실제 서버 multipart 필드명과 다운로드 endpoint 동작은 화면에서 수동 확인이 필요하다.

## 작업 이력

### 2026-06-23 - Sencha 기준 월실적관리 생성/보정

#### 작업 범위
- 메인 그리드 authId, 다중 선택, 선택 컬럼 폭을 Sencha 기준으로 반영했다.
- 동적 월 실적 컬럼 조회 조건과 SearchFilters 공통 params 보존 방식을 정리했다.
- 월실적 생성 버튼을 Sencha 팝업 흐름으로 구현했다.
- 월실적 취소, 정산확정, 정산확정취소 payload를 Sencha 명시 파라미터 기준으로 보정했다.
- 저장 API body를 `{ dsSave: [...] }`로 보정했다.
- 수기비용 관리 드롭다운에 템플릿 다운로드와 업로드 동작을 연결했다.
- 작업 범위에서 제외: 숨김 상태인 통행료 관리 메뉴, toolbar 연결이 없는 월실적 리포트 출력 버튼.

#### 확인한 기준 문서
- `AGENTS.md`
- `CLAUDE.md`
- `docs/claude/screen-architecture.md`
- `docs/claude/column-rules.md`
- `docs/claude/search-style.md`
- `docs/claude/excel-download.md`
- `docs/claude/popup.md`
- `docs/claude/reference-screens.md`
- `docs/standard-deviations.md`

#### 확인한 Sencha 소스
- `ApMonthlyManagement.js`: north search + center main grid, `authId: MENU_AP_MONTHLY_MGMT`
- `ApMonthlyManagementMain.js`: `authId: MAIN_GRID_AP_MONTHLY_MGMT`, checkbox multi selection, toolbar 버튼 구성, summary bottom
- `ApMonthlyManagementController.js`: dynamic columns, 월실적 생성 팝업, 저장/취소/확정/확정취소/수기비용 엑셀 흐름
- `ApMonthlyManagementModel.js`: `/apMonthlyManagementService/search`, 공통 코드 store
- `pop/CreateMonthlyApPop.js`, `pop/CreateMonthlyApPopController.js`: 생성 기간 입력 및 `/createMonthlyAp` 호출
- `ApMonthlyManagementService.java`: `save`에서 `getDataList("dsSave")` 사용, `getApMonthlyDate`, `createMonthlyAp`, `cancelMonthlyAp`, confirm/cancelConfirm endpoint 확인
- `ApMonthlyManagementBiz.java`: manual rate excel prepare/upload, report 함수 존재 여부 확인

#### 비교한 React 참고 화면
- `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagement.tsx`
- `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagementController.tsx`
- `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagementApi.ts`
- 참고 이유: AP 일실적 화면이 동적 charge 컬럼, 다중 선택, 엑셀 업로드/다운로드, `{ dsSave }` 저장 패턴을 이미 사용한다.

#### Sencha 비교 결과
- 레이아웃: north 검색 영역 + center 단일 메인 grid 구조로 React `GridOnlyPage`가 적합하다.
- grid reference: `mainGrid`
- grid authId: `MAIN_GRID_AP_MONTHLY_MGMT`
- selection model: `selType: checkboxmodel`, `mode: MULTI`, `checkOnly: true`
- toolbar 버튼: 월실적 생성, 월실적 취소, 숨김 통행료 관리, 수기비용 관리, 저장, 정산확정, 정산확정취소, 엑셀
- pagination: `exgridpagecontrol` 존재
- 조회 URL: `/apMonthlyManagementService/search`
- 동적 컬럼 메타 URL: `/apMonthlyManagementService/getUsedChgCd`, `DF_CHG_OP_DIV_TCD: MONTHLY`
- 저장 URL: `/apMonthlyManagementService/save`, body `{ dsSave: [...] }`
- 생성 팝업: `CreateMonthlyApPop`, 저장 시 `/apMonthlyManagementService/createMonthlyAp`
- 주요 payload: `DIV_CD`, `LGST_GRP_CD`, `TO_DTTM`, `AP_DATE`, `FRM_DTTM`, `END_DATE`

#### 원인 분석
- React 기존 생성 버튼은 Sencha에 없는 `/createMonthlyResult`를 호출하고 있어 월실적 생성이 정상 동작하기 어렵다.
- React 기존 저장 API는 payload 객체를 `withSession(payload)`로 직접 body에 넣어 Java Service의 `dsSave` dataset 구조와 맞지 않았다.
- React 기존 메인 그리드는 `authId`와 multi checkbox selection이 빠져 Sencha 권한/선택 동작과 달랐다.
- 수기비용 관리 드롭다운은 빈 items 상태라 Sencha toolbar의 템플릿 다운로드/업로드 기능이 노출되지 않았다.

#### 수정 파일과 변경 이유
- `ApMonthlyManagement.tsx`: Sencha main grid authId와 checkbox multi selection 반영.
- `ApMonthlyManagementController.tsx`: 생성 팝업, Sencha payload builder, 확정취소 `FRM_DTTM` 계산, 수기비용 엑셀 action 연결.
- `ApMonthlyManagementApi.ts`: `createMonthlyAp`, `getApMonthlyDate`, `{ dsSave }` 저장, 수기비용 업로드/다운로드 API 보정.
- `ApMonthlyManagementColumns.tsx`: delete audit 컬럼 제거, status/audit 정보와 숫자 컬럼 정렬/formatter 보정.
- `popup/CreateMonthlyApPop.tsx`: Sencha `CreateMonthlyApPop` 대응 React 팝업 신규 구현.

#### 알려진 미구현/주의사항
- `BTN_TOLL_MGMT`는 Sencha에서 hidden 상태이므로 React에 추가하지 않았다. 향후 노출 필요 시 `aggregationTollRate`, `cancelTollRate`, 통행료 엑셀 업로드/템플릿 다운로드를 별도 연결해야 한다.
- `onReportApMonthly`는 Sencha Controller에 있으나 toolbar 연결이 없어 React에 버튼을 추가하지 않았다.
- 수기비용 업로드는 Sencha `mainGrid.uploadExcel('/apMonthlyManagementService/uploadManualRate', params)` 대응으로 구현했으나 서버의 multipart 필드명 수용 여부를 실제 화면에서 확인해야 한다.

#### 검증 결과
- `npx eslint src\features\tms\calculate\vhcunit\monthapmgmt --ext .ts,.tsx`: PowerShell 실행 정책으로 `npx.ps1` 실행 실패.
- `npx.cmd eslint src\features\tms\calculate\vhcunit\monthapmgmt --ext .ts,.tsx`: 통과.
- `npm.cmd run build`: 통과.
- 빌드 중 Vite dynamic/static import chunk 경고가 출력되었으나 기존 공통 import 구조 경고이며 이번 월실적 화면 변경으로 인한 오류는 아니다.

#### 수동 검증 체크리스트
- 조회 시 동적 월 실적 컬럼이 생성되고 기존 검색조건이 유지되는지 확인.
- 메인 그리드에서 다중 체크 선택이 가능한지 확인.
- 월실적 생성 버튼 클릭 시 기간 팝업이 열리고 저장 시 `/createMonthlyAp`가 호출되는지 확인.
- 월실적 취소 payload에 `DIV_CD`, `LGST_GRP_CD`, `AP_DATE`가 포함되는지 확인.
- 저장 시 request body가 `{ dsSave: [...] }`인지 확인.
- 정산확정취소 payload에 `FRM_DTTM`, `TO_DTTM`이 포함되는지 확인.
- 수기비용 템플릿 다운로드와 업로드가 서버에서 정상 처리되는지 확인.
- 엑셀 전체 다운로드가 조회와 같은 검색 파라미터를 사용하는지 확인.

#### 다음에 먼저 볼 것
- `Expected BEGIN_ARRAY but was BEGIN_OBJECT` 오류 발생 시 `ApMonthlyManagementApi.save`의 `{ dsSave }` body 유지 여부 확인.
- 월실적 생성이 실패하면 `getApMonthlyDate` 결과의 `FRM_DTTM`, `TO_DTTM`과 팝업 payload `AP_ST_DATE`, `AP_DATE` 확인.
- 확정취소 실패 시 `FRM_DTTM`이 Sencha `minusOneMonth(TO_DTTM)`와 동일하게 생성되는지 확인.
- 수기비용 엑셀 오류 시 upload multipart 필드명과 `/apDailyManagementService/downloadRate?MENU_CD=MAIN_GRID_AP_MONTHLY_MGMT` 다운로드 endpoint 확인.
