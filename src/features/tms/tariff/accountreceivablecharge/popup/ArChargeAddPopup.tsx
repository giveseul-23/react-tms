"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { AccountReceivableChargeManagementApi as api } from "../AccountReceivableChargeManagementApi";
import { MENU_CD } from "../AccountReceivableChargeManagement";
import { Lang } from "@/app/services/common/Lang";

export type ArChargeAddPopupProps = {
  onApply: (row: any) => void;
  onClose: () => void;
};

export default function ArChargeAddPopup({
  onApply,
  onClose,
}: ArChargeAddPopupProps) {
  const [rows, setRows] = useState<any[]>([]);

  const [custCode, setCustCode] = useState("");
  const [custName, setCustName] = useState("");
  const [arTrfCd, setArTrfCd] = useState("");
  const [arTrfNm, setArTrfNm] = useState("");
  const [useYn, setUseYn] = useState("Y");

  useEffect(() => {
    fetchData({
      USE_YN: useYn,
    });
  }, []);

  const { stores } = useCommonStores({
    ynList: {
      sqlProp: "CODE",
      keyParam: "YN",
    },
    arTrfLevelList: {
      sqlProp: "CODE",
      keyParam: "AR_TRF_LCD",
    }
  });

  const showError = useErrorAlert();

  const fetchData = (extraParams: any) => {
      api.getPopData({
        CUST_CD:  custCode,
        CUST_NM: custName,
        AR_TRF_CD: arTrfCd,
        AR_TRF_NM: arTrfNm,
        USE_YN: useYn,
        MENU_CD: MENU_CD,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        } else {
          setRows(res.data?.data?.dsOut ?? res.data?.data?.dsOut ?? []);
        }
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        );
      });
  };

  const onSearch = () => {
    fetchData({
      CUST_CD: custCode,
      CUST_NM: custName,
      AR_TRF_CD: arTrfCd,
      AR_TRF_NM: arTrfNm,
      USE_YN: useYn,
      MENU_CD: MENU_CD,
    });
  };

  const fields: GridSearchField[] = useMemo(
    () => [
      { label: Lang.get("LBL_CUSTOMER_CODE"), value: custCode, onChange: setCustCode },
      { label: Lang.get("LBL_CUSTOMER_NAME"), value: custName, onChange: setCustName },
      { label: Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE"), value: arTrfCd, onChange: setArTrfCd },
      { label: Lang.get("LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME"), value: arTrfNm, onChange: setArTrfNm },
      {
        label: Lang.get("LBL_USE_YN"),
        value: useYn,
        onChange: setUseYn,
        type: "combo",
        options: stores.ynList
      },
    ],
    [
      custCode,
      custName,
      arTrfCd,
      arTrfNm,
      useYn,
      MENU_CD,
      stores.ynList
    ],
  );

  const columnDefs = useMemo(
    () => [
      { headerName: "No", width: 20 },
      {
        headerName: "LBL_CUSTOMER_CODE",
        sendField: "CUST_CD",
        field: "CUST_CD",
        width: 90,
        align: "center"
      },{
        headerName: "LBL_CUSTOMER_NAME",
        sendField: "CUST_NM",
        field: "CUST_NM",
        width: 120,
      }, {
        headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
        sendField: "AR_TRF_LCD",
        field: "AR_TRF_LCD",
        type: "combo",
        options: stores.arTrfLevelList,
        width: 120
      }, {
        headerName: "LBL_CUSTOMER_CONTRACT_CODE",
        sendField: "CUST_CNTRCT_CD",
        field: "CUST_CNTRCT_CD",
      }, {
        headerName: "LBL_CUSTOMER_CONTRACT_NAME",
        sendField: "CUST_CNTRCT_NM",
        field: "CUST_CNTRCT_NM",
      }, {
        headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
        sendField: "AR_TRF_CD",
        field: "AR_TRF_CD",
      }, {
        headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
        sendField: "AR_TRF_NM",
        field: "AR_TRF_NM",
      }
    ],
    [stores.arTrfLevelList],
  );

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={350}
      selectedBadgeFields={["CUST_CD", "AR_TRF_LCD", "CUST_CNTRCT_CD", "AR_TRF_CD"]}
      rowSelection="multiple"
      onSearch={onSearch}
      onConfirm={onApply}
      onClose={onClose}
    />
  );
}
