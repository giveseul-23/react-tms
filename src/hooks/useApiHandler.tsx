import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";

export function useApiHandler() {
  const { openPopup, closePopup } = usePopup();

  const handleApi = async (
    apiPromise: Promise<any>,
    successMessage = "저장되었습니다.",
  ) => {
    const showError = (description: string) => {
      openPopup({
        content: (
          <ConfirmModal
            title="에러"
            description={description}
            onClose={closePopup}
            onConfirm={closePopup}
            type={"error"}
          />
        ),
        width: "lg",
      });
    };

    try {
      const res = await apiPromise;

      // 서버가 HTTP 200 으로 비즈니스 에러를 알리는 경우 (success: false)
      if (res?.data?.success === false) {
        const message =
          res.data?.msg ??
          res.data?.error?.message ??
          (typeof res.data?.error === "string" ? res.data.error : null) ??
          "처리 중 오류가 발생했습니다.";
        showError(String(message));
        // catch 에서 modal 중복 표시 방지 마커
        throw Object.assign(new Error(String(message)), { __handled: true });
      }

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
      // 비즈니스 에러는 try 안에서 이미 modal 표시했으므로 그대로 전파만
      if (err?.__handled) throw err;

      const message =
        err?.response?.data?.error?.message ??
        String(err?.response?.data?.error ?? err?.message ?? err);

      showError(message);

      throw err;
    }
  };

  return { handleApi };
}
