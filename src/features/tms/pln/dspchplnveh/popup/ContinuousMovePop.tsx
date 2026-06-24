"use client";

// 복화운송 생성 팝업 (센차 dspchpln/pop/CreateContinuousMovePop).
//  출발지(FROM)·도착지(TO) 위치를 코드검색팝업(CommonPopup, selectLocationCodeName)으로 선택
//  → onConfirm 으로 위치 ID/CD/NM/ADDR_ID 반환. 부모가 saveCreateContinuousMove 호출.

import { useState } from "react";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { Lang } from "@/app/services/common/Lang";

type LocPick = {
  CODE: string;
  NAME: string;
  LOC_ID?: string;
  ADDR_ID?: string;
};

export type ContinuousMovePayload = {
  FRM_LOC_ID?: string;
  FRM_LOC_CD: string;
  FRM_LOC_NM: string;
  FROM_ADDR_ID?: string;
  TO_LOC_ID?: string;
  TO_LOC_CD: string;
  TO_LOC_NM: string;
  TO_ADDR_ID?: string;
};

type Props = {
  onConfirm: (data: ContinuousMovePayload) => void;
  onClose: () => void;
};

function LocField({
  label,
  pick,
  onClickSearch,
}: {
  label: string;
  pick: LocPick | null;
  onClickSearch: () => void;
}) {
  return (
    <div className="grid grid-cols-3 items-center gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-slate-100">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="col-span-2 flex items-center gap-2">
        <input
          readOnly
          value={pick ? `${pick.CODE} | ${pick.NAME}` : ""}
          onClick={onClickSearch}
          placeholder="검색"
          className="h-10 flex-1 px-3 text-sm border border-gray-300 rounded-lg bg-slate-100 text-slate-700 outline-none cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function ContinuousMovePop({ onConfirm, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [from, setFrom] = useState<LocPick | null>(null);
  const [to, setTo] = useState<LocPick | null>(null);

  const pickLoc = (set: (p: LocPick) => void) =>
    openPopup({
      title: "LBL_LOCATION",
      width: "2xl",
      content: (
        <CommonPopup
          sqlId="selectLocationCodeName"
          onApply={(row: any) => {
            set({
              CODE: row.CODE,
              NAME: row.NAME,
              LOC_ID: row.LOC_ID,
              ADDR_ID: row.ADDR_ID,
            });
            closePopup();
          }}
          onClose={closePopup}
        />
      ),
    });

  const isValid = !!from && !!to;

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel="저장"
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onConfirm({
          FRM_LOC_ID: from?.LOC_ID,
          FRM_LOC_CD: from?.CODE ?? "",
          FRM_LOC_NM: from?.NAME ?? "",
          FROM_ADDR_ID: from?.ADDR_ID,
          TO_LOC_ID: to?.LOC_ID,
          TO_LOC_CD: to?.CODE ?? "",
          TO_LOC_NM: to?.NAME ?? "",
          TO_ADDR_ID: to?.ADDR_ID,
        })
      }
    >
      <LocField
        label={Lang.get("LBL_DEPARTURE")}
        pick={from}
        onClickSearch={() => pickLoc(setFrom)}
      />
      <LocField
        label={Lang.get("LBL_DESTINATION")}
        pick={to}
        onClickSearch={() => pickLoc(setTo)}
      />
    </FormPopupLayout>
  );
}
