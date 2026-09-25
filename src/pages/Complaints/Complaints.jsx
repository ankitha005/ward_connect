import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  User,
  FileText,
  Camera,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  X,
  Image as ImageIcon,
  Copy,
  CheckCheck,
  Loader2,
  Navigation2,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  Footprints,
  ShieldAlert,
  Trees,
  PawPrint,
  Volume2,
  HelpCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useComplaintsStore from "../../store/complaintsStore";
import { DIRECTORY_DATA } from "../../data/directoryData";

// Map each complaint category to the concerned department official from DIRECTORY_DATA
const CATEGORY_TO_OFFICIAL = {
  "Road Repair & Potholes": { name: "GBA Ward Engineer", group: "Engineering" },
  "Street Lighting": {
    name: "GBA Electrical Department",
    group: "Engineering",
  },
  "Sanitation / Garbage Collection": {
    name: "GBA West Ward Health Inspector",
    group: "Health & Sanitation",
  },
  "Water Supply & Drainage": {
    name: "BWSSB Water Inspector",
    group: "Utilities",
  },
  "Footpath / Pavement": {
    name: "GBA Ward AEE Engineer",
    group: "Engineering",
  },
  Encroachment: {
    name: "GBA West Ward Revenue Dept",
    group: "Ward Administration",
  },
  "Park / Public Space": { name: "Park Incharge", group: "Environment" },
  "Stray Animals": { name: "GBA West Forest Department", group: "Environment" },
  "Noise / Pollution": {
    name: "GBA West Control Room",
    group: "Emergency & Control",
  },
  Other: { name: "GBA West Control Room", group: "Emergency & Control" },
};

function getOfficialForCategory(category) {
  const mapping = CATEGORY_TO_OFFICIAL[category];
  if (!mapping)
    return {
      name: "GBA West Control Room",
      phone: "+91 80 2266 0000",
      role: "Main Helpline",
      group: "Emergency & Control",
    };
  const official = DIRECTORY_DATA.find((d) => d.name === mapping.name);
  if (!official)
    return {
      name: mapping.name,
      phone: "N/A",
      role: "Department",
      group: mapping.group,
    };
  return {
    name: official.name,
    phone: official.phone,
    role: official.role,
    group: official.group || mapping.group,
  };
}

