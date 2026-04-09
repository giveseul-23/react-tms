// src/views/vehicleMgmt/VehicleMgmtController.tsx
import { useCallback, MutableRefObject } from "react";
import { vehicleMgmtApi } from "@/app/services/vehicle/vehicleMgmtApi";
import { useApiHandler } from "@/hooks/useApiHandler";
import { usePopup } from "@/app/components/popup/PopupContext";
import { useGuard } from "@/hooks/useGuard";
import { downExcelSearch, downExcelSearched } from "@/views/common/common";
import ConfirmModal from "@/views/common/ConfirmPopup";
import { VehicleMgmtModel } from "./VehicleMgmtModel";
import { MAIN_COLUMN_DEFS } from "./VehicleMgmtColumns.tsx";

type ControllerProps = {
  model: VehicleMgmtModel;
  searchRef: MutableRefObject<((page?: number) => void) | null>;
  filtersRef: MutableRefObject<Record<string, unknown>>;
};

export function useVehicleMgmtController({
  model,
  searchRef,
  filtersRef,
}: ControllerProps) {
  const { handleApi } = useApiHandler();
  const { openPopup, closePopup } = usePopup();
  const { guardHasData } = useGuard();

  // ── fetchVehicleList (조회 API) ──────────────────────────────
  const fetchVehicleList = useCallback(
    (params: Record<string, unknown>) => vehicleMgmtApi.getVehicleList(params),
    [],
  );

  // ── handleSearch (조회 결과 콜백) ────────────────────────────
  const handleSearch = useCallback(
    (data: any) => {
      model.setGridData(data);
      model.closeDetail();
    },
    [model],
  );

  // ── handleRowClicked (행 클릭 → 상세 패널 열기) ──────────────
  const handleRowClicked = useCallback(
    (row: any) => {
      const idx = model.gridData.rows.findIndex(
        (r: any) => r.VEH_CD === row.VEH_CD,
      );
      model.setSelectedRow(row);
      model.setDetailData({ ...row });
      model.setDetailMode("edit");
      model.setDetailIndex(idx);
      model.setDetailOpen(true);
    },
    [model],
  );

  // ── handleNavigate (상세 패널 이전/다음) ─────────────────────
  const handleNavigate = useCallback(
    (dir: number) => {
      const nextIdx = model.detailIndex + dir;
      if (nextIdx < 0 || nextIdx >= model.gridData.rows.length) return;
      const nextRow = model.gridData.rows[nextIdx];
      model.setSelectedRow(nextRow);
      model.setDetailData({ ...nextRow });
      model.setDetailIndex(nextIdx);
    },
    [model],
  );

  // ── handleSaveDetail (상세 패널 저장) ────────────────────────
  const handleSaveDetail = useCallback(() => {
    const data = model.detailData;
    if (!data.VEH_NO?.trim()) return;

    handleApi(
      vehicleMgmtApi.updateVehicle(data),
      "저장되었습니다.",
    ).then(() => searchRef.current?.());
  }, [model, handleApi, searchRef]);

  // ── handleDeleteDetail (상세 패널 삭제) ──────────────────────
  const handleDeleteDetail = useCallback(() => {
    const data = model.detailData;
    openPopup({
      content: (
        <ConfirmModal
          title="확인"
          description={`"${data.VEH_NO}" 차량을 삭제하시겠습니까?`}
          onClose={closePopup}
          onConfirm={() => {
            closePopup();
            handleApi(
              vehicleMgmtApi.deleteVehicle({ VEH_CD: data.VEH_CD }),
              "삭제되었습니다.",
            ).then(() => {
              model.closeDetail();
              searchRef.current?.();
            });
          }}
          type="confirm"
        />
      ),
      width: "lg",
    });
  }, [model, handleApi, openPopup, closePopup, searchRef]);

  // ── handleOpenNew (신규 등록 슬라이드 열기) ──────────────────
  const handleOpenNew = useCallback(() => {
    model.setNewFormData({
      VEH_NO: "",
      DIV_CD: "",
      DIV_NM: "",
      LGST_GRP_CD: "",
      LGST_GRP_NM: "",
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
    });
    model.setNewSlideOpen(true);
  }, [model]);

  // ── handleSaveNew (신규 등록 저장) ───────────────────────────
  const handleSaveNew = useCallback(() => {
    const data = model.newFormData;
    if (!data.VEH_NO?.trim()) return;

    handleApi(
      vehicleMgmtApi.insertVehicle(data),
      "등록되었습니다.",
    ).then(() => {
      model.setNewSlideOpen(false);
      searchRef.current?.();
    });
  }, [model, handleApi, searchRef]);

  // ── mainActions (메인 그리드 툴바) ───────────────────────────
  const mainActions = [
    {
      type: "button",
      key: "신규등록",
      label: "+ 신규 등록",
      variant: "primary",
      onClick: () => handleOpenNew(),
    },
    {
      type: "button",
      key: "차량전송IF",
      label: "차량전송(IF)",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(
          vehicleMgmtApi.sendVehicleIF(e.data),
          "차량전송(IF) 처리되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "연락처변경",
      label: "연락처변경",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(
          vehicleMgmtApi.changeContact(e.data),
          "연락처 변경되었습니다.",
        ).then(() => searchRef.current?.());
      },
    },
    {
      type: "button",
      key: "차고지일괄변경",
      label: "차고지일괄변경",
      onClick: (e: any) => {
        if (!guardHasData(e.data)) return;
        handleApi(
          vehicleMgmtApi.changeGarageBatch(e.data),
          "차고지 일괄변경되었습니다.",
        ).then(() => searchRef.current?.());
      },
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
              columns: MAIN_COLUMN_DEFS({}),
              menuName: "차량관리",
              fetchFn: () =>
                vehicleMgmtApi.getVehicleList(filtersRef.current),
            });
          },
        },
        {
          type: "button",
          key: "보이는데이터다운로드",
          label: "보이는데이터다운로드",
          onClick: () => {
            downExcelSearched({
              columns: MAIN_COLUMN_DEFS({}),
              rows: model.gridData.rows,
              menuName: "차량관리",
            });
          },
        },
      ],
    },
  ];

  return {
    fetchVehicleList,
    handleSearch,
    handleRowClicked,
    handleNavigate,
    handleSaveDetail,
    handleDeleteDetail,
    handleOpenNew,
    handleSaveNew,
    mainActions,
  };
}
