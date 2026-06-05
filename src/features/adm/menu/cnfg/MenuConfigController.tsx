// src/views/MenuConfig/MenuConfigController.tsx
import { useCallback, MutableRefObject } from "react";
import { type TreeGridHandle } from "@/app/components/grid/TreeGrid";
import { menuApi } from "@/features/adm/menu/cnfg/menuApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import { MAIN_COLUMN_DEFS } from "./MenuConfigColumns";
import { MenuConfigModel } from "./MenuConfigModel";
import { buildSource, MENU_CD } from "./MenuConfig";
import MenuFolderAddPopup, {
  type FolderFormData,
} from "./popup/MenuFolderAddPopup";
import MenuItemAddPopup, {
  type MenuItemFormData,
} from "./popup/MenuItemAddPopup";
import type { MenuRow } from "./MenuConfig";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import {
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { Lang } from "@/app/services/common/Lang";
import {
  makeInsertPersonColumn,
  makeInsertDateColumn,
  makeUpdatePersonColumn,
  makeUpdateTimeColumn,
} from "@/app/components/grid/columns/commonColumns";

// 엑셀 다운로드 전용 컬럼 — 화면 트리 이름 컬럼(MSG_DESC)과 audit 컬럼은
// 그리드가 따로 그려서 MAIN_COLUMN_DEFS 에 없으므로 엑셀에만 별도로 합쳐준다.
const EXCEL_COLUMN_DEFS = [
  // 트리 이름 컬럼 — grid colId 는 "id"(매칭용), export 데이터는 MSG_DESC.
  {
    colId: "id",
    type: "text",
    headerName: "LBL_MENU_NM",
    field: "MSG_DESC",
    width: 160,
  },
  ...MAIN_COLUMN_DEFS,
  makeInsertPersonColumn(),
  makeInsertDateColumn(),
  makeUpdatePersonColumn(),
  makeUpdateTimeColumn(),
];

type ControllerProps = {
  model: MenuConfigModel;
  treeGridRef: MutableRefObject<TreeGridHandle | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
};

export function useMenuConfigController({
  model,
  treeGridRef,
  filtersRef,
  searchRef,
}: ControllerProps) {
  const { openPopup, closePopup } = usePopup();

  const fetchMenuConfigList = useCallback(
    (params: Record<string, unknown>) => menuApi.getMenuConfigList(params),
    [],
  );

  // useGridSave 가 전달하는 payload({ dsSave, rows }) 중 dsSave 만 사용 — rows 는 무시
  const saveMenuConfig = useCallback(
    (payload: any) => menuApi.saveMenuConfig({ dsSave: payload.dsSave }),
    [],
  );

  const onSearchCallback = useCallback(
    (result: any) => {
      const list = result?.rows ?? [];
      if (!Array.isArray(list.data)) {
        model.setSource([]);
        return;
      }
      model.setSource(buildSource(list.data));
    },
    [model],
  );

  // ── 저장 (EDIT_STS 마킹 행 → dsSave List<row> 변환 → 저장 → EDIT_STS 정리) ──
  // 기본 동작은 hook 내부. 추가 파라미터/검증 등이 필요하면 handleSave 를 감싸서 사용.
  const handleSave = useGridSave<MenuRow>({
    rows: model.source,
    setRows: model.setSource,
    saveFn: saveMenuConfig,
    onSaved: () => searchRef.current?.(),
  });

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedRow(row);
    },
    [model],
  );

  // 주어진 id 부터 위로 올라가며 ancestor 체인을 expand — 그 한 줄기만 펼침.
  const expandAncestors = useCallback(
    (startId: string | null | undefined) => {
      if (!startId) return;
      let cur: string | null | undefined = startId;
      const seen = new Set<string>();
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        treeGridRef.current?.expand(cur);
        cur = model.source.find((r) => r.id === cur)?.parentId ?? null;
      }
    },
    [model.source, treeGridRef],
  );

  const getApplOptions = useCallback(() => {
    return model.source
      .filter((r) => r.isVirtualRoot)
      .map((r) => ({ CODE: r.APPLCODE, NAME: r.APPLNAME || r.APPLCODE }));
  }, [model.source]);

  // 새 행 id / parentId 사전 검증 — 통과 시 true, 실패 시 alert 표시 후 false.
  // self-cycle(id === parentId) 또는 중복 id 가 들어가면 TreeGrid 의
  // calcVisibleRows 가 무한 재귀에 빠지거나 AG-Grid getRowId 충돌이 나므로 차단.
  const validateNewRowKeys = useCallback(
    (newId: string, parentId: string): boolean => {
      const showAlert = (description: string) =>
        openPopup({
          title: "",
          width: "sm",
          content: (
            <ConfirmModal
              type="check"
              description={description}
              onClose={closePopup}
            />
          ),
        });

      if (newId === parentId) {
        showAlert(Lang.get("MSG_MENU_CD_SAME_AS_PARENT"));
        return false;
      }
      if (model.source.some((r) => r.id === newId)) {
        showAlert("이미 존재하는 메뉴코드입니다.");
        return false;
      }
      return true;
    },
    [model.source, openPopup, closePopup],
  );

  // 팝업 폼 데이터 → TreeRow 변환 공통 헬퍼
  const toNewRow = useCallback(
    (
      data: FolderFormData | MenuItemFormData,
      applOptions: { CODE: string; NAME: string }[],
    ): MenuRow => {
      const parentId =
        data.PARANT_MENU_CD === "-1"
          ? `__ROOT__${data.APPLCODE}`
          : data.PARANT_MENU_CD;

      const parentLevel =
        model.source.find((r) => r.id === parentId)?.level ?? 0;

      return {
        id: data.MENUCODE,
        parentId,
        level: parentLevel + 1,
        MENUCODE: data.MENUCODE,
        MSG_CD: data.MSG_CD,
        MENUNAME: "MENUNAME" in data ? data.MENUNAME : "",
        MSG_DESC: data.MSG_DESC,
        APPLCODE: data.APPLCODE,
        APPLNAME:
          applOptions.find((o) => o.CODE === data.APPLCODE)?.NAME ??
          data.APPLCODE,
        PARANT_MENU_CD: data.PARANT_MENU_CD,
        LEAFYN: data.LEAFYN,
        SUPERMENUCODE: data.SUPERMENUCODE,
        DSPLY_SEQ: data.DSPLY_SEQ,
        URL: "URL" in data ? data.URL : "",
        USE_YN: data.USE_YN,
        RSRC_CNT: 0,
        isVirtualRoot: false,
        EDIT_STS: "I", // 저장 버튼 클릭 시 신규 식별용
      } as MenuRow & { EDIT_STS: string };
    },
    [model.source],
  );

  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "BTN_EXPAND_ALL",
      label: "BTN_EXPAND_ALL",
      onClick: () => treeGridRef.current?.expandAll(),
    },
    {
      type: "button",
      key: "BTN_FOLD_ALL",
      label: "BTN_FOLD_ALL",
      onClick: () => treeGridRef.current?.collapseAll(),
    },

    // ── 메뉴경로 추가 (폴더, LEAFYN=N) ──────────────────────────
    {
      type: "button",
      key: "BTN_ADD_MENU_PATH",
      label: "BTN_ADD_MENU_PATH",
      onClick: () => {
        // 행 미선택 시 차단
        if (!model.selectedRowRef.current) {
          openPopup({
            title: "",
            width: "sm",
            content: (
              <ConfirmModal
                type="check"
                title="행을 선택하세요"
                description={Lang.get("MSG_SELECT_UPR_MENU_CD")}
                onClose={closePopup}
              />
            ),
          });
          return;
        }
        const applOptions = getApplOptions();
        openPopup({
          title: "BTN_ADD_MENU_PATH",
          width: "md",
          content: (
            <MenuFolderAddPopup
              selectedRow={model.selectedRowRef.current}
              applOptions={applOptions}
              onConfirm={(data: FolderFormData) => {
                closePopup();
                // 서버 호출 없이 source 에 바로 추가 → 그리드에 즉시 반영
                const newRow = toNewRow(data, applOptions);
                if (!validateNewRowKeys(newRow.id, newRow.parentId ?? "")) {
                  return;
                }
                model.setSource((prev: MenuRow[]) => [...prev, newRow]);
                // 부모 → 가상루트까지 ancestor 체인만 expand
                // (전체 접힌 상태에서 추가해도 그 한 줄기만 펼쳐 새 row 노출)
                expandAncestors(newRow.parentId);
              }}
              onClose={closePopup}
            />
          ),
        });
      },
    },

    // ── 메뉴 추가 (화면, LEAFYN=Y) ──────────────────────────────
    {
      type: "button",
      key: "BTN_ADD_MENU",
      label: "BTN_ADD_MENU",
      onClick: () => {
        // 행 미선택 시 차단
        if (!model.selectedRowRef.current) {
          openPopup({
            title: "",
            width: "sm",
            content: (
              <ConfirmModal
                type="check"
                description={Lang.get("MSG_SELECT_UPR_MENU_CD")}
                onClose={closePopup}
              />
            ),
          });
          return;
        }
        const applOptions = getApplOptions();
        openPopup({
          title: "BTN_ADD_MENU",
          width: "md",
          content: (
            <MenuItemAddPopup
              selectedRow={model.selectedRowRef.current}
              applOptions={applOptions}
              onConfirm={(data: MenuItemFormData) => {
                closePopup();
                // 서버 호출 없이 source 에 바로 추가 → 그리드에 즉시 반영
                const newRow = toNewRow(data, applOptions);
                if (!validateNewRowKeys(newRow.id, newRow.parentId ?? "")) {
                  return;
                }
                model.setSource((prev: MenuRow[]) => [...prev, newRow]);
                // 부모 → 가상루트까지 ancestor 체인만 expand
                expandAncestors(newRow.parentId);
              }}
              onClose={closePopup}
            />
          ),
        });
      },
    },

    // ── 저장 (EDIT_STS 기준으로 dsSave 자동 그룹핑 후 서버로) ────
    makeSaveAction({ onClick: handleSave }),

    // ── 엑셀 ────────────────────────────────────────────────────
    makeExcelGroupAction({
      hideAll: true,
      columns: EXCEL_COLUMN_DEFS,
      menuCode: MENU_CD,
      fetchFn: () => menuApi.getMenuConfigList(filtersRef.current),
      rows: model.source,
      getVisibleColIds: () => treeGridRef.current?.getVisibleColIds() ?? null,
    }),
  ];

  return {
    fetchMenuConfigList,
    onSearchCallback,
    handleSave,
    handleRowClicked,
    mainActions,
    source: model.source,
  };
}
