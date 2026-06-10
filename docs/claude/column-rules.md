# 컬럼 규칙 (`XxxColumns.tsx`)

> ag-grid `columnDefs` 정의 규칙. 컬럼 가공 파이프라인은 `src/app/components/grid/gridUtils/processColumn.tsx` 가 담당한다.
> 화면 구조는 [screen-architecture.md](./screen-architecture.md), 엑셀 컬럼 속성은 [excel-download.md](./excel-download.md) 참고.

---

## 1. 기본

- 단순 `const` 배열 — 함수 wrapper 안 만든다 (동적 컬럼 등 특수 케이스 제외).
- `headerName` 은 `LBL_*` 다국어 키 (`Lang.get` 자동 적용; 리터럴로 쓰려면 `noLang:true`).
- `field` 에 `DTTM` 포함 → 자동 날짜 포맷
- `field` 가 `_STS` 로 끝남 → 자동 중앙 정렬
- `type: "numeric"` / `dataType: "number"` → 우측 정렬 (`align` 명시 시 그 값 우선)
- `headerName: "No"` → 자동 일련번호 + 고정 너비
- 공통코드 → 라벨: 컬럼에 `codeKey` 지정 (DataGrid 자동 cellRenderer 주입)
- `required: true` → 헤더에 빨간 `*` 표시 + 저장 시 비어있음 검증

## 2. 편집 가능 여부 (EDIT_STS 기반 자동 변환)

`insertable` / `editable` 조합으로 편집 가부를 제어한다. 내부적으로 `resolveEditMode` → ag-grid `editable` 로 변환된다.

### 둘 다 미지정일 때 (기본값)

- **입력 위젯 타입(`date` / `datetime` / `popup` / `popuser`) + `field` 존재** → `insert` 모드와 동일: **실제 추가된 행(`EDIT_STS:"I"`)에서만 편집 ON**(데이트피커·돋보기 노출). **기존 행에는 안 뜬다.** 기존 행도 편집하려면 `editable: true` 를 명시한다.
- **그 외 타입(`text` / `numeric` / `combo` / `check` / 표시용)과 `field` 없는 컬럼** → **읽기전용**(안전장치 — 읽기전용 컬럼에 `editable:false` 를 일일이 안 달아도 됨).

### 하나라도 명시하면 타입 무관하게 그 설정이 우선

| 명시 | 모드 | 편집 가능 행 |
|---|---|---|
| `insertable: true` | insert | 추가 행(`EDIT_STS:"I"`)만 |
| `editable: true` | update | 추가 외 행(기존/수정 행)만 |
| `insertable: true, editable: true` | always | 항상 |
| 그 외(명시적 `false` 조합) | none | 편집 불가 |
| `editable: <함수\|변수>` | custom | ag-grid 에 그대로 전달 (커스텀 분기 유지) |

### 정리

- 위젯 타입을 읽기전용으로 둘 땐 `editable: false` 명시. (audit/삭제/상태 등 공통 컬럼은 `editable:false` 기본 적용됨)
- **이 정책은 모든 편집형 컬럼 타입(`combo`/`date`/`datetime`/`popup`/`popuser`/`check` 등)에 공통 적용** — 특히 `popup`/`popuser` 의 돋보기, `date` 의 데이트피커 노출도 위 정책(둘 다 미지정→추가행만, `insertable`→추가행, `editable`→수정행, 명시적 끔→미노출)으로 제어. 앞으로 편집형 컬럼 타입을 새로 추가하면 반드시 이 `insertable`/`editable` 정책으로 편집 가부를 관리할 것.
- **폼(`FormBodyRenderer`)도 그리드와 동일하게 컬럼 `type`/`dateUnit` 으로 위젯을 렌더한다** — `popup`/`popuser`→검색버튼, `date`(+`dateUnit`)→데이트피커, `combo`/`select`→셀렉트, `check`→체크박스. (`fieldType` 는 `type` 미지정 시의 fallback)

## 3. 컬럼 가공 파이프라인 (참고)

