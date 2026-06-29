# DepartArrivalManagement 작업 기록

## 화면 정보
- 화면명: 출/도착관리
- React 경로: `src/features/tms/execution/arrdep`
- 주요 React 파일:
  - `DepartArrivalManagement.tsx`
  - `DepartArrivalManagementController.tsx`
  - `DepartArrivalManagementModel.ts`
  - `DepartArrivalManagementApi.ts`
  - `DepartArrivalManagementColumns.tsx`
- Sencha 경로: `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\execution\arrdep`
- 주요 Sencha 파일:
  - `DepartArrivalManagement.js`
  - `DepartArrivalManagementController.js`
  - `DepartArrivalManagementModel.js`
  - `DepartArrivalManagementMainGrid.js`
  - `DepartArrivalManagementSubGrid01.js`
  - `DepartArrivalManagementSubGrid02.js`
  - `DepartArrivalManagementSubGrid03.js`

## 현재 알려진 주요 이슈
- 저장/상태변경 API는 Java Service와 Sencha `saveRecord` 흐름 기준으로 `{ dsSave: [...] }` 구조를 우선 확인한다.
- 메인 저장 버튼은 `base.saveGrid("main", api.save)` 표준 흐름을 타야 한다.
- 메인 그리드의 `MEMO_DESC`, `REF_VAL_1`~`REF_VAL_12`는 Sencha `excolumneditor` 기준으로 React에서 `editable:true`가 필요하다.
- 메인 그리드의 `REF_VAL_1`~`REF_VAL_12` 헤더는 Sencha처럼 `Lang.get("LBL_REFERENCE") + 번호` 조합 방식으로 표시한다.
- 기존 row 원본에 없는 빈 REF 필드에 새 값을 입력해도 dirty로 잡혀야 한다.
- `PLN_ID`, `PLN_NM`은 Sencha에서 `xtype:'excolumn'`으로 확인되어 편집 대상에서 제외했다.
- 조회 전문 차이가 있으면 `DepartArrivalManagementController.tsx`의 `fetchList`가 SearchFilters에서 전달한 `_params`를 버리고 `rawFiltersRef`의 4개 값만 재구성하는지 먼저 확인한다.
- Sencha 조회는 `searchByConditions` 공통 로직에서 `dsSearchCondition`과 검색영역 top-level 조건을 추가하므로 React 조회 payload와 비교할 때 이 값을 함께 확인한다. 2026-06-22 기준 React 조회는 SearchFilters 공통 params 보존 방식으로 보정했다.
- 버튼 중 `BTN_SHOW_ROUTE`는 Sencha 지도 팝업 흐름 확인이 필요하다. React 공통 `TmapView`는 존재하며 단일 trace/stop marker는 지원하지만, 예상경로/실제경로를 동시에 관리하는 다중 경로 레이어 API는 별도 확인이 필요하다.
- `BTN_SHOW_POD`는 React `PodPopup`으로 구현되어 있으며 `/podService/searchPodPop`, `/podService/searchPodPopDetail`, `/fileService/downloadFile` 흐름을 사용한다.
- 2026-06-24 확인 기준 `BTN_SHOW_POD`, `BTN_INTER_STOP_ETA`, `BTN_DRIVE_HISTORY`, `BTN_SP_START_WORK`, `BTN_START_TRANSPORTATION`은 React 팝업 흐름으로 구현되어 있다. `BTN_SHOW_ROUTE`는 Sencha `arrdep/pop` 하위 지도 팝업을 호출하며, React `TmapView.getMap()`을 이용한 화면 내부 구현 가능성과 공통 다중 레이어 API 필요성을 구분 검토해야 한다.
- 빌드는 현재 arrdep 외 기존 오류인 `DockCommitmentApi.ts`의 `MENU_CODE` import/export 불일치로 실패한다.

## 다음에 먼저 볼 것
- `Expected BEGIN_ARRAY but was BEGIN_OBJECT` 또는 반대 구조 오류가 나면 `DepartArrivalManagementApi.ts`의 `withDsSave`와 request body 구조를 먼저 확인한다.
- 저장 버튼이 무반응처럼 보이면 해당 저장 버튼이 `base.saveGrid`를 타는지, 변경행이 없을 때 안내가 표시되는지 확인한다.
- 컬럼이 편집되지 않으면 Sencha `excolumneditor`, `editDisabled`, `insertDisabled`와 React `editable:true`/`insertable:true` 누락 여부를 비교한다.
- REF 계열 저장이 변경 없음으로 처리되면 `rowStatus.ts`의 원본 비교가 현재 row에 새로 생긴 필드까지 비교하는지 확인한다.
- 버튼 클릭 후 동작이 없으면 Sencha 팝업 미구현 상태인지 먼저 확인한다.
- 조회조건이 Sencha와 다르면 React `fetchList(_params)`가 `_params.dsSearchCondition`, `_params.DYNAMIC_QUERY`, `page`, `limit` 등을 누락하고 있는지 확인한다.
- `/departArrivalManagementService/searchDepartArrivalManagement` 결과가 검색조건과 다르면 Sencha `ExGridEditor.searchByConditions`와 React `SearchFilters`의 `paramMode` 차이를 먼저 비교한다.
- 날짜 range 조회가 어긋나면 `searchProps.excludes`의 `DLVRY_DT -> DLVRY_DT_FROM/DLVRY_DT_TO` 매핑과 `rawFiltersRef`의 `*_FRM` fallback을 확인한다.
- 하위 그리드가 비어 있으면 main -> stopover/assignedOrder, assignedOrder -> shipmentDetail cascade key와 API 파라미터를 확인한다.

## 작업 이력

### 2026-06-19 - Sencha 기준 화면 구조 보강

#### 작업 범위
- Sencha `DepartArrivalManagement` 기준으로 React 출/도착관리 화면 구조를 비교하고 누락된 하단/상세 그리드를 보강했다.
- 작업 범위는 화면 구조, grid authId, master/detail cascade, 저장 URL 분리, SubGrid03 컬럼 추가까지로 한정했다.

#### 확인한 기준 문서
- `AGENTS.md`
- `CLAUDE.md`
- `docs/claude/dev-workflow.md`
- `docs/claude/screen-architecture.md`
- `docs/claude/column-rules.md`
- `docs/claude/search-style.md`
- `docs/claude/reference-screens.md`
- `docs/standard-deviations.md`

#### 확인한 Sencha 소스
- `DepartArrivalManagement.js`
- `DepartArrivalManagementController.js`
- `DepartArrivalManagementModel.js`
- `DepartArrivalManagementMainGrid.js`
- `DepartArrivalManagementSubGrid01.js`
- `DepartArrivalManagementSubGrid02.js`
- `DepartArrivalManagementSubGrid03.js`

#### 비교한 React 참고 화면
- `src/features/tms/execution/ordermonitor/OrderMonitor.tsx`
- `src/features/tms/execution/cntr/DspchContainer.tsx`

#### Sencha 비교 결과
- 메뉴 authId: `MENU_EVENT_MANAGER`
- 메인 grid authId: `MAIN_GRID_EVENT_MANAGER`
- 하단 탭 높이: south 25%
- 메인 selection: checkboxmodel MULTI
- 하단 탭 1: `LBL_STOP`, subGrid01, authId `SUB01_GRID_EVENT_MANAGER`
- 하단 탭 2: `LBL_ASSIGNED_SHIPMENTS`
- 하단 탭 2 좌측: subGrid02, authId `SUB02_GRID_ARR_DEP`
- 하단 탭 2 우측: subGrid03, authId `SUB03_GRID_ARR_DEP`
- 메인 클릭 시 subGrid01/subGrid02 조회, subGrid02 클릭 시 subGrid03 조회
- 주요 URL:
  - `/departArrivalManagementService/searchDepartArrivalManagement`
  - `/departArrivalManagementService/searchDepartArrivalManagementStop`
  - `/dispatchPlanService/searchAssignedShipment`
  - `/dispatchPlanService/searchAssignedShipmentDetail`
  - `/departArrivalManagementService/save`
  - `/departArrivalManagementService/saveDepartArrivalManagementStop`
  - `/departArrivalManagementService/saveCntr`

#### 원인 분석
- React에는 Sencha subGrid03에 해당하는 할당주문 품목상세 우측 그리드가 없었다.
- Sencha grid authId 4개가 React DataGrid에 연결되어 있지 않았다.
- React 검색은 전달받은 필터를 그대로 사용했지만, Sencha는 raw 조회조건에서 `LGST_GRP_CD`, `DIV_CD`, `DLVRY_DT_FROM`, `DLVRY_DT_TO`를 구성했다.
- subGrid01 일반 저장과 컨테이너 저장 URL이 React에서 명확히 분리되어 있지 않았다.
- 일부 메인 버튼은 Sencha 팝업 흐름 기반이라 React 단독 API 직결로는 정상 동작 판단이 어렵다.

#### 수정 파일과 변경 이유
- `DepartArrivalManagement.tsx`
  - `AUTH.grids` 추가 및 MAIN/SUB01/SUB02/SUB03 authId 연결
  - Sencha center/south 구조에 맞춰 MasterDetailPage 상하 분할 및 기본 비율 75/25 적용
  - 할당주문 탭 내부를 SplitPane 60/40으로 분할하여 할당주문/품목상세 그리드 구성
- `DepartArrivalManagementModel.ts`
  - `GridKey`에 `shipmentDetail` 추가
- `DepartArrivalManagementController.tsx`
  - raw 조회조건 기반 검색 파라미터 매핑 추가
  - main -> stopover/assignedOrder, assignedOrder -> shipmentDetail cascade 추가
  - 경유처 일반 저장과 컨테이너 저장 분리
  - 선택행 상태변경 API payload에 `EDIT_STS`/`rowStatus`/`MENU_CD` 보강
  - `BTN_INTER_STOP_ETA` 액션 추가
- `DepartArrivalManagementApi.ts`
  - 깨진 메서드 구문 복구
  - 배열 payload에 `MENU_CD`와 세션 필드를 주입하는 `withSessionRows` 추가
  - `saveStopover` 추가
- `DepartArrivalManagementColumns.tsx`
  - SubGrid03 품목상세 컬럼 추가
  - SubGrid02 hidden 컬럼 및 Flex 수량/합계 컬럼 보강

#### 알려진 미구현/주의사항
- `BTN_SHOW_ROUTE`는 Sencha 팝업 파일 기준 추가 구현이 필요하다. React 공통 `TmapView`는 존재하므로, 우선 화면 popup 내부에서 `getMap()` 기반 보조 polyline을 관리하는 방식이 가능한지 검토하고, 여러 화면에서 재사용될 수준이면 공통 다중 레이어 API로 분리한다.
- 팝업 미구현 버튼은 임시 API 연결 여부와 무관하게 정상 처리 완료로 판단하지 않는다.

#### 검증 결과
- `npx eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm run build`: 실패
  - 실패 원인: 이번 화면과 무관한 기존 오류
  - 대표 오류: `src/features/tms/pln/dockcmmt/DockCommitmentApi.ts`에서 `DockCommitment.tsx`가 `MENU_CODE`를 export하지 않음
- `npx tsc --noEmit --pretty false`: 실패
  - 실패 원인: 공통/다른 화면의 기존 TypeScript 오류 다수
  - 이번 arrdep 변경 파일 관련 오류는 출력되지 않음

