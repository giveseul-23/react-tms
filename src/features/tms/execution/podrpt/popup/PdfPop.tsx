"use client";

// POD 파일 전체보기 팝업 (서버 pop/PdfPop 대응)
// sub03 그리드 더블클릭 → 이미 다운로드된 blob URL 을 큰 화면으로 표시.
//   - .pdf  → <iframe>
//   - 이미지(.png/.jpg/.jpeg) → <img>
//   - 그 외 → 안내문구

type Props = {
  url: string;
  fileExtension: string | null;
};

const IMG_EXTS = [".png", ".jpg", ".jpeg"];

export function PdfPop({ url, fileExtension }: Props) {
  return (
    <div className="h-[80vh] w-full">
      {fileExtension === ".pdf" ? (
        <iframe src={url} className="h-full w-full border-0" title="POD" />
      ) : fileExtension && IMG_EXTS.includes(fileExtension) ? (
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <img
            src={url}
            alt="POD"
            className="max-h-full max-w-full"
            style={{ objectFit: "contain" }}
          />
        </div>
      ) : (
        <div className="p-8 text-sm text-slate-500">
          지원하지 않는 파일 형식입니다.
        </div>
      )}
    </div>
  );
}