`processColumnDef` 가 순서대로 적용 — 컬럼 파일에서 직접 cellRenderer/cellEditor 를 달 필요가 없다:

1. `codeKey` → 코드→라벨 cellRenderer
2. `type:"combo"` + `codeKey` → ComboCellEditor
3. `inputType:"password"` → 비밀번호 에디터
4. `type:"text"` + `maskRe` → 마스크 에디터
5. 검증 마커(`regex`/`integerLength`/`pointLength`) → "!" 마커 + 검증 렌더러
6. `type:"check"` → 체크박스 렌더러
7. `type:"popup"|"popuser"` → 돋보기 + CommonPopup
8. `type:"address"` → "주소찾기" 버튼 + `AddressPop`. `field` 없는 액션 컬럼(`colId` 사용). 선택 시 `addrFields` 매핑대로 **다중 필드 write-back**(기본 `CTRY_CD`/`CTRY_NM`/`STT_CD`/`STT_NM`/`CTY_CD`/`CTY_NM`/`ZIP_CD`/`DTL_ADDR1`/`DTL_ADDR2`). 다른 필드명이면 `addrFields` 로 부분 오버라이드. 결과 필드는 보통 별도 읽기전용 `text` 컬럼으로 표시. 편집 노출은 `insertable`/`editable` 정책.
9. `type:"date"|"datetime"` (편집 켜진 경우) → DatePickerPopover
10. `insertable`/`editable` + EDIT_STS → ag-grid `editable` 변환
11. `required:true` → 헤더 필수 클래스
12. 커스텀 키 제거 후 ag-grid 전달

## 4. PK / audit 컬럼

- **PK 컬럼**: `isPrimaryKey: true` 표시 → DataGrid 가 `rowKeys`/`autoSelectFirstRow` 자동 활성화 (View 에서 prop 명시 불필요). 보통 `isPrimaryKey: true` + `insertable: true` 조합 (추가 시 입력 / 수정 시 잠금).
- **audit 컬럼**: `model.bind` 가 `audit:true` 자동 spread → DataGrid 가 컬럼 끝에 standardAudit 자동 추가(삭제 체크박스 / `EDIT_STS` 상태 / 등록자·등록일시 / 수정자·수정일시). 컬럼 파일에서 `standardAudit` 직접 호출 안 함.
  - audit 부분 토글: View 에서 `audit={{ updatePerson: false }}` 명시
  - audit 자동 끄기: View 에서 `audit={false}` 명시 (audit 컬럼이 중간 위치 / 별도 처리 화면)

## 5. 주요 컬럼 속성

| 속성 | 효과 |
|---|---|
| `type` | `text`/`numeric`/`date`/`datetime`/`combo`/`check`/`popup`/`popuser`/`address` — 위젯·정렬·포맷·기본 편집모드 결정 |
| `field` | row 데이터 키. 없으면 액션 전용 컬럼 |
| `codeKey` | 코드→라벨 + combo 옵션 |
| `isPrimaryKey` | row 식별 컬럼 (`rowKeys`/`autoSelectFirstRow` 자동) |
| `align` | 자동 정렬 덮어쓰기 |
| `decimalPlaces` | `numeric` 고정 소수 자릿수 포맷 |
| `dateUnit` | `date` 단위(`year`/`month`/`day`) |
| `addrFields` | `type:"address"` write-back 필드 매핑 부분 오버라이드 (기본 `ctryCd:"CTRY_CD"`…`dtlAddr2:"DTL_ADDR2"`) |
| `colId` | `field` 없는 액션 컬럼(`address` 등)의 식별자 |
| `required` | 헤더 `*` + 저장 검증 |
| `validators` | `{ max, min, integerLength, pointLength, regex, regexTp }` |
| `excelColName` | 엑셀 헤더 덮어쓰기 (→ [excel-download.md](./excel-download.md)) |
| `excelPrint` | 엑셀 출력 포함/제외 (→ [excel-download.md](./excel-download.md)) |
| `noLang` | `headerName` 을 리터럴로 사용 |
