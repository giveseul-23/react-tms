import { useCallback, MutableRefObject } from "react";
import { langPackApi } from "@/features/adm/env/langpack/LanguagePackApi";
import { LanguagePackModel } from "./LanguagePackModel";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { useApiHandler } from "@/hooks/useApiHandler";
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
  const { handleApi } = useApiHandler();

  // ── 조회 fetch ────────────────────────────────────────────────
  const fetchLanguagePackList = useCallback(
    (params: Record<string, unknown>) =>
      langPackApi.getLangPackList(menuCd, { ...params }),
    [menuCd],
  );

  // 조회 완료 시 그리드 데이터 반영
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
    },
    [model],
  );

  // ── 셀 변경 시 _isDirty 플래그 부여 ──────────────────────────
  const handleCellValueChanged = useCallback((params: any) => {
    if (!params.data._isNew) {
      params.data._isDirty = true;
      params.data.EDIT_STS = "U";
    }
  }, []);

  // ── 추가 ─────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    model.setGridData((prev) => ({
      ...prev,
      rows: [
        {
          MSG_CD: "",
          LANG_GBN: "",
          MSG_DESC: "",
          APPLCODE: "",
          EDIT_STS: "I",
          _isNew: true,
        },
        ...prev.rows,
      ],
      totalCount: prev.totalCount + 1,
    }));
  }, [model]);

  // ── 복사: 선택 행을 신규 행으로 복제 ─────────────────────────
  const handleCopy = useCallback(() => {
    const selected = model.gridData.rows.filter((r: any) => r._selected);
    const sources = selected.length > 0 ? selected : model.gridData.rows;
    if (sources.length === 0) return;

    const clones = sources.map((r: any) => ({
      ...r,
      EDIT_STS: "I",
      _isNew: true,
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

  // ── 저장: _isNew / _isDirty 행만 서버로 ──────────────────────
  const handleSave = useCallback(() => {
    const saveRows = model.gridData.rows.filter(
      (r: any) => r._isNew || r._isDirty,
    );
    if (saveRows.length === 0) return;

    handleApi(langPackApi.saveLangPack(saveRows), "저장되었습니다.").then(
      () => {
        searchRef.current?.();
      },
    );
  }, [model.gridData.rows, handleApi, searchRef]);

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
    handleCellValueChanged,
    mainActions,
  };
}
