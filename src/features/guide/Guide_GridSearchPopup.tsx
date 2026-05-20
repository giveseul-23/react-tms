"use client";

// ────────────────────────────────────────────────────────────────
// [가이드] 그리드 조회 팝업 템플릿 — GridSearchPopupLayout 사용 패턴
//
// 사용 방법
// 1. 이 파일을 대상 폴더(예: src/features/tms/<도메인>/popup/)로 복사
//    파일명 / 컴포넌트명 교체  (Guide_GridSearchPopup.tsx → MyGridSearchPopup.tsx)
// 2. API 호출 (fetchData) 의 URL/파라미터 교체
// 3. fields 배열의 라벨/state 교체 (text / combo 혼용 가능)
// 4. columnDefs 의 컬럼 교체 — sendField 매핑은 호출측 payload 키 형태
// 5. selectedBadgeFields, selectedLabel 등 prop 화면별 교체
//
// 이 템플릿이 보여주는 패턴
// - GridSearchPopupLayout 한 줄로 조회바 + 선택배지 + 그리드 + 버튼 골격 다 해결
// - fields 배열: text/combo 혼용 (콤보는 useCommonStores 로 옵션 로드)
// - columnDefs 의 sendField: payload key 매핑 (RETURN_* 등)
// - 팝업은 dumb: onConfirm 그대로 전달. 도메인 메모/플래그(CHGVEH_MEMO 등)는
//   호출측 Controller 의 onConfirm 콜백에서 머지 (액션 책임)
// ────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import {
  GridSearchPopupLayout,
  type GridSearchField,
} from "@/app/components/popup/GridSearchPopupLayout";
// TODO: 실제 API 모듈로 교체
// import { myFeatureApi } from "@/features/tms/<domain>/myFeatureApi";

