import { useSyncExternalStore } from "react"
import {
  CircleCheck,
  TriangleAlert,
  Unplug,
  Clock,
  LockKeyhole,
  Inbox,
  CalendarClock,
  CircleHelp,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"

export const statusNames = [
  "live",
  "degraded",
  "offline",
  "stale",
  "blocked",
  "empty",
  "planned",
  "unknown",
] as const
export type StatusName = (typeof statusNames)[number]

/** A live assertion needs dated evidence and a freshness policy, never configuration. */
export type StatusEvidence =
  | { state: "live"; source: string; checkedAt: string; staleAfterMs: number; detail?: string }
  | { state: "stale"; source: string; checkedAt: string; detail?: string }
  | { state: "degraded" | "offline" | "blocked"; detail: string }
  | { state: "empty" | "planned" | "unknown"; detail?: string }

const presentation = {
  live: { label: "Live", icon: CircleCheck, style: "bg-status-live text-status-live-foreground" },
  degraded: {
    label: "Degraded",
    icon: TriangleAlert,
    style: "bg-status-degraded text-status-degraded-foreground",
  },
  offline: {
    label: "Offline",
    icon: Unplug,
    style: "bg-status-offline text-status-offline-foreground",
  },
  stale: { label: "Stale", icon: Clock, style: "bg-status-stale text-status-stale-foreground" },
  blocked: {
    label: "Blocked",
    icon: LockKeyhole,
    style: "bg-status-blocked text-status-blocked-foreground",
  },
  empty: {
    label: "Empty",
    icon: Inbox,
    style: "border-dashed bg-status-empty text-status-empty-foreground",
  },
  planned: {
    label: "Planned",
    icon: CalendarClock,
    style: "border-dashed bg-status-planned text-status-planned-foreground",
  },
  unknown: {
    label: "Unknown",
    icon: CircleHelp,
    style: "bg-status-unknown text-status-unknown-foreground",
  },
} satisfies Record<StatusName, { label: string; icon: typeof CircleCheck; style: string }>

const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
let clock = Date.now()
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    clock = Date.now()
    timer = setInterval(() => {
      clock = Date.now()
      listeners.forEach((notify) => notify())
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

export function resolveStatus(evidence: StatusEvidence, now: number): StatusEvidence {
  if (!evidence || !statusNames.includes(evidence.state))
    return { state: "unknown", detail: "Status was not understood." }
  if (evidence.state === "live" || evidence.state === "stale") {
    const checked = Date.parse(evidence.checkedAt)
    if (
      typeof evidence.source !== "string" ||
      !evidence.source.trim() ||
      !Number.isFinite(checked) ||
      checked > now
    ) {
      return { state: "unknown", detail: "Source or check time is missing or invalid." }
    }
    if (evidence.state === "live") {
      if (!Number.isFinite(evidence.staleAfterMs) || evidence.staleAfterMs <= 0) {
        return { state: "unknown", detail: "No valid freshness policy was supplied." }
      }
      if (now - checked >= evidence.staleAfterMs) return { ...evidence, state: "stale" }
    }
  }
  return evidence
}

function age(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/** Keep the reason and age visible; a tooltip alone is not a status contract. */
export function Status({ evidence, className }: { evidence: StatusEvidence; className?: string }) {
  const now = useSyncExternalStore(
    subscribe,
    () => clock,
    () => 0,
  )
  const resolved = resolveStatus(evidence, now)
  const { label, icon: Icon, style } = presentation[resolved.state]
  const dated = resolved.state === "live" || resolved.state === "stale" ? resolved : undefined
  return (
    <span
      data-slot="status"
      data-state={resolved.state}
      className={cn("inline-flex flex-wrap items-center gap-2 text-sm", className)}
    >
      <Badge variant="outline" className={style}>
        <Icon aria-hidden="true" />
        {label}
      </Badge>
      {dated && (
        <span className="text-muted-foreground">
          {dated.source} ·{" "}
          <time dateTime={dated.checkedAt} title={dated.checkedAt}>
            Checked {age(now - Date.parse(dated.checkedAt))}
          </time>
        </span>
      )}
      {resolved.detail && <span className="text-muted-foreground">{resolved.detail}</span>}
    </span>
  )
}
