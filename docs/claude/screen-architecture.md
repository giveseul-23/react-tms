# 화면 구조 (표준 base hook 패턴)

> 모든 업무 화면이 따르는 표준 5파일 구조와 base hook(`useBaseModel` / `useBaseController`) API.
> 컬럼 세부 규칙은 [column-rules.md](./column-rules.md), 엑셀은 [excel-download.md](./excel-download.md),
> 화면 예시는 [reference-screens.md](./reference-screens.md) 참고.

---

## 1. 스택 / 빌드

- **스택**: React 18 + TypeScript + Vite 6, Tailwind 4, ag-grid-community 32, MUI 6, Radix UI, react-router-dom 7
- **빌드/실행**: `npm run dev` / `npm run build` (build는 vite `--mode qa`)
- **경로 alias**: `@/` → `src/`
- **백엔드 호출**: `@/app/http/client`의 `apiClient`(axios 래퍼) + `getSessionFields()`로 세션 자동 주입

## 2. 표준 5파일 구조

모든 화면은 **`src/app/feature/` 의 base hook 두 개** 를 기반으로 한다 — `useBaseModel` / `useBaseController`. 신규 화면은 `src/features/guide/Guide_Feature*.{ts,tsx}` 5종 세트를 복사해 변경한다. 기존 화면도 이 구조를 따른다.

폴더당 5개 파일 — 각 파일의 책임:

| 파일 | 역할 |
|---|---|
| `Xxx.tsx` (View) | JSX/레이아웃만. `useXxxModel` + `useXxxController` 호출, `MasterDetailPage` 등 preset 에 binding. |
| `XxxController.tsx` | 화면 고유 핸들러 (`onMainGridClick`, `onAddXxx`, `onSaveXxx`, 화면 액션). `useBaseController` 헬퍼 사용. |
| `XxxModel.ts` | `useBaseModel<GridKey>(menuCode)` 한 줄 + 화면 고유 state(codeMap, 외부탭 등). |
| `XxxColumns.tsx` | ag-grid `columnDefs` 정의. 단순 `const` 배열. audit 은 DataGrid 자동. |
| `XxxApi.ts` | `apiClient.post` 호출. `MENU_CODE` 는 View 에서 import. `withSession` 포함. |

### 신규 화면 작성 흐름

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

---

## 3. View 레이어 규칙

- 레이아웃은 preset 사용: `MasterDetailPage` / `GridOnlyPage` / `GridFormPage` / `GridMapPage` (`src/app/components/layout/presets/`)
- 모든 preset 은 **`menuCode` prop** 만 받으면 내부에서 `useResolvedSearchMeta(menuCode)` 자동 호출 + loading skeleton(gate) 자동 처리 + 메뉴 권한(MenuAuth) 주입. View 에서 `useSearchMeta` / `Skeleton` import 안 함.
- `searchRef` / `filtersRef` 는 **`useBaseModel` 이 자체 보유** → `model.searchRef` / `model.filtersRef`. View 에서 `useRef` 만들지 말 것. SearchFilters 에 넘길 props 는 개별로 binding 하거나 `model.bindSearch()` spread 를 쓴다.
- DataGrid 는 `{...model.bind(gridKey)}` spread — `rowData` / `totalCount` / `currentPage` / `pageSize` / `onPageSizeChange` / `onPageChange` / `rowSelection:"single"` / `audit:true` / `setRowData` / `selectedRow` / 컬럼·엑셀 등록 콜백 자동.
  ```tsx
  <DataGrid
    {...model.bind("main")}
    columnDefs={MAIN_COLUMN_DEFS}
    onRowClicked={ctrl.onMainGridClick}
    actions={ctrl.mainActions}
  />
  ```
