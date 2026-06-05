// ────────────────────────────────────────────────────────────────
// [가이드] Controller 템플릿 — base hook 패턴 (센차 ViewController 대응)
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureController.tsx)
// 2. API import / 함수명 / 핸들러명 교체
// 3. 화면별 고유 핸들러는 base 의 헬퍼들을 조합해서 짧게 작성
//
// base 헬퍼 빠른 참조
//   base.callAjax(promise, msg)              — API 한 번 감쌈 (성공/에러 토스트)
//   base.alert(msg) / base.confirm(msg, fn)  — 다이얼로그
//   base.search(page?)                       — 메인 그리드 재조회 (searchRef.current)
//   base.searchSub(gridKey, promise)         — 임의 그리드에 결과 set
//   base.resetGrids([keys])                  — 지정 그리드들 비우기
//   base.handleRowClick(gridKey, row,        — selection + cascade reset/fetch
//     cascade?, opts?)
//   base.addRow(gridKey, newRow)             — 그리드 끝에 push (EDIT_STS:"I" 자동)
//   base.requireParentRow(row, label)        — 부모 행 선택+저장 검증 + alert
//   base.saveGrid(gridKey, apiFn, opts?)     — dirty 추출 + dsSave + 후처리
// ────────────────────────────────────────────────────────────────

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { temperatureRangeManagementApi as api } from "./TemperatureRangeManagementApi.ts";
import { MENU_CODE } from "./TemperatureRangeManagement";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  TemperatureRangeManagementModel,
  GridKey,
} from "./TemperatureRangeManagementModel.ts";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: TemperatureRangeManagementModel;
}

export function useTemperatureRangeManagementController({
  model,
}: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  // const onMainGridClick = useCallback(
  //   (row: any) =>
  //     base.handleRowClick("main", row, [
  //         {
  //             to: "detail",
  //             fetch: function (row: any): Promise<any> {
  //                 throw new Error("Function not implemented.");
  //             }
  //         },
  //     ]),
  //   [base],
  // );

  // ── 메인 조회 콜백 (onSearch) — 첫 행 자동 선택 + cascade ──────
  // 메인 cascade 정의는 onMainGridClick 한 곳만 — onSearchCallback 가 그걸 재사용.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      // onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main],
  );

  // ── 메인 행 추가 ─────────────────────────────────────────────
  // base.addRow 가 EDIT_STS: "I" 자동 주입 + push.
  const onAddMain = useCallback(() => {
    //base.resetGrids(["detail"]);
    base.addRow("main", {
      XXX_CD: "",
      XXX_NM: "",
      USE_YN: "Y",
    });
  }, [base]);

  // ── 상세 행 추가 — 부모(메인) 행 검증 ─────────────────────────
  // requireParentRow 가 미선택/미저장 시 alert + false 반환.
  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "메인코드")) return;
    //base.addRow("detail", {
    //  XXX_CD: main.XXX_CD,
    //  XXX_DTL_CD: "",
    //});
  }, [model, base]);

  // ── 메인 저장 — 삭제행 있으면 confirm 후 저장 ─────────────────
  // confirmOnDelete 옵션 한 줄로 처리. 후처리는 기본값 "refresh"(메인 재조회).
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: "삭제된 항목이 있습니다. 계속 진행하시겠습니까?",
      }),
    [base],
  );

  // ── 그리드별 actions 배열 ─────────────────────────────────────
  // 추가/저장/사용자정의 버튼 결정은 모두 여기서. View 는 binding 만.
  // ActionItem[] 타입 명시 — 화면 고유 버튼 추가 시 type 추론 도움.
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [onAddMain, onSaveMain, menuName, model.grids.main, model.filtersRef],
  );

  return {
    fetchList,
    onSearchCallback,
    // onMainGridClick,
    mainActions,
  };
}

// ────────────────────────────────────────────────────────────────
// [참고 1] 사전 검증이 필요한 저장 (centRA: checkBeforeSaveSub01Grid)
//
//   const checkBefore = useCallback(() => {
//     const rows = model.grids.detail.ref.current?.rows ?? [];
//     if (rows.some((r: any) => r.DFT_YN === "Y")) return true;
//     base.alert("기본값(Y) 인 행이 1건 이상 있어야 합니다.");
//     return false;
//   }, [model, base]);
//
//   const onSaveDetail = () =>
//     base.saveGrid("detail", api.saveDetail, {
//       beforeSave: checkBefore,                       // ← false 반환 시 저장 중단
//       afterSave: { cascadeFrom: "main", fetch: ... },
//     });
//
// [참고 2] 동기화 같은 화면 고유 액션 (centRA: syncConfig)
//
//   const syncConfig = useCallback(
//     () =>
//       base
//         .callAjax(api.syncConfig({...}), "동기화되었습니다.")
//         .then(() => base.search()),
//     [base],
//   );
//   // mainActions 에 합성
//   const mainActions = useMemo(() => [
//     makeAddAction({ onClick: onAddMain }),
//     makeSaveAction({ onClick: onSaveMain }),
//     { type: "button" as const, key: "LBL_SYNC", label: "LBL_SYNC", onClick: syncConfig },
//   ], [onAddMain, onSaveMain, syncConfig]);
//
// [참고 3] 외부 탭 변경 시 전체 클리어 + 재조회 (centRA: onTypeTabChange)
//
//   const onTabChange = useCallback(
//     (key: string) => {
//       model.setActiveType(key);
//       base.resetGrids(["main", "detail"]);
//       setTimeout(() => base.search(1), 0);
//     },
//     [model, base],
//   );
//
// [참고 4] 4그리드 cascade (LgstgrpOprConfigMst 의 main → sub01 → sub02 흐름)
//
//   const onMainGridClick = useCallback(
//     (row: any) =>
//       base.handleRowClick("main", row, [
//         { to: "sub01", fetch: (r) => api.getSub01({ KEY: r.KEY }) },
//         { to: "sub03", fetch: (r) => api.getSub03({ KEY: r.KEY }) },
//       ], { alsoReset: ["sub02"] }),     // ← 손자(sub02) 도 reset
//     [base],
//   );
//
//   const onSub01GridClick = useCallback(
//     (row: any) =>
//       base.handleRowClick("sub01", row, [
//         { to: "sub02", fetch: (r) => api.getSub02({ KEY: r.KEY, SUB: r.SUB }) },
//       ]),
//     [base],
//   );
// ────────────────────────────────────────────────────────────────