#### 수동 검증 체크리스트
- 조회 시 메인 첫 행 선택 후 경유처/할당주문 조회 여부
- 할당주문 행 클릭 시 품목상세 조회 여부
- 메인 다중 선택 버튼 동작 payload 구조
- 경유처 저장과 컨테이너 저장 버튼 URL 분리 여부
- 엑셀 다운로드 버튼 노출/권한 authId 적용 여부

### 2026-06-19 - 메인 그리드 editable 컬럼 보정

#### 작업 범위
- Sencha에서 편집 가능한 메인 그리드 비고/REFERENCE 계열 컬럼이 React에서 편집되지 않는 이슈를 확인하고 수정했다.

#### 원인 분석
- React 컬럼 규칙상 `type:"text"`는 `editable:true` 미지정 시 읽기전용이다.
- Sencha `DepartArrivalManagementMainGrid.js`의 `REF_VAL_1`~`REF_VAL_12`는 `xtype:'excolumneditor'`, `editType:'text'`였다.

#### 수정 파일과 변경 이유
- `DepartArrivalManagementColumns.tsx`
  - `MEMO_DESC`, `REF_VAL_1`~`REF_VAL_12`에 `editable:true` 추가

#### 알려진 미구현/주의사항
- `PLN_ID`, `PLN_NM`은 Sencha에서 `xtype:'excolumn'`으로 확인되어 이번 수정 범위에서 제외했다.

#### 검증 결과
- `npx eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과

### 2026-06-19 - 메인 그리드 저장 무반응 수정

#### 작업 범위
- Sencha에서는 수정 가능한 메인 그리드 항목을 수정한 뒤 저장 버튼을 누르면 저장 흐름이 진행되지만, React에서는 저장 버튼이 반응하지 않는 것처럼 보이는 이슈를 확인하고 수정했다.

#### 원인 분석
- 메인 저장 버튼이 공통 저장 헬퍼인 `base.saveGrid`를 우회했다.
- 기존 구현은 `dirtyRows`를 직접 검사한 뒤 변경행이 없으면 안내 없이 `return`했다.
- 이 때문에 사용자는 저장 버튼이 무반응인 것처럼 볼 수 있었다.

#### Sencha 근거
- `DepartArrivalManagement.js`의 main grid `saveUrl`은 `/departArrivalManagementService/save`이다.
- Sencha 저장은 `saveRecord` 흐름으로 변경행을 `dsSave` 형태로 전송한다.

#### React 표준 근거
- `docs/claude/screen-architecture.md` 기준 저장은 `base.saveGrid(gridKey, apiFn)`로 dirty 추출, 검증, `dsSave` 변환, 저장 후 처리를 수행한다.

#### 수정 파일과 변경 이유
- `DepartArrivalManagementController.tsx`
  - 메인 저장 버튼을 `base.saveGrid("main", api.save)`로 변경
- `DepartArrivalManagementApi.ts`
  - `api.save`가 `{ dsSave }` 인자를 받아 `withDsSave(payload.dsSave)`를 전송하도록 변경

#### 기대 효과
- 변경행이 없을 때 사용자 안내가 표시된다.
- 변경행이 있으면 표준 검증 후 `/departArrivalManagementService/save`로 `{ dsSave: [...] }` 구조가 전송된다.

#### 검증 결과
- `npx eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm run build`: 실패
  - 실패 원인: 이번 화면과 무관한 기존 오류
  - 대표 오류: `src/features/tms/pln/dockcmmt/DockCommitmentApi.ts`에서 `DockCommitment.tsx`가 `MENU_CODE`를 export하지 않음

### 2026-06-19 - 비고3~비고12 헤더 및 REF 신규 필드 dirty 판정 수정

#### 작업 범위
- Sencha 화면처럼 메인 그리드 상단 컬럼의 REF 계열 헤더가 `Lang.get('LBL_REFERENCE') + 번호` 조합 방식으로 표시되도록 보정했다.
- `비고3` 등 서버 원본 row에 빈 필드가 누락된 컬럼에 값을 입력하고 저장할 때 변경행으로 잡히지 않는 문제를 수정했다.

#### 확인한 Sencha 소스
- `DepartArrivalManagementMainGrid.js`

#### Sencha 비교 결과
- Sencha는 `REF_VAL_1`~`REF_VAL_12` 컬럼 헤더를 `Lang.get('LBL_REFERENCE') + '1'` 형태로 구성한다.
- Sencha의 `REF_VAL_1`~`REF_VAL_12` 컬럼은 `xtype:'excolumneditor'`, `editType:'text'`로 편집 가능하다.

#### 원인 분석
- React는 `LBL_REFERENCE3`, `LBL_REFERENCE4`처럼 번호가 붙은 별도 다국어 키를 사용하고 있었다.
- React 다국어에 해당 키가 없으면 화면에 `LBL_REFERENCE3***`처럼 표시된다.
- dirty 판정은 조회 시점 원본 스냅샷의 key만 비교했다.
- 서버가 빈 `REF_VAL_3` 필드를 row에 내려주지 않은 경우, 사용자가 `REF_VAL_3` 값을 새로 입력해도 원본 비교 대상에 없어서 `EDIT_STS`가 빈 값으로 되돌아갈 수 있었다.

#### 수정 파일과 변경 이유
- `DepartArrivalManagementColumns.tsx`
  - 당시에는 `REF_VAL_1`~`REF_VAL_12` 헤더를 `비고1`~`비고12` 리터럴로 변경했으나, 이후 Sencha 원본 기준에 맞춰 `Lang.get("LBL_REFERENCE") + 번호` 조합 방식으로 재보정했다.
- `src/app/components/grid/gridUtils/rowStatus.ts`
  - 원본 스냅샷 key뿐 아니라 현재 row에 새로 생긴 key도 함께 비교하도록 `matchesOrig` 보정
  - `toDsSave`의 제거용 destructuring 변수명을 `_EDIT_STS`, `_rid`로 정리해 lint warning 제거

#### 검증 결과
- `npx eslint src\features\tms\execution\arrdep src\app\components\grid\gridUtils\rowStatus.ts --ext .ts,.tsx`: 통과

### 2026-06-22 - 조회 전문 차이 원인 확인

#### 작업 범위
- `/departArrivalManagementService/searchDepartArrivalManagement` 호출 시 Sencha와 React의 request payload가 다른 원인을 확인했다.
- 이번 작업은 원인 확인만 수행했고 소스 코드는 수정하지 않았다.

#### 확인한 Sencha 소스
- `DepartArrivalManagementController.js`
- `ExGridEditor.js`
- `ExFieldSetSearchArea.js`
- `DepartArrivalMapper.xml`

#### 확인한 React 소스
- `DepartArrivalManagementController.tsx`
- `DepartArrivalManagementApi.ts`
- `SearchFilters/useSearchExecute.tsx`

#### 원인 분석
- Sencha 화면 컨트롤러는 명시적으로 `LGST_GRP_CD`, `DIV_CD`, `DLVRY_DT_FROM`, `DLVRY_DT_TO` 4개 값을 만든다.
- 이후 `mainGrid.searchByConditions(me, 'searchArea', params)`를 호출하면서 공통 `ExGridEditor.searchByConditions`가 `params.dsSearchCondition = searchArea.getCompToParam()`을 추가한다.
- 같은 공통 로직에서 `searchArea.getCompToParamExclude(params)`도 호출되어 검색영역의 추가 조건이 top-level 파라미터로 병합된다.
- React `SearchFilters`도 기본적으로 `dsSearchCondition`, `MENU_CD`, `page`, `limit` 형태의 파라미터를 만들 수 있다.
- 하지만 `DepartArrivalManagementController.tsx`의 `fetchList`는 전달받은 `_params`를 사용하지 않고, `buildSearchParams()`로 `rawFiltersRef`의 4개 값만 다시 만들어 API에 전달한다.
- 따라서 Scouter 전문 기준으로 React는 Sencha가 보내는 `dsSearchCondition`, paging 정보, 추가 검색조건 일부가 누락될 수 있다.

#### 관련 SQL 확인
- `DepartArrivalMapper.xml`의 `selectDepartArrivalManagement`는 기본 조건으로 `DIV_CD`, `LGST_GRP_CD`, `DLVRY_DT_FROM`, `DLVRY_DT_TO`를 사용한다.
- 하단 조건절에는 `DYNAMIC_QUERY`가 있으면 추가 조건으로 반영하는 구조도 존재한다.

#### 수정 파일과 변경 이유
- 없음. 사용자 요청 범위가 원인 확인이므로 코드 수정은 보류했다.

#### 알려진 미구현/주의사항
- Sencha와 완전히 동일하게 맞추려면 React `fetchList`가 SearchFilters의 `_params`를 보존하면서 4개 명시 파라미터를 병합해야 한다.
- `DS_SEARCH_CONDITION` 모드로 맞출지, SQL의 `DYNAMIC_QUERY` 조건을 사용하도록 `paramMode="DYNAMIC_QUERY"`를 적용할지는 기존 React 표준 화면과 추가 비교가 필요하다.

#### 검증 결과
- 정적 소스 분석만 수행했다.
- 코드 수정이 없어 lint/build는 실행하지 않았다.

### 2026-06-22 - 메인 toolbar 4개 팝업 React 표준 개발 가능성 검토

#### 작업 범위
- 이미지에서 표시한 `BTN_SHOW_POD`, `BTN_INTER_STOP_ETA`, `BTN_DRIVE_HISTORY`, `BTN_SP_START_WORK` 4개 버튼의 Sencha 팝업 구조와 React 팝업 표준 적용 가능성을 검토했다.
- 이번 작업은 구현 전 검토이며 React 소스 코드는 수정하지 않았다.

#### 확인한 기준 문서
- `AGENTS.md`
- `docs/claude/popup.md`

#### 확인한 Sencha 소스
- `DepartArrivalManagementController.js`
- `DepartArrivalManagementMainGrid.js`
- `pop/DepartArrivalManagementPodPop.js`
- `pop/DepartArrivalManagementPodPopController.js`
- `pop/DepartArrivalManagementPodPopModel.js`
- `pop/InterStopETAPop.js`
- `pop/InterStopETAPopController.js`
- `pop/InterStopETAPopModel.js`
- `pop/DepartArrivalManagementStartWorkPop.js`
- `pop/DepartArrivalManagementStartWorkPopController.js`
- `pop/DepartArrivalManagementShowRealPath.js`
- `pop/DepartArrivalManagementShowRealPathController.js`
- `pop/DepartArrivalManagementShowRealPathMain.js`

#### 비교한 React 참고 화면/공통 컴포넌트
- `src/app/components/popup/FormPopupLayout.tsx`
- `src/app/components/popup/GridSearchPopupLayout.tsx`
- `src/app/components/popup/PopupSearchCondition.tsx`
- `src/app/components/map/TmapView.tsx`
- `src/features/tms/execution/podrpt/PodReportController.tsx`
- `src/features/tms/master/account/location/popup/LocationMapPopup.tsx`
- `src/features/cms/vehicle/drvhstry/DriveHistory.tsx`

#### 검토 결과
- `BTN_SP_START_WORK`: React 표준 구현 가능. `FormPopupLayout` + `DatePickerPopover size="lg"` 형태로 구현하고, popup `onConfirm`에서 부모 Controller가 선택 row에 `TRNS_STDT_DATE`를 반영한 뒤 `/departArrivalManagementService/onStartWork`를 호출하는 구조가 적합하다.
- `BTN_INTER_STOP_ETA`: React 표준 구현 가능. 검색조건 없는 조회성 grid popup으로 구현하고, `BTN_REPRO`는 `/departArrivalManagementService/searchInterStopETA` 재조회 액션으로 매핑한다.
- `BTN_SHOW_POD`: React 표준 구현 가능. POD 목록 grid와 POD 이미지 grid를 한 popup 안에 좌우 배치하고, `/podService/searchPodPop`, `/podService/searchPodPopDetail`을 cascade 조회로 연결한다. 파일/이미지 열람 방식은 기존 파일 다운로드/미리보기 공통 패턴 확인 후 맞춘다.
- `BTN_DRIVE_HISTORY`: React 표준 구현 가능하나 지도 영역이라 검증 범위가 가장 크다. Sencha는 `MapController`의 `showDispatchRoutes`, `showRealPath`를 사용하므로 React에서는 기존 `TmapView` 기반 popup으로 구현하되, route/real path API 응답을 `TmapView` marker/trace 형식으로 변환하는 adapter 확인이 필요하다.

#### 알려진 미구현/주의사항
- 네 팝업 모두 현재 React 화면에는 아직 popup 컴포넌트가 연결되어 있지 않아 버튼 클릭만으로는 Sencha와 같은 동작을 기대하기 어렵다.
- 구현 시 버튼에서 API를 직접 호출하기보다 `usePopup().openPopup`으로 popup을 열고, popup 결과를 부모 Controller callback으로 처리하는 React 표준 흐름을 따른다.
- popup title은 `Lang.get(...)`으로 미리 번역하지 않고 `openPopup({ title: "..." })`에 언어 key를 그대로 전달한다.
- 운행이력 지도 popup은 Tmap script/API key, resize, route line, real path trace 표시까지 화면에서 수동 검증해야 한다.

#### 검증 결과
- 정적 소스 분석만 수행했다.
- React 소스 수정이 없어 lint/build는 실행하지 않았다.

### 2026-06-22 - 입차시각 팝업 React 구현

#### 작업 범위
- `BTN_SP_START_WORK` 버튼을 Sencha `DepartArrivalManagementStartWorkPop` 흐름에 맞게 React 팝업 기반으로 변경했다.
- 선택 row가 없으면 기존과 같이 선택 필요 메시지를 표시하고, 선택 row가 있으면 날짜/시간 입력 popup을 연다.
- popup 저장 시 입력한 `TRNS_STDT_DATE`를 선택 row의 `ATA_DTTM`에 반영하고 `/departArrivalManagementService/onStartWork`를 호출한다.

#### 확인한 기준 문서
- `AGENTS.md`
- `CLAUDE.md`
- `docs/claude/popup.md`

#### 확인한 Sencha 소스
- `DepartArrivalManagementController.js`
- `pop/DepartArrivalManagementStartWorkPop.js`
- `pop/DepartArrivalManagementStartWorkPopController.js`

#### 비교한 React 참고 화면/공통 컴포넌트
- `src/app/components/popup/FormPopupLayout.tsx`
- `src/app/components/Search/filters/DatePickerPopover.tsx`
- `src/features/tms/pln/dispatchPlan/popup/PredictEstimateTimetoArrivalPop.tsx`

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
  - Sencha 입차시각 입력 popup을 React `FormPopupLayout` + `DatePickerPopover size="lg"` 방식으로 신규 구현했다.
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - `BTN_SP_START_WORK`가 API를 직접 호출하던 흐름을 `usePopup().openPopup` 기반 popup 호출로 변경했다.
  - popup confirm 결과를 선택 row에 `ATA_DTTM`, `EDIT_STS`, `rowStatus`, `MENU_CD`로 병합한 뒤 기존 `api.startLoading`을 호출하도록 변경했다.

#### 알려진 미구현/주의사항
- 화면 수동 검증 시 선택 row 다건 처리, popup 취소, 날짜/시간 입력 후 request body의 `dsSave[].ATA_DTTM` 값을 확인해야 한다.
- `BTN_SHOW_POD`, `BTN_INTER_STOP_ETA`, `BTN_DRIVE_HISTORY`는 아직 React popup 미구현 상태다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- build 중 Vite dynamic/static import chunk 경고가 출력되었으나 빌드 실패는 아니다.

### 2026-06-22 - 입차시각 팝업 날짜/시간 UI 개선

#### 원인 분석
- `DatePickerPopover withTime`은 입력 필드 안에서 다시 날짜 popup을 띄우는 구조라, 작은 `FormPopupLayout` 안에서는 calendar popup이 저장/취소 버튼과 겹쳐 보인다.
- 시간 입력도 calendar popup 하단에 붙어 있어 사용자가 날짜와 시간을 하나의 작업으로 인식하기 어렵다.
- 이 화면의 입차시각 popup은 단일 일시 입력 후 저장하는 단순 업무이므로, 큰 calendar popup보다 날짜/시간을 명시적으로 분리한 form input이 더 적합하다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
  - `DatePickerPopover withTime` 사용을 제거했다.
  - `type="date"`와 `type="time"` input을 같은 줄에 배치해 popup 내부에서 모든 입력이 끝나도록 변경했다.
  - 날짜와 시간이 모두 입력된 경우에만 저장 버튼이 활성화되도록 유지했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- build 중 Vite dynamic/static import chunk 경고가 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 체크리스트
- `입차시각` popup에서 날짜/시간 입력 UI가 저장/취소 버튼과 겹치지 않는지 확인
- 날짜와 시간이 모두 입력되어야 저장 버튼이 활성화되는지 확인
- 저장 시 `ATA_DTTM` 값이 `YYYYMMDDHHmmss` 형식으로 전달되는지 확인

### 2026-06-22 - 입차시각 팝업 native date/time picker 제거 및 외부 클릭 닫힘 방지

#### 원인 분석
- `input type="time"`은 브라우저 기본 시간 선택 panel을 띄워 popup 안에 또 다른 선택 panel이 뜨는 형태가 된다.
- 해당 panel은 화면/브라우저에 따라 닫기 동선이 불명확하고, 저장/취소 버튼과 별개로 동작해 업무 popup UX에 맞지 않았다.
- 공통 `PopupShell`은 overlay 클릭 시 popup을 닫는 구조라, 저장성 popup에서 실수로 외부 영역을 클릭하면 입력값이 사라질 수 있다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
  - native `date`, `time` input을 제거하고 `type="text"` + 숫자 입력 mask 방식으로 변경했다.
  - 날짜는 `YYYY-MM-DD`, 시간은 `HH:MM:SS` 형태로 자동 포맷되도록 했다.
  - 유효한 날짜와 시간이 모두 입력된 경우에만 저장 버튼이 활성화되도록 했다.
- `src/app/components/popup/PopupShell.tsx`
  - `closeOnOverlayClick` 옵션을 추가해 popup별로 외부 클릭 닫힘 여부를 제어할 수 있게 했다.
- `src/app/components/popup/PopupContext.tsx`
  - `openPopup` payload에서 `closeOnOverlayClick` 값을 `PopupShell`로 전달하도록 했다.
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - 입차시각 popup 호출 시 `closeOnOverlayClick: false`를 지정해 외부 클릭으로 닫히지 않도록 했다.

#### 알려진 미구현/주의사항
- `closeOnOverlayClick` 기본값은 기존 동작 보존을 위해 `true`다. 이번 변경은 입차시각 popup에만 닫힘 방지 옵션을 적용했다.
- 날짜/시간 입력은 browser native picker를 사용하지 않으므로 사용자가 직접 숫자를 입력해야 한다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npx.cmd eslint src\app\components\popup --ext .ts,.tsx`: 에러 없음, 기존 미사용 변수 경고 5건 출력
- `npm.cmd run build`: 통과
- build 중 Vite dynamic/static import chunk 경고가 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 체크리스트
- 시간 입력 시 브라우저 기본 시간 panel이 뜨지 않는지 확인
- 외부 overlay 클릭 시 입차시각 popup이 닫히지 않는지 확인
- X 버튼, 취소 버튼, 저장 성공 흐름에서는 popup이 정상적으로 닫히는지 확인

