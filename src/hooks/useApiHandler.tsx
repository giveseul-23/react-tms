import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/views/common/ConfirmPopup";

export function useApiHandler() {
  const { openPopup, closePopup } = usePopup();

  const handleApi = async (
    apiPromise: Promise<any>,
    successMessage = "저장되었습니다.",
  ) => {
    try {
      const res = await apiPromise;

      openPopup({
        content: (
          <ConfirmModal
            title="확인"
            description={successMessage}
            onClose={closePopup}
            onConfirm={closePopup}
            type={"confirm"}
          />
        ),
        width: "lg",
      });

      return res;
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ??
        String(err?.response?.data?.error ?? err);

      openPopup({
        content: (
          <ConfirmModal
            title="에러"
            description={message}
            onClose={closePopup}
            onConfirm={closePopup}
            type={"error"}
          />
        ),
        width: "lg",
      });

      throw err;
    }
  };

  return { handleApi };
}
