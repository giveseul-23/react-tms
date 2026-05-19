"use client";

import { useEffect, useState } from "react";
import { chgVehicleApi } from "@/features/tms/pln/tender/chgVehicleApi";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = useErrorAlert();

  const fetchData = (extraParams: any) => {
    chgVehicleApi
      .getDedTruckList({
        sesUserId: userId,
        userId,
        ACCESS_TOKEN,
        ...extraParams,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        }
        setRows(res.data.result ?? res.data.data ?? []);
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        );
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

  const fields: GridSearchField[] = [
    {
      label: "물류운영그룹코드",
      value: logisticsGroupCode,
      onChange: setLogisticsGroupCode,
      placeholder: "—",
    },
    {
      label: "운송협력사코드",
      value: carrierCode,
      onChange: setCarrierCode,
      placeholder: "—",
    },
    {
      label: "운송협력사명",
      value: carrierName,
      onChange: setCarrierName,
      placeholder: "—",
    },
    {
      label: "차량코드",
      value: vehicleCode,
      onChange: setVehicleCode,
      placeholder: "—",
    },
    {
      label: "차량유형코드",
      value: vehicleType,
      onChange: setVehicleType,
      placeholder: "—",
    },
    {
      label: "차량번호",
      value: vehicleNo,
      onChange: setVehicleNo,
      placeholder: "—",
    },
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

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      selectedBadgeFields={["VEH_NO", "CARR_NM", "DRVR_NM"]}
      selectedLabel="선택됨 ✓"
      onSearch={onSearch}
      onApply={onApply}
      onClose={onClose}
    />
  );
}
