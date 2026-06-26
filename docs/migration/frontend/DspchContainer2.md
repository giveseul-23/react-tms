# DspchContainer2 작업 기록

## 화면 정보
- React 경로: `src/features/tms/execution/cntr2`
- React 파일: `DspchContainer2.tsx`, `DspchContainer2Controller.tsx`, `DspchContainer2Model.ts`, `DspchContainer2Columns.tsx`, `DspchContainer2Api.ts`
- Sencha 경로: `SENCHA_VIEW_ROOT\vc\view\mdl\tms\execution\cntr2`
- Sencha 파일: 로컬 `.env.local`에 `SENCHA_VIEW_ROOT`가 없어 이번 작업에서는 직접 확인하지 못함

## 현재 알려진 주요 이슈
- 동적 집기 수량 컬럼은 `searchLgstGrpCntr` 결과의 `D_CNTR_CD`/`CNTR_CD`와 조회 결과 row key가 같은 코드 체계인지 먼저 확인한다.
- `D_CNTR_CD`가 `CD_0002`처럼 `CD_` 접두어를 포함해 내려와도 React field는 `CD_0002_DLVRY_QTY`, `CD_0002_RTRN_QTY` 형태가 되어야 한다.

## 작업 이력

### 2026-06-26 - 동적 집기 수량 컬럼 field 보정
- 작업 범위:
  - `buildContainerQtyColumnDefs`가 만드는 `CD_0002_DLVRY_QTY`, `CD_0002_RTRN_QTY` 컬럼 값 미표시 문제를 수정했다.
- 확인한 기준 문서:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/claude/screen-architecture.md`
  - `docs/claude/column-rules.md`
  - `docs/claude/local-environment.md`
  - `docs/claude/frontend-audit.md`
- 확인한 Sencha 소스:
  - `.env.local`에 `SENCHA_VIEW_ROOT`가 없어 직접 확인하지 못했다.
- 비교한 React 참고 화면:
  - `src/features/tms/execution/cntr/DspchContainerColumns.tsx`: 같은 집기관리 업무의 grid 컬럼/수량 컬럼 패턴을 확인했다.
- 원인 분석:
  - `searchLgstGrpCntr`의 동적 코드가 `CD_0002`처럼 이미 `CD_` 접두어를 포함하는 경우, 기존 컬럼 생성 로직은 다시 `CD_`를 붙여 `CD_CD_0002_DLVRY_QTY`를 field로 만들 수 있었다.
  - 조회 row에는 `CD_0002_DLVRY_QTY`, `CD_0002_RTRN_QTY` 값이 있으므로 ag-grid field와 row key가 불일치해 값이 표시되지 않았다.
- 수정 파일과 변경 이유:
  - `src/features/tms/execution/cntr2/DspchContainer2Columns.tsx`: 동적 집기 코드를 정규화해 `CD_` 접두어가 이미 있는 경우 제거 후 field를 생성하도록 보정했다. `D_CNTR_CD`가 없을 때는 `CNTR_CD`를 fallback으로 사용한다.
- 알려진 미구현/주의사항:
  - Sencha 원본은 로컬 경로 미설정으로 직접 비교하지 못했다.
- 검증 결과:
  - `npm run build`: 통과. Vite dynamic/static import chunk warning은 기존 공통 경고로 빌드 실패는 아님.
  - `npx eslint src\features\tms\execution\cntr2 --ext .ts,.tsx`: 실패. 최초 실행은 npm 캐시/레지스트리 접근 권한 오류, 권한 승인 후 재실행은 `@eslint/js` 모듈을 찾지 못해 중단됨.
- 수동 검증 체크리스트:
  - 물류그룹 선택 후 조회 시 동적 컬럼의 field가 `CD_0002_DLVRY_QTY`, `CD_0002_RTRN_QTY`로 생성되는지 확인.
  - 조회 결과 row에 해당 key 값이 있을 때 그리드 셀에 수량이 표시되는지 확인.
  - 저장 시 동적 수량 컬럼 수정값이 기존 row key 그대로 dirty row에 포함되는지 확인.
- 다음에 먼저 볼 것:
  - 다른 집기 코드도 `D_CNTR_CD`에 `CD_` 접두어 포함/미포함이 섞여 내려오는지 확인한다.
