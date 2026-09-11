import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { Status, ThemeProvider, ThemeToggle, type StatusEvidence } from "@/index"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import "@/styles.css"

const loadedAt = Date.now()
const examples: StatusEvidence[] = [
  { state: "live", source: "Fixture check", checkedAt: new Date(loadedAt).toISOString(), staleAfterMs: 60_000 },
  { state: "degraded", detail: "Fixture: semantic search failed; lexical search remains available." },
  { state: "offline", detail: "Fixture: source reports unavailable." },
  { state: "stale", source: "Fixture check", checkedAt: new Date(loadedAt - 300_000).toISOString() },
  { state: "blocked", detail: "Fixture: waiting for an owner decision." },
  { state: "empty", detail: "Fixture: no objects exist yet." },
  { state: "planned", detail: "Fixture: documented, not implemented." },
  { state: "unknown", detail: "Fixture: insufficient evidence." },
]

function Fixtures() {
  const [nestedDark, setNestedDark] = useState(false)
  return <ThemeProvider><TooltipProvider><main className="mx-auto flex max-w-5xl flex-col gap-8 p-6 sm:p-10">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2"><h1 className="text-2xl font-semibold">Design system</h1><p className="text-muted-foreground">Fixtures only. No service is connected or checked.</p></div><ThemeToggle />
    </header>
    <Card><CardHeader><CardTitle>Truthful status</CardTitle><CardDescription>Eight facts, each with its own label, icon and semantic pair.</CardDescription></CardHeader>
      <CardContent><ul className="flex flex-col gap-4">{examples.map((evidence) => <li key={evidence.state} data-example={evidence.state}><Status evidence={evidence} /></li>)}</ul></CardContent>
    </Card>
    <Card><CardHeader><CardTitle>Actions and overlays</CardTitle><CardDescription>Keyboard and focus behavior comes from Radix.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-3">
      <Button>Primary action</Button><Button variant="secondary">Secondary action</Button><Button variant="destructive">Destructive action</Button><Button disabled>Disabled action</Button><Badge variant="secondary">Fixture</Badge>
      <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Example dialog</DialogTitle><DialogDescription>This overlay contains fixture text only.</DialogDescription></DialogHeader><Input aria-label="Dialog input" /></DialogContent></Dialog>
      <Sheet><SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Example sheet</SheetTitle><SheetDescription>This sheet contains fixture text only.</SheetDescription></SheetHeader></SheetContent></Sheet>
      <Tooltip><TooltipTrigger asChild><Button variant="ghost">Explain fixture</Button></TooltipTrigger><TooltipContent>Nothing here makes a backend request.</TooltipContent></Tooltip>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Fields</CardTitle><CardDescription>Descriptions and errors stay associated with their inputs.</CardDescription></CardHeader><CardContent>
      <FieldGroup><Field><FieldLabel htmlFor="fixture-name">Display name</FieldLabel><Input id="fixture-name" aria-describedby="name-description" placeholder="Conker" /><FieldDescription id="name-description">An editable fixture, never saved.</FieldDescription></Field>
        <Field data-invalid><FieldLabel htmlFor="fixture-error">Required name</FieldLabel><Input id="fixture-error" aria-invalid aria-describedby="name-error" /><FieldError id="name-error">Enter a name.</FieldError></Field>
      </FieldGroup>
    </CardContent></Card>
    <Tabs defaultValue="table"><TabsList aria-label="Data examples"><TabsTrigger value="table">Table</TabsTrigger><TabsTrigger value="loading">Loading</TabsTrigger></TabsList>
      <TabsContent value="table"><Table><TableCaption>Fixture records, not service health.</TableCaption><TableHeader><TableRow><TableHead>Record</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Example collection</TableCell><TableCell><Status evidence={{ state: "empty" }} /></TableCell></TableRow></TableBody></Table></TabsContent>
      <TabsContent value="loading"><div role="status" aria-label="Loading fixture" className="flex flex-col gap-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-5 w-72" /><span className="sr-only">Loading fixture</span></div></TabsContent>
    </Tabs>
    <section aria-label="Nested theme test" className="flex flex-col gap-4"><h2 className="text-lg font-semibold">Nested theme fixture</h2>
      <Button variant="outline" onClick={() => setNestedDark(!nestedDark)}>Toggle nested theme</Button>
      <div data-testid="nested-theme" className={nestedDark ? "dark" : undefined}><div data-testid="nested-surface" className="rounded-lg border bg-card p-6 text-card-foreground"><Status evidence={examples[1]} /></div></div>
    </section>
    <section aria-label="Evidence validation" className="flex flex-col gap-3"><h2 className="text-lg font-semibold">Unverified fixture</h2>
      <Status evidence={{ state: "live", source: "Configuration only", checkedAt: "", staleAfterMs: 60_000 }} />
    </section>
  </main></TooltipProvider></ThemeProvider>
}

createRoot(document.getElementById("root")!).render(<StrictMode><Fixtures /></StrictMode>)
