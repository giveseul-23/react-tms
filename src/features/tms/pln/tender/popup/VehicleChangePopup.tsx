"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { chgVehicleApi as api } from "../chgVehicleApi";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";

type VehicleChangePopupContentProps = {
  onConfirm: (row: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const vehicleOperType = "100";

export default function VehicleChangePopup({
  onConfirm,
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

  const { codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });
  const showError = useErrorAlert();

  const fetchData = useCallback(
    (extraParams: any) => {
      api
        .getDedTruckList({
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
    fetchData({
      LGST_GRP_CD: logisticsGroupCode,
      VEH_OP_TP: vehicleOperType,
    });
  }, [fetchData, logisticsGroupCode]);

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

  const fields: GridSearchField[] = useMemo(
    () => [
      {
        label: "LBL_LOGISTICS_GROUP_CODE",
        value: logisticsGroupCode,
        onChange: setLogisticsGroupCode,
        disable: true,
      },
      {
        label: "LBL_CARRIER_CODE",
        value: carrierCode,
        onChange: setCarrierCode,
      },
      {
        label: "LBL_CARRIER_NAME",
        value: carrierName,
        onChange: setCarrierName,
      },
      {
        label: "LBL_VEHICLE_CODE",
        value: vehicleCode,
        onChange: setVehicleCode,
      },
      {
        label: "LBL_VEHICLE_TYPE_CODE",
        value: vehicleType,
        onChange: setVehicleType,
      },
      {
        label: "LBL_VEH_NO",
        value: vehicleNo,
        onChange: setVehicleNo,
      },
    ],
    [
      logisticsGroupCode,
      carrierCode,
      carrierName,
      vehicleCode,
      vehicleType,
      vehicleNo,
    ],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "No", width: 30 },
      { field: "VEH_TP_CD", sendField: "VEH_TP_CD", hide: true },
      { field: "DRVR_ID", sendField: "DRVR_ID", hide: true },
      { field: "LGST_GRP_CD", sendField: "RETURN_LGST_GRP_CD", hide: true },
      { field: "DIV_CD", sendField: "RETURN_DIV_CD", hide: true },
      {
        headerName: "LBL_CARRIER_CODE",
        field: "CARR_CD",
        sendField: "RETURN_CARR_CD",
        width: 110,
      },
      {
        headerName: "LBL_CARRIER_NAME",
        field: "CARR_NM",
        sendField: "RETURN_CARR_NM",
        width: 140,
      },
      {
        headerName: "LBL_VEHICLE_CODE",
        field: "VEH_ID",
        sendField: "RETURN_VEH_ID",
        width: 110,
      },
      {
        headerName: "LBL_VEH_NO",
        field: "VEH_NO",
        sendField: "RETURN_VEH_NO",
        width: 110,
      },
      {
        headerName: "LBL_VEHICLE_TYPE_NAME",
        field: "VEH_TP_NM",
        sendField: "RETURN_VEH_TP_NM",
        width: 120,
      },
      {
        headerName: "LBL_DRIVER_NAME",
        field: "DRVR_NM",
        sendField: "RETURN_DRVR_NM",
        width: 100,
      },
      {
        headerName: "LBL_VEHICLE_OPERATION_TYPE",
        field: "VEH_OP_TP",
        sendField: "RETURN_VEH_OP_TP",
        codeKey: "vehOpTp",
        width: 110,
      },
      {
        headerName: "LBL_AP_CLASSIFICATION",
        field: "AP_PROC_TP",
        sendField: "RETURN_AP_PROC_TP",
        codeKey: "apProcTp",
        width: 110,
      },
      {
        headerName: "LBL_HELPER_CODE",
        field: "ASST_ID",
        sendField: "RETURN_ASST_ID",
        width: 100,
      },
      {
        headerName: "LBL_HELPER_NAME",
        field: "ASST_NM",
        sendField: "RETURN_ASST_NM",
        width: 100,
      },
    ],
    [],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      codeMap={codeMap}
      rowSelection="single"
      selectedBadgeFields={["VEH_NO", "VEH_TP_NM", "CARR_NM"]}
      onSearch={onSearch}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
