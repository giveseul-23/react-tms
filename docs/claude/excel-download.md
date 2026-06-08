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
- **`menuName`**: `useMenuMeta().menuName`. 파일명은 `excelService` 가 `menuName + Date.now()` 로 생성.
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

## 3. 예외 화면

표준 미적용 (`model.grids` 미사용):
- `ParameterConfiguration` — `model.gridData`
- `MenuConfig` — TreeGrid, `getVisibleColIds` 방식
