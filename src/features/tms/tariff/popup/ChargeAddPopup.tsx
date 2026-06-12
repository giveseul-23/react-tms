"use client";

import { useEffect, useMemo, useState } from "react";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { chargeApi as api } from "@/features/tms/tariff/assignunit/charge/ChargeApi";

export type ChargeAddPopupProps = {
  menuCode: string;
  divCd: string;
  lgstGrpCd: string;
  onApply: (picked: Record<string, any> | Record<string, any>[]) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { headerName: "No", width: 50 },
  {
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    width: 90,
    align: "center",
  },
  {
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    width: 100,
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    width: 120,
    align: "center",
  },
  {
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    width: 120,
  },
  {
    headerName: "LBL_TARIFF_CODE",
    field: "TRF_CD",
    width: 150,
    align: "center",
  },
  {
    headerName: "LBL_TARIFF_NAME",
    field: "TRF_NM",
    flex: 1,
    minWidth: 180,
  },
];

export default function ChargeAddPopup({
  menuCode,
  divCd,
  lgstGrpCd,
  onApply,
  onClose,
}: ChargeAddPopupProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [trfCd, setTrfCd] = useState("");
  const [trfNm, setTrfNm] = useState("");
  const showError = useErrorAlert();

  const fetchData = () => {
    api.searchTariffPopup(menuCode, {
      DIV_CD: divCd,
      LGST_GRP_CD: lgstGrpCd,
      TRF_CD: trfCd,
      TRF_NM: trfNm,
    })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        }
        setRows(res.data?.data?.dsOut ?? []);
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        );
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => {
    fetchData();
  };

  const fields: GridSearchField[] = useMemo(
    () => [
      {
        label: "LBL_TARIFF_CODE",
        value: trfCd,
        onChange: setTrfCd,
      },
      {
        label: "LBL_TARIFF_NAME",
        value: trfNm,
        onChange: setTrfNm,
      },
    ],
    [trfCd, trfNm],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={COLUMN_DEFS}
      rows={rows}
      gridHeight={350}
      selectedBadgeFields={["TRF_CD"]}
      rowSelection="multiple"
      onSearch={onSearch}
      onConfirm={onApply}
      onClose={onClose}
    />
  );
}
