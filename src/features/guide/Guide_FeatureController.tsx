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
import { featureApi as api } from "./Guide_FeatureApi";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./Guide_FeatureColumns";
import { MENU_CODE, AUTH } from "./Guide_Feature";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { FeatureModel, GridKey } from "./Guide_FeatureModel";

interface ControllerArgs {
  model: FeatureModel;
}

export function useFeatureController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ XXX_CD: r.XXX_CD }),
        },
      ]),
    [base],
  );

  // ── 메인 조회 콜백 (onSearch) — 첫 행 자동 선택 + cascade ──────
  // 메인 cascade 정의는 onMainGridClick 한 곳만 — onSearchCallback 가 그걸 재사용.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // ── 메인 행 추가 ─────────────────────────────────────────────
  // base.addRow 가 EDIT_STS: "I" 자동 주입 + push.
  const onAddMain = useCallback(() => {
    base.resetGrids(["detail"]);
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
    base.addRow("detail", {
      XXX_CD: main.XXX_CD,
      XXX_DTL_CD: "",
    });
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

  // ── 상세 저장 — 부모 행 기반 cascade 재조회 ────────────────────
  // afterSave: { cascadeFrom, fetch } 객체 형태 — 저장 후 자기 자신만 재조회.
  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.save, {
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getDetailList({ XXX_CD: main.XXX_CD }),
        },
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
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: "화면명",
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
        // 엑셀 업로드 / 양식 다운로드를 그룹 "안"에 포함 (필요한 화면만).
        // gridId 는 View 가 export 한 AUTH.grids 단일 소스 참조 (센차 grid.authId).
        // 그룹 "밖" 별도 버튼은 makeExcelUploadAction / makeExcelTemplateDownloadAction 따로 호출.
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main },
      }),
    ],
    [onAddMain, onSaveMain, base, model],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        columns: DETAIL_COLUMN_DEFS,
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: "화면명-상세",
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({ XXX_CD: main.XXX_CD })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [onAddDetail, onSaveDetail, model],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    detailActions,
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
