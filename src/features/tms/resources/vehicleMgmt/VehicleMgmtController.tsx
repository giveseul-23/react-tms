// src/views/vehicleMgmt/VehicleMgmtController.tsx
import { useCallback, useMemo } from "react";
import { useBaseController } from "@/app/feature/useBaseController";
import { newRid } from "@/app/feature/useBaseModel";
import { markDelete } from "@/app/components/grid/gridUtils/rowStatus";
import { vehicleMgmtApi as api } from "./vehicleMgmtApi";
import { useGuard } from "@/hooks/useGuard";
import { MENU_CODE } from "./VehicleMgmt";
import { makeExcelGroupAction } from "@/app/components/grid/actions/commonActions";
import type { ActionItem } from "@/app/components/ui/GridActionsBar";
import type { VehicleMgmtModel, GridKey } from "./VehicleMgmtModel";
import { useMenuMeta } from "@/app/context/MenuMetaContext";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";
import PhoneNumberChgPop from "./popup/PhoneNumberChgPop";
import DomicileChgPop from "./popup/DomicileChgPop";
import VehSendTargetSysPop from "./popup/VehSendTargetSysPop";

interface Args {
  model: VehicleMgmtModel;
}

const todayCompact = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

const stripSep = (v: any) => String(v ?? "").replace(/[\s\-:/T]/g, "");

