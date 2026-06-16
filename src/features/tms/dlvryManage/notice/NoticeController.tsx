import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { commitRowChanges } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { noticeApi as api } from "./NoticeApi";
import { MENU_CODE } from "./Notice";
import { NoticeRegisterPop } from "./popup/NoticeRegisterPop";
import { NoticeTargetVehPop } from "./popup/NoticeTargetVehPop";
import { NoticeUpdFileEditPop } from "./popup/NoticeUpdFileEditPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { NoticeModel, GridKey } from "./NoticeModel";

interface Args {
  model: NoticeModel;
}

const EMPTY_RESULT = Promise.resolve({ data: { data: { dsOut: [] } } });

// 기본 공지유효일자: 오늘 -7 ~ 오늘 +14 (센차 setDttm 대응)
function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return fmt(d);
}
function defaultTo() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return fmt(d);
}

export function useNoticeController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  // ── 공지대상차량(sub01) cascade fetch ─────────────────────────────
  const fetchSub01 = useCallback((mainRow: any) => {
    if (!mainRow?.NOTICE_ID || String(mainRow.EDIT_STS ?? "").trim() === "I") {
      return EMPTY_RESULT;
    }
    return api.getTargetDriverList({ NOTICE_ID: mainRow.NOTICE_ID });
  }, []);

  const onMainGridClick = useCallback(
    (row: any) => {
      void base.handleRowClick("main", row, [{ to: "sub01", fetch: fetchSub01 }]);
    },
    [base, fetchSub01],
  );

  // ── 메인 조회 — 공지유효일자 범위 합침 ────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const s = getSearch();
      return api.getList({
        ...params,
        NOTI_VALID_FRM_DTTM: s.SRCH_NOTI_VALID_DTTM_FROM ?? defaultFrom(),
        NOTI_VALID_TO_DTTM: s.SRCH_NOTI_VALID_DTTM_TO ?? defaultTo(),
      });
    },
    [getSearch],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const firstMain = data?.rows?.[0] ?? null;
      if (firstMain) {
        onMainGridClick(firstMain);
      } else {
        base.resetGrids(["sub01"]);
      }
    },
    [base, model.grids.main, onMainGridClick],
  );

  // ── 공지 추가 (조회조건의 사업부/물류운영그룹 채움) ─────────────────
  const onAddMain = useCallback(() => {
    const s = getSearch();
    base.addRow("main", {
      DIV_CD: s.SRCH_NOTI_DIV_CD ?? "",
      LGST_GRP_CD: s.SRCH_NOTI_LGST_GRP_CD ?? "",
      DIV_NM: s.SRCH_NOTI_DIV_NM ?? "",
      LGST_GRP_NM: s.SRCH_NOTI_LGST_GRP_NM ?? "",
    });
  }, [base, getSearch]);

  // ── 공지 저장 — 제목/내용/공지기간 필수 검증 ─────────────────────
  const onSaveMain = useCallback(
    () =>
      base.saveGrid("main", api.save, {
        beforeSave: () => {
          const rows = model.grids.main.rows ?? [];
          for (const r of rows) {
            const sts = String(r.EDIT_STS ?? "");
            if (sts !== ROW_STATUS.INSERT && sts !== ROW_STATUS.UPDATE) continue;
            if (!String(r.TITLE ?? "").trim() || !String(r.CONTENTS ?? "").trim()) {
              base.alert("제목과 내용은 빈값으로 저장 할 수 없습니다.");
              return false;
            }
            if (!r.NOTI_VALID_FRM_DTTM || !r.NOTI_VALID_TO_DTTM) {
              base.alert("공지시작일과 공지마지막일은 빈값으로 저장 할 수 없습니다.");
              return false;
            }
          }
          return true;
        },
        afterSave: "refresh",
      }),
    [base, model.grids.main],
  );

  // ── 공지내용 등록/편집 팝업 (행 더블클릭) ─────────────────────────
  const onRegisterPopup = useCallback(
    (row: any) => {
      if (!row) return;
      openPopup({
        title: "LBL_NOTICE_CONTENTS",
        width: "lg",
        content: (
          <NoticeRegisterPop
            initialValues={{ TITLE: row.TITLE, CONTENTS: row.CONTENTS }}
            onConfirm={(p) => {
              commitRowChanges(model.grids.main.setData, row, {
                TITLE: p.TITLE,
                CONTENTS: p.CONTENTS,
              });
              closePopup();
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [closePopup, model.grids.main.setData, openPopup],
  );

  // ── 차량선택 팝업 (차량지정 공지 'V' 일 때만) ─────────────────────
  const onAddTargetVeh = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_NOTICE"))) return;

    if (main.DSPLY_TP_CD !== "V") {
      base.alert("차량선택은 차량지정 공지의 경우만 등록가능 합니다.");
      return;
    }

    const s = getSearch();
    openPopup({
      title: "BTN_SELECT_VEH",
      width: "4xl",
      content: (
        <NoticeTargetVehPop
          lgstGrpCd={String(main.LGST_GRP_CD ?? s.SRCH_NOTI_LGST_GRP_CD ?? "")}
          onApply={(vehs) => {
            closePopup();
            base.addRow(
              "sub01",
              vehs.map((v) => ({
                NOTICE_ID: main.NOTICE_ID,
                VEH_ID: v.VEH_ID,
                VEH_NO: v.VEH_NO,
                CARR_CD: v.CARR_CD,
                CARR_NM: v.CARR_NM,
                DRVR_ID: v.DRVR_ID,
                DRVR_NM: v.DRVR_NM,
                VEH_OP_TP: v.VEH_OP_TP,
              })),
            );
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, getSearch, model.grids.main.selectedRef, openPopup]);

  const onSaveSub01 = useCallback(
    () =>
      base.saveGrid("sub01", api.saveTargetDriver, {
        afterSave: { cascadeFrom: "main", fetch: fetchSub01 },
      }),
    [base, fetchSub01],
  );

  // ── 첨부 파일 다운로드 / 삭제 / 업로드 ────────────────────────────
  const selectedMainHasFile = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!main || !main.NOTICE_ID) {
      base.alert(Lang.get("MSG_NOT_SELECTED"));
      return null;
    }
    if (!main.FILE_ID) {
      base.alert(Lang.get("MSG_SELECT_NO_FILE_DATA"));
      return null;
    }
    return main;
  }, [base, model.grids.main.selectedRef]);

  const onFileDownload = useCallback(async () => {
    const main = selectedMainHasFile();
    if (!main) return;
    const res = await api.downloadFile({
      FILE_ID: main.FILE_ID,
      KEY_ID: main.NOTICE_ID,
    });
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const a = document.createElement("a");
    a.href = url;
    a.download = String(main.FILE_NM ?? "download");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    base.search();
  }, [base, selectedMainHasFile]);

  const onFileDelete = useCallback(() => {
    const main = selectedMainHasFile();
    if (!main) return;
    void base
      .callAjax(api.deleteFile({ FILE_ID: main.FILE_ID, NOTICE_ID: main.NOTICE_ID }))
      .then(() => base.search());
  }, [base, selectedMainHasFile]);

  // ── 파일첨부 업로드 팝업 ──────────────────────────────────────────
  const onFileUpload = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_NOTICE"))) return;

    openPopup({
      title: "LBL_FILE_ATTACH",
      width: "md",
      content: (
        <NoticeUpdFileEditPop
          onSubmit={(file) => {
            closePopup();
            const fd = new FormData();
            fd.append("UPLOAD_FILE", file);
            fd.append("MENU_CD", MENU_CODE);
            fd.append("NOTICE_ID", String(main.NOTICE_ID ?? ""));
            fd.append("FILE_JOB_TP", "NOTICE");
            fd.append("FILE_ID", String(main.FILE_ID ?? ""));
            fd.append("rowStatus", main.FILE_ID ? "U" : "I");
            void base.callAjax(api.uploadImgFile(fd)).then(() => base.search());
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [base, closePopup, model.grids.main.selectedRef, openPopup]);

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddMain }),
      makeSaveAction({ onClick: onSaveMain }),
      {
        type: "group",
        key: "LBL_NOTICE_FILE_NM",
        label: "LBL_NOTICE_FILE_NM",
        items: [
          { type: "button", key: "LBL_FILE_DOWNLOAD", label: "LBL_FILE_DOWNLOAD", onClick: () => void onFileDownload() },
          { type: "button", key: "LBL_FILE_DELETE", label: "LBL_FILE_DELETE", onClick: onFileDelete },
          { type: "button", key: "BTN_EXCEL_UP", label: "LBL_FILE_ATTACH", onClick: onFileUpload },
        ],
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
      }),
    ],
    [menuName, model.filtersRef, model.grids.main, onAddMain, onFileDelete, onFileDownload, onFileUpload, onSaveMain],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddTargetVeh }),
      makeSaveAction({ onClick: onSaveSub01 }),
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main ? fetchSub01(main) : EMPTY_RESULT;
        },
        rows: model.grids.sub01.rows,
      }),
    ],
    [fetchSub01, menuName, model.grids.main.selectedRef, model.grids.sub01, onAddTargetVeh, onSaveSub01],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onRegisterPopup,
    mainActions,
    sub01Actions,
  };
}
