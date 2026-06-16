"use client";

// RATESHOP 팝업 (서버 pop/NoApDispatchListPop 대응)
//  - 배차번호(DSPCH_NO) 표시 + 운임검색(/tariffOperationService/rateShop)
//  - 메인 그리드: 운임 목록(TRF_CD/TRF_NM/TRF_COST). 선택 시 하단에 해당 운임의 CHARGE_LIST 표시.
//  - 선택(BTN_TMS_SELECT): /tariffOperationRefactorService/changeApTariff → 부모 재조회 후 닫기.

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import { MENU_CODE } from "../NoApDispatchList";

type Props = {
  dspchNo: string;
  onDone: () => void;
  onClose: () => void;
};

const POP_MAIN_COLUMNS = [
  { headerName: "LBL_TARIFF_CODE", field: "TRF_CD", type: "text", flex: 1 },
  { headerName: "LBL_TARIFF_NAME", field: "TRF_NM", type: "text", flex: 1 },
  {
    headerName: "LBL_INS_COST",
    field: "TRF_COST",
    type: "numeric",
    decimalPlaces: 2,
    flex: 1,
  },
];

const POP_SUB_COLUMNS = [
  { headerName: "LBL_RATE_ITEM_CODE", field: "CHG_CD", type: "text", flex: 1 },
  { headerName: "LBL_RATE_ITEM_NAME", field: "CHG_NM", type: "text", flex: 1 },
  {
    headerName: "LBL_COST",
    field: "INS_COST",
    type: "numeric",
    decimalPlaces: 2,
    flex: 1,
  },
];

export function NoApDispatchListPop({ dspchNo, onDone, onClose }: Props) {
  const [tariffRows, setTariffRows] = useState<any[]>([]);
  const [chargeRows, setChargeRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const showError = useErrorAlert();

  // 운임 검색
  const onSearch = () => {
    apiClient
      .post(
        `/tariffOperationRefactorService/selectTariffList`,
        { DSPCH_NO: dspchNo },
        { params: { ...getSessionFields(), module: "TMS", MENU_CD: MENU_CODE } },
      )
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setTariffRows(data);
        setChargeRows([]);
        setSelected(null);
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
  };

  // 운임 선택 → 해당 운임의 CHARGE_LIST 표시 (서버 searchDetails 대응)
  const onSelectMain = (row: any) => {
    setSelected(row);
    setChargeRows(Array.isArray(row?.CHARGE_LIST) ? row.CHARGE_LIST : []);
  };

  // 선택(요율확정) → changeApTariff
  const onSelectRate = () => {
    if (!selected) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    apiClient
      .post(`/tariffOperationRefactorService/changeApTariff`, {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        DSPCH_NO: dspchNo,
        FIXED_TRF_CD: selected.TRF_CD,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        onDone();
        onClose();
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 배차번호 + 운임검색 */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-500 mb-1">
            {Lang.get("LBL_DISPATCH_NO")}
          </label>
          <input
            readOnly
            value={dspchNo}
            className="h-8 px-2 text-[12px] border border-slate-300 rounded-md bg-slate-50 w-[200px]"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSearch}
          className="h-8 px-3 text-xs gap-1.5"
        >
          <Search className="w-3 h-3" />
          {Lang.get("BTN_SEARCH_TARIFF")}
        </Button>
      </div>

      {/* 운임 목록 */}
      <div className="shrink-0" style={{ height: 280 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={POP_MAIN_COLUMNS}
          rowData={tariffRows}
          rowSelection="single"
          onRowSelected={(row: any) => onSelectMain(row)}
          disableAutoSize
        />
      </div>

      {/* 선택 운임의 요율항목 */}
      <div className="shrink-0" style={{ height: 180 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={POP_SUB_COLUMNS}
          rowData={chargeRows}
          disableAutoSize
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs"
        >
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          size="sm"
          disabled={!selected}
          onClick={onSelectRate}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30"
        >
          {Lang.get("BTN_TMS_SELECT")}
        </Button>
      </div>
    </div>
  );
}
