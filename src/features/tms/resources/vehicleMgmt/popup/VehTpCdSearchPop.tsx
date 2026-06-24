"use client";

import { useEffect, useState } from "react";
import { commonApi as api } from "@/app/services/common/commonApi";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { usePopup } from "@/app/components/popup/PopupContext";

type Props = {
  // 선택된 물류운영그룹코드 — 차량유형 조회 스코프
  lgstGrpCd?: string;
  // 선택 행의 차량유형/제원을 폼 필드 patch 로 반환
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

// 표시 컬럼엔 없지만 폼(areaNo:1) 세팅에 필요한 제원 필드 — payload 동봉용 hidden.
const HIDDEN_SPEC_FIELDS = [
  "LDNG_PLT_QTY",
  "LDNG_RTNR_QTY",
  "LDNG_PBOX_QTY",
  "LDNG_BOX_QTY",
  "SCALE_VOL",
  "SCALE_WGT",
  "SCALE_PLT_QTY",
  "SCALE_RTNR_QTY",
  "SCALE_PBOX_QTY",
  "SCALE_BOX_QTY",
  "SCALE_FLEX_QTY1",
  "SCALE_FLEX_QTY2",
  "SCALE_FLEX_QTY3",
  "SCALE_FLEX_QTY4",
  "SCALE_FLEX_QTY5",
];

// 적재량(LDNG_*) → 최대치(MAX_*) 초기화 매핑 (센차 VehicleMain: MAX = LDNG)
const LDNG_TO_MAX: Record<string, string> = {
  LDNG_VOL: "MAX_VOL",
  LDNG_WGT: "MAX_WGT",
  LDNG_PLT_QTY: "MAX_PLT_QTY",
  LDNG_RTNR_QTY: "MAX_RTNR_QTY",
  LDNG_PBOX_QTY: "MAX_PBOX_QTY",
  LDNG_BOX_QTY: "MAX_BOX_QTY",
  LDNG_FLEX_QTY1: "MAX_FLEX_QTY1",
  LDNG_FLEX_QTY2: "MAX_FLEX_QTY2",
  LDNG_FLEX_QTY3: "MAX_FLEX_QTY3",
  LDNG_FLEX_QTY4: "MAX_FLEX_QTY4",
  LDNG_FLEX_QTY5: "MAX_FLEX_QTY5",
};

export default function VehTpCdSearchPop({
  lgstGrpCd,
  onConfirm,
  onClose,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [vehTpCd, setVehTpCd] = useState("");
  const [vehTpNm, setVehTpNm] = useState("");
  const [vehTpName, setVehTpName] = useState("");
  const showError = useErrorAlert();

  const { openPopup, closePopup } = usePopup();

  const openVehTpPopup = () => {
    openPopup({
      title: "LBL_VEHICLE_TYPE_CODE",
      width: "2xl",
      content: (
        <CommonPopup
          fetchFn={(params: any) =>
            api.searchVehicleType({ LGST_GRP_CD: lgstGrpCd, ...params })
          }
          onApply={(picked: any) => {
            setVehTpCd(picked.CODE);
            setVehTpNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  // combo 컬럼(연료/상세차종) 코드→명 표시용
  const { codeMap } = useCommonStores({
    exVehTcd: { sqlProp: "CODE", keyParam: "EX_VEH_TCD" },
    vehDtlTcd: { sqlProp: "CODE", keyParam: "VEH_DTL_TCD" },
  });

  const fetchData = (extra: Record<string, any>) => {
    api
      .getCodesAndNames({
        key: "dsOut",
        sqlProp: "selectLgstGrpVehTpCd",
        LGST_GRP_CD: lgstGrpCd ?? "",
        ...extra,
      })
      .then((res: any) => setRows(res.data?.data?.dsOut ?? []))
      .catch(() => showError("조회에 실패했습니다."));
  };

  // 초기 1회 조회 (선택된 물류운영그룹 기준 전체)
  useEffect(() => {
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = () =>
    fetchData({
      ...(vehTpCd && { VEH_TP_CD: vehTpCd }),
      ...(vehTpNm && { VEH_TP_NM: vehTpNm }),
      ...(vehTpName && { VEH_TP_NM: vehTpName }),
    });

  const fields: GridSearchField[] = [
    {
      label: "LBL_VEHICLE_TYPE_CODE",
      code: vehTpCd,
      name: vehTpNm,
      onChangeCode: (v: string) => {
        setVehTpCd(v);
        setVehTpNm(""); // 코드 수정 시 코드명 클리어
      },
      onChangeName: setVehTpNm,
      type: "popup",
      onClickSearch: openVehTpPopup,
    },
    {
      label: "LBL_VEHICLE_TYPE_NAME",
      value: vehTpName,
      onChange: setVehTpName,
    },
  ];

  // 표시 컬럼(센차 VehicleMain) + 폼 세팅용 hidden 제원
  const columnDefs = [
    { headerName: "No", width: 60 },
    { headerName: "LBL_VEHICLE_TYPE", field: "VEH_TP_CD", width: 80 },
    { headerName: "LBL_VEHICLE_TYPE_NAME", field: "VEH_TP_NM", width: 100 },
    { headerName: "LBL_FUEL_EFFICIENCY", field: "FUEL_EFFICIENCY", width: 100 },
    {
      headerName: "LBL_EX_VEH_TCD",
      field: "EX_VEH_TCD",
      codeKey: "exVehTcd",
      width: 130,
    },
    {
      headerName: "LBL_VEH_DTL_TCD",
      field: "VEH_DTL_TCD",
      codeKey: "vehDtlTcd",
      width: 100,
    },
    { headerName: "LBL_CBM", field: "LDNG_VOL", width: 100 },
    { headerName: "LBL_WEIGHT_KG", field: "LDNG_WGT", width: 100 },
    { headerName: "LBL_FLEX_QTY1", field: "LDNG_FLEX_QTY1", width: 100 },
    { headerName: "LBL_FLEX_QTY2", field: "LDNG_FLEX_QTY2", width: 100 },
    { headerName: "LBL_FLEX_QTY3", field: "LDNG_FLEX_QTY3", width: 100 },
    { headerName: "LBL_FLEX_QTY4", field: "LDNG_FLEX_QTY4", width: 100 },
    { headerName: "LBL_FLEX_QTY5", field: "LDNG_FLEX_QTY5", width: 100 },
    {
      headerName: "LBL_EMPTY_VEH_WGT",
      field: "EMPTY_VEH_WGT",
      type: "numeric",
      width: 100,
    },
    {
      headerName: "LBL_VEH_LENGTH",
      field: "VEH_LENGTH",
      type: "numeric",
      width: 100,
    },
    {
      headerName: "LBL_VEH_WIDTH",
      field: "VEH_WIDTH",
      type: "numeric",
      width: 100,
    },
    {
      headerName: "LBL_VEH_HEIGHT",
      field: "VEH_HEIGHT",
      type: "numeric",
      width: 100,
    },
    ...HIDDEN_SPEC_FIELDS.map((f) => ({ field: f, hide: true })),
  ];

  // 선택 payload 에 MAX_* (=LDNG_*) 파생값을 더해 부모로 전달
  const handleConfirm = (payload: Record<string, any>) => {
    const withMax = { ...payload };
    for (const [ldng, max] of Object.entries(LDNG_TO_MAX)) {
      withMax[max] = payload[ldng];
    }
    onConfirm(withMax);
  };

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      codeMap={codeMap}
      selectedBadgeFields={["VEH_TP_CD", "VEH_TP_NM"]}
      selectPrompt="그리드에서 차량유형을 선택하세요"
      onSearch={onSearch}
      confirmOnRowDoubleClick
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
