# ApDailyManagement 작업 기록

## 화면 정보
- React 경로: `src/features/tms/calculate/vhcunit/dtrsptnrpt`
- React 파일: `ApDailyManagement.tsx`, `ApDailyManagementController.tsx`, `ApDailyManagementModel.ts`, `ApDailyManagementColumns.tsx`, `ApDailyManagementApi.ts`
- Sencha 경로: `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\calculate\vhcunit\dtrsptnrpt`
- Sencha 파일: `ApDailyManagement.js`, `ApDailyManagementController.js`, `ApDailyManagementMain.js`, `ApDailyManagementSubGrid01.js`, `ApDailyManagementModel.js`

## 현재 알려진 주요 이슈
- 저장/선택행 처리 API는 Java Service가 `dsSave`를 읽으므로 `{ dsSave: [...] }` body와 session/MENU_CD params 구조를 우선 확인한다.
- 비용등록관리의 금액취소/복원은 Sencha에서도 버튼이 주석 처리되어 있고 React 팝업 `ApDailyRateCancelPop`이 미구현이다.
- 세차비관리, 주말배송비용관리은 Sencha 버튼이 `hidden: true`이며 관련 React 팝업/버튼은 구현하지 않았다.
- `ApDailyManualPop`은 팝업 파일이 존재하지만 현재 Sencha 메인 toolbar에서 호출 흐름이 확인되지 않아 React에 추가하지 않았다.
- 상세 탭은 Sencha 기준 같은 조회조건으로 `searchDetail`을 조회하며, 메인 행 단건 키가 아닌 조회조건 기반 detail 목록인지 수동 확인이 필요하다.
- 체크박스 위치가 중간 컬럼에 보이면 selection checkbox가 아니라 audit delete 컬럼이 다시 포함되었는지 확인한다.

## 작업 이력

### 2026-06-23 - Sencha 기준 화면 보정
- 작업 범위:
  - React 기존 5파일을 Sencha `ApDailyManagement` 기준으로 비교하고 보정했다.
  - 메인/상세 grid authId와 메인 checkbox multi selection을 반영했다.
  - Sencha toolbar의 유류비관리, 비용등록관리, 재계산, 운임엑셀업로드 하위 메뉴를 React 액션에 연결했다.
  - 저장, 일마감, 일마감취소, 운임 재계산, 거리 재계산, 메모 등록/취소 payload를 `dsSave` 구조로 보정했다.
  - 상세 탭의 팔레트/대차 입출고 그룹 컬럼을 Sencha `ApDailyManagementSubGrid01.js` 기준으로 추가했다.
