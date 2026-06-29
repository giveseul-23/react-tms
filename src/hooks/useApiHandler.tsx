import { usePopup } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import { Lang } from "@/app/services/common/Lang";

export function useApiHandler() {
  const { openPopup, closePopup } = usePopup();

  const handleApi = async (
    apiPromise: Promise<any>,
    successMessage = "MSG_SAVE_CMPLT",
  ) => {
    const showError = (description: string) => {
      openPopup({
        title: "LBL_ERROR",
        type: "error",
        content: (
          <ConfirmModal
            title={Lang.get("LBL_ERROR")}
            description={description}
            onClose={closePopup}
            type={"error"}
          />
        ),
        width: "lg",
      });
    };

    // 에러가 아닌 단순 알림(info) — 예: 저장할 데이터 없음.
    const showAlarm = (description: string) => {
      openPopup({
        type: "check",
        content: (
          <ConfirmModal
            title="알림"
            description={description}
            onClose={closePopup}
            type={"check"}
          />
        ),
        width: "lg",
      });
    };

    // 에러가 아닌 알림으로 처리할 메시지 — 서버가 코드 또는 번역문(Lang.get) 어느 쪽으로 보내도 매칭.
    const ALARM_CODES = ["MSG_NO_DATA_TO_SAVE"];
    const ALARM_SET = new Set(ALARM_CODES.flatMap((c) => [c, Lang.get(c)]));

    try {
      const res = await apiPromise;

      // 서버가 HTTP 200 으로 비즈니스 에러를 알리는 경우 (success: false)
      if (res?.data?.success === false) {
        const message =
          res.data?.msg ??
          res.data?.error?.message ??
          (typeof res.data?.error === "string" ? res.data.error : null) ??
          "처리 중 오류가 발생했습니다.";
        const msgStr = String(message);
        // MSG_NO_DATA_TO_SAVE(코드/번역문)는 에러가 아닌 알림으로 표시
        if (ALARM_SET.has(msgStr)) {
          showAlarm(ALARM_CODES.includes(msgStr) ? Lang.get(msgStr) : msgStr);
        } else {
          showError(msgStr);
        }
        // catch 에서 modal 중복 표시 방지 마커
        throw Object.assign(new Error(msgStr), { __handled: true });
      }

      openPopup({
        type: "confirm",
        content: (
          <ConfirmModal
            title="확인"
            description={Lang.get(successMessage)}
            onClose={closePopup}
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
