# 작업가이드 표준 이탈 화면 목록

> 기준: `CLAUDE.md` + `docs/claude/*.md` 의 표준 5파일 구조/규칙
> 조사 범위: `src/features/**` 업무 화면 (약 100개)
> 작성일: 2026-06-15

## 요약

`useBaseModel`(Model 전수) · `useBaseController`(Controller 전수) · preset 사용 · Columns 단순배열은 **사실상 전수 준수**. 이탈은 아래 항목에 집중된다.

| 유형 | 규칙 | 건수 |
|---|---|---|
| MENU_CD 값 불일치 (실제 버그) | #2 | **1** (ErrorLog) |
| MENU_CD 재정의 (값 일치, 죽은 중복) | #2 | 9 |
| preset 우회 + useSearchMeta 직접 (업무화면) | #1,#5 | 1 (UseStatus) |
| menuName 리터럴 하드코딩 | #8 | 2 |
| 엑셀 정적 columns 동시 전달 | #9 | 1 |
| TreeGrid 알려진/묵시적 예외 | #1,#5 | 2 |

## 표준 규칙 번호 (참조)

1. View 레이아웃은 preset 사용 (`MasterDetailPage`/`GridOnlyPage`/`GridFormPage`/`GridMapPage`). `useSearchMeta`/`Skeleton` 직접 import 금지.
2. `MENU_CD`/`MENU_CODE` 는 View 에서 한 번만 정의·export, 그 외 파일은 import.
3. Model 은 `useBaseModel`.
4. Controller 는 `useBaseController`.
5. searchRef/filtersRef 는 model 보유 (View 에서 `useRef` 금지).
6. DataGrid 는 `{...model.bind(gridKey)}`.
7. Columns 는 단순 `const` 배열 (함수 래퍼는 동적 컬럼 등 특수 케이스만).
8. menuName 은 `useMenuMeta()` (리터럴 하드코딩 금지).
9. 엑셀은 `makeExcelGroupAction` + `getExcelColumns()`.

---

## 🔴 상 — 구조/값 정합성 위반

### ErrorLog (예외로그)
- **경로**: `src/features/adm/log/errorlog/`
- **위반**: #2 (MENU_CD 값 불일치) — **실제 서버 전송 버그**
- **근거**:
  - `ErrorLog.tsx:11` → `MENU_CD = "MENU_EXCEPTION_LOG"`
  - `ErrorLogApi.ts:4` → `"MENU_EXCEPTION_LOG"` (재정의)
  - `ErrorLogController.tsx:6` → `"MENU_ERROR_LOG"` (**값 불일치**), `:22,46` 에서 서버 페이로드로 전송
- 가이드 §6 이 명시 경고한 케이스. **가장 시급.**

### UseStatus (이용현황)
- **경로**: `src/features/cms/mobile/usests/`
- **위반**: #1, #5 (preset 자동 meta 우회 + useSearchMeta 직접)
- **근거**:
  - `UseStatus.tsx:4` → `import { useSearchMeta }`
  - `UseStatus.tsx:14-17` → `useSearchMeta(MENU_CODE)` + `useSearchMeta("MENU_MBL_USE_STS")` 두 번 호출 후 fallback 병합
  - `UseStatusOverWrapPanel.tsx:29` → 내부 `SplitPane` 수동 조립
- 메뉴코드 fallback 병합이라는 화면 특수성 있음.

---

## 🟡 중 — MENU_CD 재정의 (값 일치, 죽은 중복)

View 에 `export const MENU_C..` 가 있는데 Controller/Api 가 같은 값을 다시 `const` 정의(import 안 함). 값은 일치하나 한쪽만 바뀌면 ErrorLog 처럼 깨짐.

| 화면명 | 경로 | 재정의 위치 |
|---|---|---|
| StoppedVehicleControl | `src/features/cms/vehicle/stppdvhcntrl/` | `StoppedVehicleControlController.tsx:14` |
| UserGroup | `src/features/adm/usr/usrgrp/` | `UserGroupController.tsx:17`, `UserGroupApi.ts:3` |
| Organization | `src/features/tms/master/organization/orgstrt/` | `OrganizationController.tsx:14` |
| AccountReceivableChargeManagement | `src/features/tms/tariff/accountreceivablecharge/` | `...Controller.tsx:19` |
| BatchManagement | `src/features/adm/env/batch/` | `BatchManagementController.tsx:20` |
| VehicleWorkday | `src/features/tms/resources/vehworkday/` | `VehicleWorkdayController.tsx:23` |
| FuelEfficiency | `src/features/tms/resources/fuelefficiency/` | `FuelEfficiencyController.tsx:18` |
| UserAccount | `src/features/adm/usr/usracct/` | `UserAccountApi.ts:4` |
| DtgDailyTemperHis | `src/features/cms/vehicletemp/dtgdailytemperhis/` | `DtgDailyTemperHisApi.ts:4` (이중 export) |
| DtgDailyVehHis | `src/features/cms/vehicle/dtgdailyvehhis/` | `DtgDailyVehHisController.tsx:13` (정의 site 비표준, 파일명도 비표준 명명) |

> 참고: `Driver` (`src/features/tms/resources/driver/DriverController.tsx:260`) `row.MENU_CD = "MENU_DRVR_MGMT"` 는 상수 재정의가 아니라 행 데이터 필드 주입(리터럴). 영향 경미.

---

## 🟡 중 — menuName 리터럴 하드코딩 (#8)

| 화면명 | 경로 | 근거 |
|---|---|---|
| VehicleType | `src/features/tms/resources/vehicleType/` | `VehicleTypeController.tsx:50` → `menuName: "차량유형관리"` (한글 하드코딩). + `:47` 엑셀에 정적 `columns: MAIN_COLUMN_DEFS` 를 `getExcelColumns()` 와 동시 전달 (#9 부분 이탈) |
| IfPlant | `src/features/tms/ifmonitoring/rcvlist/plant/` | `IfPlantController.tsx:85` → `menuName: "LBL_PLANT"` (언어팩 키지만 `useMenuMeta` 미사용, 경미) |

---

## ⚪ 알려진/묵시적 예외 (TreeGrid 계열)

| 화면명 | 경로 | 근거 |
|---|---|---|
| MenuConfig | `src/features/adm/menu/cnfg/` | `MenuConfig.tsx:6,87` useSearchMeta 직접 + `:83-85` raw useRef. **가이드 명시 예외** (TreeGrid 화면) |
| UiResource | `src/features/adm/usr/rsrc/` | `UiResource.tsx:5,22` useSearchMeta 직접 + `:18-19` raw useRef. 문서 미명시이나 동일 TreeGrid 부류 |
| ParameterConfiguration | `src/features/adm/env/paramcnfg/` | 문서상 과거 예외. 현재는 `useBaseController` + preset 사용으로 표준 복귀 (추가 이탈 없음) |

---

**가장 시급한 수정 대상: ErrorLog 의 MENU_CD 값 불일치 (실제 버그).**
