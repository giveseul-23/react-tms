// src/views/tender/TenderReceiveDispatch.tsx
"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Skeleton } from "@/app/components/ui/skeleton";
import { SearchFilters } from "@/app/components/Search/SearchFilters.tsx";
import { TENDER_SEARCH_META } from "./tenderSearchMeta";
import DataGrid from "@/app/components/grid/DataGrid";
import { useSearchMeta } from "@/hooks/useSearchMeta";
import { tenderApi } from "@/app/services/tender/tenderApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { usePopup } from "@/app/components/popup/PopupContext";
import TenderRejectPopup from "@/views/tender/popup/TenderRejectPopup";
import TemporaryVehicleChangePopup from "@/views/tender/popup/TemporaryVehicleChangePopup";
import AppInstallSmsPopup from "@/views/tender/popup/AppInstallSmsPopup";
import VehicleChangePopup from "@/views/tender/popup/VehicleChangePopup";
import VehicleAssignPopup from "@/views/tender/popup/VehicleAssignPopup";
import { useGuard } from "@/hooks/useGuard";
import { useCommonStores } from "@/hooks/useCommonStores";
import { CommonPopup } from "@/views/common/CommonPopup";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";

type LayoutType = "side" | "vertical";

const dispatchStatusColorMap: Record<string, string> = {
  "2030": "bg-purple-100 text-purple-700",
  "2040": "bg-purple-100 text-purple-700",
  "2050": "bg-purple-100 text-purple-700",
  "2060": "bg-purple-100 text-purple-700",
  "2070": "bg-sky-100 text-sky-700",
  "2073": "bg-sky-100 text-sky-700",
  "2075": "bg-sky-100 text-sky-700",
  "2080": "bg-blue-100 text-blue-700",
  "2090": "bg-blue-100 text-blue-700",
  "2100": "bg-emerald-100 text-emerald-700",
  "2103": "bg-emerald-100 text-emerald-700",
  "2105": "bg-emerald-100 text-emerald-700",
  "2110": "bg-emerald-100 text-emerald-700",
};

