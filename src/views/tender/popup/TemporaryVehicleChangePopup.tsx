"use client";

import { useState } from "react";

type TemporaryVehicleChangeContentProps = {
  defaultVehicleType?: string;
  defaultCarrierName?: string;
  onConfirm: (data: {
    vehicleNo: string;
    driverName: string;
    driverPhone: string;
  }) => void;
  onClose: () => void;
};

export default function TemporaryVehicleChangePopup({
  defaultVehicleType = "1톤레미콘",
  defaultCarrierName = "",
  onConfirm,
  onClose,
}: TemporaryVehicleChangeContentProps) {
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const isValid = vehicleNo && driverName && driverPhone;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 카드 */}
      <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {/* 차량유형명 */}
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            차량유형명
          </label>
          <input
            value={defaultVehicleType}
            disabled
            className="col-span-2 h-10 rounded-lg border border-gray-300 bg-gray-200 px-3 text-sm"
          />
        </div>

        {/* 운송협력사명 */}
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            운송협력사명
          </label>
          <input
            value={defaultCarrierName}
            disabled
            className="col-span-2 h-10 rounded-lg border border-gray-300 bg-gray-200 px-3 text-sm"
          />
        </div>

        {/* 차량번호 */}
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">차량번호</label>
          <input
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 운전자명 */}
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">운전자명</label>
          <input
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 운전자전화번호 */}
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            운전자전화번호
          </label>
          <input
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder='"-" 를 빼고 작성하세요.'
            className="col-span-2 h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          취소
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={() =>
            onConfirm({
              vehicleNo,
              driverName,
              driverPhone,
            })
          }
          className="flex-1 h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 transition"
        >
          저장
        </button>
      </div>
    </div>
  );
}
