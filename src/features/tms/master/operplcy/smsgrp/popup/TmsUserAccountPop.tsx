"use client";

// 사용자 계정 검색 팝업 (센차 TmsUserAccountPop)
// SMS 수신자 USR_ID 선택용 — 사용자 검색 후 단건 선택해 부모에 전달.

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { smsGroupApi as api } from "../SmsGroupApi";
import { Lang } from "@/app/services/common/Lang";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type Props = {
  onConfirm: (user: any) => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { headerName: "No", width: 56 },
  { type: "text", headerName: "LBL_USER_ID", field: "USR_ID" },
  {
    type: "text",
    headerName: "LBL_USER_NAME",
    field: "USR_NM",
  },
  {
    type: "date",
    headerName: "LBL_VALID_START_DATE",
    field: "USE_STT_DT",
    align: "center",
    width: 150,
  },
  {
    type: "date",
    headerName: "LBL_VALID_EXPIRATION_DATE",
    field: "USE_END_DT",
    align: "center",
    width: 150,
  },
];

export default function TmsUserAccountPop({ onConfirm, onClose }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [usrId, setUsrId] = useState("");
  const [usrNm, setUsrNm] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const search = () => {
    api
      .searchTmsUserAccount({ USR_ID: usrId, USR_NM: usrNm })
      .then((res: any) => {
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setRows(data);
        setSelected(null);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchFields: GridSearchField[] = [
    { label: "LBL_USER_ID", value: usrId, onChange: setUsrId },
    { label: "LBL_USER_NAME", value: usrNm, onChange: setUsrNm },
  ];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition
        fields={searchFields}
        onSearch={search}
        columns={2}
      />

      <div className="shrink-0" style={{ height: 380 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          pagination
          pageSize={10}
          rowSelection="single"
          onRowSelected={(row: any) => setSelected(row)}
          onRowDoubleClicked={() => selected && onConfirm(selected)}
          disableAutoSize
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
          {Lang.get("BTN_TMS_SELECT")}
        </Button>
      </div>
    </div>
  );
}
