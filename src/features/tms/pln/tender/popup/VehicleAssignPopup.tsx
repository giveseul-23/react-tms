"use client";

import { useEffect, useState } from "react";
import { Search, X, Check, Truck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import { chgVehicleApi } from "@/features/tms/pln/tender/chgVehicleApi";
import { useCommonStores } from "@/hooks/useCommonStores";

type VehicleAssignPopupProps = {
  onApply: (row: any) => void;
  onClose: () => void;
};

const vehicleOperType = "110";

export default function VehicleAssignPopup({
  onApply,
  onClose,
}: VehicleAssignPopupProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [vehicleCode, setVehicleCode] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [region1, setRegion1] = useState("");
  const [region2, setRegion2] = useState("");

  useEffect(() => {
    fetchData({
      VEH_OP_TP: vehicleOperType,
    });
  }, []);

  const { stores } = useCommonStores({
    preferredZone: {
      sqlProp: "CODE",
      keyParam: "PREFERRED ZONE CD",
    },
  });

  const fetchData = (extraParams: any) => {
    //todo : 수정
    chgVehicleApi
      .getConTruckList({
        VEH_OP_TP: vehicleOperType,
        ...extraParams,
      })
      .then((res: any) => {
        setRows(res.data.result ?? res.data.data ?? []);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const onSearch = () => {
    fetchData({
      VEH_CD: vehicleCode,
      VEH_TP_CD: vehicleType,
      VEH_NO: vehicleNo,
      DRVR_NM: driverName,
      PRFRD_ZN_CD1: region1,
      PRFRD_ZN_CD2: region2,
    });
  };

  const textFields = [
    { label: "차량코드", value: vehicleCode, onChange: setVehicleCode },
    { label: "차량유형", value: vehicleType, onChange: setVehicleType },
    { label: "차량번호", value: vehicleNo, onChange: setVehicleNo },
    { label: "운전자명", value: driverName, onChange: setDriverName },
  ];

  const columnDefs = [
    { headerName: "No", width: 20 },
    {
      field: "LGST_GRP_CD",
      sendField: "RETURN_LGST_GRP_CD",
      hide: true,
    },
    {
      field: "DIV_CD",
      sendField: "RETURN_DIV_CD",
      hide: true,
    },
    {
      field: "VEH_ID",
      sendField: "RETURN_VEH_ID",
      hide: true,
    },
    {
      headerName: "차량번호",
      sendField: "RETURN_VEH_NO",
      field: "VEH_NO",
      width: 120,
    },
    {
      sendField: "RETURN_DRVR_ID",
      field: "DRVR_ID",
      hide: true,
    },
    {
      headerName: "운전자명",
      sendField: "RETURN_DRVR_NM",
      field: "DRVR_NM",
      width: 120,
    },
    {
      sendField: "RETURN_VEH_TP_CD",
      field: "VEH_TP_CD",
      hide: true,
    },
    {
      headerName: "차량유형명",
      sendField: "RETURN_VEH_TP_NM",
      field: "VEH_TP_NM",
      width: 120,
    },
    {
      field: "PRFRD_ZN_CD1",
      sendField: "RETURN_PRFRD_ZN_CD1",
      hide: true,
    },
    {
      field: "PRFRD_ZN_CD2",
      sendField: "RETURN_PRFRD_ZN_CD2",
      hide: true,
    },
    {
      headerName: "선호권역1",
      field: "PRFRD_ZN_NM1",
      width: 120,
    },
    {
      headerName: "선호권역2",
      field: "PRFRD_ZN_NM2",
      width: 120,
    },
  ];

  const buildPayload = (row: any) => {
    return columnDefs.reduce(
      (acc, col) => {
        const sendKey = (col as any).sendField ?? col.field;
        if (sendKey && col.field) {
          acc[sendKey] = row[col.field];
        }

        acc.CHGVEH_MEMO = "운송협력사 요청";
        return acc;
      },
      {} as Record<string, any>,
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 상단 조회 조건 영역 */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* 헤더 바 */}
        <div className="flex items-center justify-between px-3 py-2 bg-[rgb(var(--primary))]">
          <div className="flex items-center gap-1.5 leading-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white/80 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-white tracking-widest uppercase leading-none">
              조회조건
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={onSearch}
            className="h-6 px-3 rounded-full bg-white/15 hover:bg-white border border-white/30 text-white hover:text-[rgb(var(--primary))] text-[12px] font-semibold transition-all flex items-center gap-1"
            style={{ lineHeight: 1 }}
          >
            <Search className="w-3 h-3 flex-shrink-0" />
            <span className="leading-none">조회</span>
          </Button>
        </div>

        {/* 필드 및 테이블형 레이아웃 */}
        <div className="grid grid-cols-3 divide-x divide-y divide-slate-100">
          {/* 텍스트 필드 */}
          {textFields.map((f) => (
            <div
              key={f.label}
              className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group"
            >
              <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
                {f.label}
              </label>
              <input
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                className="text-[12px] text-slate-700 bg-transparent outline-none border-none placeholder:text-slate-300 w-full"
                placeholder="입력"
              />
            </div>
          ))}

          {/* 선호권역1 */}
          <div className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group">
            <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
              선호권역1
            </label>
            <ComboFilter
              placeholder="선택"
              options={stores.preferredZone}
              value={region1}
              onChange={setRegion1}
              inputClassName="text-[12px] text-slate-700 bg-transparent outline-none border-none h-auto p-0"
            />
          </div>

          {/* 선호권역2 */}
          <div className="flex flex-col px-3 py-2 bg-white hover:bg-blue-50/40 transition-colors group">
            <label className="text-[10px] font-medium text-slate-400 mb-0.5 group-focus-within:text-blue-500 transition-colors">
              선호권역2
            </label>
            <ComboFilter
              placeholder="선택"
              options={stores.preferredZone}
              value={region2}
              onChange={setRegion2}
              inputClassName="text-[12px] text-slate-700 bg-transparent outline-none border-none h-auto p-0"
            />
          </div>
        </div>
      </div>

      {/* 차량 선택 상태 표시 영역 */}
      {selectedRow ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
          <Truck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span className="font-semibold">{selectedRow.VEH_NO}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow.DRVR_NM}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow.VEH_TP_NM}</span>
          <span className="ml-auto text-[10px] text-blue-400 font-medium">
            선택됨
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400">
          <Truck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>그리드에서 차량을 선택하세요</span>
        </div>
      )}

      {/* 데이터 Grid 영역 */}
      <div className="h-[350px] shrink-0">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={columnDefs}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
          disableAutoSize
        />
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          취소
        </Button>
        <Button
          size="sm"
          disabled={!selectedRow}
          onClick={() => onApply(buildPayload(selectedRow))}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <Check className="w-3 h-3" />
          적용
        </Button>
      </div>
    </div>
  );
}
