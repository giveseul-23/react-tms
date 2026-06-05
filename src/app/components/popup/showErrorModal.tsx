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
