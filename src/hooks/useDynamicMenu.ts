// src/hooks/useDynamicMenu.ts
import { useCallback, useEffect, useState } from "react";
import {
  Settings2,
  Truck,
  Map,
  BarChart3,
  Users,
  Database,
  FileText,
  Globe,
  Shield,
  List,
  Monitor,
  Package,
  Activity,
  Clipboard,
  Layers,
  Box,
} from "lucide-react";
import { menuApi } from "@/features/adm/menu/cnfg/menuApi";
import { getSessionFields } from "@/app/services/auth/auth";
import { Lang } from "@/app/services/common/Lang";
import type { MenuSection, MenuNode, MenuItem } from "@/app/config/menuConfig";

const ICON_MAP: Record<string, any> = {
  ADM: Settings2,
  TMS: Truck,
  CMS: Map,
  MBL: Monitor,
  PLAN: Clipboard,
  STAT: BarChart3,
  USER: Users,
  ENV: Database,
  LOG: FileText,
  LANG: Globe,
  ROLE: Shield,
  MENU: List,
  BATCH: Activity,
  APPL: Package,
  PARAM: Layers,
  DEFAULT: Box,
};

function getIcon(applCode: string) {
  if (ICON_MAP[applCode]) return ICON_MAP[applCode];
  for (const key of Object.keys(ICON_MAP)) {
    if (applCode.includes(key)) return ICON_MAP[key];
  }
  return ICON_MAP.DEFAULT;
}

// 서버 node → MenuNode 재귀 변환
// 메뉴조회(사이드바)에서는 USE_YN="Y" 인 메뉴/폴더만 노출 — 구성 화면(MenuConfig)은 미적용.
function toMenuNode(node: any): MenuNode | null {
  if (node.USE_YN !== "Y") return null;
  if (node.LEAFYN === "Y") {
    return {
      type: "item",
      menuCode: node.MENUCODE,
      label: node.MSG_DESC || node.MENUNAME || node.MENUCODE,
      menuName: node.MENUNAME || node.MENUCODE,
      url: node.URL,
    };
  }
  if (node.LEAFYN === "N") {
    const children: MenuNode[] = (node.data ?? [])
      .map(toMenuNode)
      .filter(Boolean) as MenuNode[];
    if (children.length === 0) return null;
    return {
      type: "group",
      code: node.MENUCODE,
      label: node.MSG_DESC || node.MENUNAME || node.MENUCODE,
      children,
    };
  }
  return null;
}

function collectItems(nodes: MenuNode[]): MenuItem[] {
  const result: MenuItem[] = [];
  nodes.forEach((n) => {
    if (n.type === "item")
      result.push({
        menuCode: n.menuCode,
        label: n.label,
        menuName: n.menuName,
        url: n.url,
      });
    else result.push(...collectItems(n.children));
  });
  return result;
}

function buildSections(serverData: any[]): MenuSection[] {
  const sections: MenuSection[] = [];
  serverData.forEach((rootNode) => {
    const applCode = rootNode.APPLCODE ?? "";
    const children: any[] = rootNode.data ?? [];
    const nodes: MenuNode[] = children
      .map(toMenuNode)
      .filter(Boolean) as MenuNode[];
    if (nodes.length === 0) return;

    // ── 요구사항: APPLCODE 앞에 "MENU_" 붙여서 Lang.get() 으로 타이틀 가져오기
    const langKey = `MENU_${applCode}`;
    const title =
      Lang.get(langKey) !== `${langKey}***`
        ? Lang.get(langKey)
        : rootNode.MSG_DESC || applCode;

    sections.push({
      sectionCode: applCode,
      title,
      icon: getIcon(applCode),
      items: collectItems(nodes),
      nodes,
    });
  });
  return sections;
}

// 모듈 캐시 — 사이드바/페이지가 메뉴 데이터를 공유해 재조회(추가 fetch)를 막는다.
// 초기 로드는 캐시 우선, refetch(사이드바 수동 새로고침)는 강제 재조회.
let cachedSections: MenuSection[] | null = null;
let inflight: Promise<MenuSection[]> | null = null;

function loadSections(force: boolean): Promise<MenuSection[]> {
  if (!force && cachedSections) return Promise.resolve(cachedSections);
  if (!force && inflight) return inflight;
  const { userId } = getSessionFields();
  const p = menuApi
    // 권한 필터된 사용자 메뉴(서버 selectUserModuleMenuByReact). 전체목록(searchByReact)+DYNAMIC_QUERY 대신.
    .getUserMenuByReact({ userId })
    .then((res: any) => {
      const data: any[] =
        res.data?.data?.allData?.data ??
        res.data?.result ??
        res.data?.data?.data ??
        [];
      const s = data.length ? buildSections(data) : [];
      cachedSections = s;
      return s;
    })
    .catch(() => cachedSections ?? [])
    .finally(() => {
      inflight = null;
    });
  inflight = p;
  return p;
}

export function useDynamicMenu() {
  const [sections, setSections] = useState<MenuSection[]>(
    cachedSections ?? [],
  );
  const [loading, setLoading] = useState(!cachedSections);

  const load = useCallback((force: boolean) => {
    if (!force && cachedSections) {
      setSections(cachedSections);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadSections(force)
      .then((s) => setSections(s))
      .finally(() => setLoading(false));
  }, []);

  // 사이드바 수동 새로고침용 — 캐시 무시하고 강제 재조회.
  const refetch = useCallback(() => load(true), [load]);

  useEffect(() => {
    load(false);
  }, [load]);

  const menuLabelMap: Record<string, string> = Object.fromEntries(
    sections.flatMap((s) => s.items.map((i) => [i.menuCode, i.label])),
  );

  const menuUrlMap: Record<string, string> = Object.fromEntries(
    sections.flatMap((s) =>
      s.items.filter((i) => !!i.url).map((i) => [i.menuCode, i.url as string]),
    ),
  );

  return {
    sections,
    menuLabelMap,
    menuUrlMap,
    loading,
    refetch,
  };
}
