import { useCallback, MutableRefObject } from "react";
import { langPackApi } from "@/features/adm/env/langpack/LanguagePackApi";
import { LanguagePackModel } from "./LanguagePackModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import { useGridAdd, useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { MAIN_COLUMN_DEFS } from "./LanguagePackColumns";

type ControllerProps = {
  menuCd: string;
  model: LanguagePackModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useLanguagePackController({
  menuCd,
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── 조회 fetch ────────────────────────────────────────────────
  const fetchLanguagePackList = useCallback(
    (params: Record<string, unknown>) =>
      langPackApi.getLangPackList(menuCd, { ...params }),
    [menuCd],
  );

  // saveFn — useGridSave 가 만든 payload({ dsSave, rows }) 중 dsSave 만 사용.
  // MENU_CD 는 항상 함께 전송 (서버 PARAM_MAP 으로 들어감).
  const saveLangPack = useCallback(
    (payload: any) =>
      langPackApi.saveLangPack({
        dsSave: payload.dsSave,
        MENU_CD: menuCd,
      }),
    [menuCd],
  );

  // 조회 완료 시 그리드 데이터 반영
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
    },
    [model],
  );

  // ── 추가 (BTN_ADD) — 빈 행 prepend, EDIT_STS = "I" 자동 ───────
  const handleAdd = useGridAdd({
    setRows: model.setGridData,
    newRow: { MSG_CD: "", LANG_GBN: "", MSG_DESC: "", APPLCODE: "" },
    position: "top",
  });

  // ── 복사: 선택 행을 신규 행으로 복제 ─────────────────────────
  const handleCopy = useCallback(() => {
    const selected = model.gridData.rows.filter((r: any) => r._selected);
    const sources = selected.length > 0 ? selected : model.gridData.rows;
    if (sources.length === 0) return;

    const clones = sources.map((r: any) => ({
      ...r,
      EDIT_STS: "I",
      _selected: false,
      CRE_USR_ID: "",
      CRE_DTTM: "",
      UPD_USR_ID: "",
      UPD_DTTM: "",
    }));

    model.setGridData((prev) => ({
      ...prev,
      rows: [...clones, ...prev.rows],
      totalCount: prev.totalCount + clones.length,
    }));
  }, [model]);

  // ── 저장 (BTN_SAVE) — dirty 행만 saveFn 으로 → 성공 후 재조회 ─
  const handleSave = useGridSave({
    rows: model.gridData.rows,
    setRows: model.setGridData,
    saveFn: saveLangPack,
    onSaved: () => searchRef.current?.(),
  });

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_COPY",
      label: "BTN_COPY",
      onClick: handleCopy,
    },
    makeAddAction({ onClick: handleAdd }),
    makeSaveAction({ onClick: handleSave }),
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS(),
      menuName: "다국어메시지",
      fetchFn: () => langPackApi.getLangPackList(menuCd, filtersRef.current),
      rows: model.gridData.rows,
    }),
  ];

  return {
    fetchLanguagePackList,
    handleSearch,
    mainActions,
  };
}
