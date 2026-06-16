"use client";

// 오피넷 주유소 조회/등록 팝업 (서버 pop/OpinetGasPop 대응)
// 상호명(OPINET_GSSTTN_NM, 2자 이상) 검색 → 단건 선택 → OPINET_GSSTTN_CD 반환.

import { useCallback, useMemo, useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { Lang } from "@/app/services/common/Lang";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { oilPriceByGasStationApi as api } from "../OilPriceByGasStationApi";

type Props = {
  onConfirm: (payload: { OPINET_GSSTTN_CD: string }) => void;
  onClose: () => void;
};

const POP_COLUMN_DEFS = [
  { headerName: "No", width: 50 },
  { type: "text", field: "OPINET_GSSTTN_CD", headerName: "LBL_OPINET_GSSTTN_CD", align: "center", width: 100 },
  { type: "text", field: "OPINET_GSSTTN_NM", headerName: "LBL_OPINET_GSSTTN_NM", align: "left", width: 150 },
  { type: "text", field: "STREET_ADDR_DESC", headerName: "LBL_STREENAME_ADDRESS", align: "left", width: 220 },
  { type: "text", field: "JIBEON_ADDR_DESC", headerName: "LBL_LOT_ADDRESS", align: "left", width: 220 },
];

export function OpinetGasPop({ onConfirm, onClose }: Props) {
  const showError = useErrorAlert();
  const [gsSttnNm, setGsSttnNm] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  const runSearch = useCallback(() => {
    // 서버 onSearch: 상호명 2자 이상 필수
    if ((gsSttnNm ?? "").trim().length < 2) {
      showError(Lang.get("MSG_ERR_OPINET_GSSTTN_NM_MIN_LENGTH"));
      return;
    }
    void api
      .getGasStationPop({ OPINET_GSSTTN_NM: gsSttnNm })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("MSG_NO_DATA"));
          setRows([]);
          return;
        }
        setRows(res?.data?.data?.dsOut ?? []);
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("MSG_NO_DATA"),
        );
        setRows([]);
      });
  }, [gsSttnNm, showError]);

  const fields: GridSearchField[] = useMemo(
    () => [
      {
        label: "LBL_COM_NM",
        value: gsSttnNm,
        onChange: setGsSttnNm,
        placeholder: Lang.get("LBL_INPUT"),
      },
    ],
    [gsSttnNm],
  );

  const handleConfirm = useCallback(
    (payload: Record<string, any> | Record<string, any>[]) => {
      const picked = Array.isArray(payload) ? payload[0] : payload;
      if (!picked?.OPINET_GSSTTN_CD) {
        showError(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }
      onConfirm({ OPINET_GSSTTN_CD: String(picked.OPINET_GSSTTN_CD) });
    },
    [onConfirm, showError],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={POP_COLUMN_DEFS}
      rows={rows}
      gridHeight={420}
      selectedBadgeFields={["OPINET_GSSTTN_CD", "OPINET_GSSTTN_NM"]}
      selectPrompt={Lang.get("MSG_SELECT_NO_DATA")}
      onSearch={runSearch}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
