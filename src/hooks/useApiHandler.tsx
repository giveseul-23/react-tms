import { usePopup } from "@/app/components/popup/PopupContext";
import ErrorConfirmModal from "@/views/common/ErrorPopup";

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
          <ErrorConfirmModal
            title="확인"
            description={successMessage}
            onClose={closePopup}
            onConfirm={closePopup}
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
          <ErrorConfirmModal
            title="에러"
            description={message}
            onClose={closePopup}
            onConfirm={closePopup}
          />
        ),
        width: "lg",
      });

      throw err;
    }
  };

  return { handleApi };
}