type GuideGridSearchPopupProps = {
  onConfirm: (payload: Record<string, any>) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

// 화면 고유 상수 (필요 시)
const OPER_TYPE = "100";

export default function GuideGridSearchPopup({
  onConfirm,
  onClose,
  initialValues = {},
}: GuideGridSearchPopupProps) {
  // ── 1. 조회 결과 rows ─────────────────────────────────────
  const [rows, setRows] = useState<any[]>([]);

  // ── 2. 조회 조건 state — 필드별 useState ──────────────────
  const [vehicleNo, setVehicleNo] = useState(initialValues.VEH_NO ?? "");
  const [driverName, setDriverName] = useState("");
  const [region, setRegion] = useState("");

  // ── 3. 콤보 옵션 (있다면) ─────────────────────────────────
  const { stores } = useCommonStores({
    preferredZone: { sqlProp: "CODE", keyParam: "PREFERRED ZONE CD" },
  });

  // ── 4. 에러 모달 — 조회/적용 실패 시 일관된 ConfirmModal 표시
  const showError = useErrorAlert();

  // ── 5. 초기 1회 조회 (필요 없으면 useEffect 제거) ─────────
  useEffect(() => {
    fetchData({ VEH_OP_TP: OPER_TYPE });
  }, []);

  // ── 6. API 호출 함수 — 한 곳에서 정의해 onSearch/초기조회 공유
  //      success:false / 네트워크 에러 모두 showError 로 통일
  const fetchData = (extraParams: Record<string, any>) => {
    // TODO: 실제 api 호출로 교체
    // myFeatureApi
    //   .getList({ VEH_OP_TP: OPER_TYPE, ...extraParams })
    //   .then((res) => {
    //     if (res?.data?.success === false) {
    //       showError(res.data?.msg ?? "조회에 실패했습니다.");
    //       return;
    //     }
    //     setRows(res.data.result ?? res.data.data ?? []);
    //   })
    //   .catch((err) => {
    //     showError(
    //       err?.response?.data?.error?.message ??
    //         err?.message ??
    //         "조회에 실패했습니다.",
    //     );
    //   });
    console.log("fetchData", extraParams);
    setRows([]);
  };

  // ── 7. 조회 버튼 클릭 ─────────────────────────────────────
  const onSearch = () => {
    fetchData({
      VEH_NO: vehicleNo,
      DRVR_NM: driverName,
      PRFRD_ZN_CD: region,
      VEH_OP_TP: OPER_TYPE,
    });
  };

  // ── 8. fields 배열 — text / combo 혼용 가능 ───────────────
  const fields: GridSearchField[] = [
    { label: "차량번호", value: vehicleNo, onChange: setVehicleNo },
    { label: "운전자명", value: driverName, onChange: setDriverName },
    {
      label: "선호권역",
      value: region,
      onChange: setRegion,
      type: "combo",
      options: stores.preferredZone,
      placeholder: "선택",
    },
  ];

  // ── 9. columnDefs ── sendField 는 적용 시 payload key 로 매핑됨
  const columnDefs = [
    { headerName: "No", width: 30 },
    // hidden PK/외래키 컬럼 — payload 에 함께 보내야 하면 sendField 명시
    {
      field: "LGST_GRP_CD",
      sendField: "RETURN_LGST_GRP_CD",
      hide: true,
    },
    {
      field: "VEH_ID",
      sendField: "RETURN_VEH_ID",
      hide: true,
    },
    // 표시 컬럼
    {
      headerName: "차량번호",
      field: "VEH_NO",
      sendField: "RETURN_VEH_NO",
      width: 130,
    },
    {
      headerName: "운전자명",
      field: "DRVR_NM",
      sendField: "RETURN_DRVR_NM",
      width: 110,
    },
    {
      headerName: "차량유형명",
      field: "VEH_TP_NM",
      sendField: "RETURN_VEH_TP_NM",
      width: 130,
    },
  ];

  return (
    <GridSearchPopupLayout
      fields={fields}
      columnDefs={columnDefs}
      rows={rows}
      gridHeight={400}
      // 선택 배지에 표시할 3개 필드 (row 의 키)
      selectedBadgeFields={["VEH_NO", "DRVR_NM", "VEH_TP_NM"]}
      onSearch={onSearch}
      // 팝업은 dumb — 도메인 메모/플래그는 Controller 의 onConfirm 콜백에서 머지
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

// ────────────────────────────────────────────────────────────────
// [참고] 호출측 Controller 에서 PopupShell 로 열기
//        도메인 메모/플래그는 여기서 머지 (액션 책임이 한 곳에 모임)
//
//   import { usePopup } from "@/app/components/popup/PopupContext";
//   import MyGridSearchPopup from "./popup/MyGridSearchPopup";
//
//   openPopup({
//     title: "차량 선택",
//     content: (
//       <MyGridSearchPopup
//         initialValues={{ VEH_NO: row.VEH_NO }}
//         onConfirm={(ie) => {
//           closePopup();
//           base
//             .callAjax(
//               api.assign(
//                 // 선택 행들에 팝업이 만든 payload(ie) + 도메인 메모 머지
//                 selectedRows.map((row) => ({
//                   ...row,
//                   ...ie,
//                   CHGVEH_MEMO: "운송협력사 요청",
//                 })),
//               ),
//               "변경되었습니다.",
//             )
//             .then(() => base.search());
//         }}
//         onClose={closePopup}
//       />
//     ),
//     width: "2xl",
//   });
//
// ────────────────────────────────────────────────────────────────
// [참고] columnDefs 의 sendField 매핑 원리
//
//   buildPayload 가 columnDefs.reduce 로 동작:
//     { field: "VEH_NO", sendField: "RETURN_VEH_NO" }
//     → row.VEH_NO 값이 payload.RETURN_VEH_NO 로 들어감
//
//   sendField 생략하면 field 명 그대로 사용 (예: field:"VEH_NO" → payload.VEH_NO)
//   hidden 컬럼이라도 sendField 만 있으면 payload 에 포함됨 → 외래키 전달 시 유용
// ────────────────────────────────────────────────────────────────
//
// [참고] 변형
//
//   - 콤보 필드 없는 화면: useCommonStores 호출 제거, fields 에서 type:"combo" 항목 빼기
//   - 초기 조회 안 함: useEffect 제거, 사용자가 조회 버튼 누를 때만 fetchData 호출
//   - 그리드 높이 다름: gridHeight={350} 등으로 조정
//   - 선택 배지 라벨 변경: selectedLabel="선택됨 ✓" 추가
//   - 도메인별 메모/플래그 키 추가: 팝업은 단순 onConfirm 전달, Controller 의
//     onConfirm 콜백에서 payload 머지 (위 [참고] 의 CHGVEH_MEMO 예시 참고)
// ────────────────────────────────────────────────────────────────
