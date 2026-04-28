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
import { indstrlAccdntCmpnstnApi } from "./IndstrlAccdntCmpnstnApi";
import { IndstrlAccdntCmpnstnModel } from "./IndstrlAccdntCmpnstnModel";
import { MAIN_COLUMN_DEFS } from "./IndstrlAccdntCmpnstnColumns";
import {
  makeAddAction,
  makeSaveAction,
  makeExcelGroupAction,
  makeCommonActions,
} from "@/app/components/grid/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";

type ControllerProps = {
  model: IndstrlAccdntCmpnstnModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useIndstrlAccdntCmpnstnController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  // ── 조회 API (SearchFilters 가 넘겨주는 params 를 그대로 전달) ─
  const fetchList = useCallback(
    (params: Record<string, unknown>) =>
      indstrlAccdntCmpnstnApi.getList(params),
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
  const fetchRateDetail = useCallback((row: any) => {
    const divCd = row?.DIV_CD;
    const lgstGrpCd = row?.LGST_GRP_CD;
    if (!(divCd && lgstGrpCd)) return Promise.resolve([]);
    return indstrlAccdntCmpnstnApi
      .getRateList({ DIV_CD: divCd, LGST_GRP_CD: lgstGrpCd })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  const fetchChgDetail = useCallback((row: any) => {
    const insrncId = row?.INSRNC_ID;
    const apProcTp = row?.AP_PROC_TP;
    if (!(insrncId && apProcTp)) return Promise.resolve([]);
    return indstrlAccdntCmpnstnApi
      .getChgList({ INSRNC_ID: insrncId, AP_PROC_TP: apProcTp })
      .then((res: any) => res.data.result ?? res.data.data?.dsOut ?? [])
      .catch((err) => {
        throw Error(err);
      });
  }, []);

  // ── 메인 행 클릭 → 상세 그리드 리로드 ─────────────────────────
  const handleRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      fetchRateDetail(row).then((rows: any) => {
        model.setSubDetail01RowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });

        handleSubRowClicked(rows[0]);
      });
    },
    [model],
  );

  const handleSubRowClicked = useCallback(
    (row: any) => {
      model.setSelectedHeaderRow(row);

      fetchChgDetail(row).then((rows: any) => {
        model.setSubDetail02RowData({
          rows,
          totalCount: rows.length,
          page: 1,
          limit: model.pageSize,
        });
      });
    },
    [model],
  );

  // ── 메인 그리드 액션 ──────────────────────────────────────────
  // 추가 + 저장 + 엑셀 일괄 세팅이 필요하면 makeCommonActions 사용
  const mainActions: ActionItem[] = [
    {
      type: "button",
      key: "월대보험료등록",
      label: "월대보험료등록",
      onClick: () => {},
    },
    {
      type: "button",
      key: "용차/회당보험료등록",
      label: "용차/회당보험료등록",
      onClick: () => {},
    },
  ];

  // ── 상세 그리드 액션 (onClick 커스터마이즈 예시) ──────────────
  const detailActions = [
    makeAddAction({
      onClick: () => {
        if (!model.selectedHeaderRowRef.current) return;
        model.setSubDetail01RowData((prev: any) => ({
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
        indstrlAccdntCmpnstnApi
          .save(saveRows)
          .then(() => searchRef.current?.());
      },
    }),
    makeExcelGroupAction({
      columns: MAIN_COLUMN_DEFS,
      menuName: "화면명",
      fetchFn: () => indstrlAccdntCmpnstnApi.getRateList(filtersRef.current),
      rows: model.subDetail01RowData.rows,
    }),
  ];

  return {
    fetchList,
    handleSearch,
    handleRowClicked,
    mainActions,
    detailActions,
    handleSubRowClicked,
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
