import { AlertTriagePage } from "@/components/AlertTriagePage";
import alertsData from "@/data/alerts.json";
import type { Alert } from "@/types/alert";

const initialAlerts = alertsData as Alert[];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <AlertTriagePage initialAlerts={initialAlerts} />
    </div>
  );
}
