import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import {
  makeAddAction,
  makeExcelGroupAction,
} from "@/app/components/grid/actions/commonActions";
import { usePopup } from "@/app/components/popup/PopupContext";
import { toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { ROW_STATUS } from "@/app/components/grid/gridCommon";
import { getSessionFields } from "@/app/services/auth/auth";
import { Lang } from "@/app/services/common/Lang";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { podReportApi as api } from "./PodReportApi";
import { MENU_CODE } from "./PodReport";
import { PdfPop } from "./popup/PdfPop";
import { PodFileUploadPop } from "./popup/PodFileUploadPop";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { PodReportModel, GridKey } from "./PodReportModel";

interface Args {
  model: PodReportModel;
}

const IMG_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];

// 파일명에서 확장자 추출 (".pdf" 형태)
const extOf = (name?: string): string | null => {
  if (!name) return null;
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : null;
};

export function usePodReportController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // ── 메인 조회 ─────────────────────────────────────────────────────
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // sub01(인수상품) + sub02(거절·반품) cascade
  const cascadeDetail = useCallback(
    (row: any) => {
      base.handleRowClick("main", row, [
        {
          to: "sub01",
          fetch: (r) =>
            api.getPodDetail({ SHPM_DTL_ID: r.SHPM_DTL_ID, POD_ID: r.POD_ID }),
        },
        {
          to: "sub03",
          fetch: (r) => api.getPodFile({ POD_ID: r.POD_ID }),
        },
      ], { alsoReset: ["sub02"] });
      // 이미지 패널 초기화 (서버 imagePanel.removeAll)
      model.setImage({ url: null, ext: null, loading: false });
    },
    [base, model],
  );

  // ── 조회 콜백 — 메인 set + 첫 행 cascade ──────────────────────────
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      const first = data?.rows?.[0];
      if (first) cascadeDetail(first);
    },
    [model.grids.main, cascadeDetail],
  );

  const onMainGridClick = useCallback(
    (row: any) => cascadeDetail(row),
    [cascadeDetail],
  );

  // ── sub01 클릭 → 거절·반품(sub02) 조회 ─────────────────────────────
  const onSub01GridClick = useCallback(
    (row: any) =>
      base.handleRowClick("sub01", row, [
        { to: "sub02", fetch: (r) => api.getPodRejected({ POD_DTL_ID: r.POD_DTL_ID }) },
      ]),
    [base],
  );

  // ── POD 이미지 다운로드 → 미리보기 패널 갱신 ──────────────────────
  const showImage = useCallback(
    async (row: any) => {
      if (!row || !row.FILE_ID) {
        model.setImage({ url: null, ext: null, loading: false });
        return;
      }
      const ext =
        (row.FILE_NM_EXTENSION as string | undefined)?.toLowerCase() ??
        extOf(row.ORG_FILE_NM);
      model.setImage({ url: null, ext, loading: true });
      try {
        const res = await api.downloadFile({
          KEY_ID: row.POD_ID,
          FILE_ID: row.FILE_ID,
        });
        const mime =
          ext === ".pdf"
            ? "application/pdf"
            : ext === ".png"
              ? "image/png"
              : ext && IMG_EXTS.includes(ext)
                ? "image/jpeg"
                : "application/octet-stream";
        const url = URL.createObjectURL(
          new Blob([res.data as BlobPart], { type: mime }),
        );
        model.setImage({ url, ext, loading: false });
      } catch {
        model.setImage({ url: null, ext: null, loading: false });
        base.alert(Lang.get("MSG_ERR_IMAGE_DOWNLOAD"));
      }
    },
    [base, model],
  );

  const onSub03GridClick = useCallback(
    (row: any) => {
      base.handleRowClick("sub03", row);
      void showImage(row);
    },
    [base, showImage],
  );

  // ── sub03 더블클릭 → 전체보기 팝업 ────────────────────────────────
  const onSub03GridDblClick = useCallback(() => {
    const { url, ext } = model.image;
    if (!url) return;
    openPopup({
      title: "LBL_POD",
      width: "full",
      content: <PdfPop url={url} fileExtension={ext} />,
    });
  }, [model.image, openPopup]);

  // ── 하단 탭 변경  ───────────────────────
  const onDetailTabChange = useCallback(
    (key: string) => {
      const main =
        model.grids.main.selectedRef.current ?? model.grids.main.rows?.[0];
      if (!main?.POD_ID) return;

      if (key === "ITEM") {
        base.resetGrids(["sub01", "sub02"]);
        void base
          .searchSub(
            "sub01",
            api.getPodDetail({
              SHPM_DTL_ID: main.SHPM_DTL_ID,
              POD_ID: main.POD_ID,
            }),
          )
          .then((rows) => {
            const first = rows?.[0];
            if (first?.POD_DTL_ID) {
              void base.searchSub(
                "sub02",
                api.getPodRejected({ POD_DTL_ID: first.POD_DTL_ID }),
              );
            }
          });
        return;
      }

      if (key === "IMAGE") {
        model.setImage({ url: null, ext: null, loading: false });
        void base
          .searchSub("sub03", api.getPodFile({ POD_ID: main.POD_ID }))
          .then((rows) => {
            const first = rows?.[0];
            if (first) void showImage(first);
          });
      }
    },
    [base, model, showImage],
  );

  // ── 인수증 확인 (메인) ────────────────────────────────────────────
  const onConfirm = useCallback(
    ({ data }: { data: any[] }) => {
      const rows = data ?? [];
      if (!rows.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      const dsSave = toDsSave(
        rows.map((r) => ({ ...r, EDIT_STS: ROW_STATUS.UPDATE })),
      );
      void base.callAjax(api.confirmPod({ dsSave }), { mask: "main" }).then(() => base.search());
    },
    [base],
  );

  // ── 거절·반품(sub02) 행추가 / 저장 ────────────────────────────────
  const onAddSub02 = useCallback(() => {
    const parent = model.grids.sub01.selectedRef.current;
    if (!base.requireParentRow(parent, Lang.get("LBL_POD_DTL_ID"))) return;
    base.addRow("sub02", { POD_DTL_ID: parent.POD_DTL_ID });
  }, [base, model.grids.sub01]);

  const onSaveSub02 = useCallback(() => {
    void base.saveGrid("sub02", api.saveItemReject, { afterSave: "refresh" });
  }, [base]);

  // ── POD 파일 업로드 / 삭제 (sub03) ────────────────────────────────
  const onPodFileUpload = useCallback(() => {
    const main = model.grids.main.selectedRef.current;
    if (!base.requireParentRow(main, Lang.get("LBL_POD_NO"))) return;
    openPopup({
      title: "BTN_POD_FILE_UPLOAD",
      width: "lg",
      content: (
        <PodFileUploadPop
          onClose={closePopup}
          onSubmit={(file) => {
            closePopup();
            const fd = new FormData();
            fd.append("UPLOAD_FILE", file);
            const session = getSessionFields();
            Object.entries(session).forEach(([k, v]) =>
              fd.append(k, String(v ?? "")),
            );
            fd.append("MENU_CD", MENU_CODE);
            fd.append("JSON_READ_PASS", "Y");
            fd.append("POD_ID", String(main.POD_ID ?? ""));
            void base
              .callAjax(api.uploadPodFile(fd), { successMsg: Lang.get("MSG_FILE_UPLOAD_CMPLT"), mask: "main" })
              .then(() => base.search());
          }}
        />
      ),
    });
  }, [base, closePopup, model.grids.main, openPopup]);

  const onPodFileDelete = useCallback(
    ({ data }: { data: any[] }) => {
      const main = model.grids.main.selectedRef.current;
      const sel = (data ?? [])[0];
      if (!main || !sel) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      base.confirm(Lang.get("MSG_DELETE_SELECTED_FILE"), () => {
        const dsSave = [
          { POD_ID: main.POD_ID, FILE_ID: sel.FILE_ID, DEL_YN: "Y" },
        ];
        void base
          .callAjax(api.deletePodFile({ dsSave }), { mask: "main" })
          .then(() => base.search());
      });
    },
    [base, model.grids.main],
  );

  // ── 그리드별 액션 ─────────────────────────────────────────────────
  const mainActions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_CONFIRM", label: "BTN_CONFIRM", onClick: onConfirm },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: () => model.grids.main.rows,
      }),
    ],
    [menuName, model.grids.main, model.filtersRef, onConfirm],
  );

  const sub01Actions: ActionItem[] = useMemo(
    () => [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub01.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getPodDetail({
            ...(model.grids.main.selectedRef.current ?? {}),
          }),
        rows: () => model.grids.sub01.rows,
      }),
    ],
    [menuName, model.grids.sub01, model.grids.main],
  );

  const sub02Actions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddSub02 }),
      { type: "button", key: "BTN_SAVE", label: "BTN_SAVE", onClick: onSaveSub02 },
      makeExcelGroupAction({
        excelColumns: () => model.grids.sub02.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () =>
          api.getPodRejected({
            POD_DTL_ID: model.grids.sub01.selectedRef.current?.POD_DTL_ID,
          }),
        rows: () => model.grids.sub02.rows,
      }),
    ],
    [menuName, model.grids.sub02, model.grids.sub01, onAddSub02, onSaveSub02],
  );

  const sub03Actions: ActionItem[] = useMemo(
    () => [
      { type: "button", key: "BTN_POD_FILE_UPLOAD", label: "BTN_POD_FILE_UPLOAD", onClick: onPodFileUpload },
      { type: "button", key: "BTN_POD_FILE_DELETE", label: "BTN_POD_FILE_DELETE", onClick: onPodFileDelete },
    ],
    [onPodFileUpload, onPodFileDelete],
  );

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    onSub01GridClick,
    onSub03GridClick,
    onSub03GridDblClick,
    onDetailTabChange,
    mainActions,
    sub01Actions,
    sub02Actions,
    sub03Actions,
  };
}
