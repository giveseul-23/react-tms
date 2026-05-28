"use client";

import { useMemo, useRef } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { GridOnlyPage } from "@/app/components/layout/presets/GridOnlyPage";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { Lang } from "@/app/services/common/Lang";
import TreeGrid, {
  type TreeGridHandle,
  type TreeCellContext,
} from "@/app/components/grid/TreeGrid";
import TreeNameCell from "@/app/components/grid/TreeGrid/TreeNameCell";
import { useUiResourceModel, type UiResourceRow } from "./UiResourceModel";
import { useUiResourceController } from "./UiResourceController";
import { MAIN_COLUMN_DEFS } from "./UiResourceColumns";
import { MENU_CD } from "./UiResourceApi";

export default function UiResource() {
  const filtersRef = useRef<Record<string, unknown>>({});
  const searchRef = useRef<((page?: number) => void) | null>(null);
  const treeGridRef = useRef<TreeGridHandle>(null);

  const { meta, loading } = useSearchMeta(MENU_CD);
  const model = useUiResourceModel();
  const ctrl = useUiResourceController({ model, treeGridRef, searchRef });

  const columnDefs = useMemo(
    () => MAIN_COLUMN_DEFS(model.setSource, model.codeMap.resourceType ?? {}),
    [model.codeMap.resourceType, model.setSource],
  );

  const renderNameCell = (params: any, ctx: TreeCellContext) => {
    const row: UiResourceRow = params.data;
    const hasChild =
      row.LEAFYN === "N" ||
      model.source.some((item) => item.parentId === row.id);

    return (
      <TreeNameCell
        id={row.id}
        level={row.level}
        label={row.RSRC_ID}
        hasChild={hasChild}
        ctx={ctx}
      />
    );
  };

  if (loading) return <Skeleton className="h-24" />;

  return (
    <GridOnlyPage
      searchProps={{
        meta,
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        filtersRef,
        searchRef,
        treeGridRef,
        menuCode: MENU_CD,
        computeTotalCount: (rows) => {
          const data = rows?.data;
          if (!Array.isArray(data)) return 0;

          const countLeafs = (nodes: any[]): number =>
            nodes.reduce((acc, node) => {
              const children = node.data ?? [];
              return children.length > 0 ? acc + countLeafs(children) : acc + 1;
            }, 0);

          return countLeafs(data);
        },
      }}
      grid={
        <TreeGrid<UiResourceRow>
          ref={treeGridRef}
          source={ctrl.source}
          renderNameCell={renderNameCell}
          columnDefs={columnDefs}
          nameColumnHeader={Lang.get("LBL_RSRC_ID")}
          nameColumnWidth={300}
          defaultExpandLevel={-1}
          getRowId={(p) => String(p.data.id)}
          headerCheckbox={false}
          actions={ctrl.mainActions}
          onRowClicked={ctrl.handleRowClicked}
          onCellValueChanged={ctrl.onCellValueChanged}
        />
      }
    />
  );
}
