import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import FlowchartPage from "./pages/FlowchartPage";
import HistoryPage from "./pages/HistoryPage";
import DocsPage from "./pages/DocsPage";
import ReleaseReadinessPage from "./pages/ReleaseReadinessPage";
import StabilityDashboardPage from "./pages/StabilityDashboardPage";
import LiabilityReportPage from "./pages/LiabilityReportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/analyze" element={<AnalyzerPage />} />
            <Route path="/flowchart" element={<FlowchartPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/release-readiness" element={<ReleaseReadinessPage />} />
            <Route path="/stability" element={<StabilityDashboardPage />} />
            <Route path="/liability" element={<LiabilityReportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
