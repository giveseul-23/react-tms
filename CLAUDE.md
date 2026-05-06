# CLAUDE.md

이 파일은 본 저장소(react-tms-carr-ts-pr)에서 작업하는 Claude(Claude Code)에 대한 지침입니다.

---

## 1. 작업 전 반드시 사용자에게 확인할 것 (가장 중요)

**모든 코드 수정/추가/삭제 전에 사용자에게 먼저 어떻게 작업할지 설명하고 승인을 받은 후 작업한다.**

- "어떤 파일을 어떻게 고치겠다"를 한국어로 먼저 정리해서 보여주고, **사용자의 OK 응답 후에만** Edit/Write 등 변경 도구를 호출한다.
- 단순 조회(Read/Grep/Glob)나 질문 답변용 검색은 확인 없이 진행해도 된다.
- 사용자가 "그냥 해", "바로 진행해", "알아서 해줘" 같이 명시적으로 자율 진행을 허용한 경우에만 확인 단계를 생략한다. 그 권한은 **해당 요청 1건에 한정**되며, 다음 요청에서는 다시 확인 절차로 돌아온다.
- 작업 도중 처음 계획에 없던 추가 변경이 필요해진 경우(예: 인접 파일도 같이 손봐야 하는 상황)에도 멈추고 다시 묻는다.
- 사용자가 거절하거나 다른 방향을 제시하면, 같은 변경을 다시 시도하지 말고 새 방향에 맞춘다.

## 2. 스타일/레이아웃 변경 금지 (회귀 방지)

리팩터링/구조 변경/마이그레이션 작업 시 **시각적인 결과물은 절대 바뀌어서는 안 된다.**

- Tailwind `className` 문자열은 byte-for-byte 보존
- inline `style={{ ... }}` 보존
- 컴포넌트 prop 중 시각/레이아웃에 영향을 주는 값(`width`, `height`, `padding`, `gap`, `direction`, `defaultSize`, `defaultSizes`, `minSizes`, `handleThickness`, `storageKey` 등) 보존
- wrapper `<div>`를 임의로 추가/제거하지 말 것 (DOM 구조가 바뀌면 CSS가 깨질 수 있음)
- "이 wrapper는 불필요해 보인다", "스타일을 통일하면 좋겠다" 같은 부수 개선 금지 — 사용자가 명시 요청한 경우에만 수행

이유: 사용자가 디자인을 이미 확정해서 사용 중이므로 시각 변화는 회귀(regression)로 간주된다.

---

## 3. 프로젝트 개요

- **스택**: React 18 + TypeScript + Vite 6, Tailwind 4, ag-grid-community 32, MUI 6, Radix UI, react-router-dom 7
- **빌드/실행**: `npm run dev` / `npm run build` (build는 vite `--mode qa`)
- **경로 alias**: `@/` → `src/`
- **백엔드 호출**: `@/app/http/client`의 `apiClient`(axios 래퍼) + `getSessionFields()`로 세션 자동 주입

## 4. 표준 화면 구조 (Guide_Feature 패턴)

신규 화면을 만들 때는 `src/features/guide/Guide_Feature*.{ts,tsx}` 5종 세트를 그대로 복사해 변경한다. 기존 화면도 이 구조를 따르므로, 수정 시 동일한 역할 분리를 깨지 말 것.

폴더당 5개 파일 — 각 파일의 책임:

| 파일 | 역할 |
|---|---|
| `XxxFeature.tsx` (또는 `Xxx.tsx`) | View. JSX/레이아웃만. 비즈니스 로직 없음. |
| `XxxController.tsx` | 조회/저장/액션 핸들러 정의(useCallback). API 호출은 여기서. |
| `XxxModel.ts` | 화면 상태(useState/useRef) + 공통코드 codeMap. |
| `XxxColumns.tsx` | ag-grid `columnDefs` 정의. `LBL_*` 다국어 키 사용. |
| `XxxApi.ts` | `apiClient.post` 호출. `MENU_CD` + `withSession` 포함. |

### 4-1. View 레이어 규칙

- 레이아웃은 `MasterDetailPage` / `SplitPane` (`@/app/components/layout/...`)로 구성
- Master/Detail 그리드는 `DataGrid` (`@/app/components/grid/DataGrid`)
- 조회 조건 영역은 `useSearchMeta(MENU_CODE)` 결과를 `MasterDetailPage.searchProps.meta`로 전달
- 조회 trigger / 조회 조건은 ref로 보관:
  ```ts
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  ```
- 검색 payload 에서 제외할 키나 키 리네임이 필요하면 `searchProps.excludes`에 선언만 — `SearchFilters`가 내부에서 `useSearchCondition`을 호출하고 `fetchFn`을 자동 wrap. View 에서 `excludeKeysRef` 직접 만들거나 `useSearchCondition` 호출하지 말 것.
  ```ts
  searchProps={{
    ...,
    excludes: ["BOOKING"],                                       // 단순 제외
    // 또는 키 리네임 + 값 변환:
    excludes: [
      { column: "PLN.AR_TO_DT",
        as: { FROM: "AR_FROM_DT", TO: "AR_TO_DT" },
        transform: (v) => String(v).replace(/-/g, "") },
    ],
  }}
  ```
