import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import {
  dirtyRows,
  toDsSave,
} from "@/app/components/grid/gridUtils/rowStatus";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { userPlanApi } from "./UserPlanApi";
import { MENU_CD, AUTH } from "./UserPlan";
import type { UserPlanModel, GridKey } from "./UserPlanModel";

interface Args {
  model: UserPlanModel;
}

const getLgstGrpCdFromModel = (model: UserPlanModel) =>
  String(model.rawFiltersRef.current?.SRCH_PLN_LGST_GRP_CD ?? "").trim();

export function useUserPlanController({ model }: Args) {
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) => userPlanApi.getUserPlanList(MENU_CD, params),
      save: userPlanApi.save,
    },
    searchOptions: {
      transformParams: (params) => {
        const lgst = String(
          params?.SRCH_PLN_LGST_GRP_CD ?? params?.LGST_GRP_CD ?? "",
        ).trim();
        return lgst ? { ...params, LGST_GRP_CD: lgst } : params;
      },
    },
  });
  const { menuName } = useMenuMeta();

  const getLgstGrpCd = useCallback(
    () => getLgstGrpCdFromModel(model),
    [model.rawFiltersRef],
  );

  // 저장 payload — 신규/수정 행에 LGST_GRP_CD 보완
  const buildDsSave = useCallback(
    (dirty: any[]) => {
      const lgstFallback = getLgstGrpCd();
      return toDsSave(
        dirty.map((r) => ({
          ...r,
          LGST_GRP_CD: String(r.LGST_GRP_CD ?? lgstFallback).trim(),
        })),
      );
    },
    [getLgstGrpCd],
  );

  // 조회조건 물류운영그룹을 신규 행에 주입
  const onAdd = useCallback(() => {
    const lgstGrpCd = getLgstGrpCd();
    if (!lgstGrpCd) {
      base.alert(
        Lang.get("MSG_REQ_FIELD", Lang.get("LBL_LOGISTICS_GROUP_CODE")),
      );
      return;
    }
    base.addRow("main", { LGST_GRP_CD: lgstGrpCd, DFT_YN: "N" });
  }, [base, getLgstGrpCd]);

  const onSave = useCallback(
    () =>
      base.saveGrid("main", () =>
        userPlanApi.save({
          dsSave: buildDsSave(dirtyRows(model.grids.main.ref.current?.rows ?? [])),
        }),
      ),
    [base, buildDsSave, model.grids.main],
  );

  // 추가 / 저장 / 엑셀 — 공통 팩토리(makeCommonActions).
  const mainActions = useMemo(
    () => [
      makeAddAction({ onClick: onAdd }),
      makeSaveAction({ onClick: onSave }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () =>
          userPlanApi.getUserPlanList(MENU_CD, model.filtersRef.current),
        rows: () => model.grids.main.rows,
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main },
      }),
    ],
    [onAdd, onSave, menuName, model.grids.main, model.filtersRef, base],
  );

  return { ...base, getLgstGrpCd, mainActions };
}
