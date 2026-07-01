"use client";

// 정산대상_주문계약 (서버 vc.view.mdl.tms.claimSettlementManagement.ordercontract.SettlementOrderContract)
// 단일 그리드(주문계약 목록) + 다중선택. 주문별/기간합산 정산문서 생성 + 엑셀.

import { useMemo } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PageShell } from "@/app/components/layout/PageShell";
import { Pane } from "@/app/components/layout/Pane";
import { LayoutToggleButton } from "@/app/components/layout/LayoutToggleButton";
import { SettlementOrderContractSearch } from "./SettlementOrderContractSearch";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSettlementOrderContractModel } from "./SettlementOrderContractModel";
import { useSettlementOrderContractController } from "./SettlementOrderContractController";
import { buildMainColumnDefs } from "./SettlementOrderContractColumns";

export const MENU_CODE = "MENU_SETTLEMENT_TARGET_ORDER_CONSTRACT";

// 서버 리소스 권한 authId (센차 grid.authId). 그리드별 authId 단일 소스.
export const AUTH = { grids: { main: "MAIN_SETTLEMENT_ORDER_CONTRACT_MAIN" } };

export default function SettlementOrderContract() {
  const model = useSettlementOrderContractModel(MENU_CODE);
  const ctrl = useSettlementOrderContractController({ model });
  const columnDefs = useMemo(
    () => buildMainColumnDefs(model.codeMap),
    [model.codeMap],
  );

  if (model.searchMetaLoading) return <Skeleton className="h-24" />;

  return (
    <PageShell
      searchSlot={
        <SettlementOrderContractSearch
          meta={model.searchMeta}
          menuCode={MENU_CODE}
          moduleDefault="TMS"
          moduleDefaultRemove={["AR_CNTRCT_CD", "AR_CNTRCT_NM", "AR_CNTRCT"]}
          fetchFn={ctrl.fetchList}
          onSearchCallback={ctrl.onSearchCallback}
          // 센차 setCompToParamExclude
          excludes={[
            { column: "AR_TRF_LCD", as: "AR_TRF_LCD" },
            { column: "AR_STL_BASE_DT_TP", as: "AR_STL_BASE_DT_TP" },
            { column: "AR_CNTRCT_CD", as: "AR_CNTRCT_CD" },
            {
              column: "AR_DATE",
              as: { FROM: "AR_DATE_FROM", TO: "AR_DATE_TO" },
              transform: (v) => String(v ?? "").replace(/-/g, ""),
            },
          ]}
          layoutToggle={
            <LayoutToggleButton layout="side" onToggle={() => { }} visible={false} />
          }
          {...model.bindSearch()}
        />
      }
    >
      <Pane>
        <DataGrid
          {...model.bind("main")}
          authId={AUTH.grids.main}
          columnDefs={columnDefs}
          codeMap={model.codeMap}
          actions={ctrl.mainActions}
          rowSelection="multiple"
          audit={false}
        />
      </Pane>
    </PageShell>
  );
}
