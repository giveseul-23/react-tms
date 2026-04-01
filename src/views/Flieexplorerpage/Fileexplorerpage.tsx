"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";

import TreeGrid from "@/app/components/grid/TreeGrid"; // 추가

ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type FileRow = {
  id: string;
  parentId: string | null;
  level: number;
  name: string;
  type: "folder" | "file";
  ext: string;
  size: string;
  modifiedAt: string;
  owner: string;
  permissions: string;
};

// ─── 가짜 데이터 ──────────────────────────────────────────────────────────────

const SOURCE: FileRow[] = [
  {
    id: "project",
    parentId: null,
    level: 0,
    name: "프로젝트",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-01",
    owner: "admin",
    permissions: "rwxr-xr-x",
  },
  {
    id: "src",
    parentId: "project",
    level: 1,
    name: "src",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-10",
    owner: "admin",
    permissions: "rwxr-xr-x",
  },
  {
    id: "app",
    parentId: "src",
    level: 2,
    name: "app",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-12",
    owner: "dev",
    permissions: "rwxr-xr-x",
  },
  {
    id: "page_tsx",
    parentId: "app",
    level: 3,
    name: "page.tsx",
    type: "file",
    ext: "tsx",
    size: "3.2 KB",
    modifiedAt: "2025-06-12",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "layout_tsx",
    parentId: "app",
    level: 3,
    name: "layout.tsx",
    type: "file",
    ext: "tsx",
    size: "1.1 KB",
    modifiedAt: "2025-06-11",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "components",
    parentId: "src",
    level: 2,
    name: "components",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-13",
    owner: "dev",
    permissions: "rwxr-xr-x",
  },
  {
    id: "button_tsx",
    parentId: "components",
    level: 3,
    name: "Button.tsx",
    type: "file",
    ext: "tsx",
    size: "890 B",
    modifiedAt: "2025-06-09",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "modal_tsx",
    parentId: "components",
    level: 3,
    name: "Modal.tsx",
    type: "file",
    ext: "tsx",
    size: "2.4 KB",
    modifiedAt: "2025-06-10",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "datagrid_tsx",
    parentId: "components",
    level: 3,
    name: "DataGrid.tsx",
    type: "file",
    ext: "tsx",
    size: "18.7 KB",
    modifiedAt: "2025-06-13",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "styles",
    parentId: "src",
    level: 2,
    name: "styles",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-05",
    owner: "dev",
    permissions: "rwxr-xr-x",
  },
  {
    id: "globals_css",
    parentId: "styles",
    level: 3,
    name: "globals.css",
    type: "file",
    ext: "css",
    size: "4.5 KB",
    modifiedAt: "2025-06-05",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "variables_css",
    parentId: "styles",
    level: 3,
    name: "variables.css",
    type: "file",
    ext: "css",
    size: "1.2 KB",
    modifiedAt: "2025-06-04",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "utils",
    parentId: "src",
    level: 2,
    name: "utils",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-08",
    owner: "dev",
    permissions: "rwxr-xr-x",
  },
  {
    id: "format_ts",
    parentId: "utils",
    level: 3,
    name: "format.ts",
    type: "file",
    ext: "ts",
    size: "760 B",
    modifiedAt: "2025-06-07",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "api_ts",
    parentId: "utils",
    level: 3,
    name: "api.ts",
    type: "file",
    ext: "ts",
    size: "2.1 KB",
    modifiedAt: "2025-06-08",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "public",
    parentId: "project",
    level: 1,
    name: "public",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-02",
    owner: "admin",
    permissions: "rwxr-xr-x",
  },
  {
    id: "favicon_ico",
    parentId: "public",
    level: 2,
    name: "favicon.ico",
    type: "file",
    ext: "ico",
    size: "15 KB",
    modifiedAt: "2025-06-01",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "logo_svg",
    parentId: "public",
    level: 2,
    name: "logo.svg",
    type: "file",
    ext: "svg",
    size: "3.8 KB",
    modifiedAt: "2025-06-02",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "images",
    parentId: "public",
    level: 2,
    name: "images",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-06-03",
    owner: "admin",
    permissions: "rwxr-xr-x",
  },
  {
    id: "hero_png",
    parentId: "images",
    level: 3,
    name: "hero.png",
    type: "file",
    ext: "png",
    size: "240 KB",
    modifiedAt: "2025-06-03",
    owner: "design",
    permissions: "rw-r--r--",
  },
  {
    id: "thumb_webp",
    parentId: "images",
    level: 3,
    name: "thumbnail.webp",
    type: "file",
    ext: "webp",
    size: "56 KB",
    modifiedAt: "2025-06-03",
    owner: "design",
    permissions: "rw-r--r--",
  },
  {
    id: "docs",
    parentId: "project",
    level: 1,
    name: "docs",
    type: "folder",
    ext: "",
    size: "—",
    modifiedAt: "2025-05-30",
    owner: "admin",
    permissions: "rwxr-xr-x",
  },
  {
    id: "readme_md",
    parentId: "docs",
    level: 2,
    name: "README.md",
    type: "file",
    ext: "md",
    size: "5.2 KB",
    modifiedAt: "2025-05-30",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "api_md",
    parentId: "docs",
    level: 2,
    name: "API.md",
    type: "file",
    ext: "md",
    size: "12.4 KB",
    modifiedAt: "2025-05-28",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "changelog_md",
    parentId: "docs",
    level: 2,
    name: "CHANGELOG.md",
    type: "file",
    ext: "md",
    size: "8.9 KB",
    modifiedAt: "2025-06-13",
    owner: "dev",
    permissions: "rw-r--r--",
  },
  {
    id: "package_json",
    parentId: "project",
    level: 1,
    name: "package.json",
    type: "file",
    ext: "json",
    size: "2.3 KB",
    modifiedAt: "2025-06-10",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "tsconfig_json",
    parentId: "project",
    level: 1,
    name: "tsconfig.json",
    type: "file",
    ext: "json",
    size: "680 B",
    modifiedAt: "2025-06-01",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "next_config",
    parentId: "project",
    level: 1,
    name: "next.config.ts",
    type: "file",
    ext: "ts",
    size: "420 B",
    modifiedAt: "2025-06-01",
    owner: "admin",
    permissions: "rw-r--r--",
  },
  {
    id: "env_local",
    parentId: "project",
    level: 1,
    name: ".env.local",
    type: "file",
    ext: "env",
    size: "310 B",
    modifiedAt: "2025-06-05",
    owner: "admin",
    permissions: "rw-------",
  },
];

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

