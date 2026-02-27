"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import DataGrid from "@/app/components/grid/DataGrid";
import { commonApi } from "@/app/services/common/commonApi";
import { ComboFilter } from "@/app/components/Search/filters/comboFilter";

const userId = sessionStorage.getItem("userId");
const ACCESS_TOKEN = sessionStorage.getItem("ACCESS_TOKEN");

type VehicleAssignPopupProps = {
  onApply: (row: any) => void;
  onClose: () => void;
};

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
    fetchData({});
  }, []);

  const fetchData = (params: any) => {
    commonApi
      .getCodesAndNames({
        sesUserId: userId,
        userId,
        sqlProp: "VEHICLE_ASSIGN_LIST",
        ACCESS_TOKEN,
        ...params,
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
      vehicleCode,
      vehicleType,
      vehicleNo,
      driverName,
      region1,
      region2,
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* ================= 검색 영역 ================= */}
      <div className="bg-gray-20 rounded-lg p-3 border">
        <div className="grid grid-cols-4 gap-3 items-center text-[12px]">
          <Input
            placeholder="차량코드"
            value={vehicleCode}
            onChange={(e: any) => setVehicleCode(e.target.value)}
            className="h-6"
          />

          <Input
            placeholder="차량유형명"
            value={vehicleType}
            onChange={(e: any) => setVehicleType(e.target.value)}
            className="h-6"
          />

          <Input
            placeholder="차량번호"
            value={vehicleNo}
            onChange={(e: any) => setVehicleNo(e.target.value)}
            className="h-6"
          />

          <Input
            placeholder="운전자명"
            value={driverName}
            onChange={(e: any) => setDriverName(e.target.value)}
            className="h-6"
          />
          <ComboFilter
            placeholder="선호권역1"
            value={region1}
            onChange={(value) => setRegion1(value)}
            inputClassName="h-6 text-[13px]"
          />
          <ComboFilter
            placeholder="선호권역2"
            value={region2}
            onChange={(value) => setRegion2(value)}
            inputClassName="h-6 text-[13px]"
          />
          <div className="col-span-4 flex justify-end pt-1">
            <Button size="xs" variant="outline" onClick={onSearch}>
              <Search className="w-3 h-3 mr-1" />
              조회
            </Button>
          </div>
        </div>
      </div>

      {/* ================= 탭 영역 ================= */}
      <div className="border-b text-sm font-medium text-gray-700 pb-1">
        용차
      </div>

      {/* ================= Grid ================= */}
      <div className="flex-1 min-h-[280px]">
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={[
            { headerName: "No", width: 60 },
            { headerName: "차량번호", field: "VEH_NO", width: 120 },
            { headerName: "운전자명", field: "DRVR_NM", width: 120 },
            { headerName: "차량유형명", field: "VEH_TP_NM", width: 120 },
            { headerName: "선호권역1", field: "REGION1", width: 120 },
            { headerName: "선호권역2", field: "REGION2", width: 120 },
          ]}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelectedRow(row)}
          disableAutoSize
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
          저장
        </Button>

        <Button size="sm" variant="outline" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}
