export type MenuItem = {
  menuCode: string;
  label: string;
};

// 재귀 중첩 지원
export type MenuNode =
  | { type: "item"; menuCode: string; label: string }
  | {
      type: "group";
      code: string;
      label: string;
      icon?: any;
      children: MenuNode[];
    };

export type MenuSection = {
  sectionCode: string;
  title: string;
  icon: any;
  items: MenuItem[]; // 기존 호환 (label map 등에서 사용)
  nodes?: MenuNode[]; // 재귀 트리 (동적 메뉴에서 사용)
};
