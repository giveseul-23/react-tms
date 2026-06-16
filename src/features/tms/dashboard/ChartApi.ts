// 서버 ChartController.js 는 공용 ECharts 옵션 팩토리(유틸)일 뿐,
// 자체 store/proxy/서비스 URL 이 없다(데이터는 이를 소비하는 대시보드 화면이 가짐).
// 따라서 본 파일에는 실제 API 가 없다. TODO: 차트 데이터가 필요하면 소비 화면의 service 를 참조.

export const chartApi = {};
