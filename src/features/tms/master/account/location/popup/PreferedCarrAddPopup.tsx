import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";

import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import { PopupSearchCondition } from "@/app/components/popup/PopupSearchCondition";
import { locationApi } from "../LocationApi";

type PreferedCarrAddPopupProps = {
  onConfirm: (payload: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const MAIN_COLUMN_DEFS = [
  {
    field: "CODE",
    headerName: "LBL_DC_CODE",
    align: "center",
    isPrimaryKey: true,
    width: 100,
  },
  {
    field: "NAME",
    headerName: "LBL_DC_NAME",
  },
];

const SUB01_COLUMN_DEFS = [
  {
    field: "CARR_CD",
    headerName: "LBL_CARR_CD",
    isPrimaryKey: true,
    width: 100,
  },
  {
    field: "CARR_NM",
    headerName: "LBL_CARR_NM",
  },
  {
    field: "LGST_GRP_CD",
    hide: true,
    isPrimaryKey: true,
  },
];

const SUB02_COLUMN_DEFS = [
  // 물류센터코드 (hidden)
  {
    field: "LGST_GRP_CD",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    flex: 1,
    hide: true,
    isPrimaryKey: true,
  },
  // 물류센터명 (hidden, 리터럴 헤더)
  {
    field: "LGST_GRP_NM",
    headerName: "LGST_GRP_NM",
    noLang: true,
    flex: 1,
    hide: true,
  },
  // 운수협력사코드 (hidden, 리터럴 헤더)
  {
    field: "CARR_CD",
    headerName: "CARR_CD",
    noLang: true,
    flex: 1,
    hide: true,
    isPrimaryKey: true,
  },
  // 운수협력사명 (hidden, 리터럴 헤더)
  {
    field: "CARR_NM",
    headerName: "CARR_NM",
    noLang: true,
    flex: 1,
    hide: true,
  },
  // 차량유형코드 (컬럼 검색 — exsearchtrigger → filter)
  {
    field: "VEH_TP_CD",
    headerName: "LBL_VEHICLE_TYPE_CODE",
    flex: 1,
    filter: true,
    isPrimaryKey: true,
  },
  // 차량유형명
  {
    field: "VEH_TP_NM",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    flex: 1,
    filter: true,
  },
  // 대표차량번호
  {
    field: "VEH_NO",
    headerName: "LBL_PRMY_VEH_NO",
    width: 150,
    align: "center",
    filter: true,
  },
  // 차량ID (hidden, 리터럴 헤더)
  { field: "VEH_ID", headerName: "VEH_ID", noLang: true, flex: 1, hide: true },
  // 운전자명
  {
    field: "DRVR_NM",
    headerName: "LBL_DRIVER_NM",
    flex: 1,
    align: "center",
    filter: true,
  },
];

export default function PreferedCarrAddPopup({
  onConfirm,
  onClose,
}: PreferedCarrAddPopupProps) {
  const [mainRows, setMainRows] = useState<any[]>([]);
  const [sub01Rows, setSub01Rows] = useState<any[]>([]);
  const [sub02Rows, setSub02Rows] = useState<any[]>([]);
  // 선택행 하이라이트용 (selectedRow prop) — single 선택
  const [selectedMainRow, setSelectedMainRow] = useState<any>(null);
  const [selectedSub01Row, setSelectedSub01Row] = useState<any>(null);
  const [selectedSub02Row, setSelectedSub02Row] = useState<any>(null);

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

  // 운송사 클릭 → 차량 조회
  //   lgstCd: 연쇄 호출 시 직전 메인 행 코드를 직접 전달(setState stale 방지),
  //           수동 클릭 시엔 선택된 메인 행에서 가져옴.
  const onCarrClick = (
    row: any,
    lgstCd: string = selectedMainRow?.CODE ?? "",
  ) => {
    setSelectedSub01Row(row ?? null);
    setSelectedSub02Row(null);
    if (!row) {
      setSub02Rows([]);
      return;
    }
    runSearch(
      locationApi.searchVehPopTrck({
        LGST_GRP_CD: row.LGST_GRP_CD ?? lgstCd,
        CARR_CD: row.CARR_CD,
      }),
    ).then(setSub02Rows);
  };

  // 물류운영그룹 클릭 → 운송사 조회 → 첫 행 연쇄
  const onLgstGrpClick = (row: any) => {
    setSelectedMainRow(row ?? null);
    setSelectedSub01Row(null);
    setSelectedSub02Row(null);
    setSub02Rows([]);
    if (!row) {
      setSub01Rows([]);
      return;
    }
    runSearch(locationApi.searchVehPopCarr({ LGST_GRP_CD: row.CODE })).then(
      (rows) => {
        setSub01Rows(rows);
        onCarrClick(rows[0] ?? null, row.CODE);
      },
    );
  };

  // 메인 조회 — 물류운영그룹 → 첫 행 연쇄
  const fetchData = (params: any) => {
    runSearch(locationApi.searchVehPopLgstGrp({})).then((rows) => {
      setMainRows(rows);
      onLgstGrpClick(rows[0] ?? null);
    });
  };

  const onSearch = () => fetchData({});

  // 저장 — 선택된 기준/운송사/차량 행을 합쳐 반환
  const onSave = () => {
    if (!(selectedMainRow || selectedSub01Row || selectedSub02Row)) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    onConfirm({
      ...selectedMainRow,
      ...selectedSub01Row,
      ...selectedSub02Row,
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition fields={[]} onSearch={onSearch} />

      {/* 3컬럼 배치: [좌: 물류운영그룹] [중: 운송사] [우: 차량]
          — SplitPane 으로 드래그 리사이즈. 외곽 div 높이 고정 필요. */}
      <div style={{ height: 500 }}>
        <SplitPane
          direction="horizontal"
          defaultSizes={[20, 20, 60]}
          minSizes={[15, 15, 25]}
          storageKey="preferedCarrPopup-outer"
        >
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={MAIN_COLUMN_DEFS}
            rowData={mainRows}
            rowSelection="single"
            selectedRow={selectedMainRow}
            onRowClicked={onLgstGrpClick}
            disableAutoSize
          />
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={SUB01_COLUMN_DEFS}
            rowData={sub01Rows}
            rowSelection="single"
            selectedRow={selectedSub01Row}
            onRowClicked={onCarrClick}
            disableAutoSize
          />
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={SUB02_COLUMN_DEFS}
            rowData={sub02Rows}
            rowSelection="single"
            selectedRow={selectedSub02Row}
            onRowClicked={(row: any) => setSelectedSub02Row(row ?? null)}
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
