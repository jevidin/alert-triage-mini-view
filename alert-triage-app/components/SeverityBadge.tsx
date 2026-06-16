import type { AlertSeverity } from "@/types/alert";

const SEVERITY_STYLES: Record<
  AlertSeverity,
  { bg: string; text: string; border: string }
> = {
  Critical: {
    bg: "bg-severity-critical/15",
    text: "text-severity-critical",
    border: "border-severity-critical/30",
  },
  High: {
    bg: "bg-severity-high/15",
    text: "text-severity-high",
    border: "border-severity-high/30",
  },
  Medium: {
    bg: "bg-severity-medium/15",
    text: "text-severity-medium",
    border: "border-severity-medium/30",
  },
  Low: {
    bg: "bg-severity-low/15",
    text: "text-severity-low",
    border: "border-severity-low/30",
  },
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {severity}
    </span>
  );
}
