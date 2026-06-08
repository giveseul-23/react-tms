"use client";

// 차량유형별 금액 추가 팝업 (센차 DfChargeRateEachAddPop)
// 차량유형 검색 → 다건 선택 + 추가행수 → 부모에 전달.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { dfChargeRateApi as api } from "../DfChargeRateApi";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = {
  extraParams: Record<string, string>;
  onConfirm: (payload: { selectedRecord: any[]; addRowCnt: number }) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    field: "CODE",
    align: "center",
    width: 150,
  },
  { type: "text", headerName: "LBL_VEHICLE_TYPE_NAME", field: "NAME" },
];

export default function DfChargeRateEachAddPop({
  extraParams,
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [addRowCnt, setAddRowCnt] = useState(1);

  const search = () => {
    api
      .searchTariffVehicleTypeList({
        keyParam: extraParams.trfCd,
        param1: extraParams.chgCd,
        code,
        name,
      })
      .then((res: any) => {
        setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
        setSelected([]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchFields: GridSearchField[] = [
    {
      label: Lang.get("LBL_VEHICLE_TYPE_CODE"),
      value: code,
      onChange: setCode,
    },
    {
      label: Lang.get("LBL_VEHICLE_TYPE_NAME"),
      value: name,
      onChange: setName,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition
        fields={searchFields}
        onSearch={search}
        columns={2}
      />

      <div className="shrink-0" style={{ height: 360 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          pagination
          pageSize={100}
          rowSelection="multiple"
          gridOptions={{
            onSelectionChanged: (e: any) =>
              setSelected(e.api.getSelectedRows()),
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t">
        <label className="flex items-center gap-1 text-[12px]">
          <span className="font-medium">{Lang.get("LBL_ADD_ROW_CNT")}</span>
          <input
            type="number"
            min={1}
            max={10}
            value={addRowCnt}
            onChange={(e) => setAddRowCnt(Number(e.target.value))}
            className="w-16 h-6 px-2 text-[11px] text-right border border-input rounded-md"
          />
        </label>
        <div className="flex gap-1.5">
          <Button variant="outline" size="xs" onClick={onClose}>
            <X className="w-3 h-3" />
            {Lang.get("BTN_CANCEL")}
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={selected.length === 0}
            onClick={() => onConfirm({ selectedRecord: selected, addRowCnt })}
            className="btn-primary btn-primary:hover"
          >
            <Check className="w-3 h-3" />
            {Lang.get("BTN_APPLY")}
          </Button>
        </div>
      </div>
    </div>
  );
}
