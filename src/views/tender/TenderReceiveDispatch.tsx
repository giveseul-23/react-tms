// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import { SearchFilters } from "@/app/components/search/SearchFilters";
import { TENDER_SEARCH_META } from "./tenderSearchMeta";
import DataGrid from "@/app/components/grid/DataGrid";

type LayoutType = "side" | "vertical";

const actions1 = [
  {
    type: "button",
    key: "운송사메모등록",
    label: "운송사메모등록",
    onClick: () => console.log("refresh"),
  },
  {
    type: "group",
    key: "add",
    label: "차량등록",
    items: [
      {
        type: "button",
        key: "b1",
        label: "지입차",
        onClick: () => console.log("BTN1"),
      },
      {
        type: "button",
        key: "b2",
        label: "모바일가입용차",
        onClick: () => console.log("BTN2"),
      },
      {
        type: "button",
        key: "b3",
        label: "임시용차",
        onClick: () => console.log("BTN3"),
      },
    ],
  },
  {
    type: "button",
    key: "입차예정일시등록",
    label: "입차예정일시등록",
    onClick: () => console.log("입차예정일시등록"),
  },
  {
    type: "button",
    key: "운송요청수락",
    label: "운송요청수락",
    onClick: () => console.log("운송요청수락"),
  },
  {
    type: "group",
    key: "운송요청취소",
    label: "운송요청취소",
    items: [
      {
        type: "button",
        key: "운송요청거절",
        label: "운송요청거절",
        onClick: () => console.log("운송요청거절"),
      },
      {
        type: "button",
        key: "운송요청수락취소",
        label: "운송요청수락취소",
        onClick: () => console.log("운송요청수락취소"),
      },
    ],
  },
  {
    type: "button",
    key: "운반비정산조직변경",
    label: "운반비정산조직변경",
    onClick: () => console.log("운반비정산조직변경"),
  },
  {
    type: "button",
    key: "용차정산처리동기화",
    label: "용차정산처리동기화",
    onClick: () => console.log("용차정산처리동기화"),
  },
  {
    type: "button",
    key: "저장",
    label: "저장",
    onClick: () => console.log("저장"),
  },
  {
    type: "group",
    key: "운송비엑셀관리",
    label: "운송비엑셀관리",
    items: [
      {
        type: "button",
        key: "운송비양식다운로드",
        label: "운송비양식다운로드",
        onClick: () => console.log("운송비양식다운로드"),
      },
      {
        type: "button",
        key: "운송비업로드",
        label: "운송비업로드",
        onClick: () => console.log("운송비업로드"),
      },
    ],
  },
  {
    type: "group",
    key: "엑셀",
    label: "엑셀",
    items: [
      {
        type: "button",
        key: "조회된모든데이터다운로드",
        label: "조회된모든데이터다운로드",
        onClick: () => console.log("조회된모든데이터다운로드"),
      },
      {
        type: "button",
        key: "보이는데이터다운로드",
        label: "보이는데이터다운로드",
        onClick: () => console.log("보이는데이터다운로드"),
      },
    ],
  },
  {
    type: "button",
    key: "앱설치SMS",
    label: "앱설치SMS",
    onClick: () => console.log("앱설치SMS"),
  },
];

