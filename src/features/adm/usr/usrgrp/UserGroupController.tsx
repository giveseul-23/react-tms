import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { newRid } from "@/app/feature/useBaseModel";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import {
  makeAddAction,
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { userGroupApi } from "./UserGroupApi";
import type { GridKey, UserGroupModel } from "./UserGroupModel";
import UserAccountSelectPopup from "./popup/UserGroupUserAccountPopup";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

const MENU_CD = "MENU_USER_GROUP";

interface Args {
  model: UserGroupModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

export function useUserGroupController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => userGroupApi.getList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      userGroupApi.getGroupApplicationList({
        USR_GRP_CD: row.USR_GRP_CD,
      }),
    [],
  );

  const fetchSub02 = useCallback(
    (row: any) =>
      userGroupApi.getUserAccountList({
        USR_GRP_CD: row.USR_GRP_CD,
      }),
    [],
  );

  const fetchSub03 = useCallback(
    (row: any) =>
      userGroupApi.getUserGroupRoleList({
        USR_GRP_CD: row.USR_GRP_CD,
      }),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
        { to: "sub02", fetch: fetchSub02 },
        { to: "sub03", fetch: fetchSub03 },
      ]),
    [base, fetchSub01, fetchSub02, fetchSub03],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain =
        model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;

      if (firstMain) {
        onMainGridClick(firstMain);
      } else {
        base.resetGrids(["sub01", "sub02", "sub03"]);
      }
    },
    [base, model.grids.main, onMainGridClick],
  );

  const onAddMain = useCallback(() => {
    base.resetGrids(["sub01", "sub02", "sub03"]);
    base.addRow("main", {
      USR_GRP_CD: "",
      USR_GRP_NM: "",
      EXT_CONN_YN: "Y",
    });
  }, [base]);

  const onAddSub01 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "User group")) return;

    openPopup({
      title: "LBL_APPLICATION",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="SELECT_APPLICATION_CODE_NAME"
          rowSelection="multiple"
          onApply={(callbackRows: any) => {
            closePopup();
            if (!callbackRows) return;
            base.addRow(
              "sub01",
              callbackRows.map((element: any) => ({
                USR_GRP_CD: main.USR_GRP_CD,
                APPL_CD: element.CODE,
                APPL_NM: element.NAME,
              })),
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, openPopup]);

  const onAddSub02 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "User group")) return;

    openPopup({
      title: "LBL_SELECT_USER",
      width: "3xl",
      content: (
        <UserAccountSelectPopup
          onApply={(rows) => {
            if (!rows.length) return;
            model.grids.sub02.setData((prev) => ({
              ...prev,
              rows: [
                ...(prev?.rows ?? []),
                ...rows.map((row) => ({
                  USR_ID: row.USR_ID,
                  USR_NM: row.USR_NM,
                  TEL_NO: row.TEL_NO,
                  MBL_PHN_NO: row.MBL_PHN_NO,
                  EMAIL_ADDR: row.EMAIL_ADDR,
                  USE_STT_DT: row.USE_STT_DT,
                  USE_END_DT: row.USE_END_DT,
                  USR_GRP_CD: main.USR_GRP_CD,
                  EDIT_STS: "I",
                  __rid__: newRid(),
                })),
              ],
            }));
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, model.grids.sub02, openPopup]);

  const onAddSub03 = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, "User group")) return;

    openPopup({
      title: "LBL_ROLE_MGMT",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectRoleName"
          onApply={(row: any) => {
            closePopup();
            if (!row) return;
            base.addRow("sub03", {
              USR_GRP_CD: main.USR_GRP_CD,
              RL_CD: row.CODE,
              RL_NM: row.NAME,
            });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, openPopup]);

  const onSaveMain = useCallback(
    () => base.saveGrid("main", userGroupApi.save),
    [base],
  );

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", userGroupApi.saveGroupApplication, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub01,
        },
      }),
    [base, fetchSub01],
  );

  const onSaveSub02 = useCallback(
    () =>
      base.saveGrid("sub02", userGroupApi.saveUserAccount, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub02,
        },
      }),
    [base, fetchSub02],
  );

  const onSaveSub03 = useCallback(
    () =>
      base.saveGrid("sub03", userGroupApi.saveUserGroupRole, {
        afterSave: {
          cascadeFrom: "main",
          fetch: fetchSub03,
        },
      }),
    [base, fetchSub03],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CD,
        menuName: menuName,
        fetchFn: () => userGroupApi.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [model.filtersRef, model.grids.main.rows, onAddMain, onSaveMain],
  );

  const subActions = useMemo(
    () => ({
      sub01: [
        makeAddAction({ onClick: onAddSub01 }),
        makeSaveAction({ onClick: onSaveSub01 }),
        makeExcelGroupAction({
          excelColumns: () => model.grids.sub01.getExcelColumns(),
          menuCode: MENU_CD,
          menuName: menuName,
          fetchFn: () => {
            const main = model.grids.main.selectedRef.current;
            return main ? fetchSub01(main) : EMPTY_RESULT;
          },
          rows: model.grids.sub01.rows,
        }),
      ],
      sub02: [
        makeAddAction({ onClick: onAddSub02 }),
        makeSaveAction({ onClick: onSaveSub02 }),
        makeExcelGroupAction({
          excelColumns: () => model.grids.sub02.getExcelColumns(),
          menuCode: MENU_CD,
          menuName: menuName,
          fetchFn: () => {
            const main = model.grids.main.selectedRef.current;
            return main ? fetchSub02(main) : EMPTY_RESULT;
          },
          rows: model.grids.sub02.rows,
        }),
      ],
      sub03: [
        makeAddAction({ onClick: onAddSub03 }),
        makeSaveAction({ onClick: onSaveSub03 }),
        makeExcelGroupAction({
          excelColumns: () => model.grids.sub03.getExcelColumns(),
          menuCode: MENU_CD,
          menuName: menuName,
          fetchFn: () => {
            const main = model.grids.main.selectedRef.current;
            return main ? fetchSub03(main) : EMPTY_RESULT;
          },
          rows: model.grids.sub03.rows,
        }),
      ],
    }),
    [
      fetchSub01,
      fetchSub02,
      fetchSub03,
      model.grids.main,
      model.grids.sub01.rows,
      model.grids.sub02.rows,
      model.grids.sub03.rows,
      onAddSub01,
      onAddSub02,
      onAddSub03,
      onSaveSub01,
      onSaveSub02,
      onSaveSub03,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    subActions,
  };
}
