export type SearchConditionConfig = {
  key: string;
  type: "POPUP" | "YMDDT" | "TEXT" | "COMBO" | "CHECKBOX" | "YMD";
  title: string;
  span?: number;
  required?: boolean;
  condition?: string;
  options?: { value: string; label: string }[];
};
