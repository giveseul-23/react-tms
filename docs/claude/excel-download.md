# 엑셀 다운로드 표준 (`makeExcelGroupAction`)

> 그리드 화면의 엑셀 다운로드는 아래 패턴으로 통일한다. 서버 공통 3단계: `saveUserTempData → commonExcelDownPrepare → downloadCommonExcel`.
> 컬럼 속성은 [column-rules.md](./column-rules.md) 참고.

---

## 1. 기본 패턴

```ts
const { menuName } = useMenuMeta();   // HomePage 가 MenuMetaProvider 로 주입
...
makeExcelGroupAction({
  excelColumns: () => model.grids.<key>.getExcelColumns(),  // columns 대신
  menuCode: MENU_CD,                  // 서버 MENU_CD (3단계 세션 키)
  menuName: menuName,                 // 파일명 = 메뉴명(MENUNAME, 없으면 MENUCODE)
  fetchFn: () => api.getList(model.filtersRef.current),
  rows: model.grids.<key>.rows,
}),
```

- **`excelColumns`**: `getExcelColumns()` = 그리드 **표시 중 컬럼**(audit 포함·런타임 숨김/순서 반영·`codeKey` 라벨맵 첨부). 정적 `columns` 는 안 넘김. `makeCommonActions({ excel })` 도 동일.
- **`menuName`**: `useMenuMeta().menuName`. 파일명은 `excelService` 가 `menuName`(공백→`_`, `/`→공백 치환) + `Date.now()` 로 생성.
- 두 버튼(조회된 모든 데이터 / 보이는 데이터) 공유:
  - **"조회된모든데이터"**(filtered:"N") → 서버가 `SEARCH_URL`+검색조건으로 재조회 후 변환.
  - **"보이는데이터"** → 메모리상 `rows`, `codeKey` 라벨은 클라 codeMap.

## 2. 컬럼 속성 (`XxxColumns.tsx`)

- `excelColName`: 엑셀 헤더 텍스트 덮어쓰기 (화면 헤더와 다르게).
- `excelPrint`: 엑셀 출력 포함/제외 (화면 hidden 과 독립):

  | 화면 | excelPrint | 엑셀 |
  |---|---|---|
  | 보임 | 미지정 | 출력 |
  | 숨김 | 미지정 | 제외 |
  | 숨김 | `true` | 출력(강제) |
  | 보임/숨김 | `false` | 제외 |

- **codeKey**: 코드→명 출력 (보이는 데이터=클라 치환, 모든 데이터=서버 `EXCEL_COL_COMBOCOLS`+코드데이터 변환).
- **체크박스(`type:"check"`/Y·N)**: 엑셀 무조건 center 정렬.
- **정렬**: `align` 명시값 우선, 없으면 그리드 규칙(date/datetime·`_STS`·DTTM→center, numeric→right) 동일.

## 3. 엑셀 업로드 / 양식 다운로드

조회/다운로드 외에 **업로드·양식 다운로드 버튼**이 필요하면 두 가지 방식:

**(1) 엑셀 그룹 "안"에 포함** — `makeExcelGroupAction` 에 옵션만 추가:

```ts
makeExcelGroupAction({
  excelColumns: () => model.grids.main.getExcelColumns(),
  menuCode: MENU_CD,
  menuName,
  fetchFn: () => api.getList(model.filtersRef.current),
  rows: model.grids.main.rows,
  upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() }, // 업로드 후 재조회
  templateDownload: { gridId: AUTH.grids.main, fileName: menuName },     // 양식 다운로드
}),
```

**(2) 그룹 "밖" 별도 버튼** — 팩토리 직접 호출 (위치 자유):

```ts
makeExcelUploadAction({ menuCode: MENU_CD, gridId: AUTH.grids.main, onUploaded: () => base.search() }),
makeExcelTemplateDownloadAction({ menuCode: MENU_CD, gridId: AUTH.grids.main, fileName: menuName }),
```

- **`gridId`**: 업로드/양식 대상 그리드 식별자(센차 `grid.authId`). 서버가 컬럼 매핑을 찾는 키. **View 가 export 한 `AUTH.grids.<key>` 단일 소스를 참조**한다(authId 표준 → [screen-architecture.md](./screen-architecture.md) §3).
- **`onUploaded`**: 업로드 성공 후 콜백(보통 `() => base.search()`).
- **`fileName`**: 서버 `Content-Disposition` 없을 때만 쓰는 fallback 파일명.
- **`accept`**(업로드): 확장자 필터, 기본 `.xlsx,.xls`.
- 서버 호출: 업로드 `commonApi.uploadCommonExcel`, 양식 `commonApi.downloadExcelTemplate`.
- 라벨 기본값: 업로드 `BTN_EXCEL_UP`, 양식 `BTN_EXCEL_TEMPLATE_DOWNLOAD`.

## 4. 예외 화면

- `MenuConfig` — TreeGrid 화면. 표준 액션 팩토리(`makeExcelGroupAction`)는 그대로 쓰되, `getExcelColumns()` 대신 `getVisibleColIds: () => treeGridRef.current?.getVisibleColIds()` 로 표시 컬럼 id 를 넘긴다.

> `ParameterConfiguration` 은 과거 `model.gridData` 를 쓰던 예외였으나, 현재는 표준(`useBaseModel` + `model.bind` + `getExcelColumns()`)을 따른다.
