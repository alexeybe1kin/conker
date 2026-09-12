import { createContext, useContext, useState, type ReactNode } from "react"
import { sessionFixtures, type Session } from "./fixtures/chat"

type Decision = "approved" | "denied" | "declined" | "accepted"
type PreviewState = {
  decisions: Record<string, Decision>; decide: (id: string, decision: Decision) => void;
  sessions: Session[]; addSession: (session: Session) => void;
  signedOut: boolean; signOut: () => void; signIn: () => void;
}
const Context = createContext<PreviewState | null>(null)
export function PreviewProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [sessions, setSessions] = useState(sessionFixtures)
  const [signedOut, setSignedOut] = useState(false)
  return <Context value={{ decisions, decide: (id, decision) => setDecisions(old => old[id] ? old : { ...old, [id]: decision }), sessions,
    addSession: session => setSessions(old => [session, ...old]), signedOut, signOut: () => setSignedOut(true), signIn: () => setSignedOut(false) }}>{children}</Context>
}
export function usePreview() { const state = useContext(Context); if (!state) throw new Error("PreviewProvider is missing"); return state }
