"use client";

import { useEffect, useState } from "react";
import { chgVehicleApi } from "@/features/tms/pln/tender/chgVehicleApi";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { stores } = useCommonStores({
    preferredZone: {
      sqlProp: "CODE",
      keyParam: "PREFERRED ZONE CD",
    },
  });

  const showError = useErrorAlert();

  const fetchData = (extraParams: any) => {
    chgVehicleApi
      .getConTruckList({
        VEH_OP_TP: vehicleOperType,
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
      VEH_CD: vehicleCode,
      VEH_TP_CD: vehicleType,
      VEH_NO: vehicleNo,
      DRVR_NM: driverName,
      PRFRD_ZN_CD1: region1,
      PRFRD_ZN_CD2: region2,
    });
  };

  const fields: GridSearchField[] = [
    { label: "차량코드", value: vehicleCode, onChange: setVehicleCode },
    { label: "차량유형", value: vehicleType, onChange: setVehicleType },
    { label: "차량번호", value: vehicleNo, onChange: setVehicleNo },
    { label: "운전자명", value: driverName, onChange: setDriverName },
    {
      label: "선호권역1",
      value: region1,
      onChange: setRegion1,
      type: "combo",
      options: stores.preferredZone,
      placeholder: "선택",
    },
    {
      label: "선호권역2",
      value: region2,
      onChange: setRegion2,
      type: "combo",
      options: stores.preferredZone,
      placeholder: "선택",
    },
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

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={350}
      selectedBadgeFields={["VEH_NO", "DRVR_NM", "VEH_TP_NM"]}
      onSearch={onSearch}
      onApply={onApply}
      onClose={onClose}
    />
  );
}
