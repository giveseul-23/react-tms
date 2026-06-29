"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { tmsUserAccountApi as api } from "../TmsUserAccountApi";

type Props = {
  onConfirm: (rows: Record<string, any>[]) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { headerName: "No", width: 60 },
  { type: "check", headerName: "LBL_USE_YN", field: "USE_YN", hide: true },
  { type: "text", headerName: "LBL_USER_ID", field: "USR_ID", width: 140 },
  { type: "text", headerName: "LBL_USER_NAME", field: "USR_NM", width: 140 },
  { type: "date", headerName: "LBL_VALID_START_DATE", field: "USE_STT_DT" },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
  },
  { field: "TEL_NO", hide: true },
  { field: "MBL_PHN_NO", hide: true },
  { field: "EMAIL_ADDR", hide: true },
];

export default function TmsUserAccountPopup({ onConfirm, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [usrId, setUsrId] = useState("");
  const [usrNm, setUsrNm] = useState("");

  const search = useCallback(() => {
    void api
      .getUserPopupList({ USR_ID: usrId, USR_NM: usrNm })
      .then((res: any) => setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []));
  }, [usrId, usrNm]);

  useEffect(() => {
    void api
      .getUserPopupList({ USR_ID: "", USR_NM: "" })
      .then((res: any) =>
        setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []),
      );
  }, []);

  const fields: GridSearchField[] = [
    { label: "LBL_USER_ID", value: usrId, onChange: setUsrId },
    { label: "LBL_USER_NAME", value: usrNm, onChange: setUsrNm },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={COLUMN_DEFS}
      rows={rows}
      gridHeight={400}
      rowSelection="multiple"
      confirmOnRowDoubleClick
      selectedBadgeFields={["USR_ID", "USR_NM"]}
      selectPrompt="사용자를 선택하세요"
      onSearch={search}
      onConfirm={(payload) =>
        onConfirm(Array.isArray(payload) ? payload : [payload])
      }
      onClose={onClose}
    />
  );
}
