import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { vehicleMgmtApi } from "../../../../resources/vehicleMgmt/vehicleMgmtApi";

import { MENU_CD } from "../Location";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";

type VehicleAddPopupProps = {
  onConfirm: (payload: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

// 컬럼은 예시 화면 헤더 기준 placeholder — 실제 field/조회 API 확정 후 교체
const LGST_COLUMN_DEFS = [
  { field: "CODE", headerName: "LBL_DC_CODE", flex: 1, },
  { field: "NAME", headerName: "LBL_DC_NAME", flex: 1, },
];

const CARR_COLUMN_DEFS = [
  {
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    field: "CARR_CD",
    headerName: "LBL_CARR_CD",
    flex: 1,
  },
  {
    field: "CARR_NM",
    headerName: "LBL_CARR_NM",
    flex: 1,
  },
];

const VEH_COLUMN_DEFS = [
  {
    field: "LGST_GRP_CD",
    hide: true,
  },
  {
    field: "LGST_GRP_NM",
    hide: true,
  },
  {
    field: "CARR_CD",
    hide: true,
  },
  {
    field: "CARR_NM",
    hide: true,
  },
  {
    field: "VEH_TP_CD",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    width: 160,
  },
  {
    field: "VEH_TP_NM",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    width: 180,
  },
  {
    field: "VEH_NO",
    headerName: "LBL_PRMY_VEH_NO",
    codeKey: "cnfgDtlTcd",
    width: 150,
  },
  {
    field: "VEH_ID",
    hide: true,
  },
  {
    field: "DRVR_NM",
    headerName: "LBL_DRIVER_NM",
    width: 120,
  },
];

export default function VehicleAddPopup({
  onConfirm,
  onClose,
}: VehicleAddPopupProps) {
  const [lgstRows, setLgstRows] = useState<any[]>([]);
  const [carrRows, setCarrRows] = useState<any[]>([]);
  const [vehRows, setVehRows] = useState<any[]>([]);
  // 선택행 하이라이트용 (selectedRow prop) — single 선택
  const [selectedLgstRow, setSelectedLgstRow] = useState<any>(null);
  const [selectedCarrRow, setSelectedCarrRow] = useState<any>(null);
  const [selectedVehRow, setSelectedVehRow] = useState<any>(null);

  const showError = useErrorAlert();

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

  // 물류운영 클릭 → 운송사 조회
  const onLgstGrpClick = (row: any) => {
    // 현재 클릭한 물류운영 그룹 행을 상태에 저장 (하이라이트용)
    setSelectedLgstRow(row ?? null);
    
    // 다음 그리드들 초기화
    setSelectedCarrRow(null);
    setCarrRows([]);
    setVehRows([]);

    if (!row || !row.CODE) return;

    // 클릭된 row에서 직접 CODE를 추출하여 API 호출 (상태값 의존 X)
    runSearch(
      vehicleMgmtApi.getVehPopCarr({
        LGST_GRP_CD: row.CODE,
      }),
    ).then(setCarrRows);
  };

  // 운송사 클릭 → 차량 조회
  const onCarrClick = (row: any) => {
    setSelectedCarrRow(row ?? null);

    setSelectedVehRow(null);
    setVehRows([]);

    if (!row || !row.CARR_CD) return;

    runSearch(
      vehicleMgmtApi.getVehPopTrck({
        LGST_GRP_CD: row.LGST_GRP_CD,
        CARR_CD: row.CARR_CD,
      }),
    ).then(setVehRows);
  };

  // 차량 클릭
  const onVehClick = (eventOrRow: any) => {
    const actualRow = eventOrRow?.data ?? eventOrRow;
    setSelectedVehRow(actualRow ?? null);
  };

  // 메인 조회
  const fetchData = (extraParams: any) => {
    runSearch(vehicleMgmtApi.getVehPopLgstGrp({ ...extraParams })).then((rows) => {
      setLgstRows(rows);
      if (rows && rows.length > 0) {
        onLgstGrpClick(rows[0]); // 첫 번째 행 자동 선택 및 연쇄 조회
      }
    });
  };

  // 동기화 저장 — 기준/적용/그룹선택 각 1행으로 dsSave 파라미터 구성
  const onSave = () => {
    if (!selectedLgstRow || !selectedCarrRow || !selectedVehRow) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }

    const { __rid__: lgstRid, ...lgstData } = selectedLgstRow;
    const { __rid__: carrRid, ...carrData } = selectedCarrRow;
    const { __rid__: vehRid, ...vehData } = selectedVehRow;

    const payload = [
      {
        ...lgstData,  // 물류운영그룹 정보
        ...carrData,  // 운송사 정보
        ...vehData,   // 선택된 차량 정보
      }
    ];
    onConfirm(payload);
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 3컬럼 배치: [좌: 물류운영그룹] [중: 운송사] [우: 차량]
          — SplitPane 으로 드래그 리사이즈. 외곽 div 높이 고정 필요. */}
      <div style={{ height: 612 }}>
        <SplitPane
          direction="horizontal"
          defaultSizes={[20, 20, 60]}
          minSizes={[15, 15, 25]}
          storageKey="lgstSync-outer"
        >
          {/* 좌측 — 기준 / 적용 물류운영그룹 */}
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={LGST_COLUMN_DEFS}
            rowData={lgstRows}
            rowSelection="single"
            selectedRow={selectedLgstRow}
            disableAutoSize
            onRowClicked={onLgstGrpClick}
          />

          {/* 중앙 — 운송사선택 */}
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={CARR_COLUMN_DEFS}
            rowData={carrRows}
            rowSelection="single"
            selectedRow={selectedCarrRow}
            onRowClicked={onCarrClick}
            disableAutoSize
          />

          {/* 우측 — 차량조회 */}
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={VEH_COLUMN_DEFS}
            rowSelection="single"
            selectedRow={selectedVehRow}
            onRowClicked={onVehClick}
            rowData={vehRows}
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
          onClick={onSave}
          className="h-7 px-4 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 gap-1.5"
        >
          <RefreshCw className="w-3 h-3" />
          저장
        </Button>
      </div>
    </div>
  );
}
