export type SearchConditionConfig = {
  key: string;
  type: "popup" | "dateRange" | "text" | "combo" | "checkbox" | "date";
  title: string;
  span?: number;
  required?: boolean;
  condition?: string;
  options?: { value: string; label: string }[];
};
