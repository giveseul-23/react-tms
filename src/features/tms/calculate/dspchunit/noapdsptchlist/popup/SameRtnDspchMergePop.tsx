"use client";

// 동일회전배차합산 팝업 (서버 pop/SameRtnDspchMergePop 대응)
//  - 메인: 합산대상 배차 목록(/noApDispatchListService/searchRtnDspch). 다중선택.
//  - 배차구분(DSPCH_MERGE_TCD) 선택 + 검색 → 하단 착지순서 그리드(searchRtnDspchLoc).
//  - 합산: saveSameRtnDspchMerge / 합산취소: saveSameRtnDspchMergeCancel
//  - 착지순번재정렬: saveAutoChangeStopSeq
//  - 순번조정(±): 서버 onAdjustPlanStopSeqPlus/Minus 는 DispatchPlanControllerAB(미확인)
//    상속 로직 → 클라 머지 후 saveAutoChangeStopSeq 재사용 형태로는 포팅 불가. TODO.

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ComboFilter } from "@/app/components/Search/filters/ComboFilter";
import DataGrid from "@/app/components/grid/DataGrid";
import { apiClient } from "@/app/http/client";
import { getSessionFields } from "@/app/services/auth/auth";
import { useErrorAlert } from "@/hooks/useErrorAlert";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";
import { MENU_CODE } from "../NoApDispatchList";

type SearchCond = {
  DIV_CD: string;
  LGST_GRP_CD: string;
  DLVRY_DT_FROM: string;
  DLVRY_DT_TO: string;
  PAY_CARR_CD: string;
  VEH_NO: string;
};

type Props = {
  searchCond: SearchCond;
  onDone: () => void;
  onClose: () => void;
};

const DISPATCH_COL = (n: number) => ({
  headerName: `${Lang.get("LBL_DISPATCH")}${n}`,
  noLang: true,
  field: `DSPCH_NO${n}`,
  type: "text",
  align: "center",
  width: 100,
});

const MAIN_COLUMNS = [
  { headerName: "No" },
  { headerName: "LBL_VEHICLE_CODE", field: "VEH_ID", type: "text", align: "center", width: 80 },
  { headerName: "LBL_VEH_NO", field: "VEH_NO", type: "text", align: "left", width: 120 },
  { headerName: "LBL_DLVRY_DATE", field: "DLVRY_DT", type: "date", align: "center", width: 80 },
  { headerName: "LBL_TRIP_COUNT", field: "RTN_NO", type: "numeric", align: "right", width: 50 },
  { headerName: "LBL_CARRIER_NAME", field: "CARR_NM", type: "text", align: "left", width: 120 },
  { headerName: "LBL_DSPCH_CNT", field: "DSPCH_CNT", type: "text", align: "right", width: 80 },
  { headerName: "LBL_MERGE_YN", field: "MERGE_YN", type: "check", align: "center", width: 80 },
  ...Array.from({ length: 10 }, (_, i) => DISPATCH_COL(i + 1)),
];

const ROUTE_COLUMNS = [
  { headerName: "No" },
  { headerName: "LBL_DISPATCH_NO", field: "DSPCH_NO", type: "text", align: "center", width: 100 },
  { headerName: "LBL_STOP_SEQUENCE", field: "STOP_SEQ", type: "numeric", align: "right", width: 50 },
  { headerName: "LBL_LOCATION_CODE", field: "LOC_CD", type: "text", align: "center", width: 120 },
  { headerName: "LBL_LOCATION_NAME", field: "LOC_NM", type: "text", align: "left", width: 200 },
  { headerName: "LBL_PICKDROP_DIV", field: "STOP_TP", type: "combo", codeKey: "stopTpList", align: "center", width: 60 },
  { headerName: "LBL_STATE", field: "STT_NM", type: "text", align: "center", width: 120 },
  { headerName: "LBL_CITY", field: "CTY_NM", type: "text", align: "center", width: 120 },
  { headerName: "LBL_DETAIL_ADDRESS", field: "DTL_ADDR1", type: "text", align: "left", width: 200 },
  { headerName: "LBL_LATITUDE", field: "LAT", type: "numeric", align: "center", width: 120 },
  { headerName: "LBL_LONGITUDE", field: "LON", type: "numeric", align: "center", width: 120 },
  { headerName: "LBL_ZIP_CODE", field: "ZIP_CD", type: "text", align: "center", width: 80 },
  { headerName: "LBL_DIVISION_CODE", field: "DIV_CD", type: "text", hide: true },
  { headerName: "LBL_LOGISTICS_GROUP_CODE", field: "LGST_GRP_CD", type: "text", hide: true },
  { headerName: "STOP_ID", field: "STOP_ID", type: "text", noLang: true, hide: true },
];

