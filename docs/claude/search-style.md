# 조회조건(SearchFilters) 스타일 표준 ★

> **이 화면 영역의 스타일이 가장 중요하다. 신규/수정 시 아래 토큰을 그대로 따르고, 임의로 height·gap·폰트 크기를 바꾸지 말 것.**
> 위치: `src/app/components/Search/SearchFilters/`(컨테이너) + `src/app/components/Search/`(필드/조건) + `filters/`(위젯).
> 조회조건의 동작/메타는 [screen-architecture.md](./screen-architecture.md) §3 의 `excludes`·`useSearchMeta` 참고.

---

## 1. 컨테이너 구조 (DOM + className)

```
Card("shadow-sm rounded-lg")
└ Collapsible
  ├ 헤더  div("flex items-center justify-between px-3 py-1.5 bg-[rgb(var(--primary))] rounded-t-lg")
  │        └ SlidersHorizontal("w-4 h-4 text-white") + span("text-[13px] font-semibold text-white uppercase")  // "조회조건"
  ├ 본문  CardContent("p-2 text-[12px]  [&_input]:h-6 [&_input]:px-2 [&_input]:py-0 [&_input]:text-[11px]  [&_select]:h-6 [&_[role=combobox]]:h-6 [&_button]:h-6")
  │        └ div("grid grid-cols-20 gap-x-2 gap-y-1")   // 필드들
  └ 푸터  div("flex justify-between px-2 py-1 border-t")
           ├ 좌: Button(outline,xs) "초기화" + layoutToggle
           └ 우: Button(outline,xs, btn-primary) "조회"
```

핵심: **본문이 `[&_input]:h-6` 등 전역 override 로 모든 입력 높이를 24px(h-6)로 강제**한다 → 개별 위젯에서 height 를 다시 지정하지 말 것.

## 2. 필드 1칸 구조 (`SearchFilter.tsx`)

```tsx
<div className={cn(SPAN_CLASS[span], "flex items-center gap-8 min-w-0")}>
  <div className={cn("w-[100px]", "shrink-0 flex items-center gap-1")}>
    {condition !== undefined && <ConditionBox value={condition} disabled={conditionLocked} />}
    <SearchFilterLabel label={label} required={required} />
  </div>
  <div className="flex-1 min-w-0">{/* 위젯 */}</div>
</div>
```

- **그리드**: `grid grid-cols-20` — 필드는 `span`(1~20)으로 너비 차지. 기본 span 3.
- **라벨 폭**: `w-[100px]` 고정 (조건 아이콘 `w-5 h-5` + 라벨 텍스트).
- **라벨**: `text-[11px] font-medium leading-6 whitespace-nowrap`, 필수면 `text-red-500 *`.

## 3. 위젯별 (SearchMeta `type` → 컴포넌트)

| type | 컴포넌트 (`filters/`) | 표준 스타일 |
|---|---|---|
| `TEXT` | `TextFilter` | `Input` · `text-[11px]` · 값 있을 때 우측 X버튼(`pr-6`) |
| `COMBO` | `ComboFilter` | `SelectTrigger("!h-6 px-2 text-[11px] [&>svg]:h-3 [&>svg]:w-3")`, placeholder "선택" |
| `Y`/`YM`/`YMD`/`YMDT` | `DateRangeFilter` | `mode:"N"` 단일, `mode:"Y"` 범위. 범위는 `grid grid-cols-[1fr_auto_1fr] gap-x-1` + `~`(`text-xs text-muted-foreground`) |
| `POPUP` | `PopupFilter` | 코드 input `w-[110px]` + 코드명 input(`flex-1 pr-10`, **`readOnly`** — 돋보기 선택/코드 Enter 로만 채워짐, 사용자 직접 입력 불가) + 돋보기 버튼(absolute). payload 엔 `_CD`(meta.key)만 — `_NM` 은 서버 제외(표시 전용) |
| `CHECKBOX` | `CheckboxFilter` | `label("h-6 px-2 rounded-lg border")` + checkbox `h-3 w-3 accent-emerald-600` |

