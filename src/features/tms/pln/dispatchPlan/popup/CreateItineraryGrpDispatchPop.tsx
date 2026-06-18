"use client";

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { GridSearchPopupLayout } from "@/app/components/popup/GridSearchPopupLayout";
import { dispatchPlanApi as api } from "../../dispatchPlanAd/dispatchPlanApi";

type Props = {
  onConfirm: (payload: Record<string, any>[]) => void;
  onClose: () => void;
  // 본 화면 조회조건: DIV_CD / LGST_GRP_CD / DLVRY_DT / DSPCH_TP / PLN_ID
  initialValues?: Record<string, any>;
};

export default function CreateItineraryGrpDispatchPop({
  onConfirm,
  onClose,
  initialValues = {},
}: Props) {
  const DIV_CD = initialValues["DIV_CD"];
  const DLVRY_DT = initialValues["DLVRY_DT"];
  const PLN_ID = initialValues["PLN_ID"];
  const LGST_GRP_CD = initialValues["LGST_GRP_CD"];
  const BATCH_NO = initialValues["BATCH_NO"];

  const [rows, setRows] = useState<any[]>([]);

  const { codeMap } = useCommonStores({
    vehOpTp: { sqlProp: "CODE", keyParam: "VEH_OP_TP" },
    apProcTp: { sqlProp: "CODE", keyParam: "AP_PROC_TP" },
  });

  const showError = useErrorAlert();

  const fetchData = () => {
    api
      .searchGroupPop({
        DIV_CD,
        LGST_GRP_CD,
        DLVRY_DT,
        PLN_ID,
        BATCH_NO,
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

  const columnDefs = [
    {
      headerName: "LBL_LOGISTICS_GROUP_CODE",
      field: "LGST_GRP_CD",
    },
    {
      headerName: "LBL_ITNR_GRP_CD",
      field: "ITNR_GRP_CD",
    },
    {
      headerName: "LBL_ITNR_GRP_NM",
      field: "ITNR_GRP_NM",
    },
    {
      headerName: "LBL_ITNR_GRP_ALIAS",
      field: "ITNR_GRP_ALIAS",
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={[]}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      codeMap={codeMap}
      rowSelection="multiple"
      selectedBadgeFields={["ITNR_GRP_CD", "ITNR_GRP_NM", "ITNR_GRP_ALIAS"]}
      selectPrompt="고정노선그룹을 선택하세요"
      onSearch={fetchData}
      onConfirm={(payload) => onConfirm(payload as Record<string, any>[])}
      onClose={onClose}
    />
  );
}
