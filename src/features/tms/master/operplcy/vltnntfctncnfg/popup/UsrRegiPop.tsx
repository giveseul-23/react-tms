"use client";

// 사용자등록 팝업 (센차 UsrRegiPop)
// 좌측 사용자 목록 → 우측(수신자)으로 이동. 확인 시 우측 목록을 부모에 전달.

import { useEffect, useState } from "react";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { vltnNtfctnCnfgApi as api } from "../VltnNtfctnCnfgApi";
import { Lang } from "@/app/services/common/Lang";

type Usr = { USR_GRP_CD?: string; USR_ID: string; USR_NM?: string };

type Props = {
  configId: string;
  onConfirm: (rightRows: Usr[]) => void;
  onClose: () => void;
};

export default function UsrRegiPop({ configId, onConfirm, onClose }: Props) {
  const [left, setLeft] = useState<Usr[]>([]);
  const [right, setRight] = useState<Usr[]>([]);
  const [leftSel, setLeftSel] = useState<Set<string>>(new Set());
  const [rightSel, setRightSel] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .searchUsrRegiPop({ VLTN_NTFCTN_CNFG_ID: configId })
      .then((res: any) => {
        const data: Usr[] = res?.data?.data?.dsOut ?? res?.data?.result ?? [];
        setLeft(data);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toRight = () => {
    const move = left.filter((u) => leftSel.has(u.USR_ID));
    setRight((prev) => [...prev, ...move]);
    setLeft((prev) => prev.filter((u) => !leftSel.has(u.USR_ID)));
    setLeftSel(new Set());
  };

  const toLeft = () => {
    const move = right.filter((u) => rightSel.has(u.USR_ID));
    setLeft((prev) => [...prev, ...move]);
    setRight((prev) => prev.filter((u) => !rightSel.has(u.USR_ID)));
    setRightSel(new Set());
  };

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const renderList = (
    list: Usr[],
    sel: Set<string>,
    setter: (s: Set<string>) => void,
    title: string,
  ) => (
    <div className="flex-1 flex flex-col border rounded-md min-w-0">
      <div className="px-2 py-1 text-[11px] font-semibold bg-slate-50 border-b">
        {title} ({list.length})
      </div>
      <div className="overflow-auto" style={{ height: 360 }}>
        <table className="w-full text-[11px]">
          <thead className="bg-slate-50 sticky top-0">
            <tr className="text-left">
              <th className="w-7 p-1"></th>
              <th className="p-1">{Lang.get("LBL_USR_GRP_NM")}</th>
              <th className="p-1">{Lang.get("LBL_USER_ID")}</th>
              <th className="p-1">{Lang.get("LBL_USER_NAME")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.USR_ID} className="border-t hover:bg-accent/40">
                <td className="p-1 text-center">
                  <input
                    type="checkbox"
                    checked={sel.has(u.USR_ID)}
                    onChange={() => toggle(sel, setter, u.USR_ID)}
                  />
                </td>
                <td className="p-1">{u.USR_GRP_CD}</td>
                <td className="p-1">{u.USR_ID}</td>
                <td className="p-1">{u.USR_NM}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-stretch gap-2">
        {renderList(left, leftSel, setLeftSel, Lang.get("LBL_USER"))}
        <div className="flex flex-col justify-center gap-2">
          <Button variant="outline" size="xs" onClick={toRight} disabled={leftSel.size === 0}>
            <ChevronRight className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="xs" onClick={toLeft} disabled={rightSel.size === 0}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
        </div>
        {renderList(right, rightSel, setRightSel, Lang.get("LBL_NTFCTN_RCVR"))}
      </div>

      <div className="flex justify-end gap-1.5 pt-2.5 border-t">
        <Button variant="outline" size="xs" onClick={onClose}>
          <X className="w-3 h-3" />
          {Lang.get("BTN_CANCEL")}
        </Button>
        <Button
          variant="outline"
          size="xs"
          disabled={right.length === 0}
          onClick={() => onConfirm(right)}
          className="btn-primary btn-primary:hover"
        >
          <Check className="w-3 h-3" />
          {Lang.get("BTN_SAVE")}
        </Button>
      </div>
    </div>
  );
}