- **DatePicker(`DatePickerPopover`)**: 트리거는 **숫자 직접입력 마스크 입력창** + 우측 달력아이콘(absolute, 팝오버 트리거). 미입력 자리는 회색 placeholder 오버레이로 표시.
  - **마스크/검증**: 숫자만 입력(비숫자 제거). 자리별 범위 검증 — 월 01–12 / 일 01–31 / 시 00–23 / 분·초 00–59. `13`·`32`·`00` 등 둘째 자리 오버플로는 거부, 십의자리로 불가능한 첫 숫자(월 `6` 등)는 `0` 자동 패딩(`06`).
  - **커밋**: 달력/연·월 선택 시 **확인 없이 즉시 적용**(확인/취소 버튼 없음, `오늘`만), 시간 변경도 라이브. 직접입력은 blur/Enter 로 커밋(미완성·무효 원복). 비필수면 `allowClear` 로 공백 허용.
  - **크기 `size`**: `sm`(기본 — 조회조건/그리드, `h-7`·`text-[11px]`·`rounded-md`·`bg-input-background`) / `lg`(폼 팝업 `Field` 와 동일 — `h-10`·`text-sm`·`rounded-lg`·`border-gray-300`·`px-3`). 입력·마스크 오버레이·아이콘이 함께 맞춰진다.
  - **범위(from-to)**: `DateRangeFilter`(`mode:"Y"`)가 from>to 면 to=from, to<from 이면 from=to 로 자동 보정.

## 4. 조건 연산자 (`ConditionBox` / `IconCombo`)

- 라벨 앞 아이콘 버튼 `w-5 h-5`. 클릭 시 드롭다운(`rounded-lg border bg-white shadow-lg py-1`, 항목 `px-3 py-2 text-sm hover:bg-gray-100`, 선택 시 `text-[rgb(var(--primary))]`).
- 연산자: equal / notEqual / percent(부분일치) / parentheses(포함) / chevron* (초과·미만·이상·이하) / notUsed(사용안함) — 매핑은 `conditionIcons.ts`.
- **`conditionLocked: true`** → 아이콘 `opacity-40 cursor-not-allowed`, 드롭다운 안 열림.

## 5. 스타일 토큰 (이 값들을 기준으로 통일)

| 토큰 | 값 |
|---|---|
| 라벨 폭 | `w-[100px]` |
| 그리드 | `grid-cols-20`, `gap-x-2 gap-y-1` |
| 입력 높이 | `h-6`(본문 전역 override) |
| 폰트 | 입력/라벨/버튼 `text-[11px]`, 본문 `text-[12px]`, 헤더 "조회조건" `text-[13px]` |
| 본문 패딩 | `p-2` / 푸터 `px-2 py-1 border-t` |
| primary | `rgb(var(--primary))` = `#00BAED` (`--primary: 0 186 237`) |
| 조건 아이콘 박스 | `w-5 h-5` |
| 버튼 | `variant="outline" size="xs"`, 조회 버튼은 `btn-primary` |

## 6. 정규화 필요 항목 (TODO — 발견된 불일치)

> 사용자 지시: 조회조건 스타일 정규화 필요. 아래는 현재 코드에서 발견된 발산(divergence) — 손볼 땐 §스타일 변경 금지([dev-workflow.md](./dev-workflow.md) §2)에 따라 사용자 승인 후 일괄 통일.

1. **입력 높이 충돌**: `TextFilter`/`DatePicker` 는 `h-7` 선언하지만 본문 `[&_input]:h-6` 가 이김 → 실제 24px. 한쪽으로 통일 필요.
2. **`ComboFilter` `!h-6 !min-h-0`** 강제 override — Radix 기본 높이와 싸우는 형태. 공통화 검토.
3. **필드 간 gap 제각각**: 라벨↔입력 `gap-8`, PopupFilter 내부 `gap-3`, DateRange 내부 `gap-x-1` → 기준 하나로.
4. **아이콘 크기 불일치**: DatePicker `w-3.5 h-3.5` vs Combo `[&>svg]:h-3 w-3`.
5. **CheckboxFilter** 만 입력 높이 규약 밖(`h-3 w-3` 하드코딩) — 의도/통일 결정.
6. **버튼 색**: 조회/초기화가 Radix 기본 의존 — 명시 토큰화 검토.

## 7. 조회조건 필드 활성 규칙 (`fieldRules` / `enableWhen`) ★

> 다른 필드 값에 따라 특정 조회조건 필드를 **활성/비활성(+필수/자동클리어)** 하는 선언 규칙. 화면별 커스텀 검색 컴포넌트를 **포크하지 말고**, 공통 `SearchFilters` 에 `fieldRules` prop 만 넘긴다. (센차 `contractConditionDisable` 대응)
> 위치: `src/app/components/Search/SearchFilters/fieldRules.ts`(규칙 타입·평가) + `index.tsx`(비활성 계산/입력차단/자동클리어/required 오버라이드) + `SearchFieldRenderer.tsx`(비활성 시각/조건아이콘 잠금).

### 규칙 형태