### 2026-06-22 - 입차시각 팝업 현재일시 기본값 및 빠른 보정 버튼 적용

#### 원인 분석
- Sencha `DepartArrivalManagementStartWorkPop`은 `modal: true`인 `ExWindowMain` 기반 popup이다.
- Sencha modal window는 뒤쪽 mask 영역 클릭으로 popup이 닫히지 않는다.
- React 공통 `PopupShell`은 overlay 클릭 시 닫히는 구현이었으므로 Sencha modal 동작과 달랐다.
- Sencha 입력 필드는 `exdatetimefield` 하나로 일시를 받지만, React에서 브라우저 native `date/time` picker를 사용하면 popup 위에 브라우저 선택 panel이 떠서 Sencha와 다른 UX가 발생한다.
- 업무 성격상 사용자가 일시를 처음부터 키인하기보다 현재 입차시각을 확인하고 필요 시 보정하는 흐름이 더 적합하다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
  - popup open 시 현재 일시를 기본값으로 세팅했다.
  - `현재시각`, `-10분`, `+10분`, `+30분` 빠른 보정 버튼을 추가했다.
  - 직접 입력은 예외 보정용으로 유지하되, native picker가 뜨지 않는 숫자 mask 입력으로 유지했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- build 중 Vite dynamic/static import chunk 경고가 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 체크리스트
- popup open 시 현재 날짜/시간이 기본 입력되어 저장 버튼이 활성화되는지 확인
- `현재시각`, `-10분`, `+10분`, `+30분` 버튼이 날짜/시간을 정상 보정하는지 확인
- 필요한 경우 직접 숫자 입력으로 날짜/시간 보정이 가능한지 확인

#### 수동 검증 체크리스트
- 메인 grid에서 row 미선택 후 `입차시각` 클릭 시 선택 필요 메시지가 표시되는지 확인
- 메인 grid에서 row 선택 후 `입차시각` 클릭 시 popup이 열리는지 확인
- 날짜/시간 미입력 시 저장 버튼이 비활성인지 확인
- 날짜/시간 입력 후 저장 시 `/departArrivalManagementService/onStartWork` request body가 `{ dsSave: [...] }` 구조이고 `ATA_DTTM`에 입력값이 들어가는지 확인
- 저장 성공 후 popup이 닫히고 메인 조회가 갱신되는지 확인

### 2026-06-22 - 입차시각 팝업 저장 후 미닫힘 수정

#### 원인 분석
- `base.callAjax`는 저장 성공 시 별도의 성공 확인 popup을 추가로 연다.
- 기존 구현은 `base.callAjax(...).then(() => closePopup())` 순서라서, `closePopup()`이 입차시각 popup이 아니라 최상단의 성공 확인 popup을 닫았다.
- 그 결과 저장은 정상 처리되지만 그 아래에 있던 입차시각 popup이 남아 있었다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - 기존 React popup 처리 패턴과 동일하게 `onConfirm`에서 먼저 `closePopup()`으로 입력 popup을 닫고, 이후 `base.callAjax(api.startLoading(...))`를 호출하도록 변경했다.

#### 추가 확인
- `DatePickerPopover`의 `withTime` UI는 현재 공통 컴포넌트 자체가 날짜/시간 선택 값을 즉시 반영하는 방식이다.
- 공통 컴포넌트 파일 상단 주석에는 확인/취소 버튼이 있다고 적혀 있으나, 실제 구현에는 날짜/시간 popover 내부 확인/취소 버튼이 없다.
- 따라서 시간 입력 영역 하단에 확인/취소 버튼이 없는 것은 이번 화면만의 문제가 아니라 공통 `DatePickerPopover` 동작이다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- build 중 Vite dynamic/static import chunk 경고가 출력되었으나 빌드 실패는 아니다.

