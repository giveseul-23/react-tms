import { useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";
import { MAIN_COLUMN_DEFS } from "./DispathApDetailColumns";

export type GridKey = "main";

export function useDispathApDetailModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);

  // 동적 컬럼 (조회 시 CHG_CD 메타로 재생성)
  const [mainColumnDefs, setMainColumnDefs] = useState<any[]>(MAIN_COLUMN_DEFS);

  return { ...base, mainColumnDefs, setMainColumnDefs };
}

export type DispathApDetailModel = ReturnType<typeof useDispathApDetailModel>;
