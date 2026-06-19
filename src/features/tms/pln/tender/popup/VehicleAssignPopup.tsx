"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { chgVehicleApi as api } from "../chgVehicleApi";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";

type VehicleAssignPopupProps = {
  onConfirm: (row: any) => void;
  onClose: () => void;
};

const vehicleOperType = "110";

export default function VehicleAssignPopup({
  onConfirm,
  onClose,
}: VehicleAssignPopupProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [vehicleCode, setVehicleCode] = useState("");
  const [vehicleTypeName, setVehicleTypeName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [region1, setRegion1] = useState("");
  const [region2, setRegion2] = useState("");

  const { stores } = useCommonStores({
    preferredZone: {
      sqlProp: "CODE",
      keyParam: "PREFERRED ZONE CD",
    },
  });
  const showError = useErrorAlert();

  const fetchData = useCallback(
    (extraParams: any) => {
      api
        .getConTruckList({
          VEH_OP_TP: vehicleOperType,
          ...extraParams,
        })
        .then((res: any) => {
          if (res?.data?.success === false) {
            showError(res.data?.msg ?? "조회에 실패했습니다.");
            return;
          }
          setRows(res.data?.data?.dsOut ?? res.data?.result ?? []);
        })
        .catch((err: any) => {
          showError(
            err?.response?.data?.error?.message ??
              err?.message ??
              "조회에 실패했습니다.",
          );
        });
    },
    [showError],
  );

  useEffect(() => {
    fetchData({ VEH_OP_TP: vehicleOperType });
  }, [fetchData]);

  const onSearch = () => {
    fetchData({
      VEH_ID: vehicleCode,
      VEH_TP_NM: vehicleTypeName,
      VEH_NO: vehicleNo,
      DRVR_NM: driverName,
      PRFRD_ZN_CD1: region1,
      PRFRD_ZN_CD2: region2,
    });
  };

  const fields: GridSearchField[] = useMemo(
    () => [
      { label: "LBL_VEHICLE_CODE", value: vehicleCode, onChange: setVehicleCode },
      {
        label: "LBL_VEHICLE_TYPE_NAME",
        value: vehicleTypeName,
        onChange: setVehicleTypeName,
      },
      { label: "LBL_VEH_NO", value: vehicleNo, onChange: setVehicleNo },
      { label: "LBL_DRIVER_NAME", value: driverName, onChange: setDriverName },
      {
        label: "LBL_PREFERRED ZONE1",
        value: region1,
        onChange: setRegion1,
        type: "combo",
        options: stores.preferredZone,
        placeholder: "선택",
      },
      {
        label: "LBL_PREFERRED ZONE2",
        value: region2,
        onChange: setRegion2,
        type: "combo",
        options: stores.preferredZone,
        placeholder: "선택",
      },
    ],
    [
      vehicleCode,
      vehicleTypeName,
      vehicleNo,
      driverName,
      region1,
      region2,
      stores.preferredZone,
    ],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "No", width: 20 },
      { field: "LGST_GRP_CD", sendField: "RETURN_LGST_GRP_CD", hide: true },
      { field: "DIV_CD", sendField: "RETURN_DIV_CD", hide: true },
      { field: "VEH_ID", sendField: "RETURN_VEH_ID", hide: true },
      { field: "CARR_CD", sendField: "RETURN_CARR_CD", hide: true },
      { field: "CARR_NM", sendField: "RETURN_CARR_NM", hide: true },
      { field: "VEH_TP_CD", sendField: "RETURN_VEH_TP_CD", hide: true },
      { field: "AP_PROC_TP", sendField: "RETURN_AP_PROC_TP", hide: true },
      { field: "VEH_OP_TP", sendField: "RETURN_VEH_OP_TP", hide: true },
      {
        headerName: "LBL_VEH_NO",
        sendField: "RETURN_VEH_NO",
        field: "VEH_NO",
        width: 120,
      },
      { sendField: "RETURN_DRVR_ID", field: "DRVR_ID", hide: true },
      {
        headerName: "LBL_DRIVER_NAME",
        sendField: "RETURN_DRVR_NM",
        field: "DRVR_NM",
        width: 120,
      },
      {
        headerName: "LBL_VEHICLE_TYPE_NAME",
        sendField: "RETURN_VEH_TP_NM",
        field: "VEH_TP_NM",
        width: 120,
      },
      { field: "PRFRD_ZN_CD1", sendField: "RETURN_PRFRD_ZN_CD1", hide: true },
      { field: "PRFRD_ZN_CD2", sendField: "RETURN_PRFRD_ZN_CD2", hide: true },
      { headerName: "LBL_PREFERRED ZONE1", field: "PRFRD_ZN_NM1", width: 120 },
      { headerName: "LBL_PREFERRED ZONE2", field: "PRFRD_ZN_NM2", width: 120 },
    ],
    [],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={350}
      selectedBadgeFields={["VEH_NO", "DRVR_NM", "VEH_TP_NM"]}
      rowSelection="single"
      onSearch={onSearch}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
