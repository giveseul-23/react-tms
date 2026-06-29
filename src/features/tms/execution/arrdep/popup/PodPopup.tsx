"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";
import { departArrivalManagementApi as api } from "../DepartArrivalManagementApi";
import { PodImagePanel } from "../../podrpt/popup/PodImagePanel";
import { PdfPop } from "../../podrpt/popup/PdfPop";
import type { PodImageState } from "../../podrpt/PodReportModel";

type Props = {
  row: any;
};

const IMG_EXTS = [".pdf", ".png", ".jpg", ".jpeg"];

const POD_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "DSPCH_NO", field: "DSPCH_NO", hide: true, noLang: true },
  { type: "text", headerName: "LBL_POD_ID", field: "POD_ID", align: "center", width: 100 },
  { type: "combo", headerName: "LBL_POD_TCD", field: "POD_TCD", codeKey: "podTcdList", align: "center", width: 150 },
  { type: "combo", headerName: "LBL_POD_OP_STS", field: "POD_OP_STS", codeKey: "podOpStsList", align: "center", width: 120 },
  { type: "text", headerName: "LBL_DESTINATION_CD", field: "LOC_CD", align: "center", width: 120 },
  { type: "text", headerName: "LBL_DESTINATION_NM", field: "LOC_NM", align: "left", width: 180 },
];

const POD_IMAGE_COLUMN_DEFS = [
  { headerName: "No" },
  { type: "text", headerName: "POD_ID", field: "POD_ID", hide: true, noLang: true },
  { type: "text", headerName: "LBL_FILE_ID", field: "FILE_ID", align: "center", width: 120 },
  { type: "text", headerName: "LBL_ORG_FILE_NM", field: "ORG_FILE_NM", align: "left", width: 280 },
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

export default function PodPopup({ row }: Props) {
  const { openPopup } = usePopup();
  const { codeMap } = useCommonStores({
    podTcdList: { sqlProp: "CODE", keyParam: "POD_TCD" },
    podOpStsList: { sqlProp: "CODE", keyParam: "POD_OP_STS" },
  });
  const [podRows, setPodRows] = useState<any[]>([]);
  const [imageRows, setImageRows] = useState<any[]>([]);
  const [image, setImage] = useState<PodImageState>(emptyImage);

  const podData = useMemo(
    () => ({ rows: podRows, totalCount: podRows.length, page: 1, limit: podRows.length || 500 }),
    [podRows],
  );
  const imageData = useMemo(
    () => ({ rows: imageRows, totalCount: imageRows.length, page: 1, limit: imageRows.length || 500 }),
    [imageRows],
  );

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

  const showImage = useCallback(async (fileRow: any) => {
    if (!fileRow?.FILE_ID) {
      clearImage();
      return;
    }

    const ext =
      String(fileRow.FILE_NM_EXTENSION ?? "").toLowerCase() ||
      extOf(fileRow.ORG_FILE_NM);

    setImage((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { url: null, ext, loading: true };
    });

    try {
      const res = await api.downloadPodFile({
        KEY_ID: String(fileRow.POD_ID ?? ""),
        FILE_ID: String(fileRow.FILE_ID ?? ""),
      });
      const url = URL.createObjectURL(new Blob([res.data as BlobPart], { type: mimeOf(ext) }));
      setImage((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url);
        return { url, ext, loading: false };
      });
    } catch {
      setImage(emptyImage);
    }
  }, [clearImage]);

  const searchImages = useCallback(async (podRow: any) => {
    clearImage();
    if (!podRow?.POD_ID) {
      setImageRows([]);
      return;
    }
    const res = await api.getPodPopupDetail({ POD_ID: podRow.POD_ID });
    const rows = getRows(res).map((fileRow: any) => ({
      ...fileRow,
      POD_ID: fileRow.POD_ID ?? podRow.POD_ID,
    }));
    setImageRows(rows);
    if (rows[0]) void showImage(rows[0]);
  }, [clearImage, showImage]);

  const searchPods = useCallback(async () => {
    clearImage();
    setImageRows([]);
    const res = await api.getPodPopupList({ DSPCH_NO: row?.DSPCH_NO });
    const rows = getRows(res);
    setPodRows(rows);
    if (rows[0]) void searchImages(rows[0]);
  }, [clearImage, row?.DSPCH_NO, searchImages]);

  useEffect(() => {
    void searchPods();
  }, [searchPods]);

  const onImageDoubleClick = useCallback(() => {
    if (!image.url) return;
    openPopup({
      title: "LBL_POD_IMG",
      width: "full",
      content: <PdfPop url={image.url} fileExtension={image.ext} />,
    });
  }, [image.ext, image.url, openPopup]);

  return (
    <div className="flex h-[520px] min-h-0 flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void searchPods()}
          className="h-8 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          {Lang.get("BTN_SEARCH")}
        </button>
      </div>
      <SplitPane direction="horizontal" defaultSizes={[50, 50]}>
        <DataGrid
          layoutType="plain"
          rowData={podData.rows}
          totalCount={podData.totalCount}
          currentPage={1}
          pageSize={podData.limit}
          columnDefs={POD_COLUMN_DEFS}
          codeMap={codeMap}
          onRowClicked={(selected) => void searchImages(selected)}
          actions={[]}
          pagination={false}
          audit={false}
        />
        <SplitPane direction="vertical" defaultSizes={[55, 45]}>
          <DataGrid
            layoutType="plain"
            rowData={imageData.rows}
            totalCount={imageData.totalCount}
            currentPage={1}
            pageSize={imageData.limit}
            columnDefs={POD_IMAGE_COLUMN_DEFS}
            onRowClicked={(selected) => void showImage(selected)}
            onRowDoubleClicked={onImageDoubleClick}
            actions={[]}
            pagination={false}
            audit={false}
          />
          <PodImagePanel image={image} />
        </SplitPane>
      </SplitPane>
    </div>
  );
}
