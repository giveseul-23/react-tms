"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { makeAddAction, makeSaveAction } from "@/app/components/grid/actions/commonActions";
import { ROW_STATUS, toDsSave } from "@/app/components/grid/gridUtils/rowStatus";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";
import { departArrivalManagementApi as api } from "../DepartArrivalManagementApi";
import { PodImagePanel } from "../../podrpt/popup/PodImagePanel";
import type { PodImageState } from "../../podrpt/PodReportModel";

type Props = {
  row: any;
  onClose: () => void;
  onApplied?: () => void;
};

const IMG_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];

const COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "combo",
    headerName: "LBL_SRVC_ATVT_TP",
    field: "SRVC_TYPE",
    codeKey: "srvcType",
    insertable: true,
    flex: 1,
  },
  {
    type: "text",
    headerName: "LBL_FILE_ATTACH",
    field: "ORG_FILE_NM",
    flex: 1,
  },
  { type: "text", headerName: "STOP_ID", field: "STOP_ID", hide: true, noLang: true },
  { type: "text", headerName: "SRVC_ID", field: "SRVC_ID", hide: true, noLang: true },
];

const emptyImage: PodImageState = { url: null, ext: null, loading: false };

const getRows = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

const extOf = (name?: string): string | null => {
  if (!name) return null;
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : null;
};

const mimeOf = (ext: string | null) => {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext && IMG_EXTS.includes(ext)) return "image/jpeg";
  return "application/octet-stream";
};

export default function SrvcAtvtPopup({ row, onClose, onApplied }: Props) {
  const { codeMap } = useCommonStores({
    srvcType: { sqlProp: "CODE", keyParam: "SRVC_ATVT_TP" },
  });
  const [gridData, setGridData] = useState<any>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 500,
  });
  const [image, setImage] = useState<PodImageState>(emptyImage);

  useEffect(() => {
    return () => {
      if (image.url) URL.revokeObjectURL(image.url);
    };
  }, [image.url]);

  const clearImage = useCallback(() => {
    setImage((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return emptyImage;
    });
  }, []);

  const search = useCallback(async () => {
    clearImage();
    const res = await api.getServiceActivityList({ STOP_ID: row.STOP_ID });
    const rows = getRows(res);
    setGridData({
      rows,
      totalCount: rows.length,
      page: 1,
      limit: rows.length || 500,
    });
  }, [clearImage, row.STOP_ID]);

  const showImage = useCallback(
    async (selected: any) => {
      if (!selected?.FILE_ID || !selected?.SRVC_ID) {
        clearImage();
        return;
      }

      const ext =
        String(selected.FILE_NM_EXTENSION ?? "").toLowerCase() ||
        extOf(selected.ORG_FILE_NM);

      setImage((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url);
        return { url: null, ext, loading: true };
      });

      try {
        const res = await api.downloadServiceActivityFile({
          KEY_ID: String(selected.SRVC_ID ?? ""),
          FILE_ID: String(selected.FILE_ID ?? ""),
        });
        const url = URL.createObjectURL(
          new Blob([res.data as BlobPart], { type: mimeOf(ext) }),
        );
        setImage((prev) => {
          if (prev.url) URL.revokeObjectURL(prev.url);
          return { url, ext, loading: false };
        });
      } catch {
        setImage(emptyImage);
        showErrorModal(Lang.get("MSG_ERR_IMAGE_DOWNLOAD"));
      }
    },
    [clearImage],
  );

  useEffect(() => {
    void search();
  }, [search]);

  const onAdd = useCallback(() => {
    setGridData((prev: any) => ({
      ...prev,
      rows: [
        ...(prev.rows ?? []),
        {
          STOP_ID: row.STOP_ID,
          SRVC_ID: row.SRVC_ID,
          EDIT_STS: ROW_STATUS.INSERT,
        },
      ],
      totalCount: (prev.rows?.length ?? 0) + 1,
    }));
  }, [row.SRVC_ID, row.STOP_ID]);

  const onSave = useCallback(async () => {
    const dsSave = toDsSave(gridData.rows);
    if (dsSave.length === 0) {
      showInfoModal(Lang.get("MSG_NO_CHANGE_DATA"));
      return;
    }

    try {
      await api.saveServiceActivities({ dsSave });
      showInfoModal(Lang.get("MSG_SAVE_CMPLT"));
      await search();
      onApplied?.();
    } catch (error: any) {
      showErrorModal(
        error?.response?.data?.error?.message ??
          error?.response?.data?.msg ??
          Lang.get("TTL_ERR"),
      );
    }
  }, [gridData.rows, onApplied, search]);

  const actions = useMemo(
    () => [
      makeAddAction({ onClick: onAdd }),
      makeSaveAction({ onClick: onSave }),
      { type: "button" as const, key: "LBL_CLOSE", label: "LBL_CLOSE", onClick: onClose },
    ],
    [onAdd, onClose, onSave],
  );

  return (
    <div className="flex h-[300px] min-h-0 flex-col gap-2">
      <div className="text-xs font-medium text-slate-600">
        {Lang.get("LBL_LOCATION_NAME")}: {String(row.LOC_NM ?? "")}
      </div>
      <SplitPane direction="horizontal" defaultSizes={[60, 40]}>
        <DataGrid
          layoutType="plain"
          rowData={gridData.rows}
          totalCount={gridData.totalCount}
          currentPage={1}
          pageSize={gridData.limit}
          columnDefs={COLUMN_DEFS}
          codeMap={codeMap}
          actions={actions}
          pagination={false}
          audit={{ delete: true, rowStatus: true }}
          setRowData={setGridData}
          onRowClicked={(selected) => void showImage(selected)}
        />
        <PodImagePanel image={image} />
      </SplitPane>
    </div>
  );
}
