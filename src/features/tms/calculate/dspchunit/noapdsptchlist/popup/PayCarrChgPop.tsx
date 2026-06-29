"use client";

// 지급운송협력사 변경 팝업 (서버 pop/PayCarrChgPop 대응)
//  - 물류운영그룹(LGST_GRP_CD) 기준 협력사 목록(/vehicleService/searchLgstGrpCarr) 조회
//  - 단건 선택 → onConfirm({ PAY_CARR_CD, PAY_CARR_NM }) → 부모가 선택 배차행에 머지 후 저장
//  - 더블클릭(=즉시 적용)은 그리드 단건선택 + 적용 버튼으로 대체.

import { useEffect, useState } from "react";
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { MENU_CODE } from "../NoApDispatchList";

type Props = {
  initialValues?: { DIV_CD?: string; LGST_GRP_CD?: string };
  onConfirm: (payload: { PAY_CARR_CD: string; PAY_CARR_NM: string }) => void;
  onClose: () => void;
};

export function PayCarrChgPop({
  initialValues = {},
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const showError = useErrorAlert();

  const lgstGrpCd = initialValues.LGST_GRP_CD ?? "";

  const fetchData = (extra: Record<string, any>) => {
    apiClient
      .post(`/vehicleService/searchLgstGrpCarr`, {
        ...getSessionFields(),
        MENU_CD: MENU_CODE,
        LGST_GRP_CD: lgstGrpCd,
        ...extra,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return;
        }
        setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
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
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () =>
    fetchData({ CARR_CD: carrCd, CARR_NM: carrNm });

  const fields: GridSearchField[] = [
    { label: "LBL_CARRIER_CODE", value: carrCd, onChange: setCarrCd },
    { label: "LBL_CARRIER_NAME", value: carrNm, onChange: setCarrNm },
  ];

  const columnDefs = [
    { headerName: "No", width: 30 },
    {
      headerName: "LBL_CARRIER_CODE",
      field: "CODE",
      sendField: "PAY_CARR_CD",
      align: "center",
      width: 150,
    },
    {
      headerName: "LBL_CARRIER_NAME",
      field: "NAME",
      sendField: "PAY_CARR_NM",
      align: "left",
      width: 200,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={360}
      selectedBadgeFields={["CODE", "NAME"]}
      onSearch={onSearch}
      onConfirm={(payload) =>
        onConfirm(payload as { PAY_CARR_CD: string; PAY_CARR_NM: string })
      }
      onClose={onClose}
    />
  );
}
