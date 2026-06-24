# Frontend Audit

이 문서는 프론트 화면별 작업 기록/오디트 자료 작성 기준입니다.

작업 기록 문서는 `docs/migration/frontend` 아래에 화면명 기준으로 누적 작성합니다.

## 1. 작성 목적

`docs/migration/frontend` 아래에 생성하는 작업 기록 문서는 단순 진행 메모가 아니라, 추후 이슈 원인 추적과 검증을 위한 감사 로그로 작성합니다.

문서 파일명은 기본적으로 `화면명.md` 형식을 사용합니다.

같은 화면의 작업 기록은 날짜별 파일로 나누지 않고 하나의 화면 파일에 누적합니다.

각 작업 이력은 문서 내부에서 `YYYY-MM-DD - 작업 요약` 형식의 섹션으로 구분합니다.

예:

```md
# DepartArrivalManagement 작업 기록

## 화면 정보
- React 경로:
- Sencha 경로:

## 현재 알려진 주요 이슈
- 저장 payload:
- 미구현 팝업:

## 작업 이력

### 2026-06-19 - 저장 버튼 무반응 수정
- 원인:
- 수정:
- 검증:
```

동일 화면의 기록 파일이 이미 있으면 새 파일을 만들지 않고 기존 화면 파일에 내용을 누적합니다.

## 2. 업데이트 시점

작업 기록 문서는 최초 계획 작성용으로만 사용하지 않습니다.

아래 상황이 생기면 같은 작업 기록 파일에 내용을 계속 누적합니다.

- 작업 중 새로 확인한 이슈가 생긴 경우
- 미구현 범위가 확인된 경우
- API payload 오류가 확인된 경우
- 컬럼 편집 가능 여부 차이가 확인된 경우
- 팝업 미구현/임시 연결이 확인된 경우
- 검증 결과가 바뀐 경우
- 수동 검증 포인트가 추가된 경우

기존 화면 파일에 새 이력을 추가할 때는 문서 상단의 `현재 알려진 주요 이슈`도 함께 갱신합니다.

## 3. 필수 작성 항목

### 3.1 화면 정보

- React 대상 경로를 적습니다.
- 대응되는 Sencha 화면 경로를 적습니다. 신규 기록은 개인 PC 절대경로 대신 `SENCHA_VIEW_ROOT` 기준 상대경로를 우선 사용합니다.
- 관련 Controller, Model, Api, Columns 파일 경로를 적습니다.

### 3.2 현재 알려진 주요 이슈

- 나중에 같은 화면을 수정할 때 먼저 확인해야 할 이슈를 문서 상단에 요약합니다.
- API payload, 미구현 팝업, authId, search parameter, grid selection, editable 컬럼 등 구체적인 확인 지점을 남깁니다.
- 새 작업 이력에서 주요 이슈가 추가/해결되면 이 섹션도 함께 갱신합니다.

예:

- 저장 오류 발생 시 request body가 Sencha와 같은 `{ dsSave: [...] }` 구조인지 확인
- 버튼 클릭 후 아무 동작이 없으면 해당 버튼이 팝업 미구현 상태인지 확인
- Grid 컬럼이 편집되지 않으면 Sencha `excolumneditor` 여부와 React `editable:true` 누락 여부 확인

### 3.3 작업 범위

- 이번 작업에서 구현/수정한 범위를 명확히 적습니다.
- 의도적으로 제외한 범위나 아직 구현하지 않은 기능도 함께 적습니다.
- 버튼, 팝업, 탭, 그리드처럼 사용자 동작 단위로 구분합니다.

### 3.4 확인한 기준 문서

작업 전 확인한 문서를 적습니다.

예:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/claude/screen-architecture.md`
- `docs/claude/column-rules.md`
- `docs/claude/search-style.md`
- `docs/standard-deviations.md`

### 3.5 확인한 Sencha 소스

- 비교한 Sencha View, Controller, Model, Grid, Popup 파일 경로를 적습니다.
- 신규 기록의 Sencha 파일 경로는 가능한 한 `SENCHA_VIEW_ROOT\...` 형식으로 적습니다.
- 팝업이나 공통 로직이 관련되면 해당 파일도 포함합니다.

### 3.6 비교한 React 참고 화면

- 패턴 참고에 사용한 기존 React 화면 경로를 적습니다.
- 왜 참고했는지 간단히 적습니다.

### 3.7 Sencha 비교 결과

Sencha 기준 화면 구조를 정리합니다.

가능한 한 아래 항목을 포함합니다.

- layout region / height / tab 구조
- grid reference
- grid authId
- selection model
- toolbar 버튼 위치
- pagination 여부
- 저장/조회 URL
- 팝업 호출 여부
- 주요 payload 구조

### 3.8 원인 분석

- 문제가 발생한 원인, Sencha와 React의 차이, API payload 차이, 컬럼 editable 차이, 저장/조회 흐름 차이를 기록합니다.
- 원인이 확정되지 않은 경우에는 확인한 사실과 원인 후보를 구분해서 적습니다.

### 3.9 수정 파일과 변경 이유

- 수정한 파일별로 변경 이유를 적습니다.
- 단순히 “수정함”이 아니라 왜 수정했는지 적습니다.

예:

- `Xxx.tsx`: Sencha 하단 탭 구조 반영
- `XxxController.tsx`: master-detail cascade 추가
- `XxxApi.ts`: Sencha `saveRecord`와 동일하게 `{ dsSave: [...] }` 구조 적용
- `XxxColumns.tsx`: Sencha SubGrid03 컬럼 추가

### 3.10 알려진 미구현/주의사항

- 아직 구현하지 못한 기능, 임시 연결, 팝업 미구현, 지도/파일 등 추가 확인이 필요한 영역을 적습니다.
- 나중에 장애가 났을 때 “이미 알고 있던 미구현”인지 “새 회귀”인지 구분할 수 있어야 합니다.

예:

- 특정 버튼은 Sencha 팝업 미구현으로 정상 처리 불가
- 지도 팝업은 공통 지도 컴포넌트 확인 후 별도 구현 필요
- 빌드는 타 화면 기존 오류로 실패

### 3.11 검증 결과

실행한 검증 명령과 결과를 적습니다.

예:

- `npx eslint ...`: 통과
- `npm run build`: 실패
- `npx tsc --noEmit --pretty false`: 실패

검증 실패 시 다음을 구분해서 기록합니다.

- 이번 작업으로 발생한 오류
- 기존 다른 화면/공통 코드 오류
- 네트워크/API 환경 문제
- 미구현 기능으로 인한 수동 검증 불가

### 3.12 수동 검증 체크리스트

사용자가 화면에서 직접 확인해야 하는 동작을 적습니다.

예:

- 조회 시 메인 첫 행 선택 여부
- 메인 행 클릭 시 하위 그리드 조회 여부
- 하위 행 클릭 시 상세 그리드 조회 여부
- 저장/취소 버튼 payload 구조
- 팝업 버튼 동작 여부
- 엑셀 다운로드/권한 버튼 노출 여부

### 3.13 다음에 먼저 볼 것

추후 같은 화면에서 장애가 발생했을 때 먼저 확인할 원인 후보를 적습니다.

API payload, 미구현 팝업, authId, search parameter, grid selection 등 구체적인 확인 지점을 남깁니다.

예:

- `Expected BEGIN_ARRAY but was BEGIN_OBJECT` 오류 발생 시 request body가 Sencha와 같은 `{ dsSave: [...] }` 구조인지 확인
- 버튼 클릭 후 아무 동작이 없으면 해당 버튼이 팝업 미구현 상태인지 확인
- 하위 그리드가 비어 있으면 cascade key와 API 파라미터 확인
- Grid 컬럼이 편집되지 않으면 Sencha `excolumneditor` 여부와 React `editable:true` 누락 여부 확인
