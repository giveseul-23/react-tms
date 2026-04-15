// util.ts

export const Util = {
  user: {
    autoAddTab: false,
    maxTabCnt: null,
    uniqueTab: true,
    userNm: "",
    userLang: "",
    userWcode: "",
    userWcodeDescr: "",
    userGroupCode: "",
    userGroupName: "",
    userFontFamily: "",
    userFontSize: "",
    dayType: "",
    dateFormatType: "",
    timeFormatType: "",
    locale: "KR",
  },

  getUserInfo(key: keyof typeof Util.user) {
    return Util.user[key];
  },

  setUtilUserInfo(userInfo: any) {
    Util.user.autoAddTab = userInfo.autoAddTab;
    Util.user.maxTabCnt = userInfo.maxTabCnt;
    Util.user.uniqueTab = userInfo.uniqueTab;
    Util.user.userNm = userInfo.userNm;
    Util.user.userLang = userInfo.userLang;
    Util.user.userWcode = userInfo.userWcode;
    Util.user.userWcodeDescr = userInfo.userWcodeDescr;
    Util.user.userGroupCode = userInfo.userGroupCode;
    Util.user.userGroupName = userInfo.userGroupName;
    Util.user.userFontFamily = userInfo.userFontFamily;
    Util.user.userFontSize = userInfo.userFontSize;
    Util.user.dayType = userInfo.dayType;
    Util.user.dateFormatType = userInfo.dateFormatType;
    Util.user.timeFormatType = userInfo.timeFormatType;
    Util.user.locale = userInfo.LCL_CD ?? "KR";
  },

  /**
   * DTTM 값을 dateFormatType / timeFormatType 설정에 따라 포맷팅
   * dateFormatType: "Y/M/D" → YYYY/MM/DD
   * timeFormatType: "24HMS" → HH:MM:SS (24시간)
   */
  formatDttm(value: string | null | undefined): string {
    if (!value) return "";

    const cleaned = String(value).replace("T", " ").trim();
    const match = cleaned.match(
      /(\d{4})[-/]?(\d{2})[-/]?(\d{2})(?:[\s]+(\d{2}):?(\d{2}):?(\d{2}))?/,
    );
    if (!match) return String(value);

    const [, y, mo, d, h, mi, s] = match;

    const dateFormat = Util.user.dateFormatType || "Y/M/D";
    const sep = dateFormat.includes("/") ? "/" : dateFormat.includes("-") ? "-" : "/";

    const orderMap: Record<string, string[]> = {
      "Y/M/D": [y, mo, d],
      "Y-M-D": [y, mo, d],
      "M/D/Y": [mo, d, y],
      "M-D-Y": [mo, d, y],
      "D/M/Y": [d, mo, y],
      "D-M-Y": [d, mo, y],
    };
    const dateParts = orderMap[dateFormat] ?? [y, mo, d];
    const dateStr = dateParts.join(sep);

    if (h != null) {
      return `${dateStr} ${h}:${mi}:${s}`;
    }
    return dateStr;
  },
};
