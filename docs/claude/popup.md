# 팝업(모달) 규칙

> 팝업 시스템: `src/app/components/popup/`. 컨텍스트 기반 스택 모달.
> 화면 구조는 [screen-architecture.md](./screen-architecture.md), 참조 화면은 [reference-screens.md](./reference-screens.md) 참고.

---

## 1. 열기/닫기 — `usePopup()`

```ts
const { openPopup, closePopup } = usePopup();

openPopup({
  title: Lang.get("BTN_XXX"),   // 헤더 제목
  width: "lg",                  // 너비 토큰
  content: <XxxPopup ... />,    // 본문
});
closePopup();                   // 최상단 팝업 닫기
```

- **스택 기반 중첩**: 팝업 위에 팝업 가능. 최상단만 활성, 하위 팝업은 mount 유지(`display:none`)되어 폼 state 보존.
- **width 토큰**: `sm`(384) · `md`(448) · `lg`(512) · `xl`(576) · `2xl`(672) · `3xl`(768) · `4xl`(896) · `full`(1200). 기본 `xl`.
- 헤더는 드래그 이동 가능, 닫을 때 opener 로 포커스 복귀, `maxHeight:90vh` 내부 스크롤, `document.body` portal.
- React 밖(액션 버튼 등)에서는 `getPopupApi()` 로 접근.

## 2. 팝업 종류와 레이아웃 컴포넌트

| 컴포넌트 | 위치 | 용도 |
|---|---|---|
| `FormPopupLayout` | `popup/FormPopupLayout.tsx` | 폼 입력 + 취소/확인 버튼. `Field` 들을 감쌈. `isValid` 로 확인 비활성. |
| `GridSearchPopupLayout` | `popup/GridSearchPopupLayout.tsx` | 필터 입력 + 선택 배지 + DataGrid + 적용/취소. `columnDefs` 에 `sendField` 로 키 리네임. |
| `CommonPopup` | `popup/CommonPopup.tsx` | 코드\|명 2열 검색(레거시 `sqlId` 또는 `fetchFn`). 그리드 `popup` 셀에서 자동 사용. |
| `Field` | `popup/Field.tsx` | 폼 필드 단위. `layout`(horizontal/vertical), `type`(text/textarea/combo), `required`, `disabled`. |

## 3. 표준 작성 규칙

- **위치**: 화면 폴더 하위 `popup/` 에 둔다 — 예: `master/account/location/popup/LatLonEditPopup.tsx`.
- **이름**: `XxxPopup.tsx`.
- **prop 계약** (콜백으로 부모와 통신, 팝업은 자기 state 만 관리):

  ```ts
  // 폼 팝업
  type Props = {
    onConfirm: (data: {...}) => void;
    onClose: () => void;
    initialValues?: Record<string, any>;
  };

  // 그리드 검색 팝업 — 선택 행(들) 반환
  type Props = {
    onConfirm: (payload: Record<string, any> | Record<string, any>[]) => void;
    onClose: () => void;
    initialValues?: Record<string, any>;
  };

  // 조회 전용 / 사이드이펙트 팝업 — 내부에서 API 호출 후 알림
  type Props = {
    rows: any[];
    onApplied?: () => void;   // 서버 처리 성공 후
    onClose: () => void;
  };
  ```

- **템플릿**: `src/features/guide/Guide_FormPopup.tsx`(폼) / `Guide_GridSearchPopup.tsx`(그리드 검색) 복사해서 시작.

## 4. 데이터 흐름

1. **폼 팝업**: 입력 → `onConfirm(data)` → 부모 Controller 가 도메인 필드 합쳐 `base.callAjax(api.save(...))`.
2. **그리드 검색 팝업**: 행 선택 → `onConfirm(payload)`(필요 시 `sendField` 로 리네임) → 부모가 합쳐 API.
3. **사이드이펙트 팝업**(예: `RegionAddPopup`): 팝업이 직접 API 호출 → `onApplied()` → 부모가 `base.searchSub(gridKey, ...)` 로 sub 재조회.
4. **행 직접 패치**(예: `LatLonEditPopup`): `onApply(patch)` → 부모가 `commitRowChanges(model.grids.X.setData, row, patch)` 로 해당 행 머지(+`EDIT_STS` 자동 "U").

