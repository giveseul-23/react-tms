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

## 4. 표준 화면 구조 (base hook 패턴)

모든 화면은 **`src/app/feature/` 의 base hook 두 개** 를 기반으로 한다 — `useBaseModel` / `useBaseController`. 신규 화면은 `src/features/guide/Guide_Feature*.{ts,tsx}` 5종 세트를 복사해 변경. 기존 화면도 이 구조를 따른다.

폴더당 5개 파일 — 각 파일의 책임:

| 파일 | 역할 |
|---|---|
| `Xxx.tsx` (View) | JSX/레이아웃만. `useXxxModel` + `useXxxController` 호출, `MasterDetailPage` 등 preset 에 binding. |
| `XxxController.tsx` | 화면 고유 핸들러 (`onMainGridClick`, `onAddXxx`, `onSaveXxx`, 화면 액션). `useBaseController` 헬퍼 사용. |
| `XxxModel.ts` | `useBaseModel<GridKey>(menuCode)` 한 줄 + 화면 고유 state(codeMap, 외부탭 등). |
| `XxxColumns.tsx` | ag-grid `columnDefs` 정의. 단순 `const` 배열. audit 은 DataGrid 자동. |
| `XxxApi.ts` | `apiClient.post` 호출. `MENU_CODE` 는 View 에서 import. `withSession` 포함. |

**참조 화면 — 복잡도별** (신규 화면 작성 시 가장 가까운 화면을 골라 참고):

| 복잡도 | 화면 | 위치 | 특성 |
|---|---|---|---|
| 입문형 | `Currency` | `src/features/tms/master/domain/currency/` | GridOnlyPage, 단일 그리드, 가장 단순. |
| 기본형 | `DivisionDefault` | `src/features/tms/master/organization/env/division/divdft/` | MasterDetailPage, 2그리드 cascade. |
| 중급형 (다중 sub) | `Location` | `src/features/tms/master/account/location/` | 메인 1행 → 12개 sub 동시 cascade, 내부 탭. |
| 중급형 (동적 컬럼) | `ApDailyManagement` | `src/features/tms/calculate/vhcunit/dtrsptnrpt/` | 조회 시 메타 fetch → 컬럼 runtime 재생성. |
| 고급형 (중첩 탭/트리거) | `ApSettlMgmt` | `src/features/tms/calculate/apsettlmgmt/` | 중첩 탭 + SplitPane + 트리거 액션(`base.callAjax`). |
| 고급형 (풀세트) | `LgstgrpOprConfigMst` | `src/features/tms/master/organization/lgstgrpOprConfigMst/` | 외부 탭 + 4그리드 + 다국어 + 동기화 + 사전검증(`beforeSave`). |

### 4-1. View 레이어 규칙

- 레이아웃은 preset 사용: `MasterDetailPage` / `GridOnlyPage` / `GridFormPage` / `GridMapPage`
- 모든 preset 은 **`menuCode` prop** 만 받으면 `useSearchMeta` 자동 호출 + loading skeleton 자동. View 에서 `useSearchMeta` / `Skeleton` import 안 함.
- `searchRef` / `filtersRef` 는 **`useBaseModel` 이 자체 보유** → `model.searchRef` / `model.filtersRef`. View 에서 `useRef` 두 개 만들지 말 것.
- DataGrid 는 `{...model.bind(gridKey)}` spread — `rowData` / `totalCount` / `currentPage` / `pageSize` / `onPageSizeChange` / `onPageChange` / `audit:true` / `setRowData` 자동.
  ```tsx
  <DataGrid
    {...model.bind("main")}
    columnDefs={MAIN_COLUMN_DEFS}
    onRowClicked={ctrl.onMainGridClick}
    actions={ctrl.mainActions}
  />
  ```
- 검색 payload 에서 제외할 키나 리네임은 `searchProps.excludes` 에 선언만 — `SearchFilters` 가 자동 처리.
  ```ts
  searchProps={{
    ...,
    excludes: ["BOOKING"],                    // 단순 제외
    excludes: [                               // 또는 리네임 + 값 변환
      { column: "PLN.AR_TO_DT",
        as: { FROM: "AR_FROM_DT", TO: "AR_TO_DT" },
        transform: (v) => String(v).replace(/-/g, "") },
    ],
  }}
  ```
- 레이아웃 토글: `direction={model.layout === "side" ? "horizontal" : "vertical"}` + `layoutToggle={{ layout: model.layout, onToggle: ... }}` — model.layout 은 localStorage 자동 동기화.
- `storageKey` 는 `model.storageKeys.outer` / `top` / `bottom` 로 binding (menuCode 기반 자동 생성).

### 4-2. Controller 레이어 규칙 — `useBaseController` 헬퍼

```ts
const base = useBaseController<GridKey>({ model });
```

base 가 제공하는 헬퍼:

