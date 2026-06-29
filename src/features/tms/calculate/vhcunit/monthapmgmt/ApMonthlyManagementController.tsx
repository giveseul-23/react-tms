import { useCallback, useRef, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { apMonthlyManagementApi as api } from "./ApMonthlyManagementApi";
import { MENU_CODE } from "./ApMonthlyManagement";
import {
  MONTHLY_MAIN_HEAD,
  MONTHLY_MAIN_TAIL,
  buildMonthlyColumns,
} from "./ApMonthlyManagementColumns";
import {
  makeExcelGroupAction,
  makeSaveAction,
} from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  ApMonthlyManagementModel,
  GridKey,
} from "./ApMonthlyManagementModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { Lang } from "@/app/services/common/Lang";
import { CreateMonthlyApPop } from "./popup/CreateMonthlyApPop";

interface Args {
  model: ApMonthlyManagementModel;
}

export function useApMonthlyManagementController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { openPopup, closePopup } = usePopup();

  // dynamicColumns 캐시
  const chgCacheRef = useRef<{ key: string; list: any[] }>({
    key: "",
    list: [],
  });

  const compactDate = useCallback(
    (value: unknown) => String(value ?? "").replaceAll("-", ""),
    [],
  );

  const buildSearchParams = useCallback(
    (params: Record<string, unknown> = {}) => {
      const srchObj = model.rawFiltersRef.current;
      const toDttm = compactDate(
        srchObj.SRCH_TO_DTTM ?? params.TO_DTTM ?? params.AP_DATE,
      );
      return {
        ...params,
        DIV_CD: srchObj.SRCH_AP_DIV_CD ?? params.DIV_CD,
        LGST_GRP_CD: srchObj.SRCH_AP_LGST_GRP_CD ?? params.LGST_GRP_CD,
        TO_DTTM: toDttm,
        AP_DATE: toDttm,
        END_DATE: toDttm,
      };
    },
    [compactDate, model.rawFiltersRef],
  );

  const minusOneMonth = useCallback(
    (value: unknown) => {
      const yyyymmdd = compactDate(value);
      if (yyyymmdd.length < 8) return yyyymmdd;
      const year = Number(yyyymmdd.substring(0, 4));
      const month = Number(yyyymmdd.substring(4, 6)) - 1;
      const day = Number(yyyymmdd.substring(6, 8));
      const date = new Date(year, month, day);
      date.setMonth(date.getMonth() - 1);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    },
    [compactDate],
  );

  const fetchList = useCallback(
    async (params: Record<string, unknown>) => {
      const searchParams = buildSearchParams(params);
      const divCd = searchParams.DIV_CD ?? "";
      const lgstGrpCd = searchParams.LGST_GRP_CD ?? "";
      const endDate = searchParams.TO_DTTM ?? "";
      const cacheKey = `${divCd}|${lgstGrpCd}|${endDate}`;

      if (chgCacheRef.current.key !== cacheKey) {
        try {
          const chgRes: any = await api.getUsedChgCd({
            DIV_CD: divCd,
            LGST_GRP_CD: lgstGrpCd,
            END_DATE: endDate,
          });
          const chgList =
            chgRes?.data?.result ?? chgRes?.data?.data?.dsOut ?? [];
          chgCacheRef.current = { key: cacheKey, list: chgList };
          model.setMainColumnDefs(
            buildMonthlyColumns(MONTHLY_MAIN_HEAD, MONTHLY_MAIN_TAIL, chgList),
          );
        } catch (err) {
          console.error("getUsedChgCd failed", err);
        }
      }

      return api.getList({
        ...searchParams,
        dynamicColumns: chgCacheRef.current.list,
        DIV_CD: divCd,
        LGST_GRP_CD: lgstGrpCd,
        END_DATE: endDate,
      });
    },
    [buildSearchParams, model],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
    },
    [model.grids.main],
  );

  const doAction = useCallback(
    (apiCall: () => Promise<any>) =>
      base.callAjax(apiCall(), { mask: "main" }).then(() => base.search()),
    [base],
  );

  const handleSave = useCallback(
    () =>
      base.saveGrid("main", (payload) =>
        api.save({
          dsSave: payload.dsSave,
        }),
      ),
    [base],
  );

  const openCreateMonthlyAp = useCallback(() => {
    const params = buildSearchParams(model.filtersRef.current);
    void base
      .callAjax(
        api.getApMonthlyDate({
          AP_DTTM: params.AP_DATE,
          DIV_CD: params.DIV_CD,
          LGST_GRP_CD: params.LGST_GRP_CD,
        }),
        { mask: "main" },
      )
      .then((res: any) => {
        const row = res?.data?.data?.dsOut?.[0] ?? {};
        openPopup({
          title: "BTN_CREATE_MONTHLY_AP",
          width: "lg",
          content: (
            <CreateMonthlyApPop
              initialValues={{
                DIV_CD: String(params.DIV_CD ?? ""),
                LGST_GRP_CD: String(params.LGST_GRP_CD ?? ""),
                FRM_DTTM: String(row.FRM_DTTM ?? ""),
                TO_DTTM: String(row.TO_DTTM ?? params.TO_DTTM ?? ""),
              }}
              onClose={closePopup}
              onConfirm={(payload) =>
                base.confirm(Lang.get("MSG_AP_MONTHLY_CONFIRM"), () => {
                  closePopup();
                  void doAction(() => api.createMonthlyAp(payload));
                })
              }
            />
          ),
        });
      });
  }, [base, buildSearchParams, closePopup, doAction, model.filtersRef, openPopup]);

  const uploadManualRate = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void doAction(() => api.uploadManualRate(file, buildSearchParams()));
    };
    input.click();
  }, [buildSearchParams, doAction]);

  const downloadBlob = useCallback((res: any, fallbackName: string) => {
    const contentDisposition = String(
      res?.headers?.["content-disposition"] ?? "",
    );
    const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
    const fileName = match ? decodeURIComponent(match[1]) : fallbackName;
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const downloadManualRateTemplate = useCallback(() => {
    void base
      .callAjax(api.downloadManualRatePrepare(buildSearchParams()), {
        mask: "main",
      })
      .then(() => api.downloadManualRate())
      .then((res) =>
        downloadBlob(res, `${menuName || MENU_CODE}_manual_rate.xlsx`),
      );
  }, [base, buildSearchParams, downloadBlob, menuName]);

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_CREATE_MONTHLY_AP",
        label: "BTN_CREATE_MONTHLY_AP",
        onClick: () => openCreateMonthlyAp(),
      },
      {
        type: "button",
        key: "BTN_CANCEL_MONTHLY_AP",
        label: "BTN_CANCEL_MONTHLY_AP",
        onClick: () => doAction(() => api.cancelMonthlyResult(buildSearchParams())),
      },
      {
        type: "dropdown",
        key: "BTN_MANUAL_RATE_MGMT",
        label: "BTN_MANUAL_RATE_MGMT",
        items: [
          {
            type: "button",
            key: "BTN_MANUAL_RATE_TEMPLATE",
            label: "BTN_MANUAL_RATE_TEMPLATE",
            onClick: downloadManualRateTemplate,
          },
          {
            type: "button",
            key: "BTN_MANUAL_RATE_UPLOAD",
            label: "BTN_MANUAL_RATE_UPLOAD",
            onClick: uploadManualRate,
          },
        ],
      },
      makeSaveAction({ onClick: handleSave }),
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM",
        label: "BTN_AP_SETTLEMENT_CONFIRM",
        onClick: () => doAction(() => api.confirm(buildSearchParams())),
      },
      {
        type: "button",
        key: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        label: "BTN_AP_SETTLEMENT_CONFIRM_CANCEL",
        onClick: () =>
          doAction(() =>
            api.cancelConfirm({
              ...buildSearchParams(),
              FRM_DTTM: minusOneMonth(buildSearchParams().TO_DTTM),
            }),
          ),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(buildSearchParams(model.filtersRef.current)),
        rows: model.grids.main.rows,
      }),
    ],
    [
      buildSearchParams,
      doAction,
      downloadManualRateTemplate,
      handleSave,
      menuName,
      minusOneMonth,
      model.filtersRef,
      model.grids.main,
      openCreateMonthlyAp,
      uploadManualRate,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
