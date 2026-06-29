// src/app/components/grid/commonActions.tsx
//
// 공통 그리드 버튼 액션 팩토리.
// Controller 파일들에 반복적으로 등장하던
// 추가(ADD), 저장(SAVE), 엑셀(EXCEL GROUP) 버튼을
// 개별 설정값으로 켜고 끌 수 있도록 제공한다.
//
// 주의: 각 액션 객체의 type/key/label 구조 및 onClick 시그니처는
// 기존 Controller 코드와 byte-for-byte 동일하게 유지한다.

import { useCallback, useMemo, useState } from "react";
import {
  downExcelSearch,
  downExcelSearched,
} from "@/app/services/common/excelService";
import { commonApi } from "@/app/services/common/commonApi";
import { showErrorModal } from "@/app/components/popup/showErrorModal";
import { showInfoModal } from "@/app/components/popup/showInfoModal";
import { getPopupApi } from "@/app/components/popup/PopupContext";
import ConfirmModal from "@/app/components/popup/ConfirmPopup";
import MemoInputPopup from "@/app/components/popup/MemoInputPopup";
import { TrackPanel } from "@/app/components/track/TrackPanel";
import {
  TRACK_KEY_FIELD_MAP,
  type TrackType,
} from "@/app/components/track/trackColumns";
import { Lang } from "@/app/services/common/Lang";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type AddActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
  /** 리소스 권한 클래스. 기본 "I"(추가). null/"" 로 권한제어 해제 가능. */
  authCls?: string;
};

export type SaveActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
  /** 리소스 권한 클래스. 기본 "C"(저장). */
  authCls?: string;
};

export type ExcelGroupActionConfig = {
  /** 정적 컬럼 defs (폴백). excelColumns 만으로 구성할 땐 생략 가능. */
  columns?: any[];
  /** 클릭 시점에 "표시 중인 컬럼 defs(audit 포함 + 런타임 숨김/순서 반영)" 를 반환하는 getter.
   *  DataGrid 화면 권장: `() => model.grids.<key>.getExcelColumns()`.
   *  빈 배열이면(그리드 미마운트 등) columns 로 폴백. */
  excelColumns?: () => any[];
  /** 서버 MENU_CD — 엑셀 3단계 세션 키. 화면의 MENU_CD/MENU_CODE 상수. */
  menuCode: string;
  /** 다운로드 파일 표시명(시트 제목). 미지정 시 menuCode 로 폴백. */
  menuName?: string;
  fetchFn: () => Promise<any> | any;
  /** 보이는 데이터 행. 배열 또는 클릭 시점에 평가할 getter.
   *  getter 권장 — 배열로 넘기면 액션 생성 시점 스냅샷이라 조회 후 데이터가 반영 안 될 수 있다. */
  rows: any[] | (() => any[]);
  searchUrl?: string;
  /** 지정 시 클릭 시점에 표시 중인 colId 목록을 받아 columns 를 표시된 것만/표시 순서로 거른다.
   *  (런타임 컬럼 숨김/보임 반영) 미지정이면 정적 columns 그대로 사용. */
  getVisibleColIds?: () => string[] | null | undefined;
  /** 조회된 모든 데이터 다운로드 버튼 숨김 */
  hideAll?: boolean;
  /** 보이는 데이터 다운로드 버튼 숨김 */
  hideVisible?: boolean;
  /** 지정 시 엑셀 그룹 items "안"에 업로드 버튼 포함. (menuCode 는 그룹 것 재사용)
   *  그룹 "밖" 별도 버튼으로 두려면 이걸 생략하고 makeExcelUploadAction 을 따로 호출. */
  upload?: Omit<ExcelUploadActionConfig, "menuCode">;
  /** 지정 시 엑셀 그룹 items "안"에 양식 다운로드 버튼 포함. (밖으로 빼려면 makeExcelTemplateDownloadAction 별도 호출) */
  templateDownload?: Omit<ExcelTemplateDownloadActionConfig, "menuCode">;
  /** 리소스 권한 클래스. 기본 "E"(엑셀). */
  authCls?: string;
  label?: string;
  key?: string;
  disabled?: boolean;
};

// ────────────────────────────────────────────────────────────────
// 개별 팩토리
// ────────────────────────────────────────────────────────────────