const EXT_ICON: Record<string, string> = {
  tsx: "⚛️",
  ts: "🔷",
  js: "🟨",
  jsx: "⚛️",
  css: "🎨",
  scss: "🎨",
  json: "📋",
  md: "📝",
  png: "🖼️",
  jpg: "🖼️",
  webp: "🖼️",
  svg: "🖼️",
  ico: "🖼️",
  env: "🔒",
};
const fileIcon = (ext: string) => EXT_ICON[ext.toLowerCase()] ?? "📄";

function hasChildren(id: string) {
  return SOURCE.some((r) => r.parentId === id);
}

function getDescendantIds(id: string): string[] {
  const direct = SOURCE.filter((r) => r.parentId === id).map((r) => r.id);
  return direct.flatMap((cid) => [cid, ...getDescendantIds(cid)]);
}

function getVisibleRows(expandedIds: Set<string>): FileRow[] {
  const result: FileRow[] = [];
  function visit(parentId: string | null) {
    SOURCE.filter((r) => r.parentId === parentId).forEach((row) => {
      result.push(row);
      if (expandedIds.has(row.id)) visit(row.id);
    });
  }
  visit(null);
  return result;
}

// 부모 그룹에서 마지막 자식인지 여부 (연결선 처리용)
const IS_LAST: Record<string, boolean> = (() => {
  const map: Record<string, boolean> = {};
  const grouped: Record<string, string[]> = {};
  SOURCE.forEach((r) => {
    const k = r.parentId ?? "__root__";
    (grouped[k] = grouped[k] ?? []).push(r.id);
  });
  Object.values(grouped).forEach((siblings) => {
    siblings.forEach((id, i) => {
      map[id] = i === siblings.length - 1;
    });
  });
  return map;
})();