```ts
// fieldRules: Record<대상필드 key, FieldRule>
type EnableCondition = { field: string; equals?: string | string[]; filled?: boolean };
type FieldRule = {
  enableWhen: EnableCondition | EnableCondition[];  // 배열 = 여러 조건 AND
  requiredWhenEnabled?: boolean;                    // 활성일 때 필수(*)로
  clearOnDisable?: boolean;                         // 필드가 비활성될 때 그 필드 값을 자동으로 지울지 여부 (기본 true=지움 / false=값 보존)
};
```

| 항목 | 의미 |
|---|---|
| Record 의 key | 대상 필드 `DBCOLUMN`(점 포함) — 활성/필수/클리어 **대상** |
| `enableWhen.field` | 제어 필드 state 키(=`DBCOLUMN`, 점 포함) |
| `enableWhen.equals` | 그 값(들)일 때 만족. **배열 = OR** |
| `enableWhen.filled` | `true` → 값이 채워져 있어야 만족 |
| `enableWhen` 자체 | 객체 or **배열 = 여러 조건 AND** |
| `requiredWhenEnabled` | 활성일 때 required(헤더 `*` + 조회 필수검증) |
| `clearOnDisable` | 필드가 **비활성될 때 그 필드 값을 자동으로 지울지 여부**. 기본 `true`(지움) / `false` 면 값 보존(다시 활성되면 이전 값 유지) |

### 동작 (공통단 자동 처리)

- **비활성 필드**: 시각 disable(`opacity-50 pointer-events-none`) + 조건아이콘 잠금 + **입력 차단**(비어있지 않은 write 무시, 클리어는 허용) + **자동 클리어** + **쿼리에서 값 제외**.
- **required 오버라이드**: 활성+`requiredWhenEnabled` → 필수 / 비활성 → 필수 해제. (표시 + `useSearchExecute` 필수검증 공용)
- `fieldRules` 미지정 화면은 기존 경로 그대로 → 회귀 없음.

### 예시

```tsx
// 1) 기본 — 레벨이 CONTRACT 일 때만 매출계약코드 활성 + 필수
fieldRules={{
  "AR_CNTRCT_CD": { enableWhen: { field: "AR_TRF_LCD", equals: "CONTRACT" }, requiredWhenEnabled: true },
}}

// 2) DB 컬럼에 테이블 접두(점)가 있으면 그대로 (따옴표 필수)
fieldRules={{
  "A.AR_CNTRCT_CD": { enableWhen: { field: "A.AR_TRF_LCD", equals: "CONTRACT" }, requiredWhenEnabled: true },
}}

// 3) 여러 "필드" → Record 항목만 늘림
fieldRules={{
  "A.AR_CNTRCT_CD": { enableWhen: { field: "A.AR_TRF_LCD", equals: "CONTRACT" }, requiredWhenEnabled: true },
  "B.SUB_CD":       { enableWhen: { field: "B.USE_YN", equals: "Y" } },
  "C.DTL_CD":       { enableWhen: { field: "C.MAIN_CD", filled: true }, clearOnDisable: true },
}}

// 4) 한 "필드"에 조건 여러 개 (모두 만족 = AND) → enableWhen 배열
fieldRules={{
  "A.AR_CNTRCT_CD": {
    enableWhen: [
      { field: "A.AR_TRF_LCD", equals: "CONTRACT" },
      { field: "SHPM.CUST_CD", filled: true },
    ],
    requiredWhenEnabled: true,
  },
}}

// 5) 값이 여러 개 중 하나면 활성 (OR) → equals 배열
fieldRules={{
  "A.SOME_CD": { enableWhen: { field: "A.TYPE_CD", equals: ["10", "20"] } },
}}
```

- **키는 서버 `DBCOLUMN` 그대로**: 정규화(점→언더스코어) 안 한다. DB 컬럼이 `A.AR_TRF_LCD` 면 `field: "A.AR_TRF_LCD"`, 대상 key 도 `"A.AR_CNTRCT_CD"` 처럼 점 포함. 정확한 값은 조회조건 API 응답의 `dsSearchCondition[].DBCOLUMN` 에서 확인. (점 들어간 키는 객체 리터럴에서 **따옴표 필수**)
- **제어 필드가 POPUP 이면** `enableWhen.field` 는 코드 state 키(`<base>_CD`)를 쓴다(코드명 아님, **코드값**으로 판정). COMBO/TEXT/CHECKBOX/날짜는 state 키 = `DBCOLUMN` 그대로.
- 적용 예: `SettlementOrderContract` (매출계약레벨=CONTRACT → 매출계약코드 활성/필수). 과거 전용 컴포넌트 `SettlementOrderContractSearch`(약 740줄)를 이 규칙으로 대체·제거함.
