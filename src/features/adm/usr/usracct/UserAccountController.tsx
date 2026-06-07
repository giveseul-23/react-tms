import { useCallback, useMemo, type MutableRefObject } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { newRid } from "@/app/feature/useBaseModel";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { dirtyRows, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { userAccountApi } from "./UserAccountApi";
import {
  AUTH_COLUMN_SPECS,
  makeRoleTreeColumnDefs,
} from "./UserAccountColumns";
import type {
  GridKey,
  RoleTreeRow,
  UserAccountModel,
} from "./UserAccountModel";
import UserAccountPhoneNumberPopup from "./popup/UserAccountPhoneNumberPopup";

interface Args {
  model: UserAccountModel;
  activeTabRef: MutableRefObject<"USER_GROUP" | "ROLE">;
}

const AUTH_COLUMNS = AUTH_COLUMN_SPECS.map((spec) => spec.field).join(",");

function encodeBase64(value: string) {
  return btoa(value);
}

function normalizeDateValue(value: unknown) {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

function flattenRoleTree(
  nodes: any[],
  parentId: string | null = null,
  level = 0,
): RoleTreeRow[] {
  return (nodes ?? []).flatMap((node: any) => {
    const resourceId = String(node.RSRC_ID ?? `${parentId ?? "root"}-${Math.random()}`);
    const id = parentId ? `${parentId}>${resourceId}` : resourceId;
    const current: RoleTreeRow = {
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

export function useUserAccountController({ model, activeTabRef }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => userAccountApi.getList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      userAccountApi.getUserGroupList({
        USR_ID: row.USR_ID,
      }),
    [],
  );

  const loadRoleTree = useCallback(
    async (userRow: any, roleRow: any) => {
      if (!userRow || !roleRow) {
        model.setRoleTreeRows([]);
        return;
      }

      const res: any = await userAccountApi.getUserRoleTree({
        USR_ID: userRow.USR_ID,
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

  const loadRoleList = useCallback(
    async (userRow: any) => {
      if (!userRow) {
        model.grids.sub03.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
        model.grids.sub03.setSelected(null);
        model.setRoleTreeRows([]);
        return;
      }

      const res: any = await userAccountApi.getAllRoleList({});
      const rows = res?.data?.data?.dsOut ?? [];
      model.grids.sub03.setData({
        rows,
        totalCount: rows.length,
        page: 1,
        limit: model.pageSize,
      });

      const firstRole = model.grids.sub03.ref.current?.rows?.[0] ?? rows[0] ?? null;
      model.grids.sub03.setSelected(firstRole);
      if (firstRole) {
        await loadRoleTree(userRow, firstRole);
      } else {
        model.setRoleTreeRows([]);
      }
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
      model.grids.sub01.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.grids.sub03.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
      model.grids.sub03.setSelected(null);
      model.setRoleTreeRows([]);

      if (!row) return;

      await base.searchSub("sub01", fetchSub01(row));
      if (activeTabRef.current === "ROLE") {
        await loadRoleList(row);
      }
    },
    [activeTabRef, base, fetchSub01, loadRoleList, model],
  );

  const onRoleGridClick = useCallback(
    async (row: any) => {
      const userRow = model.grids.main.selectedRef.current;
      model.grids.sub03.setSelected(row);
      await loadRoleTree(userRow, row);
    },
    [loadRoleTree, model],
  );

  const onDetailTabChange = useCallback(
    async (key: "USER_GROUP" | "ROLE") => {
      activeTabRef.current = key;
      if (key !== "ROLE") return;

      const userRow = model.grids.main.selectedRef.current;
      if (!userRow) {
        model.grids.sub03.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
        model.grids.sub03.setSelected(null);
        model.setRoleTreeRows([]);
        return;
      }

      await loadRoleList(userRow);
    },
    [activeTabRef, loadRoleList, model],
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
        model.grids.sub01.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
        model.grids.sub03.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
        model.grids.sub03.setSelected(null);
        model.setRoleTreeRows([]);
      }
    },
    [model, onMainGridClick],
  );

  const validateMainBeforeSave = useCallback(() => {
    const dirty = dirtyRows(model.grids.main.ref.current?.rows ?? []);

    for (const row of dirty) {
      const start = normalizeDateValue(row.USE_STT_DT);
      const end = normalizeDateValue(row.USE_END_DT);
      if (start && end && start > end) {
        base.alert("Valid start date cannot be later than valid end date.");
        return false;
      }

      const pw = String(row.PW ?? "");
      if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(pw)) {
        base.alert("Password cannot contain Korean characters.");
        return false;
      }
    }

    dirty.forEach((row) => {
      const pw = String(row.PW ?? "");
      if (pw && pw !== "********") {
        row.PW = encodeBase64(pw);
      }
    });

    return true;
  }, [base, model]);

  const onAddMain = useCallback(() => {
    model.grids.sub01.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
    model.grids.sub03.setData({ rows: [], totalCount: 0, page: 1, limit: 20 });
    model.grids.sub03.setSelected(null);
    model.setRoleTreeRows([]);

    base.addRow("main", {
      USR_ID: "",
      USR_NM: "",
      PW: "",
      USR_THEME: "DEFAULT",
      PW_ERR_CNT: 0,
      USE_YN: "Y",
      USE_STT_DT: "",
      USE_END_DT: "",
      VLD_CHK: "Y",
      USER_TZ: "Asia/Seoul",
      DAY_TP: "SUN",
      DT_FRMT_TP: "Y/M/D",
      TM_FRMT_TP: "24HMS",
      MAX_TAB_CNT: 20,
      LCL_CD: "KR",
      SSO_YN: "N",
      CUST_CD: "COMMON",
      CUST_GRP_CD: "COMMON"
    });
  }, [base, model]);

  const onAddSub01 = useCallback(() => {
    const userRow = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(userRow, "User")) return;

    openPopup({
      title: "MENU_USER_GROUP",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="SELECT_USER_GROUP_ALL"
          onApply={(row: any) => {
            closePopup();
            if (!row) return;
            base.addRow("sub01", {
              USR_ID: userRow.USR_ID,
              USR_GRP_CD: row.USR_GRP_CD ?? row.CODE,
              USR_GRP_NM: row.USR_GRP_NM ?? row.NAME,
              USE_STT_DT: row.USE_STT_DT ?? userRow.USE_STT_DT,
              USE_END_DT: row.USE_END_DT ?? userRow.USE_END_DT,
            });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model, openPopup]);

  const onChangePhone = useCallback(() => {
    const userRow = model.grids.main.selectedRef.current;
    if (!userRow) {
      base.alert("Select a user first.");
      return;
    }

    openPopup({
      title: "BTN_TEL_CHG",
      width: "lg",
      content: (
        <UserAccountPhoneNumberPopup
          initialValue={String(userRow.MBL_PHN_NO ?? "")}
          onClose={closePopup}
          onConfirm={(value) => {
            void base
              .callAjax(
                userAccountApi.saveUserPhoneNumber({
                  USR_ID: userRow.USR_ID,
                  MBL_PHN_NO: value,
                  MBL_PHN_NO_OLD: userRow.MBL_PHN_NO,
                }),
              )
              .then(() => {
                closePopup();
                base.search();
              });
          }}
        />
      ),
    });
  }, [base, closePopup, model, openPopup]);

  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", userAccountApi.save, {
        beforeSave: validateMainBeforeSave,
      }),
    [base, validateMainBeforeSave],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", userAccountApi.saveUserGroupRole, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub01,
        },
      }),
    [base, fetchSub01],
  );

  const onSaveRoleTree = useCallback(async () => {
    const dirty = dirtyRows(model.roleTreeRows);
    if (dirty.length === 0) {
      base.alert("No changed data.");
      return;
    }

    const userRow = model.grids.main.selectedRef.current;
    const roleRow = model.grids.sub03.selectedRef.current;
    if (!userRow || !roleRow) {
      base.alert("Select a user and role first.");
      return;
    }

    await base.callAjax(
      userAccountApi.saveUserRole({
        dsSave: toDsSave(dirty),
        AUTH_COLUMNS,
      }),
    );
    await loadRoleTree(userRow, roleRow);
  }, [base, loadRoleTree, model]);

  const onRemoveAllRoles = useCallback(async () => {
    const userRow = model.grids.main.selectedRef.current;
    const roleRow = model.grids.sub03.selectedRef.current;
    if (!userRow) {
      base.alert("Select a user first.");
      return;
    }

    await base.callAjax(
      userAccountApi.removeAllRoles({
        USR_ID: userRow.USR_ID,
      }),
    );

    if (roleRow) {
      await loadRoleTree(userRow, roleRow);
    }
  }, [base, loadRoleTree, model]);

  const onImportAllGroupRoles = useCallback(async () => {
    const userRow = model.grids.main.selectedRef.current;
    const roleRow = model.grids.sub03.selectedRef.current;
    if (!userRow) {
      base.alert("Select a user first.");
      return;
    }

    await base.callAjax(
      userAccountApi.importAllGroupRoles({
        USR_ID: userRow.USR_ID,
      }),
    );

    if (roleRow) {
      await loadRoleTree(userRow, roleRow);
    }
  }, [base, loadRoleTree, model]);

  const onReloadAuthCache = useCallback(async () => {
    await base.callAjax(userAccountApi.reloadMenuCache({}), "MSG_SAVE_CMPLT");
  }, [base]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "change-phone",
        label: "BTN_TEL_CHG",
        onClick: onChangePhone,
      },
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
    ],
    [onAddMain, onChangePhone, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub01 }),
      makeSaveAction({ onClick: onSaveSub01 }),
    ],
    [onAddSub01, onSaveSub01],
  );

  const roleTreeActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "import-role",
        label: "BTN_IMPORT_ROLE",
        onClick: onImportAllGroupRoles,
      },
      {
        type: "button",
        key: "reset-role",
        label: "BTN_RESET_ROLE",
        onClick: onRemoveAllRoles,
      },
      makeSaveAction({ onClick: onSaveRoleTree }),
      {
        type: "button",
        key: "auth-reload",
        label: "BTN_AUTH_RELOAD",
        onClick: onReloadAuthCache,
      },
    ],
    [onImportAllGroupRoles, onReloadAuthCache, onRemoveAllRoles, onSaveRoleTree],
  );

  const selectedRoleType = model.grids.sub03.selectedRef.current?.RL_TP_CD ?? null;
  const roleTreeColumnDefs = useMemo(
    () => makeRoleTreeColumnDefs(selectedRoleType),
    [selectedRoleType],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRoleGridClick,
    onDetailTabChange,
    mainActions,
    sub01Actions,
    roleTreeActions,
    roleTreeColumnDefs,
  };
}