export function useVehicleMgmtController({ model }: Args) {
  const base = useBaseController<GridKey>({ model });
  const { menuName } = useMenuMeta();
  const { guardHasData } = useGuard();
  const { openPopup, closePopup } = usePopup();

  const fetchList = useCallback(
    (params: Record<string, unknown>) => api.getVehicleList(params),
    [],
  );

  const onSearchCallback = useCallback(
    (data: any) => {
      model.grids.main.setData(data);
      model.closeDetail();
    },
    [model],
  );

  const handleRowClicked = useCallback(
    (row: any) => {
      const data = model.grids.main.data;
      const localIdx = data.rows.findIndex((r: any) => r.VEH_ID === row.VEH_ID);
      const globalIdx = (data.page - 1) * data.limit + localIdx;
      model.grids.main.setSelected(row);
      model.setDetailData({ ...row });
      model.setDetailMode("edit");
      model.setDetailIndex(globalIdx);
      model.setDetailOpen(true);
    },
    [model],
  );

  const handleNavigate = useCallback(
    async (dir: number) => {
      const data = model.grids.main.data;
      const nextGlobalIdx = model.detailIndex + dir;
      if (nextGlobalIdx < 0 || nextGlobalIdx >= data.totalCount) return;

      const pageSize = data.limit;
      const currentPage = data.page;
      const nextPage = Math.floor(nextGlobalIdx / pageSize) + 1;
      const localIdx = nextGlobalIdx % pageSize;

      if (nextPage === currentPage) {
        const nextRow = data.rows[localIdx];
        model.grids.main.setSelected(nextRow);
        model.setDetailData({ ...nextRow });
        model.setDetailIndex(nextGlobalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getVehicleList({
            ...model.filtersRef.current,
            page: nextPage,
            limit: pageSize,
          });
          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            [];
          const nextRow = rows[localIdx];
          if (nextRow) {
            model.grids.main.setSelected(nextRow);
            model.setDetailData({ ...nextRow });
            model.setDetailIndex(nextGlobalIdx);
          }
        } finally {
          model.setNavigating(false);
        }
      }
    },
    [model],
  );

  const handleJumpTo = useCallback(
    async (targetNum: number) => {
      const data = model.grids.main.data;
      const globalIdx = targetNum - 1;
      if (globalIdx < 0 || globalIdx >= data.totalCount) return;
      if (globalIdx === model.detailIndex) return;

      const pageSize = data.limit;
      const currentPage = data.page;
      const targetPage = Math.floor(globalIdx / pageSize) + 1;
      const localIdx = globalIdx % pageSize;

      if (targetPage === currentPage) {
        const row = data.rows[localIdx];
        model.grids.main.setSelected(row);
        model.setDetailData({ ...row });
        model.setDetailIndex(globalIdx);
      } else {
        try {
          model.setNavigating(true);
          const res: any = await api.getVehicleList({
            ...model.filtersRef.current,
            page: targetPage,
            limit: pageSize,
          });
          const rows =
            res.data.result ??
            res.data.data.allData?.data ??
            res.data.data.dsOut ??
            [];
          const row = rows[localIdx];
          if (row) {
            model.grids.main.setSelected(row);
            model.setDetailData({ ...row });
            model.setDetailIndex(globalIdx);
          }
        } finally {
          model.setNavigating(false);
        }
      }
    },
    [model],
  );

  // 저장 전 계약일자 검증 (센차 onCheckBeforeSaveVeh)
  const validateContract = useCallback(
    (row: any): boolean => {
      if (row?.VEH_OPER_SCD === "30") return true;
      const s = stripSep(row?.CONTRACT_SDATE);
      const e = stripSep(row?.CONTRACT_EDATE);
      if (!s || !e) return true;
      if (s > e) {
        base.alert(
          Lang.get(
            "MSG_VALID_RANGE_CHK",
            Lang.get("LBL_CONTRACT_SDATE"),
            Lang.get("LBL_CONTRACT_EDATE"),
          ),
          Lang.get("TTL_ERR"),
        );
        return false;
      }
      if (e < todayCompact()) {
        base.alert(
          Lang.get(
            "MSG_VALID_RANGE_CHK_G",
            Lang.get("LBL_CONTRACT_EDATE"),
            Lang.get("LBL_TODAY"),
          ),
          Lang.get("TTL_ERR"),
        );
        return false;
      }
      return true;
    },
    [base],
  );

  // 저장 대상(dirty I/U) 행 전체 계약일자 검증
  const validateDirtyContracts = useCallback(
    () =>
      (model.grids.main.rows ?? [])
        .filter((r: any) => r.EDIT_STS === "I" || r.EDIT_STS === "U")
        .every((r: any) => validateContract(r)),
    [model, validateContract],
  );

  const handleSaveDetail = useCallback(() => {
    base.saveGrid("main", (p) => api.save(p), {
      successMsg: "MSG_SAVE_CMPLT",
      beforeSave: validateDirtyContracts,
      afterSave: () => base.search(), // onSearchCallback 이 detail 닫음
    });
  }, [base, validateDirtyContracts]);

  const handleDeleteDetail = useCallback(() => {
    const data = model.detailData;
    const rid = data.__rid__;
    const cur = model.grids.main.data;
    const rows = (cur.rows ?? []).map((r: any) => {
      if (r.__rid__ !== rid) return r;
      const next = { ...r };
      markDelete(next);
      return next;
    });
    // 객체 직접 set → allDataRef 동기 갱신(saveGrid 가 최신 D 행을 읽도록)
    model.grids.main.setData({ ...cur, rows });

    base.saveGrid("main", (p) => api.save(p), {
      successMsg: "삭제되었습니다.",
      confirmOnDelete: `"${data.VEH_NO}" 차량을 삭제하시겠습니까?`,
      afterSave: () => {
        model.closeDetail();
        base.search();
      },
    });
  }, [model, base]);

  const handleOpenNew = useCallback(() => {
    const srchObj = model.rawFiltersRef.current;

    const newRow: Record<string, any> = {
      VEH_NO: "",
      DIV_CD: srchObj.SRCH_DTL_DIV_CD ?? "",
      DIV_NM: srchObj.SRCH_DTL_DIV_NM ?? "",
      LGST_GRP_CD: srchObj.SRCH_DTL_LGST_GRP_CD ?? "",
      LGST_GRP_NM: srchObj.SRCH_DTL_LGST_GRP_NM ?? "",
      PAY_LGST_GRP_CD: srchObj.SRCH_DTL_LGST_GRP_CD ?? "",
      PAY_LGST_GRP_NM: srchObj.SRCH_DTL_LGST_GRP_NM ?? "",
      SETL_TP: "",
      CARR_CD: "",
      CARR_NM: "",
      DRVR_ID: "",
      DRVR_NM: "",
      HLPR_ID: "",
      HLPR_NM: "",
      PAY_CARR_CD: "",
      PAY_CARR_NM: "",
      VEH_OP_STS: "100",
      VEH_OP_TP: "",
      VEH_TP_CD: "",
      VEH_TP_NM: "",
      AP_LGST_GRP_CD: "",
      INSRNC_CALC_YN: "N",
      AUTO_DLVRY_REQ_YN: "N",
      AUTO_ACPT_YN: "N",
      FUEL_TCD: "DISL",
      EDIT_STS: "I",
      __rid__: newRid(),
    };

    // 그리드에 신규 행 push + 선택 — 폼은 이 행과 __rid__ 로 묶여 실시간 동기화된다.
    model.grids.main.setData((prev: any) => ({
      ...prev,
      rows: [...(prev?.rows ?? []), newRow],
    }));
    model.grids.main.setSelected(newRow);
    model.setNewFormData(newRow);
    model.setNewSlideOpen(true);
  }, [model]);

  // 신규 취소 — 추가했던 임시(I) 행을 그리드에서 제거 + 선택 해제 후 슬라이드 닫기.
  const handleCancelNew = useCallback(() => {
    const rid = model.newFormData?.__rid__;
    if (rid) {
      model.grids.main.setData((prev: any) => ({
        ...prev,
        rows: (prev?.rows ?? []).filter((r: any) => r.__rid__ !== rid),
      }));
    }
    model.grids.main.setSelected(null);
    model.setNewSlideOpen(false);
  }, [model]);

  const handleSaveNew = useCallback(() => {
    base.saveGrid("main", (p) => api.save(p), {
      successMsg: "등록되었습니다.",
      beforeSave: validateDirtyContracts,
      afterSave: () => {
        model.setNewSlideOpen(false);
        base.search();
      },
    });
  }, [model, base, validateDirtyContracts]);

  // ── 연락처(전화번호) 변경 — 단건만 ─────────────────────────
  const onChangeContact = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (!guardHasData(rows)) return;
      if (rows.length > 1) {
        base.alert(Lang.get("MSG_CHECK_SINGLE_RECORD"), Lang.get("TTL_ERR"));
        return;
      }
      const row = rows[0];
      openPopup({
        title: "LBL_TEL_CHG_POP",
        width: "lg",
        content: (
          <PhoneNumberChgPop
            row={row}
            onConfirm={(newPhone) => {
              closePopup();
              base
                .callAjax(
                  api.saveUserPhoneNumber({
                    USR_ID: row.DRVR_ID,
                    MBL_PHN_NO: newPhone,
                    MBL_PHN_NO_OLD: row.MBL_PHN_NO,
                  }),
                  { mask: "main" },
                )
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, guardHasData, openPopup, closePopup],
  );

  // ── 운송협력사 변경 ────────────────────────────────────────
  const onChangeCarrier = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (!guardHasData(rows)) return;
      const lgstGrpCd = rows[0]?.LGST_GRP_CD;
      openPopup({
        title: "BTN_CHAGE_CARR",
        width: "2xl",
        content: (
          <CommonPopup
            fetchFn={(extra: any) =>
              api.searchLgstGrpCarr({ LGST_GRP_CD: lgstGrpCd, ...extra })
            }
            onApply={(carr: any) => {
              closePopup();
              const saveRows = rows.map((v: any) => ({
                ...v,
                CARR_CD: carr.CODE,
                rowStatus: "I",
              }));
              base
                .callAjax(api.changeLgstCarr(saveRows), { mask: "main" })
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, guardHasData, openPopup, closePopup],
  );

  // ── 소속(차고지) 일괄변경 ──────────────────────────────────
  const onChangeDomicile = useCallback(() => {
    const selected = model.grids.main.selectedRef.current;
    openPopup({
      title: "LBL_CHG_DOMICILE",
      width: "full",
      content: (
        <DomicileChgPop
          params={{
            DIV_CD: selected.DIV_CD,
            LGST_GRP_CD: selected.LGST_GRP_CD,
            VEH_OP_TP: selected.VEH_OP_TP,
            VEH_OPER_SCD: selected.VEH_OPER_SCD,
          }}
          onApplied={() => {
            closePopup();
            base.search();
          }}
          onClose={closePopup}
        />
      ),
    });
  }, [model.grids.main.selectedRef, openPopup, closePopup, base]);

  // ── 차량 일괄전송(IF) ──────────────────────────────────────
  const onSendVehicle = useCallback(
    (e: any) => {
      const rows = e?.data ?? [];
      if (!guardHasData(rows)) return;
      openPopup({
        title: "LBL_VEH_SEND_TARGET_SYS",
        width: "4xl",
        content: (
          <VehSendTargetSysPop
            vehRows={rows}
            onConfirm={({ invSystems, ifTcd }) => {
              closePopup();
              const payload = rows.map((v: any) => ({
                ...v,
                rowStatus: "U",
                VEHARRAY: invSystems.map((s: any) => ({
                  INV_SYS_ID: s.INV_SYS_ID,
                  VEH_ID: v.VEH_ID,
                  PLANT_CD: s.PLANT_CD,
                  LGST_GRP_CD: v.LGST_GRP_CD,
                  IF_TCD: ifTcd,
                })),
              }));
              base
                .callAjax(api.sendVehicleIF(payload), { mask: "main" })
                .then(() => base.search());
            }}
            onClose={closePopup}
          />
        ),
      });
    },
    [base, guardHasData, openPopup, closePopup],
  );

  const mainActions: ActionItem[] = useMemo(
    () => [
      {
        type: "button",
        key: "BTN_ADD",
        label: "BTN_ADD",
        onClick: () => handleOpenNew(),
      },
      {
        type: "button",
        key: "BTN_SEND_VEH",
        label: "BTN_SEND_VEH",
        onClick: onSendVehicle,
      },
      {
        type: "button",
        key: "BTN_DRIVER_TEL_CHANGE",
        label: "BTN_DRIVER_TEL_CHANGE",
        onClick: onChangeContact,
      },
      {
        type: "button",
        key: "BTN_CHG_CARR",
        label: "BTN_CHAGE_CARR",
        onClick: onChangeCarrier,
      },
      {
        type: "button",
        key: "BTN_CHG_DOMICILE",
        label: "BTN_CHG_DOMICILE",
        onClick: onChangeDomicile,
      },
      makeExcelGroupAction({
        excelColumns: () => model.grids.main.getExcelColumns(),
        menuCode: MENU_CODE,
        menuName: menuName,
        fetchFn: () => api.getVehicleList(model.filtersRef.current),
        rows: model.grids.main.rows,
        // 그룹 안에 엑셀업로드 / 엑셀양식다운로드 버튼 포함
        upload: { onUploaded: () => base.search() },
        templateDownload: {},
      }),
    ],
    [
      base,
      handleOpenNew,
      onSendVehicle,
      onChangeContact,
      onChangeCarrier,
      onChangeDomicile,
      menuName,
      model.grids.main,
      model.filtersRef,
    ],
  );

  return {
    fetchVehicleList: fetchList,
    onSearchCallback,
    handleRowClicked,
    handleNavigate,
    handleJumpTo,
    handleSaveDetail,
    handleDeleteDetail,
    handleOpenNew,
    handleCancelNew,
    handleSaveNew,
    mainActions,
  };
}
