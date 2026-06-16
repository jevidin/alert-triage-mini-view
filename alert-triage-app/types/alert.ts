export type AlertSeverity = "Critical" | "High" | "Medium" | "Low";
export type AlertStatus = "New" | "In Progress" | "Resolved" | "False Positive";

export interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  createdAt: string;
  assignee: string | null;
}

export const ALERT_SEVERITIES: AlertSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

export const ALERT_STATUSES: AlertStatus[] = [
  "New",
  "In Progress",
  "Resolved",
  "False Positive",
];

export const ALERT_SOURCES = [
  "CrowdStrike",
  "Sentinel",
  "Splunk",
  "Defender",
  "Okta",
  "AWS GuardDuty",
  "Palo Alto",
  "Manual",
] as const;