### 2026-06-22 - 메인 toolbar 4개 버튼 Sencha 팝업 호출 확인

#### 작업 범위
- React 화면 이미지에서 표시한 4개 버튼이 Sencha 기준으로 `arrdep/pop` 경로의 팝업을 호출하는지 확인했다.
- 이번 작업은 Sencha 소스 확인만 수행했고 React 소스는 수정하지 않았다.

#### 확인한 Sencha 소스
- `DepartArrivalManagementMainGrid.js`
- `DepartArrivalManagementController.js`
- `arrdep/pop/DepartArrivalManagementPodPop.js`
- `arrdep/pop/InterStopETAPop.js`
- `arrdep/pop/DepartArrivalManagementShowRealPath.js`
- `arrdep/pop/DepartArrivalManagementStartWorkPop.js`

#### Sencha 비교 결과
- `BTN_SHOW_POD`
  - main grid handler: `onShowPod`
  - controller popup: `vc.view.mdl.tms.execution.arrdep.pop.DepartArrivalManagementPodPop`
- `BTN_INTER_STOP_ETA`
  - main grid handler: `showInterStopEta`
  - controller popup: `vc.view.mdl.tms.execution.arrdep.pop.InterStopETAPop`
- `BTN_DRIVE_HISTORY`
  - main grid handler: `showVehicleRealPath`
  - controller popup: `vc.view.mdl.tms.execution.arrdep.pop.DepartArrivalManagementShowRealPath`
- `BTN_SP_START_WORK`
  - main grid handler: `onStartWork`
  - controller popup: `vc.view.mdl.tms.execution.arrdep.pop.DepartArrivalManagementStartWorkPop`

#### 원인 분석
- Sencha에서는 위 4개 버튼이 단순 API 직접 호출이 아니라 선택행 검증 후 팝업을 열고, 팝업 callback에서 필요한 값을 받아 후속 저장/API 흐름을 진행한다.
- React에서 동일 버튼을 구현하려면 버튼 onClick에 API를 직접 연결하기보다 대응 팝업을 먼저 구현하고 callback 후속 처리를 맞추는 방식이 필요하다.

#### 검증 결과
- 정적 소스 분석만 수행했다.
- 코드 수정이 없어 lint/build는 실행하지 않았다.

### 2026-06-22 - 조회 SearchFilters params 보존 및 AGENTS 지침 추가

#### 작업 범위
- Sencha `searchByConditions` 대비 React 조회 전문에서 `DLVRY_DT_FROM`, 공통 SearchFilters params, paging 조건이 누락되는 문제를 수정했다.
- 동일 유형의 누락을 줄이기 위해 `AGENTS.md`에 조회/SearchFilters payload 기준을 추가했다.

#### 비교한 React 참고 화면
- `IfDeliveryDocument.tsx`
  - `searchProps.excludes`로 날짜 range를 서버 파라미터명에 매핑하고 Controller는 `params`를 그대로 API로 전달한다.
- `PodColectionReportController.tsx`
  - 수동 조회 파라미터를 구성하더라도 `{ ...params, ...getSearchParams() }` 형태로 공통 params를 보존한다.

#### 수정 파일과 변경 이유
- `AGENTS.md`
  - `6.2 조회/SearchFilters payload 구조` 섹션을 추가해 `fetchList(params)`의 `params` 보존, 날짜 range `*_FRM`/`*_TO`, `searchProps.excludes` 우선 검토 기준을 명시했다.
- `DepartArrivalManagement.tsx`
  - `searchProps.excludes`에 `DLVRY_DT -> DLVRY_DT_FROM/DLVRY_DT_TO` 매핑을 추가했다.
- `DepartArrivalManagementController.tsx`
  - `fetchList(params)`가 SearchFilters에서 받은 `params`를 버리지 않고 Sencha 명시 파라미터와 병합하도록 수정했다.
  - 날짜 from 값은 `SRCH_DLVRY_DT_FRM`, `SRCH_DLVRY_DT_FROM`, `DLVRY_DT_FROM` 순서로 fallback하도록 수정했다.
  - 엑셀 전체 다운로드 fetch도 화면 조회와 같은 검색 조건을 사용하도록 `model.filtersRef.current`와 명시 파라미터를 병합했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - Vite dynamic/static import chunk 관련 warning만 출력됨.

#### 수동 검증 체크리스트
- 조회 시 Scouter 두 번째 실제 조회 SQL에 `DLVRY_DT_FROM`, `DLVRY_DT_TO`, 공통 검색조건, paging 조건이 반영되는지 확인한다.
- access token 만료 직후 첫 조회에서는 refreshToken 재시도로 동일 서비스가 2회 보일 수 있으므로, SQL Count가 있는 두 번째 호출 전문을 기준으로 비교한다.
- 엑셀 전체 다운로드 시 조회 화면과 동일한 검색조건으로 재조회되는지 확인한다.

### 2026-06-22 - Scouter 기준 조회 2회 호출 원인 확인

#### 작업 범위
- 첨부된 Scouter Sencha/React 호출 내역을 비교해 React에서 `/departArrivalManagementService/searchDepartArrivalManagement`가 두 번 보이는 원인을 확인했다.
- 이번 작업은 원인 확인만 수행했고 소스 코드는 수정하지 않았다.

#### 확인한 자료
- 첨부 Scouter 로그
- `DepartArrivalManagementController.tsx`
- `DepartArrivalManagementApi.ts`
- `SearchFilters/useSearchExecute.tsx`
- `app/http/client.ts`

#### 원인 분석
- React 최초 호출은 `elapsed=6ms`, `SQL Count=0`, profile에 `POST ?`만 있고 SQL이 없다.
- 이 형태는 조회 SQL이 실행된 요청이 아니라 access token 만료 응답 등으로 서버에서 빠르게 종료된 요청으로 판단된다.
- `app/http/client.ts`의 axios response interceptor는 응답 body의 `msg`가 `MSG_ACCESS_EXPIRED`이면 `/sessionService/refreshToken`을 호출한 뒤 원 요청을 재시도한다.
- Scouter 순서도 최초 `searchDepartArrivalManagement` 이후 `/sessionService/refreshToken`이 호출되고, 그 다음 동일 `searchDepartArrivalManagement`가 SQL 포함으로 다시 호출되는 흐름이다.
- 따라서 React에서 같은 조회 서비스가 두 번 보이는 직접 원인은 토큰 만료 감지 후 interceptor의 원 요청 재시도 흐름이다.

#### Sencha/React 전문 차이 추가 확인
- Sencha SQL은 `DLVRY_DT_FROM`, `DLVRY_DT_TO`가 모두 적용되고, 하단에 `DYNAMIC_QUERY`와 paging 조건까지 포함된다.
- React 실제 SQL은 `LGST_GRP_CD`, `DIV_CD`, `DLVRY_DT_TO`만 적용되고 `DLVRY_DT_FROM`, `DYNAMIC_QUERY`, paging 조건이 누락된 형태로 보인다.
- React `DepartArrivalManagementController.tsx`의 `buildSearchParams()`가 `SRCH_DLVRY_DT_FROM`을 찾지만, 공통 SearchFilters의 날짜 range key는 보통 `*_FRM`/`*_TO` 계열이므로 from 값 매핑이 누락될 수 있다.
- 또한 `fetchList(_params)`가 SearchFilters에서 만든 `_params`를 버리기 때문에 `DYNAMIC_QUERY`, `dsSearchCondition`, `page`, `limit`이 API로 전달되지 않는다.

#### 수정 파일과 변경 이유
- 없음. 사용자 요청 범위가 원인 확인이므로 코드 수정은 보류했다.

#### 다음 수정 시 우선순위
- `DepartArrivalManagementController.tsx`의 `fetchList`가 `_params`를 보존하도록 수정한다.
- 날짜 range key를 `SRCH_DLVRY_DT_FRM`/`SRCH_DLVRY_DT_TO` 또는 실제 meta key 기준으로 맞춰 `DLVRY_DT_FROM`, `DLVRY_DT_TO`를 구성한다.
- Sencha SQL과 같은 추가 조건 반영이 필요하면 `DepartArrivalManagement.tsx`의 `searchProps.paramMode`를 `DYNAMIC_QUERY`로 둘지 검토한다.
- 최초 빈 호출 자체는 토큰 만료 재시도 흐름이므로, 조회조건 수정 대상이라기보다는 토큰 갱신 정책/만료 시점 확인 대상이다.

### 2026-06-22 - 토큰 만료 설정 및 조회 파라미터 누락 성격 확인

#### 작업 범위
- React 최초 빈 호출이 발생한 토큰 만료/refresh 설정 위치를 확인했다.
- 조회 파라미터 누락이 화면 고유 문제인지 공통 전환 패턴에서 반복될 수 있는지 확인했다.

#### 확인한 소스
- `src/app/http/client.ts`
- `src/app/services/auth/auth.ts`
- `src/app/services/auth/authApi.ts`
- `src/pages/LoginPage.tsx`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\resources\application.properties`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\resources\resource\security\vc-securityPolicy-local.properties`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\java\com\vc\mdl\adm\session\SsoLoginUser.java`
- `src/features/tms/ifmonitoring/rcvlist/dlvryDoc/IfDeliveryDocument.tsx`
- `src/features/tms/ifmonitoring/rcvlist/dlvryDoc/IfDeliveryDocumentController.tsx`
- `src/features/tms/kpi/pcrpt/PodColectionReportController.tsx`
- `src/features/tms/execution/cntr/DspchContainerController.tsx`

#### 토큰 만료 확인 결과
- React는 로그인 응답의 `ACCESS_TOKEN`, `REFRESH_TOKEN`을 `sessionStorage`에 저장한다.
- React에는 access token 만료 시간을 직접 설정하거나 사전 계산하는 로직이 없다.
- `app/http/client.ts`는 서버 응답의 `msg`가 `MSG_ACCESS_EXPIRED`이면 `/sessionService/refreshToken` 호출 후 원 요청을 재시도한다.
- 백엔드 `application.properties`에는 `/sessionService/refreshToken`이 로그인 체크 제외 URI로 등록되어 있다.
- `vc-securityPolicy-local.properties`에는 `security.jwtKey`는 있으나 access/refresh token 만료 시간 설정은 확인되지 않았다.
- JWT 생성과 재발급은 `com.vc.fw.srvc.ses.jwt.JwtSessionLoginUser` 등 프레임워크 영역에서 처리되는 것으로 보이며, 현재 프로젝트 소스 안에서는 만료 시간 상수를 확정하지 못했다.

#### 조회 파라미터 누락 성격
- `IfDeliveryDocument`는 View의 `searchProps.excludes`로 날짜 range를 `DLVRY_DT_FROM`/`DLVRY_DT_TO`에 매핑하고 Controller는 `params`를 그대로 API에 전달한다.
- `PodColectionReport`는 수동 매핑을 하더라도 `api.getMainList({ ...params, ...getSearchParams() })`처럼 SearchFilters의 `_params`를 보존한다.
- `DepartArrivalManagement`는 수동 매핑을 하면서 `_params`를 버리기 때문에 `DYNAMIC_QUERY`, `dsSearchCondition`, `page`, `limit`이 누락된다.
- `DspchContainerController`에도 `_params`를 버리고 `rawFiltersRef` 기반 `buildSearchParams()`만 전달하는 유사 패턴이 확인되어, 같은 유형의 누락 가능성이 있다.

#### AGENTS.md 또는 공통 지침에 추가할 후보
- Sencha `searchByConditions` 화면을 React로 전환할 때는 `fetchList(params)`의 `params`를 버리지 않는다.
- Sencha에서 명시 파라미터를 별도로 구성하더라도 React에서는 `{ ...params, ...manualParams }` 형태로 SearchFilters 공통 파라미터를 보존한다.
- 날짜 range는 SearchFilters raw key가 `*_FRM`/`*_TO`로 생성될 수 있으므로 `*_FROM`만 참조하지 않는다.
- Sencha의 `getCompToParam`/`getCompToParamExclude`로 추가되는 `dsSearchCondition`, `DYNAMIC_QUERY`, paging 조건이 필요한 화면인지 SQL mapper까지 확인한다.
- View의 `searchProps.excludes`로 해결 가능한 날짜/컬럼 매핑은 Controller 수동 변환보다 우선 검토한다.

#### 검증 결과
- 정적 소스 분석만 수행했다.
- 코드 수정이 없어 lint/build는 실행하지 않았다.

### 2026-06-22 - 인수증조회 POD 팝업 구현

#### 작업 범위
- `BTN_SHOW_POD` 클릭 시 Sencha `DepartArrivalManagementPodPop`에 대응되는 React 팝업을 구현했다.
- POD 목록 grid, POD 이미지 파일 grid, 이미지/PDF 미리보기 영역을 팝업 내부에 구성했다.

#### 확인한 Sencha 소스
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\execution\arrdep\DepartArrivalManagementController.js`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\execution\arrdep\pop\DepartArrivalManagementPodPop.js`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\execution\arrdep\pop\DepartArrivalManagementPodPopController.js`
- `C:\DEV_TMS\git\olympusboot3\olympusboot3\src\main\webapp\resource\app\vc\view\mdl\tms\execution\arrdep\pop\DepartArrivalManagementPodPopModel.js`

