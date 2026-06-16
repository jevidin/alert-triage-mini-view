import type { ReactNode } from "react";
import { formatDateTime } from "@/lib/format";
import type { Alert, AlertStatus } from "@/types/alert";
import { ALERT_STATUSES } from "@/types/alert";
import { SeverityBadge } from "./SeverityBadge";

type AlertDetailPanelProps = {
  alert: Alert | null;
  onStatusChange: (id: string, status: AlertStatus) => void;
};

export function AlertDetailPanel({
  alert,
  onStatusChange,
}: AlertDetailPanelProps) {
  if (!alert) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
        Select an alert to view details
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {alert.title}
        </h2>
        <p className="mt-1 font-mono text-xs text-zinc-500">{alert.id}</p>
      </div>

      <dl className="grid gap-4 px-4 py-4 text-sm">
        <DetailRow label="Severity">
          <SeverityBadge severity={alert.severity} />
        </DetailRow>

        <DetailRow label="Status">
          <select
            value={alert.status}
            onChange={(e) =>
              onStatusChange(alert.id, e.target.value as AlertStatus)
            }
            className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {ALERT_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </DetailRow>

        <DetailRow label="Source">{alert.source}</DetailRow>
        <DetailRow label="Created">
          {formatDateTime(alert.createdAt)}
        </DetailRow>
        <DetailRow label="Assignee">
          {alert.assignee ?? "Unassigned"}
        </DetailRow>
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-zinc-900 dark:text-zinc-100">{children}</dd>
    </div>
  );
}
