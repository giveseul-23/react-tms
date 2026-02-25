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
  const [subStopRowData, setSubStopRowData] = useState([]);
  const [subSmsHisRowData, setSubSmsHisRowData] = useState([]);
  const [subApSetlRowData, setSubApSetlRowData] = useState([]);
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
                onRowSelected={(row: any) => {
                  tenderApi
                    .getDispatchStopList({
                      DSPCH_NO: row.DSPCH_NO,
                    })
                    .then((res: any) => {
                      setSubStopRowData(res.data.result);
                    })
                    .catch((err: any) => {
                      console.error(err);
                    });

                  tenderApi
                    .getDispatchSmsHisList({
                      DSPCH_NO: row.DSPCH_NO,
                    })
                    .then((res: any) => {
                      setSubSmsHisRowData(res.data.result);
                    })
                    .catch((err: any) => {
                      console.error(err);
                    });

                  tenderApi
                    .getDispatchApSetlList({
                      DSPCH_NO: row.DSPCH_NO,
                    })
                    .then((res: any) => {
                      setSubApSetlRowData(res.data.result);
                    })
                    .catch((err: any) => {
                      console.error(err);
                    });
                }}
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
                ]}
                presets={{
                  STOP: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "배차번호", field: "DSPCH_NO" },
                      { headerName: "순번", field: "STOP_SEQ" },
                      { headerName: "착지코드", field: "LOC_CD" },
                      { headerName: "착지명", field: "LOC_NM" },
                      { headerName: "착지구분", field: "STOP_TP" },
                      { headerName: "주", field: "STT_NM" },
                      { headerName: "도시", field: "CTY_NM" },
                      { headerName: "상세주소1", field: "DTL_ADDR1" },
                      { headerName: "상세주소2", field: "DTL_ADDR2" },
                      { headerName: "위도", field: "LAT" },
                      { headerName: "경도", field: "LON" },
                      { headerName: "상차CBM", field: "LDNG_VOL" },
                      { headerName: "상차중량", field: "LDNG_WGT" },
                      { headerName: "상차FQ1", field: "LDNG_FLEX_QTY1" },
                      { headerName: "상차FQ2", field: "LDNG_FLEX_QTY2" },
                      { headerName: "상차FQ3", field: "LDNG_FLEX_QTY3" },
                      { headerName: "상차FQ4", field: "LDNG_FLEX_QTY4" },
                      { headerName: "상차FQ5", field: "LDNG_FLEX_QTY5" },
                      { headerName: "하차CBM", field: "UNLDNG_VOL" },
                      { headerName: "하차CBM", field: "UNLDNG_WGT" },
                      { headerName: "하차FQ1", field: "UNLDNG_FLEX_QTY1" },
                      { headerName: "하차FQ2", field: "UNLDNG_FLEX_QTY2" },
                      { headerName: "하차FQ3", field: "UNLDNG_FLEX_QTY3" },
                      { headerName: "하차FQ4", field: "UNLDNG_FLEX_QTY4" },
                      { headerName: "하차FQ5", field: "UNLDNG_FLEX_QTY5" },
                    ],
                  },
                  SMS_HIS: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "운송지시번호", field: "ORD_NO" },
                      { headerName: "고객주문번호", field: "CUST_ORD_NO" },
                      { headerName: "도착지코드", field: "TO_LOC_CD" },
                      { headerName: "도착지명", field: "TO_LOC_NM" },
                      { headerName: "도착지우편번호", field: "TO_ZIP_CD" },
                      { headerName: "도착지위도", field: "TO_LAT" },
                      { headerName: "도착지경도", field: "TO_LON" },
                      { headerName: "주문타입", field: "ORD_TP" },
                      { headerName: "주문번호", field: "SHPM_NO" },
                      { headerName: "콘솔", field: "MIT_CLSS_CD" },
                      { headerName: "고객사코드", field: "CUST_CD" },
                      { headerName: "고객사명", field: "CUST_NM" },
                      { headerName: "출발지ID", field: "FRM_LOC_ID" },
                      { headerName: "출발지코드", field: "FRM_LOC_CD" },
                      { headerName: "출발지명", field: "FRM_LOC_NM" },
                      { headerName: "출발지국가", field: "FRM_LOC_NM" },
                      { headerName: "출발지도시", field: "FRM_CTY_NM" },
                      { headerName: "출발지주", field: "FRM_STT_NM" },
                      { headerName: "출발지우편번호", field: "FRM_ZIP_CD" },
                      { headerName: "출발지위도", field: "FRM_LAT" },
                      { headerName: "출발지경도", field: "FRM_LON" },
                    ],
                  },
                  AP_SETL: {
                    columnDefs: [
                      { headerName: "No" },
                      { headerName: "품목코드", field: "CUST_ITEM_CD" },
                      { headerName: "품목명", field: "CUST_ITEM_NM" },
                      { headerName: "계획CBM", field: "PLN_VOL" },
                      { headerName: "계획중량", field: "PLN_WGT" },
                      { headerName: "계획FQ1", field: "PLN_FLEX_QTY1" },
                      { headerName: "계획FQ2", field: "PLN_FLEX_QTY2" },
                      { headerName: "계획FQ3", field: "PLN_FLEX_QTY3" },
                      { headerName: "계획FQ4", field: "PLN_FLEX_QTY4" },
                      { headerName: "계획FQ5", field: "PLN_FLEX_QTY5" },
                      { headerName: "계획수량", field: "PLN_QTY" },
                    ],
                  },
                }}
                rowData={{
                  STOP: subStopRowData,
                  SMS_HIS: subSmsHisRowData,
                  AP_SETL: subApSetlRowData,
                }}
                renderRightGrid={(tabKey: string) => {
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
