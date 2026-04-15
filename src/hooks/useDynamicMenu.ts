// src/hooks/useDynamicMenu.ts
import { useEffect, useState } from "react";
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
import { menuApi } from "@/app/services/adm/menu/menuApi";
import { getSessionFields } from "@/app/services/auth/auth";
import { Lang } from "@/app/services/common/Lang";
import type { MenuSection, MenuNode } from "@/app/menu/menuConfig";

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
function toMenuNode(node: any): MenuNode | null {
  if (node.LEAFYN === "Y") {
    return {
      type: "item",
      menuCode: node.MENUCODE,
      label: node.MSG_DESC || node.MENUNAME || node.MENUCODE,
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

function collectItems(
  nodes: MenuNode[],
): { menuCode: string; label: string }[] {
  const result: { menuCode: string; label: string }[] = [];
  nodes.forEach((n) => {
    if (n.type === "item")
      result.push({ menuCode: n.menuCode, label: n.label });
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

export function useDynamicMenu() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { userId } = getSessionFields();
    menuApi
      .getMenuConfigList({ userId, DYNAMIC_QUERY: "1=1" })
      .then((res: any) => {
        const data: any[] =
          res.data?.data?.allData?.data ??
          res.data?.result ??
          res.data?.data?.data ??
          [];
        setSections(data.length ? buildSections(data) : []);
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const menuLabelMap: Record<string, string> = Object.fromEntries(
    sections.flatMap((s) => s.items.map((i) => [i.menuCode, i.label])),
  );

  return { sections, menuLabelMap, loading };
}
