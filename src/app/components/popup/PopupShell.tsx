// app/components/popup/PopupShell.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Card } from "@/app/components/ui/card";
import { POPUP_WIDTH_CLASS, PopupWidth } from "./popup.types";

interface PopupShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  width?: PopupWidth;
}

export function PopupShell({
  open,
  onOpenChange,
  title,
  children,
  width = "xl",
}: PopupShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Overlay */}
      <DialogOverlay className="bg-black/50" />

      {/* Dialog */}
      <DialogContent
        className={`
    p-0
    w-full
    ${POPUP_WIDTH_CLASS[width]}
  `}
      >
        <Card className="shadow-xl">
          {title && (
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}

          <div className="p-6">{children}</div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
