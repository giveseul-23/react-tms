# HipassFareManagement 작업 기록

## 화면 정보
- React 경로: `src/features/tms/calculate/vhcunit/hipassmgmt`
- React View: `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagement.tsx`
- React Controller: `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementController.tsx`
- React Model: `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementModel.ts`
- React Api: `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementApi.ts`
- React Columns: `src/features/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementColumns.tsx`
- Sencha 경로: `C:/DEV_TMS/git/olympusboot3/olympusboot3/src/main/webapp/resource/app/vc/view/mdl/tms/calculate/vhcunit/hipassmgmt`
- Sencha Java Service: `C:/DEV_TMS/git/olympusboot3/olympusboot3/src/main/java/com/vc/mdl/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementService.java`
- Sencha Java Biz: `C:/DEV_TMS/git/olympusboot3/olympusboot3/src/main/java/com/vc/mdl/tms/calculate/vhcunit/hipassmgmt/HipassFareManagementBiz.java`

## 현재 알려진 주요 이슈
- 저장 payload는 Java Service가 `getDataList("dsSave")`를 사용하므로 `{ dsSave: [...] }` 구조를 유지해야 한다.
- main grid는 Sencha `checkboxmodel` + `MULTI` + `checkOnly` 구조이므로 React도 multiple selection과 체크박스 선택 컬럼을 유지해야 한다.
- sub01 grid는 Sencha toolbar에 paging control이 없으므로 React에서 `pagination={false}`를 유지해야 한다.
- Sencha에는 삭제/상태 audit 컬럼이 없고 등록/수정자 및 등록/수정일시 컬럼만 있으므로 React audit은 delete/rowStatus를 제외한다.
- 팝업 호출 버튼은 확인되지 않았다.

## 작업 이력

### 2026-06-23 - Sencha 기준 화면 생성/보정
- 작업 범위:
  - main/sub01 master-detail 가로 분할 구조와 grid authId를 Sencha 기준으로 확인했다.
  - main grid checkbox multi selection의 선택 컬럼 폭/고정 설정을 추가했다.
  - sub01 grid paging을 Sencha 기준으로 비활성화했다.
  - 자동 audit 컬럼 중 Sencha에 없는 삭제/상태 컬럼을 제외하고 등록/수정자, 등록/수정일시는 유지했다.
  - 확정/확정취소/취소 저장 payload의 선택행에 `MENU_CD`를 보존하도록 보강했다.