```ts
// commitRowChanges (src/app/components/grid/gridUtils/rowStatus.ts)
commitRowChanges(setRowData, targetRow, patch): void
// targetRow 를 참조/__rid__ 로 찾아 patch 머지, 숨김 필드 복원, EDIT_STS 자동 갱신
```

## 5. Controller 에서 여는 예시

```tsx
const onEditLatLon = useCallback(() => {
  const main = model.grids.main.selectedRef.current;
  if (!base.requireParentRow(main, "착지")) return;
  openPopup({
    title: Lang.get("BTN_EDIT_LATLON"),
    width: "4xl",
    content: (
      <LatLonEditPopup
        row={main}
        onApply={(patch) => {
          commitRowChanges(model.grids.main.setData, main, patch);
          closePopup();
        }}
        onClose={closePopup}
      />
    ),
  });
}, [base, model.grids.main, openPopup, closePopup]);
```

## 6. 팝업 조회조건(검색조건) 스타일 표준 ★

> 팝업 안에 검색/조회 입력 영역을 둘 때는 **`VehicleAddPopup` 의 조회조건과 동일한 카드형**으로 통일한다. — 이것이 **팝업 조회조건 표준 스타일**이다. (참조 구현: `VehicleAddPopup` / `GridSearchPopupLayout` / `VehicleChangePopup`)
> ※ 이 표준은 **본 화면 조회조건(SearchFilters, cyan 헤더)과 다르다** — 팝업은 아래 카드형을 쓴다.

**표준 DOM/className** (`GridSearchPopupLayout` 조회조건 영역과 동일):

```
div("rounded-xl border border-slate-200 overflow-hidden shadow-sm")
├ 헤더  div("flex items-center justify-between px-3 py-2 bg-[var(--grid-header-bg)]")
│        ├ 좌: SlidersHorizontal("w-3.5 h-3.5 text-color/80") + span("text-[12px] font-semibold text-color tracking-widest uppercase")  // "조회조건"
│        └ 우: Button(ghost, xs, "h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-color hover:text-[rgb(var(--primary))] text-[12px] font-semibold") > Search("w-3 h-3") + "조회"
└ 본문  div("grid divide-x divide-y divide-slate-100", style={ gridTemplateColumns: repeat(min(필드수,3), minmax(0,1fr)) })
         └ 필드: div("flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group")
            ├ label("text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500")
            └ 위젯  // TEXT=테두리 없는 input("text-[12px] text-slate-700 bg-transparent outline-none border-none w-full")
                    // COMBO=ComboFilter(borderless inputClassName) · POPUP=코드 input(w-[80px])+"|"+코드명 input(flex-1)+돋보기 button
```

- **조회 버튼은 헤더 우측 알약형**(footer 아님). 필드 라벨은 `text-[10px]` 회색 떠있는 라벨, input 은 **테두리 없이** 셀 안에 배치.
- 필드는 `divide-x divide-y` 로 칸을 구분하는 표 형태 — 보통 3열(`min(필드수,3)`).

**이 표준을 따르는 곳**:
- `VehicleAddPopup` (`master/account/location/popup/`) — **표준 기준 구현**. 카드형 조회조건을 직접 구성(물류운영그룹 코드/명 + 돋보기).
- `GridSearchPopupLayout` (`popup/`) — `fields`/`columnDefs` prop 기반 공용 그리드 검색 팝업 레이아웃. 조회조건 영역이 이 표준.
- `VehicleChangePopup` · `VehicleAssignPopup`(2종) · `ArChargeAddPopup` 등 — `GridSearchPopupLayout` 사용.
- `RegionAddPopup` · `LatLonEditPopup` (`master/account/location/popup/`) — `GridSearchPopupLayout` 을 안 쓰므로 위 카드형을 **직접 구성**.

> **앞으로 팝업에 조회조건 영역을 추가/수정할 때는 이 카드형 스타일로 맞춘다.** `GridSearchPopupLayout` 을 쓸 수 있으면 그대로 쓰고, 못 쓰는 팝업은 위 DOM/className 으로 비슷하게 직접 구성하면 된다.
