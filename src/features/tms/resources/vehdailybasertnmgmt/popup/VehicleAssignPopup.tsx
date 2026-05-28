"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { vehicleDailyBaseRtnMgmtApi as api } from "../VehicleDailyBaseRtnMgmtApi";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { MENU_CODE } from "../VehicleDailyBaseRtnMgmt";

type VehicleAssignPopupProps = {
  initialValues?: Record<string, any>;
  onConfirm: (row: any) => void;
  onClose: () => void;
};

export default function VehicleAssignPopup({
  initialValues,
  onConfirm,
  onClose,
}: VehicleAssignPopupProps) {
  const [rows, setRows] = useState<any[]>([]);

  const [logisticGroupCode, setLogisticGroupCode] = useState(
    initialValues.LGST_GRP_CD,
  );
  const [logisticGroupName, setLogisticGroupName] = useState(
    initialValues.LGST_GRP_NM,
  );
  const [vehicleNo, setVehicleNo] = useState("");

  useEffect(() => {
    fetchData({
      LGST_GRP_CD: logisticGroupCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showError = useErrorAlert();
  const { openPopup, closePopup } = usePopup();

  const openLgstGrpPopup = useCallback(() => {
    openPopup({
      title: "LBL_OPARB_LGST_GRP_CD",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLogisticsgroupCodeName"
          onApply={(picked: any) => {
            setLogisticGroupCode(picked.CODE);
            setLogisticGroupName(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [closePopup, openPopup]);

  const fetchData = (extraParams: any) => {
    api
      .getVehicleCodeName({
        LGST_GRP_CD: logisticGroupCode,
        ...extraParams,
        MENU_CD: MENU_CODE,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? Lang.get("MSG_EXCEPTION_SEARCH"));
          return;
        } else {
          setRows(res.data?.data?.dsOut ?? res.data?.data?.dsOut ?? []);
        }
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            Lang.get("MSG_EXCEPTION_SEARCH"),
        );
      });
  };

  const onSearch = () => {
    fetchData({
      LGST_GRP_CD: logisticGroupCode,
      VEH_NO: vehicleNo,
    });
  };

  const fields: GridSearchField[] = useMemo(
    () => [
      {
        type: "popup",
        label: Lang.get("LBL_OPARB_LGST_GRP_CD"),
        code: logisticGroupCode,
        name: logisticGroupName,
        disable: true,
        onChangeCode: setLogisticGroupCode,
        onChangeName: setLogisticGroupName,
        onClickSearch: openLgstGrpPopup,
      },
      {
        label: Lang.get("LBL_VEH_NO"),
        value: vehicleNo,
        onChange: setVehicleNo,
      },
    ],
    [logisticGroupCode, logisticGroupName, openLgstGrpPopup, vehicleNo],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "No", width: 20 },
      {
        headerName: "LBL_VEHICLE_CODE",
        field: "CODE",
        sendField: "VEH_ID",
        width: 100,
      },
      {
        headerName: "LBL_VEH_NO",
        field: "NAME",
        sendField: "VEH_NO",
        width: 120,
      },
      {
        headerName: "LBL_VEHICLE_TYPE",
        sendField: "VEH_TP_CD",
        field: "VEH_TP_CD",
        width: 100,
      },
      {
        sendField: "DRVR_ID",
        field: "DRVR_ID",
        hide: true,
      },
      {
        headerName: "LBL_DRIVER_NM",
        sendField: "DRVR_NM",
        field: "DRVR_NM",
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
      gridHeight={350}
      selectedBadgeFields={["NAME", "DRVR_NM"]}
      rowSelection="single"
      onSearch={onSearch}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
