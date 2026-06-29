import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { logisticGroupPlanId as api } from "./LogisticGroupPlanIdApi";
import { MENU_CODE } from "./LogisticGroupPlanId";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  LogisticGroupPlanIdModel,
  GridKey,
} from "./LogisticGroupPlanIdModel";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface ControllerArgs {
  model: LogisticGroupPlanIdModel;
}

export function useLogisticGroupPlanIdController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;

    return api.getList({
      DIV_CD: srchObj.SRCH_DIV_CD,
      LGST_GRP_CD: srchObj.SRCH_LGST_GRP_CD,
    });
  }, [model.rawFiltersRef]);

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        {
          to: "detail",
          fetch: (r) => api.getDetailList({ LGST_GRP_CD: r.LGST_GRP_CD }),
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

  // ── 상세 행 추가 — 부모(메인) 행 검증 ─────────────────────────
  // requireParentRow 가 미선택/미저장 시 alert + false 반환.
  const onAddDetail = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_LOGISTICS_GROUP_CODE"))) return;
    base.addRow("detail", {
      LGST_GRP_CD: main.LGST_GRP_CD,
    });
  }, [model, base]);

  const validateSingleDefault = useCallback((): boolean => {
    const defaultCount = model.grids.detail.rows.filter(
      (r) =>
        !r.delStatus && (r.DFT_YN === "Y" || r.DFT_YN === true),
    ).length;

    if (defaultCount > 1) {
      base.alert(Lang.get("MSG_DFT_ALREADY_EXIST", Lang.get("LBL_DEFAULT")));
      return false;
    }
    if (defaultCount === 0) {
      base.alert(Lang.get("MSG_NO_DEFAULT_AREA", Lang.get("LBL_PLAN_ID")));
      return false;
    }
    return true;
  }, [model.grids.detail.rows, base]);

  const onSaveDetail = useCallback(
    () =>
      base.saveGrid("detail", api.save, {
        beforeSave: validateSingleDefault,
        afterSave: {
          cascadeFrom: "main",
          fetch: (main) => api.getDetailList({ LGST_GRP_CD: main.LGST_GRP_CD }),
        },
      }),
    [base, validateSingleDefault],
  );

  // ── 그리드별 actions 배열 ─────────────────────────────────────
  // 추가/저장/사용자정의 버튼 결정은 모두 여기서. View 는 binding 만.
  // ActionItem[] 타입 명시 — 화면 고유 버튼 추가 시 type 추론 도움.
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [model],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({ LGST_GRP_CD: main.LGST_GRP_CD })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: () => model.grids.detail.rows,
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
