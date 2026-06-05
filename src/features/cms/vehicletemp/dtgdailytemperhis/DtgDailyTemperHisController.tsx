import { useCallback } from "react";
import { dtgDailyTemperHisApi as api } from "./DtgDailyTemperHisApi";
import type { DtgDailyTemperHisModel } from "./DtgDailyTemperHisModel";

interface Args {
  model: DtgDailyTemperHisModel;
}

function normalizeNumber(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num === 99 || num === 99.0) return null;
  return num;
}

function parseTimeLabel(value: unknown) {
  const raw = String(value ?? "");
  if (!raw) return "";

  if (/^\d{14}$/.test(raw)) {
    return `${raw.slice(8, 10)}:${raw.slice(10, 12)}`;
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  return raw;
}

export function useDtgDailyTemperHisController({ model }: Args) {
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getDailyTemperHistory(params),
    [],
  );

  const clearCharts = useCallback(() => {
    model.setSelectedRow(null);
    model.setFridgeData([]);
    model.setFrozenData([]);
    model.setStandard(null);
  }, [model]);

  const loadTemperatureHistory = useCallback(
    async (row: any) => {
      if (!row?.VEH_ID || !row?.DLVRY_DT) {
        clearCharts();
        return;
      }

      model.grids.main.setSelected(row);
      model.setSelectedRow(row);

      const params = {
        VEH_ID: row.VEH_ID,
        DLVRY_DT: row.DLVRY_DT,
      };

      const res: any = await api.getTemperatureHistory(params);
      const rows =
        res?.data?.data?.dsOut ??
        res?.data?.result ??
        res?.data?.data ??
        [];

      const transformed = (rows ?? []).map((item: any) => ({
        ...item,
        timeLabel: parseTimeLabel(item.PSTN_DTTM),
        CHLD_TMPR: normalizeNumber(item.CHN_A_TMPR_VAL),
        FRZN_TMPR: normalizeNumber(item.CHN_B_TMPR_VAL),
      }));

      model.setFridgeData(
        transformed.filter((item: any) => item.CHLD_TMPR != null),
      );
      model.setFrozenData(
        transformed.filter((item: any) => item.FRZN_TMPR != null),
      );
      model.setStandard({
        frznFrom: Number(row?.FRZN_FRM_VAL ?? -9999),
        frznTo: Number(row?.FRZN_TO_VAL ?? 9999),
        chldFrom: Number(row?.CHLD_FRM_VAL ?? -9999),
        chldTo: Number(row?.CHLD_TO_VAL ?? 9999),
      });
    },
    [clearCharts, model],
  );

  const onSearchCallback = useCallback(
    async (data: any) => {
      model.grids.main.setData(data);
      model.grids.main.setSelected(null);
      clearCharts();

      const firstRow =
        data?.rows?.[0] ??
        data?.dsOut?.[0] ??
        data?.data?.[0] ??
        data?.data?.dsOut?.[0] ??
        null;

      if (firstRow) {
        await loadTemperatureHistory(firstRow);
      }
    },
    [clearCharts, loadTemperatureHistory, model],
  );

  const handleRowClicked = useCallback(
    async (row: any) => {
      await loadTemperatureHistory(row);
    },
    [loadTemperatureHistory],
  );

  return {
    fetchList,
    onSearchCallback,
    handleRowClicked,
  };
}
