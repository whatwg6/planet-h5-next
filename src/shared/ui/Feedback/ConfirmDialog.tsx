import { useId } from "react";

import { Button } from "@/shared/ui/Form";

export function ConfirmDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-background-mask px-4 pb-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[448px] rounded-md bg-background-popup-components p-4 shadow-lift"
      >
        <p id={titleId} className="text-sm font-medium">
          {title}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            确认
          </Button>
        </div>
      </div>
    </div>
  );
}
