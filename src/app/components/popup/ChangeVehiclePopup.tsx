"use client";

// 차량변경 공통 팝업 — 등록차량(지입)/용차/가상차량 중 선택해 배차 차량을 교체.
//  서버 조회: /dispatchPlanService/searchDispatchChangeVehiclePop (VEH_OP_TP 별).
//  조회 호출은 화면마다 다르므로 fetchVehicles 를 주입받는다(여러 화면 공용).
//  선택 차량 필드를 onConfirm payload 로 반환 → 부모가 후처리(저장/다음 팝업).

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";

type Props = {
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
  /** 변경 가능 차량 목록 조회 (화면 api 주입) */
  fetchVehicles: (params: Record<string, any>) => Promise<any>;
  // LGST_GRP_CD / DSPCH_NO / ORG_VEH_ID(변경 전 차량) / showType
  initialValues?: Record<string, any>;
  /** 지정 시 차량운영유형을 이 값으로 고정(잠금) — 다른 유형 조회 불가. 예: "100"(지입차). */
  lockVehOpTp?: string;
};

export default function ChangeVehiclePopup({
  onConfirm,
  onClose,
  fetchVehicles,
  initialValues = {},
  lockVehOpTp,
}: Props) {
  const LGST_GRP_CD = initialValues.LGST_GRP_CD ?? "";
  const DSPCH_NO = initialValues.DSPCH_NO ?? "";
  const ORG_VEH_ID = initialValues.ORG_VEH_ID ?? "";

  const [rows, setRows] = useState<any[]>([]);
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehId, setVehId] = useState("");
  const [vehTpCd, setVehTpCd] = useState("");
  const [vehNo, setVehNo] = useState("");
  // 차량운영유형 — 지입(100)/용차(110)/가상(999). lockVehOpTp 지정 시 그 값으로 고정.
  const [vehOpTp, setVehOpTp] = useState<string>(
    lockVehOpTp ?? initialValues.showType ?? "100",
  );

  const { stores, codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  const showError = useErrorAlert();

  const fetchData = () => {
    fetchVehicles({
      LGST_GRP_CD,
      DSPCH_NO,
      ORG_VEH_ID,
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
      // 잠금 시 지정 유형만 조회 (변경 불가)
      disable: !!lockVehOpTp,
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
      field: "PAY_CARR_CD",
      sendField: "PAY_CARR_CD",
      hide: true,
    },
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
