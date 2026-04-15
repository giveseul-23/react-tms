// src/app/components/Search/SearchFilters/dateUtils.ts
//
// 검색 조건의 날짜/시간 기본값 생성 유틸

/** YYYY-MM-DD (오늘) */
export function getToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** YYYY-MM-DDTHH:MM:SS (현재 시각, 초까지) — YMDT 단일 모드 기본값 */
export function getNowLocal(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

/** YYYY-MM-DDTHH:MM:SS (오늘의 특정 시각) — YMDT range 기본값 */
export function getTodayAt(hms: "00:00:00" | "23:59:59"): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hms}`;
}
