// lang.ts

export const Lang = {
  data: {} as Record<string, string>,

  setData(data: Record<string, string>) {
    Lang.data = data;
  },

  get(key: string) {
    return Lang.data[key] ?? key + "***";
  },
};