| 헬퍼 | 용도 |
|---|---|
| `base.callAjax(promise, msg?)` | API Promise 한 번 감쌈 (성공/에러 토스트) |
| `base.alert(msg)` / `base.confirm(msg, onYes)` | 다이얼로그 |
| `base.search(page?)` | 메인 그리드 재조회 (`model.searchRef.current?.()`) |
| `base.searchSub(gridKey, promise)` | 임의 그리드에 결과 set |
| `base.resetGrids([keys])` | 지정 그리드들 비우기 |
| `base.handleRowClick(gridKey, row, cascade?, opts?)` | selection set + cascade reset/fetch (`{ alsoReset }` 으로 손자 reset) |
| `base.addRow(gridKey, newRow)` | 그리드 끝 push (EDIT_STS:"I" 자동) |
| `base.requireParentRow(row, label)` | 부모 행 선택+저장 검증 + alert + boolean |
| `base.saveGrid(gridKey, apiFn, opts?)` | dirty 추출 + dsSave + 후처리. opts: `beforeSave`, `confirmOnDelete`, `afterSave: "refresh"\|"none"\|함수\|{cascadeFrom, fetch}` |

**fetchList** — `SearchFilters` 가 넘기는 params 를 API 에 전달 (외부 탭 조건 등 합칠 때만 추가).
**handleSearch** — `model.grids.main.setData(data)` + 첫 행 자동 선택은 `onMainGridClick(data?.rows?.[0])` 호출 (cascade 정의 한 곳에 모음).

**액션**:
- 그리드별 actions 배열은 **Controller 가 책임** (`useMemo` 로 정의, View 는 `actions={ctrl.mainActions}` binding 만)
- `makeAddAction` / `makeSaveAction` / `makeExcelGroupAction` / `makeCommonActions` (`@/app/components/grid/commonActions`)
- 화면 고유 popup/trace 같은 액션은 Controller 에 useCallback 으로 정의 후 actions 배열에 포함

### 4-3. Model 레이어 규칙 — `useBaseModel`

```ts
export type GridKey = "main" | "sub01" | "sub02" | "sub03";  // 화면별 그리드 이름 union

export function useXxxModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  // 화면 고유: codeMap, 외부 탭 등
  return { ...base, codeMap, ... };
}
```

`useBaseModel` 이 자동으로 제공:
- 그리드별 `data`/`rows`/`setData`/`ref` (lazy 등록 — Proxy 기반)
- 그리드별 `selected`/`setSelected`/`selectedRef`
- `searchRef` / `filtersRef`
- `pageSize` / `setPageSize`
- `layout` / `setLayout` (localStorage 자동 동기화)
- `storageKeys: { outer, top, bottom, layout }`
- `bind(gridKey)` — DataGrid spread props 묶음

화면 고유 추가:
- 공통코드 lookup → `useCommonStores` + `useMemo` 로 `codeMap`
- 외부 탭 → `useState` + `useEffect` 로 옵션 로딩
- popup / form 패널 state → `useState`

### 4-4. Columns 레이어 규칙

- 단순 `const` 배열 — 함수 wrapper 안 만든다 (특수 케이스 제외).
- `headerName`은 `LBL_*` 다국어 키 (Lang.get 자동)
- `field` 에 `DTTM` 포함 → 자동 날짜 포맷
- `field` 가 `_STS` 로 끝남 → 자동 중앙 정렬
- `type: "numeric"` / `dataType: "number"` → 우측 정렬
- `headerName: "No"` → 자동 일련번호 + 고정 너비
- 공통코드 → 라벨: 컬럼에 `codeKey` 지정 (DataGrid 자동 cellRenderer)
- **audit 컬럼**: `model.bind` 가 `audit:true` 자동 spread → DataGrid 가 컬럼 끝에 standardAudit 자동 추가. 컬럼 파일에서 `standardAudit` 직접 호출 안 함.
- audit 부분 토글: View 에서 `audit={{ updatePerson: false }}` 명시
- audit 자동 끄기: View 에서 `audit={false}` 명시 (audit 컬럼이 중간 위치 / 별도 처리 화면)

### 4-5. Api 레이어 규칙

- `MENU_CODE` 는 **View** 에서 export, Api 가 import (순환 import 안 됨 — 함수 본문에서만 사용)
- 객체 형태로 export: `export const featureApi = { getList, save, ... }`
- 모든 요청에 `MENU_CD: MENU_CODE` 포함 + `withSession` 으로 세션 필드 주입
- 저장 API 는 `dsSave` 패턴: body `{ dsSave }`, params 에 세션/MENU_CD/그 외 키
- 배열 페이로드도 `withSession` 이 각 원소에 세션 필드 자동 주입

### 4-6. 신규 화면 작성 흐름

1. `Guide_Feature*` 5종을 대상 폴더에 복사
2. `Xxx.tsx` 의 `MENU_CODE` 교체, preset 의 `menuCode={MENU_CODE}` 그대로
3. `XxxModel.ts` 의 `GridKey` 타입에 그리드 이름 union 정의
4. `XxxController.tsx` 에 `onMainGridClick` / `onAddXxx` / `onSaveXxx` / `actions` 정의 — base 헬퍼만 사용
5. `XxxColumns.tsx` 단순 배열로 컬럼 정의 (audit 자동)
6. `XxxApi.ts` 의 URL / 페이로드만 교체

화면 구조별 preset:
- 단일 그리드 → `GridOnlyPage`
- Master + Detail (또는 그리드 N개 cascade) → `MasterDetailPage`
- 그리드 + 폼 패널 → `GridFormPage`
- 그리드 + 지도 → `GridMapPage`

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
