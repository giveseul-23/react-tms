import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { vltnNtfctnCnfgApi as api } from "./VltnNtfctnCnfgApi";
import { MENU_CODE } from "./VltnNtfctnCnfg";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VltnNtfctnCnfgModel, GridKey } from "./VltnNtfctnCnfgModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import VltnRgstrPop from "./popup/VltnRgstrPop";
import TmpltUpdPop from "./popup/TmpltUpdPop";
import UsrRegiPop from "./popup/UsrRegiPop";

interface Args {
  model: VltnNtfctnCnfgModel;
}

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");

export function useVltnNtfctnCnfgController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getVltnNtfctnCnfgList(params),
    [],
  );

  // sub01 클릭 → channel + target cascade
  const onDetailGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("detail", row, [
        {
          to: "channel",
          fetch: (r) =>
            api.getVltnNtfctnCnfgChannelList({
              VLTN_NTFCTN_CNFG_ID: r.VLTN_NTFCTN_CNFG_ID,
            }),
        },
        {
          to: "target",
          fetch: (r) =>
            api.getVltnNtfctnCnfgTargetList({
              VLTN_NTFCTN_CNFG_ID: r.VLTN_NTFCTN_CNFG_ID,
            }),
        },
      ]),
    [base],
  );

  // main 클릭 → detail fetch + channel/target reset
  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick(
        "main",
        row,
        [
          {
            to: "detail",
            fetch: (r) =>
              api.getVltnNtfctnCnfgDetailList({ LGST_GRP_CD: r.LGST_GRP_CD }),
          },
        ],
        { alsoReset: ["channel", "target"] },
      ),
    [base],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  const requireMain = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return null;
    }
    return main;
  }, [model.grids.main, base]);

  // ── 메인 복사 (선택 물류그룹들로 복제) ─────────────────────
  const onCopyAll = useCallback(() => {
    const main = requireMain();
    if (!main) return;
    openPopup({
      title: "LBL_COPY",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLogisticsgroupCodeName"
          rowSelection="multiple"
          onApply={(picked: any) => {
            closePopup();
            const list = Array.isArray(picked) ? picked : [picked];
            const row = {
              ...main,
              rowStatus: "I",
              COPYARRAY: list.map((p: any) => ({ LGST_GRP_CD_COPY: p.CODE })),
            };
            base.callAjax(api.onCopyAll([row])).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireMain, openPopup, closePopup, base]);

  // ── 위반템플릿 등록 ────────────────────────────────────────
  const onVltnTmpltRgstr = useCallback(() => {
    const main = requireMain();
    if (!main) return;
    openPopup({
      title: "LBL_VLTN_NTFCTN_RGSTR",
      width: "3xl",
      content: (
        <VltnRgstrPop
          onConfirm={(tmpltArray) => {
            closePopup();
            const row = { ...main, rowStatus: "I", TMPLTARRAY: tmpltArray };
            base.callAjax(api.onVltnTmpltRgstr([row])).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [requireMain, openPopup, closePopup, base]);

  // ── 템플릿 복사 (sub01 → 다른 물류그룹) ────────────────────
  const onTmpltCopy = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      openPopup({
        title: "BTN_TEMPLATE_COPY",
        width: "2xl",
        content: (
          <CommonPopup
            sqlId="selectLogisticsgroupCodeName"
            rowSelection="multiple"
            onApply={(picked: any) => {
              closePopup();
              const list = Array.isArray(picked) ? picked : [picked];
              const saveRows = rows.map((r: any) => ({
                ...r,
                rowStatus: "I",
                COPYARRAY: list.map((p: any) => ({ LGST_GRP_CD_COPY: p.CODE })),
              }));
              base.callAjax(api.onCopyAll(saveRows)).then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, openPopup, closePopup],
  );

  // ── sub01 추가 ─────────────────────────────────────────────
  const onAddCnfg = useCallback(() => {
    const main = requireMain();
    if (!main) return;
    base.addRow("detail", {
      LGST_GRP_CD: main.LGST_GRP_CD,
      USE_YN: "N",
      CNSCTV_VLTN_CNT: 0,
      MAX_VLTN_NTFCTN_CNT: 0,
      VLTN_NTFCTN_INTRVL: 30,
    });
  }, [requireMain, base]);

  // ── sub01 저장 (FRM<=TO 검증 + cascade 재조회) ─────────────
  const onSaveCnfg = useCallback(
    () =>
      base.saveGrid("detail", api.saveCnfg, {
        beforeSave: () => {
          const rows = model.grids.detail.rows ?? [];
          const bad = rows.some(
            (r: any) =>
              r.EDIT_STS === "I" &&
              r.FRM_DTTM &&
              r.TO_DTTM &&
              stripSep(r.FRM_DTTM) > stripSep(r.TO_DTTM),
          );
          if (bad) {
            base.alert(Lang.get("MSG_INPUT_DATE_VALIDATION"), Lang.get("TTL_ERR"));
            return false;
          }
          return true;
        },
        afterSave: {
          cascadeFrom: "main",
          fetch: (m) =>
            api.getVltnNtfctnCnfgDetailList({ LGST_GRP_CD: m.LGST_GRP_CD }),
        },
      }),
    [base, model.grids.detail],
  );

  // ── 템플릿(메시지) 수정 ────────────────────────────────────
  const onTmpltUpd = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (rows.length === 0) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
        return;
      }
      const target = rows[0];
      openPopup({
        title: "LBL_NTFCTN_MSG_TMPLT_UPDATE",
        width: "3xl",
        content: (
          <TmpltUpdPop
            initial={target}
            onConfirm={(params) => {
              closePopup();
              base.callAjax(api.onTmpltUpd(params)).then(() => {
                const detail = model.grids.detail.selectedRef.current;
                if (detail) {
                  base.searchSub(
                    "channel",
                    api.getVltnNtfctnCnfgChannelList({
                      VLTN_NTFCTN_CNFG_ID: detail.VLTN_NTFCTN_CNFG_ID,
                    }),
                  );
                }
              });
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, openPopup, closePopup, model.grids.detail],
  );

  // ── sub02 추가 ─────────────────────────────────────────────
  const onAddChnl = useCallback(() => {
    const detail = model.grids.detail.selectedRef.current;
    if (!detail) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    base.addRow("channel", {
      VLTN_NTFCTN_CNFG_ID: detail.VLTN_NTFCTN_CNFG_ID,
      USE_YN: "N",
    });
  }, [model.grids.detail, base]);

  const onSaveChnl = useCallback(
    () =>
      base.saveGrid("channel", api.saveChnl, {
        afterSave: {
          cascadeFrom: "detail",
          fetch: (d) =>
            api.getVltnNtfctnCnfgChannelList({
              VLTN_NTFCTN_CNFG_ID: d.VLTN_NTFCTN_CNFG_ID,
            }),
        },
      }),
    [base],
  );

  // ── 사용자등록 (sub03) ─────────────────────────────────────
  const onUsrRegi = useCallback(() => {
    const detail = model.grids.detail.selectedRef.current;
    if (!detail) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    const configId = detail.VLTN_NTFCTN_CNFG_ID;
    openPopup({
      title: "LBL_USR_REGI",
      width: "4xl",
      content: (
        <UsrRegiPop
          configId={configId}
          onConfirm={(users) => {
            closePopup();
            const saveRows = users.map((u: any) => ({
              ...u,
              rowStatus: "I",
              VLTN_NTFCTN_CNFG_ID: configId,
              RCVR_NM: u.USR_NM,
            }));
            base.callAjax(api.saveRcvr({ dsSave: saveRows })).then(() => {
              base.searchSub(
                "target",
                api.getVltnNtfctnCnfgTargetList({ VLTN_NTFCTN_CNFG_ID: configId }),
              );
            });
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.detail, openPopup, closePopup, base]);

  const onAddRcvr = useCallback(() => {
    const detail = model.grids.detail.selectedRef.current;
    if (!detail) {
      base.alert(Lang.get("MSG_SELECT_NO_DATA"), Lang.get("TTL_CONFIRM"));
      return;
    }
    base.addRow("target", { VLTN_NTFCTN_CNFG_ID: detail.VLTN_NTFCTN_CNFG_ID });
  }, [model.grids.detail, base]);

  const onSaveRcvr = useCallback(
    () =>
      base.saveGrid("target", api.saveRcvr, {
        afterSave: {
          cascadeFrom: "detail",
          fetch: (d) =>
            api.getVltnNtfctnCnfgTargetList({
              VLTN_NTFCTN_CNFG_ID: d.VLTN_NTFCTN_CNFG_ID,
            }),
        },
      }),
    [base],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "LBL_COPY", label: "LBL_COPY", onClick: onCopyAll },
      { type: "button", key: "BTN_CREATE", label: "BTN_CREATE", onClick: onVltnTmpltRgstr },
    ],
    [onCopyAll, onVltnTmpltRgstr],
  );

  const detailActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_TEMPLATE_COPY", label: "BTN_TEMPLATE_COPY", onClick: onTmpltCopy },
      makeAddAction({ onClick: onAddCnfg }),
      makeSaveAction({ onClick: onSaveCnfg }),
    ],
    [onTmpltCopy, onAddCnfg, onSaveCnfg],
  );

  const channelActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_TEMPLATE_UPDATE", label: "BTN_TEMPLATE_UPDATE", onClick: onTmpltUpd },
      makeAddAction({ onClick: onAddChnl }),
      makeSaveAction({ onClick: onSaveChnl }),
    ],
    [onTmpltUpd, onAddChnl, onSaveChnl],
  );

  const targetActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "LBL_USR_REGI", label: "LBL_USR_REGI", onClick: onUsrRegi },
      makeAddAction({ onClick: onAddRcvr }),
      makeSaveAction({ onClick: onSaveRcvr }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.target.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const detail = model.grids.detail.selectedRef.current;
          return api.getVltnNtfctnCnfgTargetList({
            VLTN_NTFCTN_CNFG_ID: detail?.VLTN_NTFCTN_CNFG_ID,
          });
        },
        rows: model.grids.target.rows,
        upload: { gridId: "SUB03_GRID_VLTN_NTFCTN_CNFG", onUploaded: () => base.search() },
        templateDownload: { gridId: "SUB03_GRID_VLTN_NTFCTN_CNFG" },
      }),
    ],
    [onUsrRegi, onAddRcvr, onSaveRcvr, menuName, model.grids.target, model.grids.detail, base],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onDetailGridClick,
    mainActions,
    detailActions,
    channelActions,
    targetActions,
  };
}