export default function TenderReceiveDispatch() {
  const { meta, loading } = useSearchMeta(TENDER_SEARCH_META);
  const [layout, setLayout] = useState<LayoutType>("side");
  const [subStopRowData, setSubStopRowData] = useState<any[]>([]);
  const [subSmsHisRowData, setSubSmsHisRowData] = useState<any[]>([]);
  const [subApSetlRowData, setSubApSetlRowData] = useState<any[]>([]);
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  const [selectedHeaderRow, setSelectedHeaderRow] = useState<any>(null);

  const { stores } = useCommonStores({
    dspchOpSts: { sqlProp: "CODE", keyParam: "DSPCH_OP_STS" },
    apFiSts: { sqlProp: "CODE", keyParam: "AP_FI_STS" },
  });

  const [gridData, setGridData] = useState<{
    rows: any[];
    totalCount: number;
    page: number;
    limit: number;
  }>({
    rows: [],
    totalCount: 0,
    page: 1,
    limit: 20,
  });

  const searchRef = useRef<((page?: number) => void) | null>(null);
  const filtersRef = useRef<Record<string, unknown>>({});
  const apSetlGridRef = useRef<any>(null);

  // ref로 최신 state 유지 (setTimeout 클로저 / 이벤트 핸들러에서 사용)
  const subApSetlRowDataRef = useRef<any[]>([]);
  const selectedHeaderRowRef = useRef<any>(null);

  const setSubApSetlRowDataWithRef = useCallback((updater: any) => {
    setSubApSetlRowData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      subApSetlRowDataRef.current = next;
      return next;
    });
  }, []);

  const setSelectedHeaderRowWithRef = useCallback((row: any) => {
    setSelectedHeaderRow(row);
    selectedHeaderRowRef.current = row;
  }, []);

  const codeMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    Object.entries(stores).forEach(([storeKey, items]) => {
      map[storeKey] = {};
      (items ?? []).forEach((item: any) => {
        map[storeKey][item.CODE] = item.NAME;
      });
    });
    return map;
  }, [stores]);

  // SearchFilters에 주입할 fetch 함수
  const fetchDispatchList = useCallback(
    (params: Record<string, unknown>) => tenderApi.getDispatchList(params),
    [],
  );

  // 메인 조회 시 서브그리드 초기화
  const handleSearch = useCallback(
    (data: any) => {
      setGridData(data);
      // 재조회 시 서브그리드 및 선택행 초기화
      setSubStopRowData([]);
      setSubSmsHisRowData([]);
      setSubApSetlRowDataWithRef([]);
      setSelectedHeaderRowWithRef(null);
    },
    [setSubApSetlRowDataWithRef, setSelectedHeaderRowWithRef],
  );

  // 행 클릭 시 3개 서브 API를 Promise.all로 병렬 처리
  const handleRowClicked = useCallback(
    (row: any) => {
      setSelectedHeaderRowWithRef(row);

      Promise.all([
        tenderApi.getDispatchStopList({ DSPCH_NO: row.DSPCH_NO }),
        tenderApi.getDispatchSmsHisList({ DSPCH_NO: row.DSPCH_NO }),
        tenderApi.getDispatchApSetlList({ DSPCH_NO: row.DSPCH_NO }),
      ])
        .then(([stopRes, smsRes, apSetlRes]: any[]) => {
          setSubStopRowData(stopRes.data.result ?? []);
          setSubSmsHisRowData(smsRes.data.result ?? []);
          setSubApSetlRowDataWithRef(apSetlRes.data.result ?? []);
        })
        .catch((err) => {
          console.error(
            "[TenderReceiveDispatch] row click sub-fetch failed",
            err,
          );
        });
    },
    [setSelectedHeaderRowWithRef, setSubApSetlRowDataWithRef],
  );

  if (loading) {
    return <Skeleton className="h-24" />;
  }

  const columnDefs1 = [
    { headerName: "No" },
    {
      headerName: "정산진행상태",
      field: "AP_FI_STS",
      cellRenderer: (params: any) => {
        const code = params.value;
        const label = codeMap.apFiSts?.[String(code)] ?? code;
        const cls =
          dispatchStatusColorMap[String(code)] ?? "bg-gray-100 text-gray-600";
        return (
          <span className={`px-0.5 py-0.5 rounded-md text-xs ${cls}`}>
            {label}
          </span>
        );
      },
    },
    { headerName: "물류운영그룹", field: "LGST_GRP_CD" },
    { headerName: "납품일", field: "DLVRY_DT" },
    { headerName: "배차번호", field: "DSPCH_NO" },
    {
      headerName: "배차진행상태",
      field: "DSPCH_OP_STS",
      cellRenderer: (params: any) => {
        const code = params.value;
        const label = codeMap.dspchOpSts?.[String(code)] ?? code;
        const cls =
          dispatchStatusColorMap[String(code)] ?? "bg-gray-100 text-gray-600";
        return (
          <span className={`px-0.5 py-0.5 rounded-md text-xs ${cls}`}>
            {label}
          </span>
        );
      },
    },
    { headerName: "운송협력사명", field: "CARR_NM" },
    { headerName: "차량유형명", field: "VEH_TP_NM" },
    { headerName: "입차순서", field: "ETRNC_SEQ" },
    { headerName: "차량번호", field: "VEH_NO" },
    { headerName: "운전자명", field: "DRVR_NM" },
    { headerName: "출발지명", field: "FRM_LOC_NM" },
    { headerName: "추적번호", field: "TRCK_NO", type: "numeric" },
    { headerName: "SMS전송일시", field: "SMS_APP_INST_DTTM" },
    { headerName: "전송번호", field: "SEND_NO" },
    { headerName: "메모(운송요청)", field: "MEMO" },
    { headerName: "경유처수", field: "STOP_CNT", type: "numeric" },
    { headerName: "운임예약가능여부", field: "CARR_BOOKING_YN" },
    {
      headerName: "등록금액",
      field: "RATE",
      type: "numeric",
      editable: (params: any) => params.data._isNew,
      valueSetter: (params: any) => {
        params.data.RATE = params.newValue;
        return true;
      },
    },
    { headerName: "확정금액", field: "CFM_COST", type: "numeric" },
    { headerName: "디비전", field: "DIV_CD" },
    { headerName: "물류운영그룹코드", field: "LGST_GRP_CD" },
    { headerName: "출발지코드", field: "FRM_LOC_CD" },
    { headerName: "연계배차번호", field: "TRIP_ID" },
    { headerName: "연계배차순서", field: "TRIP_SEQ", type: "numeric" },
    { headerName: "차량코드", field: "VEH_ID" },
    { headerName: "운전자코드", field: "DRVR_ID" },
    { headerName: "배송차수", field: "BATCH_NO", type: "numeric" },
    { headerName: "입차요청일시", field: "REQ_ETRNC_DTTM" },
    { headerName: "입차예정일시", field: "EXPCT_ETRNC_DTTM" },
    { headerName: "입차지연사유", field: "DLYD_ETRNC_RSN_DESC" },
    { headerName: "차량유형", field: "CARR_CFM_VEH_TCD" },
    { headerName: "작성자/등록자", field: "CRE_USR_ID" },
    { headerName: "등록일자", field: "CRE_DTTM" },
    { headerName: "수정자", field: "UPD_USR_ID" },
    { headerName: "수정일시", field: "UPD_DTTM" },

    // { headerName: "핸드폰번호", field: "MBL_PHN_NO" },
    // { headerName: "메모", field: "MEMO_DESC" },
    // { headerName: "운송사메모", field: "CARR_MEMO_DESC" },
    // { headerName: "경로", field: "ROUTE_PATH" },
    // { headerName: "중량", field: "TTL_LD_WGT", type: "numeric" },
    // { headerName: "팔레트수량", field: "TTL_LD_FLEX_QTY2", type: "numeric" },
    // { headerName: "회수PVC수량", field: "RETURN_PVC_QTY", type: "numeric" },
    // { headerName: "PVC회수스캔일시", field: "DLVRY_RETURN_DTTM" },
    // { headerName: "수/배송구분", field: "TRANS_TCD" },
    // { headerName: "등록사유", field: "CARR_CHG_RMK" },
    // { headerName: "부피", field: "TTL_LD_VOL", type: "numeric" },
    // { headerName: "PVC수량", field: "TTL_LD_FLEX_QTY1", type: "numeric" },
    // { headerName: "전용용기", field: "TTL_LD_FLEX_QTY3", type: "numeric" },
    // {
    //   headerName: "종이박스/지대수량",
    //   field: "TTL_LD_FLEX_QTY4",
    //   type: "numeric",
    // },
    // { headerName: "채반수량", field: "TTL_LD_FLEX_QTY5", type: "numeric" },

    // { headerName: "출발시군구", field: "FRM_FULL_ADDR" },
    // { headerName: "도착시군구", field: "TO_FULL_ADDR" },
  ];

  const actions1 = [
    {
      type: "button",
      key: "운송요청수락",
      label: "운송요청수락",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(tenderApi.onTenderAccepted(e.data), "저장되었습니다.");
      },
    },
    {
      type: "button",
      key: "운송요청거절",
      label: "운송요청거절",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        openPopup({
          title: "운송요청 거절",
          content: (
            <TenderRejectPopup
              reasons={[]}
              onConfirm={(ie: any) => {
                closePopup();
                handleApi(
                  tenderApi.onTenderRejected(
                    e.data.map((row: any) => ({ ...row, ...ie.data })),
                  ),
                  "저장되었습니다.",
                ).then(() => searchRef.current?.());
              }}
              onClose={closePopup}
            />
          ),
          width: "lg",
        });
      },
    },
    {
      type: "group",
      key: "add",
      label: "차량변경",
      items: [
        {
          type: "button",
          key: "b1",
          label: "지입차",
          onClick: (e: any) => {
            if (!guardHasData(e.data)) return;
            openPopup({
              title: "차량변경",
              content: (
                <VehicleChangePopup
                  initialValues={{ LGST_GRP_CD: e.data[0].LGST_GRP_CD }}
                  onApply={(ie: any) => {
                    closePopup();
                    handleApi(
                      tenderApi.onChangeRegVeh(
                        e.data.map((row: any) => ({ ...row, ...ie })),
                      ),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
                  }}
                  onClose={closePopup}
                />
              ),
              width: "2xl",
            });
          },
        },
        {
          type: "button",
          key: "b2",
          label: "모바일가입용차",
          onClick: (e: any) => {
            if (!guardHasData(e.data)) return;
            openPopup({
              title: "임시차량변경",
              content: (
                <TemporaryVehicleChangePopup
                  initialValues={{
                    VEH_TP_CD: e.data[0].VEH_TP_CD,
                    CARR_NM: e.data[0].CARR_NM,
                  }}
                  onConfirm={(ie: any) => {
                    closePopup();
                    handleApi(
                      tenderApi.onChangeTempVeh({ ...e.data[0], ...ie }),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
                  }}
                  onClose={closePopup}
                />
              ),
              width: "lg",
            });
          },
        },
        {
          type: "button",
          key: "b3",
          label: "임시용차",
          onClick: (e: any) => {
            if (!guardHasData(e.data)) return;
            openPopup({
              title: "임시용차차량변경",
              content: (
                <VehicleAssignPopup
                  onApply={(ie: any) => {
                    closePopup();
                    handleApi(
                      tenderApi.onVehicleChange(
                        e.data.map((row: any) => ({ ...row, ...ie })),
                      ),
                      "저장되었습니다.",
                    ).then(() => searchRef.current?.());
                  }}
                  onClose={closePopup}
                />
              ),
              width: "2xl",
            });
          },
        },
      ],
    },
    {
      type: "button",
      key: "운송요청수락취소",
      label: "운송요청수락취소",
      onClick: (e: any) =>
        handleApi(tenderApi.onVehicleCancel(e.data), "저장되었습니다."),
    },
    {
      type: "button",
      key: "앱설치SMS",
      label: "앱설치SMS",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        openPopup({
          title: "전화번호입력",
          content: (
            <AppInstallSmsPopup
              reasons={[]}
              onConfirm={(ie: any) => {
                closePopup();
                handleApi(
                  tenderApi.sendSMSForAppInstall({ ...e.data, ...ie.data }),
                  "저장되었습니다..",
                ).then(() => searchRef.current?.());
              }}
              onClose={closePopup}
            />
          ),
          width: "lg",
        });
      },
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
          onClick: () => {
            downExcelSearch({
              columns: columnDefs1,
              searchParams: filtersRef.current,
              menuName: "운송수배현황",
              fetchFn: (params) => tenderApi.getDispatchList(params),
            });
          },
        },
        {
          type: "button",
          key: "운송비업로드",
          label: "운송비업로드",
          onClick: () => {
            handleApi(
              tenderApi.gridExcelUpload(filtersRef.current),
              "업로드가 완료되었습니다.",
            );
          },
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
          onClick: () => {
            downExcelSearch({
              columns: columnDefs1,
              menuName: "운송사요청목록",
              fetchFn: () => tenderApi.getDispatchList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: columnDefs1,
              rows: gridData.rows,
              menuName: "운송사요청목록",
            });
          },
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-3 h-full min-h-0 min-w-0">
      {/* 조회 조건 */}
      <SearchFilters
        meta={meta}
        onSearch={handleSearch}
        searchRef={searchRef}
        filtersRef={filtersRef}
        pageSize={20}
        fetchFn={fetchDispatchList}
      />

      {/* layout toggle */}
      <div className="shrink-0 flex items-center justify-end text-[13px] text-[rgb(var(--fg))]">
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
                columnDefs={columnDefs1}
                rowData={gridData.rows}
                totalCount={gridData.totalCount}
                currentPage={gridData.page}
                pageSize={gridData.limit}
                onPageChange={(page) => {
                  setSubStopRowData([]);
                  setSubSmsHisRowData([]);
                  setSubApSetlRowDataWithRef([]);
                  setSelectedHeaderRowWithRef(null);
                  searchRef.current?.(page);
                }}
                actions={actions1}
                onRowClicked={handleRowClicked}
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
                      { headerName: "하차중량", field: "UNLDNG_WGT" },
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
                      { headerName: "출발지국가", field: "FRM_CNTY_NM" },
                      { headerName: "출발지도시", field: "FRM_CTY_NM" },
                      { headerName: "출발지주", field: "FRM_STT_NM" },
                      { headerName: "출발지우편번호", field: "FRM_ZIP_CD" },
                      { headerName: "출발지위도", field: "FRM_LAT" },
                      { headerName: "출발지경도", field: "FRM_LON" },
                    ],
                  },
                  AP_SETL: {
                    gridRef: apSetlGridRef,
                    columnDefs: [
                      { headerName: "No" },
                      {
                        headerName: "삭제",
                        field: "_delete",
                        width: 60,
                        filter: false,
                        floatingFilter: false,
                        cellRenderer: (params: any) => {
                          if (!params.data._isNew) return null;
                          return (
                            <div className="flex items-center justify-start h-full">
                              <input
                                type="checkbox"
                                className="ag-input-field-input ag-checkbox-input"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSubApSetlRowDataWithRef((prev: any) =>
                                      prev.filter(
                                        (row: any) => row !== params.data,
                                      ),
                                    );
                                  }
                                }}
                              />
                            </div>
                          );
                        },
                      },
                      { field: "DSPCH_NO", hide: true },
                      { headerName: "항목코드", field: "CHG_CD" },
                      { headerName: "항목명", field: "CHG_NM" },
                      { headerName: "등록금액", field: "RATE", editable: true },
                      { headerName: "확정금액", field: "CFM_COST" },
                      { headerName: "확정사유내용", field: "RMK" },
                      { headerName: "등록일자", field: "CRE_DTTM" },
                      { headerName: "작성자/등록자", field: "CRE_USR_ID" },
                      { headerName: "수정일시", field: "UPD_DTTM" },
                      { headerName: "수정자", field: "UPD_USR_ID" },
                    ],
                    onCellValueChanged: (params: any) => {
                      setSubApSetlRowDataWithRef((prev: any) =>
                        prev.map((row: any) =>
                          row === params.data
                            ? {
                                ...row,
                                [params.colDef.field]: params.newValue,
                                ...(!row._isNew && { _isDirty: true }),
                              }
                            : row,
                        ),
                      );
                    },
                    actions: [
                      {
                        type: "button",
                        key: "운송비추가",
                        label: "추가",
                        onClick: () => {
                          if (!guardHasData(selectedHeaderRowRef.current))
                            return;
                          openPopup({
                            title: "항목코드",
                            content: (
                              <CommonPopup
                                fetchFn={(params: any) =>
                                  tenderApi.getBookingChgCodeName(params)
                                }
                                onApply={(row: any) => {
                                  closePopup();
                                  setSubApSetlRowDataWithRef((prev: any) => [
                                    ...prev,
                                    {
                                      _isNew: true,
                                      DSPCH_NO:
                                        selectedHeaderRowRef.current.DSPCH_NO,
                                      CHG_CD: row.CODE,
                                      CHG_NM: row.NAME,
                                    },
                                  ]);
                                }}
                                onClose={closePopup}
                              />
                            ),
                            width: "2xl",
                          });
                        },
                      },
                      {
                        type: "button",
                        key: "운송비저장",
                        label: "저장",
                        onClick: () => {
                          // stopEditing 후 onCellEditingStopped로 안전하게 처리
                          // ag-Grid는 stopEditing 호출 즉시 onCellValueChanged를 동기로 실행하므로
                          // ref에서 최신값을 바로 읽어 저장 가능
                          apSetlGridRef.current?.api?.stopEditing();

                          const saveRows = subApSetlRowDataRef.current.filter(
                            (sub: any) => sub._isNew || sub._isDirty,
                          );

                          if (saveRows.length === 0) return;

                          handleApi(
                            tenderApi.updateCarrierRate(saveRows),
                            "저장되었습니다.",
                          ).then(() => {
                            tenderApi
                              .getDispatchApSetlList({
                                DSPCH_NO: selectedHeaderRowRef.current.DSPCH_NO,
                              })
                              .then((res: any) =>
                                setSubApSetlRowDataWithRef(
                                  res.data.result ?? [],
                                ),
                              );
                          });
                        },
                      },
                    ],
                  },
                }}
                rowData={{
                  STOP: subStopRowData,
                  SMS_HIS: subSmsHisRowData,
                  AP_SETL: subApSetlRowData,
                }}
                actions={[]}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
