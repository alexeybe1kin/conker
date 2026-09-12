import { createRoot } from "react-dom/client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { ThemeProvider, TooltipProvider } from "./ui"
import { PreviewProvider } from "./state"
import { Shell } from "./components/shell"
import { PlannedScreen } from "./components/common"
import { Chat } from "./pages/chat"
import "./styles.css"

createRoot(document.getElementById("root")!).render(<ThemeProvider><TooltipProvider><PreviewProvider><BrowserRouter><Routes>
  <Route element={<Shell />}><Route index element={<Navigate to="/chat/week" replace />} /><Route path="chat" element={<Navigate to="/chat/week" replace />} /><Route path="chat/:sessionId" element={<Chat />} />
    {["Inbox", "System", "Agents", "Tools", "Memory", "Journal", "Jobs"].map(name => <Route key={name} path={`${name.toLowerCase()}/*`} element={<PlannedScreen name={name} />} />)}
    <Route path="*" element={<PlannedScreen name="Page not found" />} />
  </Route><Route path="setup" element={<PlannedScreen name="First run" />} />
</Routes></BrowserRouter></PreviewProvider></TooltipProvider></ThemeProvider>)
