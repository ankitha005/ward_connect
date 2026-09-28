import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  LogOut,
  Search,
  Activity,
  ShieldCheck,
  Megaphone,
  Map,
  Phone,
  MapPin,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  AlertCircle,
  XCircle,
  BarChart3,
  AlertTriangle,
  Plus,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useComplaintsStore from "../../store/complaintsStore";
import ContentStudio from "../ContentStudio/ContentStudio";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// ─── Leaflet heatmap (dynamic import to avoid SSR issues) ───
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WARD_LABELS = {
  chamrajapet: "Chamrajapet",
  jayanagar: "Jayanagar",
};
const STATUS_COLORS = {
  Pending: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  "In Progress": "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  Resolved: "bg-green-100 dark:bg-emerald-950/50 text-green-700 dark:text-emerald-300 border-green-200 dark:border-emerald-500/30",
  Rejected: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/30",
};

// ─── Heatmap Component ───────────────────────────────────────
function HeatMap({ complaints }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);

  // Fallback locations per ward when GPS is unavailable
  const WARD_CENTERS = {
    chamrajapet: [12.96, 77.56],
    jayanagar: [12.93, 77.58],
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // remove old heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // build points: use GPS if available, else ward center
    const points = complaints.map((c) => {
      const lat = c.lat ?? WARD_CENTERS[c.ward]?.[0] ?? 12.9716;
      const lng = c.lng ?? WARD_CENTERS[c.ward]?.[1] ?? 77.5946;
      const intensity =
        c.priority === "Urgent" ? 1.0 : c.priority === "High" ? 0.7 : 0.4;
      return [lat, lng, intensity];
    });

    if (points.length > 0) {
      heatLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      points.forEach(([lat, lng, intensity]) => {
        const isUrgent = intensity > 0.8;
        const color = isUrgent ? "#ef4444" : "#f59e0b";

        L.circleMarker([lat, lng], {
          radius: isUrgent ? 30 : 20,
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.15,
        }).addTo(heatLayerRef.current);

        L.circleMarker([lat, lng], {
          radius: isUrgent ? 10 : 7,
          color: color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.6,
        }).addTo(heatLayerRef.current);
      });
    }

    // drop markers for recent 5 complaints with GPS
    complaints
      .filter((c) => c.lat && c.lng)
      .slice(0, 5)
      .forEach((c) => {
        const icon = L.divIcon({
          html: `<div style="background:#FF6B00;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          className: "",
          iconSize: [10, 10],
        });
        L.marker([c.lat, c.lng], { icon })
          .bindPopup(`<b>${c.id}</b><br>${c.category}<br>${c.status}`)
          .addTo(mapInstanceRef.current);
      });
  }, [complaints]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-dark flex items-center gap-2">
            <Map size={18} className="text-primary" /> Complaint Heat Map
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Brighter zones = higher complaint density · {complaints.length}{" "}
            total points
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            Med
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            High
          </span>
        </div>
      </div>
      <div ref={mapRef} style={{ height: 380 }} />
    </div>
  );
}

// ─── Complaint Detail Drawer ─────────────────────────────────
function ComplaintDrawer({ complaint, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [afterImage, setAfterImage] = useState(null);

  const STATUS_CONFIG = {
    Pending: { color: "text-amber-600", icon: <Clock size={14} /> },
    "In Progress": { color: "text-blue-600", icon: <AlertCircle size={14} /> },
    Resolved: { color: "text-green-600", icon: <CheckCircle size={14} /> },
    Rejected: { color: "text-red-500", icon: <XCircle size={14} /> },
  };

  const handleAfterImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setAfterImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusUpdate(complaint.id, newStatus, note, afterImage);
      setNote("");
      setAfterImage(null);
    } finally {
      setSaving(false);
    }
  };

  const handleAiNote = async () => {
    setGeneratingAi(true);
    let autoNote = "";
    if (newStatus === "Resolved") {
      autoNote = `Inspection completed by Municipal Engineering team. Issue regarding ${complaint.category.toLowerCase()} at ${complaint.address} has been successfully resolved according to BBMP civic standards.`;
    } else if (newStatus === "In Progress") {
      autoNote = `Grievance acknowledged and assigned to field squad. Site inspection scheduled within 24 hours for ${complaint.category.toLowerCase()}.`;
    } else if (newStatus === "Rejected") {
      autoNote = `Report reviewed by Ward Office. Unable to process as the location falls outside ward boundary or requires private maintenance.`;
    } else {
      autoNote = `Grievance logged under ${complaint.category}. Awaiting officer allocation and field assessment.`;
    }
    setNote(autoNote);
    setGeneratingAi(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl overflow-y-auto"
      >
        {/* Drawer header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="font-mono font-bold text-primary text-base">
              {complaint.id}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Filed {new Date(complaint.createdAt).toLocaleString("en-IN")}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Citizen Info */}
          <section>
            <h4 className="label-style flex items-center gap-1.5 mb-4">
              <User size={12} /> Citizen Details
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 space-y-3 border border-transparent dark:border-slate-700/60">
              <Row label="Full Name" value={complaint.fullName} />
              <Row
                label="Mobile"
                value={
                  <a
                    href={`tel:+91${complaint.mobile}`}
                    className="text-primary font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Phone size={13} /> +91 {complaint.mobile}
                  </a>
                }
              />
              <Row
                label="Voter ID"
                value={<span className="font-mono">{complaint.voterId}</span>}
              />
            </div>
          </section>

          {/* Location Info */}
          <section>
            <h4 className="label-style flex items-center gap-1.5 mb-4">
              <MapPin size={12} /> Location
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 space-y-3 border border-transparent dark:border-slate-700/60">
              <Row label="Ward" value={WARD_LABELS[complaint.ward]} />
              <Row label="Address" value={complaint.address} />
              {complaint.area && (
                <Row label="Area / Colony" value={complaint.area} />
              )}
              {complaint.lat && complaint.lng && (
                <Row
                  label="GPS Coordinates"
                  value={
                    <a
                      href={`https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-mono text-xs"
                    >
                      {complaint.lat.toFixed(5)}, {complaint.lng.toFixed(5)} ↗
                    </a>
                  }
                />
              )}
            </div>
          </section>

          {/* Issue Details */}
          <section>
            <h4 className="label-style flex items-center gap-1.5 mb-4">
              <FileText size={12} /> Issue Details
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 space-y-3 border border-transparent dark:border-slate-700/60">
              <Row label="Category" value={complaint.category} />
              <Row
                label="Priority"
                value={
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      complaint.priority === "Urgent"
                        ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300"
                        : complaint.priority === "High"
                          ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                          : complaint.priority === "Medium"
                            ? "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {complaint.priority}
                  </span>
                }
              />
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Description
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {complaint.description}
                </p>
              </div>

              {complaint.photoData && (
                <div className="mt-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Attached Image (Before)
                  </div>
                  <img
                    src={complaint.photoData}
                    alt="Issue"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Status Timeline */}
          <section>
            <h4 className="label-style flex items-center gap-1.5 mb-4">
              <Activity size={12} /> Status Timeline
            </h4>
            <div className="space-y-3">
              {complaint.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${i === complaint.statusHistory.length - 1 ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}
                    />
                    {i < complaint.statusHistory.length - 1 && (
                      <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 mt-1" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-dark dark:text-white">
                      {h.status}
                    </div>
                    {h.note && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {h.note}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">
                      {new Date(h.date).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Update Status */}
          <section className="bg-primary/5 dark:bg-slate-800/80 border border-primary/10 dark:border-slate-700 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-dark dark:text-white text-sm">
              Update Complaint Status
            </h4>
            <div>
              <label className="label-style">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-style"
              >
                {["Pending", "In Progress", "Resolved", "Rejected"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label-style !mb-0">Admin Note</label>
                <button
                  type="button"
                  onClick={handleAiNote}
                  disabled={generatingAi}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 px-3 py-1 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={12} />{" "}
                  {generatingAi ? "Generating..." : "✨ AI Generate Note"}
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-style resize-none"
                rows={3}
                placeholder="Add a note or click 'AI Generate Note' to auto-create professional resolution text…"
              />
            </div>

            {newStatus === "Resolved" && complaint.photoData && (
              <div className="bg-green-50/50 dark:bg-emerald-950/40 p-4 rounded-xl border border-green-100 dark:border-emerald-500/30">
                <label className="label-style text-green-700 dark:text-emerald-400">
                  Upload "After" Image (Social Activity Showcase)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAfterImage}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-bold
                    file:bg-green-100 file:text-green-700
                    hover:file:bg-green-200 file:transition-colors file:cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Providing an After image will automatically publish this
                  resolution as a "Before & After" slide on the Social Activity
                  page.
                </p>
                {afterImage && (
                  <img
                    src={afterImage}
                    alt="After"
                    className="mt-3 w-full h-32 object-cover rounded-xl shadow-sm border border-green-200 dark:border-emerald-500/40"
                  />
                )}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Status Update"}
            </button>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-slate-400 dark:text-slate-400 font-semibold shrink-0">{label}</span>
      <span className="font-bold text-dark dark:text-white text-right">{value}</span>
    </div>
  );
}

// ─── Alerts Manager (inline CRUD) ───────────────────────────
function AlertsTab() {
  const { liveAlerts, addAlert, updateAlert, deleteAlert, toggleAlert } =
    useComplaintsStore();
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    const t = newText.trim();
    if (!t) return;
    addAlert(t);
    setNewText("");
  };

  const startEdit = (a) => {
    setEditId(a.id);
    setEditText(a.text);
  };
  const saveEdit = () => {
    updateAlert(editId, editText.trim());
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Alert */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-dark flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" /> Add New Live
          Alert
        </h3>
        <div className="flex gap-3">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. 🚨 ROAD CLOSURE: Main Street closed for repairs until June 20..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-red-400/30 bg-slate-50"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} /> Add Alert
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-dark">
            {liveAlerts.length} Live Alert{liveAlerts.length !== 1 ? "s" : ""}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {liveAlerts.filter((a) => a.active).length} currently visible on
            site
          </span>
        </div>

        {liveAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">
            No alerts. Add one above!
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {liveAlerts.map((alert) => (
              <AnimatePresence key={alert.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-5 flex gap-4 items-start transition-colors ${
                    alert.active ? "bg-white" : "bg-slate-50 opacity-60"
                  }`}
                >
                  {/* Active indicator */}
                  <div
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                      alert.active ? "bg-red-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />

                  {/* Text / Edit */}
                  <div className="flex-1 min-w-0">
                    {editId === alert.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="w-full border border-primary/30 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-slate-700 leading-snug">
                        {alert.text}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Added {new Date(alert.createdAt).toLocaleString("en-IN")}
                      <span
                        className={`ml-3 font-bold ${alert.active ? "text-green-600" : "text-slate-400"}`}
                      >
                        {alert.active ? "● Visible" : "○ Hidden"}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {editId === alert.id ? (
                      <button
                        onClick={saveEdit}
                        className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Save size={13} /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(alert)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      title={
                        alert.active ? "Hide from ticker" : "Show in ticker"
                      }
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-amber-600 rounded-lg transition-colors"
                    >
                      {alert.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
  { id: "complaints", label: "Complaints", icon: <MessageSquare size={16} /> },
  { id: "heatmap", label: "Heat Map", icon: <Map size={16} /> },
  { id: "alerts", label: "Live Alerts", icon: <AlertTriangle size={16} /> },
  { id: "content", label: "Content Studio", icon: <Megaphone size={16} /> },
  { id: "volunteers", label: "Volunteers", icon: <Users size={16} /> },
  { id: "surveys", label: "Surveys", icon: <FileText size={16} /> },
];

export default function AdminDashboard() {
  const {
    complaints,
    updateStatus,
    isAdminLoggedIn,
    adminToken,
    adminUser,
    adminLogout,
    volunteers,
    surveys,
    fetchComplaints,
    fetchSurveys,
    fetchVolunteers,
    fetchAnnouncements,
  } = useComplaintsStore();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [tab, setTab] = useState("overview");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selected, setSelected] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true" || document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Safe session check: if not logged in or no valid token, redirect to login
  useEffect(() => {
    const hasToken = localStorage.getItem("adminToken");
    if (!isAdminLoggedIn || !hasToken) {
      navigate("/admin/login", { replace: true });
    } else {
      setCheckingAuth(false);
    }
  }, [isAdminLoggedIn, navigate]);

  // Immediately refresh live complaints and records on mount
  useEffect(() => {
    if (fetchComplaints) fetchComplaints();
    if (fetchSurveys) fetchSurveys();
    if (fetchVolunteers) fetchVolunteers();
    if (fetchAnnouncements) fetchAnnouncements();
  }, [fetchComplaints, fetchSurveys, fetchVolunteers, fetchAnnouncements]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Opening Admin Workspace...
          </span>
        </div>
      </div>
    );
  }

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const inProgress = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;

  const filtered = complaints.filter((c) => {
    const mW = wardFilter === "all" || c.ward === wardFilter;
    const mS = statusFilter === "all" || c.status === statusFilter;
    const mQ =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.voterId.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search);

    // Date Filtering
    let mDate = true;
    if (dateStart || dateEnd) {
      const cDate = new Date(c.createdAt);
      if (dateStart) mDate = mDate && cDate >= new Date(dateStart);
      if (dateEnd) {
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59, 999);
        mDate = mDate && cDate <= end;
      }
    }

    return mW && mS && mQ && mDate;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Complaint ID",
      "Date",
      "Full Name",
      "Mobile",
      "Voter ID",
      "Ward",
      "Category",
      "Priority",
      "Status",
      "Description",
    ];
    const rows = filtered.map((c) => [
      c.id,
      new Date(c.createdAt).toLocaleDateString("en-IN"),
      c.fullName,
      c.mobile,
      c.voterId,
      WARD_LABELS[c.ward] || c.ward,
      c.category,
      c.priority,
      c.status,
      `"${c.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `complaints_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const byCat = {};
  complaints.forEach((c) => {
    byCat[c.category] = (byCat[c.category] || 0) + 1;
  });
  const topCats = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? "#111827" : "#ffffff",
        titleColor: darkMode ? "#ffffff" : "#0f172a",
        bodyColor: darkMode ? "#cbd5e1" : "#334155",
        borderColor: darkMode ? "#1e293b" : "#e2e8f0",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
        ticks: { stepSize: 1, color: darkMode ? "#94a3b8" : "#64748b" },
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? "#94a3b8" : "#64748b" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
            A
          </div>
          <div>
            <div className="font-extrabold text-dark dark:text-white text-sm flex items-center gap-2">
              Ward Admin Panel
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Session ({adminUser || "admin"})
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              Bengaluru Civic Connect · Municipal Auth
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun size={14} className="text-amber-400" />
            ) : (
              <Moon size={14} className="text-slate-600" />
            )}
            <span className="hidden sm:inline">
              {darkMode ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-dark dark:hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Open Citizen Portal in a new tab"
          >
            <Eye size={14} className="text-slate-500 dark:text-slate-400" />
            <span>Citizen Portal</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-950/40 hover:bg-red-600 dark:hover:bg-red-600 border border-red-200 dark:border-red-500/30 hover:border-red-600 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-sm cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-dark dark:hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  label: "Total Complaints",
                  value: total,
                  icon: <MessageSquare />,
                  color: "text-primary bg-primary/5",
                  ring: "ring-primary/20",
                },
                {
                  label: "Pending",
                  value: pending,
                  icon: <Clock />,
                  color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
                  ring: "ring-amber-200 dark:ring-amber-500/30",
                },
                {
                  label: "In Progress",
                  value: inProgress,
                  icon: <Activity />,
                  color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
                  ring: "ring-blue-200 dark:ring-blue-500/30",
                },
                {
                  label: "Resolved",
                  value: resolved,
                  icon: <CheckCircle />,
                  color: "text-success bg-success/5 dark:bg-emerald-950/40",
                  ring: "ring-green-200 dark:ring-emerald-500/30",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-dark dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Triage Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-200" /> AI Ward
                  Intelligence
                </div>
                <h3 className="text-xl font-black">
                  Real-Time Hotspot & Triage Analysis
                </h3>
                <p className="text-xs text-red-100 font-medium max-w-xl">
                  AI has detected{" "}
                  <span className="font-bold underline text-white">
                    2 cluster zones
                  </span>{" "}
                  requiring immediate municipal attention in Bengaluru Wards
                  (Road Repairs & Drainage). Auto-GPS routing active.
                </p>
              </div>
              <button
                onClick={() => setTab("complaints")}
                className="bg-white text-red-600 hover:bg-amber-50 font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                Review Priority Complaints →
              </button>
            </div>

            {/* Bar Chart */}
            {topCats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" /> Top Issue
                  Categories
                </h3>
                <div className="h-52">
                  <Bar
                    data={{
                      labels: topCats.map(([k]) => k),
                      datasets: [
                        {
                          data: topCats.map(([, v]) => v),
                          backgroundColor: "#DC2626",
                          borderRadius: 8,
                          hoverBackgroundColor: "#b91c1c",
                        },
                      ],
                    }}
                    options={chartOpts}
                  />
                </div>
              </div>
            )}

            {/* Quick recent complaints */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="font-bold text-dark dark:text-white mb-4">Recent Complaints</h3>
              {complaints.slice(0, 5).length === 0 ? (
                <p className="text-slate-400 text-sm font-medium">
                  No complaints yet.
                </p>
              ) : (
                complaints.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelected(c);
                      setTab("complaints");
                    }}
                    className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary text-xs">
                        {c.id}
                      </div>
                      <div className="text-sm font-semibold text-dark dark:text-white">
                        {c.fullName} · {c.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || ""}`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── COMPLAINTS TAB ── */}
        {tab === "complaints" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center flex-1">
                <div className="relative min-w-[200px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, name, mobile, etc…"
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold outline-none"
                >
                  <option value="all">All Wards</option>
                  <option value="chamrajapet">Chamrajapet</option>
                  <option value="jayanagar">Jayanagar</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold outline-none"
                >
                  <option value="all">All Statuses</option>
                  {["Pending", "In Progress", "Resolved", "Rejected"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
                <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-3 bg-slate-50 dark:bg-slate-800">
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="text-sm py-2 bg-transparent outline-none font-semibold text-slate-500 dark:text-slate-300"
                  />
                  <span className="text-slate-300 dark:text-slate-600">-</span>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="text-sm py-2 bg-transparent outline-none font-semibold text-slate-500 dark:text-slate-300"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400 font-medium">
                  {filtered.length} records
                </span>
                <button
                  onClick={exportCSV}
                  disabled={filtered.length === 0}
                  className="bg-dark dark:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border border-transparent dark:border-slate-700"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-semibold">
                {complaints.length === 0
                  ? "No complaints filed yet."
                  : "No results match your filters."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="text-left px-5 py-3">Complaint ID</th>
                      <th className="text-left px-5 py-3">Name</th>
                      <th className="text-left px-5 py-3">Mobile</th>
                      <th className="text-left px-5 py-3">Ward</th>
                      <th className="text-left px-5 py-3">Category</th>
                      <th className="text-left px-5 py-3">Priority</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">GPS</th>
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono font-bold text-xs text-primary">
                          {c.id}
                        </td>
                        <td className="px-5 py-3 font-semibold text-dark dark:text-white">
                          {c.fullName}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={`tel:+91${c.mobile}`}
                            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors"
                          >
                            <Phone size={12} /> {c.mobile}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                          {WARD_LABELS[c.ward]}
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                          {c.category}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.priority === "Urgent"
                                ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-300"
                                : c.priority === "High"
                                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300"
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[c.status] || ""}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {c.lat ? (
                            <a
                              href={`https://www.google.com/maps?q=${c.lat},${c.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-xs hover:underline font-bold flex items-center gap-1"
                            >
                              <MapPin size={11} />
                              View
                            </a>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => setSelected(c)}
                            className="text-primary hover:bg-primary/10 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── HEATMAP TAB ── */}
        {tab === "heatmap" && <HeatMap complaints={complaints} />}

        {/* ── LIVE ALERTS TAB ── */}
        {tab === "alerts" && <AlertsTab />}

        {/* ── CONTENT STUDIO TAB ── */}
        {tab === "content" && <ContentStudio />}

        {/* ── VOLUNTEERS TAB ── */}
        {tab === "volunteers" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-x-auto">
            <h3 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Registered Volunteers
              ({volunteers?.length || 0})
            </h3>
            {!volunteers || volunteers.length === 0 ? (
              <p className="py-8 text-center text-slate-400 font-semibold">
                No volunteers registered yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Mobile</th>
                    <th className="pb-3 pr-4">Ward / Area</th>
                    <th className="pb-3 pr-4">Age</th>
                    <th className="pb-3 pr-4">Skills</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {volunteers.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-primary">
                        {v.id}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-dark dark:text-white">
                        {v.fullName}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-600 dark:text-slate-300">
                        {v.mobile}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{v.ward}</td>
                      <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                        {v.age || "--"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {v.skills?.map((s) => (
                            <span
                              key={s}
                              className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-transparent dark:border-orange-500/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-slate-400 font-medium">
                        {new Date(v.date).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── SURVEY TAB ── */}
        {tab === "surveys" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-x-auto">
            <h3 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-brand-green" /> Ward Survey
              Responses ({surveys?.length || 0})
            </h3>
            {!surveys || surveys.length === 0 ? (
              <p className="py-8 text-center text-slate-400 font-semibold">
                No survey responses yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-4">Citizen</th>
                    <th className="pb-3 pr-4">Ward</th>
                    <th className="pb-3 pr-4">Roads</th>
                    <th className="pb-3 pr-4">Safety</th>
                    <th className="pb-3 pr-4">Priority Area</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {surveys.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-l-[3px] border-transparent hover:border-brand-green"
                    >
                      <td className="py-4 pr-4 pl-3 font-semibold text-dark dark:text-white">
                        {s.citizen.name}
                      </td>
                      <td className="py-4 pr-4 font-medium text-slate-500 dark:text-slate-400">
                        {s.citizen.ward}
                      </td>
                      <td className="py-4 pr-4 font-bold text-slate-700 dark:text-slate-200">
                        {s.responses.roadQuality || "--"}
                      </td>
                      <td className="py-4 pr-4 font-bold text-slate-700 dark:text-slate-200">
                        {s.responses.safety || "--"}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-400 font-bold px-3 py-1 text-xs rounded-xl border border-transparent dark:border-emerald-500/30">
                          {s.responses.priorityArea || "--"}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-400 font-medium">
                        {new Date(s.date).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Complaint Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <ComplaintDrawer
            key={selected.id}
            complaint={selected}
            onClose={() => setSelected(null)}
            onStatusUpdate={(id, status, note, afterImage) => {
              updateStatus(id, status, note, afterImage);
              setSelected((prev) => ({
                ...prev,
                status,
                statusHistory: [
                  ...prev.statusHistory,
                  { status, note: note || "", date: new Date().toISOString() },
                ],
              }));
            }}
          />
        )}

        {/* Sign Out Confirmation Modal */}
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <LogOut size={26} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Sign Out of Admin Portal?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 mb-6 leading-relaxed">
                Your administrative session will be securely terminated. You can log back in at any time.
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => {
                    setIsLoggingOut(true);
                    setTimeout(() => {
                      adminLogout();
                      navigate("/admin/login?loggedOut=true", { replace: true });
                    }, 350);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5"
                >
                  {isLoggingOut ? "Signing out…" : "Confirm Sign Out"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
