import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Overview from "@/pages/Overview";
import Planning from "@/pages/Planning";
import Kanban from "@/pages/Kanban";
import Materials from "@/pages/Materials";
import Draft from "@/pages/Draft";
import Review from "@/pages/Review";
import Analytics from "@/pages/Analytics";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <Overview />
            </AppLayout>
          }
        />
        <Route
          path="/overview"
          element={
            <AppLayout>
              <Overview />
            </AppLayout>
          }
        />
        <Route
          path="/planning"
          element={
            <AppLayout>
              <Planning />
            </AppLayout>
          }
        />
        <Route
          path="/kanban"
          element={
            <AppLayout>
              <Kanban />
            </AppLayout>
          }
        />
        <Route
          path="/materials"
          element={
            <AppLayout>
              <Materials />
            </AppLayout>
          }
        />
        <Route
          path="/draft"
          element={
            <AppLayout>
              <Draft />
            </AppLayout>
          }
        />
        <Route
          path="/review"
          element={
            <AppLayout>
              <Review />
            </AppLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <Analytics />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}