- 레이아웃 토글(`"side" | "vertical"`)과 `storageKey`(localStorage용 화면별 유일값)를 반드시 지정

### 4-2. Controller 레이어 규칙

- `fetchList` — `SearchFilters`가 넘기는 params를 그대로 API에 전달
- `handleSearch` — 조회 성공 시 `model.setGridData` + `model.resetSubGrids` + 필요 시 첫 행 자동 선택
- `handleRowClicked` — 메인 행 선택 시 상세 그리드 reload
- 액션 버튼은 공통 팩토리 사용:
  - `makeAddAction` / `makeSaveAction` / `makeExcelGroupAction` (개별)
  - `makeCommonActions({ add, save, excel })` (3종 일괄)
  - 위 모두 `@/app/components/grid/commonActions`에서 import
- 그리드 추가/저장은 `useGridAdd` / `useGridSave` (`@/app/components/grid/gridCommon`) 훅 사용
- `saveFn`은 `useGridSave`가 만든 payload 중 `dsSave`만 꺼내 API에 넘긴다:
  ```ts
  const saveFn = (payload: any) => featureApi.save({ dsSave: payload.dsSave });
  ```

### 4-3. Model 레이어 규칙

- 공통 state: `layout`, `pageSize`, `gridData`, `subDetailRowData`, `selectedHeaderRow(+Ref)`, `codeMap`
- `EMPTY_GRID = { rows: [], totalCount: 0, page: 1, limit: 20 }` 형태의 초기값 사용
- 메인 행 선택은 **state + ref 동시 보관** 패턴 (`selectedHeaderRow` + `selectedHeaderRowRef`) — Controller의 onClick 핸들러에서 stale closure 방지용
- 공통코드 lookup은 `useCommonStores`로 받아 `codeMap[storeKey][CODE] = NAME` 형태로 변환해서 `DataGrid`의 `codeMap` prop에 전달

### 4-4. Columns 레이어 규칙

- `headerName`은 `LBL_*` 다국어 키 (Lang.get 자동 적용됨)
- `field`에 `DTTM` 포함 → DataGrid가 자동 날짜 포맷팅
- `field`가 `_STS`로 끝나면 자동 중앙 정렬
- `type: "numeric"` 또는 `dataType: "number"` → 우측 정렬
- `headerName: "No"` → 자동 일련번호 + 고정 너비
- 공통코드 → 라벨 치환은 컬럼에 `codeKey`만 지정 (cellRenderer는 DataGrid가 자동 주입)
- audit 컬럼(삭제/상태/생성자/생성일/수정자/수정일)은 `standardAudit(setGridData)` 한 줄로 일괄 삽입, 부분 끄기는 `{ updatePerson: false }` 같은 override

### 4-5. Api 레이어 규칙

- 객체 형태로 export: `export const featureApi = { MENU_CD, getList, getDetailList, save, remove, ... }`
- 모든 요청에 `MENU_CD` 포함 + `withSession()`으로 세션 필드 주입
- 저장 API는 `dsSave` 패턴: body에 `{ dsSave }`, params에 세션/MENU_CD/그 외 키
- 배열 페이로드일 때도 `withSession`이 각 원소에 세션 필드 자동 주입

## 4-6. (권장) 선언적 framework — `useGridModel` / `useGridController`

여러 그리드를 가진 화면(특히 Master-Detail-2x2 같은 4-그리드 화면)은 boilerplate를 줄이기 위해 **`src/hooks/useGridFeature/`** 의 framework 훅을 사용한다. **참조 화면**: `src/features/tms/master/organization/lgstgrpOprConfigMst/`.

### 핵심 아이디어

- **Model.ts**: `featureConfig` 객체를 선언하고 `useGridModel(config)` 한 줄 호출
- **Controller.tsx**: `useGridController({ config, model, searchRef })` 호출 + 화면 고유 액션만 합성
- **View.tsx**: 레이아웃 자유. `<DataGrid {...ctrl.bind("gridKey", COLS)} />` 로 표준 props 한 번에 spread

### `featureConfig` 주요 필드

