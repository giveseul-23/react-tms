"use client";

import { useEffect, useState } from "react";
import { usePopup } from "@/app/components/popup/PopupContext";
import { CommonPopup } from "@/app/components/popup/CommonPopup";
import { FormPopupLayout } from "@/app/components/popup/FormPopupLayout";
import { Field } from "@/app/components/popup/Field";
import { useCommonStores } from "@/hooks/useCommonStores";
import { Lang } from "@/app/services/common/Lang";

type Props = {
  record: any;
  onApply: (payload: {
    TO_LGST_GRP_CD: string;
    PLN_ID: string;
    PLN_NM: string;
    SHPM_TRNSFR_YN: "Y";
  }) => void;
  onClose: () => void;
};

export default function ShipmentTransferPop({ record, onApply, onClose }: Props) {
  const { openPopup, closePopup } = usePopup();
  const [toLgstGrpCd, setToLgstGrpCd] = useState("");
  const [toLgstGrpNm, setToLgstGrpNm] = useState("");
  const [planId, setPlanId] = useState("");
  const [planNm, setPlanNm] = useState("");

  const { stores } = useCommonStores({
    planId: {
      sqlProp: "selectUsrPlanCodeNameLgstGrpDesc",
      keyParam: toLgstGrpCd || "__EMPTY__",
    },
  });

  useEffect(() => {
    setToLgstGrpCd(String(record?.LGST_GRP_CD ?? ""));
    setToLgstGrpNm(
      String(record?.LGST_GRP_NM ? `[${record.LGST_GRP_CD}]${record.LGST_GRP_NM}` : ""),
    );
  }, [record]);

  useEffect(() => {
    const first = stores.planId?.[0];
    setPlanId(first?.CODE ?? "");
    setPlanNm(first?.NAME ?? "");
  }, [stores.planId]);

  const isValid = !!(toLgstGrpCd && planId);

  return (
    <FormPopupLayout
      cardClassName="space-y-4"
      confirmLabel={Lang.get("BTN_APPLY")}
      isValid={isValid}
      onCancel={onClose}
      onConfirm={() =>
        onApply({
          TO_LGST_GRP_CD: toLgstGrpCd,
          PLN_ID: planId,
          PLN_NM: planNm,
          SHPM_TRNSFR_YN: "Y",
        })
      }
    >
      <Field layout="vertical" type="text" label={Lang.get("LBL_LOGISTICS_GROUP")} value={toLgstGrpNm} disabled />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field
            layout="vertical"
            type="text"
            label={Lang.get("LBL_CHANGE_LOGISTICS_GROUP")}
            value={toLgstGrpCd}
            onChange={(v) => {
              setToLgstGrpCd(v);
              setToLgstGrpNm("");
              setPlanId("");
              setPlanNm("");
            }}
          />
        </div>
        <button
          type="button"
          className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm"
          onClick={() =>
            openPopup({
              title: "LBL_CHANGE_LOGISTICS_GROUP",
              width: "2xl",
              content: (
                <CommonPopup
                  sqlId="selectLogisticsgroupCodeNameNoAuth"
                  {...(record?.DIV_CD
                    ? {
                        filterCol: "DIV_CD",
                        filterValue: String(record.DIV_CD),
                      }
                    : {})}
                  onApply={(row: any) => {
                    setToLgstGrpCd(row?.CODE ?? "");
                    setToLgstGrpNm(row?.NAME ?? "");
                    setPlanId("");
                    setPlanNm("");
                    closePopup();
                  }}
                  onClose={closePopup}
                />
              ),
            })
          }
        >
          {Lang.get("BTN_SEARCH")}
        </button>
      </div>
      <Field
        layout="vertical"
        type="combo"
        label={Lang.get("LBL_PLAN_ID")}
        value={planId}
        onChange={(v) => {
          setPlanId(v);
          const row = stores.planId?.find((item: any) => item.CODE === v);
          setPlanNm(row?.NAME ?? "");
        }}
        options={stores.planId ?? []}
      />
    </FormPopupLayout>
  );
}
