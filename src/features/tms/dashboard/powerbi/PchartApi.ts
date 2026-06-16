// 서버 Pchart 는 Power BI 공개 리포트(publish to web) URL 을 iframe 으로 임베드한다.
// 임베드 토큰/config 를 받는 백엔드 엔드포인트가 없으므로 호출할 API 가 없다.
// (서버 PchartController 의 /useStatusService/searchTest 는 동작 없는 테스트용 ajax 라 포팅 제외.)
//
// TODO: 공개 URL 대신 임베드 토큰 방식으로 전환하면 여기에 토큰/config 엔드포인트를 추가한다.
//   예) getEmbedConfig(): apiClient.post("/pchartService/embedToken", withSession({ MENU_CD: MENU_CODE }))
export const pchartApi = {};
