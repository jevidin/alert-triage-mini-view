import type { Alert, AlertSeverity, AlertStatus } from "@/types/alert";

export type AlertsState = {
  alerts: Alert[];
  selectedId: string | null;
  selectedIds: Set<string>;
};

export type AlertsAction =
  | { type: "SELECT"; id: string | null }
  | { type: "UPDATE_STATUS"; id: string; status: AlertStatus }
  | { type: "BULK_UPDATE_STATUS"; ids: string[]; status: AlertStatus }
  | { type: "TOGGLE_ROW"; id: string }
  | { type: "SELECT_ALL"; ids: string[] }
  | { type: "CLEAR_SELECTION" };

export function alertsReducer(
  state: AlertsState,
  action: AlertsAction,
): AlertsState {
  switch (action.type) {
    case "SELECT":
      return { ...state, selectedId: action.id };
    case "UPDATE_STATUS":
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.id
            ? { ...alert, status: action.status }
            : alert,
        ),
      };
    case "BULK_UPDATE_STATUS": {
      const idSet = new Set(action.ids);
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          idSet.has(alert.id)
            ? { ...alert, status: action.status }
            : alert,
        ),
        selectedIds: new Set(),
      };
    }
    case "TOGGLE_ROW": {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedIds: next };
    }
    case "SELECT_ALL":
      return { ...state, selectedIds: new Set(action.ids) };
    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set() };
    default:
      return state;
  }
}

export function createInitialState(alerts: Alert[]): AlertsState {
  return {
    alerts,
    selectedId: alerts[0]?.id ?? null,
    selectedIds: new Set(),
  };
}
