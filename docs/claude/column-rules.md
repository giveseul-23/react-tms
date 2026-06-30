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
9. `type:"date"|"datetime"` (편집 켜진 경우) → DatePickerPopover — 그리드 셀은 값 텍스트 + 달력아이콘(iconOnly), 폼/팝업은 마스크 입력창. **선택 즉시 적용(확인/취소 없음)**, 숫자 직접입력 시 자리별 범위 검증(월/일/시/분/초). 자세한 동작은 [search-style.md](./search-style.md) §3.
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
| `statusStyle` | 상태 enum 명(예: `"DSPCH_OP_STS"`) → 코드값을 배지(톤색)로 렌더. `codeKey`(라벨)와 함께, 자동 중앙정렬 (→ §7) |
| `isPrimaryKey` | row 식별 컬럼 (`rowKeys`/`autoSelectFirstRow` 자동) |
| `align` | 자동 정렬 덮어쓰기 |
| `decimalPlaces` | `numeric` 고정 소수 자릿수 포맷 + 천단위 콤마 (→ §6) |
| `summaryType` | `"sum"`/`"avg"`/`"count"`/`"min"`/`"max"` — 그 `field` 집계를 하단 고정 집계행으로 자동 생성 (→ §6) |
| `summaryScope` | 집계 대상 — `"all"`(기본, 전체 행) / `"selected"`(셀 범위(shift 드래그) 선택 행) (→ §6) |
| `dateUnit` | `date` 단위(`year`/`month`/`day`) |
| `defaultValue` | 신규 행(`EDIT_STS:"I"`)의 해당 `field` 가 비어있을 때 자동 채움 (모든 type 공통) (→ §6) |
| `addrFields` | `type:"address"` write-back 필드 매핑 부분 오버라이드 (기본 `ctryCd:"CTRY_CD"`…`dtlAddr2:"DTL_ADDR2"`) |
| `colId` | `field` 없는 액션 컬럼(`address` 등)의 식별자 |
| `required` | 헤더 `*` + 저장 검증 |
| `validators` | `{ required, max, min, integerLength, pointLength, regex, regexTp }` (→ §6) |
| `validators.regexText` | regex 위반 시 노출할 커스텀 메시지 키/문자열 — 없으면 `MSG_REGEX_TEXT` (→ §6) |
| `editAllowField` / `editDisableMsg` | `check` 토글 조건부 허용 필드 + 차단 시 안내 메시지 (→ §6) |
| `excelColName` | 엑셀 헤더 덮어쓰기 (→ [excel-download.md](./excel-download.md)) |
| `excelPrint` | 엑셀 출력 포함/제외 (→ [excel-download.md](./excel-download.md)) |
| `noLang` | `headerName` 을 리터럴로 사용 |

## 6. 검증(validators) · 숫자 콤마 · 합계행 · 편집조건

### 6.1 검증 (`validators`)

`{ required, max, min, integerLength, pointLength, regex, regexTp }` — 타입별 동작이 다르다. 검증은 **실시간(cellRenderer "!" 마커 + 셀 밖 floating 메시지) + 저장(`saveGrid`) 차단** 양쪽 공용.

| 키 | 적용 타입 | 동작 |
|---|---|---|
| `required` | 공통 | 헤더 `*` + 저장 시 비어있음 검증. (`required: true` 또는 `validators.required: true` 동일) |
| `max` / `min` | `numeric` | `valueSetter` 가 범위 밖 값 **입력 자체를 거부**(메시지 없음) |
| `max` | `text` | 입력 `maxLength` 제한 |
| `integerLength` | `numeric` | 정수부 자릿수 초과 시 마커 + `MSG_VALID_INT_LEN_MAX` |
| `pointLength` | `numeric` | 소수부 자릿수 초과 시 마커 + `MSG_VALID_POINT_LEN_MAX`. **`0` 이면 정수만**(`MSG_VALID_NUM_INT`) |
| `regex` | `text` | `RegExp` 직접 지정 → 위반 시 마커 + 메시지 |
| `regexTp` | `text` | 사전 정의 패턴 — `"GCODE"` / `"PHONE"` / `"EMAIL"`. `regex` 대신 타입명만으로 검증 |

- **regex 위반 메시지**: **`validators.regexText`**(커스텀 메시지 키/문자열) 우선 → `Lang.get` 으로 번역 노출, 없으면 `MSG_REGEX_TEXT` 기본 메시지. (`regexTp` 와 같은 `validators` 안에 둘 것 — 최상위 `col.regexText` 도 fallback 으로 읽지만 권장 위치는 `validators`)
- `regex` / `regexTp` 는 **`type:"text"` 에서만** 동작.

### 6.2 숫자 천단위 콤마

- `type:"numeric"` / `dataType:"number"` / `cellDataType:"number"` → **우측 정렬**.
- **`decimalPlaces`** 지정 시 `toLocaleString` 으로 **고정 소수 자릿수 + 천단위 콤마** 포맷. (커스텀 `valueFormatter` 가 있으면 그게 우선)
- 별도 `numberComma` 같은 키는 없다 — 콤마 포맷은 numeric + `decimalPlaces` 로 제어.

### 6.3 집계행 (`summaryType` / `summaryScope`)