export const makeAddAction = (config: AddActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "BTN_ADD",
  label: config.label ?? "BTN_ADD",
  onClick: config.onClick ?? ((_e: any) => {}),
  authCls: config.authCls ?? "I",
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

export const makeSaveAction = (config: SaveActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "BTN_SAVE",
  label: config.label ?? "BTN_SAVE",
  onClick: config.onClick ?? ((_e: any) => {}),
  authCls: config.authCls ?? "C",
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// ────────────────────────────────────────────────────────────────
// 추적 그룹 / 이력조회
// ────────────────────────────────────────────────────────────────

export type TrackGroupActionConfig = {
  // 추적 핸들러 — type 받아 (e) => void 반환. 다건 조회 지원 (e.data 가 배열).
  // 보통 useTrackPanel().openTrack 을 그대로 넘김.
  onTrack: (type: TrackType) => (e?: any) => void;
  // 표시 여부 (미지정 = true). false 명시한 항목만 그룹에서 제외.
  buy?: boolean;
  sell?: boolean;
  dispatch?: boolean;
  order?: boolean;
  stop?: boolean;
  pod?: boolean;
  // 기타
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeTrackGroupAction = (config: TrackGroupActionConfig) => ({
  type: "group" as const,
  key: config.key ?? "추적",
  label: config.label ?? "추적",
  items: [
    config.buy !== false && {
      type: "button" as const,
      key: "매입",
      label: "매입",
      onClick: config.onTrack("BUY"),
    },
    config.sell !== false && {
      type: "button" as const,
      key: "매출",
      label: "매출",
      onClick: config.onTrack("SELL"),
    },
    config.dispatch !== false && {
      type: "button" as const,
      key: "배차",
      label: "배차",
      onClick: config.onTrack("DSPCH"),
    },
    config.order !== false && {
      type: "button" as const,
      key: "주문",
      label: "주문",
      onClick: config.onTrack("ORD"),
    },
    config.stop !== false && {
      type: "button" as const,
      key: "경유지",
      label: "경유지",
      onClick: config.onTrack("STOP"),
    },
    config.pod !== false && {
      type: "button" as const,
      key: "인수증",
      label: "인수증",
      onClick: config.onTrack("POD"),
    },
  ].filter(Boolean),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// 추적 그룹 액션 + 패널을 한꺼번에 관리하는 통합 훅.
// 화면은 true/false 옵션만 명시 — 핸들러/state/panel/keyField 모두 자동.
//   const track = useTrackGroupAction();
//   const track = useTrackGroupAction({ pod: false });   // 인수증만 숨김
//
//   Controller: mainActions 에 track.action 변수 참조
//   View:       bottomSlot={track.panel} / bottomOpen={track.open}
export type TrackGroupActionVisibility = {
  buy?: boolean;
  sell?: boolean;
  dispatch?: boolean;
  order?: boolean;
  stop?: boolean;
  pod?: boolean;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export function useTrackGroupAction(
  visibility: TrackGroupActionVisibility = {},
) {
  const [open, setOpen] = useState(false);
  const [trackType, setTrackType] = useState<TrackType | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  const close = useCallback(() => setOpen(false), []);

  // 다건 조회: e.data 가 배열 — 모든 행에서 keyField 값을 추출해 배열로 전달.
  const openTrack = useCallback(
    (type: TrackType) => (e?: any) => {
      if (!e?.data?.length) return;
      const keyField = TRACK_KEY_FIELD_MAP[type];
      const extracted = e.data
        .map((r: any) => r[keyField])
        .filter(Boolean) as string[];
      setTrackType(type);
      setKeys(extracted);
      setOpen(true);
    },
    [],
  );

  const action = useMemo(
    () => makeTrackGroupAction({ onTrack: openTrack, ...visibility }),
    [openTrack, visibility],
  );

  const panel = useMemo(
    () => (
      <TrackPanel
        open={open}
        onClose={close}
        trackType={trackType}
        dspchNos={keys}
      />
    ),
    [open, close, trackType, keys],
  );

  return { action, panel, open, close };
}

export type HistoryActionConfig = {
  onClick?: (e?: any) => void;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeHistoryAction = (config: HistoryActionConfig = {}) => ({
  type: "button" as const,
  key: config.key ?? "이력조회",
  label: config.label ?? "이력조회",
  onClick: config.onClick ?? (() => {}),
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// 클릭 시점에 엑셀 columns 를 확정한다.
//  1순위: excelColumns() — DataGrid 표시 컬럼(audit 포함, 런타임 숨김/순서 반영). 비면 폴백.
//  폴백: 정적 columns. getVisibleColIds 가 있으면(TreeGrid) 그 표시 순서로 필터.
//  컬럼 매칭 키는 colId(트리 컬럼 등) → field 순.
const resolveExcelColumns = (config: ExcelGroupActionConfig) => {
  const fromGrid = config.excelColumns?.();
  if (fromGrid && fromGrid.length > 0) return fromGrid;

  const base = config.columns ?? [];
  const visible = config.getVisibleColIds?.();
  if (!visible || visible.length === 0) return base;
  const byKey = new Map<string, any>();
  for (const col of base) {
    const key = col?.colId ?? col?.field;
    if (key != null) byKey.set(key, col);
  }
  return visible.map((id) => byKey.get(id)).filter(Boolean);
};

// 엑셀 다운로드 실패 메시지 추출 (서버 메시지 → axios 에러 → 기본 문구).
const excelErrorMsg = (e: any): string =>
  e?.response?.data?.error?.message ??
  e?.message ??
  "엑셀 다운로드에 실패했습니다.";

export const makeExcelGroupAction = (config: ExcelGroupActionConfig) => {
  const items: any[] = [];

  if (!config.hideAll) {
    items.push({
      type: "button" as const,
      key: "조회된모든데이터다운로드",
      label: "BTN_EXCEL_DOWN_ALL",
      onClick: () => {
        downExcelSearch({
          columns: resolveExcelColumns(config),
          menuName: config.menuName ?? config.menuCode,
          menuCd: config.menuCode,
          fetchFn: config.fetchFn,
        }).catch((e) => showErrorModal(excelErrorMsg(e)));
      },
    });
  }

  if (!config.hideVisible) {
    items.push({
      type: "button" as const,
      key: "보이는데이터다운로드",
      label: "BTN_EXCEL_DOWN_GRID",
      onClick: () => {
        downExcelSearched({
          columns: resolveExcelColumns(config),
          menuName: config.menuName ?? config.menuCode,
          menuCd: config.menuCode,
          rows:
            typeof config.rows === "function" ? config.rows() : config.rows,
          searchUrl: config.searchUrl,
        }).catch((e) => showErrorModal(excelErrorMsg(e)));
      },
    });
  }

  // 업로드 / 양식 다운로드를 그룹 "안"에 포함 (config 로 넘긴 경우). menuCode 는 그룹 것 재사용.
  // 그룹 "밖" 별도 버튼으로 두려면 이 옵션을 생략하고 화면에서 makeExcelUploadAction /
  // makeExcelTemplateDownloadAction 을 따로 호출한다.
  if (config.upload) {
    items.push(
      makeExcelUploadAction({ menuCode: config.menuCode, ...config.upload }),
    );
  }
  if (config.templateDownload) {
    items.push(
      makeExcelTemplateDownloadAction({
        menuCode: config.menuCode,
        ...config.templateDownload,
      }),
    );
  }

  return {
    type: "group" as const,
    key: config.key ?? "BTN_EXCEL",
    label: config.label ?? "BTN_EXCEL",
    items,
    authCls: config.authCls ?? "E",
    ...(config.disabled !== undefined && { disabled: config.disabled }),
  };
};

// ────────────────────────────────────────────────────────────────
// 엑셀 업로드 / 양식 다운로드 (센차 gridExcelUpload / gridExcelTemplateDownload)
//  - 공통 uploaderService 사용. 업로드 대상 그리드는 gridId(=센차 grid.authId)로 구분.
//  - 버튼 1개씩 반환 — 화면이 원하는 그룹/위치에 끼워 넣는다 (makeAddAction 과 동일 패턴).
// ────────────────────────────────────────────────────────────────

// blob 응답 → 파일 저장. Content-Disposition 파일명 우선, 없으면 fallback.
const downloadBlobResponse = (res: any, fallbackName: string) => {
  const cd = (res?.headers?.["content-disposition"] as string) ?? "";
  const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
  const fileName = m ? decodeURIComponent(m[1]) : fallbackName;
  const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export type ExcelUploadActionConfig = {
  /** 서버 MENU_CD — 화면 menuCode. */
  menuCode: string;
  /** 업로드 대상 그리드 식별자 (센차 grid.authId). 서버가 업로드 컬럼 매핑을 찾는 키. */
  gridId?: string;
  /** 업로드 성공 후 콜백 (보통 그리드 재조회 `() => base.search()`). */
  onUploaded?: () => void;
  /** 업로더 URL 오버라이드. 기본 `/uploaderService/upload`. */
  url?: string;
  /** 파일 확장자 필터. 기본 `.xlsx,.xls`. */
  accept?: string;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeExcelUploadAction = (config: ExcelUploadActionConfig) => ({
  type: "button" as const,
  key: config.key ?? "BTN_EXCEL_UP",
  label: config.label ?? "BTN_EXCEL_UP",
  onClick: () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = config.accept ?? ".xlsx,.xls";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      commonApi
        .uploadCommonExcel({
          file,
          menuCode: config.menuCode,
          gridId: config.gridId,
          url: config.url,
        })
        .then((res: any) => {
          // 서버가 HTTP 200 으로 비즈니스 에러를 알리는 경우.
          if (res?.data?.success === false) {
            showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
            return;
          }
          showInfoModal(Lang.get("MSG_FILE_UPLOAD_CMPLT"));
          config.onUploaded?.();
        })
        .catch((e: any) => showErrorModal(excelErrorMsg(e)));
    };
    input.click();
  },
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

export type ExcelTemplateDownloadActionConfig = {
  menuCode: string;
  gridId?: string;
  /** 다운로드 파일명(확장자 제외). 서버 Content-Disposition 이 없을 때만 사용. */
  fileName?: string;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeExcelTemplateDownloadAction = (
  config: ExcelTemplateDownloadActionConfig,
) => ({
  type: "button" as const,
  key: config.key ?? "BTN_EXCEL_TEMPLATE_DOWNLOAD",
  label: config.label ?? "BTN_EXCEL_TEMPLATE_DOWNLOAD",
  onClick: () => {
    commonApi
      .downloadExcelTemplate({ menuCode: config.menuCode, gridId: config.gridId })
      .then((res: any) =>
        downloadBlobResponse(res, `${config.fileName ?? config.menuCode}.xlsx`),
      )
      .catch((e: any) => showErrorModal(excelErrorMsg(e)));
  },
  ...(config.disabled !== undefined && { disabled: config.disabled }),
});

// ────────────────────────────────────────────────────────────────
// 메모 등록/취소 그룹 (센차 onSaveMemo·onSaveApplnMemo / onCancelMemo·onCancelApplnMemo)
//  - 공통 플로우: 선택행 → 검증 → [등록] 메모입력팝업 → saveMemo / [취소] (confirm) → cancelMemo → 재조회.
//  - 화면별 차이(필드명/상태/URL)는 saveMemo·cancelMemo(api) 가 책임. 팩토리는 플로우만.
//  - 선택행은 wrapActions 가 onClick 에 주입하는 e.data 로 받는다.
// ────────────────────────────────────────────────────────────────

// 메모 입력 팝업 열기 — 확인 시 onConfirm(text).
const openMemoInput = (
  infoText: string | undefined,
  onConfirm: (text: string) => void,
) => {
  const popup = getPopupApi();
  if (!popup) return;
  popup.openPopup({
    title: "LBL_MEMO",
    width: "lg",
    content: (
      <MemoInputPopup
        infoText={infoText}
        onClose={popup.closePopup}
        onConfirm={(text) => {
          popup.closePopup();
          onConfirm(text);
        }}
      />
    ),
  });
};

// 확인 모달 — "확인" 클릭 시 onYes (ESC/외부클릭 = 취소). base.confirm 과 동일 패턴.
const confirmThen = (msg: string, onYes: () => void) => {
  const popup = getPopupApi();
  if (!popup) return;
  popup.openPopup({
    type: "confirm",
    width: "lg",
    content: (
      <ConfirmModal
        type="confirm"
        title={Lang.get("TTL_CONFIRM")}
        description={Lang.get(msg)}
        onClose={() => {
          popup.closePopup();
          onYes();
        }}
      />
    ),
  });
};

export type MemoGroupActionConfig = {
  /** 메모 저장 — rows(선택행) + 입력 text. 화면 api 가 필드/상태/URL 처리. */
  saveMemo: (rows: any[], text: string) => Promise<any>;
  /** 메모 등록취소 — rows(선택행). */
  cancelMemo: (rows: any[]) => Promise<any>;
  /** 성공 후 콜백 (보통 재조회 `() => base.search()`). */
  onDone?: () => void;
  /** 사전 검증 — false 반환 시 중단 (alert 는 validate 내부 책임). mode 로 등록/취소 구분. */
  validate?: (rows: any[], mode: "register" | "cancel") => boolean;
  /** 취소 시 confirm 노출 여부. */
  confirmOnCancel?: boolean;
  /** confirm 메시지 키. 기본 MSG_MEMO_DELETE_IRREVERSIBLE_NOTICE. */
  confirmCancelMsg?: string;
  /** 선택행 없을 때 alert 메시지 키. 기본 MSG_SELECT_NO_DATA. */
  noSelectionMsg?: string;
  /** 메모 입력 팝업 상단 안내문 생성 (optional). */
  popupInfo?: (rows: any[]) => string;
  registerKey?: string;
  registerLabel?: string;
  cancelKey?: string;
  cancelLabel?: string;
  label?: string;
  key?: string;
  disabled?: boolean;
};

export const makeMemoGroupAction = (config: MemoGroupActionConfig) => {
  const noSel = config.noSelectionMsg ?? "MSG_SELECT_NO_DATA";

  const getRows = (e: any): any[] | null => {
    const rows = (e?.data ?? []) as any[];
    if (rows.length === 0) {
      showInfoModal(Lang.get(noSel));
      return null;
    }
    return rows;
  };

  const afterApi = (res: any) => {
    if (res?.data?.success === false) {
      showErrorModal(res.data?.msg ?? Lang.get("TTL_ERR"));
      return;
    }
    showInfoModal(Lang.get("MSG_SAVE_CMPLT"));
    config.onDone?.();
  };

  return {
    type: "group" as const,
    key: config.key ?? "BTN_MEMO",
    label: config.label ?? "BTN_MEMO",
    items: [
      {
        type: "button" as const,
        key: config.registerKey ?? "BTN_REGISTRATION",
        label: config.registerLabel ?? "BTN_REGISTRATION",
        onClick: (e: any) => {
          const rows = getRows(e);
          if (!rows) return;
          if (config.validate && !config.validate(rows, "register")) return;
          openMemoInput(config.popupInfo?.(rows), (text) => {
            config
              .saveMemo(rows, text)
              .then(afterApi)
              .catch((err: any) => showErrorModal(excelErrorMsg(err)));
          });
        },
      },
      {
        type: "button" as const,
        key: config.cancelKey ?? "BTN_CANCEL",
        label: config.cancelLabel ?? "BTN_CANCEL",
        onClick: (e: any) => {
          const rows = getRows(e);
          if (!rows) return;
          if (config.validate && !config.validate(rows, "cancel")) return;
          const run = () =>
            config
              .cancelMemo(rows)
              .then(afterApi)
              .catch((err: any) => showErrorModal(excelErrorMsg(err)));
          if (config.confirmOnCancel) {
            confirmThen(
              config.confirmCancelMsg ?? "MSG_MEMO_DELETE_IRREVERSIBLE_NOTICE",
              run,
            );
          } else {
            run();
          }
        },
      },
    ],
    ...(config.disabled !== undefined && { disabled: config.disabled }),
  };
};

// ────────────────────────────────────────────────────────────────
// 묶음 팩토리: 추가/저장/엑셀을 한 번에 구성
// ────────────────────────────────────────────────────────────────

export type CommonActionsConfig = {
  add?: boolean | AddActionConfig;
  save?: boolean | SaveActionConfig;
  excel?: ExcelGroupActionConfig;
};

/**
 * 설정값으로 추가/저장/엑셀 버튼을 묶어서 반환.
 * - add / save: `true` 또는 설정 객체
 * - excel: 엑셀 그룹이 필요할 때만 config 객체 전달
 *
 * Controller 코드에서 `[...preActions, ...makeCommonActions({...})]` 식으로 합성 가능.
 */
export function makeCommonActions(config: CommonActionsConfig = {}): any[] {
  const actions: any[] = [];

  if (config.add) {
    actions.push(makeAddAction(config.add === true ? {} : config.add));
  }
  if (config.save) {
    actions.push(makeSaveAction(config.save === true ? {} : config.save));
  }
  if (config.excel) {
    actions.push(makeExcelGroupAction(config.excel));
  }

  return actions;
}
