// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import React, { useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Skeleton } from "@/app/components/ui/skeleton";

import { SearchFilters } from "@/app/components/search/SearchFilters";
import { TENDER_SEARCH_META } from "./tenderSearchMeta";
import DataGrid from "@/app/components/grid/DataGrid";

import { useSearchMeta } from "@/hooks/useSearchMeta";

import { tenderApi } from "@/app/services/tender/tenderApi";

import { SearchCondition } from "@/features/search/search.builder";

type LayoutType = "side" | "vertical";

function CntrSubGrid() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <DataGrid
        layoutType="plain"
        columnDefs={[
          { headerName: "No" },
          { headerName: "품목코드", field: "CNTR_TP" },
          { headerName: "품목명", field: "QTY" },
          { headerName: "주문수량", field: "QTY" },
          { headerName: "주문수량단위", field: "QTY" },
          { headerName: "부피", field: "RMK" },
          { headerName: "중량", field: "RMK" },
          { headerName: "판매적재단위", field: "RMK" },
          { headerName: "PVC수량", field: "RMK" },
          { headerName: "팔레트수량", field: "RMK" },
          { headerName: "전용용기", field: "RMK" },
          { headerName: "종이박스/지대", field: "RMK" },
          { headerName: "채반", field: "RMK" },
        ]}
        rowData={[
          { CNTR_TP: "PVC특대", QTY: 10 },
          { CNTR_TP: "PVC대", QTY: 5 },
        ]}
        actions={[]}
      />
    </div>
  );
}

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
  const { meta, loading } = useSearchMeta(TENDER_SEARCH_META);
  const [filters, setFilters] = useState<SearchCondition[]>([]);
  const [layout, setLayout] = useState<LayoutType>("side");
  const [headerRowData, setHeaderRowData] = useState([]);
  const [subRowData, setSubRowData] = useState([]);
  if (loading) {
    return <Skeleton className="h-24" />;
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* 조회 조건 */}
      <SearchFilters
        meta={meta}
        value={filters}
        onChange={setFilters}
        onSearch={setHeaderRowData}
      />

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
      <div className="flex-1 min-h-0 min-w-0 overflow-x-visible">
        <PanelGroup
          direction={layout === "side" ? "horizontal" : "vertical"}
          className="h-full w-full min-h-0 min-w-0"
        >
          <Panel defaultSize={50} minSize={20} className="min-h-0 min-w-0">
            <div className="h-full flex flex-col overflow-hidden">
              <DataGrid
                layoutType="plain"
                columnDefs={[
                  { headerName: "No" },
                  {
                    headerName: "정산진행상태",
                    field: "AP_FI_STS",
                  },
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
                    field: "MBL_PHN_NO",
                  },
                  {
                    headerName: "메모",
                    field: "MEMO_DESC",
                  },
                  {
                    headerName: "운송사메모",
                    field: "CARR_MEMO_DESC",
                  },
                  {
                    headerName: "경로",
                    field: "ROUTE_PATH",
                  },
                  {
                    headerName: "중량",
                    field: "TTL_LD_WGT",
                  },
                  {
                    headerName: "팔레트수량",
                    field: "TTL_LD_FLEX_QTY2",
                  },
                  {
                    headerName: "회수PVC수량",
                    field: "RETURN_PVC_QTY",
                  },
                  {
                    headerName: "PVC회수스캔일시",
                    field: "DLVRY_RETURN_DTTM",
                  },
                  {
                    headerName: "입차요청일시",
                    field: "REQ_ETRNC_DTTM",
                  },
                  {
                    headerName: "입차예정일시",
                    field: "EXPCT_ETRNC_DTTM",
                  },
                  {
                    headerName: "입차지연사유",
                    field: "DLYD_ETRNC_RSN_DESC",
                  },
                  {
                    headerName: "차량유형",
                    field: "CARR_CFM_VEH_TCD",
                  },
                  {
                    headerName: "수/배송구분",
                    field: "TRANS_TCD",
                  },
                  {
                    headerName: "추적번호",
                    field: "TRCK_NO",
                  },
                  {
                    headerName: "SMS전송일시",
                    field: "SMS_APP_INST_DTTM",
                  },
                  {
                    headerName: "전송번호",
                    field: "SEND_NO",
                  },
                  {
                    headerName: "메모(운송요청)",
                    field: "MEMO",
                  },
                  {
                    headerName: "경유처수",
                    field: "STOP_CNT",
                  },
                  {
                    headerName: "운임예약가능여부",
                    field: "CARR_BOOKING_YN",
                  },
                  {
                    headerName: "등록금액",
                    field: "RATE",
                  },
                  {
                    headerName: "확정금액",
                    field: "CFM_COST",
                  },
                  {
                    headerName: "등록사유",
                    field: "CARR_CHG_RMK",
                  },
                  {
                    headerName: "부피",
                    field: "TTL_LD_VOL",
                  },
                  {
                    headerName: "PVC수량",
                    field: "TTL_LD_FLEX_QTY1",
                  },
                  {
                    headerName: "전용용기",
                    field: "TTL_LD_FLEX_QTY3",
                  },
                  {
                    headerName: "종이박스/지대수량",
                    field: "TTL_LD_FLEX_QTY4",
                  },
                  {
                    headerName: "채반수량",
                    field: "TTL_LD_FLEX_QTY5",
                  },
                  {
                    headerName: "출발지명",
                    field: "FRM_LOC_NM",
                  },
                  {
                    headerName: "디비전",
                    field: "DIV_CD",
                  },
                  {
                    headerName: "물류운영그룹코드",
                    field: "LGST_GRP_CD",
                  },
                  {
                    headerName: "출발지코드",
                    field: "FRM_LOC_CD",
                  },
                  {
                    headerName: "연계배차번호",
                    field: "TRIP_ID",
                  },
                  {
                    headerName: "연계배차순서",
                    field: "TRIP_SEQ",
                  },
                  {
                    headerName: "출발시군구",
                    field: "FRM_FULL_ADDR",
                  },
                  {
                    headerName: "도착시군구",
                    field: "TO_FULL_ADDR",
                  },
                  {
                    headerName: "차량코드",
                    field: "VEH_ID",
                  },
                  {
                    headerName: "운전자코드",
                    field: "DRVR_ID",
                  },
                  {
                    headerName: "배송차수",
                    field: "BATCH_NO",
                  },
                  {
                    headerName: "작성자/등록자",
                    field: "CRE_USR_ID",
                  },
                  {
                    headerName: "등록일자",
                    field: "CRE_DTTM",
                  },
                  {
                    headerName: "수정자",
                    field: "UPD_USR_ID",
                  },
                  {
                    headerName: "수정일시",
                    field: "UPD_DTTM",
                  },
                ]}
                rowData={headerRowData}
                actions={actions1}
                pagination
                pageSize={20}
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
                  { key: "STOP", label: "경유처" },
                  { key: "SMS_HIS", label: "SMS전송이력" },
                  { key: "AP_SETL", label: "운송비내역" },
                  { key: "CNTR", label: "적재정보" },
                  { key: "RETURN", label: "회수수량" },
                ]}
                presets={{
                  STOP: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "배차번호", field: "DSPCH_NO" },
                      { headerName: "순번", field: "DSPCH_NO" },
                      { headerName: "착지코드", field: "DSPCH_NO" },
                      { headerName: "착지명", field: "DSPCH_NO" },
                      { headerName: "착지구분", field: "DSPCH_NO" },
                      { headerName: "실제도착시각", field: "DSPCH_NO" },
                      { headerName: "실제출발일시", field: "DSPCH_NO" },
                      { headerName: "광역시/도", field: "DSPCH_NO" },
                      { headerName: "시군구", field: "DSPCH_NO" },
                      { headerName: "상세주소", field: "DSPCH_NO" },
                    ],
                    rowData: [{ DSPCH_NO: 1 }],
                  },
                  SMS_HIS: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "전송이력ID", field: "DSPCH_NO" },
                      { headerName: "배차번호", field: "STATUS" },
                      { headerName: "전송번호", field: "STATUS" },
                      { headerName: "작성자/등록자", field: "STATUS" },
                      { headerName: "등록일자", field: "STATUS" },
                    ],
                    rowData: [{ DSPCH_NO: 2, STATUS: "대기" }],
                  },
                  AP_SETL: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "항목", field: "DSPCH_NO" },
                      { headerName: "등록금액", field: "STATUS" },
                      { headerName: "등록사유", field: "DONE_DT" },
                      { headerName: "확정금액", field: "DONE_DT" },
                      { headerName: "확정사유내용", field: "DONE_DT" },
                      { headerName: "등록일자", field: "DONE_DT" },
                      { headerName: "작성자/등록자", field: "DONE_DT" },
                      { headerName: "수정일시", field: "DONE_DT" },
                      { headerName: "수정자", field: "DONE_DT" },
                    ],
                    rowData: [{ DSPCH_NO: 3, DONE_DT: "2026-01-28" }],
                  },
                  CNTR: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "부피", field: "DSPCH_NO" },
                      { headerName: "중량", field: "DONE_DT" },
                      { headerName: "PVC수량", field: "DONE_DT" },
                      { headerName: "팔레트수량", field: "DONE_DT" },
                      { headerName: "전용용기", field: "DONE_DT" },
                      { headerName: "종이박스/지대수량", field: "DONE_DT" },
                      { headerName: "채반수량", field: "DONE_DT" },
                    ],
                    rowData: [{ DSPCH_NO: 3, DONE_DT: "2026-01-28" }],
                  },
                  RETURN: {
                    columnDefs: [
                      { headerName: "No", width: 60 },
                      { headerName: "PVC특대", field: "DSPCH_NO" },
                      { headerName: "PVC대", field: "DSPCH_NO" },
                      { headerName: "PVC중", field: "DONE_DT" },
                    ],
                    rowData: [{ DSPCH_NO: 3, DONE_DT: "2026-01-28" }],
                  },
                }}
                rowData={subRowData}
                /** ⭐ 여기 추가 */
                renderRightGrid={(tabKey: any) => {
                  if (tabKey !== "CNTR") return null;
                  return <CntrSubGrid />;
                }}
                pagination
                pageSize={20}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
