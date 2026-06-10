# 복잡도별 참조 화면

> 신규 화면 작성 시 가장 가까운 화면을 골라 참고한다. (현재 소스 기준 재감사 — 2026-06)
> 표준 구조는 [screen-architecture.md](./screen-architecture.md) 참고.
> 가이드 템플릿 5종은 `src/features/guide/Guide_Feature*.{ts,tsx}` 에 있다.

---

| 복잡도 | 화면 | 위치 | preset | GridKey | 특성 |
|---|---|---|---|---|---|
| 입문형 | `Currency` | `master/domain/currency/` | `GridOnlyPage` | `main` | 단일 그리드, 가장 단순. `audit={{delete:false}}`, codeMap 한 개. |
| 기본형 | `DivisionDefault` | `master/organization/env/division/divdft/` | `MasterDetailPage` | `main`/`detail` | 2그리드 1:1 cascade. master 클릭 → detail fetch. 동적 codeMap(선택 행 의존). |
| 기본형 (폼) | `VehicleMgmt` | `resources/vehicleMgmt/` | `GridFormPage` | `main` | 그리드 + 폼 시트(`FormSheetOverlay`+`FormBodyRenderer`)로 신규/수정. `GridFormPage` 가 그리드에 `readOnly:true` 자동 주입(폼이 편집 면). `CommonPopup` 연동, 적재율→최대치 자동계산. |
| 중급형 (다중 sub) | `Location` | `master/account/location/` | `MasterDetailPage` (12탭 detail) | `main` + 12 sub | 메인 1행 → 다수 sub 동시 cascade(fan-out), `SUB_CONFIG` 매핑으로 액션 생성, **팝업 4종**(지도 보기/위경도 편집/차량 추가/구역 추가). (`dock` 탭은 GridKey 에 남아있으나 현재 비활성) |
| 중급형 (동적 컬럼) | `ApDailyManagement` | `calculate/vhcunit/dtrsptnrpt/` | `GridOnlyPage` (2탭) | `main`/`detail` | 조회 시 `getUsedChgCd` 메타 fetch → `buildDailyColumns` 로 컬럼 runtime 재생성(캐시). `model.rawFiltersRef` 사용. |
| 고급형 (중첩 탭/트리거) | `ApSettlMgmt` | `calculate/apsettlmgmt/` | `MasterDetailPage` (SplitPane + 중첩 탭) | 9개 그리드 | 마스터 → 8-way fan-out cascade, 4단계 중첩(master→summary→nested tab), 트리거 액션(`base.callAjax`), 저장 후 cascade 재실행. |
| 고급형 (풀세트) | `LgstgrpOprConfigMst` | `master/organization/lgstgrpOprConfigMst/` | `MasterDetailPage` (외부 탭 + SplitPane×2) | `main`/`detail`/`mainLang`/`detailLang` | 외부 탭(config 타입) + 4그리드 + 다국어 페어 그리드 + 사전검증(`beforeSave`) + `confirmOnDelete` + cascade `alsoReset`. |

---

## 패턴 메모

- **단순 cascade** (`DivisionDefault`): `base.handleRowClick("main", row, [{ to:"detail", fetch }])`
- **fan-out cascade** (`Location`, `ApSettlMgmt`): cascade 배열에 sub 여러 개 나열 — 한 번 클릭에 동시 fetch. `Location` 은 `SUB_CONFIG.map(...)` 으로 배열 생성.
- **팝업 연동** (`Location`): `usePopup()` + `openPopup({ content: <XxxPopup onApply={...} /> })`. 팝업이 부모 행을 고치면 `commitRowChanges(setData, row, patch)`, sub 추가면 `base.searchSub` 로 재조회. 신규 팝업: `popup/LatLonEditPopup.tsx`, `popup/LocationMapPopup.tsx`, `popup/RegionAddPopup.tsx`.
- **동적 컬럼** (`ApDailyManagement`): `fetchList` 안에서 메타 조회 → `model.setMainColumnDefs(buildDailyColumns(...))`. 같은 조건이면 `chgCacheRef` 로 재fetch 방지.
- **외부 탭** (`LgstgrpOprConfigMst`): Model `useEffect` 로 탭 목록 로딩 → `fetchList` 가 `model.activeType` 를 검색조건에 합침.
- **다국어 페어 그리드** (`LgstgrpOprConfigMst`): main↔mainLang, detail↔detailLang 각각 vertical SplitPane.
- **저장 전 검증** (`LgstgrpOprConfigMst`): `base.saveGrid(key, api.save, { beforeSave: checkFn, confirmOnDelete: "MSG_CHK_DELETE" })`.
