import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { SplitPane } from "@/app/components/layout/SplitPane";
import { vehicleMgmtApi } from "../../../../resources/vehicleMgmt/vehicleMgmtApi";

import { useErrorAlert } from "@/hooks/useErrorAlert";
import { Lang } from "@/app/services/common/Lang";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";

type VehicleAddPopupProps = {
  onConfirm: (payload: any) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

const MAIN_COLUMN_DEFS = [
  { headerName: "No", align: "right" },
  {
    field: "CARR_CD",
    headerName: "LBL_CARRIER_CODE",
    width: 150,
    align: "center",
  },
  { field: "CARR_NM", headerName: "LBL_CARRIER_NAME", width: 150 },
  {
    field: "VEH_ID",
    headerName: "LBL_VEHICLE_CODE",
    width: 150,
    align: "center",
  },
  { field: "VEH_NO", headerName: "LBL_VEH_NO", width: 150 },
  {
    field: "VEH_TP_CD",
    headerName: "LBL_VEHICLE_TYPE",
    width: 150,
    align: "center",
  },
  { field: "VEH_TP_NM", headerName: "LBL_VEHICLE_TYPE_NAME", width: 150 },
  {
    field: "DRVR_ID",
    headerName: "LBL_DRIVER_CODE",
    width: 150,
    align: "center",
  },
  { field: "DRVR_NM", headerName: "LBL_DRIVER_NAME", width: 150 },
  {
    field: "LGST_GRP_CD",
    headerName: "LBL_LOGISTICS_GROUP_CODE",
    width: 150,
    align: "center",
  },
  { field: "LGST_GRP_NM", headerName: "LBL_LOGISTICS_GROUP_NAME", width: 150 },
];

export default function VehicleAddPopup({
  onConfirm,
  onClose,
}: VehicleAddPopupProps) {
  const [mainRows, setMainRows] = useState<any[]>([]);
  // 선택행 하이라이트용 (selectedRow prop) — single 선택
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // 조회조건 (물류운영그룹 그리드 필터)
  const [lgstGrpCd, setLgstGrpCd] = useState("");
  const [lgstGrpNm, setLgstGrpNm] = useState("");
  const [carrCd, setCarrCd] = useState("");
  const [carrNm, setCarrNm] = useState("");
  const [vehTp, setVehTp] = useState("");
  const [vehTpNm, setVehTpNm] = useState("");
  const [vehNo, setVehNo] = useState("");
  const [drvrId, setDrvrId] = useState("");
  const [drvrNm, setDrvrNm] = useState("");

  const showError = useErrorAlert();
  const { openPopup, closePopup } = usePopup();

  // 물류운영그룹 돋보기 → CommonPopup 코드 검색
  const openLgstGrpPopup = () => {
    openPopup({
      title: "LBL_LOGISTICS_GROUP_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLogisticsgroupCodeName"
          onApply={(picked: any) => {
            setLgstGrpCd(picked.CODE);
            setLgstGrpNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  //운송협력사코드
  const openCarrPopup = () => {
    openPopup({
      title: "LBL_CARRIER_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectCarrList"
          onApply={(picked: any) => {
            setCarrCd(picked.CODE);
            setCarrNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  //차량유형
  const openVehTpPopup = () => {
    openPopup({
      title: "LBL_VEHICLE_TYPE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectVehTpList"
          onApply={(picked: any) => {
            setVehTp(picked.CODE);
            setVehTpNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  //운전자코드
  const openDrvrPopup = () => {
    openPopup({
      title: "LBL_DRIVER_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectDrvrList"
          onApply={(picked: any) => {
            setDrvrId(picked.CODE);
            setDrvrNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

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

  // 메인 조회
  const fetchData = (extraParams: any) => {
    runSearch(vehicleMgmtApi.getVehPopLgstGrp({ ...extraParams })).then(
      (rows) => {
        setMainRows(rows);
      },
    );
  };

  const onSearch = () =>
    fetchData({
      LGST_GRP_CD: lgstGrpCd,
      CARR_CD: carrCd,
      VEH_TP_CD: vehTp,
      VEH_NO: vehNo,
      DRVR_ID: drvrId,
    });

  const searchFields: GridSearchField[] = [
    {
      type: "popup",
      label: "LBL_LOGISTICS_GROUP_CODE",
      code: lgstGrpCd,
      name: lgstGrpNm,
      onChangeCode: setLgstGrpCd,
      onChangeName: setLgstGrpNm,
      onClickSearch: openLgstGrpPopup,
    },
    {
      type: "popup",
      label: "LBL_CARRIER_CODE",
      code: carrCd,
      name: carrNm,
      onChangeCode: setCarrCd,
      onChangeName: setCarrNm,
      onClickSearch: openCarrPopup,
    },
    {
      type: "popup",
      label: "LBL_VEHICLE_TYPE",
      code: vehTp,
      name: vehTpNm,
      onChangeCode: setVehTp,
      onChangeName: setVehTpNm,
      onClickSearch: openVehTpPopup,
    },
    { label: "LBL_VEH_NO", value: vehNo, onChange: setVehNo },
    {
      type: "popup",
      label: "LBL_DRIVER_CODE",
      code: drvrId,
      name: drvrNm,
      onChangeCode: setDrvrId,
      onChangeName: setDrvrNm,
      onClickSearch: openDrvrPopup,
    },
  ];

  // 동기화 저장 — 기준/적용/그룹선택 각 1행으로 dsSave 파라미터 구성
  const onSave = () => {
    if (!selectedRow) {
      showError(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    onConfirm(selectedRow);
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
          defaultSizes={[20, 20, 60]}
          minSizes={[15, 15, 25]}
          storageKey="lgstSync-outer"
        >
          <DataGrid
            layoutType="plain"
            actions={[]}
            columnDefs={MAIN_COLUMN_DEFS}
            rowData={mainRows}
            rowSelection="single"
            selectedRow={selectedRow}
            onRowSelected={(row: any) => setSelectedRow(row)}
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
