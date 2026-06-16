"use client";

// 소속등록 팝업 (서버 pop/LogisticsPop)
// 물류운영그룹 코드/명 검색 → 다건 선택 → 부모 Controller 가 선택 헬퍼들에 소속등록.

import { useEffect, useState } from "react";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { assistApi } from "../AssistApi";

type Props = {
  onConfirm: (payload: Record<string, any> | Record<string, any>[]) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

export default function LogisticsPop({ onConfirm, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [lgstGrpCd, setLgstGrpCd] = useState("");
  const [lgstGrpNm, setLgstGrpNm] = useState("");
  const showError = useErrorAlert();

  const fetchData = (params: Record<string, any>) => {
    assistApi
      .searchLogisticsPop(params)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        }
        setRows(res?.data?.data?.dsOut ?? []);
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
    fetchData({ LGST_GRP_CD: "", LGST_GRP_NM: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () => {
    fetchData({ LGST_GRP_CD: lgstGrpCd, LGST_GRP_NM: lgstGrpNm });
  };

  const fields: GridSearchField[] = [
    { label: "LBL_CODE", value: lgstGrpCd, onChange: setLgstGrpCd },
    { label: "LBL_CODE_NM", value: lgstGrpNm, onChange: setLgstGrpNm },
  ];

  const columnDefs = [
    { headerName: "No", width: 30 },
    {
      headerName: "LBL_CODE",
      field: "LGST_GRP_CD",
      sendField: "LGST_GRP_CD",
      align: "center",
      flex: 1,
    },
    {
      headerName: "LBL_CODE_NM",
      field: "LGST_GRP_NM",
      sendField: "LGST_GRP_NM",
      align: "left",
      flex: 1,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      rowSelection="multiple"
      selectedBadgeFields={["LGST_GRP_CD", "LGST_GRP_NM"]}
      onSearch={onSearch}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
