import type { SortField, SortState } from "@/lib/filterSortAlerts";
import { formatRelativeTime, truncateId } from "@/lib/format";
import type { Alert } from "@/types/alert";
import { SeverityBadge } from "./SeverityBadge";

type AlertListProps = {
  alerts: Alert[];
  selectedId: string | null;
  selectedIds: Set<string>;
  sort: SortState;
  onSelect: (id: string) => void;
  onToggleRow: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onSortChange: (field: SortField) => void;
};

function SortIndicator({
  field,
  sort,
}: {
  field: SortField;
  sort: SortState;
}) {
  if (sort.field !== field) return null;
  return (
    <span className="ml-1 text-zinc-400">
      {sort.direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function AlertList({
  alerts,
  selectedId,
  selectedIds,
  sort,
  onSelect,
  onToggleRow,
  onSelectAll,
  onClearSelection,
  onSortChange,
}: AlertListProps) {
  const allVisibleSelected =
    alerts.length > 0 && alerts.every((a) => selectedIds.has(a.id));
  const someSelected = alerts.some((a) => selectedIds.has(a.id));

  function handleHeaderCheckbox() {
    if (allVisibleSelected) {
      onClearSelection();
    } else {
      onSelectAll(alerts.map((a) => a.id));
    }
  }

  function sortableHeader(field: SortField, label: string) {
    return (
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className="flex items-center font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {label}
        <SortIndicator field={field} sort={sort} />
      </button>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-zinc-500">
        No alerts match the current filters.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-100 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          <tr>
            <th className="w-8 px-2 py-2">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allVisibleSelected;
                }}
                onChange={handleHeaderCheckbox}
                aria-label="Select all visible alerts"
                className="rounded border-zinc-300"
              />
            </th>
            <th className="px-2 py-2">{sortableHeader("severity", "Severity")}</th>
            <th className="px-2 py-2">Title</th>
            <th className="px-2 py-2">{sortableHeader("status", "Status")}</th>
            <th className="px-2 py-2">{sortableHeader("source", "Source")}</th>
            <th className="px-2 py-2">{sortableHeader("createdAt", "Created")}</th>
            <th className="px-2 py-2">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => {
            const isSelected = selectedId === alert.id;
            const isChecked = selectedIds.has(alert.id);
            return (
              <tr
                key={alert.id}
                onClick={() => onSelect(alert.id)}
                className={`cursor-pointer border-b border-zinc-100 transition-colors dark:border-zinc-800/50 ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRow(alert.id)}
                    aria-label={`Select alert ${truncateId(alert.id)}`}
                    className="rounded border-zinc-300"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="max-w-[280px] truncate px-2 py-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {alert.title}
                </td>
                <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400">
                  {alert.status}
                </td>
                <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400">
                  {alert.source}
                </td>
                <td className="px-2 py-1.5 text-zinc-500 tabular-nums">
                  {formatRelativeTime(alert.createdAt)}
                </td>
                <td className="px-2 py-1.5 text-zinc-600 dark:text-zinc-400">
                  {alert.assignee ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
