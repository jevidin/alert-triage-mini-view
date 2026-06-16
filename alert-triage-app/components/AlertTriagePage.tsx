"use client";

import { useReducer, useState, useCallback, useEffect } from "react";
import type { Alert, AlertStatus } from "@/types/alert";
import {
  alertsReducer,
  createInitialState,
} from "@/lib/alertsReducer";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  filterAndSortAlerts,
  countBySeverity,
  toggleSortField,
  type AlertFilters,
  type SortField,
  type SortState,
} from "@/lib/filterSortAlerts";
import { AlertFilters as AlertFiltersBar } from "./AlertFilters";
import { AlertList } from "./AlertList";
import { AlertDetailPanel } from "./AlertDetailPanel";
import { BulkActionBar } from "./BulkActionBar";

type AlertTriagePageProps = {
  initialAlerts: Alert[];
};

export function AlertTriagePage({ initialAlerts }: AlertTriagePageProps) {
  const [state, dispatch] = useReducer(
    alertsReducer,
    initialAlerts,
    createInitialState,
  );
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const filteredAlerts = filterAndSortAlerts(state.alerts, filters, sort);
  const severityCounts = countBySeverity(state.alerts);
  const selectedAlert =
    state.alerts.find((a) => a.id === state.selectedId) ?? null;

  const handleSortChange = useCallback((field: SortField) => {
    setSort((current) => toggleSortField(current, field));
  }, []);

  const handleStatusChange = useCallback((id: string, status: AlertStatus) => {
    dispatch({ type: "UPDATE_STATUS", id, status });
  }, []);

  const handleBulkApply = useCallback(
    (status: AlertStatus) => {
      const ids = Array.from(state.selectedIds);
      if (ids.length === 0) return;
      dispatch({ type: "BULK_UPDATE_STATUS", ids, status });
      setBulkMessage(`Updated ${ids.length} alert${ids.length === 1 ? "" : "s"} to ${status}`);
    },
    [state.selectedIds],
  );

  const moveSelection = useCallback(
    (direction: 1 | -1) => {
      if (filteredAlerts.length === 0) return;
      const currentIndex = filteredAlerts.findIndex(
        (a) => a.id === state.selectedId,
      );
      const nextIndex =
        currentIndex === -1
          ? 0
          : Math.max(
              0,
              Math.min(filteredAlerts.length - 1, currentIndex + direction),
            );
      dispatch({ type: "SELECT", id: filteredAlerts[nextIndex].id });
    },
    [filteredAlerts, state.selectedId],
  );

  useEffect(() => {
    if (!bulkMessage) return;
    const timer = setTimeout(() => setBulkMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [bulkMessage]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        moveSelection(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        moveSelection(-1);
      } else if (e.key === " " && state.selectedId) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_ROW", id: state.selectedId });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveSelection, state.selectedId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AlertFiltersBar
        filters={filters}
        severityCounts={severityCounts}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
        resultCount={filteredAlerts.length}
        totalCount={state.alerts.length}
      />

      {bulkMessage && (
        <div className="border-b border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200">
          {bulkMessage}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-[55] flex-col border-r border-zinc-200 dark:border-zinc-800">
          {state.selectedIds.size > 0 && (
            <BulkActionBar
              selectedCount={state.selectedIds.size}
              onApply={handleBulkApply}
              onClear={() => dispatch({ type: "CLEAR_SELECTION" })}
            />
          )}
          <AlertList
            alerts={filteredAlerts}
            selectedId={state.selectedId}
            selectedIds={state.selectedIds}
            sort={sort}
            onSelect={(id) => dispatch({ type: "SELECT", id })}
            onToggleRow={(id) => dispatch({ type: "TOGGLE_ROW", id })}
            onSelectAll={(ids) => dispatch({ type: "SELECT_ALL", ids })}
            onClearSelection={() => dispatch({ type: "CLEAR_SELECTION" })}
            onSortChange={handleSortChange}
          />
        </div>

        <div className="flex min-w-0 flex-[45] flex-col bg-white dark:bg-zinc-950">
          <AlertDetailPanel
            alert={selectedAlert}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
