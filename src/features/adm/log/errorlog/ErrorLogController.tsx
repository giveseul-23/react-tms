import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { userErrorLogApi } from "./ErrorLogApi";
import type { ErrorLogModel, GridKey } from "./ErrorLogModel";
import { MENU_CD } from "./ErrorLog";
interface Args {
  model: ErrorLogModel;
}

export function useErrorLogController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });

  const fetchList = useCallback(
    (params: Record<string, unknown>) => userErrorLogApi.getList(params),
    [],
  );

  const fetchSub01 = useCallback(
    (row: any) =>
      userErrorLogApi.getErrorDescription({
        MENU_CD: MENU_CD,
        SEQ_NO: row.SEQ_NO
      }),
    [],
  );

  const onMainGridClick = useCallback(
    (row: any) =>
      base.handleRowClick("main", row, [
        { to: "sub01", fetch: fetchSub01 },
      ]),
    [base, fetchSub01],
  );

const onSearchCallback = useCallback(
  (data: any) => {
    model.grids.main.setData(data);

    const firstMain =
      model.grids.main.ref.current?.rows?.[0] ?? data?.rows?.[0] ?? null;

    if (firstMain) {
      userErrorLogApi
        .getErrorDescription({
          MENU_CD: MENU_CD,
          SEQ_NO: firstMain.SEQ_NO,
        })
        .then((res: any) => {
          if (res?.data?.success === false) {
            base.resetGrids(["sub01", "sub02"]);
            return;
          }

          const detail = res?.data?.data?.dsOut?.[0];
            model.grids.sub01.setData({
                rows: [{
                    ROOT_CAUSE_STACK: detail?.ROOT_CAUSE_STACK ?? "",
                }],
                totalCount: 1,
                page: 1,
                limit: 1,
        });

            model.grids.sub02.setData({
                rows: [{
                    PARAMETERS: detail?.PARAMETERS ?? "",
                }],
                totalCount: 1,
                page: 1,
                limit: 1,
            });
        })
        .catch((err: any) => {
          console.error(err);
          base.resetGrids(["sub01", "sub02"]);
        });
    } else {
      base.resetGrids(["sub01", "sub02"]);
    }
  },
  [base, model],
);
  return {
    fetchList,
    onMainGridClick,
    onSearchCallback
  };
}
