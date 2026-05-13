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
import Courses from "./pages/Courses";
import CourseCreate from "./pages/CourseCreate";
import CourseEditor from "./pages/CourseEditor";
import LearnCourse from "./pages/LearnCourse";
import AppLayout from "./components/AppLayout";

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
      <Route path="/courses">
        <Courses />
      </Route>
      <Route path="/courses/new">
        <CourseCreate />
      </Route>
      <Route path="/courses/:id/edit">
        {(params) => <CourseEditor />}
      </Route>
      <Route path="/learn/:slug">
        {(params) => <LearnCourse />}
      </Route>
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
