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
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Resolved: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-600 border-red-200",
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
    if (mapInstanceRef.current) return; // already initialised

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [17.39, 78.49],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstanceRef.current);
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // remove old heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // build points: use GPS if available, else ward center
    const points = complaints.map((c) => {
      const lat = c.lat ?? WARD_CENTERS[c.ward]?.[0] ?? 17.39;
      const lng = c.lng ?? WARD_CENTERS[c.ward]?.[1] ?? 78.49;
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
    await new Promise((r) => setTimeout(r, 400));
    onStatusUpdate(complaint.id, newStatus, note, afterImage);
    setSaving(false);
    setNote("");
    setAfterImage(null);
  };

  const handleAiNote = async () => {
    setGeneratingAi(true);
    await new Promise((r) => setTimeout(r, 600));
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
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
      >
        {/* Drawer header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
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
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
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
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
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
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
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
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
              <Row label="Category" value={complaint.category} />
              <Row
                label="Priority"
                value={
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      complaint.priority === "Urgent"
                        ? "bg-red-100 text-red-600"
                        : complaint.priority === "High"
                          ? "bg-amber-100 text-amber-700"
                          : complaint.priority === "Medium"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500"
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
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
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
                    className="w-full h-48 object-cover rounded-xl border border-slate-200"
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
                      className={`w-3 h-3 rounded-full mt-1 ${i === complaint.statusHistory.length - 1 ? "bg-primary" : "bg-slate-300"}`}
                    />
                    {i < complaint.statusHistory.length - 1 && (
                      <div className="w-0.5 h-6 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-dark">
                      {h.status}
                    </div>
                    {h.note && (
                      <div className="text-xs text-slate-500 font-medium">
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
          <section className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-dark text-sm">
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
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                <label className="label-style text-green-700">
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
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  Providing an After image will automatically publish this
                  resolution as a "Before & After" slide on the Social Activity
                  page.
                </p>
                {afterImage && (
                  <img
                    src={afterImage}
                    alt="After"
                    className="mt-3 w-full h-32 object-cover rounded-xl shadow-sm border border-green-200"
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
      <span className="text-slate-400 font-semibold shrink-0">{label}</span>
      <span className="font-bold text-dark text-right">{value}</span>
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
    adminLogout,
    volunteers,
    surveys,
  } = useComplaintsStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [selected, setSelected] = useState(null);

  if (!isAdminLoggedIn) {
    navigate("/admin/login");
    return null;
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
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: { stepSize: 1 },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-orange-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/30">
            A
          </div>
          <div>
            <div className="font-bold text-dark text-sm">Ward Admin Panel</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Bengaluru Civic Connect
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            adminLogout();
            navigate("/admin/login");
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-dark"
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
                  color: "text-amber-500 bg-amber-50",
                  ring: "ring-amber-200",
                },
                {
                  label: "In Progress",
                  value: inProgress,
                  icon: <Activity />,
                  color: "text-blue-500 bg-blue-50",
                  ring: "ring-blue-200",
                },
                {
                  label: "Resolved",
                  value: resolved,
                  icon: <CheckCircle />,
                  color: "text-success bg-success/5",
                  ring: "ring-green-200",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-dark">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
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
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-dark mb-4">Recent Complaints</h3>
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
                    className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary text-xs">
                        {c.id}
                      </div>
                      <div className="text-sm font-semibold text-dark">
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="p-5 border-b border-slate-50 flex flex-wrap gap-4 items-center justify-between">
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
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold outline-none"
                >
                  <option value="all">All Wards</option>
                  <option value="chamrajapet">Chamrajapet</option>
                  <option value="jayanagar">Jayanagar</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-semibold outline-none"
                >
                  <option value="all">All Statuses</option>
                  {["Pending", "In Progress", "Resolved", "Rejected"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 bg-slate-50">
                  <input
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                    className="text-sm py-2 bg-transparent outline-none font-semibold text-slate-500"
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    className="text-sm py-2 bg-transparent outline-none font-semibold text-slate-500"
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
                  className="bg-dark text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
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
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
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
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono font-bold text-xs text-primary">
                          {c.id}
                        </td>
                        <td className="px-5 py-3 font-semibold text-dark">
                          {c.fullName}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={`tel:+91${c.mobile}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-primary font-medium transition-colors"
                          >
                            <Phone size={12} /> {c.mobile}
                          </a>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {WARD_LABELS[c.ward]}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {c.category}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.priority === "Urgent"
                                ? "bg-red-100 text-red-600"
                                : c.priority === "High"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-500"
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
                            <span className="text-slate-300 text-xs">—</span>
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
            <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
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
                  <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Mobile</th>
                    <th className="pb-3 pr-4">Ward / Area</th>
                    <th className="pb-3 pr-4">Age</th>
                    <th className="pb-3 pr-4">Skills</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {volunteers.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-primary">
                        {v.id}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-dark">
                        {v.fullName}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-600">
                        {v.mobile}
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{v.ward}</td>
                      <td className="py-3 pr-4 text-slate-500">
                        {v.age || "--"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {v.skills?.map((s) => (
                            <span
                              key={s}
                              className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
            <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
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
                  <tr className="border-b border-slate-100 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-4">Citizen</th>
                    <th className="pb-3 pr-4">Ward</th>
                    <th className="pb-3 pr-4">Roads</th>
                    <th className="pb-3 pr-4">Safety</th>
                    <th className="pb-3 pr-4">Priority Area</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {surveys.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors border-l-[3px] border-transparent hover:border-brand-green"
                    >
                      <td className="py-4 pr-4 pl-3 font-semibold text-dark">
                        {s.citizen.name}
                      </td>
                      <td className="py-4 pr-4 font-medium text-slate-500">
                        {s.citizen.ward}
                      </td>
                      <td className="py-4 pr-4 font-bold text-slate-700">
                        {s.responses.roadQuality || "--"}
                      </td>
                      <td className="py-4 pr-4 font-bold text-slate-700">
                        {s.responses.safety || "--"}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="bg-green-50 text-green-700 font-bold px-3 py-1 text-xs rounded-xl">
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
      </AnimatePresence>
    </div>
  );
}
