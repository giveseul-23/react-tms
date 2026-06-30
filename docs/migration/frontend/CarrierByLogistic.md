# CarrierByLogistic 작업 기록

## 화면 정보

- React 경로: `src/features/tms/master/organization/env/logisticgroup/carrierbylogistic`
- Sencha 경로: `SENCHA_VIEW_ROOT\mdl\tms\master\organization\env\logisticgroup\carr`

## 현재 알려진 주요 이슈

- 없음.

## 작업 이력

### 2026-06-29 - 운송협력사 다중 추가

- 작업 범위: Sub01 추가 버튼에서 운송협력사를 여러 건 선택해 신규 행으로 일괄 추가한다.
- 확인 문서: `CLAUDE.md`, `docs/claude/screen-architecture.md`, `docs/claude/popup.md`, `docs/claude/frontend-audit.md`
- 확인 Sencha 소스: `LogisticGroupCarrier.js`, `LogisticGroupCarrierController.js`
- React 참고 화면: `TmsUserAccountPopup.tsx`의 다중 선택 그리드 팝업 패턴
- 원인: 기존 React 구현은 빈 행 하나를 추가한 뒤 컬럼 팝업에서 운송사를 단건 선택했다.
- 수정: 공통 `CommonPopup`을 `rowSelection="multiple"`로 열고 선택 결과를 Sub01 신규 행 배열로 추가한다.
- 중복 처리: 기존 행 및 같은 팝업 선택 결과 안에서 `CARR_CD`가 중복되면 추가하지 않는다.
- 저장: 기존 `onSaveSub01` 및 `{ dsSave: [...] }` payload를 유지한다.
- 공통 컴포넌트 변경: 없음.

## 수동 검증 체크리스트

- 메인 물류운영그룹 선택 후 Sub01 추가 버튼을 누르면 운송사 팝업이 열린다.
- 운송사를 여러 건 선택하고 적용하면 Sub01에 선택 건수가 추가된다.
- 이미 Sub01에 있는 운송사는 중복 추가되지 않는다.
- 저장 시 선택한 신규 행들이 함께 저장되고 Sub01이 재조회된다.
