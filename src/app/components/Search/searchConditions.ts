export type SearchConditionConfig = {
  key: string;
  type: "POPUP" | "YMDT" | "TEXT" | "COMBO" | "CHECKBOX" | "YMD";
  title: string;
  span?: number;
  required?: boolean;
  condition?: string;
  options?: { value: string; label: string }[];
};
