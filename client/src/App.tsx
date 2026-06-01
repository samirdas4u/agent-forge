import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Scenarios from "./pages/Scenarios";
import SimulationSession from "./pages/SimulationSession";
import SessionResult from "./pages/SessionResult";
import Walkthroughs from "./pages/Walkthroughs";
import WalkthroughPlayer from "./pages/WalkthroughPlayer";
import Analytics from "./pages/Analytics";
import SessionReplay from "./pages/SessionReplay";
import Leaderboard from "./pages/Leaderboard";
import AdminScenarios from "./pages/AdminScenarios";
import InterviewPractice from "./pages/InterviewPractice";
import UserManagement from "./pages/UserManagement";
import InterviewSession from "./pages/InterviewSession";
import InterviewResult from "./pages/InterviewResult";
import AgenticDashboard from "./pages/AgenticDashboard";
import ReadinessPredictions from "./pages/ReadinessPredictions";
import WhyAgentForge from "./pages/WhyAgentForge";
import Architecture from "./pages/Architecture";
import CareerPrep from "./pages/CareerPrep";
import Coaching from "./pages/Coaching";
import AppLayout from "./components/AppLayout";
import SandboxHub from "./pages/sandbox/SandboxHub";
import FeatureFlags from "./pages/sandbox/FeatureFlags";
import AITester from "./pages/sandbox/AITester";
import TestRunner from "./pages/sandbox/TestRunner";
import PersonaLab from "./pages/sandbox/PersonaLab";
import EventLog from "./pages/sandbox/EventLog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* /simulate (no sessionId) → redirect to scenario selection */}
      <Route path="/simulate">
        <Scenarios />
      </Route>
      <Route path="/simulate/:sessionId">
        {(params) => <SimulationSession sessionId={Number(params.sessionId)} />}
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/scenarios">
        <Scenarios />
      </Route>
      <Route path="/session/:sessionId/result">
        {(params) => <SessionResult sessionId={Number(params.sessionId)} />}
      </Route>
      <Route path="/session/:sessionId/replay">
        {(params) => <AppLayout><SessionReplay sessionId={Number(params.sessionId)} /></AppLayout>}
      </Route>
      <Route path="/walkthroughs">
        <Walkthroughs />
      </Route>
      <Route path="/walkthroughs/:id">
        {(params) => <WalkthroughPlayer walkthroughId={Number(params.id)} />}
      </Route>
      <Route path="/analytics">
        <Analytics />
      </Route>
      <Route path="/leaderboard">
        <Leaderboard />
      </Route>
      <Route path="/admin/scenarios">
        <AdminScenarios />
      </Route>
      <Route path="/admin/users">
        <UserManagement />
      </Route>
      {/* Interview Practice routes */}
      <Route path="/interview">
        <InterviewPractice />
      </Route>
      <Route path="/career-prep">
        <CareerPrep />
      </Route>
      <Route path="/coaching">
        <Coaching />
      </Route>
      <Route path="/interview/session/:conversationId">
        {(params) => <InterviewSession />}
      </Route>
      <Route path="/interview/result">
        <InterviewResult />
      </Route>
      {/* Product Sandbox routes */}
      <Route path="/sandbox">
        <SandboxHub />
      </Route>
      <Route path="/sandbox/flags">
        <FeatureFlags />
      </Route>
      <Route path="/sandbox/ai-tester">
        <AITester />
      </Route>
      <Route path="/sandbox/test-runner">
        <TestRunner />
      </Route>
      <Route path="/sandbox/personas">
        <PersonaLab />
      </Route>
      <Route path="/sandbox/events">
        <EventLog />
      </Route>
      {/* Agentic & Reports routes */}
      <Route path="/agentic-dashboard">
        <AgenticDashboard />
      </Route>
      <Route path="/readiness">
        <ReadinessPredictions />
      </Route>
      <Route path="/why-agent-forge" component={WhyAgentForge} />
      <Route path="/architecture" component={Architecture} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
