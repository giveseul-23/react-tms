"use client";

// 공지관리 (서버 vc.view.mdl.tms.dlvryManage.notice.Notice)
// 메인(공지) + 하단 탭(공지대상차량). 차량선택/공지내용/파일첨부 팝업 3종.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";
import { useNoticeModel } from "./NoticeModel";
import { useNoticeController } from "./NoticeController";
import { MAIN_COLUMN_DEFS, SUB01_COLUMN_DEFS } from "./NoticeColumns";

export const MENU_CODE = "MENU_NOTICE";

export default function Notice() {
  const model = useNoticeModel(MENU_CODE);
  const ctrl = useNoticeController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="vertical"
      storageKey={model.storageKeys.outer}
      searchProps={{
        moduleDefault: "TMS",
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          codeMap={model.codeMap}
          onRowClicked={ctrl.onMainGridClick}
          onRowDoubleClicked={ctrl.onRegisterPopup}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          layoutType="tab"
          tabs={[{ key: "TARGET", label: "LBL_TARGET_NOTI_VEH" }]}
          presets={{
            TARGET: {
              render: () => (
                <DataGrid
                  {...model.bind("sub01")}
                  columnDefs={SUB01_COLUMN_DEFS}
                  codeMap={model.codeMap}
                  actions={ctrl.sub01Actions}
                />
              ),
            },
          }}
          actions={[]}
        />
      }
    />
  );
}