- 검색 payload 에서 제외할 키나 리네임은 `searchProps.excludes` 에 선언만 — `SearchFilters` 가 내부 `useSearchCondition` 으로 자동 처리한다(Controller 가 직접 transform 하지 않는다).
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
- 레이아웃 방향/토글: preset 에 **`defaultDirection={"horizontal" | "vertical"}`** + `storageKey={model.storageKeys.outer}` 만 넘긴다. preset 이 토글 버튼·방향 state·localStorage 동기화를 **내부 처리**한다. (참조: `SmsGroup.tsx` — `defaultDirection={"horizontal"}` 한 줄) 토글 버튼을 숨기려면 `layoutToggle={false}`(boolean) 지정 — `layoutToggle` prop 은 `MasterDetailPage` 에만 있다(`GridOnlyPage`/`GridFormPage` 는 토글 숨김 고정, `GridMapPage` 는 `defaultDirection` 만 받음). **View 에서 `direction=...` 이나 `layoutToggle={{...}}` 객체를 직접 wiring 하지 말 것.**
- `storageKey` 는 `model.storageKeys.outer` / `top` / `bottom` 로 binding (menuCode 기반 자동 생성).
- **`GridFormPage` 는 grid 에 `readOnly: true` 를 자동 주입**(폼이 편집 면이므로 그리드 인라인 편집을 끈다). 그리드에서 직접 `readOnly` 를 지정하면 그 값이 우선.
- **그리드 authId 표준 (그리드 리소스 권한 + 엑셀 업로드/양식 키)**: View 가 `MENU_CD` 옆에 **그리드별 authId 단일 소스**를 export 한다.
  ```ts
  export const MENU_CD = "MENU_XXX_MGMT";
  // 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
  export const AUTH = { grids: { main: "MAIN_GRID_XXX_MGMT", detail: "DETAIL_GRID_XXX_MGMT" } };
  ```
  - **용도 ①** 그리드 리소스 권한 — `<DataGrid authId={AUTH.grids.main} />` → `useResourceAccess` 가 권한 매트릭스 확인, 조회(S) 권한 없으면 그리드 비활성. 매트릭스에 없으면(통제 대상 아님) 제한 없음 → `authId` 생략 가능.
  - **용도 ②** 엑셀 업로드/양식 다운로드 키 — Controller 가 `gridId: AUTH.grids.main`(=서버 `GRID_ID`)으로 서버 컬럼 매핑/양식을 찾는다([excel-download.md](./excel-download.md) §3).
  - **단일 소스 원칙**: DataGrid `authId` 와 Controller 엑셀 `gridId` 모두 `AUTH.grids.<key>` 만 참조 — authId 리터럴을 여러 곳에 복붙하지 말 것.
  - **메뉴 권한 vs 리소스 권한**: 메뉴 단위 권한은 `menuCode`(=`MENU_CD`)로 preset 이 자동 처리, **그리드 단위(리소스) 권한·엑셀은 `authId`** 로 구분.
  - (레거시) 일부 화면은 Controller 에 `const GRID_ID = "..."` 단일 상수를 둔다 — 신규 화면은 View 의 `AUTH.grids` 단일 소스를 쓴다.

---

## 4. Controller 레이어 규칙 — `useBaseController` 헬퍼

```ts
const base = useBaseController<GridKey>({ model });
// 검색/저장을 base 에 위임할 땐:
// const base = useBaseController<GridKey>({ model, api: { search, save }, searchOptions });
```

base 가 제공하는 헬퍼:

| 헬퍼 | 시그니처 / 용도 |
|---|---|
| `base.callAjax(promise, msgOrOpts?)` | API Promise 한 번 감쌈 (성공/에러 토스트). 2번째 인자 = `successMsg`(문자열, 기본 `"MSG_SAVE_CMPLT"`) **또는** `{ successMsg?, mask? }`. **`mask`(`GridKey`\|`GridKey[]`) 지정 시 처리 중 해당 그리드에 마스킹(작업 차단 오버레이) → settle 시 자동 해제.** 미지정이면 마스킹 없음. 예: `base.callAjax(api.predictEta(...), { mask: "stop" })`. |
| `base.alert(msg, title?)` / `base.confirm(msg, onYes, title?)` | 다이얼로그 |
| `base.search(page?)` | 메인 그리드 재조회 (`model.searchRef.current?.(page)`) |
| `base.searchSub(gridKey, promise)` | 임의 그리드에 결과 set (응답 rows 추출 후 반환) |
| `base.resetGrids([keys])` | 지정 그리드들 비우기 (`rows:[]`, selection 해제) |
| `base.handleRowClick(gridKey, row, cascade?, opts?)` | selection set + cascade reset/fetch. `cascade: Array<{ to, fetch }>`, `opts: { alsoReset }` 로 손자 reset. dirty 행이 있거나 같은 행 재클릭이면 무시. |
| `base.addRow(gridKey, newRow)` | 그리드 끝 push (`EDIT_STS:"I"` + `__rid__` 자동, 마지막 행 selected). 배열도 가능. |
| `base.requireParentRow(row, label, opts?)` | 부모 행 선택+저장 검증 (`EDIT_STS:"I"` 미저장이면 실패) + alert + boolean |
| `base.saveGrid(gridKey, apiFn, opts?)` | dirty 추출 + 필수/포맷 검증 + dsSave 저장 + 후처리. |

**`saveGrid` opts**:
- `beforeSave?: () => boolean` — `false` 반환 시 저장 중단(호출 측에서 alert)
- `confirmOnDelete?: string` — 삭제 행 존재 시 해당 메시지로 confirm
- `successMsg?: string`
- `afterSave?` — `"refresh"`(기본, 메인 재조회) | `"none"` | `() => void` | `{ cascadeFrom: K, fetch: (parent) => Promise }`(부모행 기준 자식 재조회)
- 저장 시 `columnDefsRef` 기준으로 `required` 컬럼 비어있음 / regex·정수·소수 자릿수 위반을 자동 검증한다.

**fetchList** — `SearchFilters` 가 넘기는 params 를 API 에 전달 (외부 탭 조건 등 합칠 때만 추가).
**onSearchCallback** — `model.grids.main.setData(data)` + 첫 행 자동 선택은 `onMainGridClick(data?.rows?.[0])` 호출 (cascade 정의 한 곳에 모음).