```ts
{
  api,                      // 화면 API 객체 (메서드명을 string 으로 참조)
  selections: ["config"],   // state+ref 추적할 그리드 keys
  resetOnChange: "activeTab", // 외부 탭 등 watch key 가 바뀌면 모든 그리드 클리어 + 1페이지 재조회 (첫 마운트/빈 값 자동 스킵)
  fetchListExtraParams: {   // 첫 fetch에 추가 param 주입 (model 참조)
    LGST_GRP_CNFG_GRP_CD: (m) => m.activeTab,
  },
  extras: () => {           // 화면별 추가 state — Hook으로 호출됨
    const [activeTab, setActiveTab] = useState("");
    return { activeTab, setActiveTab };
  },
  grids: {
    config:     { type: "paginated", api: { fetch: "getConfigList", save: "saveConfig" }, rowKey: "CNFG_CD", newRow: () => ({...}) },
    detail:     { type: "paginated", api: {...}, fetchOnRowClickFrom: "config", paramMap: (row) => ({...}), newRow: (m) => ({...}) },
    i18n:       { type: "array",     api: {...}, fetchOnRowClickFrom: "detail", subTitle: "LBL_..." },
    detailI18n: { type: "array",     api: {...}, fetchOnRowClickFrom: "i18n" },
  },
}
```

### framework가 자동으로 처리

- 그리드별 state/ref 생성 (paginated → `GridData`, array → `any[]`)
- selection state+ref (stale closure 방지)
- `fetchList`(첫 그리드) + `handleSearch`(첫 그리드 set + cascade)
- 행 클릭 cascade fetch (`fetchOnRowClickFrom` + `paramMap`)
- 그리드별 추가/저장 액션 (`useGridAdd` / `useGridSave` 자동 적용)
- DataGrid 표준 props 묶음: `ctrl.bind("gridKey", COLUMN_DEFS, overrides?)`

### 화면이 직접 짜는 것

- View JSX 레이아웃 (단일 / Master-Detail / 2x2 / 탭 / 트리 등 자유)
- 화면 고유 액션 (예: 동기화 버튼) → Controller에서 `base.actions.config` 에 합성 후 별도 export
- 외부 탭, 화면 고유 useEffect 등 → `extras()` 안에서 정의 (탭 state는 `extras`에 두고, View 에서 `MasterDetailPage`의 `outerTabs={{ tabs, activeTab, onChange }}` prop 으로 넘김 — 인라인 JSX 금지)

### 순환 import 주의

- `MENU_CODE` 는 **View** 에서 정의/export
- Api 는 View 에서 import (함수 본문에서만 사용 — 안전)
- Model/Controller 는 module-init 시점에 `MENU_CODE` 를 사용하지 않음 (`featureConfig` 객체에 안 넣음). framework 의 `FeatureConfig.menuCode` 는 optional.

### 언제 framework 안 쓰나

- 매우 특수한 화면 (popup 다수, 트리 + 드래그, 지도 위젯 등) — 기존 4-1~4-5 패턴 그대로
- 그리드 1~2개에 단순 조회만 — framework 적용해도 큰 이득 없음

## 5. 기타 규칙

- **응답 언어**: 사용자가 한국어로 말하면 한국어로 답한다 (코드 주석도 기존 한국어 컨벤션 유지).
- **불필요한 신규 파일 금지**: 기존 파일을 수정하는 것이 항상 우선. 새 파일은 정말 필요할 때만.
- **문서 파일 자동 생성 금지**: `*.md`, README, 분석/계획 문서를 사용자가 명시적으로 요청하지 않는 한 생성하지 않는다.
- **주석**: WHY가 비자명할 때만 짧게. WHAT을 풀어 쓰는 주석/이전 작업 흔적 주석 금지.
- **에러 처리**: 발생 가능하지 않은 시나리오에 대한 fallback/검증 추가 금지. 시스템 경계에서만 검증.
- **버전 호환 shim 금지**: 사용 안 하는 변수의 `_var` rename, 제거된 코드의 `// removed` 주석, 빈 re-export 같은 잔재 남기지 말 것 — 확실히 미사용이면 깔끔히 삭제.
- **git**: 사용자가 명시적으로 요청하지 않으면 commit/push 하지 않는다. `--no-verify` 절대 금지.

## 6. 메모리 저장 정책

사용자가 "메모리에 저장해줘", "기억해줘", "이거 잊지 마" 같이 기억해두기를 요청하면, `~/.claude/.../memory/`의 자동 메모리(MEMORY.md/개별 파일)를 만들지 말고 **이 `CLAUDE.md`에 직접 적절한 섹션으로 추가**한다.

- 이미 있는 섹션과 주제가 맞으면 그 섹션 안에 bullet 추가
- 새 주제면 새 섹션을 만들어 추가
- 추가 전에 어디에 어떤 문구로 넣을지 사용자에게 한 번 보여주고 OK 받은 후 적용 (§1 적용)
