"use client";

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

export default function CreateItineraryDispatchPop({
  onConfirm,
  onClose,
  initialValues = {},
}: Props) {
  const DIV_CD = initialValues["DIV_CD"];
  const DLVRY_DT = initialValues["DLVRY_DT"];
  const PLN_ID = initialValues["PLN_ID"];
  const LGST_GRP_CD = initialValues["LGST_GRP_CD"];

  const [rows, setRows] = useState<any[]>([]);
  const [itnrId, setItnrId] = useState("");
  const [itnrNm, setItnrNm] = useState("");

  const { codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  const showError = useErrorAlert();

  const fetchData = () => {
    api
      .searchItineraryDispatch({
        DIV_CD,
        LGST_GRP_CD,
        DLVRY_DT,
        PLN_ID,
        ITNR_ID: itnrId,
        ITNR_NM: itnrNm,
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
    { label: "LBL_ITINERARY_CODE", value: itnrId, onChange: setItnrId },
    { label: "LBL_ITINERARY_NAME", value: itnrNm, onChange: setItnrNm },
  ];

  const columnDefs = [
    { headerName: "No", width: 30 },
    { field: "DSPCH_TP", hide: true },
    { field: "VEH_TP_CD", hide: true },
    { field: "AP_PROC_TP", hide: true },
    { field: "CARR_CD", hide: true },
    { field: "VEH_OP_TP", hide: true },
    { field: "DRVR_ID", hide: true },
    { field: "DRVR_NM", hide: true },
    { field: "ASST_ID", hide: true },
    { field: "ASST_NM", hide: true },
    { field: "PLN_ID", hide: true },
    { field: "DLVRY_DT", hide: true },
    { field: "LOC_ID", hide: true },
    {
      headerName: "LBL_ITINERARY_CODE",
      field: "ITNR_ID",
    },
    {
      headerName: "LBL_ITINERARY_NAME",
      field: "ITNR_NM",
    },
    {
      headerName: "LBL_DEPARTURE_CODE",
      field: "LOC_CD",
    },
    {
      headerName: "LBL_DEPARTURE_NAME",
      field: "LOC_NM",
    },
    {
      headerName: "LBL_VEHICLE_CODE",
      field: "VEH_ID",
    },
    {
      headerName: "LBL_VEH_NO",
      field: "VEH_NO",
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
      selectedBadgeFields={["ITNR_ID", "ITNR_NM"]}
      selectPrompt="고정노선을 선택하세요"
      onSearch={fetchData}
      onConfirm={(payload) => onConfirm(payload as Record<string, any>[])}
      onClose={onClose}
    />
  );
}
