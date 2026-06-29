import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import { Lang } from "@/app/services/common/Lang";
import { apDailyReportResultApi as api } from "./ApDailyReportResultApi";
import { MENU_CODE } from "./ApDailyReportResult";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type {
  ApDailyReportResultModel,
  GridKey,
} from "./ApDailyReportResultModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";

interface Args {
  model: ApDailyReportResultModel;
}

const firstValue = (
  source: Record<string, any>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }
  return undefined;
};

const toYmd = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "" || value === "ALL") {
    return undefined;
  }
  const digits = String(value).replace(/[^0-9]/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : digits;
};

const allToUndefined = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "" || value === "ALL") {
    return undefined;
  }
  return String(value);
};

const formatYmdWithHyphen = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayYmd = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const getApStartDay = (response: any): number | null => {
  const raw =
    response?.data?.data?.AP_START_DAY ??
    response?.data?.AP_START_DAY ??
    response?.data?.data?.dsOut?.[0]?.AP_START_DAY;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const calculateApStartDate = (apStartDay: number): string => {
  const today = new Date();
  const apDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  apDate.setDate(apDate.getDate() + (apStartDay - 1));
  return formatYmdWithHyphen(apDate);
};

const mergeDefined = (
  baseParams: Record<string, unknown>,
  extraParams: Record<string, unknown>,
) => {
  const next = { ...baseParams };
  if (next.CREATION_YN === "ALL") {
    delete next.CREATION_YN;
  }
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      next[key] = value;
    }
  });
  return next;
};

