// React 컴포넌트 밖(예: makeExcelGroupAction 의 onClick)에서 에러 모달을 띄우는 헬퍼.
// PopupProvider 가 노출한 모듈 레벨 핸들(getPopupApi)을 사용한다.
import ConfirmModal from "./ConfirmPopup";
import { getPopupApi } from "./PopupContext";

export function showErrorModal(message: string) {
  const api = getPopupApi();
  if (!api) return;
  api.openPopup({
    type: "error",
    width: "lg",
    content: (
      <ConfirmModal
        type="error"
        title="에러"
        description={message}
        onClose={api.closePopup}
      />
    ),
  });
}

// 세션 만료(401) 모달 — 확인 클릭 시 onConfirm(로그아웃+리다이렉트) 실행.
// PopupProvider 미마운트(로그인 페이지 등)면 모달 없이 onConfirm 즉시 호출.
export function showSessionExpiredModal(
  message: string,
  onConfirm: () => void,
) {
  const api = getPopupApi();
  if (!api) {
    onConfirm();
    return;
  }
  api.openPopup({
    type: "error",
    width: "lg",
    content: (
      <ConfirmModal
        type="error"
        title="세션 만료"
        description={message}
        onClose={() => {
          api.closePopup();
          onConfirm();
        }}
      />
    ),
  });
}
