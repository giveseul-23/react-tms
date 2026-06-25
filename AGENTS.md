# Codex 프로젝트 작업 지침

이 저장소에서 코드를 변경하기 전에는 다음 문서를 읽고 지침을 따릅니다.

## 1. 기본 참조 경로

- 기존 Sencha 소스:
  - 로컬 프로퍼티 `SENCHA_VIEW_ROOT`
- 신규 React TypeScript 소스:
  - `src/features/tms`

## 2. 외부 참조 소스

기존 Sencha 소스는 사용자 PC마다 경로가 다를 수 있으므로 `docs/claude/local-environment.md` 기준에 따라 `SENCHA_VIEW_ROOT`를 우선 참조합니다.

개인별 실제 경로는 Git에 포함되지 않는 `.env.local`에 둡니다.

```env
SENCHA_VIEW_ROOT=<개인 Sencha view root 경로>
```

React 전환 작업 시 대상 화면과 매칭되는 Sencha 파일을 먼저 확인합니다.

## 3. 작업 전 확인 문서

직접 전달받은 사용자 지시와 충돌하지 않는 한, `CLAUDE.md`를 기본 프로젝트 지침으로 사용합니다.

코드를 수정하기 전에는 다음 문서를 읽고 지침을 따릅니다.

- `CLAUDE.md`
- `docs/`

특정 영역을 작업할 때는 관련 문서를 우선 확인합니다.

- 화면 구조/View/Controller/Model/Api 작업: `docs/claude/screen-architecture.md`
- Grid 컬럼 작업: `docs/claude/column-rules.md`
- SearchFilters/조회조건 작업: `docs/claude/search-style.md`
- 엑셀 다운로드/업로드 작업: `docs/claude/excel-download.md`
- 팝업/모달 작업: `docs/claude/popup.md`
- 신규 화면 또는 유사 화면 선정: `docs/claude/reference-screens.md`
- 기존 화면 수정 시 표준 이탈 여부 확인: `docs/standard-deviations.md`
- 프론트 화면별 작업 기록/오디트 작성: `docs/claude/frontend-audit.md`
- 로컬 경로/환경 프로퍼티: `docs/claude/local-environment.md`

## 4. 기본 작업 원칙

0. 사용자가 수정 대상 경로 또는 폴더를 명시한 경우, 소스 변경은 해당 경로 하위 파일에만 수행합니다. 읽기/조회/비교를 위해 다른 경로의 파일을 확인하는 것은 가능하지만, 사용자 승인 없이 명시된 경로 밖의 소스 파일을 생성/수정/삭제하지 않습니다. 공통 컴포넌트, 공통 훅, 공통 유틸, 전역 설정은 명시된 수정 대상 경로 밖이면 수정하지 않습니다.
   - 단, 화면별 작업 기록/오디트 자료는 `docs/claude/frontend-audit.md` 기준에 따라 `docs/migration/frontend` 경로에 남길 수 있습니다.
   - 지정 경로 밖의 소스 수정이 꼭 필요하다고 판단되면, 먼저 수정 필요 사유와 대상 파일을 사용자에게 알리고 승인을 받은 뒤 진행합니다.
1. 요청받은 React 대상 경로의 기존 구현과 주변 패턴을 확인하고, 유사한 기존 React 화면을 1개 이상 확인합니다.
2. 대응되는 기존 Sencha 화면, Controller, Model, Service, 관련 공통 로직을 확인합니다.
3. Sencha와 비교할 때 레이아웃, grid authId, selection model, toolbar 버튼 위치, pagination 여부를 함께 확인합니다.
4. `docs/` 아래의 관련 개발 기준 문서를 확인합니다.
5. 기존 React 프로젝트의 구조, 네이밍, 공통 컴포넌트, Grid/DataGrid 패턴에 맞춰 구현합니다.
6. Sencha 변환 시 Store/Model/Controller 역할은 React의 Model, Controller hook, Api 구조에 맞게 분리합니다.
7. Grid 컬럼, 검색조건, 버튼 권한, 저장/삭제/재처리 흐름은 기존 Sencha 동작을 보존합니다.

