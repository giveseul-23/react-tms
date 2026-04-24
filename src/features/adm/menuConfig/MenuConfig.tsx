// src/views/MenuConfig/MenuConfig.tsx
"use client";

import { useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import TreeGrid, {
  type TreeRow,
  type TreeGridHandle,
  type TreeCellContext,
} from "@/app/components/grid/TreeGrid";
import TreeNameCell from "@/app/components/grid/TreeNameCell";

import { useMenuConfigModel } from "./MenuConfigModel";
import { useMenuConfigController } from "./MenuConfigController";
import { MAIN_COLUMN_DEFS } from "./MenuConfigColumns";

export const MENU_CD = "MENU_CFG_CNFG";

// ─── 타입 ─────────────────────────────────────────────────────────────────────
export type MenuRow = TreeRow & {
  MENUCODE: string;
  MSG_CD: string;
  MENUNAME: string;
  MSG_DESC: string;
  APPLCODE: string;
  APPLNAME: string;
  PARANT_MENU_CD: string;
  LEAFYN: "Y" | "N";
  SUPERMENUCODE: string;
  DSPLY_SEQ: number | string;
  URL: string;
  USE_YN: "Y" | "N";
  RSRC_CNT: number | string;
  isVirtualRoot?: boolean;
};

// ─── 서버 중첩 구조 → flat TreeRow 변환 ──────────────────────────────────────
export function buildSource(serverData: any[]): MenuRow[] {
  if (!Array.isArray(serverData)) {
    console.error("serverData is not array:", serverData);
    return [];
  }

  const result: MenuRow[] = [];

  function visit(node: any, parentId: string | null, level: number) {
    const isVirtualRoot = node.MENUCODE === "-1";
    const id = isVirtualRoot ? `__ROOT__${node.APPLCODE}` : node.MENUCODE;

    result.push({
      id,
      parentId,
      level,
      MENUCODE: node.MENUCODE ?? "",
      MSG_CD: node.MSG_CD ?? "",
      MENUNAME: node.MENUNAME ?? "",
      MSG_DESC: node.MSG_DESC ?? "",
      APPLCODE: node.APPLCODE ?? "",
      APPLNAME: node.APPLNAME ?? "",
      PARANT_MENU_CD: node.PARANT_MENU_CD ?? "",
      LEAFYN: node.LEAFYN ?? "N",
      SUPERMENUCODE: node.SUPERMENUCODE ?? "",
      DSPLY_SEQ: node.DSPLY_SEQ ?? 0,
      URL: node.URL ?? "",
      USE_YN: node.USE_YN ?? "Y",
      RSRC_CNT: node.RSRC_CNT ?? "",
      isVirtualRoot,
    });

    (node.data ?? []).forEach((child: any) => visit(child, id, level + 1));
  }

  serverData.forEach((rootNode) => visit(rootNode, null, 0));
  return result;
}

export default function MenuConfig() {
  const filtersRef = useRef<Record<string, unknown>>({});
  const treeGridRef = useRef<TreeGridHandle>(null);

  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useMenuConfigModel();
  const ctrl = useMenuConfigController({ model, treeGridRef, filtersRef });

  const renderNameCell = (params: any, ctx: TreeCellContext) => {
    const row: MenuRow = params.data;
    return (
      <TreeNameCell
        id={row.id}
        level={row.level}
        label={row.isVirtualRoot ? row.MSG_DESC : row.MSG_DESC || row.MENUNAME}
        hasChild={row.LEAFYN === "N"}
        icon={row.isVirtualRoot ? "🗂️" : undefined}
        ctx={ctx}
      />
    );
  };

  if (loading) return <Skeleton className="h-24" />;

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchMenuConfigList,
        onSearch: ctrl.handleSearch,
        filtersRef,
        treeGridRef,
        computeTotalCount: (rows) => {
          // data 배열이 있는 실제 leaf 노드 수 합산
          function countLeafs(nodes: any[]): number {
            return nodes.reduce((acc, node) => {
              const children = node.data ?? [];
              return children.length > 0 ? acc + countLeafs(children) : acc + 1;
            }, 0);
          }

          return rows.data.reduce((acc: number, node: any) => {
            const children = node.data ?? [];
            return children.length > 0 ? acc + countLeafs(children) : acc + 1;
          }, 0);
        },
        menuCode: MENU_CD,
      }}
      grid={
        <TreeGrid<MenuRow>
          ref={treeGridRef}
          source={ctrl.source}
          renderNameCell={renderNameCell}
          columnDefs={MAIN_COLUMN_DEFS()}
          nameColumnHeader=""
          nameColumnWidth={160}
          sortField="DSPLY_SEQ"
          defaultExpandLevel={1}
          getRowId={(p) => p.data.id}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
        />
      }
    />
  );
}
