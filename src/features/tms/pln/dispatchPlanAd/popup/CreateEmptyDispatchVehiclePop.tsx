"use client";

// 배차생성(공차배차) 팝업 — 조회조건(부서/운영그룹/배송일/계획ID) 기준 배차 가능 차량 선택.
// 서버 CreateEmptyDispatchVehiclePop 대응. 다중선택 → 부모가 /saveCreateEmptyDispatch.
//   조회: /dispatchPlanService/searchEmptyDispatchVehiclePop (VEH_OP_TP 100/110/999)

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { dispatchPlanApi as api } from "../dispatchPlanApi";

type Props = {
  onConfirm: (payload: Record<string, any>[]) => void;
  onClose: () => void;
  // 본 화면 조회조건: DIV_CD / LGST_GRP_CD / DLVRY_DT / DSPCH_TP / PLN_ID
  initialValues?: Record<string, any>;
};

export default function CreateEmptyDispatchVehiclePop({
  onConfirm,
  onClose,
  initialValues = {},
}: Props) {
  const LGST_GRP_CD = initialValues.LGST_GRP_CD ?? "";

  const [rows, setRows] = useState<any[]>([]);
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehId, setVehId] = useState("");
  const [vehTpCd, setVehTpCd] = useState("");
  const [vehNo, setVehNo] = useState("");
  const [vehOpTp, setVehOpTp] = useState<string>("100");

  const { stores, codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  const showError = useErrorAlert();

  const fetchData = () => {
    api
      .searchEmptyDispatchVehicle({
        LGST_GRP_CD,
        CARR_CD: carrCd,
        CARR_NM: carrNm,
        VEH_ID: vehId,
        VEH_TP_CD: vehTpCd,
        VEH_NO: vehNo,
        VEH_OP_TP: vehOpTp,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        }
        setRows(res.data.result ?? res.data.data?.dsOut ?? []);
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        ),
      );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields: GridSearchField[] = [
    {
      label: "차량운영유형",
      value: vehOpTp,
      onChange: setVehOpTp,
      type: "combo",
      options: stores.vehOpTp,
      placeholder: "선택",
    },
    { label: "운송사코드", value: carrCd, onChange: setCarrCd },
    { label: "운송사명", value: carrNm, onChange: setCarrNm },
    { label: "차량코드", value: vehId, onChange: setVehId },
    { label: "차량유형코드", value: vehTpCd, onChange: setVehTpCd },
    { label: "차량번호", value: vehNo, onChange: setVehNo },
  ];

  const columnDefs = [
    { headerName: "No", width: 30 },
    { field: "VEH_TP_CD", sendField: "VEH_TP_CD", hide: true },
    { field: "DRVR_ID", sendField: "DRVR_ID", hide: true },
    {
      headerName: "LBL_CARRIER_CODE",
      field: "CARR_CD",
      sendField: "CARR_CD",
      width: 110,
    },
    {
      headerName: "LBL_CARRIER_NAME",
      field: "CARR_NM",
      sendField: "CARR_NM",
      width: 140,
    },
    {
      headerName: "LBL_VEHICLE_CODE",
      field: "VEH_ID",
      sendField: "VEH_ID",
      width: 110,
    },
    {
      headerName: "LBL_VEH_NO",
      field: "VEH_NO",
      sendField: "VEH_NO",
      width: 110,
    },
    {
      headerName: "LBL_VEHICLE_TYPE_NAME",
      field: "VEH_TP_NM",
      sendField: "VEH_TP_NM",
      width: 120,
    },
    {
      headerName: "LBL_DRIVER_NAME",
      field: "DRVR_NM",
      sendField: "DRVR_NM",
      width: 100,
    },
    {
      headerName: "LBL_VEHICLE_OPERATION_TYPE",
      field: "VEH_OP_TP",
      sendField: "VEH_OP_TP",
      codeKey: "vehOpTp",
      width: 110,
    },
    {
      headerName: "LBL_AP_CLASSIFICATION",
      field: "AP_PROC_TP",
      sendField: "AP_PROC_TP",
      codeKey: "apProcTp",
      width: 110,
    },
    {
      headerName: "LBL_HELPER_CODE",
      field: "ASST_ID",
      sendField: "ASST_ID",
      width: 100,
    },
    {
      headerName: "LBL_HELPER_NAME",
      field: "ASST_NM",
      sendField: "ASST_NM",
      width: 100,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      codeMap={codeMap}
      rowSelection="multiple"
      selectedBadgeFields={["VEH_NO", "VEH_TP_NM", "CARR_NM"]}
      onSearch={fetchData}
      onConfirm={(payload) => onConfirm(payload as Record<string, any>[])}
      onClose={onClose}
    />
  );
}
