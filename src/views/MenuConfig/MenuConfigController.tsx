// src/views/menu/MenuConfigController.tsx
import { useCallback, MutableRefObject } from "react";
import { type TreeGridHandle } from "@/app/components/grid/TreeGrid";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import { menuApi } from "@/app/services/menu/menuApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { MAIN_COLUMN_DEFS } from "./MenuConfigColumns";
import { MenuConfigModel } from "./MenuConfigModel";
import { buildSource } from "./MenuConfig";

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
  const { handleApi } = useApiHandler();

  // ── fetch ──────────────────────────────────────
  const fetchMenuConfigList = useCallback(
    (params: Record<string, unknown>) => menuApi.getMenuConfigList(params),
    [],
  );

  // ── ✅ 핵심 수정 ─────────────────────────────────
  const handleSearch = useCallback(
    (result: any) => {
      console.log("🔥 onSearch result:", result);

      const list = result?.rows ?? [];

      console.log("🔥 rows:", list);

      if (!Array.isArray(list)) {
        console.error("❌ rows is not array:", list);
        model.setSource([]);
        return;
      }

      const source = buildSource(list);

      console.log("🔥 source:", source);

      model.setSource(source);
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedRow(row);
    },
    [model],
  );

  const mainActions = [
    {
      type: "button" as const,
      key: "모두펼치기",
      label: "모두펼치기",
      onClick: () => {
        treeGridRef.current?.expandAll();
      },
    },
    {
      type: "button" as const,
      key: "모두접기",
      label: "모두접기",
      onClick: () => {
        treeGridRef.current?.collapseAll();
      },
    },
    {
      type: "group" as const,
      key: "엑셀",
      label: "엑셀",
      items: [
        {
          type: "button" as const,
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
          type: "button" as const,
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
    handleRowClicked,
    mainActions,
    source: model.source,
  };
}
