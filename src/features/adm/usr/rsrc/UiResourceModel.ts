"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useCommonStores } from "@/hooks/useCommonStores";
import type { TreeRow } from "@/app/components/grid/TreeGrid";

export type UiResourceRow = TreeRow & {
  RSRC_ID: string;
  PRNT_RSRC_ID: string;
  RSRC_DESC?: string;
  MSG_DESC?: string;
  RSRC_TP?: string;
  CRE_USR_ID?: string;
  CRE_DTTM?: string;
  LEAFYN?: "Y" | "N";
  EDIT_STS?: string;
  rowStatus?: string;
  delStatus?: boolean;
};

export function useUiResourceModel() {
  const [source, setSource] = useState<UiResourceRow[]>([]);
  const [selectedRow, setSelectedRowState] = useState<UiResourceRow | null>(
    null,
  );
  const selectedRowRef = useRef<UiResourceRow | null>(null);

  const setSelectedRow = useCallback((row: UiResourceRow | null) => {
    selectedRowRef.current = row;
    setSelectedRowState(row);
  }, []);

  const { codeMap } = useCommonStores({
    resourceType: { module: "TMS", sqlProp: "CODE", keyParam: "RSRC_TP" },
  });

  return {
    source,
    setSource,
    selectedRow,
    setSelectedRow,
    selectedRowRef,
    codeMap,
  };
}

export type UiResourceModel = ReturnType<typeof useUiResourceModel>;
