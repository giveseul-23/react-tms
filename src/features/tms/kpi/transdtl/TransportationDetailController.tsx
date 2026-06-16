import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { transportationDetailApi as api } from "./TransportationDetailApi";
import { MENU_CODE } from "./TransportationDetail";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { TransportationDetailModel, GridKey } from "./TransportationDetailModel";

interface Args {
  model: TransportationDetailModel;
}

export function useTransportationDetailController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();

  // ── 메인 조회 (단일 그리드 inquiry) ───────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      // 센차 onMainInfoCallback: 조회 후 첫 행 자동 선택
      model.grids.main.setSelected(data?.rows?.[0] ?? null);
    },
    [model.grids.main],
  );

  // ── 경로조회 (서버 onShowRoute → ShowRoutePop) ────────────────────
  // ShowRoutePop 은 dspchpln 모듈의 T-Map 기반 경로 팝업으로 React 포팅본이 아직 없다.
  // TODO: 지도/경로 팝업 인프라 마련 후 openPopup 으로 연결 (DSPCH_NO / MAP_TP 전달).
  const onShowRoute = useCallback(() => {
    const row = model.grids.main.selectedRef.current;
    // 센차 isCheckSelectRecord — 선택 없으면 안내 후 중단
    if (!row) {
      base.alert(Lang.get("MSG_EXCEPTION_SHOW_ROUTE_NO_SELECT_CHK"));
      return;
    }
    // TODO: ShowRoutePop(dspchpln, T-Map 경로 팝업) React 포팅 후
    //   openPopup({ title: "BTN_SHOW_ROUTE", content: <ShowRoutePop dspchNo={row.DSPCH_NO} mapTp={row.MAP_TP} /> })
    //   로 연결. 현재 지도/경로 팝업 인프라 미존재.
  }, [base, model.grids.main]);

  // ── 메인 액션 (경로조회 + 엑셀 조회된모든데이터/보이는데이터) ──────
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_SHOW_ROUTE",
        label: "BTN_SHOW_ROUTE",
        onClick: onShowRoute,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, onShowRoute],
  );

  return {
    fetchList,
    onSearchCallback,
    onShowRoute,
    mainActions,
  };
}
