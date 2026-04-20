// ────────────────────────────────────────────────────────────────
// [가이드] Controller 템플릿
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureController.tsx)
// 2. 모델 타입 / API import / 함수명 교체
// 3. mainActions / detailActions 는 makeCommonActions 또는 개별 팩토리로 구성
//
// 공통 패턴
// - fetchXxxList: 조회 API 호출 (SearchFilters → fetchFn)
// - handleSearch: 조회 완료 시 상태 업데이트 + 서브그리드 초기화
// - handleRowClicked: 행 선택 시 상세/서브 그리드 재조회
// - makeAddAction / makeSaveAction / makeExcelGroupAction:
//   개별 버튼 팩토리 — onClick 커스터마이즈 필요할 때
// - makeCommonActions: 추가/저장/엑셀 3종 세트 일괄 구성
// ────────────────────────────────────────────────────────────────

import { useCallback, MutableRefObject } from "react";
import { shpmMgmtApi } from "./ShpmMgmtApi";
import { ShpmMgmtModel } from "./ShpmMgmtModel";
import { MAIN_COLUMN_DEFS } from "./ShpmMgmtColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/commonActions";

type ControllerProps = {
  model: ShpmMgmtModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useShpmMgmtController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── 조회 API (SearchFilters 가 넘겨주는 params 를 그대로 전달) ─
  const fetchList = useCallback(
    (params: Record<string, unknown>) => shpmMgmtApi.getList(params),
    [],
  );

  // ── 조회 완료 콜백 (onSearch) ─────────────────────────────────
  // SearchFilters 조회 성공 → gridData 업데이트 + 서브 그리드 리셋
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.resetSubGrids();
      // 최초 행 자동 선택하고 상세까지 로딩하고 싶을 때
      handleRowClicked(data.rows?.[0]);
    },
    [model],
  );

  // ── 상세 데이터 fetch ─────────────────────────────────────────
  const fetchLgstDetail = useCallback((row: any) => {
    const trfCd = row?.TRF_CD;
    if (!trfCd) return Promise.resolve([]);
    return shpmMgmtApi
      .getLgstList({ TRF_CD: trfCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchZoneDetail = useCallback((row: any) => {
    const trfCd = row?.TRF_CD;
    const lgstGrpCd = row?.LGST_GRP_CD;
    const chgCd = row?.CHG_CD;
    if (!trfCd && lgstGrpCd && chgCd) return Promise.resolve([]);
    return shpmMgmtApi
      .getZoneList({ TRF_CD: trfCd, LGST_GRP_CD: lgstGrpCd, CHG_CD: chgCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchRateDetail = useCallback((row: any) => {
    const laneId = row?.LANE_ID;
    if (!laneId) return Promise.resolve([]);
    return shpmMgmtApi
      .getRateList({ LANE_ID: laneId })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchZoneCondDetail = useCallback((row: any) => {
    const laneId = row?.LANE_ID;
    if (!laneId) return Promise.resolve([]);
    return shpmMgmtApi
      .getZoneCondList({ LANE_ID: laneId })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  // ── 메인 행 클릭 → 상세 그리드 리로드 ─────────────────────────
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      fetchLgstDetail(row).then((rows: any) => {
        model.setSubLgstRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
        handleSubLeftRowClicked(rows?.[0]);
      });
    },
    [model],
  );

  const handleSubLeftRowClicked = useCallback(
    (row: any) => {
      fetchZoneDetail(row).then((rows: any) => {
        model.setSubZoneRowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
        handleSubCenterRowClicked(rows?.[0]);
      });
    },
    [model],
  );

  const handleSubCenterRowClicked = useCallback(
    (row: any) => {
      let dtlRow = row;
      Promise.all([fetchRateDetail(dtlRow), fetchZoneCondDetail(dtlRow)])
        .then(([rateRes, zoneCondRes]: any[]) => {
          const rateRows = rateRes ?? [];
          const zoneCondRows = zoneCondRes ?? [];
          model.setSubRateRowData({
            rows: rateRows,
            totalCount: rateRows.length,
            page: 1,
            limit: model.pageSize,
          });
          model.setSubZoneCondRowData({
            rows: zoneCondRows,
            totalCount: zoneCondRows.length,
            page: 1,
            limit: model.pageSize,
          });
        })
        .catch((e) => {
          throw new Error(e);
        });
    },
    [model],
  );

  // ── 메인 그리드 액션 ──────────────────────────────────────────
  // 추가 + 저장 + 엑셀 일괄 세팅이 필요하면 makeCommonActions 사용
  const mainActions = [
    {
      type: "button",
      key: "계약서복사",
      label: "계약서복사",
      onClick: () => {},
    },
    ...makeCommonActions({
      add: true,
      save: true,
      excel: {
        columns: MAIN_COLUMN_DEFS,
        menuName: "화면명",
        fetchFn: () => shpmMgmtApi.getList(filtersRef.current),
        rows: model.gridData.rows,
      },
    }),
  ];

  // ── 그리드 액션 (onClick 커스터마이즈 예시) ──────────────

  const detail01Actions = [
    makeAddAction({
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        model.setSubLgstRowData((prev: any) => ({
          ...prev,
          rows: [
            ...prev.rows,
            {
              _isNew: true, // 저장 대상 식별 플래그
              XXX_CD: model.selectedHeaderRowRef.current.XXX_CD,
            },
          ],
        }));
      },
    }),
    makeSaveAction({
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        shpmMgmtApi.save(saveRows).then(() => searchRef.current?.());
      },
    }),
  ];

  const detail02Actions = [
    makeSaveAction({
      onClick: (e: any) => {
        const saveRows = (e.data ?? []).filter(
          (r: any) => r._isNew || r._isDirty,
        );
        if (saveRows.length === 0) return;
        shpmMgmtApi.save(saveRows).then(() => searchRef.current?.());
      },
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detail01Actions,
    detail02Actions,
    handleSubLeftRowClicked,
    handleSubCenterRowClicked,
  };
}

// ────────────────────────────────────────────────────────────────
// [참고] 공통 버튼 팩토리 API
//
// makeAddAction({ onClick?, label?, key?, disabled? })
// makeSaveAction({ onClick?, label?, key?, disabled? })
//   - onClick 생략 시 no-op (e: any) => {}
//   - label / key 생략 시 "추가" / "저장"
//
// makeExcelGroupAction({ columns, menuName, fetchFn, rows, hideAll?, hideVisible? })
//   - hideAll: true  → "조회된모든데이터다운로드" 버튼 숨김
//   - hideVisible: true → "보이는데이터다운로드" 버튼 숨김
//
// makeCommonActions({ add?, save?, excel? })
//   - add / save: true 또는 { onClick, ... } 객체
//   - excel: ExcelGroupActionConfig 객체 (미지정 시 엑셀 그룹 제외)
//
// 기존 커스텀 버튼과 혼용 예시
//   const mainActions = [
//     { type: "button", key: "동기화", label: "동기화", onClick: ... },
//     makeAddAction({ onClick: handleAdd }),
//     makeSaveAction({ onClick: handleSave }),
//     makeExcelGroupAction({ ... }),
//   ];
// ────────────────────────────────────────────────────────────────