- 확인한 기준 문서:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/claude/dev-workflow.md`
  - `docs/claude/screen-architecture.md`
  - `docs/claude/column-rules.md`
  - `docs/claude/search-style.md`
  - `docs/claude/excel-download.md`
  - `docs/claude/popup.md`
  - `docs/claude/reference-screens.md`
  - `docs/standard-deviations.md`
- 확인한 Sencha 소스:
  - `ApDailyManagement.js`: north 조회조건 + center tabpanel 2탭, main authId `MAIN_GRID_AP_DAILY_MGMT`, sub authId `SUB01_GRID_AP_DAILY_MGMT`, main checkbox multi selection.
  - `ApDailyManagementMain.js`: 메인 toolbar 버튼과 하위 메뉴 확인.
  - `ApDailyManagementSubGrid01.js`: 상세 toolbar, 엑셀 버튼, 팔레트/대차 그룹 컬럼 확인.
  - `ApDailyManagementController.js`: `getUsedChgCd`, `search`, `searchDetail`, `saveRecord`, `saveDlySetl`, `saveDlySetlCancel`, `calcRate`, `calcDistance`, 엑셀 업로드/다운로드 흐름 확인.
  - `ApDailyManagementModel.js`: main/sub store URL과 code store 확인.
- 비교한 React 참고 화면:
  - `src/features/tms/calculate/vhcunit/dlyresult/ApDailyReportResult*`: 선택행 저장, 조회조건 raw key 보정, 엑셀 액션 패턴 참고.
  - `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagement*`: `toDsSave` 기반 선택행 저장과 authId/엑셀 패턴 참고.
- Sencha 비교 결과:
  - layout: `north` 조회조건 + `center` `extabpanel` 2탭.
  - grid reference: `mainGrid`, `subGrid01`.
  - grid authId: `MAIN_GRID_AP_DAILY_MGMT`, `SUB01_GRID_AP_DAILY_MGMT`.
  - selection model: main은 checkbox multi, sub는 기본 rowmodel.
  - toolbar: main은 생성/취소/일마감/유류비관리/비용등록관리/메모/재계산/저장/운임엑셀업로드/엑셀, sub는 엑셀.
  - pagination: main/sub 모두 `exgridpagecontrol` 존재.
  - 조회 URL: `/apDailyManagementService/search`, `/apDailyManagementService/searchDetail`.
  - 동적 컬럼 URL: `/apDailyManagementService/getUsedChgCd`.
  - 저장 URL: `/apDailyManagementService/save`, `/apDailyManagementService/saveDlySetl`, `/apDailyManagementService/saveDlySetlCancel`, `/apDailyManagementService/calcRate`, `/apDailyManagementService/calcDistance`.
  - 주요 payload: 저장성 처리는 `saveRecord` 기반으로 `dsSave` dataset 구조.
- 원인 분석:
  - 기존 React는 authId가 없어 Sencha grid 권한과 엑셀 업로드 기준이 빠져 있었다.
  - 기존 React main 그리드는 Sencha checkbox multi selection을 반영하지 않아 선택행 버튼 동작 기준이 달랐다.
  - 기존 React 저장 API는 배열 body를 직접 전송해 Java `getDataList("dsSave")` 구조와 맞지 않을 수 있었다.
  - 기존 React toolbar 일부 드롭다운은 빈 items라 Sencha에 있는 실제 기능 버튼이 노출되지 않았다.
  - 상세 탭 컬럼 중 Sencha 팔레트/대차 그룹 컬럼이 React에 누락되어 있었다.
- 수정 파일과 변경 이유:
  - `ApDailyManagement.tsx`: `AUTH.grids` 선언, DataGrid `authId`, main `rowSelection="multiple"` 추가.
  - `ApDailyManagementController.tsx`: Sencha toolbar 메뉴 보정, 선택행 검증/`dsSave` 변환, 일마감 상태 검증, 업로드/다운로드 액션 연결, detail 엑셀 조회조건 보정.
  - `ApDailyManagementApi.ts`: 저장성 API를 `{ dsSave: rows }` body + session params 구조로 변경하고 화면별 업로드/템플릿/Rate 다운로드 API 추가.
  - `ApDailyManagementColumns.tsx`: 상세 탭 팔레트/대차 입출고 그룹 컬럼 추가.
- 알려진 미구현/주의사항:
  - `ApDailyRateCancelPop` 기반 금액취소/금액취소복원은 Sencha 버튼도 주석 처리되어 React에 추가하지 않았다.
  - `CarWashMgmtPop` 기반 세차비관리와 주말배송비용관리는 Sencha에서 hidden 버튼이라 React에 추가하지 않았다.
  - 화면별 엑셀 업로드 API는 파일 선택 후 화면별 URL로 multipart 전송하도록 연결했으나 실제 서버 업로드 파라미터는 운영 API에서 수동 검증이 필요하다.
- 검증 결과:
  - `npx eslint src\features\tms\calculate\vhcunit\dtrsptnrpt --ext .ts,.tsx`: PowerShell 실행 정책으로 `npx.ps1` 실행 실패.
  - `npx.cmd eslint src\features\tms\calculate\vhcunit\dtrsptnrpt --ext .ts,.tsx`: 통과.
  - `npm.cmd run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고이며 빌드 실패는 아님.
