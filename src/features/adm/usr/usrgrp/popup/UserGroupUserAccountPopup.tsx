"use client";

import { useEffect, useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { Lang } from "@/app/services/common/Lang";
import { userGroupApi } from "../UserGroupApi";

type UserAccountRow = {
  USR_ID: string;
  USR_NM: string;
  TEL_NO?: string;
  MBL_PHN_NO?: string;
  EMAIL_ADDR?: string;
  USE_STT_DT?: string;
  USE_END_DT?: string;
};

interface Props {
  onApply: (rows: UserAccountRow[]) => void;
  onClose: () => void;
}

export default function UserAccountSelectPopup({ onApply, onClose }: Props) {
  const [rows, setRows] = useState<UserAccountRow[]>([]);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  const handleSearch = async () => {
    const res: any = await userGroupApi.getUserAccountPopupList({
      USR_ID: userId,
      USR_NM: userName,
    });
    setRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
  };

  useEffect(() => {
    void handleSearch();
  }, []);

  const fields: GridSearchField[] = [
    {
      label: "LBL_USER_ID",
      value: userId,
      onChange: setUserId,
      placeholder: Lang.get("LBL_INPUT"),
    },
    {
      label: "LBL_USER_NAME",
      value: userName,
      onChange: setUserName,
      placeholder: Lang.get("LBL_INPUT"),
    },
  ];

  const columnDefs = [
    { field: "USR_ID", sendField: "USR_ID", hide: true },
    { field: "USR_NM", sendField: "USR_NM", hide: true },
    { field: "TEL_NO", sendField: "TEL_NO", hide: true },
    { field: "MBL_PHN_NO", sendField: "MBL_PHN_NO", hide: true },
    { field: "EMAIL_ADDR", sendField: "EMAIL_ADDR", hide: true },
    { field: "USE_STT_DT", sendField: "USE_STT_DT", hide: true },
    { field: "USE_END_DT", sendField: "USE_END_DT", hide: true },
    { headerName: "No", width: 30 },
    { type: "text", headerName: "LBL_USER_ID", field: "USR_ID" },
    { type: "text", headerName: "LBL_USER_NAME", field: "USR_NM" },
    {
      type: "date",
      headerName: "LBL_VALID_START_DATE",
      field: "USE_STT_DT",
    },
    {
      type: "date",
      headerName: "LBL_VALID_EXPIRATION_DATE",
      field: "USE_END_DT",
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={360}
      selectedBadgeFields={["USR_ID", "USR_NM", "USE_STT_DT"]}
      selectedLabel={Lang.get("LBL_SELECT_USER")}
      onSearch={() => void handleSearch()}
      onConfirm={(row) => onApply([row as UserAccountRow])}
      onClose={onClose}
    />
  );
}
