"use client";

import { useCallback } from "react";
import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";

// 조회/팝업 등 base.callAjax 를 못 쓰는 곳에서 에러 모달만 일관되게 띄울 때 사용.
// callAjax 와 달리 성공 모달은 띄우지 않음 — 조회/적용 같은 read-only 호출에 적합.
//
// 사용 예:
//   const showError = useErrorAlert();
//   api.getList({...})
//     .then((res) => {
//       if (res?.data?.success === false) {
//         showError(res.data?.msg ?? "조회에 실패했습니다.");
//         return;
//       }
//       setRows(res.data.result ?? []);
//     })
//     .catch((err) => {
//       showError(
//         err?.response?.data?.error?.message ?? err?.message ?? "조회에 실패했습니다.",
//       );
//     });
export function useErrorAlert() {
  const { openPopup, closePopup } = usePopup();

  return useCallback(
    (description: string) => {
      openPopup({
        type: "error",
        content: (
          <ConfirmModal
            title="에러"
            description={description}
            onClose={closePopup}
            type="error"
          />
        ),
        width: "lg",
      });
    },
    [openPopup, closePopup],
  );
}
