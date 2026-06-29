import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { preferredCarrierApi as api } from "./PreferredCarrierApi";
import { MENU_CODE } from "./PreferredCarrier";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { PreferredCarrierModel, GridKey } from "./PreferredCarrierModel";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import PreferedCarrAddPopup from "../location/popup/PreferedCarrAddPopup";

interface ControllerArgs {
  model: PreferredCarrierModel;
}

export function usePreferredCarrierController({ model }: ControllerArgs) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  // ── 메인 행 추가 ─────────────────────────────────────────────
  // base.addRow 가 EDIT_STS: "I" 자동 주입 + push.
  const onAddMain = useCallback(
    (rowData: any) => {
      // {} 대신 팝업에서 가공되어 넘어온 rowData를 넣어줌
      base.addRow("main", rowData);
    },
    [base],
  );

  // ── 메인 저장 — 삭제행 있으면 confirm 후 저장 ─────────────────
  // confirmOnDelete 옵션 한 줄로 처리. 후처리는 기본값 "refresh"(메인 재조회).
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        confirmOnDelete: Lang.get("MSG_CHK_DELETE"),
      }),
    [base],
  );

  // ── 그리드별 actions 배열 ─────────────────────────────────────
  // 추가/저장/사용자정의 버튼 결정은 모두 여기서. View 는 binding 만.
  // ActionItem[] 타입 명시 — 화면 고유 버튼 추가 시 type 추론 도움.
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_ADD",
        label: "BTN_ADD",
        onClick: (e: any) => {
          openPopup({
            title: "LBL_PREFERED_CARRIER",
            content: (
              <PreferedCarrAddPopup
                onConfirm={(payload: any[]) => {
                  // 팝업에서 선택되어 배열로 넘어온 차량 데이터들을 루프 돌며 추가
                  onAddMain(payload);
                  closePopup();
                }}
                onClose={closePopup}
              />
            ),
            width: "full",
          });
        },
      },
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      onSaveMain,
      menuName,
      model.grids.main,
      model.filtersRef,
      openPopup,
      closePopup,
      onAddMain,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
