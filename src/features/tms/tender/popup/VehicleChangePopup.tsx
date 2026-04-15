"use client";

import { useEffect, useState } from "react";
import { Search, X, Check, Truck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { chgVehicleApi } from "@/features/tms/tender/chgVehicleApi";

const userId = sessionStorage.getItem("userId");
const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");

type VehicleChangePopupContentProps = {
  onApply: (row: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const vehicleOperType = "100";

export default function VehicleChangePopup({
  onApply,
  onClose,
  initialValues = {},
}: VehicleChangePopupContentProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [logisticsGroupCode, setLogisticsGroupCode] = useState(
    initialValues.LGST_GRP_CD ?? "",
  );
  const [carrierCode, setCarrierCode] = useState(initialValues.CARR_CD ?? "");
  const [carrierName, setCarrierName] = useState(initialValues.CARR_NM ?? "");
  const [vehicleCode, setVehicleCode] = useState(initialValues.VEH_ID ?? "");
  const [vehicleType, setVehicleType] = useState(initialValues.VEH_TP_CD ?? "");
  const [vehicleNo, setVehicleNo] = useState(initialValues.VEH_NO ?? "");

  useEffect(() => {
    fetchData({
      LGST_GRP_CD: logisticsGroupCode,
      VEH_OP_TP: vehicleOperType,
    });
  }, []);

  const fetchData = (extraParams: any) => {
    chgVehicleApi
      .getDedTruckList({
        sesUserId: userId,
        userId,
        ACCESS_TOKEN,
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
      LGST_GRP_CD: logisticsGroupCode,
      CARR_CD: carrierCode,
      CARR_NM: carrierName,
      VEH_ID: vehicleCode,
      VEH_TP_CD: vehicleType,
      VEH_NO: vehicleNo,
      VEH_OP_TP: vehicleOperType,
    });
  };

  const fields = [
    {
      label: "물류운영그룹코드",
      value: logisticsGroupCode,
      onChange: setLogisticsGroupCode,
    },
    { label: "운송협력사코드", value: carrierCode, onChange: setCarrierCode },
    { label: "운송협력사명", value: carrierName, onChange: setCarrierName },
    { label: "차량코드", value: vehicleCode, onChange: setVehicleCode },
    { label: "차량유형코드", value: vehicleType, onChange: setVehicleType },
    { label: "차량번호", value: vehicleNo, onChange: setVehicleNo },
  ];

  const columnDefs = [
    { headerName: "No", width: 30 },
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
      headerName: "운송협력사코드",
      field: "CARR_CD",
      sendField: "RETURN_CARR_CD",
      width: 130,
    },
    {
      headerName: "운송협력사명",
      field: "CARR_NM",
      sendField: "RETURN_CARR_NM",
      width: 160,
    },
    {
      headerName: "차량코드",
      field: "VEH_ID",
      sendField: "RETURN_VEH_ID",
      width: 110,
    },
    {
      headerName: "차량번호",
      field: "VEH_NO",
      sendField: "RETURN_VEH_NO",
      width: 130,
    },
    {
      headerName: "차량유형",
      field: "VEH_TP_CD",
      sendField: "RETURN_VEH_TP_CD",
      width: 130,
    },
    {
      headerName: "차량유형명",
      field: "VEH_TP_NM",
      sendField: "RETURN_VEH_TP_NM",
      width: 130,
    },
    {
      headerName: "운전자아이디",
      field: "DRVR_ID",
      sendField: "RETURN_DRVR_ID",
      width: 110,
    },
    {
      headerName: "운전자명",
      field: "DRVR_NM",
      sendField: "RETURN_DRVR_NM",
      width: 110,
    },
    {
      headerName: "축종",
      field: "AXLE_TYPE",
      sendField: "RETURN_AXLE_TYPE",
      width: 90,
    },
  ];

  const buildPayload = (row: any) => {
    return columnDefs.reduce(
      (acc, col) => {
        const sendKey = (col as any).sendField ?? col.field;
        if (sendKey && col.field) {
          acc[sendKey] = row[col.field];
        }

        acc.CHGVEH_MEMO = "운송사협력사 요청건";
        return acc;
      },
      {} as Record<string, any>,
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* ── 조회 조건 ── */}
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

        {/* 필드 — 테이블형 레이아웃 */}
        <div className="grid grid-cols-3 divide-x divide-y divide-slate-100">
          {fields.map((f) => (
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
                placeholder="—"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 선택 상태 표시 ── */}
      {selectedRow ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
          <Truck className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span className="font-semibold">{selectedRow.VEH_NO}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow.CARR_NM}</span>
          <span className="text-blue-300">|</span>
          <span>{selectedRow.DRVR_NM}</span>
          <span className="ml-auto text-[10px] text-blue-400 font-medium">
            선택됨 ✓
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400">
          <Truck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>그리드에서 차량을 선택하세요</span>
        </div>
      )}

      {/* ── Grid ── */}
      <div className="h-[400px] shrink-0">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={columnDefs}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
          disableAutoSize={true}
        />
      </div>

      {/* ── 버튼 영역 ── */}
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
