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
};