- 컬럼에 **`summaryType`** → DataGrid 가 그 `field` 의 집계를 **하단 고정 집계행(ag-grid `pinnedBottomRowData`)** 으로 자동 생성. 종류: **`"sum"`(합계) / `"avg"`(평균) / `"count"`(개수) / `"min"`(최소) / `"max"`(최대)**.
- 값의 콤마를 제거한 뒤 숫자로 집계하며, 숫자가 아닌 값은 무시(`count`는 행 개수). 그룹 컬럼의 `children` 도 재귀로 수집한다.
- **`summaryScope`** 로 집계 대상 지정 — **`"all"`(기본, 전체 행)** / **`"selected"`(셀 범위(shift 드래그)로 선택한 행)**. `"selected"` 는 선택 변경 시 실시간 재계산되며, 범위 미선택 시 행 선택(없으면 0)으로 폴백한다.
- 컬럼 파일에 `summaryType`(+필요 시 `summaryScope`) 만 달면 되고, View 에서 별도 prop 불필요.
- (구) `summable: true | "avg"` 키는 **폐기** — 전부 `summaryType` 으로 통합(`true`→`"sum"`).

### 6.4 체크 토글 조건부 허용 (`editAllowField`)

`type:"check"` 컬럼에서 행 조건에 따라 체크 토글을 막을 때 사용 (센차 `excheckcolumn editAllowField` 대응).

- **`editAllowField`**: 행의 해당 필드 값이 **`"Y"` 인 행에서만** 체크 토글 허용.
- 허용 조건이 아닌 행에서 토글 시 — `editDisableMsg`(있으면 `Lang.get` 안내 모달) 표시 후 **토글 차단**.

### 6.5 신규 행 기본값 (`defaultValue`)

신규 행(`EDIT_STS:"I"`)에 컬럼별 기본값을 자동으로 채운다. 적용은 `DataGrid` 의 `useRowLifecycle` 가 담당한다(컬럼 파일엔 `defaultValue` 만 선언).

- **`defaultValue`**: **모든 type 공통** — 신규 행의 해당 `field` 가 비어있을 때(`undefined`/`null`/`""`) 그 값으로 채운다. 값은 선언한 타입 그대로(`text:"B"`, `numeric:0`, `check:"Y"`, `combo`/`popup`: 코드 등).
- **`type:"check"`**: `defaultValue` **미선언 시에도 `"N"`** 이 기본 적용된다(체크 안 한 신규 행도 저장 시 `"N"` 포함). `"Y"` 로 시작하려면 `defaultValue: "Y"`.
- 이미 값이 있는 필드는 덮어쓰지 않는다(빈 필드만 채움). 사용자가 입력/토글하지 않아도 저장 페이로드에 기본값이 포함된다.

> (구버전) `type:"check"` 전용 `defaultYn` 키는 **폐기**되었다 — 전부 `defaultValue` 로 통합. 신규/기존 화면 모두 `defaultValue` 만 쓴다.

## 7. 상태 배지 / 상태 enum (`statusStyle`) ★

상태 코드 컬럼(`SHPM_OP_STS` / `DSPCH_OP_STS` / `AP_FI_STS` / `AR_FI_STS` / `IF_PRCS_STS`)은 공통 배지 스타일(라벨스탕 — 연한 배경 + 동계열 글자 알약)로 통일한다.

### 그리드 컬럼 — `statusStyle`

- **`field` 가 관리 대상 상태 enum 과 같거나 유사하면**, 그 enum 명을 **`statusStyle`** 로 넣는다(+ 라벨용 `codeKey`). 그게 전부.
  ```ts
  { type:"combo", headerName:"LBL_OP_STATUS", field:"DSPCH_OP_STS",
    codeKey:"dspchOpSts", statusStyle:"DSPCH_OP_STS" }
  ```
- `processColumn`(`injectStatusBadge`)이 배지 cellRenderer 를 자동 주입하고 **자동 중앙정렬**한다. **화면에서 상태 색상 `cellStyle`/색상맵을 직접 작성하지 말 것.**
- 라벨 = `codeMap[codeKey][code]`, 색 = `STATUS_TONE[statusStyle][code]`.

### 두 파일로 분리 관리 (색 따로 / 코드 따로)

- `src/app/components/grid/status/statusColors.ts` — 톤 팔레트(`TONE_CLASS`) + 코드→톤(`STATUS_TONE`). **색만** 여기서 수정.
- `src/app/components/grid/status/statusEnums.ts` — 상태 **코드 상수**(서버 enum 미러링: `DSPCH_OP_STS`/`SHPM_OP_STS`/`AP_FI_STS`/`AR_FI_STS`/`IF_PRCS_STS`). **컨트롤러 로직 체크용.**

### 컨트롤러 로직 — 값(매직스트링) 금지, enum 상수 사용

상태를 리터럴(`"2010"` 등)로 비교하지 말고 enum 상수를 쓴다. **부등호/`||`/`===` 는 코드에 그대로 두고 "값"만 상수**로 바꾼다(헬퍼 함수 없이).
  ```ts
  if (r.DSPCH_OP_STS !== DSPCH_OP_STS.OPEN) ...
  if (row.DSPCH_OP_STS >= DSPCH_OP_STS.IN_TRANSIT) ...
  if (String(r.AP_FI_STS ?? "") >= AP_FI_STS.OPEN) ...   // 4010 이상
  ```
