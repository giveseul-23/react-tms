"use client";

// 매출계약 할증 추가 팝업 (센차 AccountReceivableSubChargeAddPopup)
// 청구요율 항목(라인) 검색 → 단건 선택해 부모에 전달(메인행 생성용).

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { accountReceivableSubChargeManagementApi as api } from "../AccountReceivableSubChargeManagementApi";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";
import { useCommonStores } from "@/hooks/useCommonStores";

type Props = {
  onConfirm: (row: any) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    align: "center",
    width: 100,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
    width: 120,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_CODE",
    field: "CUST_CNTRCT_CD",
    align: "center",
    width: 105,
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_NAME",
    field: "CUST_CNTRCT_NM",
    width: 130,
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
    field: "AR_TRF_CD",
    align: "center",
    width: 115,
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
    field: "AR_TRF_NM",
    width: 130,
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_CODE",
    field: "AR_CHG_CD",
    align: "center",
    width: 95,
  },
  {
    type: "text",
    headerName: "LBL_RATE_ITEM_NAME",
    field: "AR_CHG_NM",
    flex: 1,
    minWidth: 120,
  },
];

export default function AccountReceivableSubChargeAddPopup({
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [f, setF] = useState({
    CUST_CD: "",
    CUST_NM: "",
    AR_TRF_CD: "",
    AR_TRF_NM: "",
    AR_CHG_CD: "",
    AR_CHG_NM: "",
    USE_YN: "Y",
  });

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const search = () => {
    api
      .searchArTrfChgLinePopup(f)
      .then((res: any) => {
        setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
        setSelected(null);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { stores } = useCommonStores({
    useYn: { sqlProp: "CODE", keyParam: "USE_YN" },
  });

  const searchFields: GridSearchField[] = [
    {
      label: "LBL_CUSTOMER_CODE",
      value: f.CUST_CD,
      onChange: (v) => set("CUST_CD", v),
    },
    {
      label: "LBL_CUSTOMER_NAME",
      value: f.CUST_NM,
      onChange: (v) => set("CUST_NM", v),
    },
    {
      label: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
      value: f.AR_TRF_CD,
      onChange: (v) => set("AR_TRF_CD", v),
    },
    {
      label: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
      value: f.AR_TRF_NM,
      onChange: (v) => set("AR_TRF_CD", v),
    },
    {
      label: "LBL_RATE_ITEM_CODE",
      value: f.AR_CHG_CD,
      onChange: (v) => set("AR_CHG_CD", v),
    },
    {
      label: "LBL_RATE_ITEM_NAME",
      value: f.AR_CHG_NM,
      onChange: (v) => set("AR_CHG_CD", v),
    },
    {
      label: "LBL_USE_YN",
      value: f.USE_YN,
      type: "combo",
      options: stores.useYn,
      onChange: (v) => set("USE_YN", v),
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition fields={searchFields} onSearch={search} />

      <div className="shrink-0" style={{ height: 400 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="single"
          onRowSelected={(row: any) => setSelected(row)}
          onRowDoubleClicked={() => selected && onConfirm(selected)}
        />
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_APPLY")}
        </Button>
      </div>
    </div>
  );
}
