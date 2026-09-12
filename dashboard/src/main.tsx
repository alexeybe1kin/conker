import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { ThemeProvider, TooltipProvider } from "./ui"
import { PreviewProvider } from "./state"
import { Shell } from "./components/shell"
import { PlannedScreen } from "./components/common"
import { Chat } from "./pages/chat"
import { InboxPage } from "./pages/inbox"
import { SystemPage } from "./pages/system"
import { AgentsPage } from "./pages/agents"
import { ToolsPage } from "./pages/tools"
import { MemoryPage } from "./pages/memory"
import "./styles.css"

createRoot(document.getElementById("root")!).render(<ThemeProvider><TooltipProvider><PreviewProvider><BrowserRouter><Routes>
  <Route element={<Shell />}><Route index element={<Navigate to="/chat/week" replace />} /><Route path="chat" element={<Navigate to="/chat/week" replace />} /><Route path="chat/:sessionId" element={<Chat />} />
    <Route path="inbox" element={<InboxPage />} /><Route path="inbox/:id" element={<InboxPage />} />
    <Route path="system" element={<SystemPage />} />
    <Route path="agents" element={<AgentsPage />} /><Route path="agents/:id" element={<AgentsPage />} />
    <Route path="tools" element={<ToolsPage />} /><Route path="tools/:id" element={<ToolsPage />} />
    <Route path="memory" element={<MemoryPage />} /><Route path="memory/:id" element={<MemoryPage />} />
    {["Journal", "Jobs"].map(name => <Route key={name} path={`${name.toLowerCase()}/*`} element={<PlannedScreen name={name} />} />)}
    <Route path="*" element={<PlannedScreen name="Page not found" />} />
  </Route><Route path="setup" element={<PlannedScreen name="First run" />} />
</Routes></BrowserRouter></PreviewProvider></TooltipProvider></ThemeProvider>)
