"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import DataGrid from "@/app/components/grid/DataGrid";
import { commonApi } from "@/app/services/common/commonApi";

const userId = sessionStorage.getItem("userId");
const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");

type VehicleChangePopupContentProps = {
  onApply: (row: any) => void;
  onClose: () => void;
};

export default function VehicleChangePopup({
  onApply,
  onClose,
}: VehicleChangePopupContentProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [logisticsGroupCode, setLogisticsGroupCode] = useState("");
  const [carrierCode, setCarrierCode] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [vehicleCode, setVehicleCode] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");

  /* ================= 초기 조회 ================= */
  useEffect(() => {
    fetchData({});
  }, []);

  const fetchData = (extraParams: any) => {
    commonApi
      .getCodesAndNames({
        sesUserId: userId,
        userId,
        sqlProp: "VEHICLE_CHANGE_LIST",
        ACCESS_TOKEN,
        ...extraParams,
      })
      .then((res: any) => {
        setRows(res.data.result ?? []);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const onSearch = () => {
    fetchData({
      logisticsGroupCode,
      carrierCode,
      carrierName,
      vehicleCode,
      vehicleType,
      vehicleNo,
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* ================= 검색 영역 ================= */}
      <div className="bg-gray-50 rounded-xl p-2 border space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="물류운영그룹코드"
            value={logisticsGroupCode}
            onChange={(e: any) => setLogisticsGroupCode(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
          <Input
            placeholder="운송협력사코드"
            value={carrierCode}
            onChange={(e: any) => setCarrierCode(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
          <Input
            placeholder="운송협력사명"
            value={carrierName}
            onChange={(e: any) => setCarrierName(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
          <Input
            placeholder="차량코드"
            value={vehicleCode}
            onChange={(e: any) => setVehicleCode(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
          <Input
            placeholder="차량유형코드"
            value={vehicleType}
            onChange={(e: any) => setVehicleType(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
          <Input
            placeholder="차량번호"
            value={vehicleNo}
            onChange={(e: any) => setVehicleNo(e.target.value)}
            className="w-full pr-7 pl-2 text-[11px] h-7"
          />
        </div>
        <div className="flex justify-end">
          <Button size="xs" variant="outline" onClick={onSearch}>
            <Search className="w-4 h-4 mr-1" />
            조회
          </Button>
        </div>
      </div>

      {/* ================= Grid ================= */}
      <div className="flex-1 min-h-[350px]">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={[
            { headerName: "No", width: 60 },
            { headerName: "운송협력사코드", field: "CARR_CD", width: 140 },
            { headerName: "운송협력사명", field: "CARR_NM", width: 180 },
            { headerName: "차량코드", field: "VEH_ID", width: 120 },
            { headerName: "차량번호", field: "VEH_NO", width: 140 },
            { headerName: "차량유형명", field: "VEH_TP_NM", width: 140 },
            { headerName: "운전자명", field: "DRVR_NM", width: 120 },
            { headerName: "축종", field: "AXLE_TYPE", width: 100 },
          ]}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
          disableAutoSize={true}
        />
      </div>

      {/* ================= 버튼 영역 ================= */}
      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button
          size="sm"
          variant="outline"
          disabled={!selectedRow}
          onClick={() => onApply(selectedRow)}
        >
          적용
        </Button>
        <Button size="sm" variant="outline" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}
