import { useCallback, useMemo, type MutableRefObject } from "react";
import type { TreeGridHandle } from "@/app/components/grid/TreeGrid";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import { useGridSave } from "@/app/components/grid/gridCommon";
import { newRid } from "@/app/feature/useBaseModel";
import { Lang } from "@/app/services/common/Lang";
import { uiResourceApi } from "./UiResourceApi";
import type { UiResourceModel, UiResourceRow } from "./UiResourceModel";
import UiResourceAddPopup, {
  type UiResourceAddFormData,
} from "./popup/UiResourceAddPopup";

type ControllerArgs = {
  model: UiResourceModel;
  treeGridRef: MutableRefObject<TreeGridHandle | null>;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
};

const CHILD_RESOURCE_TYPES: Record<string, string[]> = {
  "10": ["20"],
  "20": ["30", "40"],
  "30": ["40"],
  "40": [],
};

const RESOURCE_LABEL_KEYS: Record<string, string> = {
  "10": "LBL_MENU",
  "20": "LBL_GRID",
  "30": "LBL_FORM",
  "40": "LBL_BUTTON",
};

function buildSource(serverData: any[]): UiResourceRow[] {
  if (!Array.isArray(serverData)) return [];

  const rows: UiResourceRow[] = [];

  const visit = (node: any, parentId: string | null, level: number) => {
    const id = String(node.RSRC_ID ?? `${parentId ?? "root"}-${rows.length + 1}`);
    rows.push({
      ...node,
      id,
      parentId,
      level,
      RSRC_ID: String(node.RSRC_ID ?? ""),
      PRNT_RSRC_ID: String(node.PRNT_RSRC_ID ?? ""),
      RSRC_DESC: node.RSRC_DESC ?? "",
      MSG_DESC: node.MSG_DESC ?? "",
      RSRC_TP: node.RSRC_TP ?? "",
      CRE_USR_ID: node.CRE_USR_ID ?? "",
      CRE_DTTM: node.CRE_DTTM ?? "",
      LEAFYN: node.LEAFYN ?? ((node.data ?? []).length > 0 ? "N" : "Y"),
      __rid__: node.__rid__ ?? newRid(),
    });

    (node.data ?? []).forEach((child: any) => visit(child, id, level + 1));
  };

  serverData.forEach((root) => visit(root, null, 0));
  return rows;
}

function getChildTypeLabel(possibleTypes: string[]) {
  return possibleTypes.map((type) => Lang.get(RESOURCE_LABEL_KEYS[type] ?? type)).join(", ");
}

