"use client";

import { useEffect, useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { Lang } from "@/app/services/common/Lang";
import { stoShipmentManagementApi as api } from "../StoShipmentManagementApi";

type Props = {
  divCd?: string;
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

export default function LocPlantPop({ divCd, onConfirm, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [plantCd, setPlantCd] = useState("");
  const [plantNm, setPlantNm] = useState("");

  const fetchData = () => {
    api
      .searchLocPlantPop({
        PLANT_CD: plantCd,
        PLANT_NM: plantNm,
        DIV_CD: divCd,
      })
      .then((res: any) => {
        setRows(res.data?.result ?? res.data?.data?.dsOut ?? []);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields: GridSearchField[] = [
    { label: "LBL_PLANT_CD", value: plantCd, onChange: setPlantCd },
    { label: "LBL_PLANT_NM", value: plantNm, onChange: setPlantNm },
  ];

  const columnDefs = [
    { field: "LOC_ID", sendField: "LOC_ID", hide: true },
    { field: "BP_NM", sendField: "BP_NM", hide: true },
    {
      headerName: "LBL_CODE",
      field: "PLANT_CD",
      sendField: "PLANT_CD",
      align: "center",
      flex: 1,
    },
    {
      headerName: "LBL_CODE_NM",
      field: "PLANT_NM",
      sendField: "PLANT_NM",
      flex: 1,
    },
    {
      headerName: "LBL_SLOC_CD",
      field: "SLOC_CD",
      sendField: "SLOC_CD",
      align: "center",
      flex: 1,
    },
    {
      headerName: "LBL_SLOC_NM",
      field: "SLOC_NM",
      sendField: "SLOC_NM",
      flex: 1,
    },
    {
      headerName: "LBL_BP_CD",
      field: "BP_CD",
      sendField: "BP_CD",
      align: "center",
      flex: 1,
    },
    {
      headerName: "LBL_ADDR",
      field: "DTL_ADDR1",
      sendField: "DTL_ADDR1",
      flex: 1,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={340}
      selectedBadgeFields={["PLANT_CD", "PLANT_NM", "BP_CD"]}
      onSearch={fetchData}
      onConfirm={(payload) => {
        const picked = payload as Record<string, any>;
        if (!picked.BP_CD) {
          showInfoModal(Lang.get("MSG_SELECT_NO_DATA"));
          return;
        }
        onConfirm(picked);
      }}
      onClose={onClose}
    />
  );
}
