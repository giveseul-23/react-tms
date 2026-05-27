import { Lang } from "@/app/services/common/Lang";
import { CENTER } from "@/app/components/grid/columns/commonFormatters";

const WORK_DAY_TP_WORK = "WDT_1000";

function isFilled(value: unknown): boolean {
  return value != null && String(value).length > 0;
}

function isFillColor(data: Record<string, unknown> | undefined, dataIndex: string): boolean {
  if (!data) return false;
  const workTp = data[dataIndex];
  if (workTp != null && workTp !== WORK_DAY_TP_WORK) return true;
  if (isFilled(data[`${dataIndex}_DTL_TP`])) return true;
  if (isFilled(data[`${dataIndex}_MEMO`])) return true;
  return false;
}

function getCellFillStyle(): Record<string, string> {
  const dark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  if (dark) {
    return { ...CENTER, color: "#282c34", backgroundColor: "#ff936a" };
  }
  return { ...CENTER, backgroundColor: "#dbdbe4" };
}

function workdayCellStyle(params: {
  data?: Record<string, unknown>;
  colDef?: { field?: string };
}): Record<string, string> {
  const field = params.colDef?.field;
  if (!field || !isFillColor(params.data, field)) return CENTER;
  return getCellFillStyle();
}

export const MAIN_COLUMN_DEFS = [
  { headerName: "No" },
  {
    type: "text",
    headerName: "LBL_VEHICLE_CODE",
    field: "VEH_ID",
  },
  {
    type: "text",
    headerName: "LBL_VEH_NO",
    field: "VEH_NO",
  },
  {
    type: "text",
    headerName: "LBL_VEHICLE_TYPE_NAME",
    field: "VEH_TP_NM",
  },
  {
    type: "text",
    headerName: "LBL_DRIVER_NAME",
    field: "DRVR_NM",
  },
  {
    type: "numeric",
    headerName: "LBL_WORK_CNT",
    field: "TTL_WORK_CNT",
  },
  {
    type: "numeric",
    headerName: "LBL_DAY_OFF_CNT",
    field: "TTL_DAY_OFF_CNT",
  },
];

type DayMeta = {
  dataIndex: string;
  dayOfWeek: string;
  textEx: string;
};

export function buildVehicleWorkdayColumns(
  head: any[],
  dayList: DayMeta[],
) {
  const body = dayList.map((c) => {
    return {
      type: "text",
      headerName: c.textEx,
      noLang: true,
      headerClass: "ag-header-center",
      children: [
        {
          type: "combo",
          headerName: c.dayOfWeek,
          noLang: true,
          field: c.dataIndex,
          codeKey: "workTp",
          width: 100,
          headerClass: "ag-header-center",
          cellStyle: workdayCellStyle,
        },
        {
          type: "text",
          headerName: c.dataIndex + '_MEMO',
          noLang: true,
          field: c.dataIndex + '_MEMO',
          headerClass: "ag-header-center",
          hide: true,
        },
        {
          type: "text",
          headerName: c.dataIndex + '_DTL_TP',
          noLang: true,
          field: c.dataIndex + '_DTL_TP',
          headerClass: "ag-header-center",
          hide: true,
        },
      ]
    };
  });
  return [...head, ...body];
}

const WEEK_LANG_KEYS = [
  "LBL_TRGR_SUN",
  "LBL_TRGR_MON",
  "LBL_TRGR_TUE",
  "LBL_TRGR_WED",
  "LBL_TRGR_THU",
  "LBL_TRGR_FRI",
  "LBL_TRGR_SAT",
] as const;

function toDate(yyyymmdd: string): Date | null {
  const s = toYmdText(yyyymmdd);
  if (s.length < 8) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  return new Date(y, m, d);
}

export function toYmdText(value: unknown): string {
  return String(value ?? "").replace(/-/g, "").replace(/[^\d]/g, "");
}

function getDayOfWeek(date: Date): string {
  return Lang.get(WEEK_LANG_KEYS[date.getDay()]);
}

function getFormatDate(date: Date): string {
  const y = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const mm = month >= 10 ? String(month) : `0${month}`;
  const dd = day >= 10 ? String(day) : `0${day}`;
  return `${y}${mm}${dd}`;
}

export function getDayFields(sDate: string, eDate: string): DayMeta[] {
  const start = toDate(sDate);
  const end = toDate(eDate);
  if (!start || !end || start > end) return [];
  const dayfields: DayMeta[] = [];
  const cDate = new Date(start.getTime());
  while (cDate <= end) {
    dayfields.push({
      textEx: `${cDate.getMonth() + 1}/${cDate.getDate()}`,
      dataIndex: getFormatDate(cDate),
      dayOfWeek: getDayOfWeek(cDate),
    });
    cDate.setDate(cDate.getDate() + 1);
  }
  return dayfields;
}

export function hasNumber(field: unknown): field is string {
  return typeof field === "string" && /^\d{8}$/.test(field);
}