export function useUiResourceController({
  model,
  treeGridRef,
  searchRef,
}: ControllerArgs) {
  const { openPopup, closePopup } = usePopup();

  const openAlert = useCallback(
    (message: string, title = "") => {
      openPopup({
        width: "sm",
        content: (
          <ConfirmModal
            type="check"
            title={title}
            description={message}
            onClose={closePopup}
          />
        ),
      });
    },
    [closePopup, openPopup],
  );

  const fetchList = useCallback(
    (params: Record<string, unknown>) => uiResourceApi.getList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (result: any) => {
      const list = result?.rows ?? [];
      const treeData = Array.isArray(list?.data)
        ? list.data
        : Array.isArray(list)
          ? list
          : [];
      model.setSource(buildSource(treeData));
      requestAnimationFrame(() => {
        treeGridRef.current?.expandAll();
      });
    },
    [model, treeGridRef],
  );

  const handleRowClicked = useCallback(
    (row: UiResourceRow) => {
      model.setSelectedRow(row);
    },
    [model],
  );

  const syncLeafFlag = useCallback((rows: UiResourceRow[]) => {
    const parentIds = new Set(rows.map((row) => row.parentId).filter(Boolean) as string[]);
    return rows.map((row) => ({
      ...row,
      LEAFYN:
        row.RSRC_TP === "40" ? "Y" : parentIds.has(row.id) ? "N" : row.LEAFYN ?? "Y",
    }));
  }, []);

  const onCellValueChanged = useCallback(
    (params: any) => {
      if (params.colDef?.field !== "RSRC_TP") return;

      const nextType = String(params.newValue ?? "");
      model.setSource((prev) =>
        syncLeafFlag(
          prev.map((row) =>
            row.__rid__ === params.data.__rid__
              ? {
                  ...row,
                  RSRC_TP: nextType,
                  LEAFYN: nextType === "40" ? "Y" : "N",
                }
              : row,
          ),
        ),
      );
    },
    [model, syncLeafFlag],
  );

  const onAddResource = useCallback(() => {
    const selected = model.selectedRowRef.current;
    if (!selected) {
      openAlert(Lang.get("MSG_SELECT_UPR_RSRC"));
      return;
    }

    const parentCode = String(selected.RSRC_ID ?? "");
    const parentType = String(selected.RSRC_TP ?? "");

    if (selected.parentId == null || !parentCode || !parentType) {
      openAlert(Lang.get("MSG_SELECT_UPR_RSRC"));
      return;
    }

    if (parentType === "40") {
      openAlert(Lang.get("MSG_CHECK_BTN_TYPE_HAVING_SUB_RSRC"));
      return;
    }

    const allowedChildTypes = CHILD_RESOURCE_TYPES[parentType] ?? [];
    const defaultChildType = allowedChildTypes[0] ?? "";

    openPopup({
      title: "BTN_ADD",
      width: "md",
      content: (
        <UiResourceAddPopup
          parentRow={selected}
          resourceTypeMap={model.codeMap.resourceType ?? {}}
          allowedChildTypes={allowedChildTypes}
          defaultChildType={defaultChildType}
          onConfirm={(data: UiResourceAddFormData) => {
            const newId = data.RSRC_ID.trim();
            if (model.source.some((row) => String(row.RSRC_ID ?? "") === newId)) {
              openAlert(Lang.get("MSG_DUPLICATE_DATA"));
              return;
            }

            const childRow: UiResourceRow = {
              id: newId,
              parentId: selected.id,
              level: Number(selected.level ?? 0) + 1,
              RSRC_ID: newId,
              PRNT_RSRC_ID: parentCode,
              RSRC_DESC: data.RSRC_DESC,
              MSG_DESC: "",
              RSRC_TP: data.RSRC_TP,
              CRE_USR_ID: "",
              CRE_DTTM: "",
              LEAFYN: data.RSRC_TP === "40" ? "Y" : "N",
              EDIT_STS: "I",
              __rid__: newRid(),
            };

            model.setSource((prev) =>
              syncLeafFlag([
                ...prev.map((row): UiResourceRow =>
                  row.__rid__ === selected.__rid__
                    ? { ...row, LEAFYN: "N" }
                    : row,
                ),
                childRow,
              ]),
            );
            closePopup();
            treeGridRef.current?.expand(selected.id);
            model.setSelectedRow(childRow);
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [closePopup, model, openAlert, openPopup, syncLeafFlag, treeGridRef]);

  const validateBeforeSave = useCallback(() => {
    for (const row of model.source) {
      if (row.delStatus && String(row.RSRC_TP ?? "") === "10") {
        openAlert(Lang.get("MSG_CHECK_MENU_RSRC_NOT_DELETE"));
        return false;
      }

      const rowStatus = String(row.EDIT_STS ?? row.rowStatus ?? "");
      if (!rowStatus || rowStatus === "D" || rowStatus === "X") continue;

      const parent = model.source.find((item) => item.id === row.parentId);
      if (!parent) continue;

      const parentType = String(parent.RSRC_TP ?? "");
      const currentType = String(row.RSRC_TP ?? "");
      const allowed = CHILD_RESOURCE_TYPES[parentType] ?? [];

      if (!allowed.includes(currentType)) {
        if (parentType === "40") {
          openAlert(Lang.get("MSG_CHECK_BTN_TYPE_HAVING_SUB_RSRC"));
        } else {
          openAlert(
            Lang.get(
              "MSG_CHECK_RERC_TYPE_BY_SUPER_RSRC_TYPE",
              Lang.get(RESOURCE_LABEL_KEYS[parentType] ?? parentType),
              getChildTypeLabel(allowed),
            ),
          );
        }
        return false;
      }
    }

    return true;
  }, [model.source, openAlert]);

  const saveTree = useGridSave<UiResourceRow>({
    rows: model.source,
    setRows: model.setSource,
    saveFn: (payload) => uiResourceApi.save({ dsSave: payload.dsSave }),
    onSaved: () => {
      searchRef.current?.();
    },
    onEmpty: () => {
      openAlert(Lang.get("MSG_NO_CHANGED_DATA"));
    },
  });

  const handleSave = useCallback(async () => {
    if (!validateBeforeSave()) return;
    await saveTree();
  }, [saveTree, validateBeforeSave]);

  const mainActions = useMemo(
    () => [
      {
        type: "button" as const,
        key: "BTN_EXPAND_ALL",
        label: "BTN_EXPAND_ALL",
        onClick: () => treeGridRef.current?.expandAll(),
      },
      {
        type: "button" as const,
        key: "BTN_FOLD_ALL",
        label: "BTN_FOLD_ALL",
        onClick: () => treeGridRef.current?.collapseAll(),
      },
      makeAddAction({ onClick: onAddResource }),
      makeSaveAction({ onClick: handleSave }),
    ],
    [handleSave, onAddResource, treeGridRef],
  );

  return {
    fetchList,
    onSearchCallback,
    handleRowClicked,
    onCellValueChanged,
    mainActions,
    source: model.source,
  };
}