export function useApDailyReportResultController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const [apStartDate, setApStartDate] = useState<string>();
  const firstSearchRef = useRef(true);

  useEffect(() => {
    let alive = true;
    api
      .searchApStartDay()
      .then((response) => {
        if (!alive) return;
        const apStartDay = getApStartDay(response);
        if (apStartDay == null) return;
        setApStartDate(calculateApStartDate(apStartDay));
      })
      .catch((error) => {
        console.error("searchApStartDay failed", error);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 조회조건 raw 값 (SearchMeta 필드 id = 센차 comp 이름)
  const getSearch = useCallback(
    () => (model.rawFiltersRef.current ?? {}) as Record<string, any>,
    [model.rawFiltersRef],
  );

  const buildSearchParams = useCallback(
    (
      params: Record<string, unknown> = {},
      options: { applyInitialApStart?: boolean } = {},
    ) => {
      const raw = (model.rawFiltersRef.current ?? {}) as Record<string, any>;
      const dlvryDtFrom =
        firstValue(raw, ["SRCH_DLVRY_DT_FRM", "SRCH_DLVRY_DT_FROM"]) ??
        params.DLVRY_DT_FROM;
      const dlvryDtTo =
        firstValue(raw, ["SRCH_DLVRY_DT_TO"]) ?? params.DLVRY_DT_TO;
      const creationYn =
        firstValue(raw, ["SRCH_CREATION_YN"]) ?? params.CREATION_YN;
      const normalizedFrom = toYmd(dlvryDtFrom);
      const normalizedApStart = toYmd(apStartDate);
      const effectiveFrom =
        options.applyInitialApStart &&
        normalizedApStart &&
        (!normalizedFrom || normalizedFrom === getTodayYmd())
          ? normalizedApStart
          : normalizedFrom;
      return mergeDefined(params, {
        DIV_CD:
          firstValue(raw, [
            "SRCH_DIV_CD",
            "SRCH_AP_DIV_CD",
            "SRCH_DLVRY_DIV_CD",
          ]) ?? params.DIV_CD,
        LGST_GRP_CD:
          firstValue(raw, [
            "SRCH_LGST_GRP_CD",
            "SRCH_AP_LGST_GRP_CD",
            "SRCH_DLVRY_LGST_GRP_CD",
          ]) ?? params.LGST_GRP_CD,
        DLVRY_DT_FROM: effectiveFrom,
        DLVRY_DT_TO: toYmd(dlvryDtTo),
        CREATION_YN: allToUndefined(creationYn),
      });
    },
    [apStartDate, model.rawFiltersRef],
  );

  const fetchList = useCallback(
    (params: Record<string, unknown>) => {
      const nextParams = buildSearchParams(params, {
        applyInitialApStart: firstSearchRef.current,
      });
      firstSearchRef.current = false;
      return api.getList(nextParams);
    },
    [buildSearchParams],
  );

  const onSearchCallback = useCallback(
    (data: any) => model.grids.main.setData(data),
    [model.grids.main],
  );

  // 센차 validCreateDailyApVehUnit — 선택 행에 차량/상태 세팅 + CREATION_YN 검증
  //  - rowStatus 'U' (서버 saveRecord 가 rowStatus I/U/D 만 dsSave 에 포함)
  //  - VEH_ID / VEH_NO 를 조회조건 차량으로 덮어씀
  //  - DLVRY_DT → 'yyyyMMdd'
  //  - CREATION_YN === 'Y' 인 행이 하나라도 있으면 false (확인 후 진행)
  const buildSaveRows = useCallback(
    (rows: any[], vehId: string, vehNo: string) => {
      let valid = true;
      const dsSave = rows.map((r) => {
        const { __rid__, EDIT_STS: _EDIT_STS, ...rest } = r ?? {};
        if (r?.CREATION_YN === "Y") valid = false;
        const dlvryDt = String(rest.DLVRY_DT ?? "")
          .split(" ")[0]
          .replace(/-/g, "");
        return {
          ...rest,
          rowStatus: "U",
          VEH_ID: vehId,
          VEH_NO: vehNo,
          DLVRY_DT: dlvryDt,
        };
      });
      return { dsSave, valid };
    },
    [],
  );

  // 차량 선택 + 선택 행 검증 (센차 onCreateDailyApVehUnit / onDeleteDailyApVehUnit 공통 선두)
  const validateVehAndSelection = useCallback(
    (selected: any[]) => {
      const s = getSearch();
      const vehId = String(s.SRCH_VEH_ID ?? "");
      const vehNo = String(s.SRCH_VEH_ID_NM ?? s.SRCH_VEH_NO ?? "");
      if (!vehId) {
        base.alert(Lang.get("LBL_ALERT_DF_VEH"));
        return null;
      }
      if (!selected?.length) {
        base.alert(Lang.get("MSG_SELECT_NO_DATA"));
        return null;
      }
      return { vehId, vehNo };
    },
    [base, getSearch],
  );

  // 차량일일실적추가
  const onCreateDailyApVehUnit = useCallback(
    (selected: any[]) => {
      const veh = validateVehAndSelection(selected);
      if (!veh) return;
      const { dsSave, valid } = buildSaveRows(selected, veh.vehId, veh.vehNo);
      const doSave = () =>
        base
          .callAjax(api.createDailyApVehUnit(dsSave), { mask: "main" })
          .then(() => base.search());
      if (valid) {
        void doSave();
      } else {
        base.confirm(Lang.get("MSG_VALID_CREATE_DAILY_AP_VEH"), () => {
          void doSave();
        });
      }
    },
    [base, buildSaveRows, validateVehAndSelection],
  );

  // 차량일일실적삭제(취소)
  const onDeleteDailyApVehUnit = useCallback(
    (selected: any[]) => {
      const veh = validateVehAndSelection(selected);
      if (!veh) return;
      const { dsSave } = buildSaveRows(selected, veh.vehId, veh.vehNo);
      void base
        .callAjax(api.cancelDailyApVehUnit(dsSave), { mask: "main" })
        .then(() => base.search());
    },
    [base, buildSaveRows, validateVehAndSelection],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "LBL_DALY_AP_ADD",
        label: "LBL_DALY_AP_ADD",
        onClick: ({ data }: { data: any[] }) => onCreateDailyApVehUnit(data),
      },
      {
        type: "button",
        key: "LBL_DALY_AP_DEL",
        label: "LBL_DALY_AP_DEL",
        onClick: ({ data }: { data: any[] }) => onDeleteDailyApVehUnit(data),
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        fetchFn: () => api.getList(buildSearchParams(model.filtersRef.current)),
        rows: () => model.grids.main.rows,
      }),
    ],
    [
      menuName,
      model.grids.main,
      model.filtersRef,
      onCreateDailyApVehUnit,
      onDeleteDailyApVehUnit,
      buildSearchParams,
    ],
  );

  return {
    fetchList,
    onSearchCallback,
    mainActions,
  };
}
