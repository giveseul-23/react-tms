"use client";

// POD 이미지 미리보기 패널 (서버 imagePanel 대응)
// sub03 그리드에서 행 클릭 시 Controller 가 다운로드한 blob URL 을 받아 렌더.
//   - .pdf  → <embed>
//   - 이미지(.png/.jpg/.jpeg) → <img>
//   - 그 외 → 안내문구
// 더블클릭 시 PdfPop 으로 전체보기 (Controller 가 처리).

import { Lang } from "@/app/services/common/Lang";
import type { PodImageState } from "../PodReportModel";

const IMG_EXTS = [".png", ".jpg", ".jpeg"];

export function PodImagePanel({ image }: { image: PodImageState }) {
  const { url, ext, loading } = image;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-white p-2">
      {loading ? (
        <span className="text-sm text-slate-500">{Lang.get("MSG_WAITING")}</span>
      ) : !url ? (
        <span className="text-sm text-slate-400">{Lang.get("LBL_POD_IMAGE")}</span>
      ) : ext === ".pdf" ? (
        <embed
          src={url}
          type="application/pdf"
          className="h-full w-full"
          style={{ objectFit: "contain" }}
        />
      ) : ext && IMG_EXTS.includes(ext) ? (
        <img
          src={url}
          alt="POD"
          className="max-h-full max-w-full"
          style={{ objectFit: "contain" }}
        />
      ) : (
        <span className="text-sm text-slate-500">
          지원하지 않는 파일 형식입니다.
        </span>
      )}
    </div>
  );
}
