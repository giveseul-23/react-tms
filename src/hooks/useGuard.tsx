import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";

export function useGuard() {
  const { openPopup, closePopup } = usePopup();

  const guardHasData = (data: any[], message = "선택된 데이터가 없습니다.") => {
    if (!data || data.length === 0) {
      openPopup({
        content: (
          <ConfirmModal
            title="확인"
            description={message}
            onClose={closePopup}
            onConfirm={closePopup}
            type="check"
          />
        ),
        width: "lg",
      });
      return false;
    }
    return true;
  };

  return { guardHasData };
}