- 확인한 기준 문서:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/claude/screen-architecture.md`
  - `docs/claude/column-rules.md`
  - `docs/claude/search-style.md`
  - `docs/claude/excel-download.md`
  - `docs/claude/popup.md`
  - `docs/claude/reference-screens.md`
  - `docs/standard-deviations.md`

- 확인한 Sencha 소스:
  - `HipassFareManagement.js`
  - `HipassFareManagementMain.js`
  - `HipassFareManagementSub01.js`
  - `HipassFareManagementController.js`
  - `HipassFareManagementModel.js`
  - `HipassFareManagementService.java`
  - `HipassFareManagementBiz.java`

- 비교한 React 참고 화면:
  - `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagement.tsx`
  - `src/features/tms/calculate/vhcunit/dtrsptnrpt/ApDailyManagementController.tsx`
  - `src/features/tms/calculate/vhcunit/monthapmgmt/ApMonthlyManagement.tsx`
  - `src/features/tms/calculate/vhcunit/monthapmgmt/ApMonthlyManagementController.tsx`
  - 비교 이유: 같은 차량단위 정산 영역의 grid action, excel action, 선택행 저장, `useMenuMeta()` 사용 패턴 확인.

- Sencha 비교 결과:
  - layout: north search 영역 + center 영역 내부 main 80% / sub01 20% 가로 분할.
  - main grid reference/authId: `mainGrid` / `MAIN_HIPASS_FARE_MGMT`.
  - sub01 grid reference/authId: `subGrid01` / `SUB01_HIPASS_FARE_MGMT`.
  - selection: main은 `checkboxmodel`, `MULTI`, `checkOnly`; sub01은 rowmodel.
  - toolbar: main에 paging, 엑셀양식다운로드, 엑셀업로드, 확정, 확정취소, 취소 버튼이 있음. sub01에는 paging/업무 버튼 없음.
  - pagination: main은 paging control 있음, sub01은 없음.
  - 조회 URL: `/hipassFareManagementService/search`, `/hipassFareManagementService/searchDetail`.
  - 저장 URL: `/hipassFareManagementService/updateToConfirm`, `/updateToConfirmCancel`, `/updateToCancel`.
  - payload: 저장은 `dsSave` dataset, 각 행은 `rowStatus='U'` 흐름.
  - 팝업 호출: 없음.

- 원인 분석:
  - 기존 React View는 큰 구조와 authId는 맞았으나 sub01에 기본 pagination이 켜질 수 있어 Sencha와 달랐다.
  - `model.bind()`의 기본 audit은 delete/rowStatus 컬럼까지 추가하므로 Sencha의 명시 컬럼보다 컬럼 구성이 많아질 수 있었다.
  - 저장 payload는 `{ dsSave: [...] }` 구조였으나 행 내부 `MENU_CD`도 Sencha/공통 payload 추적 관점에서 보존하는 편이 안전하다.

- 수정 파일과 변경 이유:
  - `HipassFareManagement.tsx`: main checkbox selection column 설정, sub01 pagination 비활성, read-only audit 옵션 적용.
  - `HipassFareManagementController.tsx`: 선택행 저장 payload에 `MENU_CD` 보존.

- 알려진 미구현/주의사항:
  - Sencha 기준 팝업 버튼은 없어 미구현 팝업 항목 없음.
  - 하이패스 엑셀 업로드는 공통 `makeExcelGroupAction`의 upload/templateDownload 경로를 사용한다. 실제 서버 업로드 처리 결과는 API 환경에서 수동 확인이 필요하다.

- 검증 결과:
  - `npx eslint src\features\tms\calculate\vhcunit\hipassmgmt --ext .ts,.tsx`: PowerShell 실행 정책으로 `npx.ps1` 차단.
  - `npx.cmd eslint src\features\tms\calculate\vhcunit\hipassmgmt --ext .ts,.tsx`: 통과.
  - `npm.cmd run build`: 통과. Vite의 기존 dynamic/static import chunk 경고만 출력됨.

- 수동 검증 체크리스트:
  - 조회 시 main 첫 행이 선택되고 sub01 상세가 조회되는지 확인.
  - main 행 클릭 시 `HIPASS_AP_ID` 기준으로 sub01이 재조회되는지 확인.
  - main에서 여러 행 체크 후 확정/확정취소/취소 버튼의 상태 검증 메시지가 Sencha와 일치하는지 확인.
  - 저장 API request body가 `{ dsSave: [...] }`이고 각 행에 `rowStatus: "U"`가 포함되는지 확인.
  - main grid에 paging이 있고 sub01 grid에는 paging이 없는지 확인.
  - main 엑셀 양식 다운로드/업로드 버튼이 grid authId `MAIN_HIPASS_FARE_MGMT` 기준으로 동작하는지 확인.

- 다음에 먼저 볼 것:
  - 저장 오류 발생 시 Java Service의 `getDataList("dsSave")`와 React `postSave` body 구조 비교.
  - 확정/취소 버튼이 동작하지 않으면 선택행 배열과 `HIPASS_FI_STS` 상태값(`4010`, `4015`) 비교.
  - sub01이 비어 있으면 main 선택행의 `HIPASS_AP_ID`와 `/searchDetail` 파라미터 확인.
  - 엑셀 업로드 오류 발생 시 `AUTH.grids.main`과 서버 gridId 매핑 확인.
