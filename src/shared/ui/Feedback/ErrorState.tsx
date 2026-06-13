import { Button } from "@/shared/ui/Form";

export function ErrorState({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div className="space-y-3 rounded-md border border-line bg-white p-4 text-sm">
      <p className="text-danger">{title}</p>
      {onRetry ? <Button onClick={onRetry}>重试</Button> : null}
    </div>
  );
}
