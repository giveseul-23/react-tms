import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { useCommonStores } from "@/hooks/useCommonStores";

// main: 인수증(POD) / sub01: 인수상품정보 / sub02: 거절·반품 / sub03: POD 이미지 파일
export type GridKey = "main" | "sub01" | "sub02" | "sub03";

// POD 이미지 미리보기 패널 상태 (서버 imagePanel 대응)
export type PodImageState = {
  url: string | null;
  ext: string | null; // ".pdf" / ".png" / ".jpg" / ".jpeg"
  loading: boolean;
};

export function usePodReportModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 공통코드 — 서버 PodReportModel stores 대응
  const { codeMap } = useCommonStores({
    podTcd: { sqlProp: "CODE", keyParam: "POD_TCD" },
    podOpSts: { sqlProp: "CODE", keyParam: "POD_OP_STS" },
    podDelvCnfmTp: { sqlProp: "CODE", keyParam: "POD_DELV_CNFM_TP" },
    itmTkovrRjctRsnCd: { sqlProp: "CODE", keyParam: "ITM_TKOVR_RJCT_RSN_CD" },
    imgOpTcd: { sqlProp: "CODE", keyParam: "IMG_OP_TCD" },
  });

  // POD 이미지 미리보기 패널 상태
  const [image, setImage] = useState<PodImageState>({
    url: null,
    ext: null,
    loading: false,
  });

  return { ...base, codeMap, image, setImage };
}

export type PodReportModel = ReturnType<typeof usePodReportModel>;