## 5. Sencha 화면 레이아웃 전환 기준

React 신규 개발 시 컬럼/버튼/API만 비교하지 말고, 반드시 Sencha View 파일의 화면 배치도 함께 비교합니다.

확인 대상:

- 최상위 View의 `region`, `height`, `split`, `xtype`
- `center` / `south` / `north` 배치
- master/detail 비율
- tab panel 구성 및 탭 순서
- 각 grid의 `reference`, `authId`
- selection model: single / multi / checkbox
- toolbar 버튼 위치 및 버튼 구성
- pagination 여부
- detail grid가 tab 안에 있는지, split pane 안에 있는지

React 매핑 기준:

- Sencha `region: center` + `region: south` 구조는 기본적으로 `MasterDetailPage`로 매핑합니다.
- Sencha main grid `height: '50%'`, detail area `height: '50%'`이면 `defaultSizes={[50, 50]}`를 우선 사용합니다.
- Sencha detail 영역이 `extabpanel`이면 React detail도 `DataGrid layoutType="tab"` 구조로 유지합니다.
- Sencha grid가 `selType: 'checkboxmodel', mode: 'MULTI'`이면 React `DataGrid`에 `rowSelection="multiple"`을 지정합니다.
- Sencha grid `authId`는 React View에서 `AUTH.grids`로 선언하고 각 `DataGrid authId`에 연결합니다.
- Sencha detail grid가 paging toolbar가 없으면 React detail grid는 `pagination={false}`로 둡니다.
- 버튼은 Sencha docked toolbar 기준으로 main/detail 어느 grid에 붙어 있는지 확인한 뒤 해당 grid의 `actions`에만 배치합니다.

## 6. Sencha 비교 시 추가 확인 항목

Sencha 화면과 React 화면을 비교할 때 아래 항목도 반드시 확인합니다.

### 6.1 저장/API payload 구조

- Sencha `saveRecord` 사용 여부
- request body가 `{ dsSave: [...] }` 구조인지
- request body가 단순 배열인지
- `MENU_CD`, session field가 params/body/row 중 어디에 들어가는지
- Java Service가 `ValueChainData.getDataList("dsSave")`를 사용하는지

특히 Java Service에서 아래 형태를 사용하는 경우 React API body는 `{ dsSave: [...] }` 구조를 우선 검토합니다.

```java
listMap.getDataList(VCInOutConstants.DS_SAVE.getValue())
```

`Expected BEGIN_ARRAY but was BEGIN_OBJECT`, `Expected BEGIN_OBJECT but was BEGIN_ARRAY` 같은 오류가 발생하면 먼저 React request body와 Sencha `saveRecord`의 `jsonData` 구조를 비교합니다.

### 6.2 조회/SearchFilters payload 구조

- Sencha `searchByConditions` 화면을 React로 전환할 때는 `fetchList(params)`의 `params`를 버리지 않습니다.
- Sencha 명시 파라미터를 별도로 구성하더라도 React에서는 `{ ...params, ...manualParams }` 형태로 SearchFilters 공통 파라미터를 보존합니다.
- 날짜 range는 SearchFilters raw key가 `*_FRM`/`*_TO`로 생성될 수 있으므로 `*_FROM`만 참조하지 않습니다.
- View의 `searchProps.excludes`로 해결 가능한 날짜/컬럼 매핑은 Controller 수동 변환보다 우선 검토합니다.
- Sencha `getCompToParam`/`getCompToParamExclude`가 추가하는 `dsSearchCondition`, `DYNAMIC_QUERY`, `page`, `limit`이 React request body에 유지되는지 확인합니다.
- 엑셀 전체 다운로드처럼 조회 API를 재호출하는 버튼도 화면 조회와 동일한 검색 파라미터를 사용해야 합니다.

