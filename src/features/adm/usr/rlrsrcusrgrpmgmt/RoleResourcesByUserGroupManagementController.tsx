import { useCallback, useMemo, type MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { newRid } from "@/app/feature/useBaseModel";
import type { TreeGridHandle } from "@/app/components/grid/TreeGrid";
import {
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { dirtyRows, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import {
  AUTH_COLUMN_SPECS,
} from "./RoleResourcesByUserGroupManagementColumns";
import {
  roleResourcesByUserGroupManagementApi,
} from "./RoleResourcesByUserGroupManagementApi";
import type {
  RoleResourceTreeRow,
  RoleResourcesByUserGroupManagementModel,
} from "./RoleResourcesByUserGroupManagementModel";

interface Args {
  model: RoleResourcesByUserGroupManagementModel;
  treeGridRef: MutableRefObject<TreeGridHandle | null>;
}

const AUTH_COLUMNS = AUTH_COLUMN_SPECS.map((spec) => spec.field).join(",");

function flattenRoleTree(
  nodes: any[],
  parentId: string | null = null,
  level = 0,
): RoleResourceTreeRow[] {
  return (nodes ?? []).flatMap((node: any) => {
    const resourceId = String(
      node.RSRC_ID ?? `${parentId ?? "root"}-${Math.random()}`,
    );
    const id = parentId ? `${parentId}>${resourceId}` : resourceId;
    const current: RoleResourceTreeRow = {
      ...node,
      id,
      parentId,
      level,
      __rid__: newRid(),
      AUTH_TOTAL:
        node.AUTH_TOTAL === true || node.AUTH_TOTAL === "Y" ? "Y" : "N",
      DEL_AUTH_INFO:
        node.DEL_AUTH_INFO === true || node.DEL_AUTH_INFO === "Y" ? "Y" : "N",
      ...Object.fromEntries(
        AUTH_COLUMN_SPECS.map((spec) => [
          spec.field,
          node[spec.field] === true || node[spec.field] === "Y" ? "Y" : "N",
        ]),
      ),
    };

    return [
      current,
      ...flattenRoleTree(node.data ?? node.children ?? [], id, level + 1),
    ];
  });
}

export function useRoleResourcesByUserGroupManagementController({
  model,
  treeGridRef,
}: Args) {
  const base = useBaseController({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      roleResourcesByUserGroupManagementApi.getUserGroupList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      roleResourcesByUserGroupManagementApi.getUserGroupRoleList({
        USR_GRP_CD: row.USR_GRP_CD,
      }),
    [],
  );

  const loadRoleTree = useCallback(
    async (groupRow: any, roleRow: any) => {
      if (!groupRow || !roleRow) {
        model.setRoleTreeRows([]);
        return;
      }

      const res: any =
        await roleResourcesByUserGroupManagementApi.getRoleResourceTree({
          USR_GRP_CD: roleRow.USR_GRP_CD ?? groupRow.USR_GRP_CD,
          RL_CD: roleRow.RL_CD,
          AUTH_COLUMNS,
        });

      const treeRows = Array.isArray(res?.data?.data?.data)
        ? res.data.data.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.data?.dsOut)
            ? res.data.data.dsOut
            : Array.isArray(res?.data?.result)
              ? res.data.result
              : [];

      model.setRoleTreeRows(flattenRoleTree(treeRows));
    },
    [model],
  );

  const onSub01GridClick = useCallback(
    async (row: any) => {
      model.grids.sub01.setSelected(row);
      await loadRoleTree(model.grids.main.selectedRef.current, row);
    },
    [loadRoleTree, model],
  );

  const onMainGridClick = useCallback(
    async (row: any) => {
      const slot = model.grids.main;
      const hasDirty = (slot.ref.current?.rows ?? []).some((r: any) =>
        ["I", "U", "D"].includes(r.EDIT_STS),
      );
      if (hasDirty || slot.selectedRef.current === row) return;

      slot.setSelected(row);
      model.grids.sub01.setData({
        rows: [],
        totalCount: 0,
        page: 1,
        limit: model.pageSize,
      });
      model.grids.sub01.setSelected(null);
      model.setRoleTreeRows([]);

      if (!row) return;

      await base.searchSub("sub01", fetchSub01(row));
      const firstRole =
        model.grids.sub01.ref.current?.rows?.[0] ?? null;
      if (firstRole) {
        model.grids.sub01.setSelected(firstRole);
        await loadRoleTree(row, firstRole);
      }
    },
    [base, fetchSub01, loadRoleTree, model],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;

      if (firstMain) {
        await onMainGridClick(firstMain);
      } else {
        model.grids.main.setSelected(null);
        model.grids.sub01.setData({
          rows: [],
          totalCount: 0,
          page: 1,
          limit: model.pageSize,
        });
        model.grids.sub01.setSelected(null);
        model.setRoleTreeRows([]);
      }
    },
    [model, onMainGridClick],
  );

  const onSaveRoleTree = useCallback(async () => {
    const dirty = dirtyRows(model.roleTreeRows);
    if (dirty.length === 0) {
      base.alert("No changed data.");
      return;
    }

    const groupRow = model.grids.main.selectedRef.current;
    const roleRow = model.grids.sub01.selectedRef.current;
    if (!groupRow || !roleRow) {
      base.alert("Select a user group and role first.");
      return;
    }

    await base.callAjax(
      roleResourcesByUserGroupManagementApi.saveRoleResourceTree({
        dsSave: toDsSave(dirty),
        AUTH_COLUMNS,
      }),
    );
    await loadRoleTree(groupRow, roleRow);
  }, [base, loadRoleTree, model]);

  const onReloadCache = useCallback(async () => {
    await base.callAjax(
      roleResourcesByUserGroupManagementApi.reloadMenuCache(),
    );
  }, [base]);

  const treeActions = useMemo<ActionItem[]>(
    () => [
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
      makeSaveAction({ onClick: onSaveRoleTree }),
      {
        type: "button",
        key: "BTN_AUTH_RELOAD",
        label: "BTN_AUTH_RELOAD",
        onClick: () => {
          void onReloadCache();
        },
      },
    ],
    [onReloadCache, onSaveRoleTree, treeGridRef],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    treeActions,
  };
}
