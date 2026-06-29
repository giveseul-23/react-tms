# TmsUserAccount 작업 기록

## 화면 정보
- React 경로: `src/features/tms/master/organization/env/tmsuser`
- Sencha 경로: `SENCHA_VIEW_ROOT\mdl\tms\master\account\user`
- React 파일:
  - `TmsUserAccount.tsx`
  - `TmsUserAccountController.tsx`
  - `TmsUserAccountModel.ts`
  - `TmsUserAccountColumns.tsx`
  - `TmsUserAccountApi.ts`
  - `popup/TmsUserAccountPopup.tsx`

## 현재 알려진 주요 이슈
- 서버 저장 API는 모두 `{ dsSave: [...] }` body를 요구한다.
- 사업부와 물류그룹은 각각 하나 이상의 `DFT_YN=Y`가 필요하며 서버에서 최종 검증한다.
- 사용자 구분이 `USRCARRIER`인 행은 운송사 코드가 필수다.
- 사용자 착지의 저장 키는 `LOC_CD`가 아니라 `LOC_ID`까지 포함한다.

## 작업 이력

### 2026-06-29 - 운송사 팝업 상시 활성화
- 수정:
  - 공통 popup 편집 판정은 변경하지 않고 `USR_CARR_CD` 컬럼을 추가/기존 행 모두 항상 팝업 가능하도록 변경했다.
  - `USRCARRIER` 행의 운송사 필수 저장 검증은 유지했다.

### 2026-06-29 - 운송사 사용자 팝업 조회 수정
- 원인:
  - `USR_CARR_CD`가 `type: "popup"`이면서 `renderPopup`을 사용해 공통 grid가 커스텀 팝업을 실행하지 못했다.
- 수정:
  - 컬럼을 `type: "popuser"`로 변경했다.
  - `USR_TP=USRCARRIER`인 행에서만 `selectCarrList` 운송사 조회 팝업을 생성하고 선택 결과를 `USR_CARR_CD`, `USR_CARR_NM`에 반영한다.

### 2026-06-29 - 사용자 착지 선택 팝업 페이징
- 수정:
  - LOCATION 추가 버튼에서 화면 전용 `TmsUserLocationPopup`을 사용하도록 변경했다.
  - 조회 결과를 클라이언트 페이징하며 기본 페이지 크기를 100건으로 설정했다.
  - 공통 `CommonPopup`은 변경하지 않았다.

### 2026-06-29 - 사용자 착지 추가 버튼 활성화
- 원인:
  - React `makeAddAction`은 기본적으로 grid의 `I` 권한을 검사하지만, Sencha 사용자 착지 추가 버튼은 일반 handler 버튼으로 별도 `I` 권한을 적용하지 않는다.
- 수정:
  - `sub03Actions`의 추가 버튼에만 `authCls: ""`를 지정해 Sencha와 동일하게 동작하도록 했다.
  - 저장 버튼의 `C` 권한과 `SUB03_GRID_TMS_USER_ACCOUNT`의 grid 조회 권한은 유지했다.

### 2026-06-29 - Sencha 화면 React 전환

#### 작업 범위
- 상단 사용자 master grid와 하단 2개 탭을 구현했다.
- 소속 탭에 사업부/물류그룹 grid를 50:50으로 배치했다.
- 사용자 착지 탭에 착지 grid를 구현했다.
- 사용자 선택, 사업부 선택, 물류그룹 선택, 착지 선택 팝업을 연결했다.
- 4개 grid 저장과 비밀번호 초기화를 구현했다.

#### 확인한 기준 문서
- `AGENTS.md`
- `CLAUDE.md`
- `docs/claude/screen-architecture.md`
- `docs/claude/column-rules.md`
- `docs/claude/search-style.md`
- `docs/claude/popup.md`
- `docs/claude/reference-screens.md`
- `docs/claude/frontend-audit.md`
- `docs/claude/local-environment.md`
- `docs/standard-deviations.md`

#### 확인한 Sencha 소스
- `TmsUserAccount.js`
- `TmsUserAccountController.js`
- `TmsUserAccountModel.js`
- `TmsUserAccountMain.js`
- `TmsUserAccountSub01.js`
- `TmsUserAccountSub02.js`
- `TmsUserAccountSub03.js`
- `popup/TmsUserAccountPop.js`
- `popup/TmsUserAccountPopController.js`
- `popup/TmsUserAccountPopModel.js`
- Java `TmsUserAccountService.java`, `TmsUserAccountBiz.java`

