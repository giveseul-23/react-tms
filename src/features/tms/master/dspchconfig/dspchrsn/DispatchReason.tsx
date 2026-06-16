"use client";

// 배차사유관리 (서버 vc.view.mdl.tms.master.dspchconfig.dspchrsn.DispatchReason)
// 메인(배차사유) + 상세(배차사유 상세) 1:1 cascade.

import { MasterDetailPage } from "@/app/components/layout/presets/MasterDetailPage";
import DataGrid from "@/app/components/grid/DataGrid";

import { useDispatchReasonModel } from "./DispatchReasonModel";
import { useDispatchReasonController } from "./DispatchReasonController";
import { MAIN_COLUMN_DEFS, DETAIL_COLUMN_DEFS } from "./DispatchReasonColumns";

export const MENU_CODE = "MENU_DISPATCH_REASON_MGMT";

export default function DispatchReason() {
  const model = useDispatchReasonModel(MENU_CODE);
  const ctrl = useDispatchReasonController({ model });

  return (
    <MasterDetailPage
      menuCode={MENU_CODE}
      defaultSizes={[50, 50]}
      defaultDirection="horizontal"
      storageKey={model.storageKeys.outer}
      searchProps={{
        fetchFn: ctrl.fetchList,
        onSearchCallback: ctrl.onSearchCallback,
        ...model.bindSearch(),
      }}
      master={
        <DataGrid
          {...model.bind("main")}
          columnDefs={MAIN_COLUMN_DEFS}
          onRowClicked={ctrl.onMainGridClick}
          actions={ctrl.mainActions}
        />
      }
      detail={
        <DataGrid
          {...model.bind("detail")}
          columnDefs={DETAIL_COLUMN_DEFS}
          actions={ctrl.detailActions}
        />
      }
    />
  );
}
