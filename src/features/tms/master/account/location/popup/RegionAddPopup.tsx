"use client";
// 권역추가 팝업 (센차 pop/LocationRegion 대응).
//   - 물류운영그룹/권역코드/권역명/국가코드/국가명 으로 권역 검색(zoneSearch)
//   - 권역 단일 선택 후 적용 → 선택 착지(locRows)에 saveZone({ZONE_LIST, LOC_LIST})
//   - 적용 성공 시 onApplied (부모가 등록권역 sub 재조회 + 팝업 닫기)

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import DataGrid from "@/app/components/grid/DataGrid";
import { locationApi as api } from "../LocationApi";
import { Lang } from "@/app/services/common/Lang";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import {
  PopupSearchCondition,
  type GridSearchField,
} from "@/app/components/popup/PopupSearchCondition";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { JSX } from "react/jsx-runtime";
import { usePopup } from "@/app/components/popup/PopupContext";

type Props = {
  /** 권역을 추가할 대상 착지 행들 (메인 선택) */
  locRows: any[];
  onApplied: () => void;
  onClose: () => void;
};

const ZONE_COLUMN_DEFS = [
  { headerName: "No" },
  { field: "ZN_CD", headerName: "LBL_ZONE_CD", width: 150 },
  { field: "ZN_NM", headerName: "LBL_ZONE_NM", flex: 1, minWidth: 150 },
  {
    field: "CTRY_CD",
    headerName: "LBL_COUNTRY_CODE",
    width: 120,
    align: "center",
  },
  { field: "CTRY_NM", headerName: "LBL_COUNTRY_NAME", width: 140 },
  {
    field: "LGST_GRP_CD",
    headerName: "LBL_LOGISTICS_GROUP",
    width: 140,
    align: "center",
  },
];

export default function RegionAddPopup({ locRows, onApplied, onClose }: Props) {
  const [lgstGrpCd, setLgstGrpCd] = useState("");
  const [lgstGrpNm, setLgstGrpNm] = useState("");
  const [znCd, setZnCd] = useState("");
  const [znNm, setZnNm] = useState("");
  const [znName, setZnName] = useState("");
  const [ctryCd, setCtryCd] = useState("");
  const [ctryNm, setCtryNm] = useState("");
  const [ctryName, setCtryName] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

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

  // 권역
  const openZnPopup = () => {
    openPopup({
      title: "LBL_ZONE_CD",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectZoneCodeName"
          onApply={(picked: any) => {
            setZnCd(picked.CODE);
            setZnNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  // 국가
  const openCountryPopup = () => {
    openPopup({
      title: "LBL_COUNTRY_CD",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectCountryCodeName"
          onApply={(picked: any) => {
            setCtryCd(picked.CODE);
            setCtryNm(picked.NAME);
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });
  };

  const search = (override?: Record<string, string>) => {
    api
      .searchZoneForAdd({
        LGST_GRP_CD: lgstGrpCd,
        ZONE_CD: znCd,
        ZONE_NM: znName,
        CTRY_CD: ctryCd,
        CTRY_NM: ctryName,
        ...override,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        setRows(res.data?.data?.dsOut ?? []);
        setSelected(null);
      })
      .catch((e: any) =>
        showErrorModal(
          e?.response?.data?.error?.message ??
            e?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApply = () => {
    if (!selected) {
      showErrorModal(Lang.get("MSG_SELECT_NO_DATA"));
      return;
    }
    api
      .saveZone({ ZONE_LIST: [selected], LOC_LIST: locRows })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
          return;
        }
        // 저장됨 알림 → "확인" 클릭 시 알림 + 본 팝업(onApplied 의 closePopup) 동시 종료
        showInfoModal(
          Lang.get("MSG_SAVE_CMPLT"),
          Lang.get("BTN_OK"),
          onApplied,
        );
      })
      .catch((e: any) =>
        showErrorModal(
          e?.response?.data?.error?.message ??
            e?.message ??
            Lang.get("TTL_ERR"),
        ),
      );
  };

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
      label: "LBL_ZONE_CD",
      code: znCd,
      name: znNm,
      onChangeCode: setZnCd,
      onChangeName: setZnNm,
      onClickSearch: openZnPopup,
    },
    { label: "LBL_ZONE_NM", value: znName, onChange: setZnName },
    {
      type: "popup",
      label: "LBL_COUNTRY_CODE",
      code: ctryCd,
      name: ctryNm,
      onChangeCode: setCtryCd,
      onChangeName: setCtryNm,
      onClickSearch: openCountryPopup,
    },
    {
      label: "LBL_COUNTRY_NAME",
      value: ctryName,
      onChange: setCtryName,
    },
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 조회조건 — 공통 컴포넌트 */}
      <PopupSearchCondition fields={searchFields} onSearch={() => search()} />

      {/* 권역 목록 */}
      <div style={{ height: 380 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={ZONE_COLUMN_DEFS}
          rowData={rows}
          pagination
          pageSize={10}
          rowSelection="single"
          selectedRow={selected}
          onRowSelected={(row: any) => setSelected(row ?? null)}
          onRowDoubleClicked={onApply}
          disableAutoSize
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={onApply}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_APPLY")}
        </Button>
      </div>
    </div>
  );
}
