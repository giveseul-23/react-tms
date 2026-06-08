"use client";

// 소속(차고지) 일괄변경 팝업 (센차 DomicileChgPop)
// 조회조건 차량 목록을 띄워 다건 선택 → 변경 차고지(CHG_DOMI) 적용 후 changeDomicile 저장.

import { useEffect, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import { vehicleMgmtApi as api } from "../vehicleMgmtApi";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  params: {
    DIV_CD?: string;
    LGST_GRP_CD?: string;
    VEH_OP_TP?: string;
    VEH_OPER_SCD?: string;
  };
  onApplied: () => void;
  onClose: () => void;
};

const COLUMN_DEFS = [
  { headerName: "No", width: 56 },
  { type: "text", headerName: "LBL_VEHICLE_CODE", field: "VEH_ID" },
  { type: "text", headerName: "LBL_VEH_NO", field: "VEH_NO", align: "center" },
  { type: "text", headerName: "LBL_DRVR_NM", field: "DRVR_NM", align: "center" },
  { type: "text", headerName: "LBL_TON_TYPE", field: "VEH_TP_NM" },
  { type: "text", headerName: "LBL_DOMICILE_LOC_CD", field: "LOC_CD", align: "center" },
  { type: "text", headerName: "LBL_DOMICILE_LOC_NM", field: "LOC_NM" },
];

export default function DomicileChgPop({ params, onApplied, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [rows, setRows] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [oldDomi, setOldDomi] = useState({ cd: "", nm: "" });
  const [chgDomi, setChgDomi] = useState({ cd: "", nm: "" });

  const search = (locCd = "") => {
    api
      .searchDomicileChgPop({ ...params, LOC_CD: locCd })
      .then((res: any) => {
        const data = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setRows(data);
        setSelectedRows([]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 차고지 코드 검색 팝업 (스택)
  const openDomiPicker = (onPick: (cd: string, nm: string) => void) => {
    openPopup({
      title: Lang.get("LBL_DOMICILE"),
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLocationCodeName"
          onApply={(r: any) => {
            closePopup();
            onPick(r.CODE, r.NAME);
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const onChange = () => {
    if (!chgDomi.cd) {
      openPopup({
        type: "check",
        width: "lg",
        content: (
          <div className="p-4 text-sm">{Lang.get("MSG_SELECT_NO_DATA")}</div>
        ),
      });
      return;
    }
    if (selectedRows.length === 0) return;
    const saveRows = selectedRows.map((r) => ({
      ...r,
      LOC_CD: chgDomi.cd,
      rowStatus: "U",
    }));
    api
      .changeDomicile(saveRows)
      .then(() => onApplied())
      .catch(console.error);
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 검색 영역 */}
      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <DomiPicker
          label={Lang.get("LBL_OLD_DOMICILE")}
          value={oldDomi}
          onSearch={() => openDomiPicker((cd, nm) => setOldDomi({ cd, nm }))}
        />
        <DomiPicker
          label={Lang.get("LBL_CHANGED_DOMICILE")}
          required
          value={chgDomi}
          onSearch={() => openDomiPicker((cd, nm) => setChgDomi({ cd, nm }))}
        />
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="xs"
          onClick={() => search(oldDomi.cd)}
          className="btn-primary btn-primary:hover"
        >
          <Search className="w-3 h-3" />
          {Lang.get("BTN_SEARCH")}
        </Button>
      </div>

      {/* 그리드 */}
      <div className="shrink-0" style={{ height: 380 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={COLUMN_DEFS}
          rowData={rows}
          pagination
          pageSize={20}
          rowSelection="multiple"
          gridOptions={{
            onSelectionChanged: (e: any) =>
              setSelectedRows(e.api.getSelectedRows()),
          }}
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
          disabled={selectedRows.length === 0 || !chgDomi.cd}
          onClick={onChange}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_CHG_DOMICILE")}
        </Button>
      </div>
    </div>
  );
}

function DomiPicker({
  label,
  required,
  value,
  onSearch,
}: {
  label: string;
  required?: boolean;
  value: { cd: string; nm: string };
  onSearch: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-[110px] shrink-0 text-[11px] font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="flex-1 flex items-center gap-1 min-w-0">
        <input
          readOnly
          value={value.cd}
          className="w-[110px] h-6 px-2 text-[11px] border border-input rounded-md bg-input-background"
        />
        <input
          readOnly
          value={value.nm}
          className="flex-1 h-6 px-2 text-[11px] border border-input rounded-md bg-input-background min-w-0"
        />
        <button
          type="button"
          onClick={onSearch}
          className="h-6 w-6 shrink-0 flex items-center justify-center border border-input rounded-md hover:bg-accent"
        >
          <Search className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