#### 비교한 React 참고 화면
- `src/features/tms/execution/podrpt/PodReport.tsx`
- `src/features/tms/execution/podrpt/PodReportController.tsx`
- `src/features/tms/execution/podrpt/popup/PodImagePanel.tsx`
- `src/features/tms/execution/podrpt/popup/PdfPop.tsx`

#### Sencha 비교 결과
- Sencha `onShowPod`는 선택된 단건의 `DSPCH_NO`를 팝업에 전달한다.
- 팝업은 `/podService/searchPodPop`으로 POD 목록을 조회하고 첫 row 또는 선택 row의 `POD_ID`로 `/podService/searchPodPopDetail`을 조회한다.
- POD 이미지 grid 더블클릭은 파일 열람 흐름이다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
  - `searchPodPop`, `searchPodPopDetail`, POD 파일 다운로드 API를 추가했다.
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - `BTN_SHOW_POD`가 임시 처리 대신 `PodPopup`을 열도록 연결했다.
  - Sencha처럼 미선택/다건 선택 시 안내 후 팝업을 열지 않도록 했다.
- `src/features/tms/execution/arrdep/popup/PodPopup.tsx`
  - POD 목록 grid, POD 이미지 파일 grid, 기존 POD 미리보기 컴포넌트 기반 preview 영역을 신규 구현했다.
  - 상세 이미지 목록 응답에 `POD_ID`가 없을 수 있어 부모 POD row의 `POD_ID`를 파일 row에 보완한 뒤 다운로드하도록 했다.

#### 알려진 미구현/주의사항
- 이미지/PDF 미리보기는 기존 `PodReport`의 blob 다운로드 + `PodImagePanel`/`PdfPop` 패턴을 재사용한다.
- 서버 응답에 `FILE_ID`, `POD_ID`, 파일명이 없으면 미리보기를 표시할 수 없다.
- 다건 선택 시 Sencha 기준에 맞춰 단건 선택 안내 후 팝업을 열지 않는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 체크리스트
- 메인 row 미선택 시 선택 안내가 표시되는지 확인
- 메인 row 다건 선택 시 단건 선택 안내가 표시되는지 확인
- 단건 선택 후 인수증조회 클릭 시 팝업이 열리는지 확인
- 팝업 open 시 `DSPCH_NO` 기준 POD 목록이 조회되는지 확인
- 첫 POD 또는 POD row 클릭 시 `POD_ID` 기준 이미지 목록이 조회되는지 확인
- 이미지 row 클릭 시 preview가 표시되는지 확인
- 이미지 row 더블클릭 시 전체보기 팝업이 표시되는지 확인

### 2026-06-22 - 입차시각 팝업 날짜 선택 혼합형 UI 적용

#### 작업 범위
- 입차시각 팝업의 날짜 입력을 직접 입력 중심에서 달력 선택 가능 방식으로 변경했다.
- 시간 입력과 빠른 보정 버튼은 유지했다.

#### 원인 분석
- 기존 React 팝업은 `현재시각`, `-10분`, `+10분`, `+30분` 보정은 빠르지만 특정 날짜를 고를 때 직접 입력해야 했다.
- Sencha `exdatetimefield`는 달력에서 날짜를 고르는 흐름이 있어 날짜 변경 효율이 더 좋다.
- 이전에 `DatePickerPopover withTime`을 사용했을 때는 시간 패널이 팝업 안에서 겹쳤으므로, 날짜만 공통 picker를 사용하고 시간은 별도 입력으로 유지하는 혼합형이 적합하다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
  - 날짜 입력을 `DatePickerPopover size="lg"`로 변경했다.
  - 시간 입력은 `HH:MM:SS` 숫자 mask 입력을 유지했다.
  - 빠른 보정 버튼 class를 공통 상수로 정리했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아님.

#### 수동 검증 체크리스트
- 입차시각 팝업에서 날짜 필드의 달력 아이콘 클릭 시 달력이 열리는지 확인
- 달력에서 날짜 선택 시 날짜 값이 반영되고 달력이 닫히는지 확인
- 시간 입력과 `현재시각`, `-10분`, `+10분`, `+30분` 버튼이 기존처럼 동작하는지 확인
- 저장 시 `TRNS_STDT_DATE`가 `YYYYMMDDHHmmss` 형식으로 전달되는지 확인
- 팝업 바깥 영역 클릭 시 입차시각 팝업이 닫히지 않는지 확인

#### 다음에 먼저 볼 것
- 날짜/시간 picker가 다시 겹치면 `DatePickerPopover withTime` 사용 여부를 먼저 확인한다.
- 업무 팝업에서 일시 입력이 필요하면 날짜 picker와 시간 입력을 분리하는 혼합형을 우선 검토한다.

### 2026-06-22 - 하단 탭 그리드 pagination 데이터 사라짐 수정

#### 작업 범위
- 출/도착관리 하단 탭 그리드의 페이지당 행 개수와 페이지 이동 동작을 수정했다.
- 대상 그리드는 `stopover`, `assignedOrder`, `shipmentDetail`이다.

#### 원인 분석
- 하단 그리드는 메인 행 선택 후 cascade API로 전체 row를 받아와 화면에서 표시하는 구조다.
- `model.bind()`가 모든 그리드에 공통 `onPageChange`를 주입하고 있었고, 이 콜백은 메인 SearchFilters 조회를 다시 호출한다.
- 그래서 하단 그리드의 끝/다음 화살표를 누르면 하단 그리드 자체 페이지 이동이 아니라 메인 조회 흐름이 다시 실행되어 하단 자료가 초기화되는 증상이 발생했다.
- 또한 하단 그리드 rowData를 페이지 단위로 자르지 않아 1,003건 전체가 들어온 상태에서 pagination bar만 500건 단위처럼 보이는 상태였다.

#### 수정 파일과 변경 이유
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - 하단 세 그리드 전용 client-side pagination 상태를 추가했다.
  - 기본 pageSize를 500으로 두고, page/pageSize 변경 시 하단 rowData만 slice해서 반환하도록 했다.
  - 메인 행 또는 할당주문 행 변경 시 관련 하단 페이지를 1페이지로 초기화하도록 했다.
- `src/features/tms/execution/arrdep/DepartArrivalManagement.tsx`
  - 하단 `DataGrid`에 `ctrl.*PageProps`를 `model.bind()` 뒤에 spread하여 메인 조회용 pagination 콜백을 덮어쓰도록 했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아님.

#### 수동 검증 체크리스트
- 하단 경유처 탭에서 1,003건 조회 시 페이지당 행 개수가 500으로 표시되는지 확인
- 하단 경유처 탭에서 마지막/다음/이전/처음 화살표 클릭 시 하단 자료가 사라지지 않고 페이지가 이동하는지 확인
- 하단 경유처 탭에서 pageSize를 변경하면 1페이지부터 다시 표시되는지 확인
- 메인 그리드 다른 행 선택 시 하단 탭 page가 1페이지로 초기화되는지 확인
- 할당주문 탭과 배송상세 그리드에서도 페이지 버튼 클릭 시 메인 조회가 재실행되지 않는지 확인

#### 다음에 먼저 볼 것
- 하단 cascade 그리드에서 pagination 버튼 클릭 시 자료가 사라지면 `model.bind()`의 공통 `onPageChange`가 메인 SearchFilters를 호출하고 있는지 먼저 확인한다.
- cascade로 전체 row를 받아오는 하위 그리드는 서버 paging이 아니라 client-side slice pagination이 필요한지 확인한다.

### 2026-06-23 - 공통 컴포넌트 변경 원복 및 화면 내부 보완

#### 작업 범위
- `src/app/components` 하위 공통 파일 변경을 원복했다.
- 공통 `rowStatus` dirty 판정 보완은 제거하고, `DepartArrivalManagement` 화면 내부 저장 직전에만 `MEMO_DESC`, `REF_VAL_1`~`REF_VAL_12` 변경 여부를 보완하도록 변경했다.
- 공통 popup overlay 옵션을 제거하면서 입차시각 팝업 호출부의 `closeOnOverlayClick:false` 사용도 제거했다.

#### 원인 분석
- `rowStatus.ts`, `PopupContext.tsx`, `PopupShell.tsx`는 공통 영역이라 화면 개발자가 임의로 수정하면 다른 화면/담당자 작업 의도를 침범할 수 있다.
- `rowStatus.ts` 원복 시 원본 데이터에 없던 REF 계열 필드가 저장 직전에 dirty로 잡히지 않을 수 있어 화면 전용 보완 로직이 필요했다.
- `PopupContext.tsx`/`PopupShell.tsx` 원복 시 `closeOnOverlayClick` 속성은 더 이상 사용할 수 없으므로 호출부에서도 제거해야 한다.

#### 수정 파일과 변경 이유
- `src/app/components/grid/gridUtils/rowStatus.ts`
  - 공통 dirty 비교 변경을 원복했다.
- `src/app/components/popup/PopupContext.tsx`
  - 공통 popup payload의 `closeOnOverlayClick` 확장을 원복했다.
- `src/app/components/popup/PopupShell.tsx`
  - overlay 클릭 제어 옵션을 원복하고 공통 기본 동작을 유지했다.
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
  - 입차시각 팝업 호출에서 `closeOnOverlayClick:false`를 제거했다.
  - 메인 저장 직전에 화면 전용 `markMainDirtyByTrackedFields`를 호출해 `MEMO_DESC`, `REF_VAL_1`~`REF_VAL_12` 변경 row를 `EDIT_STS:"U"`로 보정한다.

