"use client";

// 차량변경 팝업 — 등록차량(지입)/용차/가상차량 중 선택해 배차 차량을 교체.
// 서버 DispatchPlanController.popChangeVeh + ChangeVehiclePop 대응.
//   조회: /dispatchPlanService/searchDispatchChangeVehiclePop (VEH_OP_TP 별)
//   선택 차량 필드를 onConfirm payload 로 반환 → 부모가 saveChangeVehicle 호출.

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { dispatchPlanApi as api } from "../../dispatchPlanAd/dispatchPlanApi";

type Props = {
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
  // popChangeVeh 가 넘기는 값: LGST_GRP_CD / DSPCH_NO / ORG_VEH_ID(변경 전 차량) / showType
  initialValues?: Record<string, any>;
};

export default function ChangeVehiclePop({
  onConfirm,
  onClose,
  initialValues = {},
}: Props) {
  const LGST_GRP_CD = initialValues.LGST_GRP_CD ?? "";
  const DSPCH_NO = initialValues.DSPCH_NO ?? "";

  const [rows, setRows] = useState<any[]>([]);
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehId, setVehId] = useState("");
  const [vehTpCd, setVehTpCd] = useState("");
  const [vehNo, setVehNo] = useState("");
  // 차량운영유형 — 지입(100)/용차(110)/가상(999). 기본은 호출측 showType 또는 지입.
  const [vehOpTp, setVehOpTp] = useState<string>(
    initialValues.showType ?? "100",
  );

  const { stores, codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  const showError = useErrorAlert();

  const fetchData = () => {
    api
      .searchChangeVehicle({
        LGST_GRP_CD,
        DSPCH_NO,
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

  // 진입 시 1회 조회 (현재 VEH_OP_TP 기준)
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

  // sendField 로 선택 차량 필드를 그대로 payload 키에 매핑 → 부모가 배차 행에 머지.
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
      selectedBadgeFields={["VEH_NO", "VEH_TP_NM", "CARR_NM"]}
      onSearch={fetchData}
      onConfirm={(payload) => onConfirm(payload as Record<string, any>)}
      onClose={onClose}
    />
  );
}
