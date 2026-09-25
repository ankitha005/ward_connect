import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useComplaintsStore from "./store/complaintsStore";
import MainLayout from "./layouts/MainLayout/MainLayout";
import Home from "./pages/Home/Home";
import Complaints from "./pages/Complaints/Complaints";
import Announcements from "./pages/Announcements/Announcements";
import Schemes from "./pages/Schemes/Schemes";
import Projects from "./pages/Projects";
import TrackComplaint from "./pages/TrackComplaint/TrackComplaint";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./admin/Dashboard/AdminDashboard";
import SocialActivity from "./pages/Gallery/SocialActivity";
import WardDirectory from "./pages/Directory/WardDirectory";
import Gallery from "./pages/Gallery/Gallery";
import Volunteer from "./pages/Volunteer/Volunteer";
import Survey from "./pages/Survey/Survey";
import LoadingScreen from "./components/LoadingScreen";

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
  }, [fetchComplaints, fetchAnnouncements, fetchSurveys, fetchVolunteers]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="projects" element={<Projects />} />
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
      )}
    </>
  );
}

export default App;