export default function TenderReceiveDispatch() {
  const [layout, setLayout] = useState<LayoutType>("side");

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* 조회 조건 */}
      <SearchFilters meta={TENDER_SEARCH_META} />

      {/* layout toggle */}
      <div className="shrink-0 flex items-center justify-between text-[13px] text-[rgb(var(--fg))]">
        <span>Showing</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLayout("vertical")}
            className="h-[30px] w-[34px] rounded-md border border-slate-200 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]"
          >
            ⬇
          </button>
          <button
            type="button"
            onClick={() => setLayout("side")}
            className="h-[30px] w-[34px] rounded-md border border-slate-200 bg-[rgb(var(--bg))] text-[rgb(var(--fg))]"
          >
            ➡
          </button>
        </div>
      </div>

      {/* grid area */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <PanelGroup
          direction={layout === "side" ? "horizontal" : "vertical"}
          className="h-full w-full min-h-0 min-w-0 overflow-hidden"
        >
          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="plain"
                columnDefs={[
                  { headerName: "No" },
                  {
                    headerName: "물류운영그룹",
                    field: "LGST_GRP_CD",
                  },
                  {
                    headerName: "납품일",
                    field: "DLVRY_DT",
                  },
                  {
                    headerName: "배차번호",
                    field: "DSPCH_NO",
                  },
                  {
                    headerName: "배차진행상태",
                    field: "DSPCH_OP_STS",
                  },
                  {
                    headerName: "운송협력사명",
                    field: "CARR_NM",
                  },
                  {
                    headerName: "차량유형명",
                    field: "VEH_TP_NM",
                  },
                  {
                    headerName: "입차순서",
                    field: "ETRNC_SEQ",
                  },
                  {
                    headerName: "차량번호",
                    field: "VEH_NO",
                  },
                  {
                    headerName: "운전자명",
                    field: "DRVR_NM",
                  },
                  {
                    headerName: "핸드폰번호",
                    field: "PHN_NO",
                  },
                  {
                    headerName: "메모",
                    field: "MEMO_DESC",
                  },
                  {
                    headerName: "운송사메모",
                    field: "CARR_MEMO",
                  },
                  {
                    headerName: "경로",
                    field: "STOP_ROUTE",
                  },
                  {
                    headerName: "중량",
                    field: "PLN_WGT",
                  },
                  {
                    headerName: "팔레트수량",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "회수PVC수량",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "PVC회수스캔일시",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "입차요청일시",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "입차예정일시",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "입차지연사유",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "차량유형",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "수/배송구분",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "추적번호",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "SMS전송일시",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "전송번호",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "메모(운송요청)",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "경유처수",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "운임예약가능여부",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "등록금액",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "확정금액",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "등록사유",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "부피",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "PVC수량",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "전용용기",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "종이박스/지대수량",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "채반수량",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "출발지명",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "디비전",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "물류운영그룹코드",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "출발지코드",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "연계배차번호",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "연계배차순서",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "출발시군구",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "도착시군구",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "차량코드",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "운전자코드",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "배송차수",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "작성자/등록자",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "등록일자",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "수정자",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "수정일시",
                    field: "PLN_QTY",
                  },
                  {
                    headerName: "편집상태",
                    field: "PLN_QTY",
                  },
                ]}
                rowData={[{ LGST_GRP_CD: "ddddddddddddddddddddddddddddddd" }]}
                actions={actions1}
              />
            </div>
          </Panel>

          <PanelResizeHandle
            className={
              layout === "side"
                ? "w-2 cursor-col-resize hover:bg-slate-200/70"
                : "h-2 cursor-row-resize hover:bg-slate-200/70"
            }
          />

          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="tab"
                tabs={[
                  { key: "ALL", label: "전체" },
                  { key: "WAIT", label: "대기" },
                  { key: "DONE", label: "완료" },
                ]}
                presets={{
                  ALL: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                    ],
                    rowData: [{ DSPCH_NO: 1 }],
                  },
                  WAIT: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                      { headerName: "상태", field: "STATUS", width: 100 },
                    ],
                    rowData: [{ DSPCH_NO: 2, STATUS: "대기" }],
                  },
                  DONE: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "배차번호", field: "DSPCH_NO", width: 130 },
                      { headerName: "완료시간", field: "DONE_DT", width: 160 },
                    ],
                    rowData: [{ DSPCH_NO: 3, DONE_DT: "2026-01-28" }],
                  },
                }}
                rowData={[{ DSPCH_NO: 1 }, { DSPCH_NO: 2 }]}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
