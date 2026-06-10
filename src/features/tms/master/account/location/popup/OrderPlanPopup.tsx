import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";

import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import {
  GridSearchField,
  PopupSearchCondition,
} from "@/app/components/popup/PopupSearchCondition";
import { locationApi } from "../LocationApi";
import { useCommonStores } from "@/hooks/useCommonStores";

type OrderPlanPopupProps = {
  extraParams: Record<string, string>;
  onConfirm: (payload: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const MAIN_COLUMN_DEFS = [
  {
    field: "ORD_TP_CD",
    headerName: "LBL_ORD_TP_CD",
    align: "center",
    isPrimaryKey: true,
  },
  {
    field: "ORD_TP_NM",
    headerName: "LBL_ORD_TP_NM",
  },
];

const SUB01_COLUMN_DEFS = [
  {
    field: "PLN_ID",
    headerName: "LBL_PLAN_ID",
    isPrimaryKey: true,
  },
  {
    field: "PLN_NM",
    headerName: "LBL_PLAN_NAME",
  },
];

export default function OrderPlanPopup({
  extraParams,
  onConfirm,
  onClose,
}: OrderPlanPopupProps) {
  const [mainRows, setMainRows] = useState<any[]>([]);
  const [sub01Rows, setSub01Rows] = useState<any[]>([]);
  // 선택행 하이라이트용 (selectedRow prop) — single 선택
  const [selectedMainRows, setSelectedMainRows] = useState<any[]>(null);
  const [selectedSub01Row, setSelectedSub01Row] = useState<any>(null);

  const [locCd, setLocCd] = useState(extraParams.LOC_CD);
  const [locNm, setLocNm] = useState(extraParams.LOC_NM);
  const [divCd, setDivCd] = useState("");
  const [lgstGrpCd, setLgstGrpCd] = useState("");

  const showError = useErrorAlert();

  const { stores } = useCommonStores({
    divCd: { sqlProp: "selectDivisionCodeNameUser" },
    lgstGrpCd: {
      sqlProp: "selectLogisticsgroupCodeNameUser",
      keyParam: divCd,
    },
  });

  const searchFields: GridSearchField[] = [
    {
      type: "text",
      label: "LBL_SLCT_LOC",
      value: locNm,
      onChange: setLocNm,
      disable: true,
    },
    {
      type: "combo",
      label: "LBL_DIV",
      value: divCd,
      onChange: setDivCd,
      options: stores.divCd,
    },
    {
      type: "combo",
      label: "LBL_LOGISTICS_GROUP",
      value: lgstGrpCd,
      onChange: setLgstGrpCd,
      options: stores.lgstGrpCd,
    },
  ];

  const withRid = (rows: any[]) =>
    rows.map((r, i) => ({ ...r, __rid__: r.__rid__ ?? `__r${i}` }));

  // 공통 응답 처리 — 성공 시 dsOut(__rid__ 부여) 반환, 실패 시 []
  const runSearch = (promise: Promise<any>): Promise<any[]> =>
    promise
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return [];
        }
        return withRid(res.data?.data?.dsOut ?? []);
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        );
        return [];
      });

  // 메인 조회 — 물류운영그룹 → 첫 행 연쇄
  const fetchMainData = (params: any) => {
    runSearch(
      locationApi.searchOrderTp({
        ...params,
      }),
    ).then((rows) => {
      setMainRows(rows);
    });
  };

  //서브조회
  const fetchSubData = (params: any) => {
    runSearch(
      locationApi.searchLgstPln({
        ...params,
      }),
    ).then((rows) => {
      setSub01Rows(rows);
    });
  };

  const onSearch = () => {
    const srchParams = {
      LOC_CD: locCd,
      DIV_CD: divCd,
      LGST_GRP_CD: lgstGrpCd,
    };

    fetchMainData(srchParams);
    fetchSubData(srchParams);
  };

  // 저장 — 선택된 기준/운송사/차량 행을 합쳐 반환
  const onSave = () => {
    if (!(selectedMainRows || selectedSub01Row)) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }

    const PLNARRAY = selectedMainRows.map((row) => ({
      DIV_CD: divCd,
      LGST_GRP_CD: lgstGrpCd,
      LOC_ID: extraParams.LOC_ID,
      ORD_TP: row.ORD_TP_CD,
      ...row,
      ...selectedSub01Row,
    }));

    onConfirm({ PLNARRAY });
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition fields={searchFields} onSearch={onSearch} />

      {/* 3컬럼 배치: [좌: 물류운영그룹] [중: 운송사] [우: 차량]
          — SplitPane 으로 드래그 리사이즈. 외곽 div 높이 고정 필요. */}
      <div style={{ height: 500 }}>
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 50]}
          storageKey="orderPlanPopup-outer"
        >
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={MAIN_COLUMN_DEFS}
            rowData={mainRows}
            rowSelection="multiple"
            selectedRow={selectedMainRows}
            gridOptions={{
              onSelectionChanged: (e: any) =>
                setSelectedMainRows(e.api.getSelectedRows()),
            }}
            disableAutoSize
          />
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={SUB01_COLUMN_DEFS}
            rowData={sub01Rows}
            rowSelection="single"
            selectedRow={selectedSub01Row}
            onSelectionChanged={setSelectedSub01Row}
            disableAutoSize
          />
        </SplitPane>
      </div>

      {/* 버튼 영역 — RegionAddPopup 과 동일 스타일 */}
      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={onSave}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
