import { CommonPopup } from "@/app/components/popup/CommonPopup";

// 고객코드 / 고객계약코드 / 디비전코드 / 물류운영그룹코드 는 popcode (돋보기 검색).
// AR_TRF_LCD === 'CUSTOMER' 인 행은 고객계약(코드/명) 입력 잠금 + 회색 표시.
const lockedWhenCustomer = (params: any) =>
  params.data?.AR_TRF_LCD === "CUSTOMER";

const customerCellStyle =
  (base?: Record<string, any>) => (params: any) => {
    if (lockedWhenCustomer(params)) {
      return {
        ...(base ?? {}),
        backgroundColor: "#f0f0f0",
        color: "#999999",
      };
    }
    return base ?? null;
  };

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "popup",
    headerName: "LBL_CUSTOMER_CODE",
    field: "CUST_CD",
    sqlProp: "selectCustomerCodeName",
    nameField: "CUST_NM",
    popupTitle: "LBL_CUSTOMER_CODE",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
    validators: { required: true, max: 60 },
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_NAME",
    field: "CUST_NM",
    width: 150,
    align: "center",
  },
  {
    type: "combo",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_LEVEL_CODE",
    field: "AR_TRF_LCD",
    codeKey: "arTrfLcdList",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "popuser",
    headerName: "LBL_CUSTOMER_CONTRACT_CODE",
    field: "AR_CNTRCT_CD",
    width: 150,
    align: "center",
    insertable: true,
    validators: { max: 60 },
    cellStyle: customerCellStyle({ textAlign: "center" }),
    renderPopup: ({ row, commit, close }: any) => {
      // CUSTOMER 레벨이면 고객계약 입력 자체를 막는다(서버 beforeedit return false 대응)
      if (row?.AR_TRF_LCD === "CUSTOMER") return null;
      return (
        <CommonPopup
          sqlId="selectCustCntrctCodeName"
          extraParams={{ keyParam: row?.CUST_CD ?? "" }}
          onApply={(picked: any) => {
            commit({
              AR_CNTRCT_CD: picked.CODE,
              AR_CNTRCT_NM: picked.NAME,
            });
            close();
          }}
          onClose={close}
        />
      );
    },
    validator: (_value: any, rowData: any) => {
      if (rowData?.AR_TRF_LCD === "CONTRACT") {
        const v = rowData?.AR_CNTRCT_CD;
        if (v == null || String(v).trim() === "") return "MSG_VALID_REQ";
      }
      return true;
    },
  },
  {
    type: "text",
    headerName: "LBL_CUSTOMER_CONTRACT_NAME",
    field: "AR_CNTRCT_NM",
    width: 150,
    align: "center",
    cellStyle: customerCellStyle({ textAlign: "center" }),
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_CODE",
    field: "AR_TRF_CD",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "text",
    headerName: "LBL_ACCOUNTS_RECEIVABLE_TARIFF_NAME",
    field: "AR_TRF_NM",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "combo",
    headerName: "LBL_RATE_DATE_TYPE_CODE",
    field: "AR_STL_BASE_DT_TP",
    codeKey: "arStlBaseDtTpList",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "combo",
    headerName: "LBL_RNG_CALC_TCD",
    field: "AR_CALC_TCD",
    codeKey: "arCalcTcdList",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "date",
    headerName: "LBL_FROM_DTTM",
    field: "STT_DT",
    width: 100,
    align: "center",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const stt = String(rowData?.STT_DT ?? "")
        .substring(0, 10)
        .replace(/-/g, "");
      const end = String(rowData?.END_DT ?? "")
        .substring(0, 10)
        .replace(/-/g, "");
      if (stt && end && stt > end) return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "date",
    headerName: "LBL_TO_DTTM",
    field: "END_DT",
    width: 100,
    align: "center",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const stt = String(rowData?.STT_DT ?? "")
        .substring(0, 10)
        .replace(/-/g, "");
      const end = String(rowData?.END_DT ?? "")
        .substring(0, 10)
        .replace(/-/g, "");
      if (stt && end && stt > end) return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "numeric",
    headerName: "LBL_MINIMUM_RATE",
    field: "MIN_RATE",
    width: 120,
    align: "right",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const minN = parseFloat(rowData?.MIN_RATE);
      const maxN = parseFloat(rowData?.MAX_RATE);
      if (!isNaN(minN) && !isNaN(maxN) && minN > maxN)
        return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "numeric",
    headerName: "LBL_MAXIMUM_RATE",
    field: "MAX_RATE",
    width: 120,
    align: "right",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const minN = parseFloat(rowData?.MIN_RATE);
      const maxN = parseFloat(rowData?.MAX_RATE);
      if (!isNaN(minN) && !isNaN(maxN) && minN > maxN)
        return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "combo",
    headerName: "LBL_CURRENCY_CODE",
    field: "CURR_CD",
    codeKey: "currencyCodeList",
    width: 150,
    align: "center",
    insertable: true,
    required: true,
  },
  {
    type: "check",
    headerName: "LBL_XCLD_AUTO_CALC",
    field: "XCLD_AUTO_CALC",
    width: 80,
    align: "center",
    insertable: true,
    editable: true,
    defaultValue: "N",
  },
  {
    type: "numeric",
    headerName: "LBL_FROM_APPLD_OIL_PRICE",
    field: "FRM_APPLD_OIL_PRICE",
    width: 120,
    align: "right",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const frmN = parseFloat(rowData?.FRM_APPLD_OIL_PRICE);
      const toN = parseFloat(rowData?.TO_APPLD_OIL_PRICE);
      if (!isNaN(frmN) && !isNaN(toN) && frmN > toN)
        return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "numeric",
    headerName: "LBL_TO_APPLD_OIL_PRICE",
    field: "TO_APPLD_OIL_PRICE",
    width: 120,
    align: "right",
    insertable: true,
    editable: true,
    validator: (_value: any, rowData: any) => {
      const frmN = parseFloat(rowData?.FRM_APPLD_OIL_PRICE);
      const toN = parseFloat(rowData?.TO_APPLD_OIL_PRICE);
      if (!isNaN(frmN) && !isNaN(toN) && frmN > toN)
        return "MSG_VALID_RANGE_CHK";
      return true;
    },
  },
  {
    type: "text",
    headerName: "LBL_REMARK_THIRD",
    field: "PRIORITY",
    width: 150,
    align: "center",
    insertable: true,
  },
  {
    type: "popup",
    headerName: "LBL_DIVISION_CODE",
    field: "DIV_CD",
    sqlProp: "selectDivisionCodeName",
    nameField: "DIV_NM",
    popupTitle: "LBL_DIVISION_CODE",
    width: 150,
    align: "center",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_DIVISION_NAME",
    field: "DIV_NM",
    width: 150,
    align: "center",
  },
  {
    type: "popup",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    field: "LGST_GRP_CD",
    sqlProp: "selectLogisticsgroupCodeName",
    nameField: "LGST_GRP_NM",
    popupTitle: "LBL_LOGISTICS_GROUP_CODE",
    extraParams: (row: any) => ({ keyParam: row?.DIV_CD ?? "" }),
    width: 150,
    align: "center",
    editable: false,
    insertable: false,
  },
  {
    type: "text",
    headerName: "LBL_LOGISTICS_GROUP_NAME",
    field: "LGST_GRP_NM",
    width: 150,
    align: "center",
  },
  {
    type: "check",
    headerName: "LBL_USE_YN",
    field: "USE_YN",
    width: 80,
    align: "center",
    insertable: true,
    editable: true,
    defaultValue: "Y",
  },
];
