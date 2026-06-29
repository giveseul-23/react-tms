// ────────────────────────────────────────────────────────────────
// [가이드] Controller 템플릿 — base hook 패턴 (센차 ViewController 대응)
//
// 사용 방법
// 1. 이 파일을 대상 폴더로 복사 후 파일명 교체 (예: FeatureController.tsx)
// 2. API import / 함수명 / 핸들러명 교체
// 3. 화면별 고유 핸들러는 base 의 헬퍼들을 조합해서 짧게 작성
//
// base 헬퍼 빠른 참조
//   base.callAjax(promise, msg)              — API 한 번 감쌈 (성공/에러 토스트)
//   base.alert(msg) / base.confirm(msg, fn)  — 다이얼로그
//   base.search(page?)                       — 메인 그리드 재조회 (searchRef.current)
//   base.searchSub(gridKey, promise)         — 임의 그리드에 결과 set
//   base.resetGrids([keys])                  — 지정 그리드들 비우기
//   base.handleRowClick(gridKey, row,        — selection + cascade reset/fetch
//     cascade?, opts?)
//   base.addRow(gridKey, newRow)             — 그리드 끝에 push (EDIT_STS:"I" 자동)
//   base.requireParentRow(row, label)        — 부모 행 선택+저장 검증 + alert
//   base.saveGrid(gridKey, apiFn, opts?)     — dirty 추출 + dsSave + 후처리
// ────────────────────────────────────────────────────────────────

import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { makeAddAction, makeSaveAction, makeExcelGroupAction,} from "@/app/components/grid/actions/commonActions";
import { featureApi as api } from "./IfDeliveryDestinationApi";
import { MAIN_COLUMN_DEFS, ROLE_TYPE_COLUMN_DEFS, SALES_COLUMN_DEFS, ADDR_COLUMN_DEFS, BANK_ACCOUNT_COLUMN_DEFS, COMPANY_COLUMN_DEFS } from "./IfDeliveryDestinationColumns";
import { MENU_CODE, AUTH } from "./IfDeliveryDestination";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { FeatureModel, GridKey } from "./IfDeliveryDestinationModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { Lang } from "@/app/services/common/Lang";
import { showInfoModal } from "@/app/components/popup/showInfoModal";

interface ControllerArgs {
  model: FeatureModel;
}

export function useFeatureController({ model }: ControllerArgs) {
  const { menuName } = useMenuMeta();

  const base = useBaseController<GridKey>({ model });

  // ── 메인 fetch (SearchFilters 의 fetchFn) ─────────────────────
  // 외부 탭 등 화면 고유 조건이 있으면 params 에 합쳐서 전달
  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getList(params),
    [],
  );

  // ── 메인 행 클릭 — selection + 자식(detail) cascade reset/fetch ─
  // handleRowClick 한 줄로 selection set / reset / fetch 모두 처리.
  const onMainGridClick = useCallback(
    (row: any) => {
      if (
        row == null ||
        [row.IF_ID, row.LOC_CD, row.CRE_DTTM].some(
          (value) => value == null || String(value).trim() === "",
        )
      ) {
        return;
      }

      return base.handleRowClick("main", row, [
        {
          to: "role_type",
          fetch: (r) => api.getRoleList(getSubParams(r)),
        },
        {
          to: "sales",
          fetch: (r) => api.getSalesList(getSubParams(r)),
        },
        {
          to: "addr",
          fetch: (r) => api.getAddrList(getSubParams(r)),
        },
        {
          to: "bank_account",
          fetch: (r) => api.getBankAccountList(getSubParams(r)),
        },
        {
          to: "company",
          fetch: (r) => api.getCompanyList(getSubParams(r)),
        },
      ]);
    },
    [base],
  );

  // 동일한 항목으로 인하여 셋팅로직 추가
  const getSubParams = (row: any) => ({
    IF_ID: row.IF_ID,
    LOC_CD: row.LOC_CD,
    CRE_DTTM: row.CRE_DTTM,
  });

  // ── 메인 조회 콜백 (onSearch) — 첫 행 자동 선택 + cascade ──────
  // 메인 cascade 정의는 onMainGridClick 한 곳만 — onSearchCallback 가 그걸 재사용.
  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      onMainGridClick(data?.rows?.[0]);
    },
    [model.grids.main, onMainGridClick],
  );

  // 재처리
  const onReProcess = useCallback(
    (e?: any) => {
      const selectedRows = Array.isArray(e?.data)
        ? e.data
        : e?.data
          ? [e.data]
          : [];

      if (selectedRows.length === 0) {
        showInfoModal(Lang.get("MSG_SELECT_NO_DATA"));
        return;
      }

      for (const row of selectedRows) {
        const ifId = String(row.IF_ID ?? "");

        if (row.IF_PRCS_STS === "R") {
          showInfoModal(Lang.get("LBL_ALREADY_RETRY", ifId));
          return;
        }

        if (row.IF_PRCS_STS !== "E") {
          showInfoModal(Lang.get("MSG_ALREADY_SUCCESS", ifId));
          return;
        }
      }

      base
        .callAjax(
          api.reprocess({
            dsSave: selectedRows,
          }),
          { successMsg: "MSG_SAVE_CMPLT", mask: "main" },
        )
        .then(() => base.search());
    },
    [base],
  );  
  // ── 그리드별 actions 배열 ─────────────────────────────────────
  // 추가/저장/사용자정의 버튼 결정은 모두 여기서. View 는 binding 만.
  // ActionItem[] 타입 명시 — 화면 고유 버튼 추가 시 type 추론 도움.
  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_REPRO",
        label: "BTN_REPRO",
        onClick: onReProcess,
      }, 
      makeExcelGroupAction({
        columns: MAIN_COLUMN_DEFS,
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getList(model.filtersRef.current),
        rows: model.grids.main.rows,
        // 엑셀 업로드 / 양식 다운로드를 그룹 "안"에 포함 (필요한 화면만).
        // gridId 는 View 가 export 한 AUTH.grids 단일 소스 참조 (센차 grid.authId).
        // 그룹 "밖" 별도 버튼은 makeExcelUploadAction / makeExcelTemplateDownloadAction 따로 호출.
        upload: { gridId: AUTH.grids.main, onUploaded: () => base.search() },
        templateDownload: { gridId: AUTH.grids.main },
      }),
    ],
    [onReProcess, menuName, model.grids.main, model.filtersRef, base],
  );

  // ── 탭페이지별 그리드 actions 배열 ─────────────────────────────────────