function buildWhatsAppUrl(official, form, complaintId, wardLabel) {
  // Clean phone number: remove spaces, slashes, and keep only digits after +91
  let phone = official.phone.split("/")[0].trim(); // take first number if multiple
  phone = phone.replace(/[^\d+]/g, ""); // keep only digits and +
  if (phone.startsWith("+91")) phone = "91" + phone.slice(3);
  else if (phone.startsWith("91")) {
    /* already fine */
  } else if (phone.length === 10) phone = "91" + phone;
  else phone = "91" + phone.replace(/^\+/, "");

  const message = [
    `🚨 *NEW WARD COMPLAINT — ${complaintId}*`,
    ``,
    `📋 *Category:* ${form.category}`,
    `⚡ *Priority:* ${form.priority}`,
    `🏘️ *Ward:* ${wardLabel}`,
    `📍 *Location:* ${form.address}${form.area ? ` (${form.area})` : ""}`,
    ``,
    `📝 *Description:*`,
    form.description,
    ``,
    `👤 *Citizen:* ${form.fullName}`,
    `📞 *Mobile:* +91 ${form.mobile}`,
    `🪪 *Voter ID:* ${form.voterId}`,
    ``,
    `_Sent via Bengaluru Civic Connect Platform_`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildSmsUrl(official, form, complaintId, wardLabel) {
  let phone = official.phone.split("/")[0].trim();
  phone = phone.replace(/[^\d+]/g, "");

  const message = `NEW WARD COMPLAINT: ${complaintId}
Category: ${form.category}
Priority: ${form.priority}
Ward: ${wardLabel}
Loc: ${form.address}
Desc: ${form.description}
From: ${form.fullName} (+91 ${form.mobile})
VoterID: ${form.voterId}`;

  // Adjust for iOS vs Android SMS protocol behavior
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const separator = isIOS ? "&" : "?";

  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

import { BANGALORE_WARDS_DATA } from "../../data/bangaloreWardsData";

const WARDS = BANGALORE_WARDS_DATA.map((w) => ({
  id: w.constituency,
  label: `${w.constituency} (${w.corp} Corp - #${w.slNo})`,
  corp: w.corp,
  mapUrl: w.mapUrl,
}));

const CATEGORIES = [
  {
    label: "Road Repair & Potholes",
    icon: Construction,
    color: "bg-red-500",
    textColor: "text-red-600",
    bgLight: "bg-red-50",
    border: "border-red-300",
    desc: "Potholes, broken roads, speed bumps",
  },
  {
    label: "Street Lighting",
    icon: Lightbulb,
    color: "bg-amber-500",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50",
    border: "border-amber-300",
    desc: "Street lamps out, dark roads at night",
  },
  {
    label: "Sanitation / Garbage Collection",
    icon: Trash2,
    color: "bg-green-600",
    textColor: "text-green-700",
    bgLight: "bg-green-50",
    border: "border-green-300",
    desc: "Overflowing bins, missed collection",
  },
  {
    label: "Water Supply & Drainage",
    icon: Droplets,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-300",
    desc: "Water leaks, flooding, drainage issues",
  },
  {
    label: "Footpath / Pavement",
    icon: Footprints,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50",
    border: "border-purple-300",
    desc: "Broken pavements, blocked footpaths",
  },
  {
    label: "Encroachment",
    icon: ShieldAlert,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
    border: "border-orange-300",
    desc: "Illegal construction, footpath blockage",
  },
  {
    label: "Park / Public Space",
    icon: Trees,
    color: "bg-teal-500",
    textColor: "text-teal-600",
    bgLight: "bg-teal-50",
    border: "border-teal-300",
    desc: "Damaged parks, public area upkeep",
  },
  {
    label: "Stray Animals",
    icon: PawPrint,
    color: "bg-yellow-600",
    textColor: "text-yellow-700",
    bgLight: "bg-yellow-50",
    border: "border-yellow-300",
    desc: "Aggressive strays, animal menace",
  },
  {
    label: "Noise / Pollution",
    icon: Volume2,
    color: "bg-pink-500",
    textColor: "text-pink-600",
    bgLight: "bg-pink-50",
    border: "border-pink-300",
    desc: "Loud music, construction noise, air quality",
  },
  {
    label: "Other",
    icon: HelpCircle,
    color: "bg-slate-500",
    textColor: "text-slate-600",
    bgLight: "bg-slate-50",
    border: "border-slate-300",
    desc: "Any other civic issue not listed above",
  },
];

const STEPS = [
  { id: 1, label: "Personal Info", icon: <User size={16} /> },
  { id: 2, label: "Location & Ward", icon: <MapPin size={16} /> },
  { id: 3, label: "Issue Details", icon: <FileText size={16} /> },
];

export default function Complaints() {
  const { addComplaint, complaints, upvoteComplaint } = useComplaintsStore();
  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState(null);
  const [upvotedId, setUpvotedId] = useState(null);
  const [allocatedOfficial, setAllocatedOfficial] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState(null);
  const [smsUrl, setSmsUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | fetching | ok | denied
  const [autoWardDetected, setAutoWardDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    voterId: "",
    ward: "",
    address: "",
    area: "",
    category: "",
    description: "",
    priority: "Medium",
    lat: null,
    lng: null,
    photoData: null,
  });
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  // Manual GPS capture & reverse geocoding with Intelligent Bangalore Ward matching
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Default smart Bangalore constituency assignment based on geographic quadrant
        let autoWard = "Chamrajapet"; // Default Central Corp
        if (latitude > 13.0) autoWard = "Yelahanka";
        else if (latitude < 12.92) autoWard = "Jayanagar";
        else if (longitude > 77.65) autoWard = "Mahadevapura";
        else if (longitude < 77.54) autoWard = "Vijayanagar";

        setForm((f) => ({
          ...f,
          lat: latitude,
          lng: longitude,
          ward: autoWard,
        }));
        setAutoWardDetected(true);

        try {
          // Reverse geocode using Nominatim API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          );
          const data = await res.json();

          if (data && data.display_name) {
            const addr = data.display_name;

            // Check if any of our 33 official constituencies are in the address string!
            const matchedW = BANGALORE_WARDS_DATA.find(
              (w) =>
                addr.toLowerCase().includes(w.constituency.toLowerCase()) ||
                (data.address &&
                  Object.values(data.address).some(
                    (val) =>
                      typeof val === "string" &&
                      val.toLowerCase().includes(w.constituency.toLowerCase()),
                  )),
            );
            if (matchedW) {
              autoWard = matchedW.constituency;
            }

            setForm((f) => ({ ...f, address: addr, ward: autoWard }));

            // Try to extract an area/colony name
            const area =
              data.address.suburb ||
              data.address.neighbourhood ||
              data.address.village ||
              "";
            if (area) {
              setForm((f) => ({ ...f, area }));
            }
          }
          setGeoStatus("ok");
        } catch (err) {
          setGeoStatus("ok"); // still got coordinates even if reverse geocode failed
        }
      },
      () => setGeoStatus("denied"),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.fullName.trim()) errs.fullName = "Full name is required";
      if (!form.mobile.match(/^[6-9]\d{9}$/))
        errs.mobile = "Enter a valid 10-digit mobile number";
      if (!form.voterId.trim()) errs.voterId = "Voter ID is mandatory";
    }
    if (s === 2) {
      if (!form.ward) errs.ward = "Please select a ward";
      if (!form.address.trim()) errs.address = "Address / landmark is required";
    }
    if (s === 3) {
      if (!form.category) errs.category = "Please select an issue category";
      if (form.description.trim().length < 20)
        errs.description = "Please provide at least 20 characters";
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((f) => ({ ...f, photoData: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAiAnalyze = async () => {
    let desc = form.description.trim();
    if (!desc && !form.photoData) {
      setErrors({
        description:
          "Please provide a description or a photo for the AI to analyze.",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/chat/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          photoData: form.photoData,
        }),
      });

      if (!res.ok) throw new Error("AI Analysis failed");

      const data = await res.json();
      const detectedCat = data.category || "Other";
      const detectedPriority = data.priority || "Medium";
      const score = data.score || 50;

      const officialObj = getOfficialForCategory(detectedCat);
      const wardDisp = form.ward || "Bangalore Constituency";

      const expandedSummary = `📋 AI Officer Triage & Grievance Formalization:\n• Technical Diagnosis: ${data.summary || "Issue categorized."}\n• Recommended Action: Immediate dispatch of **${officialObj.name}** (${officialObj.group}) for inspection in ${wardDisp}.\n• Triage Priority: ${detectedPriority} (${score}/100 Urgency Score)`;

      setForm((f) => ({
        ...f,
        category: detectedCat,
        priority: detectedPriority,
        description:
          desc.length < 40
            ? `${desc}\n\n[AI Expanded Specification: ${data.summary}]`
            : desc,
      }));

      setAiAnalysis({
        category: detectedCat,
        priority: detectedPriority,
        score,
        summary: expandedSummary,
      });
    } catch (err) {
      console.error(err);
      setErrors({
        description: "AI analysis failed. Please manually select a category.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(3);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Resolve the concerned department official for this category
    const official = getOfficialForCategory(form.category);
    setAllocatedOfficial(official);

    // Auto-route complaint via EmailJS
    try {
      console.log(
        `[EmailJS] Routing automated complaint email to: ${official.name}`,
      );

      const templateParams = {
        official_name: official.name,
        complaint_category: form.category,
        priority: form.priority,
        citizen_name: form.fullName,
        citizen_mobile: form.mobile,
        voter_id: form.voterId,
        address: `${form.address} ${form.area ? `(${form.area})` : ""}`,
        description: form.description,
        ward_name: WARDS.find((w) => w.id === form.ward)?.label || form.ward,
        photo_attached: form.photoData
          ? "Yes — see image below"
          : "No photo attached",
        photo_html: form.photoData
          ? `<div style="margin-top:12px;"><p style="font-weight:bold;color:#555;">📷 Photo Evidence:</p><img src="${form.photoData}" alt="Complaint Photo" style="max-width:100%;max-height:400px;border-radius:8px;border:1px solid #ddd;margin-top:8px;" /></div>`
          : '<p style="color:#999;">No photo was attached to this complaint.</p>',
      };

      await emailjs
        .send(
          "service_6z0ngxs",
          "template_8mh7lrx",
          templateParams,
          "pce6KC0S7C7TCO2CA",
        )
        .catch((e) => {
          console.error("EmailJS Error:", e);
        });
    } catch (err) {
      console.warn("Email routing failed", err);
    }

    // Save to local storage for Admin Dashboard
    const id = addComplaint({ ...form });
    setSubmittedId(id);

    // Build WhatsApp URL and auto-forward to official's mobile
    const wLabel = WARDS.find((w) => w.id === form.ward)?.label || form.ward;
    const waUrl = buildWhatsAppUrl(official, form, id, wLabel);
    const smsUrl = buildSmsUrl(official, form, id, wLabel);

    setWhatsappUrl(waUrl);
    setSmsUrl(smsUrl);

    // Auto-open SMS/WhatsApp based on mobile device could be annoying to block automatically,
    // let's leave both buttons available on the success screen.
    // If you want it to auto pop open WhatsApp, we can uncomment below.
    // window.open(waUrl, '_blank')
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(submittedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setSubmittedId(null);
    setUpvotedId(null);
    setStep(1);
    setAllocatedOfficial(null);
    setWhatsappUrl(null);
    setSmsUrl(null);
    setForm({
      fullName: "",
      mobile: "",
      voterId: "",
      ward: "",
      address: "",
      area: "",
      category: "",
      description: "",
      priority: "Medium",
      lat: null,
      lng: null,
      photoData: null,
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleUpvote = (complaintId) => {
    upvoteComplaint(complaintId, form.voterId, form.fullName);
    setUpvotedId(complaintId);
  };

  const wardLabel = WARDS.find((w) => w.id === form.ward)?.label;

  /* ── Success Screen ── */
  if (submittedId || upvotedId) {
    const displayId = submittedId || upvotedId;
    const isUpvote = !!upvotedId;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-10"
        >
          <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            {wardLabel}
          </div>
          <h2 className="text-3xl font-bold text-dark mb-3">
            {isUpvote ? "Upvoted Successfully!" : "Complaint Registered!"}
          </h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            {isUpvote
              ? "You have added your voice to an existing issue. You earned +10 Civic Karma points!"
              : "Your grievance is saved and trackable. Use the Complaint ID below to check its status anytime."}
          </p>

          {/* Complaint ID with copy */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Complaint ID
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-mono font-bold text-primary tracking-wider">
                {displayId}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(displayId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
              >
                {copied ? (
                  <CheckCheck size={18} className="text-success" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Forwarded-to Official Card */}
          {allocatedOfficial && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    Forward to Official
                  </div>
                </div>
              </div>
              <div className="font-bold text-dark text-base">
                {allocatedOfficial.name}
              </div>
              <div className="text-xs text-slate-500 font-semibold mb-1">
                {allocatedOfficial.role} · {allocatedOfficial.group}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-blue-700 mb-4">
                <Phone size={13} /> {allocatedOfficial.phone}
              </div>

              <div className="flex flex-col gap-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle size={16} /> Forward via WhatsApp
                  </a>
                )}
                {smsUrl && (
                  <a
                    href={smsUrl}
                    className="flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle size={16} /> Send via Regular SMS
                  </a>
                )}
              </div>
            </motion.div>
          )}

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Ward</span>
              <span className="font-bold text-dark">{wardLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Category</span>
              <span className="font-bold text-dark">{form.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Priority</span>
              <span className="font-bold text-dark">{form.priority}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Forwarded To</span>
              <span className="font-bold text-green-600">
                {allocatedOfficial?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-semibold">Status</span>
              <span className="font-bold text-amber-500">Pending Review</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/track" className="flex-1 btn-outline text-center">
              Track Complaint
            </Link>
            <button onClick={reset} className="flex-1 btn-primary">
              File Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-dark mb-3">
            Report a Ward Issue
          </h1>
          <p className="text-slate-500 font-medium">
            Your grievance will be directly routed to the ward office and is
            fully trackable.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 gap-10 items-start">
          {/* Main Form Column */}
          <div className="lg:col-span-8 w-full max-w-3xl mx-auto lg:mx-0">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-10 px-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step > s.id
                          ? "bg-success text-white"
                          : step === s.id
                            ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                            : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {step > s.id ? <CheckCircle2 size={18} /> : s.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step === s.id ? "text-primary" : "text-slate-400"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 rounded-full overflow-hidden bg-slate-200 mb-4">
                      <div
                        className={`h-full bg-primary transition-all duration-500 ${step > s.id ? "w-full" : "w-0"}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-dark flex items-center gap-2 mb-6">
                        <User className="text-primary" size={22} /> Personal
                        Details
                      </h3>
                      <div>
                        <label className="label-style">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => set("fullName", e.target.value)}
                          className={`input-style ${errors.fullName ? "border-red-300 bg-red-50" : ""}`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="err-msg">
                            <AlertCircle size={12} />
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="label-style">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="tel"
                            maxLength={10}
                            value={form.mobile}
                            onChange={(e) =>
                              set("mobile", e.target.value.replace(/\D/, ""))
                            }
                            className={`input-style pl-10 ${errors.mobile ? "border-red-300 bg-red-50" : ""}`}
                            placeholder="10-digit mobile number"
                          />
                        </div>
                        {errors.mobile && (
                          <p className="err-msg">
                            <AlertCircle size={12} />
                            {errors.mobile}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="label-style">
                          Voter ID (EPIC Number){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.voterId}
                          onChange={(e) =>
                            set("voterId", e.target.value.toUpperCase())
                          }
                          className={`input-style font-mono tracking-wider ${errors.voterId ? "border-red-300 bg-red-50" : ""}`}
                          placeholder="e.g. UAI4574761"
                          maxLength={12}
                        />
                        {errors.voterId && (
                          <p className="err-msg">
                            <AlertCircle size={12} />
                            {errors.voterId}
                          </p>
                        )}
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn-primary flex items-center gap-2"
                        >
                          Next: Location & Ward <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-dark flex items-center gap-2 mb-6">
                        <MapPin className="text-primary" size={22} /> Location &
                        Ward
                      </h3>

                      <div>
                        <label className="label-style">
                          Select Ward <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {WARDS.map((w) => (
                            <button
                              type="button"
                              key={w.id}
                              onClick={() => set("ward", w.id)}
                              className={`p-5 rounded-2xl border-2 text-left transition-all font-semibold ${form.ward === w.id ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-primary/40"}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 mb-3 transition-colors ${form.ward === w.id ? "border-primary bg-primary" : "border-slate-300"}`}
                              />
                              {w.label}
                            </button>
                          ))}
                        </div>
                        {errors.ward && (
                          <p className="err-msg">
                            <AlertCircle size={12} />
                            {errors.ward}
                          </p>
                        )}
                      </div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <label className="label-style !mb-0">
                            Street Address / Landmark{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={fetchLocation}
                            disabled={geoStatus === "fetching"}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-orange-600 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {geoStatus === "fetching" ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Navigation2 size={14} />
                            )}
                            {geoStatus === "fetching"
                              ? "Fetching..."
                              : geoStatus === "ok"
                                ? "Update Location"
                                : "Fetch GPS Location"}
                          </button>
                        </div>

                        <textarea
                          value={form.address}
                          onChange={(e) => set("address", e.target.value)}
                          className={`input-style resize-none ${errors.address ? "border-red-300 bg-red-50" : ""}`}
                          rows={3}
                          placeholder="Where exactly is the issue?"
                        />
                        {errors.address && (
                          <p className="err-msg">
                            <AlertCircle size={12} />
                            {errors.address}
                          </p>
                        )}

                        {geoStatus === "ok" && (
                          <div className="mt-2 space-y-1.5">
                            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Google Maps coordinates
                              captured successfully.
                            </p>
                            {autoWardDetected && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-amber-700 bg-amber-50 border border-amber-300 rounded-xl p-2.5 font-bold flex items-center gap-1.5 shadow-sm"
                              >
                                <Sparkles
                                  size={14}
                                  className="text-amber-500 shrink-0"
                                />{" "}
                                ✨ Ward automatically detected:{" "}
                                <span className="underline text-red-600">
                                  {form.ward}
                                </span>{" "}
                                based on your GPS location & address match!
                              </motion.p>
                            )}
                          </div>
                        )}
                        {geoStatus === "denied" && (
                          <p className="text-[10px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                            <AlertCircle size={12} /> Location access denied.
                            Please enter address manually.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="label-style">
                          Area / Colony (Optional)
                        </label>
                        <input
                          type="text"
                          value={form.area}
                          onChange={(e) => set("area", e.target.value)}
                          className="input-style"
                          placeholder="e.g. Raghavendra Colony"
                        />
                      </div>
                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="btn-outline flex items-center gap-2"
                        >
                          <ChevronLeft size={18} /> Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn-primary flex items-center gap-2"
                        >
                          Next: Issue Details <ChevronRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-bold text-dark flex items-center gap-2 mb-6">
                        <FileText className="text-primary" size={22} /> Issue
                        Details
                      </h3>
                      <div>
                        <label className="label-style">
                          Issue Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                          {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = form.category === cat.label;
                            return (
                              <motion.button
                                type="button"
                                key={cat.label}
                                onClick={() => set("category", cat.label)}
                                whileHover={{ y: -2, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none ${
                                  isSelected
                                    ? `${cat.bgLight} ${cat.border} shadow-md`
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                                  >
                                    <CheckCircle2
                                      size={12}
                                      className="text-white"
                                    />
                                  </motion.div>
                                )}
                                <div
                                  className={`w-9 h-9 rounded-xl ${cat.color} text-white flex items-center justify-center mb-3 shadow-sm`}
                                >
                                  <Icon size={18} />
                                </div>
                                <p
                                  className={`text-sm font-bold leading-snug mb-0.5 ${isSelected ? cat.textColor : "text-slate-700"}`}
                                >
                                  {cat.label}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium leading-snug">
                                  {cat.desc}
                                </p>
                              </motion.button>
                            );
                          })}
                        </div>
                        {errors.category && (
                          <p className="err-msg mt-2">
                            <AlertCircle size={12} />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      {form.category &&
                        complaints.filter(
                          (c) =>
                            c.ward === form.ward &&
                            c.category === form.category &&
                            c.status === "Pending" &&
                            !c.upvotes?.includes(form.voterId),
                        ).length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-inner"
                          >
                            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                              <AlertCircle
                                size={16}
                                className="text-brand-orange"
                              />{" "}
                              Is your issue already listed here?
                            </h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                              {complaints
                                .filter(
                                  (c) =>
                                    c.ward === form.ward &&
                                    c.category === form.category &&
                                    c.status === "Pending" &&
                                    !c.upvotes?.includes(form.voterId),
                                )
                                .map((c) => (
                                  <div
                                    key={c.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                  >
                                    <div className="flex-1">
                                      <p className="text-xs font-bold text-slate-500 mb-1">
                                        {c.address}
                                      </p>
                                      <p className="text-sm text-slate-800 font-medium line-clamp-2">
                                        {c.description}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                                        {c.upvotes?.length || 0} Upvotes
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleUpvote(c.id)}
                                      className="shrink-0 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors border border-brand-orange/20"
                                    >
                                      Upvote (+10 Karma)
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        )}

                      <div>
                        <label className="label-style">Priority Level</label>
                        <div className="flex gap-3">
                          {["Low", "Medium", "High", "Urgent"].map((p) => (
                            <button
                              type="button"
                              key={p}
                              onClick={() => set("priority", p)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                form.priority === p
                                  ? p === "Urgent"
                                    ? "bg-red-500 border-red-500 text-white"
                                    : p === "High"
                                      ? "bg-amber-500 border-amber-500 text-white"
                                      : p === "Medium"
                                        ? "bg-blue-500 border-blue-500 text-white"
                                        : "bg-slate-400 border-slate-400 text-white"
                                  : "border-slate-100 text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="label-style !mb-0">
                            Description <span className="text-red-500">*</span>{" "}
                            <span className="text-slate-400 font-normal ml-1">
                              (min. 20 chars)
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={handleAiAnalyze}
                            disabled={isAnalyzing}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 px-3.5 py-1.5 rounded-xl shadow-md shadow-red-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            {isAnalyzing ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Sparkles size={13} />
                            )}
                            {isAnalyzing
                              ? "Analyzing Issue..."
                              : "✨ AI Smart Analyze & Auto-Fill"}
                          </button>
                        </div>
                        <textarea
                          value={form.description}
                          onChange={(e) => set("description", e.target.value)}
                          className={`input-style resize-none ${errors.description ? "border-red-300 bg-red-50" : ""}`}
                          rows={5}
                          placeholder="Describe the problem in detail… Or click AI Smart Analyze to test!"
                        />
                        <div className="flex justify-between mt-1">
                          {errors.description ? (
                            <p className="err-msg">
                              <AlertCircle size={12} />
                              {errors.description}
                            </p>
                          ) : (
                            <span />
                          )}
                          <span
                            className={`text-[10px] font-medium ${form.description.length < 20 ? "text-slate-400" : "text-success"}`}
                          >
                            {form.description.length} chars
                          </span>
                        </div>

                        {aiAnalysis && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 bg-gradient-to-br from-amber-50 to-red-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                                <Sparkles size={14} /> AI Triage Assessment
                              </span>
                              <span className="text-xs font-extrabold bg-white px-2.5 py-1 rounded-full border border-amber-200 text-amber-700">
                                Urgency Score: {aiAnalysis.score}/100
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium leading-relaxed mb-3 whitespace-pre-line">
                              {aiAnalysis.summary}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                              <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                                Category: {aiAnalysis.category}
                              </span>
                              <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                                Priority: {aiAnalysis.priority}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="label-style flex items-center gap-2">
                          <Camera size={14} /> Photo Evidence{" "}
                          <span className="text-slate-400 font-normal">
                            (Optional)
                          </span>
                        </label>
                        {photoPreview ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-100">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhoto(null);
                                setPhotoPreview(null);
                                setForm((f) => ({ ...f, photoData: null }));
                              }}
                              className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1.5 rounded-full text-slate-600 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                              {photo?.name}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <ImageIcon
                              className="mx-auto mb-3 text-slate-300 group-hover:text-primary transition-colors"
                              size={36}
                            />
                            <p className="text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">
                              Click to upload a photo
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                              JPG, PNG, WEBP · Max 10 MB
                            </p>
                          </button>
                        )}
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhoto}
                        />
                      </div>
                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="btn-outline flex items-center gap-2"
                        >
                          <ChevronLeft size={18} /> Back
                        </button>
                        <button
                          type="submit"
                          className="btn-primary flex items-center gap-2"
                        >
                          Submit Complaint <Send size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {step > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white rounded-2xl border border-slate-100 px-6 py-4 text-sm text-slate-500 space-y-1"
              >
                {form.fullName && (
                  <p>
                    <span className="font-semibold text-dark">Name:</span>{" "}
                    {form.fullName}
                  </p>
                )}
                {form.mobile && (
                  <p>
                    <span className="font-semibold text-dark">Mobile:</span> +91{" "}
                    {form.mobile}
                  </p>
                )}
                {wardLabel && (
                  <p>
                    <span className="font-semibold text-dark">Ward:</span>{" "}
                    {wardLabel}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Directory Sidebar */}
          <div className="lg:col-span-4 mt-12 lg:mt-0 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                <Phone size={18} className="text-primary" /> Emergency Contacts
              </h3>

              <div className="space-y-3 mb-6">
                {DIRECTORY_DATA.filter(
                  (d) =>
                    d.group === "Emergency & Control" ||
                    d.group === "Ward Administration",
                )
                  .slice(0, 5)
                  .map((contact, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${contact.bgColor || "from-primary to-orange-500"} text-white`}
                      >
                        <contact.icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-dark text-sm truncate">
                          {contact.name}
                        </div>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 mb-4">
                <h4 className="font-bold text-dark text-sm mb-1">
                  Need someone specific?
                </h4>
                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                  We have a complete directory of 45+ ward officials,
                  departments, and party leaders.
                </p>
                <Link
                  to="/directory"
                  className="w-full btn-primary py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  View Full Directory <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
