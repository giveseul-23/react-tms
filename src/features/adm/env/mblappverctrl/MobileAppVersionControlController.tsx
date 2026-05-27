import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { usePopup } from "@/app/components/popup/PopupContext";
import {
  makeAddAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import { MobileAppVersionControlApi } from "./MobileAppVersionControlApi";
import { MAIN_COLUMN_DEFS } from "./MobileAppVersionControlColumns";
import MobileAppInstallerUploadPopup from "./popup/MobileAppInstallerUploadPopup";
import type {
  MobileAppVersionControlModel,
  GridKey,
} from "./MobileAppVersionControlModel";

type ControllerProps = {
  menuCd: string;
  model: MobileAppVersionControlModel;
};

export function useMobileAppVersionControlController({
  menuCd,
  model,
}: ControllerProps) {
  const { openPopup, closePopup } = usePopup();
  const base = useBaseController<GridKey>({
    model,
    api: {
      search: (params) =>
        MobileAppVersionControlApi.getMobileAppVersionControlList(menuCd, {
          ...params,
        }),
      save: (payload) =>
        MobileAppVersionControlApi.saveMobileAppVersionControl({
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
    },
  });

  const handleAdd = useCallback(() => {
    base.addRow("main", {
      PLATFORM: "",
      PCKG_NM: "",
      VER_CD: "",
      VER_NM: "",
      DOWNURL: "",
      RMK: "",
    });
  }, [base]);

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        MobileAppVersionControlApi.saveMobileAppVersionControl({
          dsSave: payload.dsSave,
          MENU_CD: menuCd,
        }),
      ),
    [base, menuCd],
  );

  const handleUploadConfirm = useCallback(
    async (row: any, file: File) => {
      await base.callAjax(
        MobileAppVersionControlApi.uploadAppInstaller(file, {
          MENU_CD: menuCd,
          JSON_READ_PASS: "Y",
          RESPONSE_CONTENT_TYPE: "text/html",
          PLATFORM: row?.PLATFORM ?? "",
          PCKG_NM: row?.PCKG_NM ?? "",
        }),
        "MSG_FILE_UPLOAD_CMPLT",
      );

      closePopup();
      base.search();
    },
    [base, closePopup, menuCd],
  );

  const handleOpenUploadPopup = useCallback(
    (row: any) => {
      if (!row?.PLATFORM || !row?.PCKG_NM) {
        base.alert("플랫폼과 패키지명을 먼저 확인해주세요.");
        return;
      }

      openPopup({
        title: "BTN_UPLOAD_MBL_INSTALLER",
        content: (
          <MobileAppInstallerUploadPopup
            platform={row.PLATFORM}
            packageName={row.PCKG_NM}
            onConfirm={(file) => {
              void handleUploadConfirm(row, file);
            }}
            onClose={closePopup}
          />
        ),
        width: "2xl",
      });
    },
    [base, closePopup, handleUploadConfirm, openPopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: handleAdd }),
      makeSaveAction({ onClick: handleSave }),
    ],
    [handleAdd, handleSave],
  );

  return {
    fetchMobileAppVersionControlList: base.fetchList,
    onSearchCallback: base.onSearchCallback,
    mainActions,
    handleOpenUploadPopup,
  };
}
