import type { ReactNode } from "react"
import { Link } from "react-router"
import { ArrowUpRight, Sprout } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Status } from "../ui"

export function Mark({ small = false }: { small?: boolean }) { return <span className={small ? "brand-mark small" : "brand-mark"}><Sprout aria-hidden="true" /></span> }
export function PageHeading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="subheading">{description}</p></div>{children && <div className="heading-actions">{children}</div>}</header>
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <Card className="restful"><CardHeader><Mark /><CardTitle><h2>{title}</h2></CardTitle><CardDescription>{children}</CardDescription></CardHeader><CardContent><Status evidence={{ state: "empty", detail: "Nothing needs your attention." }} /></CardContent></Card>
}
export function SourceLink({ to, children }: { to: string; children: ReactNode }) { return <Link className="source-link" to={to}>{children}<ArrowUpRight aria-hidden="true" /></Link> }
export function PlannedScreen({ name }: { name: string }) { return <div className="page"><PageHeading eyebrow="In the making" title={name} description="This part of the preview is being shaped." /><Status evidence={{ state: "planned", detail: "Fixture screen coming next." }} /></div> }
