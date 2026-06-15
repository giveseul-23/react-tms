"use client";

import { useEffect, useMemo, useState } from "react";
import { GridSearchPopupLayout, type GridSearchField } from "@/app/components/popup/GridSearchPopupLayout";
import { receiveShipmentManagementApi as api } from "../ReceiveShipmentManagementApi";

type Props = {
  onApply: (row: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const parseRows = (res: any) => res?.data?.data?.dsOut ?? res?.data?.result ?? [];

export default function ReceiveShipmentManagementLocationAddressPop({
  onApply,
  onClose,
  initialValues = {},
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [locCd, setLocCd] = useState(String(initialValues.LOC_CD ?? ""));
  const [locNm, setLocNm] = useState(String(initialValues.LOC_NM ?? ""));
  const [ctryCd, setCtryCd] = useState(String(initialValues.CTRY_CD ?? ""));
  const [ctryNm, setCtryNm] = useState(String(initialValues.CTRY_NM ?? ""));
  const [sttCd, setSttCd] = useState(String(initialValues.STT_CD ?? ""));
  const [sttNm, setSttNm] = useState(String(initialValues.STT_NM ?? ""));
  const [ctyCd, setCtyCd] = useState(String(initialValues.CTY_CD ?? ""));
  const [ctyNm, setCtyNm] = useState(String(initialValues.CTY_NM ?? ""));

  const fetchData = async () => {
    const res = await api.searchLocationAddressPop({
      LOC_CD: locCd,
      LOC_NM: locNm,
      CTRY_CD: ctryCd,
      CTRY_NM: ctryNm,
      STT_CD: sttCd,
      STT_NM: sttNm,
      CTY_CD: ctyCd,
      CTY_NM: ctyNm,
    });
    setRows(parseRows(res));
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields: GridSearchField[] = useMemo(
    () => [
      { label: "LBL_LOCATION_CODE", value: locCd, onChange: setLocCd },
      { label: "LBL_LOCATION_NAME", value: locNm, onChange: setLocNm },
      { label: "LBL_COUNTRY_CODE", value: ctryCd, onChange: setCtryCd },
      { label: "LBL_COUNTRY_NAME", value: ctryNm, onChange: setCtryNm },
      { label: "LBL_STATE_CODE", value: sttCd, onChange: setSttCd },
      { label: "LBL_STATE_NAME", value: sttNm, onChange: setSttNm },
      { label: "LBL_CITY_CODE", value: ctyCd, onChange: setCtyCd },
      { label: "LBL_CITY_NAME", value: ctyNm, onChange: setCtyNm },
    ],
    [ctryCd, ctryNm, ctyCd, ctyNm, locCd, locNm, sttCd, sttNm],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "No", width: 60 },
      { field: "LOC_ID", hide: true },
      { headerName: "LBL_LOCATION_CODE", field: "LOC_CD", width: 130 },
      { headerName: "LBL_LOCATION_NAME", field: "LOC_NM", width: 150 },
      { headerName: "LBL_COUNTRY_CODE", field: "CTRY_CD", width: 100 },
      { headerName: "LBL_COUNTRY_NAME", field: "CTRY_NM", width: 150 },
      { headerName: "LBL_STATE_CODE", field: "STT_CD", width: 100 },
      { headerName: "LBL_STATE_NAME", field: "STT_NM", width: 150 },
      { headerName: "LBL_CITY_CODE", field: "CTY_CD", width: 100 },
      { headerName: "LBL_CITY_NAME", field: "CTY_NM", width: 150 },
      { headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR1", width: 220 },
      { headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR2", width: 220 },
      { headerName: "LBL_ZIP_CODE", field: "ZIP_CD", width: 120 },
      { headerName: "LBL_LATITUDE", field: "LAT", width: 100 },
      { headerName: "LBL_LONGITUDE", field: "LON", width: 100 },
    ],
    [],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={360}
      selectedBadgeFields={["LOC_CD", "LOC_NM", "CTRY_NM"]}
      rowSelection="single"
      onSearch={() => void fetchData()}
      onConfirm={(row) => onApply(row)}
      onClose={onClose}
    />
  );
}