- 수동 검증 체크리스트:
  - 조회 시 일일실적/상세내역 탭이 모두 조회조건 기준으로 데이터 로드되는지 확인.
  - 메인 그리드에서 여러 행 선택 후 일마감/일마감취소 상태 검증 메시지와 payload를 확인.
  - 저장 버튼 클릭 시 body가 `{ dsSave: [...] }`인지 확인.
  - 유류비관리, 비용등록관리, 운임엑셀업로드의 양식 다운로드/업로드 URL과 파라미터 확인.
  - 재계산 > 총거리/운임 선택행 payload와 재조회 여부 확인.
  - 메모 등록/취소 시 선택행과 `MEMO_DESC`, `rowStatus` 전송 확인.
  - 상세 탭 팔레트/대차 그룹 컬럼 표시와 엑셀 출력 확인.
- 다음에 먼저 볼 것:
  - `Expected BEGIN_ARRAY but was BEGIN_OBJECT` 또는 반대 오류 발생 시 `ApDailyManagementApi.ts`의 `dsSavePost` 구조 확인.
  - 버튼 클릭 후 아무 동작이 없으면 Sencha에서 주석/hidden 처리된 팝업 버튼인지 확인.
  - 상세 탭 데이터가 과다/누락되면 Sencha처럼 조회조건 기반 `searchDetail`이 맞는지, 메인 선택행 기준 cascade가 필요한지 확인.
  - 업로드 실패 시 서버가 요구하는 multipart 필드명과 `DIV_CD`/`LGST_GRP_CD`/`MENU_CD` 파라미터를 확인.

### 2026-06-23 - 체크박스 위치 보정
- 작업 범위:
  - React 메인 그리드 중간에 표시되던 체크박스 컬럼을 Sencha 좌측 selection checkbox 구조와 비교했다.
- 원인:
  - 중간 체크박스는 `rowSelection="multiple"`이 만든 선택 체크박스가 아니라 `DAILY_MAIN_TAIL`/`DAILY_DETAIL_TAIL`의 `makeAuditColumns({ delete: true })`가 만든 삭제 체크박스였다.
  - Sencha `ApDailyManagementMain.js`에는 좌측 checkbox selection model은 있지만 삭제 체크박스 컬럼은 없다.
- 수정:
  - `ApDailyManagementColumns.tsx`: main/detail tail의 audit delete 컬럼을 `delete: false`로 변경했다.
- 검증:
  - `npx.cmd eslint src\features\tms\calculate\vhcunit\dtrsptnrpt --ext .ts,.tsx`: 통과.
  - `npm.cmd run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고이며 빌드 실패는 아님.
- 수동 검증 체크리스트:
  - 메인 그리드 체크박스가 Sencha처럼 좌측 selection 컬럼에 표시되는지 확인.
  - `일마감상태`와 `총운행` 사이에 불필요한 체크박스 컬럼이 남지 않는지 확인.
  - 선택행 기반 버튼(일마감, 재계산, 메모)이 좌측 selection 체크박스 선택행으로 동작하는지 확인.

### 2026-06-23 - selection 체크박스 pinned 위치 보정
- 작업 범위:
  - 삭제 체크박스 제거 후에도 React 체크박스가 `일마감상태`와 `총운행` 사이에 남는 현상을 재확인했다.
- 원인:
  - 남아 있던 체크박스는 삭제 컬럼이 아니라 AG Grid selection 컬럼이었다.
  - 메인 앞쪽 컬럼들이 `pinned: "left"`로 고정되어 있어 selection 컬럼이 pinned left 컬럼 뒤, 즉 중간 위치에 렌더링되었다.
- 수정:
  - `ApDailyManagement.tsx`: main DataGrid에 화면 전용 `selectionColumnDef`를 `gridOptions`로 전달하고 `pinned: "left"`, `lockPosition: "left"`를 지정했다.
  - 공통 `DataGrid`/공통 grid shell은 수정하지 않았다.
- 검증:
  - `npx.cmd eslint src\features\tms\calculate\vhcunit\dtrsptnrpt --ext .ts,.tsx`: 통과.
  - `npm.cmd run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고이며 빌드 실패는 아님.
- 수동 검증 체크리스트:
  - 체크박스가 row number보다 앞 또는 Sencha와 동일한 좌측 selection 영역에 표시되는지 확인.
  - `일마감상태`와 `총운행` 사이에 selection 체크박스가 더 이상 표시되지 않는지 확인.
