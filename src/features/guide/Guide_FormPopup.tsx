"use client";

// ────────────────────────────────────────────────────────────────
// [가이드] 폼 팝업 템플릿 — FormPopupLayout + Field 짜집기
//
// 사용 방법
// 1. 이 파일을 대상 폴더(예: src/features/tms/<도메인>/popup/)로 복사
//    파일명 / 컴포넌트명 교체  (Guide_FormPopup.tsx → MyFormPopup.tsx)
// 2. 필요한 필드만 남기고 나머지 삭제 — 각 필드는 Field 컴포넌트 한 줄 호출
// 3. label / state / onConfirm payload 만 교체
//
// 컴포넌트 책임 분리
// - PopupShell (호출측): dialog/header/overlay + 폭 결정 (openPopup({ width }))
// - FormPopupLayout (외곽): 카드 wrapper + 취소/확인 버튼 — 폭 관여 안 함
// - Field (각 필드): 라벨 + 입력 한 묶음. layout 가로/세로 × type text/textarea/combo
//
// 폭 조절은 호출측 openPopup({ width: "lg" | "xl" | "2xl" ... }) 만으로 — 단일 진실 소스
//
// Field 의 prop
//   layout: "horizontal" | "vertical"    가로 grid-cols-3 / 세로 mb-2
//   label: string
//   required?: boolean                    빨간 별표
//   disabled?: boolean                    bg-gray-200 readonly 스타일 (text only)
//   type: "text" | "textarea" | "combo"
//   value, onChange                       string state
//   placeholder?
//   rows?         (textarea)
//   options?      (combo — { CODE, NAME }[])
// ────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";

type GuideFormPopupProps = {
  onConfirm: (data: {
    reasonCode: string;
    memo: string;
    vehicleNo: string;
  }) => void;
  onClose: () => void;
  initialValues?: Record<string, any>;
};

export default function GuideFormPopup({
  onConfirm,
  onClose,
  initialValues = {},
}: GuideFormPopupProps) {
  // 폼 state — 필드별 useState
  const [reasonCode, setReasonCode] = useState("");
  const [memo, setMemo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType] = useState<string>(initialValues.VEH_TP_CD ?? "");

  // 콤보 옵션 — useCommonStores
  const { stores } = useCommonStores({
    reasonOptions: { sqlProp: "CODE", keyParam: "SAMPLE_RSN_CD" },
  });

  const isValid = !!(reasonCode && vehicleNo);

  return (
    <FormPopupLayout
      // 여러 필드 섞일 때만 space-y-4 추가. 한 필드짜리는 생략
      cardClassName="space-y-4"
      confirmLabel="확인"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() => onConfirm({ reasonCode, memo, vehicleNo })}
    >
      {/* 패턴 A — 가로형 입력 (짧은 코드/번호/명) */}
      <Field
        layout="horizontal"
        type="text"
        label="차량번호"
        required
        value={vehicleNo}
        onChange={setVehicleNo}
        placeholder="차량번호를 입력하세요"
      />

      {/* 패턴 B — 비편집(disabled) 입력 (부모행 readonly 정보) */}
      <Field
        layout="horizontal"
        type="text"
        disabled
        label="차량유형"
        value={vehicleType}
      />

      {/* 패턴 C — 세로형 + textarea (긴 텍스트) */}
      <Field
        layout="vertical"
        type="textarea"
        label="메모"
        rows={5}
        value={memo}
        onChange={setMemo}
        placeholder="상세 내용을 입력하세요"
      />

      {/* 패턴 D — 세로형 + ComboFilter (공통코드) */}
      <Field
        layout="vertical"
        type="combo"
        label="사유"
        value={reasonCode}
        onChange={setReasonCode}
        options={stores.reasonOptions ?? []}
        placeholder="선택하세요"
      />
    </FormPopupLayout>
  );
}

// ────────────────────────────────────────────────────────────────
// [참고] 호출측 Controller 에서 PopupShell 로 열기
//
//   import { usePopup } from "@/app/components/popup/PopupContext";
//   import MyFormPopup from "./popup/MyFormPopup";
//
//   const { openPopup, closePopup } = usePopup();
//
//   openPopup({
//     title: "폼 팝업 제목",
//     content: (
//       <MyFormPopup
//         initialValues={{ VEH_TP_CD: row.VEH_TP_CD }}
//         onConfirm={(data) => {
//           closePopup();
//           base.callAjax(api.save(data), "저장되었습니다");
//         }}
//         onClose={closePopup}
//       />
//     ),
//   });
//
// ────────────────────────────────────────────────────────────────
// [참고] 패턴 선택 가이드
//
//   짧은 입력 (코드/번호/명 등)        → A: layout="horizontal" type="text"
//   부모행 readonly 정보 표시          → B: layout="horizontal" type="text" disabled
//   메모/사유/설명 등 긴 텍스트         → C: layout="vertical"   type="textarea"
//   공통코드 선택 (드롭다운)            → D: layout="vertical"   type="combo"
//
//   필드 1개만 있을 때:
//     - FormPopupLayout 에서 cardClassName 생략 (space-y-4 불필요)
//     - 예: AppInstallSmsPopup (전화번호 1개만 입력)
//
//   필드 여러 개 섞일 때:
//     - cardClassName="space-y-4" 로 자동 간격
//     - 예: TemporaryVehicleChangePopup (5개 필드)
//
//   confirmLabel 변형:
//     - "확인" (기본) / "저장" / "전송" / "적용" 등 액션 의미에 맞춰 교체
//     - 취소 라벨은 cancelLabel prop 으로 변경 가능 (기본 "취소")
//
//   Field 만으로 부족할 때 (드문 케이스):
//     - 커스텀 입력 컴포넌트 필요 시 children 으로 자유 작성 가능
//       — Field 가 안 맞으면 그냥 <div>...<input/></div> 작성해도 무방
// ────────────────────────────────────────────────────────────────