#### 비교한 React 참고 화면
- `src/features/adm/usr/usracct`: 사용자 master/detail, 사용자 선택 팝업 및 저장 패턴.
- `src/features/tms/master/organization/env/logisticgroup/dspchorgset`: master-detail cascade 패턴.
- `src/features/tms/master/organization/env/logisticgroup/arcust`: 다중 선택 `CommonPopup`과 중복 제외 패턴.
- `src/features/tms/resources/driver`: 비밀번호 초기화의 `dsSave` 패턴.

#### Sencha 비교 결과
- 레이아웃: 검색영역 아래 상단 main 50%, 하단 tab panel 50%.
- 하단 첫 탭: 사업부 grid와 물류그룹 grid를 좌우 50:50 split.
- 하단 둘째 탭: 사용자 착지 grid.
- authId:
  - `MAIN_GRID_TMS_USER_ACCOUNT`
  - `SUB01_GRID_TMS_USER_ACCOUNT`
  - `SUB02_GRID_TMS_USER_ACCOUNT`
  - `SUB03_GRID_TMS_USER_ACCOUNT`
- selection model: 모든 업무 grid는 single row, 사용자 선택 팝업은 checkbox multiple.
- pagination: main만 paging, sub grid는 paging toolbar 없음.
- cascade: main → 사업부·착지, 사업부 → 물류그룹.
- toolbar: main은 비밀번호 초기화/추가/저장, sub grid는 각각 추가/저장.
- 저장 URL:
  - `/tmsUserAccountService/save`
  - `/tmsUserAccountService/saveUserDiv`
  - `/tmsUserAccountService/saveUserLgstGrp`
  - `/tmsUserAccountService/saveUserLoc`
  - `/tmsUserAccountService/initPasswd`

#### 수정 파일과 변경 이유
- `TmsUserAccount.tsx`: Sencha의 50:50 master/detail 및 하단 탭/split 구조를 반영했다.
- `TmsUserAccountController.tsx`: cascade, 팝업 추가, 중복 방지, 저장, 비밀번호 초기화 흐름을 구현했다.
- `TmsUserAccountModel.ts`: 4개 grid와 사용자구분/고객 공통코드를 구성했다.
- `TmsUserAccountColumns.tsx`: Sencha 컬럼의 편집 가능 여부와 기본값 single check를 반영했다.
- `TmsUserAccountApi.ts`: Sencha/Java 서비스 URL과 `dsSave` payload 계약을 구현했다.
- `popup/TmsUserAccountPopup.tsx`: 사용자 ID/명 조회 및 다중 선택 팝업을 구현했다.

#### 알려진 미구현/주의사항
- 실제 메뉴 메타의 조회조건 key가 `SRCH_LOC_LOC_CD`인지 운영 화면에서 확인이 필요하다.
- 사용자구분별 착지 탭 disabled 처리는 Sencha에 함수만 있고 호출 흐름이 없어 적용하지 않았다.
- 서버/공통코드 연결이 필요한 팝업 결과의 `LOC_ID` 반환 여부는 실제 화면에서 확인해야 한다.

#### 검증 결과
- `npm run build`: 통과. 기존 Vite dynamic/static import chunk 경고만 발생했다.
- 대상 폴더 ESLint: 프로젝트에 로컬 `eslint` 패키지가 없어 실행하지 못했다.
- `git diff --check`: 통과.

#### 수동 검증 체크리스트
- 조회 후 첫 사용자 선택 및 사업부·착지 자동 조회.
- 사용자 행 클릭 시 사업부·착지 조회와 물류그룹 초기화.
- 사업부 행 클릭 시 물류그룹 조회.
- 사용자 추가 팝업의 다중 선택과 중복 사용자 제외.
- 사업부/물류그룹/착지 추가 팝업의 다중 선택과 중복 제외.
- 각 grid 저장 request body가 `{ dsSave: [...] }`인지 확인.
- 기본 사업부/물류그룹을 하나씩만 선택할 수 있는지 확인.
- 직원 사용자 비밀번호 초기화가 차단되는지 확인.

#### 다음에 먼저 볼 것
- sub grid 저장 오류 시 `USR_ID`, `DIV_CD`, `LGST_GRP_CD`, `LOC_ID` key 전달 여부.
- 기본값 오류 시 사업부/물류그룹별 `DFT_YN=Y` 존재 여부.
- 조회조건 착지 검색이 적용되지 않으면 SearchMeta raw key 확인.
