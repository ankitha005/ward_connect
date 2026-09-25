import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Construction,
  Users,
  Landmark,
  Camera,
  Star,
  ChevronDown,
  X,
  MapPin,
  Phone,
  Mail,
  Award,
  Briefcase,
  Heart,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useComplaintsStore from "../../store/complaintsStore";
import TiltCard from "../../components/TiltCard";
import HeatmapLayer from "../../components/HeatmapLayer";
import logo from "../../assets/logo.svg";

const LotusIcon = ({ className }) => (
  <img
    src={logo}
    alt="Bengaluru Civic Connect Logo"
    className={`object-contain ${className}`}
  />
);

const Home = () => {
  const { announcements, complaints, citizens } = useComplaintsStore();

  const heatmapPoints = complaints
    .filter((c) => c.lat && c.lng)
    .map((c) => [c.lat, c.lng, c.status === "Resolved" ? 0.3 : 1.0]);

  const topCitizens = Object.values(citizens || {})
    .sort((a, b) => b.karma - a.karma)
    .slice(0, 5);

  return (
    <div className="overflow-hidden bg-white text-slate-800">
      {/* ══ HERO SECTION ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b-[16px] border-brand-green pt-[120px] pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/30 via-orange-50 to-brand-green/10" />
          <LotusIcon className="absolute -top-24 -right-24 w-[700px] h-[700px] opacity-[0.04]" />
          <LotusIcon className="absolute inset-0 m-auto w-[600px] h-[600px] opacity-[0.03]" />
        </div>
        <div className="absolute top-0 inset-x-0 h-2 flex z-10">
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-yellow-500" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center p-3 shadow-[0_10px_30px_rgba(255,153,51,0.5)] border-4 border-brand-orange mb-6"
            >
              <LotusIcon className="w-full h-full" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-extrabold px-6 py-2.5 rounded-full mb-5 text-xs md:text-sm shadow-xl tracking-widest uppercase border border-amber-300"
            >
              <Star size={12} /> BENGALURU CIVIC CONNECT • BBMP{" "}
              <Star size={12} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.08] tracking-tight mb-6"
            >
              <span className="text-brand-orange drop-shadow-sm">
                ಸೇವೆಗೇ ನಮ್ಮ ಧೇಯ
              </span>
              <br />
              <span className="text-slate-900">SERVICE IS OUR MISSION</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="relative inline-flex items-center px-10 py-4 mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 transform -skew-x-12 shadow-xl border-l-[8px] border-amber-400" />
              <div className="relative text-white font-extrabold text-xl md:text-2xl uppercase tracking-wider">
                ಅಭಿವೃದ್ಧಿ • ಪಾರದರ್ಶಕತೆ • ಸೇವೆ
                <div className="text-white/90 font-bold text-base uppercase tracking-widest mt-1 text-center">
                  Development • Transparency • Service
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/complaints"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black px-8 py-4 md:px-10 md:py-5 rounded-xl shadow-[0_12px_30px_rgba(239,68,68,0.4)] hover:shadow-[0_20px_40px_rgba(239,68,68,0.6)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 uppercase tracking-widest text-base md:text-lg border-b-[6px] border-red-800 active:border-b-0 active:translate-y-1"
              >
                Raise Grievance{" "}
                <ArrowRight
                  size={22}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </Link>
              <Link
                to="/track"
                className="group inline-flex items-center gap-3 bg-white text-red-600 font-black px-8 py-4 md:px-10 md:py-5 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 uppercase tracking-widest text-base md:text-lg border-b-[6px] border-slate-200 border-2 border-red-500/30 active:border-b-0 active:translate-y-1"
              >
                Track Status{" "}
                <Landmark
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>

            {/* ── Live Stats ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                {
                  label: "Total Complaints",
                  value: complaints.length,
                  color: "text-red-600",
                  bg: "bg-red-50 border-red-200",
                },
                {
                  label: "Resolved",
                  value: complaints.filter((c) => c.status === "Resolved")
                    .length,
                  color: "text-green-700",
                  bg: "bg-green-50 border-green-200",
                },
                {
                  label: "Pending",
                  value: complaints.filter((c) => c.status === "Pending")
                    .length,
                  color: "text-amber-700",
                  bg: "bg-amber-50 border-amber-200",
                },
                {
                  label: "Volunteers",
                  value: useComplaintsStore.getState().volunteers?.length || 0,
                  color: "text-blue-700",
                  bg: "bg-blue-50 border-blue-200",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                  className={`rounded-2xl border-2 ${stat.bg} p-4 text-center shadow-sm`}
                >
                  <div
                    className={`text-3xl font-black ${stat.color} leading-none`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="text-brand-orange opacity-70"
            >
              <ChevronDown size={32} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ TRICOLOR BAND ══ */}
      <div className="w-full flex h-5 shadow-inner z-30 relative">
        <div className="flex-1 bg-brand-orange" />
        <div className="flex-1 bg-white border-y border-slate-100" />
        <div className="flex-1 bg-brand-green" />
      </div>

      {/* ══ MARQUEE ══ */}
      <div className="bg-[#0f172a] text-white py-4 overflow-hidden border-b-8 border-brand-orange shadow-[0_10px_20px_rgba(0,0,0,0.2)] relative z-20 font-black uppercase tracking-widest text-base md:text-lg flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex space-x-16 items-center"
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-14">
              <span className="text-brand-orange">ಬಲಿಷ್ಟ ಭಾರತ</span>
              <LotusIcon className="w-5 h-5" />
              <span className="text-brand-green">ಶಕ್ತಿಶಾಲಿ ಭಾರತ</span>
              <Star className="w-5 h-5 text-brand-orange" />
              <span>Strong India • Progressive India</span>
              <LotusIcon className="w-5 h-5" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ LATEST ANNOUNCEMENTS ══ */}
      {announcements.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden border-t-2 border-slate-100 border-dashed">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-l-[8px] border-red-500 pl-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                  ಸಾರ್ವಜನಿಕ ಪ್ರಕಟಣೆಗಳು <br />
                  <span className="text-red-500">Live Announcements</span>
                </h2>
                <p className="text-slate-500 font-bold mt-2">
                  Official updates directly from Ward Administration
                </p>
              </div>
              <Link
                to="/announcements"
                className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 3).map((anc, i) => (
                <div
                  key={anc.id}
                  className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-red-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                      <Megaphone size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {anc.author}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(anc.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <span className="inline-block bg-white text-slate-500 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest mb-3 shadow-sm">
                    {anc.category}
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed text-sm line-clamp-3 mb-4">
                    {anc.content}
                  </p>
                  {anc.img && (
                    <img
                      src={anc.img}
                      className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <Link
                    to="/announcements"
                    className="text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Read Details <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CIVIC PULSE & GAMIFICATION ══ */}
      <section className="py-24 relative overflow-hidden bg-white border-t border-slate-100">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-l-[8px] border-blue-500 pl-6">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
              ಸಿವಿಕ್ ಪಲ್ಸ್ <br />
              <span className="text-blue-600">Civic Pulse & Karma</span>
            </h2>
            <p className="text-slate-500 font-bold mt-2">
              Live issue heatmap and our top civic contributors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Heatmap */}
            <div className="lg:col-span-2 h-[450px] bg-slate-100 rounded-3xl overflow-hidden shadow-inner relative border border-slate-200">
              {/* Default center to a generalized location if no points, else calculate bounds (we'll just use a fixed center for now, e.g. Bangalore approx) */}
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={12}
                style={{ height: "100%", width: "100%", zIndex: 10 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {heatmapPoints.length > 0 && (
                  <HeatmapLayer points={heatmapPoints} />
                )}
              </MapContainer>
              <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-200 pointer-events-none">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                  Issue Density
                </div>
                <div
                  className="w-32 h-2 rounded-full"
                  style={{
                    background:
                      "linear-gradient(to right, blue, cyan, lime, yellow, red)",
                  }}
                />
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-slate-50 rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Award className="text-orange-500" /> Civic Leaderboard
              </h3>

              {topCitizens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Star size={40} className="mb-3 opacity-20" />
                  <p className="font-bold text-sm">
                    No citizens on the board yet.
                  </p>
                  <p className="text-xs mt-1">
                    Be the first to earn Civic Karma by reporting issues!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCitizens.map((citizen, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 ${
                          idx === 0
                            ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-md shadow-yellow-500/30"
                            : idx === 1
                              ? "bg-gradient-to-br from-slate-300 to-slate-500"
                              : idx === 2
                                ? "bg-gradient-to-br from-amber-600 to-amber-800"
                                : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">
                          {citizen.name || "Anonymous Citizen"}
                        </div>
                        <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-0.5">
                          {citizen.karma} Karma
                        </div>
                      </div>
                      {idx === 0 && (
                        <Award size={20} className="text-yellow-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-6 text-center">
                <Link
                  to="/complaints"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center justify-center gap-1"
                >
                  Earn Karma <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CIVIC SERVICES CARDS ══ */}
      <section className="py-24 relative overflow-hidden bg-slate-50 border-t-[20px] border-brand-orange">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-l-[10px] border-brand-green pl-8">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase">
              ಬೆಂಗಳೂರು ನಾಗರಿಕ ಉಪಕ್ರಮಗಳು <br />
              <span className="text-red-600">Bengaluru Civic Initiatives</span>
            </h2>
            <p className="text-slate-600 font-extrabold text-xl">
              Direct access to all essential official services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Raise Complaint",
                desc: "Securely report civic issues directly to BBMP officials.",
                icon: <Megaphone size={34} />,
                link: "/complaints",
              },
              {
                title: "Welfare Schemes",
                desc: "Access state and central government benefits instantly.",
                icon: <ShieldCheck size={34} />,
                link: "/schemes",
              },
              {
                title: "Ward Projects",
                desc: "Monitor construction & infrastructure progress live.",
                icon: <Construction size={34} />,
                link: "/projects",
              },
              {
                title: "Announcements",
                desc: "Official updates and emergency alerts from local leaders.",
                icon: <Users size={34} />,
                link: "/announcements",
              },
              {
                title: "Public Activity",
                desc: "See BEFORE & AFTER photo evidence of resolved issues.",
                icon: <Camera size={34} />,
                link: "/activity",
              },
              {
                title: "Track Complaint",
                desc: "Check the real-time status of your grievances.",
                icon: <Landmark size={34} />,
                link: "/track",
              },
            ].map((service, i) => (
              <Link to={service.link} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative rounded-2xl p-8 bg-white border-b-[8px] border-slate-200 hover:border-brand-orange shadow-[0_5px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(255,153,51,0.25)] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/10 rounded-full group-hover:scale-[3] transition-transform duration-700 pointer-events-none" />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center text-white mb-8 shadow-lg group-hover:from-brand-green group-hover:to-emerald-600 transition-all duration-500">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-brand-orange transition-colors uppercase tracking-wide">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed mb-8 font-bold">
                    {service.desc}
                  </p>
                  <div className="inline-flex items-center font-black text-sm gap-2 text-brand-orange bg-orange-50 px-4 py-2 rounded-full group-hover:bg-brand-green group-hover:text-white transition-colors">
                    Access Portal <ArrowRight size={16} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
