"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { logisticGroupDefaultApi } from "../LogisticGroupDefaultApi";

import { MENU_CODE } from "../LogisticGroupDefault";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";

type LgstSyncPopupProps = {
  onConfirm: (payload: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

// 컬럼은 예시 화면 헤더 기준 placeholder — 실제 field/조회 API 확정 후 교체
const BASE_GRP_COLUMN_DEFS = [
  { field: "DIV_CD", headerName: "LBL_DIVISION_CODE", width: 110 },
  { field: "DIV_NM", headerName: "LBL_DIVISION_NAME", width: 150 },
  { field: "LGST_GRP_CD", headerName: "LBL_LOGISTICS_GROUP_CODE", width: 140 },
  { field: "LGST_GRP_NM", headerName: "LBL_LOGISTICS_GROUP_NAME", width: 160 },
];

const APPLY_GRP_COLUMN_DEFS = [
  { field: "DIV_CD", headerName: "LBL_DIVISION_CODE", width: 110 },
  { field: "DIV_NM", headerName: "LBL_DIVISION_NAME", width: 150 },
  { field: "LGST_GRP_CD", headerName: "LBL_LOGISTICS_GROUP_CODE", width: 140 },
  { field: "LGST_GRP_NM", headerName: "LBL_LOGISTICS_GROUP_NAME", width: 160 },
];

const CNFG_GRP_COLUMN_DEFS = [
  {
    field: "LGST_GRP_CNFG_GRP_CD",
    hide: true,
  },
  {
    field: "LGST_GRP_CNFG_GRP_NM",
    headerName: "LBL_LGST_GRP_CNFG_GRP_NM",
    flex: 1,
  },
];

const CNFG_VALUE_COLUMN_DEFS = [
  {
    field: "LGST_GRP_CNFG_GRP_CD",
    hide: true,
  },
  {
    field: "LGST_GRP_CNFG_GRP_NM",
    headerName: "LBL_LGST_GRP_CNFG_GRP_NM",
    width: 160,
  },
  {
    field: "CNFG_CD",
    hide: true,
  },
  {
    field: "CNFG_NM",
    headerName: "LBL_LGST_GRP_CNFG_NM",
    width: 180,
  },
  {
    field: "CNFG_VAL",
    headerName: "LBL_SETTING_VAL",
    codeKey: "cnfgDtlTcd",
    width: 120,
  },
];

export default function LgstSyncPopup({
  onConfirm,
  onClose,
}: LgstSyncPopupProps) {
  const [baseRows, setBaseRows] = useState<any[]>([]);
  const [applyRows, setApplyRows] = useState<any[]>([]);
  const [cnfgGrpRows, setCnfgGrpRows] = useState<any[]>([]);
  const [cnfgValueRows, setCnfgValueRows] = useState<any[]>([]);
  // 선택행 하이라이트용 (selectedRow prop) — single 선택
  const [selectedBaseRow, setSelectedBaseRow] = useState<any>(null);
  const [selectedApplyRow, setSelectedApplyRow] = useState<any>(null);
  const [selectedCnfgGrpRow, setSelectedCnfgGrpRow] = useState<any>(null);

  const showError = useErrorAlert();

  // 설정값 코드 → 라벨 (CNFG_VAL codeKey)
  const { codeMap } = useCommonStores({
    cnfgDtlTcd: {
      sqlProp: "/logisticGroupDefaultService/searchCnfgDtlCd",
      MENU_CD: MENU_CODE,
    },
  });

  useEffect(() => {
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // selectedRow 하이라이트 매칭용 __rid__ 부여 (DataGrid 내부 태깅 규칙과 동일)
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

  // 동기화그룹 클릭 → 적용운영설정값 조회
  // applyCd: 연쇄 호출 시 직전 apply 행 코드를 직접 전달(setState stale 방지),
  //          수동 클릭 시엔 선택된 apply 행에서 가져옴.
  const onCnfgGrpClick = (
    row: any,
    applyCd: string = selectedApplyRow?.LGST_GRP_CD ?? "",
  ) => {
    setSelectedCnfgGrpRow(row ?? null);
    if (!row || !applyCd) {
      setCnfgValueRows([]);
      return;
    }
    runSearch(
      logisticGroupDefaultApi.getLgstGrpCnfgDtlPop({
        LGST_GRP_CD: applyCd,
        LGST_GRP_CNFG_GRP_CD_LIST: row.LGST_GRP_CNFG_GRP_CD,
      }),
    ).then(setCnfgValueRows);
  };

  // 동기화적용 클릭 → 동기화그룹선택 조회 → 첫 행 연쇄
  const onApplyGrpClick = (row: any) => {
    setSelectedApplyRow(row ?? null);
    setSelectedCnfgGrpRow(null);
    setCnfgValueRows([]);
    if (!row) {
      setCnfgGrpRows([]);
      return;
    }
    runSearch(
      logisticGroupDefaultApi.getLgstDefaultCnfgGrpList({
        LGST_GRP_CD: row.LGST_GRP_CD,
      }),
    ).then((rows) => {
      setCnfgGrpRows(rows);
      onCnfgGrpClick(rows[0] ?? null, row.LGST_GRP_CD);
    });
  };

  // 동기화기준 클릭 → 동기화적용물류운영그룹 조회 → 첫 행 연쇄
  const onbaseGrpClick = (row: any) => {
    setSelectedBaseRow(row ?? null);
    setSelectedApplyRow(null);
    setSelectedCnfgGrpRow(null);
    setCnfgGrpRows([]);
    setCnfgValueRows([]);
    if (!row) {
      setApplyRows([]);
      return;
    }
    runSearch(
      logisticGroupDefaultApi.getLgstGrpCnfgGrp({ LGST_GRP_CD: row.LGST_GRP_CD }),
    ).then((rows) => {
      setApplyRows(rows);
      onApplyGrpClick(rows[0] ?? null);
    });
  };

  //메인조회 — 동기화기준물류운영그룹 → 첫 행 연쇄
  const fetchData = (extraParams: any) => {
    runSearch(
      logisticGroupDefaultApi.getLgstGrpCnfgGrp({ ...extraParams }),
    ).then((rows) => {
      setBaseRows(rows);
      onbaseGrpClick(rows[0] ?? null);
    });
  };

  // 동기화 저장 — 기준/적용/그룹선택 각 1행으로 dsSave 파라미터 구성
  const onSync = () => {
    if (!selectedBaseRow || !selectedApplyRow || !selectedCnfgGrpRow) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    const { __rid__, ...base } = selectedBaseRow;
    onConfirm({
      dsSave: [
        {
          ...base,
          rowStatus: "I",
          TARGETS: [
            {
              BASE_LGST_GRP_CD: selectedBaseRow.LGST_GRP_CD,
              TARGET_LGST_GRP_CD: selectedApplyRow.LGST_GRP_CD,
            },
          ],
          CNFG_GRPS: [
            {
              LGST_GRP_CNFG_GRP_CD: selectedCnfgGrpRow.LGST_GRP_CNFG_GRP_CD,
            },
          ],
        },
      ],
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 3컬럼 배치: [좌: 2그리드 세로] [중: 그룹선택] [우: 설정값조회]
          — SplitPane 으로 드래그 리사이즈. 외곽 div 높이 고정 필요. */}
      <div style={{ height: 612 }}>
        <SplitPane
          direction="horizontal"
          defaultSizes={[50, 20, 30]}
          minSizes={[20, 15, 20]}
          storageKey="lgstSync-outer"
        >
          {/* 좌측 — 기준 / 적용 물류운영그룹 (세로 2그리드) */}
          <SplitPane
            direction="vertical"
            defaultSizes={[40, 60]}
            storageKey="lgstSync-left"
          >
            <DataGrid
              layoutType="plain"
              subTitle="LBL_SYNC_BASE_LGST_GRP"
              actions={[]}
              columnDefs={BASE_GRP_COLUMN_DEFS}
              rowData={baseRows}
              rowSelection="single"
              selectedRow={selectedBaseRow}
              disableAutoSize
              onRowClicked={onbaseGrpClick}
            />
            <DataGrid
              layoutType="plain"
              subTitle="LBL_SYNC_APPLY_LGST_GRP"
              actions={[]}
              columnDefs={APPLY_GRP_COLUMN_DEFS}
              rowData={applyRows}
              rowSelection="single"
              selectedRow={selectedApplyRow}
              disableAutoSize
              onRowClicked={onApplyGrpClick}
            />
          </SplitPane>

          {/* 중앙 — 동기화그룹선택 */}
          <DataGrid
            layoutType="plain"
            subTitle="LBL_SYNC_GRP_SELECT"
            actions={[]}
            columnDefs={CNFG_GRP_COLUMN_DEFS}
            rowData={cnfgGrpRows}
            rowSelection="single"
            selectedRow={selectedCnfgGrpRow}
            onRowClicked={onCnfgGrpClick}
            disableAutoSize
          />

          {/* 우측 — 적용운영설정값조회 */}
          <DataGrid
            layoutType="plain"
            subTitle="LBL_SYNC_GRP_SELECT"
            actions={[]}
            columnDefs={CNFG_VALUE_COLUMN_DEFS}
            rowData={cnfgValueRows}
            codeMap={codeMap}
            disableAutoSize
          />
        </SplitPane>
      </div>

      {/* 버튼 영역 — 기존 팝업(GridSearchPopupLayout) 하단 버튼과 동일 스타일 */}
      <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="h-7 px-4 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 gap-1.5"
        >
          <X className="w-3 h-3" />
          취소
        </Button>
        <Button
          size="sm"
          onClick={onSync}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <RefreshCw className="w-3 h-3" />
          동기화
        </Button>
      </div>
    </div>
  );
}
