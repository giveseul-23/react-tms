"use client";
// 도로명/우편번호 검색 팝업 (센차 AddressSearchPop 대응).
//   - 조회조건(우편번호/주소) + 그리드 표준 스타일 (GridSearchPopupLayout)
//   - 행 선택 후 적용 → onConfirm(payload) 로 선택 행 반환 (AddressPop 이 우편번호 반영)
//   ※ 검색 API 는 미연동(스텁) — fetchData 의 URL/파라미터를 실제 주소검색 서비스로 교체.

import { useState } from "react";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
import { commonApi as api } from "@/app/services/common/commonApi";
import { usePopup } from "./PopupContext";
import ConfirmModal from "./ConfirmPopup";

type Props = {
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
};

export function AddressSearchPop({ onConfirm, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [rows, setRows] = useState<any[]>([]);
  const [selectedMainRow, setSelectedMainRow] = useState<any>(null);

  const [loadNm, setLoadNm] = useState("");

  const withRid = (rows: any[]) =>
    rows.map((r, i) => ({ ...r, __rid__: r.__rid__ ?? `__r${i}` }));

  // 주소검색 API 호출 — 미연동(스텁). 실제 서비스 URL/파라미터로 교체.
  const fetchData = (payload: any) => {
    api
      .searchTariffVehicleTypeList(payload)
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return [];
        }
        return setRows(withRid(res.data?.data?.dsOut ?? []));
      })
      .catch((err: any) => {
        showError(
          err?.response?.data?.error?.message ??
            err?.message ??
            "조회에 실패했습니다.",
        );
        return [];
      });
  };

  const onSearch = () => {
    if (loadNm === "" || loadNm === undefined || loadNm === null) {
      openPopup({
        title: "",
        content: (
          <ConfirmModal
            type="error"
            description="검색어를 입력하세요."
            onClose={closePopup}
          />
        ),
        width: "sm",
      });
    }
    fetchData({ SEARCH_FIELD: loadNm });
  };

  const onApply = (payload: Record<string, string>) => {
    api
      .getAreaCode({
        addr1: payload.roadAddr,
        ...payload,
      })
      .then((res: any) => {
        if (res?.data?.success === false) {
          showError(res.data?.msg ?? "조회에 실패했습니다.");
          return [];
        }

        const resData = res.data.data;

        onConfirm({
          ZIP_CD: payload.zipNo,
          STT_CD: resData.STT_CD,
          STT_NM: resData.STT_NM,
          CTY_CD: resData.CTY_CD,
          CTY_NM: resData.CTY_NM,
          DTL_ADDR1: payload.roadAddr,
        });
      });
  };

  // 라벨은 언어팩 키만 (PopupSearchCondition 이 내부 번역) — Lang.get 금지.
  const fields: GridSearchField[] = [
    { label: "LBL_ROAD_NAME", value: loadNm, onChange: setLoadNm },
  ];

  const columnDefs = [
    { headerName: "LBL_STREENAME_ADDRESS", field: "roadAddr", width: 330 },
    { headerName: "LBL_LOT_ADDRESS", field: "jibunAddr", width: 330 },
    { field: "zipNo", hide: true },
    { field: "siNm", hide: true },
    { field: "sggNm", hide: true },
    { field: "DLVRY_DIST_GB", hide: true },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      selectedBadgeFields={["roadAddr"]}
      selectPrompt="주소를 선택하세요"
      onSearch={onSearch}
      onConfirm={onApply}
      onClose={onClose}
    />
  );
}
function showError(_arg0: any) {
  throw new Error("Function not implemented.");
}
