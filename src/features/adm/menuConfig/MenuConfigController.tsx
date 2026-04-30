// src/views/MenuConfig/MenuConfigController.tsx
import { useCallback, MutableRefObject } from "react";
import { type TreeGridHandle } from "@/app/components/grid/TreeGrid";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { menuApi } from "@/features/adm/menuConfig/menuApi";
import { usePopup } from "@/app/components/popup/PopupContext";
import { MAIN_COLUMN_DEFS } from "./MenuConfigColumns";
import { MenuConfigModel } from "./MenuConfigModel";
import { buildSource } from "./MenuConfig";
import MenuFolderAddPopup, {
  type FolderFormData,
} from "./popup/MenuFolderAddPopup";
import MenuItemAddPopup, {
  type MenuItemFormData,
} from "./popup/MenuItemAddPopup";
import type { MenuRow } from "./MenuConfig";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import { makeSaveAction } from "@/app/components/grid/commonActions";
import { useGridSave } from "@/app/components/grid/gridCommon";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: MenuConfigModel;
  treeGridRef: MutableRefObject<TreeGridHandle | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useMenuConfigController({
  model,
  treeGridRef,
  filtersRef,
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

  const handleSearch = useCallback(
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
                description="메뉴경로를 추가할 상위 항목을 먼저 선택해주세요."
                onClose={closePopup}
              />
            ),
          });
          return;
        }
        const applOptions = getApplOptions();
        openPopup({
          title: "메뉴경로 추가 (폴더)",
          width: "md",
          content: (
            <MenuFolderAddPopup
              selectedRow={model.selectedRowRef.current}
              applOptions={applOptions}
              onConfirm={(data: FolderFormData) => {
                closePopup();
                // 서버 호출 없이 source 에 바로 추가 → 그리드에 즉시 반영
                const newRow = toNewRow(data, applOptions);
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
                title="행을 선택하세요"
                description="메뉴를 추가할 상위 항목을 먼저 선택해주세요."
                onClose={closePopup}
              />
            ),
          });
          return;
        }
        const applOptions = getApplOptions();
        openPopup({
          title: "메뉴 추가 (화면)",
          width: "md",
          content: (
            <MenuItemAddPopup
              selectedRow={model.selectedRowRef.current}
              applOptions={applOptions}
              onConfirm={(data: MenuItemFormData) => {
                closePopup();
                // 서버 호출 없이 source 에 바로 추가 → 그리드에 즉시 반영
                const newRow = toNewRow(data, applOptions);
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
    {
      type: "group",
      key: "BTN_EXCEL",
      label: "BTN_EXCEL",
      items: [
        {
          type: "button",
          key: "조회된모든데이터다운로드",
          label: "조회된모든데이터다운로드",
          onClick: () => {
            downExcelSearch({
              columns: MAIN_COLUMN_DEFS(),
              menuName: "메뉴설정",
              fetchFn: () => menuApi.getMenuConfigList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS(),
              rows: model.source,
            });
          },
        },
      ],
    },
  ];

  return {
    fetchMenuConfigList,
    handleSearch,
    handleSave,
    handleRowClicked,
    mainActions,
    source: model.source,
  };
}
