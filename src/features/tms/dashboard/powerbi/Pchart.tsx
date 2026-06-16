"use client";

// 서버 대응: vc.view.mdl.tms.dashboard.powerbi.Pchart (Sencha ExtJS)
//   center region 이 고정 src 의 <iframe> 으로 Power BI 리포트를 임베드한다(ag-grid 없음).
//   - 임베드 방식: Power BI "publish to web" 공개 URL(고정). 임베드 토큰 엔드포인트 없음.
//   - 리포트 URL(서버 Pchart.js 의 iframe src 그대로):
//       https://app.powerbi.com/view?r=eyJrIjoiZmE3M2ZmMTAtNzAwMC00ODcwLWIwMjYtZDZjNmM3MDBiNTkzIiwidCI6ImQ0MGM0ZmY3LTMwODYtNGEzZi1iNWI5LTk2OGFhMzY3MjkwYyJ9
//   - 서버 PchartController.onSearch 의 /useStatusService/searchTest 호출은 동작 없는 테스트용(no-op)이라 포팅하지 않음.
//   - 서버 PchartMain.js(React "Like" 데모 패널)는 임베드와 무관한 샘플이라 포팅 제외.
//
// 결론: CRUD 그리드 화면이 아니므로 그리드를 만들지 않는다. Power BI 리포트 iframe 만 렌더한다.
//   MENU_CODE / useBaseModel 배선은 라우팅·컴파일을 위해 유지.
//
// TODO(임베드 보안 강화 시): 공개 URL 대신 서버에서 임베드 토큰/config 를 받는 방식으로 전환하면
//   PchartApi 에 토큰 엔드포인트를 추가하고 powerbi-client 로 교체.

import { usePchartModel } from "./PchartModel";
import { usePchartController } from "./PchartController";

export const MENU_CODE = "MENU_PCHART";

// Power BI 공개 리포트 URL (서버 Pchart.js iframe src 와 동일).
const POWERBI_REPORT_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiZmE3M2ZmMTAtNzAwMC00ODcwLWIwMjYtZDZjNmM3MDBiNTkzIiwidCI6ImQ0MGM0ZmY3LTMwODYtNGEzZi1iNWI5LTk2OGFhMzY3MjkwYyJ9";

export default function Pchart() {
  const model = usePchartModel(MENU_CODE);
  usePchartController({ model });

  return (
    <iframe
      title="Power BI"
      src={POWERBI_REPORT_URL}
      className="h-full w-full border-0"
      allowFullScreen
    />
  );
}
