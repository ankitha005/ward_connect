import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useComplaintsStore from "./store/complaintsStore";
import MainLayout from "./layouts/MainLayout/MainLayout";
import LoadingScreen from "./components/LoadingScreen";
import RouteProgressBar from "./components/RouteProgressBar";
import { prefetchRoute } from "./utils/routePrefetch";

// Lazy-loaded pages for fast instant navigation
const Home = lazy(() => import("./pages/Home/Home"));
const Complaints = lazy(() => import("./pages/Complaints/Complaints"));
const Announcements = lazy(() => import("./pages/Announcements/Announcements"));
const Schemes = lazy(() => import("./pages/Schemes/Schemes"));
const TrackComplaint = lazy(() => import("./pages/TrackComplaint/TrackComplaint"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/Dashboard/AdminDashboard"));
const SocialActivity = lazy(() => import("./pages/Gallery/SocialActivity"));
const WardDirectory = lazy(() => import("./pages/Directory/WardDirectory"));
const Gallery = lazy(() => import("./pages/Gallery/Gallery"));
const Volunteer = lazy(() => import("./pages/Volunteer/Volunteer"));
const Survey = lazy(() => import("./pages/Survey/Survey"));

// Lightweight skeleton fallback for smooth page transitions
const PageFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-24 animate-pulse">
    <div className="w-10 h-10 border-3 border-brand-orange border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs uppercase tracking-widest font-bold text-slate-400">
      Loading...
    </span>
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = useComplaintsStore((s) => s.fetchComplaints);
  const fetchAnnouncements = useComplaintsStore((s) => s.fetchAnnouncements);
  const fetchSurveys = useComplaintsStore((s) => s.fetchSurveys);
  const fetchVolunteers = useComplaintsStore((s) => s.fetchVolunteers);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchAnnouncements();
    fetchSurveys();
    fetchVolunteers();

    // Silently pre-warm high-traffic routes in the background during idle time
    const prewarmTimer = setTimeout(() => {
      prefetchRoute("complaints");
      prefetchRoute("schemes");
      prefetchRoute("directory");
      prefetchRoute("announcements");
    }, 1200);

    return () => clearTimeout(prewarmTimer);
  }, [fetchComplaints, fetchAnnouncements, fetchSurveys, fetchVolunteers]);

  return (
    <>
      <RouteProgressBar />

      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="projects" element={<Navigate to="/" replace />} />
              <Route path="track" element={<TrackComplaint />} />
              <Route path="activity" element={<SocialActivity />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="directory" element={<WardDirectory />} />
              <Route path="volunteer" element={<Volunteer />} />
              <Route path="survey" element={<Survey />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;

