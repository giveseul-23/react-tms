"use client";

import { useEffect, useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { Lang } from "@/app/services/common/Lang";
import { itineraryApi } from "../ItineraryApi";

type Props = {
  lgstGrpCd: string;
  onApply: (itnrGrpCd: string) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { headerName: "No", width: 40 },
  { field: "LGST_GRP_CD", headerName: "LBL_LOGISTICS_GROUP_CODE", flex: 1 },
  {
    field: "ITNR_GRP_CD",
    headerName: "LBL_ITNR_GRP_CD",
    sendField: "ITNR_GRP_CD",
    flex: 1,
  },
  { field: "ITNR_GRP_NM", headerName: "LBL_ITNR_GRP_NM", flex: 1 },
  { field: "ITNR_GRP_ALIAS", headerName: "LBL_ITNR_GRP_ALIAS", flex: 1 },
];

export function ItineraryGroupPop({ lgstGrpCd, onApply, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [itnrGrpCd, setItnrGrpCd] = useState("");
  const [itnrGrpNm, setItnrGrpNm] = useState("");

  const handleSearch = async () => {
    const res: any = await itineraryApi.searchGroupPop({
      LGST_GRP_CD: lgstGrpCd,
      ITNR_GRP_CD: itnrGrpCd,
      ITNR_GRP_NM: itnrGrpNm,
    });
    setRows(res?.data?.data?.dsOut ?? []);
  };

  useEffect(() => {
    void handleSearch();
  }, []);

  const fields: GridSearchField[] = [
    {
      label: Lang.get("LBL_LOGISTICS_GROUP_CODE"),
      value: lgstGrpCd,
      onChange: () => { },
      disable: true,
    },
    {
      label: Lang.get("LBL_ITNR_GRP_CD"),
      value: itnrGrpCd,
      onChange: setItnrGrpCd,
      placeholder: Lang.get("LBL_INPUT"),
    },
    {
      label: Lang.get("LBL_ITNR_GRP_NM"),
      value: itnrGrpNm,
      onChange: setItnrGrpNm,
      placeholder: Lang.get("LBL_INPUT"),
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={COLUMN_DEFS}
      rows={rows}
      gridHeight={320}
      selectedBadgeFields={["ITNR_GRP_CD", "ITNR_GRP_NM"]}
      onSearch={handleSearch}
      onConfirm={(payload) => {
        const row = payload as Record<string, any>;
        if (!row?.ITNR_GRP_CD) return;
        onApply(String(row.ITNR_GRP_CD));
      }}
      onClose={onClose}
    />
  );
}
