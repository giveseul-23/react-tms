import { Move } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export type LayoutType = "side" | "vertical";

interface LayoutToggleButtonProps {
  layout: LayoutType;
  onToggle: () => void;
}

export function LayoutToggleButton({
  layout,
  onToggle,
}: LayoutToggleButtonProps) {
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
