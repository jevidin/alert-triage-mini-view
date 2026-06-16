import type { Alert, AlertSeverity, AlertStatus } from "@/types/alert";

export type SortField = "severity" | "status" | "source" | "createdAt";
export type SortDirection = "asc" | "desc";

export type AlertFilters = {
  search: string;
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  source: string;
};

export type SortState = {
  field: SortField;
  direction: SortDirection;
};

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const DEFAULT_FILTERS: AlertFilters = {
  search: "",
  severities: [],
  statuses: [],
  source: "",
};

export const DEFAULT_SORT: SortState = {
  field: "severity",
  direction: "asc",
};

export function filterAlerts(alerts: Alert[], filters: AlertFilters): Alert[] {
  const searchLower = filters.search.trim().toLowerCase();

  return alerts.filter((alert) => {
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(alert.severity)
    ) {
      return false;
    }
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(alert.status)
    ) {
      return false;
    }
    if (filters.source && alert.source !== filters.source) {
      return false;
    }
    if (searchLower) {
      const haystack = [
        alert.title,
        alert.id,
        alert.assignee ?? "",
        alert.source,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(searchLower)) {
        return false;
      }
    }
    return true;
  });
}

function compareSeverity(a: AlertSeverity, b: AlertSeverity): number {
  return SEVERITY_ORDER[a] - SEVERITY_ORDER[b];
}

export function sortAlerts(alerts: Alert[], sort: SortState): Alert[] {
  const sorted = [...alerts];
  const dir = sort.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sort.field) {
      case "severity":
        cmp = compareSeverity(a.severity, b.severity);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "source":
        cmp = a.source.localeCompare(b.source);
        break;
      case "createdAt":
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    if (cmp === 0 && sort.field !== "createdAt") {
      cmp =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return cmp * dir;
  });

  return sorted;
}

export function filterAndSortAlerts(
  alerts: Alert[],
  filters: AlertFilters,
  sort: SortState,
): Alert[] {
  return sortAlerts(filterAlerts(alerts, filters), sort);
}

export function countBySeverity(alerts: Alert[]): Record<AlertSeverity, number> {
  return alerts.reduce(
    (acc, alert) => {
      acc[alert.severity] += 1;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<
      AlertSeverity,
      number
    >,
  );
}

export function toggleSortField(
  current: SortState,
  field: SortField,
): SortState {
  if (current.field === field) {
    return {
      field,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return { field, direction: field === "createdAt" ? "desc" : "asc" };
}
