import { useState } from "react";
import type { AlertStatus } from "@/types/alert";
import { ALERT_STATUSES } from "@/types/alert";

type BulkActionBarProps = {
  selectedCount: number;
  onApply: (status: AlertStatus) => void;
  onClear: () => void;
};

export function BulkActionBar({
  selectedCount,
  onApply,
  onClear,
}: BulkActionBarProps) {
  const [status, setStatus] = useState<AlertStatus>("Resolved");

  return (
    <div className="flex items-center gap-3 border-b border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900 dark:bg-blue-950/50">
      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
        {selectedCount} selected
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as AlertStatus)}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {ALERT_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onApply(status)}
        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
      >
        Apply status
      </button>
      <button
        type="button"
        onClick={onClear}
        className="text-sm text-blue-700 hover:text-blue-800 dark:text-blue-300"
      >
        Clear selection
      </button>
    </div>
  );
}
