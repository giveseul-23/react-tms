// src/app/components/layout/presets/GridFormPage.tsx
//
// SearchFilters + 그리드 + 우측 폼 (Side panel).
// VehicleMgmt 용.
//
// 구조:
//   PageShell
//   └─ flex h-full overflow-hidden
//      ├─ DataGrid (flex-1)
//      └─ FormSidePanel (open 시)

"use client";

import { ReactNode } from "react";
import { PageShell } from "../PageShell";
import { SearchFilters } from "@/app/components/Search/SearchFilters";
import { LayoutToggleButton } from "../LayoutToggleButton";
import {
  FormSidePanel,
  type FormNavProps,
} from "../FormSheet";
import type { SearchProps } from "./types";

export interface GridFormPageProps {
  searchProps: SearchProps;
  /** 메인 그리드 */
  grid: ReactNode;
  /** 우측 폼 패널 — 열림 여부, 폼 본문, 헤더/푸터 등 */
  form: {
    open: boolean;
    width?: number;
    badgeLabel?: string;
    badgeClassName?: string;
    title?: ReactNode;
    headerActions?: ReactNode;
    onClose: () => void;
    nav?: FormNavProps;
    jumpInput?: string;
    onJumpInputChange?: (v: string) => void;
    onJumpInputBlur?: () => void;
    body: ReactNode;
    footer?: ReactNode;
  };
}

export function GridFormPage({ searchProps, grid, form }: GridFormPageProps) {
  return (
    <PageShell
      searchSlot={
        <SearchFilters
          {...searchProps}
          layoutToggle={
            <LayoutToggleButton
              layout="side"
              onToggle={() => {}}
              visible={false}
            />
          }
        />
      }
    >
      <div className="flex h-full min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {grid}
        </div>
        <FormSidePanel
          open={form.open}
          width={form.width}
          badgeLabel={form.badgeLabel}
          badgeClassName={form.badgeClassName}
          title={form.title}
          headerActions={form.headerActions}
          onClose={form.onClose}
          nav={form.nav}
          jumpInput={form.jumpInput}
          onJumpInputChange={form.onJumpInputChange}
          onJumpInputBlur={form.onJumpInputBlur}
          footer={form.footer}
        >
          {form.body}
        </FormSidePanel>
      </div>
    </PageShell>
  );
}