// ─── 이름 셀 렌더러 ───────────────────────────────────────────────────────────

function NameCell({
  row,
  isExpanded,
  onToggle,
}: {
  row: FileRow;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}) {
  const hc = hasChildren(row.id);
  const INDENT = 18;
  const LINE_COLOR = "#7e7e7e";

  return (
    <div
      className="flex items-center h-full"
      style={{ paddingLeft: row.level * INDENT }}
    >
      {/* 빨간 연결선 */}
      {row.level > 0 && (
        <div
          className="shrink-0"
          style={{ width: 16, position: "relative", height: "100%" }}
        >
          <div
            style={{
              position: "absolute",
              left: 7,
              top: IS_LAST[row.id] ? "-50%" : "-100%",
              bottom: IS_LAST[row.id] ? "50%" : "-100%",
              width: 1,
              background: LINE_COLOR,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 7,
              top: "50%",
              width: 9,
              height: 1,
              background: LINE_COLOR,
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* 펼치기/접기 버튼 */}
      {hc ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(row.id);
          }}
          className="shrink-0 flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-800"
          style={{ fontSize: 9 }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      ) : (
        <span className="shrink-0 w-4" />
      )}

      {/* 아이콘 + 이름 */}
      <span className="shrink-0 mr-1 text-[12px]">
        {row.type === "folder" ? (isExpanded ? "📂" : "📁") : fileIcon(row.ext)}
      </span>
      <span className="truncate" style={{ fontWeight: hc ? 600 : 400 }}>
        {row.name}
      </span>
    </div>
  );
}

// ─── 페이지 ───────────────────────────────────────────────────────────────────

export default function FileExplorerPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(
      SOURCE.filter((r) => r.level === 0 && hasChildren(r.id)).map((r) => r.id),
    ),
  );

  const toggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        getDescendantIds(id).forEach((cid) => next.delete(cid));
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(
      new Set(SOURCE.filter((r) => hasChildren(r.id)).map((r) => r.id)),
    );
  }, []);

  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  const visibleRows = useMemo(() => getVisibleRows(expandedIds), [expandedIds]);

  const columnDefs = useMemo<ColDef<FileRow>[]>(
    () => [
      {
        headerName: "이름",
        field: "name",
        minWidth: 260,
        flex: 2,
        sortable: false,
        filter: false,
        floatingFilter: false,
        cellRenderer: (params: any) => (
          <NameCell
            row={params.data}
            isExpanded={expandedIds.has(params.data.id)}
            onToggle={toggle}
          />
        ),
      },
      {
        headerName: "유형",
        field: "type",
        width: 70,
        cellRenderer: (p: any) => (p.value === "folder" ? "폴더" : "파일"),
      },
      {
        headerName: "확장자",
        field: "ext",
        width: 80,
        cellRenderer: (p: any) =>
          p.value ? (
            <span className="font-mono text-[10px] text-gray-500">
              .{p.value}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        headerName: "크기",
        field: "size",
        width: 90,
        cellStyle: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
      },
      { headerName: "수정일", field: "modifiedAt", width: 110 },
      { headerName: "소유자", field: "owner", width: 90 },
      {
        headerName: "권한",
        field: "permissions",
        width: 110,
        cellRenderer: (p: any) => (
          <span className="font-mono text-[10px] text-gray-500">{p.value}</span>
        ),
      },
    ],
    [expandedIds, toggle],
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4 gap-2">
      {/* 툴바 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">
          🗂️ 파일 탐색기
        </span>
        <span className="text-[11px] text-gray-400">
          ({SOURCE.length}개 항목)
        </span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={expandAll}
            className="px-2.5 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-[11px]"
          >
            모두펼치기
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-[11px]"
          >
            모두접기
          </button>
        </div>
      </div>

      {/* ✅ TreeGrid 사용 */}
      <div className="flex-1 min-h-0">
        <TreeGrid<FileRow>
          rowData={visibleRows}
          columnDefs={columnDefs}
          getRowId={(p) => p.data.id}
        />
      </div>
    </div>
  );
}