#### 기존과 다르게 동작하는 부분
- 입차시각 팝업은 공통 popup 기본 동작에 따라 팝업 바깥 영역 클릭 시 닫힐 수 있다.
- REF/메모 컬럼 dirty 보정은 전역 공통이 아니라 출/도착관리 메인 저장 버튼에서만 적용된다.
- 다른 화면의 grid dirty 판정과 popup overlay 동작에는 이번 보완 로직이 적용되지 않는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

### 2026-06-23 - 공통 기준/코딩 스타일 재검토 후 보완

#### 검토 결과
- 공통 `src/app/components` 변경은 남아 있지 않다.
- `StartWorkPopup`은 `FormPopupLayout` + `DatePickerPopover` 조합으로 팝업 문서 기준과 맞는다.
- `PodPopup`은 기존 `PodReport`의 `PodImagePanel`/`PdfPop` 파일 미리보기 패턴을 재사용해 파일 열람 방식이 튀지 않는다.
- 다만 `DepartArrivalManagementController.tsx`에서 저장 직전에 `__orig__`를 직접 참조하는 방식은 공통 내부 구현에 기대는 모양이라 결이 좋지 않았다.

#### 수정 내용
- `DepartArrivalManagementController.tsx`의 `markMainDirtyByTrackedFields`를 제거했다.
- 조회 결과를 `model.grids.main.setData` 하기 전에 `normalizeMainRows`로 `MEMO_DESC`, `REF_VAL_1`~`REF_VAL_12` 누락 필드를 빈 문자열로 보강하도록 변경했다.
- 이 방식은 공통 `useBaseModel`의 원본 스냅샷 생성 전에 화면 데이터 형태를 정규화하므로 공통 내부 필드명에 직접 의존하지 않는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

### 2026-06-24 - 메인 grid 비고 컬럼 헤더 언어팩 기준 보정

#### 작업 대상
- React 출/도착관리 `DepartArrivalManagementColumns.tsx` 메인 grid `REF_VAL_1` ~ `REF_VAL_12` 컬럼

#### 확인한 Sencha 소스
- `DepartArrivalManagementMainGrid.js`
  - `REF_VAL_1` ~ `REF_VAL_12` 컬럼은 한글 하드코딩이 아니라 `Lang.get('LBL_REFERENCE') + '1'` 형식으로 정의되어 있다.

#### 원인 분석
- React 컬럼 파일에는 해당 컬럼 헤더가 `비고1` ~ `비고12` 한글 문자열로 직접 들어가 있었다.
- Sencha 원본 기준으로는 `LBL_REFERENCE` 언어팩 값을 기준으로 번호를 붙여야 하므로 React 컬럼 정의도 같은 방식으로 맞추는 것이 적절하다.
- React 공통 grid 컬럼 처리에는 header suffix 전용 옵션이 없어서, 화면 컬럼 파일에서 `Lang.get("LBL_REFERENCE")` 결과에 번호를 붙이고 `noLang: true`로 중복 번역을 막는 방식으로 적용했다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`

#### 수정 내용
- `Lang` import 추가
- `referenceHeader(index)` helper 추가
- `REF_VAL_1` ~ `REF_VAL_12`의 `headerName`을 `referenceHeader(1)` ~ `referenceHeader(12)`로 변경

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아님.

#### 미구현/주의사항
- 원본 Sencha도 순수 `textEx: 'LBL_REFERENCE_1'` 같은 별도 언어팩 키가 아니라 `Lang.get('LBL_REFERENCE') + 번호` 조합 방식이다.
- 따라서 React도 별도 언어팩 키를 만들지 않고 Sencha 방식에 맞춰 조합했다.

### 2026-06-24 - 미개발 팝업 재확인 및 구현 가능 항목 반영

#### 작업 대상
- React 출/도착관리 main grid 버튼
  - `BTN_DRIVE_HISTORY`
  - `BTN_START_TRANSPORTATION`
- React 출/도착관리 stopover grid 버튼
  - `BTN_SHOW_ROUTE`

#### 확인한 Sencha 소스
- `DepartArrivalManagementController.js`
  - `showVehicleRealPath`: `DepartArrivalManagementShowRealPath` 팝업 호출
  - `onShowRouteMap`: `DepartArrivalManagementRouteMapPop` 팝업 호출
  - `onStartTransportation`: `DepartArrivalManagementTransitPop` 팝업 호출 후 `/departArrivalManagementService/onStartTransportation` 저장
- `pop/DepartArrivalManagementShowRealPath*.js`
  - `vc.view.common.map.MapController` 기반
  - `/mapService/getDlvryRoute`, `/traceService/searchDispathTrace` 사용
- `pop/DepartArrivalManagementRouteMapPop*.js`
  - `vc.view.common.map.MapController` 기반
  - `/mapService/getDlvryRoute`, `/mapService/getExpectedRoute`, `/traceService/searchDispathTrace` 사용
- `pop/DepartArrivalManagementTransitPop*.js`
  - 운송출발일시 입력 후 `TRNS_STDT_DATE`를 callback으로 반환

#### 원인 분석
- `BTN_DRIVE_HISTORY`는 React에서 존재하지 않는 `/departArrivalManagementService/controlRoute`에 임시 연결되어 있어 Sencha 동작과 달랐다.
- `BTN_START_TRANSPORTATION`은 Sencha에서 출발일시 팝업을 거친 뒤 저장하지만 React는 선택 row를 즉시 저장 API로 전달하고 있었다.
- `BTN_SHOW_ROUTE`는 Sencha에서 예상경로와 실제경로를 동시에 표시하는 지도 팝업이다. 현재 React 공통 `TmapView`는 존재하며 단일 trace와 stop marker를 지원한다. 다만 `drawTrace`는 호출 시 기존 trace를 교체하므로 예상경로/실제경로를 동시에 표시하려면 popup 내부에서 `getMap()`으로 보조 polyline을 직접 관리하거나, 공통에 다중 polyline layer API를 추가해야 한다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/popup/DriveHistoryPopup.tsx`
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`

#### 수정 내용
- `BTN_DRIVE_HISTORY`
  - `DriveHistoryPopup` 신규 구현
  - 선택 row 단건 검증 후 popup open
  - `/mapService/getDlvryRoute`로 정차지 marker 표시
  - `/traceService/searchDispathTrace`로 실제 운행 trace 표시
- `BTN_START_TRANSPORTATION`
  - Sencha `DepartArrivalManagementTransitPop` 기준으로 일시 입력 popup을 거치도록 변경
  - 기존 `StartWorkPopup`에 `messageKey` 옵션을 추가해 같은 Date/Time UI를 재사용
  - popup 확인 시 `ATD_DTTM`, `EDIT_STS`, `rowStatus`, `MENU_CD`를 반영 후 `/departArrivalManagementService/onStartTransportation` 호출
  - Sencha와 같이 첫 상차지(`STOP_TP = 10`)의 `ATA_DTTM`보다 운송출발일시가 빠르면 `MSG_ARR_DEP_DEP_DATETIME_PRIOR_CHK`로 중단

#### 공통 필요/미구현
- `BTN_SHOW_ROUTE`
  - Sencha 팝업: `DepartArrivalManagementRouteMapPop`
  - React 구현 보류
  - 사유: Sencha는 `showDispatchRoutes`, `showExpectedPath`, `showRealPath`를 한 지도에 동시에 표시한다. React `TmapView`는 존재하지만 `drawTrace`는 단일 trace 교체 방식이다.
  - 화면 내부 구현 가능성: `TmapView.getMap()`으로 popup 전용 expected route polyline을 직접 생성/정리하면 공통 수정 없이 구현 가능할 수 있다.
  - 공통에 필요할 수 있는 내용: 복수 polyline layer 관리, layer별 clear/fit, 예상경로와 실제경로 색상/스타일 분리, 기존 trace/stop marker와의 동시 표시 규칙
- `LBL_SERVICE_ACTIVITY` 셀 클릭 팝업
  - Sencha 팝업: `SrvcAtvtPop`, `SrvcAtvtFilePop`
  - React 구현 보류
  - 사유: stopover grid의 `SRVC_ATVT_YN` 셀 클릭으로 열리는 grid + 이미지 패널 + 파일첨부 팝업이며, `SrvcAtvtFilePop`은 `exfilefield` 기반 png 업로드를 사용한다.
  - 공통/추가 확인 필요 내용: 파일 업로드/다운로드/미리보기 공통 패턴, grid `popuser` 편집 방식, 서비스활동 이미지 패널 표시 규칙

#### 수동 검증 체크리스트
- main grid row 미선택 또는 다건 선택 후 `BTN_DRIVE_HISTORY` 클릭 시 단건 선택 안내가 표시되는지 확인
- main grid row 단건 선택 후 `BTN_DRIVE_HISTORY` 클릭 시 지도 popup이 열리고 정차지와 실제 운행 trace가 표시되는지 확인
- `BTN_START_TRANSPORTATION` 클릭 시 운송출발일시 popup이 열리는지 확인
- 운송출발일시 저장 시 `/departArrivalManagementService/onStartTransportation` payload가 `{ dsSave: [...] }` 구조이며 `ATD_DTTM`이 반영되는지 확인
- 첫 상차지 도착시각보다 빠른 운송출발일시 입력 시 저장이 중단되는지 확인

### 2026-06-24 - BTN_SHOW_ROUTE 경로조회 지도 팝업 구현

#### 작업 대상
- React 출/도착관리 하단 경유처 grid 버튼 `BTN_SHOW_ROUTE`

#### 확인한 지침 문서
- `AGENTS.md`
- `docs/claude/popup.md`
- `docs/claude/frontend-audit.md`

#### 확인한 Sencha 소스
- `DepartArrivalManagementSubGrid01.js`
  - `BTN_SHOW_ROUTE` handler: `onShowRouteMap`
- `DepartArrivalManagementController.js`
  - `onShowRouteMap`에서 main grid 선택 row와 subGrid01 records를 `DepartArrivalManagementRouteMapPop`으로 전달
- `pop/DepartArrivalManagementRouteMapPop.js`
- `pop/DepartArrivalManagementRouteMapPopMain.js`
- `pop/DepartArrivalManagementRouteMapPopController.js`
  - `showDispatchRoutes(dspchNo)`
  - `showExpectedPath(dspchNo)`
  - `showRealPath(dspchNo)`
- `vc/view/common/map/MapController.js`
- `vc/view/common/map/AbstractMap.js`
- `vc/view/common/map/TMap.js`

#### 확인한 React 소스
- `src/app/components/map/TmapView.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
- `src/features/tms/execution/arrdep/popup/DriveHistoryPopup.tsx`

#### 원인 분석
- React 하단 경유처 grid의 `BTN_SHOW_ROUTE`는 버튼만 있고 `onClick`이 빈 함수라 클릭해도 아무 동작이 없었다.
- Sencha RouteMap 팝업은 정차지, 예상경로, 실제경로를 한 지도에 같이 표시한다.
- React 공통 `TmapView`는 `drawTrace`가 단일 trace polyline을 교체하는 구조라 예상경로와 실제경로를 모두 `drawTrace`로 처리하면 한쪽이 지워질 수 있다.
- 공통 컴포넌트를 수정하지 않는 조건에서는 팝업 내부에서 `TmapView.getMap()`으로 TMAP 원본 map 객체를 얻고, 예상경로 polyline만 팝업 로컬 상태로 생성/정리하는 방식이 적합하다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/popup/RouteMapPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `/mapService/getExpectedRoute` API wrapper를 추가했다.
- `RouteMapPopup`을 신규 작성했다.
  - `/mapService/getDlvryRoute`로 정차지 marker 표시
  - `/mapService/getExpectedRoute`로 예상경로 royalblue/yellow direction polyline 표시
  - `/traceService/searchDispathTrace`로 실제경로 black trace 표시
  - 예상경로는 `TmapView.getMap()` 기반 popup-local `Tmapv2.Polyline`으로 관리하고 unmount 시 정리