const tabActions = useMemo(
  () => ({
    role_type: [
      makeExcelGroupAction({
        excelColumns: () => model.grids.role_type.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        rows: model.grids.role_type.rows,
        fetchFn: () => Promise.resolve({ data: { result: [] } }),
        hideAll: true,
      }),
    ],
    sales: [
      makeExcelGroupAction({
        excelColumns: () => model.grids.sales.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        rows: model.grids.sales.rows,
        fetchFn: () => Promise.resolve({ data: { result: [] } }),
        hideAll: true,
      }),
    ],
    addr: [
      makeExcelGroupAction({
        excelColumns: () => model.grids.addr.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        rows: model.grids.addr.rows,
        fetchFn: () => Promise.resolve({ data: { result: [] } }),
        hideAll: true,
      }),
    ],
    bank_account: [
      makeExcelGroupAction({
        excelColumns: () => model.grids.bank_account.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        rows: model.grids.bank_account.rows,
        fetchFn: () => Promise.resolve({ data: { result: [] } }),
        hideAll: true,
      }),
    ],
    company: [
      makeExcelGroupAction({
        excelColumns: () => model.grids.company.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName,
        rows: model.grids.company.rows,
        fetchFn: () => Promise.resolve({ data: { result: [] } }),
        hideAll: true,
      }),
    ],
  }),
  [menuName, model.grids],
);
  /*
  const detailActions: ActionItem[] = useMemo(
    () => [
      makeAddAction({ onClick: onAddDetail }),
      makeSaveAction({ onClick: onSaveDetail }),
      makeExcelGroupAction({
        columns: DETAIL_COLUMN_DEFS,
        excelColumns: () => model.grids.detail.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => {
          const main = model.grids.main.selectedRef.current;
          return main
            ? api.getDetailList({ XXX_CD: main.XXX_CD })
            : Promise.resolve({ data: { result: [] } });
        },
        rows: model.grids.detail.rows,
      }),
    ],
    [
      onAddDetail,
      onSaveDetail,
      menuName,
      model.grids.detail,
      model.grids.main.selectedRef,
    ],
  );
  */

  return {
    fetchList,
    onSearchCallback,
    onMainGridClick,
    mainActions,
    tabActions,
  };
}

// ────────────────────────────────────────────────────────────────
// [참고 1] 사전 검증이 필요한 저장 (centRA: checkBeforeSaveSub01Grid)
//
//   const checkBefore = useCallback(() => {
//     const rows = model.grids.detail.ref.current?.rows ?? [];
//     if (rows.some((r: any) => r.DFT_YN === "Y")) return true;
//     base.alert("기본값(Y) 인 행이 1건 이상 있어야 합니다.");
//     return false;
//   }, [model, base]);
//
//   const onSaveDetail = () =>
//     base.saveGrid("detail", api.saveDetail, {
//       beforeSave: checkBefore,                       // ← false 반환 시 저장 중단
//       afterSave: { cascadeFrom: "main", fetch: ... },
//     });
//
// [참고 2] 동기화 같은 화면 고유 액션 (centRA: syncConfig)
//
//   const syncConfig = useCallback(
//     () =>
//       base
//         .callAjax(api.syncConfig({...}), "동기화되었습니다.")
//         .then(() => base.search()),
//     [base],
//   );
//   // mainActions 에 합성
//   const mainActions = useMemo(() => [
//     makeAddAction({ onClick: onAddMain }),
//     makeSaveAction({ onClick: onSaveMain }),
//     { type: "button" as const, key: "LBL_SYNC", label: "LBL_SYNC", onClick: syncConfig },
//   ], [onAddMain, onSaveMain, syncConfig]);
//
// [참고 3] 외부 탭 변경 시 전체 클리어 + 재조회 (centRA: onTypeTabChange)
//
//   const onTabChange = useCallback(
//     (key: string) => {
//       model.setActiveType(key);
//       base.resetGrids(["main", "detail"]);
//       setTimeout(() => base.search(1), 0);
//     },
//     [model, base],
//   );
//
// [참고 4] 4그리드 cascade (LgstgrpOprConfigMst 의 main → sub01 → sub02 흐름)
//
//   const onMainGridClick = useCallback(
//     (row: any) =>
//       base.handleRowClick("main", row, [
//         { to: "sub01", fetch: (r) => api.getSub01({ KEY: r.KEY }) },
//         { to: "sub03", fetch: (r) => api.getSub03({ KEY: r.KEY }) },
//       ], { alsoReset: ["sub02"] }),     // ← 손자(sub02) 도 reset
//     [base],
//   );
//
//   const onSub01GridClick = useCallback(
//     (row: any) =>
//       base.handleRowClick("sub01", row, [
//         { to: "sub02", fetch: (r) => api.getSub02({ KEY: r.KEY, SUB: r.SUB }) },
//       ]),
//     [base],
//   );
// ────────────────────────────────────────────────────────────────
