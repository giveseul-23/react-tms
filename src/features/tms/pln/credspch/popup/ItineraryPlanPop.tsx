"use client";

import { useEffect, useState } from "react";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { createDispatchApi } from "../CreateDispatchApi";

type ItineraryPlanPayload = {
  PAY_CARR_CD?: string;
  AP_PROC_TP?: string;
  VEH_TP_CD?: string;
  DRVR_ID?: string;
  DRVR_NM?: string;
  ASST_ID?: string;
  CARR_CD?: string;
  ITNR_ID?: string;
  VEH_ID?: string;
  VEH_NO?: string;
  ASST_NM?: string;
};

type Props = {
  initialValues?: {
    DIV_CD?: string;
    LGST_GRP_CD?: string;
    DLVRY_DT?: string;
    PLN_ID?: string;
    BATCH_NO?: string | number;
  };
  onConfirm: (payload: ItineraryPlanPayload) => void;
  onClose: () => void;
};

export default function ItineraryPlanPop({
  initialValues = {},
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [itnrId, setItnrId] = useState("");
  const [itnrNm, setItnrNm] = useState("");
  const showError = useErrorAlert();

  const fetchData = () => {
    createDispatchApi
      .searchItineraryPop({
        DIV_CD: initialValues.DIV_CD,
        LGST_GRP_CD: initialValues.LGST_GRP_CD,
        DLVRY_DT: initialValues.DLVRY_DT,
        PLN_ID: initialValues.PLN_ID,
        BATCH_NO: initialValues.BATCH_NO,
        ITNR_ID: itnrId,
        ITNR_NM: itnrNm,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "Search failed.");
          return;
        }
        setRows(res.data.result ?? res.data.data?.dsOut ?? []);
      })
      .catch((err: any) =>
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "Search failed.",
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
    { field: "PAY_CARR_CD", hide: true },
    { field: "AP_PROC_TP", hide: true },
    { field: "CARR_CD", hide: true },
    { field: "VEH_TP_CD", hide: true },
    { field: "DRVR_ID", hide: true },
    { field: "DRVR_NM", hide: true },
    { field: "ASST_ID", hide: true },
    { field: "ASST_NM", hide: true },
    { field: "LGST_GRP_CD", hide: true },
    { field: "DIV_CD", hide: true },
    { field: "PLN_ID", hide: true },
    { field: "LOC_ID", hide: true },
    {
      headerName: "LBL_ITINERARY_CODE",
      field: "ITNR_ID",
      align: "center",
      width: 130,
    },
    {
      headerName: "LBL_ITINERARY_NAME",
      field: "ITNR_NM",
      align: "left",
      width: 160,
    },
    {
      headerName: "LBL_DEPARTURE_CODE",
      field: "LOC_CD",
      align: "center",
      width: 120,
    },
    {
      headerName: "LBL_DEPARTURE_NAME",
      field: "LOC_NM",
      align: "left",
      width: 160,
    },
    {
      headerName: "LBL_VEHICLE_CODE",
      field: "VEH_ID",
      align: "center",
      width: 120,
    },
    {
      headerName: "LBL_VEH_NO",
      field: "VEH_NO",
      align: "center",
      width: 120,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      rowSelection="single"
      selectedBadgeFields={["ITNR_ID", "ITNR_NM", "VEH_NO"]}
      selectPrompt="Select an itinerary."
      onSearch={fetchData}
      onConfirm={(payload) => onConfirm(payload as ItineraryPlanPayload)}
      onClose={onClose}
    />
  );
}
