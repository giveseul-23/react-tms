import { Move } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export type LayoutType = "side" | "vertical";

interface LayoutToggleButtonProps {
  layout: LayoutType;
  onToggle: () => void;
  /** 그리드가 1개뿐이면 false 전달 → 버튼 숨김. 기본값 true (표시) */
  visible?: boolean;
}

export function LayoutToggleButton({
  layout,
  onToggle,
  visible = true,
}: LayoutToggleButtonProps) {
  // 요구사항 4: 그리드가 1개인 경우 레이아웃 버튼 미표시
  if (!visible) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      onClick={onToggle}
      title={
        layout === "side" ? "수직 레이아웃으로 전환" : "수평 레이아웃으로 전환"
      }
      className="w-7 px-0"
    >
      <Move
        className={`w-3 h-3 transition-transform duration-300 ${
          layout === "side" ? "rotate-0" : "rotate-90"
        }`}
      />
    </Button>
  );
}
