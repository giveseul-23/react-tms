// React 컴포넌트 밖(예: makeExcelUploadAction 의 onClick)에서 성공/안내 모달을 띄우는 헬퍼.
// PopupProvider 가 노출한 모듈 레벨 핸들(getPopupApi)을 사용한다. (showErrorModal 의 성공 버전)
import ConfirmModal from "./ConfirmPopup";
import { getPopupApi } from "./PopupContext";

export function showInfoModal(message: string, title = "확인") {
  const api = getPopupApi();
  if (!api) return;
  api.openPopup({
    type: "check",
    width: "lg",
    content: (
      <ConfirmModal
        type="check"
        title={title}
        description={message}
        onClose={api.closePopup}
      />
    ),
  });
}
