import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const SEVERITY_WEIGHTS = [0.1, 0.25, 0.4, 0.25];

const STATUSES = ["New", "In Progress", "Resolved", "False Positive"];
const STATUS_WEIGHTS = [0.45, 0.3, 0.15, 0.1];

const SOURCES = [
  "CrowdStrike",
  "Sentinel",
  "Splunk",
  "Defender",
  "Okta",
  "AWS GuardDuty",
  "Palo Alto",
  "Manual",
];

const ANALYSTS = [
  "Alice Chen",
  "Bob Martinez",
  "Carol Williams",
  "David Kim",
  "Eva Thompson",
  "Frank O'Brien",
  "Grace Patel",
  "Henry Liu",
];

const HOSTS = [
  "WIN-DC01",
  "WIN-FS02",
  "LIN-WEB03",
  "LIN-DB04",
  "MAC-DEV05",
  "WIN-HR06",
  "LIN-API07",
  "WIN-ENG08",
];

const TITLE_TEMPLATES = [
  "Suspicious PowerShell execution on {host}",
  "Multiple failed login attempts from {ip} on {host}",
  "Malware detected: Trojan.Generic on {host}",
  "Unusual outbound traffic to {ip} from {host}",
  "Privilege escalation attempt on {host}",
  "Ransomware behavior detected on {host}",
  "Suspicious registry modification on {host}",
  "Data exfiltration alert: large upload from {host}",
  "Brute force attack detected against {host}",
  "Command and control communication from {host}",
  "Suspicious scheduled task created on {host}",
  "Lateral movement detected from {host}",
  "Credential dumping activity on {host}",
  "Phishing email link clicked by user on {host}",
  "Unauthorized cloud API access from {host}",
];

function weightedPick(items, weights) {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function randomIp() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomDateWithinDays(days) {
  const now = Date.now();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now - offset).toISOString();
}

function generateAlert() {
  const host = HOSTS[Math.floor(Math.random() * HOSTS.length)];
  const ip = randomIp();
  const template =
    TITLE_TEMPLATES[Math.floor(Math.random() * TITLE_TEMPLATES.length)];
  const title = template.replace("{host}", host).replace("{ip}", ip);

  const assignee =
    Math.random() < 0.3
      ? null
      : ANALYSTS[Math.floor(Math.random() * ANALYSTS.length)];

  return {
    id: randomUUID(),
    title,
    severity: weightedPick(SEVERITIES, SEVERITY_WEIGHTS),
    status: weightedPick(STATUSES, STATUS_WEIGHTS),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    createdAt: randomDateWithinDays(7),
    assignee,
  };
}

const COUNT = 200;
const alerts = Array.from({ length: COUNT }, () => generateAlert());

const outputPath = join(__dirname, "..", "data", "alerts.json");
writeFileSync(outputPath, JSON.stringify(alerts, null, 2) + "\n");
console.log(`Generated ${COUNT} alerts → ${outputPath}`);