### 6.3 Grid 컬럼 편집 가능 여부

- Sencha 컬럼의 `xtype`이 `excolumneditor`인지 확인합니다.
- `editDisabled`, `insertDisabled` 여부를 확인합니다.
- React 컬럼에 `editable`, `insertable`이 필요한지 확인합니다.

React Grid에서는 `type: "text"` 컬럼이 기본 읽기전용입니다.

- 기존 행 편집이 필요한 경우 `editable: true`를 명시합니다.
- 추가 행에서만 입력 가능한 컬럼은 `insertable: true`를 사용합니다.
- Sencha에서 `editDisabled: true` 또는 `insertDisabled: true`가 명시된 컬럼은 React에서 무조건 편집 가능하게 만들지 말고 원본 의도를 먼저 확인합니다.

### 6.4 버튼과 팝업 흐름

- Sencha 버튼 handler가 `openWindow(...)`로 팝업을 호출하는지 확인합니다.
- 팝업에서 파라미터를 입력/생성한 뒤 저장 API를 호출하는 구조인지 확인합니다.
- React에서 팝업이 아직 구현되지 않은 상태로 버튼만 추가하거나 API를 직접 연결하지 않도록 주의합니다.

팝업 미구현 버튼은 작업 기록 문서의 `알려진 미구현/주의사항` 또는 `추가 확인 이슈`에 반드시 남깁니다.

기록할 항목:

- 버튼명
- Sencha 팝업 파일 경로
- React 구현 상태
- 임시 연결 여부
- 정상 처리 불가 사유
- 향후 구현 시 필요한 API/컬럼/파라미터

## 7. 작업 기록/오디트 기준

프론트 화면별 작업 기록/오디트 자료는 `docs/claude/frontend-audit.md` 기준을 따릅니다.

실제 화면별 기록 파일은 `docs/migration/frontend` 아래에 화면명 기준으로 누적 작성합니다.

## 8. 검증 원칙

- 변경 후 가능한 경우 `npm run build`를 실행하여 TypeScript/빌드 오류를 확인합니다.
- 빌드 실행이 불가능한 경우 최종 응답에 사유를 명시합니다.
- 빌드가 실패하면 이번 작업 때문인지 기존 오류 때문인지 구분합니다.
- 화면 로직 변경 시 주요 사용자 동작 기준의 수동 검증 포인트를 함께 정리합니다.
- 대상 폴더 단위로 가능한 경우 `npx eslint <대상경로> --ext .ts,.tsx`를 실행합니다.
- 변경 후에는 같은 업무 영역 또는 유사 화면 1개 이상과 비교하여 구현 방식, Controller/Model/Api 분리, SearchFilters 사용 방식, Grid/DataGrid 패턴, 버튼/actions 구성, payload 구성의 결이 기존 프로그램들과 맞는지 확인합니다.
- 공통 컴포넌트나 공통 규칙을 우회하거나 변경하지 않았는지 확인합니다. 공통 파일 변경이 diff에 포함되어 있으면 사용자 승인 여부를 먼저 확인하고, 승인받지 않은 변경은 원복합니다.
- 최종 응답 전 `git diff --name-only` 또는 동일한 수준의 변경 파일 확인을 수행하여, 사용자 지정 수정 범위 밖의 파일이 변경되지 않았는지 검증합니다.

## 9. 최종 응답 기준

최종 응답에는 다음을 간단히 포함합니다.

- 수정한 파일
- 핵심 변경 내용
- 실행한 검증 명령과 결과
- 빌드 실패 시 원인
- 남은 미구현/주의사항
- 작업 기록 문서 경로
- 사용자 지정 수정 범위 밖 파일 변경 여부
- 유사 프로그램과의 구현 패턴 비교 결과
- 공통 컴포넌트/공통 규칙 변경 여부