export function SameRtnDspchMergePop({ searchCond, onDone, onClose }: Props) {
  const [mainRows, setMainRows] = useState<any[]>([]);
  const [routeRows, setRouteRows] = useState<any[]>([]);
  const [selectedMain, setSelectedMain] = useState<any[]>([]);
  const [mergeTcd, setMergeTcd] = useState("");
  const showError = useErrorAlert();

  const { stores, codeMap } = useCommonStores({
    stopTpList: { sqlProp: "CODE", keyParam: "STOP_TP" },
    dscphMergeTcd: { sqlProp: "CODE", keyParam: "DSPCH_MERGE_TCD" },
  });

  const post = (url: string, body: any, isSave = false) => {
    if (isSave) {
      return apiClient.post(
        url,
        { dsSave: body.map((r: any) => ({ ...getSessionFields(), ...r })) },
        { params: { ...getSessionFields(), MENU_CD: MENU_CODE } },
      );
    }
    return apiClient.post(url, {
      ...getSessionFields(),
      MENU_CD: MENU_CODE,
      ...body,
    });
  };

  const handleErr = (err: any) =>
    showError(
      err?.response?.data?.error?.message ?? err?.message ?? Lang.get("TTL_ERR"),
    );

  // 메인 조회
  const searchMain = () => {
    post(`/noApDispatchListService/searchRtnDspch`, {
      DIV_CD: searchCond.DIV_CD,
      LGST_GRP_CD: searchCond.LGST_GRP_CD,
      DLVRY_DT_FROM: searchCond.DLVRY_DT_FROM,
      DLVRY_DT_TO: searchCond.DLVRY_DT_TO,
      PAY_CARR_CD: searchCond.PAY_CARR_CD,
      VEH_NO: searchCond.VEH_NO,
    })
      .then((res: any) => {
        if (res?.data?.success === false) return showError(res.data?.msg);
        setMainRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
      })
      .catch(handleErr);
  };

  useEffect(() => {
    searchMain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 착지순서(routeGrid) 조회 — 선택 메인행의 DSPCH_NO{구분} (서버 onSubSearch)
  const searchRoute = () => {
    if (selectedMain.length === 0) return;
    if (!mergeTcd) return;
    const dspchNo = selectedMain[0]?.[`DSPCH_NO${mergeTcd}`];
    if (!dspchNo) return;
    post(`/noApDispatchListService/searchRtnDspchLoc`, { DSPCH_NO: dspchNo })
      .then((res: any) => {
        if (res?.data?.success === false) return showError(res.data?.msg);
        setRouteRows(res?.data?.data?.dsOut ?? res?.data?.result ?? []);
      })
      .catch(handleErr);
  };

  // 합산 (서버 onSave)
  const onMerge = () => {
    if (selectedMain.length === 0) return;
    if (selectedMain.some((r) => r.MERGE_YN === "Y")) {
      showError(Lang.get("MSG_ALREADY_DSPCH_MERGE"));
      return;
    }
    const rows = selectedMain.map((r) => ({ ...r }));
    post(`/noApDispatchListService/saveSameRtnDspchMerge`, rows, true)
      .then((res: any) => {
        if (res?.data?.success === false) return showError(res.data?.msg);
        onDone();
        onClose();
      })
      .catch(handleErr);
  };

  // 합산취소 (서버 onMergeCancel) — 단건 + 합산건 + 정산문서 미생성 검증
  const onMergeCancel = () => {
    if (selectedMain.length === 0) return;
    if (selectedMain.length > 1) {
      showError(Lang.get("MSG_VALID_ONLY_SINGLE_RECORD"));
      return;
    }
    const r = selectedMain[0];
    if (r.MERGE_YN === "N") {
      showError(Lang.get("MSG_DSPCH_UNMERGE_MERGED_ONLY"));
      return;
    }
    if (Number(r.CNT_AP_FI_STS) > 0) {
      showError(Lang.get("MSG_DSPCH_UNMERGE_NO_SETL_ALLOWED"));
      return;
    }
    post(
      `/noApDispatchListService/saveSameRtnDspchMergeCancel`,
      [{ ...r }],
      true,
    )
      .then((res: any) => {
        if (res?.data?.success === false) return showError(res.data?.msg);
        onDone();
        onClose();
      })
      .catch(handleErr);
  };

  // 착지순번재정렬 (서버 onAutoChangeStopSeq)
  const onAutoChangeStopSeq = () => {
    if (selectedMain.length === 0) return;
    if (routeRows.length === 0) return;
    const rows = routeRows.map((r) => ({ ...r }));
    post(`/noApDispatchListService/saveAutoChangeStopSeq`, rows, true)
      .then((res: any) => {
        if (res?.data?.success === false) return showError(res.data?.msg);
        searchRoute();
      })
      .catch(handleErr);
  };

  // TODO: 순번조정(±) — 서버 onAdjustPlanStopSeqPlus/Minus 는 DispatchPlanControllerAB
  //       (베이스 클래스, 소스 미확인) 로직. 확인 후 포팅 필요.

  const mergeTcdOptions = (stores.dscphMergeTcd ?? []).map((o: any) => ({
    CODE: o.CODE,
    NAME: o.NAME,
  }));

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* 메인 그리드 */}
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onMerge} className="h-7 px-3 text-xs">
          {Lang.get("LBL_DSPCH_MERGE")}
        </Button>
        <Button size="sm" variant="outline" onClick={onMergeCancel} className="h-7 px-3 text-xs">
          {Lang.get("LBL_DSPCH_MERGE") + Lang.get("BTN_CANCEL")}
        </Button>
      </div>
      <div className="shrink-0" style={{ height: 260 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={MAIN_COLUMNS}
          rowData={mainRows}
          rowSelection="multiple"
          codeMap={codeMap}
          gridOptions={{
            onSelectionChanged: (e: any) =>
              setSelectedMain(e.api.getSelectedRows()),
          }}
          disableAutoSize
        />
      </div>

      {/* 착지순서 조회 조건 */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-slate-500 mb-1">
            {Lang.get("LBL_DISPATCH")}
          </label>
          <div className="w-[200px]">
            <ComboFilter
              value={mergeTcd}
              onChange={setMergeTcd}
              options={mergeTcdOptions}
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={searchRoute}
          className="h-7 px-3 text-xs gap-1.5"
        >
          <Search className="w-3 h-3" />
          {Lang.get("BTN_SEARCH")}
        </Button>
      </div>

      {/* 착지순서 그리드 */}
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onAutoChangeStopSeq}
          className="h-7 px-3 text-xs"
        >
          {Lang.get("BTN_STOP_RESEQUENCE")}
        </Button>
      </div>
      <div className="shrink-0" style={{ height: 220 }}>
        <DataGrid
          layoutType="plain"
          actions={[]}
          columnDefs={ROUTE_COLUMNS}
          rowData={routeRows}
          rowSelection="single"
          codeMap={codeMap}
          disableAutoSize
        />
      </div>

      {/* 닫기 */}
      <div className="flex justify-end pt-2.5 border-t border-slate-100">
        <Button size="sm" variant="outline" onClick={onClose} className="h-7 px-4 text-xs">
          {Lang.get("BTN_CANCEL")}
        </Button>
      </div>
    </div>
  );
}
