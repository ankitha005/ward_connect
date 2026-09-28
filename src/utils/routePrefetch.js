// Route prefetch registry for zero-delay instant page navigation

const routes = {
  home: () => import("../pages/Home/Home"),
  complaints: () => import("../pages/Complaints/Complaints"),
  announcements: () => import("../pages/Announcements/Announcements"),
  schemes: () => import("../pages/Schemes/Schemes"),
  track: () => import("../pages/TrackComplaint/TrackComplaint"),
  activity: () => import("../pages/Gallery/SocialActivity"),
  gallery: () => import("../pages/Gallery/Gallery"),
  directory: () => import("../pages/Directory/WardDirectory"),
  volunteer: () => import("../pages/Volunteer/Volunteer"),
  survey: () => import("../pages/Survey/Survey"),
  adminLogin: () => import("../pages/Admin/AdminLogin"),
  adminDashboard: () => import("../admin/Dashboard/AdminDashboard"),
};

const preloaded = new Set();

export const prefetchRoute = (routeKey) => {
  if (!routeKey || preloaded.has(routeKey)) return;
  const loadFn = routes[routeKey];
  if (typeof loadFn === "function") {
    preloaded.add(routeKey);
    // Prefetch in background during idle time
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        loadFn().catch(() => {
          preloaded.delete(routeKey);
        });
      });
    } else {
      setTimeout(() => {
        loadFn().catch(() => {
          preloaded.delete(routeKey);
        });
      }, 0);
    }
  }
};

// Map URL paths to route keys
export const pathToKey = {
  "/": "home",
  "/schemes": "schemes",
  "/complaints": "complaints",
  "/directory": "directory",
  "/announcements": "announcements",
  "/activity": "activity",
  "/gallery": "gallery",
  "/track": "track",
  "/volunteer": "volunteer",
  "/survey": "survey",
  "/admin/login": "adminLogin",
  "/admin/dashboard": "adminDashboard",
};

export const prefetchPath = (path) => {
  const key = pathToKey[path];
  if (key) {
    prefetchRoute(key);
  }
};

export default routes;