- `BTN_SHOW_ROUTE`를 `onShowRouteMap`에 연결했다.
- Sencha와 동일하게 하단 버튼이지만 조회 기준은 main grid 선택 row의 `DSPCH_NO`를 사용한다.

#### 미구현/주의사항
- Sencha의 예상경로 거리/시간 info window(`showDInfo`)는 이번 범위에서 구현하지 않았다.
- 서비스활동 관련 `SrvcAtvtPop`, `SrvcAtvtFilePop`은 파일 업로드/이미지 패널 공통 패턴 확인이 필요하여 계속 미구현 상태다.
- 공통 `TmapView`는 수정하지 않았다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아님

#### 수동 검증 포인트
- 메인 row 미선택 상태에서 `BTN_SHOW_ROUTE` 클릭 시 선택 안내가 표시되는지 확인
- 메인 row 선택 후 하단 경유처 grid의 `BTN_SHOW_ROUTE` 클릭 시 경로조회 popup이 열리는지 확인
- 지도에 정차지 marker, 예상경로 royalblue 선, 실제경로 black 선이 함께 표시되는지 확인
- popup을 닫았다가 다시 열었을 때 이전 예상경로 polyline이 남지 않는지 확인

### 2026-06-25 - BTN_SHOW_ROUTE 정차지 목록 스크롤 보정

#### 작업 대상
- React 출/도착관리 `BTN_SHOW_ROUTE` 배차운행경로 팝업
- 좌측 정차지 목록 패널

#### 원인 분석
- 기존 구현은 공통 `TmapView.drawStopMarkers()`를 호출하여 공통 지도 내부의 `StopListPanel`을 표시했다.
- 해당 공통 패널은 대량 정차지(예: 1001건)에서 높이 제한과 세로 스크롤 영역이 충분히 분리되어 있지 않아 목록 하단을 볼 수 없고 휠 이동도 지도 이벤트와 섞일 수 있었다.
- 공통 컴포넌트를 직접 수정하면 다른 지도 화면에 영향을 줄 수 있으므로, `RouteMapPopup` 내부에서만 정차지 목록과 정차지 marker를 별도로 관리하는 방식으로 수정했다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/RouteMapPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `TmapView.drawStopMarkers()` 호출을 제거했다.
- 팝업 내부에 `bottom/top`이 고정된 스크롤 가능한 정차지 패널을 추가했다.
- 정차지 패널에 `overflow-y-auto`, `min-h-0`, `onWheel stopPropagation`을 적용하여 목록 내부에서 스크롤되도록 했다.
- 정차지 marker는 `TmapView.getMap()`으로 얻은 TMAP 원본 map에 popup-local `Tmapv2.Marker`로 직접 표시하고, 팝업 unmount 시 정리하도록 했다.
- 예상경로/실제경로 표시 방식은 유지했다.

#### 미구현/주의사항
- 공통 `TmapView`는 수정하지 않았다.
- 이 보정은 `RouteMapPopup` 전용이므로 다른 지도 화면의 공통 정차지 패널 동작에는 영향이 없다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아님

#### 수동 검증 포인트
- 정차지 1000건 이상인 배차운행경로 팝업에서 좌측 정차지 목록에 세로 스크롤이 표시되는지 확인
- 목록 위에서 마우스 휠을 움직일 때 지도가 확대/축소되지 않고 목록이 위아래로 이동하는지 확인
- 팝업을 닫았다가 다시 열었을 때 이전 정차지 marker가 남지 않는지 확인

### 2026-06-25 - BTN_DRIVE_HISTORY 배차운행경로관제 정차지 목록 스크롤 보정

#### 작업 대상
- React 출/도착관리 상단 버튼 `BTN_DRIVE_HISTORY`
- 팝업: `DriveHistoryPopup`

#### 원인 분석
- 사용자가 첨부한 화면 제목은 `배차운행경로관제`로, 하단 경유처 grid의 `BTN_SHOW_ROUTE` 팝업이 아니라 상단 main grid 버튼의 `DriveHistoryPopup`이었다.
- 앞선 보정은 `RouteMapPopup`에만 적용되어 해당 화면에는 영향이 없었다.
- `DriveHistoryPopup`도 공통 `TmapView.drawStopMarkers()`를 통해 공통 지도 내부 정차지 목록을 사용하고 있어, 정차지가 많을 때 좌측 목록의 내부 스크롤 조작이 안정적으로 동작하지 않았다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/DriveHistoryPopup.tsx`
- `src/features/tms/execution/arrdep/popup/RouteMapPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `DriveHistoryPopup`에서 공통 `drawStopMarkers()` 호출을 제거하고, 팝업 내부 전용 정차지 목록과 marker를 관리하도록 변경했다.
- 좌측 정차지 목록에 `overflow-y-auto`, `min-h-0`, `scrollbarGutter`, `onWheelCapture` 기반 wheel 처리 보정을 적용했다.
- marker는 `TmapView.getMap()`으로 얻은 TMAP 원본 map에 popup-local `Tmapv2.Marker`로 표시하고, 팝업 종료 시 정리한다.
- `RouteMapPopup`에도 동일한 wheel 보정을 적용해 하단 경로조회 팝업과 상단 배차운행경로 팝업의 동작 결을 맞췄다.

#### 미구현/주의사항
- 공통 `TmapView`는 수정하지 않았다.
- 이 보정은 출/도착관리의 두 팝업 내부에 한정된다. 다른 지도 화면의 공통 정차지 목록 동작에는 영향을 주지 않는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 포인트
- 상단 `배차운행경로관제` 팝업에서 정차지 1000건 이상 조회 시 좌측 목록에 세로 스크롤이 표시되는지 확인
- 좌측 목록 위에서 마우스 wheel 조작 시 지도 zoom이 아니라 목록 스크롤이 동작하는지 확인
- 팝업을 닫았다 다시 열었을 때 이전 marker가 남지 않는지 확인

### 2026-06-25 - 지도 정차지 패널 접기/펼치기 복원

#### 작업 대상
- React 출/도착관리 `DriveHistoryPopup`
- React 출/도착관리 `RouteMapPopup`

#### 원인 분석
- 공통 `TmapView.drawStopMarkers()`를 사용하지 않고 팝업 내부 전용 정차지 패널로 변경하면서, 기존 공통 `StopListPanel`의 헤더 클릭 접기/펼치기 동작이 함께 이관되지 않았다.
- 스크롤은 팝업 내부 패널에서 가능해졌지만, 사용자가 패널을 접어 지도 영역을 넓게 보는 흐름이 사라졌다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/DriveHistoryPopup.tsx`
- `src/features/tms/execution/arrdep/popup/RouteMapPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- 두 팝업에 `isStopListExpanded` 상태를 추가했다.
- 정차지 5개 이상이면 공통 `StopListPanel`처럼 기본 접힘 상태로 시작하도록 했다.
- 정차지 패널 헤더를 버튼으로 변경하고 클릭 시 펼침/접힘 토글이 되도록 했다.
- 패널 높이는 `max-h-[calc(100%-24px)]`로 제한해 펼친 상태에서도 팝업 내부를 벗어나지 않도록 했다.
- 깨져 있던 정차지/출발/도착 화면 표시 문자열을 정상 한글로 보정했다.

#### 미구현/주의사항
- 공통 `TmapView`는 수정하지 않았다.
- 이 보정은 출/도착관리의 지도 팝업 두 개에 한정된다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 포인트
- 정차지 1000건 이상일 때 패널이 기본 접힘 상태로 표시되는지 확인
- 정차지 헤더 클릭 시 목록이 펼쳐지고 다시 클릭하면 접히는지 확인
- 펼친 상태에서 목록 wheel 스크롤이 정상 동작하는지 확인

### 2026-06-25 - 하단 경유처 grid Sencha 편집 가능 컬럼 보정

#### 작업 대상
- React 출/도착관리 하단 `경유처` grid
- Sencha 기준: `DepartArrivalManagementSubGrid01.js`

#### 확인한 지침 문서
- `AGENTS.md`
- `docs/claude/column-rules.md`
- `docs/claude/screen-architecture.md`
- `docs/claude/frontend-audit.md`

#### 확인한 Sencha 소스
- `vc/view/mdl/tms/execution/arrdep/DepartArrivalManagementSubGrid01.js`

