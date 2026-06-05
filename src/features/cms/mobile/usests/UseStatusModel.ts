"use client";

import { useMemo, useState } from "react";
import { useBaseModel } from "@/app/feature/useBaseModel";

export type GridKey = "main" | "filter" | "carrier";

export type StatusChartRow = {
  categoryKey: "dedi" | "con";
  categoryName: string;
  mbl_sts1: number;
  mbl_sts2: number;
  mbl_sts3: number;
  mbl_sts4: number;
};

export function useUseStatusModel(menuCode: string) {
  const base = useBaseModel<GridKey>(menuCode);
  const [statusChartData, setStatusChartData] = useState<StatusChartRow[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterTitle, setFilterTitle] = useState("LBL_FILTER_VEH");

  const chartColors = useMemo(
    () => ({
      mbl_sts1: "#6C94B8",
      mbl_sts2: "#2C609C",
      mbl_sts3: "#1E427F",
      mbl_sts4: "#12245C",
    }),
    [],
  );

  const loginStatusMap = useMemo(
    () => ({
      IN: "로그인 유지(앱이 사용중임을 보장하지 않습니다.)",
      OUT: "로그아웃",
    }),
    [],
  );

  const mobileStatusMap = useMemo(
    () => ({
      mbl_sts1: "1회 이상 로그인 이력없음",
      mbl_sts2: "로그아웃 상태",
      mbl_sts3: "로그인 유지, 48시간 이상 화면조회하지 않음",
      mbl_sts4: "로그인 상태",
    }),
    [],
  );

  const codeMap = useMemo(
    () => ({
      loginType: loginStatusMap,
      stsType: mobileStatusMap,
    }),
    [loginStatusMap, mobileStatusMap],
  );

  return {
    ...base,
    statusChartData,
    setStatusChartData,
    showFilterPanel,
    setShowFilterPanel,
    filterTitle,
    setFilterTitle,
    chartColors,
    codeMap,
    loginStatusMap,
    mobileStatusMap,
  };
}

export type UseStatusModel = ReturnType<typeof useUseStatusModel>;
