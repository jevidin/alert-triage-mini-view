import type { AlertFilters } from "@/lib/filterSortAlerts";
import {
  ALERT_SEVERITIES,
  ALERT_SOURCES,
  ALERT_STATUSES,
  type AlertSeverity,
  type AlertStatus,
} from "@/types/alert";

type AlertFiltersProps = {
  filters: AlertFilters;
  severityCounts: Record<AlertSeverity, number>;
  onChange: (filters: AlertFilters) => void;
  onClear: () => void;
  resultCount: number;
  totalCount: number;
};

export function AlertFilters({
  filters,
  severityCounts,
  onChange,
  onClear,
  resultCount,
  totalCount,
}: AlertFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.severities.length > 0 ||
    filters.statuses.length > 0 ||
    filters.source !== "";

  function toggleSeverity(severity: AlertSeverity) {
    const next = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];
    onChange({ ...filters, severities: next });
  }

  function toggleStatus(status: AlertStatus) {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next });
  }

  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Alert Triage
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {resultCount} of {totalCount} alerts
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search title, ID, assignee..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="min-w-[200px] flex-1 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />

        <select
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
          className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <option value="">All sources</option>
          {ALERT_SOURCES.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {ALERT_SEVERITIES.map((severity) => {
          const active = filters.severities.includes(severity);
          return (
            <button
              key={severity}
              type="button"
              onClick={() => toggleSeverity(severity)}
              className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {severity} ({severityCounts[severity]})
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {ALERT_STATUSES.map((status) => {
          const active = filters.statuses.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
}