#### 확인한 React 소스
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagement.tsx`

#### 원인 분석
- Sencha 하단 경유처 grid는 `ATA_DTTM`, `ATD_DTTM` 컬럼이 `excolumneditor` + `editType:'datetime'`이고 `editDisabled`가 없어 기존 행 편집 가능 대상이다.
- React `STOPOVER_COLUMN_DEFS`에서는 해당 컬럼이 `type:'text'`였고 `editable:true`가 없어 공통 Grid 규칙상 읽기 전용으로 동작했다.
- Sencha의 날짜 선후관계 `userValidators`도 React 저장 흐름에는 반영되어 있지 않았다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `ATA_DTTM`, `ATD_DTTM`을 `type:'datetime'`, `editable:true`로 변경해 기존 행에서 날짜/시간 선택이 가능하도록 했다.
- Sencha에서 읽기 전용인 `ETA_DTTM`, `ETD_DTTM`은 `datetime` 표시 타입으로만 맞추고 `editable:false`, `insertable:false`로 유지했다.
- `STOP_TP`는 Sencha처럼 기존 행 편집은 막고 신규 행 입력만 가능한 `combo + insertable:true`로 보정했다.
- `LOC_ID`, `STT_CD`, `CTY_CD` 등 Sencha hidden 컬럼을 React 컬럼에도 보강했다.
- Sencha `userValidators`의 주요 시간 검증을 React 저장 전 `beforeSave` 검증으로 추가했다.
  - 출발시간이 있는데 도착시간이 없는 경우 차단
  - 출발시간이 도착시간보다 빠른 경우 차단
  - 이전 경유처 출발시간보다 현재 도착시간이 빠른 경우 차단
  - 최초 상차지 출발시간보다 이전 시간 입력 차단
- 주석 처리된 `BTN_INTER_STOP_ETA` 재사용성을 유지하면서 lint 경고가 나지 않도록 handler 이름을 `_onShowInterStopEta`로 보정했다.

#### 미구현/주의사항
- Sencha의 셀 단위 `userValidators`는 React 공통 grid에 동일 확장 포인트가 확인되지 않아 저장 전 검증으로 반영했다.
- Sencha `SRVC_ATVT_YN` 컬럼의 클릭형 서비스활동 팝업 연동은 이번 범위에서 추가하지 않았다.
- 공통 grid/component 파일은 수정하지 않았다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.

#### 수동 검증 포인트
- 하단 경유처 grid에서 `도착시각(ATA_DTTM)`, `출발시각(ATD_DTTM)` 셀의 날짜/시간 선택 UI가 표시되는지 확인
- 두 컬럼 수정 후 저장 시 `/departArrivalManagementService/saveDepartArrivalManagementStop`로 저장되는지 확인
- 출발/도착 시간 선후관계가 맞지 않을 때 저장이 차단되는지 확인
### 2026-06-25 - 입차/운송출발 시간 입력 팝업 공통 DatePickerPopover 적용

#### 작업 대상
- React 출/도착관리 `BTN_SP_START_WORK`, `BTN_START_TRANSPORTATION`
- 팝업: `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`

#### 확인한 지침 문서
- `AGENTS.md`
- `docs/claude/popup.md`
- `docs/claude/frontend-audit.md`

#### 원인 분석
- 기존 React `StartWorkPopup`은 날짜는 공통 `DatePickerPopover`를 사용했지만, 시간은 별도 input과 화면 전용 빠른 버튼으로 처리하고 있었다.
- 공통 Date/Time picker UX를 공통 영역에서 보정하기로 한 상태라면, 입차시각/운송출발시각 팝업도 화면 전용 시간 입력 UI를 유지하지 않고 공통 picker의 `withTime` 흐름을 따라야 한다.
- 기존 방식은 공통 Date/Time picker 개선 사항이 팝업 시간 입력부에는 온전히 반영되지 않을 수 있었다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- 날짜와 시간을 분리 입력하던 구조를 `DatePickerPopover` 단일 컴포넌트 + `withTime` 사용 구조로 변경했다.
- 내부 값은 `YYYY-MM-DDTHH:mm:ss` 형태로 관리하고, 저장 callback payload는 기존 API 흐름과 동일하게 숫자만 남긴 `TRNS_STDT_DATE`로 전달한다.
- `현재시각`, `-10분`, `+10분`, `+30분` 빠른 조정 버튼은 유지하되 공통 picker 값 자체를 변경하도록 정리했다.
- 공통 컴포넌트, 공통 훅, 공통 유틸은 수정하지 않았다.

#### 미구현/주의사항
- 실제 달력/시간 선택 UI의 팝오버 닫힘 방식, 확인 버튼 제공 여부, 외부 클릭 처리 방식은 공통 `DatePickerPopover` 구현에 따른다.
- 공통에서 Date/Time picker UX를 보정하면 이 팝업도 동일한 흐름으로 영향을 받는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.
- `git diff --name-only -- src\app\components`: 변경 없음
### 2026-06-25 - 서비스활동 컬럼 표시값 및 팝업 연결

#### 작업 대상
- React 출/도착관리 하단 `경유처` grid
- 컬럼: `SRVC_ATVT_YN`
- 팝업: `src/features/tms/execution/arrdep/popup/SrvcAtvtPopup.tsx`

#### 확인한 지침 문서
- `AGENTS.md`
- `docs/claude/column-rules.md`
- `docs/claude/popup.md`
- `docs/claude/frontend-audit.md`

#### 확인한 Sencha 소스
- `vc/view/mdl/tms/execution/arrdep/DepartArrivalManagementSubGrid01.js`
- `vc/view/mdl/tms/execution/arrdep/DepartArrivalManagementController.js`
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPop.js`
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPopMain.js`
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPopController.js`
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPopModel.js`
- `com/vc/mdl/tms/execution/arrdep/DepartArrivalManagementService.java`
- `com/vc/mdl/tms/execution/arrdep/DepartArrivalManagementBiz.java`

#### 확인한 React 소스
- `src/features/tms/execution/arrdep/DepartArrivalManagement.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
- `src/features/tms/execution/arrdep/popup/PodPopup.tsx`
- `src/features/tms/execution/podrpt/PodReportController.tsx`

#### 원인 분석
- Sencha `SRVC_ATVT_YN` 컬럼은 원값 `Y/N`을 그대로 표시하지 않고 `예/아니오`로 렌더링한다.
- Sencha에서는 `STOP_TP !== '99'`인 행에 파란색 밑줄 스타일을 주고, 컬럼 클릭 시 `onClickSrvcAcvt`가 `SrvcAtvtPop`을 연다.
- React에서는 해당 컬럼이 단순 `type:"text"`로만 정의되어 있어 `N`이 그대로 보였고, 셀 클릭 시 팝업을 여는 연결도 없었다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagement.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementController.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`
- `src/features/tms/execution/arrdep/DepartArrivalManagementApi.ts`
- `src/features/tms/execution/arrdep/popup/SrvcAtvtPopup.tsx`

- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `SRVC_ATVT_YN` 컬럼을 `Y -> 예`, 그 외 -> `아니오`로 표시하도록 cellRenderer를 추가했다.
- `STOP_TP !== '99'`인 서비스활동 셀은 Sencha처럼 파란색 밑줄 스타일로 표시했다.
- 하단 경유처 grid에 `gridOptions.onCellClicked`를 연결하여 `SRVC_ATVT_YN` 셀 클릭 시 팝업이 열리도록 했다.
- `SrvcAtvtPopup`을 신규 작성했다.
  - `/departArrivalManagementService/searchSrvcAtvt`로 서비스활동 목록 조회
  - `SRVC_ATVT_TP` 공통코드 combo 표시
  - 추가/저장/닫기 버튼 구성
  - `/departArrivalManagementService/saveSrvcAtvt`로 `{ dsSave: [...] }` 저장
  - `/fileService/downloadFile` + `FILE_DMN_TCD: SERVICE_ACTIVITIES`로 기존 첨부 이미지/PDF 미리보기

#### 미구현/주의사항
- Sencha `ORG_FILE_NM` 컬럼의 `popuser`는 `SrvcAtvtFilePop`을 통해 신규 파일 업로드까지 처리한다.
- 이번 수정은 팝업 노출, 목록 조회, 서비스활동 유형 추가/저장, 기존 첨부 미리보기까지 구현했다.
- 신규 서비스활동 파일 업로드/교체 팝업은 공통 파일 업로드 패턴 확정 후 별도 구현이 필요하다.
- 창고지 행(`STOP_TP === '99'`)은 Sencha와 동일하게 서비스활동 팝업을 열지 않는다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
  - 기존 Vite dynamic/static import chunk warning은 출력되었으나 빌드 실패는 아니다.
- `git diff --name-only -- src\app\components`: 변경 없음

#### 수동 검증 포인트
- 경유처 grid의 서비스활동 값이 `N`이 아니라 `아니오`로 표시되는지 확인한다.
- `Y` 값은 `예`로 표시되는지 확인한다.
- 창고지가 아닌 행의 서비스활동 셀 클릭 시 서비스활동 팝업이 열리는지 확인한다.
- 창고지 행(`STOP_TP = 99`)은 클릭해도 팝업이 열리지 않는지 확인한다.
- 팝업에서 기존 서비스활동 목록과 첨부 이미지/PDF 미리보기가 조회되는지 확인한다.
- 서비스활동 유형 추가 후 저장 시 하단 경유처 grid가 재조회되고 `SRVC_ATVT_YN` 표시가 갱신되는지 확인한다.
### 2026-06-25 - 서비스활동 합계행 렌더링 보정

#### 작업 대상
- React 출/도착관리 하단 `경유처` grid
- 컬럼: `SRVC_ATVT_YN`

#### 원인 분석
- `SRVC_ATVT_YN` 컬럼의 `cellRenderer`가 일반 데이터 row뿐 아니라 하단 pinned summary row에도 동일하게 적용되었다.
- summary row의 값은 실제 서비스활동 데이터가 아니지만 빈 값이 `Y`가 아닌 값으로 판정되어 `아니오`가 표시되었다.

#### 수정 파일
- `src/features/tms/execution/arrdep/DepartArrivalManagementColumns.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `params.node?.rowPinned`인 경우 빈 문자열을 반환하도록 보정했다.
- 일반 데이터 row에서는 기존처럼 `Y`는 `예`, 그 외 값은 `아니오`로 표시한다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- `git diff --name-only -- src\app\components`: 공통 컴포넌트 변경 없음

### 2026-06-26 - 팝업 표시 문구 언어팩 적용

#### 작업 대상
- React 출/도착관리 팝업 문구
- `StartWorkPopup`
- `RouteMapPopup`
- `DriveHistoryPopup`

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
- `src/features/tms/execution/arrdep/popup/RouteMapPopup.tsx`
- `src/features/tms/execution/arrdep/popup/DriveHistoryPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- 입차시각/운송출발시각 팝업의 빠른 입력 버튼 `현재시각` 문구를 `Lang.get("LBL_TIME")`으로 변경했다.
- 지도 팝업 정차지 badge의 `출발` 문구를 `Lang.get("LBL_DEPARTURE")`으로 변경했다.
- 지도 팝업 정차지 badge의 `도착` 문구를 `Lang.get("LBL_DESTINATION_EX")`으로 변경했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `npm.cmd run build`: 통과
- `git diff --name-only -- src\app\components`: 공통 컴포넌트 변경 없음

### 2026-06-26 - StartWorkPopup 빠른 시간 보정 버튼 제거

#### 작업 대상
- React 출/도착관리 `StartWorkPopup`

#### 원인 분석
- `DatePickerPopover`의 `withTime`이 날짜/시간 입력 공통 UI를 제공하므로, 팝업 내부의 `시간`, `-10분`, `+10분`, `+30분` 버튼은 화면 전용 보조 UI에 가까웠다.
- 다른 React 폼 팝업과 결을 맞추기 위해 공통 Date/Time picker만 남기는 방식이 적절하다고 판단했다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/StartWorkPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- 빠른 시간 보정 버튼 영역을 제거했다.
- 버튼 전용 함수 `setCurrentDateTime`, `adjustMinutes`와 전용 스타일 `quickButtonClass`를 제거했다.
- 미사용 `parseDateTime` 헬퍼를 제거했다.

#### 검증 결과
- `npx.cmd eslint src\features\tms\execution\arrdep --ext .ts,.tsx`: 통과
- `rg -n "adjustMinutes|quickButtonClass|LBL_MINUTE|grid-cols-4 gap-2" src\features\tms\execution\arrdep\popup\StartWorkPopup.tsx`: 결과 없음

### 2026-06-25 - 서비스활동 팝업 기존 행 편집 가능 여부 보정

#### 작업 대상
- React 출/도착관리 `SrvcAtvtPopup`
- 컬럼: `SRVC_TYPE`

#### 확인한 Sencha 소스
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPopMain.js`
- `vc/view/mdl/tms/execution/arrdep/pop/SrvcAtvtPopController.js`
- `vc/view/common/widget/ExGridEditor.js`

#### 원인 분석
- Sencha 컬럼 선언은 `excolumneditor`이나, 공통 `ExGridEditor.onBeforeEdit`에서 기존 행은 수정 권한/편집 조건에 따라 편집이 차단된다.
- React 구현은 `SRVC_TYPE`에 `editable:true`와 `insertable:true`를 함께 지정해 기존 행까지 편집 가능한 상태였다.

#### 수정 파일
- `src/features/tms/execution/arrdep/popup/SrvcAtvtPopup.tsx`
- `docs/migration/frontend/DepartArrivalManagement.md`

#### 수정 내용
- `SRVC_TYPE` 컬럼의 `editable:true`를 제거하고 `insertable:true`만 유지했다.
- 신규 추가 행에서는 입력 가능하지만 기존 조회 행은 편집되지 않도록 React Grid 표준 편집 규칙에 맞췄다.

#### 미구현/주의사항
- Sencha 원본도 서비스활동 저장/파일첨부 흐름에서 `SERVICE`와 `SERVICE_ACTIVITIES` 파일 도메인 값이 혼재되어 있어 백엔드 기준 정리가 필요하다.