**액션**:
- 그리드별 actions 배열은 **Controller 가 책임** (`useMemo` 로 정의, View 는 `actions={ctrl.mainActions}` binding 만)
- `makeAddAction` / `makeSaveAction` / `makeExcelGroupAction` / `makeCommonActions` (`@/app/components/grid/actions/commonActions`)
- **메모 등록/취소는 `makeMemoGroupAction`** (hand-roll 금지) — "메모" 그룹(등록/취소). 등록 시 `MemoInputPopup` 자동, 취소 시 (옵션) confirm 후 실행. `{ saveMemo:(rows,text)=>Promise, cancelMemo:(rows)=>Promise, onDone, validate, confirmOnCancel }` — 필드/URL 은 화면 api 가 책임, 팩토리는 플로우만.
- 화면 고유 popup/trace 같은 액션은 Controller 에 `useCallback` 으로 정의 후 actions 배열에 포함

---

## 5. Model 레이어 규칙 — `useBaseModel`

```ts
export type GridKey = "main" | "sub01" | "sub02" | "sub03";  // 화면별 그리드 이름 union

export function useXxxModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  // 공통코드 lookup — codeMap 자동 생성 (codeMap.xxxTcd["10"] === "라벨")
  const { codeMap } = useCommonStores({ xxxTcd: { sqlProp: "...", keyParam: "XXX_TCD" } });
  return { ...base, codeMap };
}
```

`useBaseModel(menuCode, options?)` 이 자동으로 제공 (`options: { pageSize?, defaultLayout? }`):
- `grids[gridKey]` — 그리드별 lazy 등록(Proxy 기반) 슬롯:
  - `data` / `rows` / `setData` / `ref`
  - `selected` / `setSelected` / `selectedRef`
  - `columnDefsRef`(DataGrid 가 등록) / `getExcelColumns()`(표시 컬럼 반환, 엑셀용)
- `searchRef` / `filtersRef` / `rawFiltersRef`(변환 전 raw 검색값 — 동적 컬럼 화면에서 사용)
- `pageSize` / `setPageSize`
- `layout` / `setLayout` (localStorage 자동 동기화)
- `storageKeys: { outer, top, bottom, layout }`
- `bind(gridKey)` — DataGrid spread props 묶음 (마스킹 `loading` 포함 — `setGridMasking` 상태 자동 반영)
- `setGridMasking(keys, on)` — 그리드별 마스킹(작업 차단 오버레이) 토글. 보통 직접 호출하지 않고 **`base.callAjax(..., { mask })` 가 자동 호출**(처리 중 ON, settle 시 OFF). `bind` 가 `loading` 으로 DataGrid 에 전달 → DataGrid 가 차단 오버레이 렌더.
- `bindSearch()` — SearchFilters spread props 묶음(`searchRef`/`filtersRef`/`rawFiltersRef`/`pageSize`)

> 모든 행에는 내부 식별자 `__rid__` 가 자동 부여되어 셀 편집으로 객체 참조가 바뀌어도 selection 이 유지된다.

화면 고유 추가:
- 공통코드 lookup → `useCommonStores` 가 `codeMap`(CODE→NAME) 자동 반환 (`useMemo` 불필요) → `{ ...base, codeMap }` 로 노출. 원본 행 배열이 필요하면 `const { stores, codeMap } = useCommonStores(...)`.
- 외부 탭 → `useState` + `useEffect` 로 옵션 로딩
- popup / form 패널 state → `useState`
- 동적 컬럼 → `columnDefs` 를 state 로 보유하고 setter 를 Controller 에 전달

---

## 6. Api 레이어 규칙

- **`MENU_CD`/`MENU_CODE` 는 오직 View(`화면.tsx`)에서 한 번만 정의·export 한다.** Controller/Api/Model/Columns 등 **그 외 파일은 재정의 금지 — 무조건 `import { MENU_CODE } from "./화면"`** 으로 가져다 쓴다(순환 import 안 됨 — Api/Controller 함수 본문에서만 사용). 여러 파일에 흩어 정의하면 값 불일치 버그가 난다(예: 한쪽 `MENU_ERROR_LOG`, 다른쪽 `MENU_EXCEPTION_LOG`).
- **`menuName` 은 항상 `const { menuName } = useMenuMeta()`** 로 가져온다(리터럴 하드코딩 금지). 엑셀 파일명 등 메뉴명이 필요한 곳은 이 값 하나만 쓴다 (→ [excel-download.md](./excel-download.md)).
- 객체 형태로 export: `export const featureApi = { getList, save, ... }`
- 모든 요청에 `MENU_CD: MENU_CODE` 포함 + `withSession` 으로 세션 필드 주입
- 저장 API 는 `dsSave` 패턴: body `{ dsSave }`, params 에 세션/MENU_CD/그 외 키
- 배열 페이로드도 `withSession` 이 각 원소에 세션 필드 자동 주입
