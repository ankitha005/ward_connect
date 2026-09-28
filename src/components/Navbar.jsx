import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Shield,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.svg";
import WeatherWidget from "./WeatherWidget";
import { prefetchPath } from "../utils/routePrefetch";
import { isMuted, toggleMute, toggleAmbient, isAmbientPlaying } from "../utils/soundEffects";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const [soundMuted, setSoundMuted] = useState(() => isMuted());
  const [ambientPlaying, setAmbientPlaying] = useState(() => isAmbientPlaying());
  const location = useLocation();
  const navRef = useRef(null);

  const isHomePage = location.pathname === "/";
  const isSolid = !isHomePage || scrolled;

  useEffect(() => {
    const handleMuteChange = (e) => {
      setSoundMuted(e.detail?.muted ?? isMuted());
    };
    const handleAmbientChange = (e) => {
      setAmbientPlaying(e.detail?.playing ?? isAmbientPlaying());
    };
    window.addEventListener("civic-sound-mute-change", handleMuteChange);
    window.addEventListener("civic-ambient-music-change", handleAmbientChange);
    return () => {
      window.removeEventListener("civic-sound-mute-change", handleMuteChange);
      window.removeEventListener("civic-ambient-music-change", handleAmbientChange);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Schemes", path: "/schemes", icon: "📋" },
    { name: "Complaints", path: "/complaints", icon: "📝" },
    { name: "Directory", path: "/directory", icon: "📖" },
    { name: "Announcements", path: "/announcements", icon: "📢" },
    { name: "Activity", path: "/activity", icon: "⚡" },
    { name: "Gallery", path: "/gallery", icon: "🖼️" },
    { name: "Track", path: "/track", icon: "🔍" },
    { name: "Volunteer", path: "/volunteer", icon: "🤝" },
    { name: "Survey", path: "/survey", icon: "📊" },
  ];

  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 400, damping: 15 },
    },
    tap: { scale: 0.95 },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -30, filter: "blur(4px)" },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.06,
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };

  return (
    <>
      {/* Red & Yellow Accent Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 flex">
        <div className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
        <div className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
        <div className="flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
      </div>

      <nav
        ref={navRef}
        className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isSolid
            ? "bg-white/95 backdrop-blur-md shadow-[0_15px_40px_-5px_rgba(220,38,38,0.15)] border-b-2 border-red-600"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        }`}
        style={{
          WebkitBackdropFilter: isSolid ? "blur(12px)" : "none",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-2.5 sm:px-4 lg:px-6">
          <div className="flex h-[72px] items-center justify-between gap-2 md:gap-3">
            {/* Logo Section */}
            <div className="shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Glow ring */}
                  <div
                    className={`absolute -inset-2.5 rounded-[2rem] blur-md transition-all duration-300 ${
                      isSolid
                        ? "bg-brand-orange/20 group-hover:bg-brand-orange/40"
                        : "bg-orange-500/30 group-hover:bg-orange-400/60"
                    }`}
                  />
                  <div
                    className={`relative p-2 rounded-xl transition-all duration-200 transform group-hover:scale-105 ${
                      isSolid
                        ? "bg-gradient-to-br from-orange-50 to-white ring-2 ring-brand-orange/30 shadow-lg"
                        : "bg-white/10 ring-1 ring-white/30"
                    }`}
                  >
                    <img
                      src={logo}
                      alt="ADDA 360 Logo"
                      className="relative h-9 sm:h-10 w-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </motion.div>

                <div className="hidden sm:flex flex-col">
                  <motion.div
                    className={`text-lg sm:text-xl font-black tracking-tight leading-tight transition-colors duration-300 uppercase ${
                      isSolid ? "text-slate-900" : "text-white drop-shadow-md"
                    }`}
                    whileHover={{ letterSpacing: "0.04em" }}
                  >
                    ADDA{" "}
                    <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                      360
                    </span>
                  </motion.div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors duration-300 ${
                      isSolid ? "text-slate-500" : "text-white/80"
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-brand-orange shrink-0" />
                    <span className="text-[8.5px] xl:text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap">
                      Accessible Digital Development & Administration 360
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center shrink-0">
              <div
                className={`flex items-center gap-0.5 xl:gap-1 p-1 xl:p-1.5 rounded-[1.5rem] transition-all duration-200 shadow-inner ${
                  isSolid
                    ? "bg-slate-100/80 ring-2 ring-orange-100"
                    : "bg-black/20 ring-1 ring-white/20"
                }`}
              >
                {navLinks
                  .filter((l) =>
                    [
                      "Home",
                      "Schemes",
                      "Complaints",
                      "Announcements",
                    ].includes(l.name),
                  )
                  .map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onMouseEnter={() => {
                        setHoveredLink(link.name);
                        prefetchPath(link.path);
                      }}
                      onTouchStart={() => prefetchPath(link.path)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={({ isActive }) =>
                        `relative px-2.5 xl:px-3 py-1.5 xl:py-2 text-[12px] xl:text-[13px] font-bold rounded-full transition-all duration-300 uppercase tracking-wide shrink-0 ${
                          link.name === "Announcements" ? "hidden xl:inline-block" : ""
                        } ${
                          isActive
                            ? isSolid
                              ? "text-brand-orange"
                              : "text-white"
                            : isSolid
                              ? "text-slate-600 hover:text-slate-900"
                              : "text-white/80 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div
                              layoutId="nav-active-pill"
                              className={`absolute inset-0 rounded-xl ${isSolid ? "bg-white shadow-sm ring-1 ring-brand-orange/20" : "bg-brand-orange/40 border border-brand-orange"}`}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                            />
                          )}
                          {hoveredLink === link.name && !isActive && (
                            <motion.div
                              layoutId="nav-hover-glow"
                              className={`absolute inset-0 rounded-xl ${isSolid ? "bg-brand-orange/10" : "bg-white/15"}`}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                          <span className="relative z-10">{link.name}</span>
                          {isActive && (
                            <motion.div
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                              <div className="w-4 h-1.5 rounded-full bg-brand-orange" />
                            </motion.div>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}

                {/* 'More' Dropdown */}
                <div className="relative group px-1">
                  <button
                    className={`relative px-2.5 xl:px-3 py-1.5 xl:py-2 text-[12px] xl:text-[13px] font-bold rounded-full transition-all duration-300 uppercase tracking-wide flex items-center gap-1 focus:outline-none ${isSolid ? "text-slate-600 hover:text-slate-900" : "text-white/80 hover:text-white"}`}
                  >
                    More{" "}
                    <ChevronDown
                      size={14}
                      className="group-hover:rotate-180 transition-transform duration-300"
                    />
                  </button>
                  <div className="absolute top-10 right-0 w-48 opacity-0 translate-y-3 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 bg-white rounded-2xl shadow-xl shadow-black/10 border border-slate-100 p-2 flex flex-col z-[60] group-hover:pointer-events-auto pointer-events-none">
                    {/* Announcements in dropdown when on lg laptop screens */}
                    <NavLink
                      to="/announcements"
                      onMouseEnter={() => prefetchPath("/announcements")}
                      onTouchStart={() => prefetchPath("/announcements")}
                      className={({ isActive }) =>
                        `xl:hidden flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 uppercase tracking-wide ${
                          isActive
                            ? "text-brand-orange bg-orange-50"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`
                      }
                    >
                      Announcements
                    </NavLink>
                    {navLinks
                      .filter(
                        (l) =>
                          ![
                            "Home",
                            "Complaints",
                            "Schemes",
                            "Announcements",
                          ].includes(l.name),
                      )
                      .map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.path}
                          onMouseEnter={() => prefetchPath(link.path)}
                          onTouchStart={() => prefetchPath(link.path)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 uppercase tracking-wide ${
                              isActive
                                ? "text-brand-orange bg-orange-50"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`
                          }
                        >
                          {link.name}
                        </NavLink>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin CTA + Controls + Mobile Toggle */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 justify-end">
              <WeatherWidget />

              {/* Integrated Micro-toolbar capsule (Dark mode, Sound, Music) */}
              <div
                className={`hidden md:flex items-center p-1 rounded-full border transition-all duration-200 shadow-sm ${
                  isSolid
                    ? "bg-slate-100/90 border-slate-200/90"
                    : "bg-white/10 border-white/20 backdrop-blur-md"
                }`}
              >
                {/* Dark Mode Toggle */}
                <motion.button
                  onClick={() => setDarkMode((d) => !d)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isSolid
                      ? "text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <AnimatePresence mode="wait">
                    {darkMode ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun size={15} className="text-amber-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon size={15} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Divider */}
                <div
                  className={`w-[1px] h-4 mx-0.5 ${
                    isSolid ? "bg-slate-300" : "bg-white/20"
                  }`}
                />

                {/* Sound Effects Toggle */}
                <motion.button
                  onClick={toggleMute}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isSolid
                      ? "text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                  title={soundMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
                >
                  {soundMuted ? (
                    <VolumeX size={15} className="text-red-400" />
                  ) : (
                    <Volume2
                      size={15}
                      className={isSolid ? "text-brand-orange" : "text-amber-300"}
                    />
                  )}
                </motion.button>

                {/* Divider */}
                <div
                  className={`w-[1px] h-4 mx-0.5 ${
                    isSolid ? "bg-slate-300" : "bg-white/20"
                  }`}
                />

                {/* Ambient Background Music Toggle */}
                <motion.button
                  onClick={toggleAmbient}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    ambientPlaying
                      ? "bg-gradient-to-tr from-brand-orange to-amber-500 text-white shadow-[0_0_10px_rgba(255,153,51,0.6)] animate-pulse"
                      : isSolid
                        ? "text-slate-600 hover:text-slate-900 hover:bg-white shadow-xs"
                        : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                  title={
                    ambientPlaying ? "Pause Ambient Music" : "Play Civic Ambient Music"
                  }
                >
                  <Music
                    size={14}
                    className={
                      ambientPlaying
                        ? "text-white"
                        : isSolid
                          ? "text-slate-600"
                          : "text-white"
                    }
                  />
                </motion.button>
              </div>

              {/* Admin Button (Always fits comfortably inside navbar) */}
              <Link
                to="/admin/login"
                onMouseEnter={() => prefetchPath("/admin/login")}
                onTouchStart={() => prefetchPath("/admin/login")}
                className="shrink-0 group relative inline-flex items-center gap-1.5"
              >
                <motion.div
                  className="relative flex items-center gap-1.5 bg-gradient-to-r from-brand-orange via-orange-500 to-amber-500 text-white font-bold uppercase tracking-wider text-xs md:text-sm px-3 md:px-3.5 py-1.5 md:py-2 rounded-xl shadow-[0_4px_14px_rgba(255,153,51,0.35)] border border-orange-400/80"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
                  <span className="relative z-10 whitespace-nowrap">Admin</span>
                </motion.div>
              </Link>

              {/* Mobile Toggle Button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden relative p-3 rounded-2xl transition-all duration-300 shadow-md ${
                  isSolid
                    ? "text-slate-900 bg-white hover:bg-orange-50 ring-1 ring-orange-200"
                    : "text-white bg-black/20 hover:bg-white/20 ring-1 ring-white/30"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>


        {/* Mobile Fullscreen Drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/40 lg:hidden"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-full left-3 right-3 lg:hidden bg-white rounded-2xl shadow-2xl shadow-black/15 border border-white/40 mt-2 max-h-[80vh] overflow-y-auto custom-scrollbar"
              >
                {/* Decorative gradient top */}
                <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-green-500" />

                <div className="p-4 space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      custom={i}
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <NavLink
                        to={link.path}
                        onMouseEnter={() => prefetchPath(link.path)}
                        onTouchStart={() => prefetchPath(link.path)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-[15px] font-semibold rounded-xl transition-all duration-200 ${
                            isActive
                              ? "text-primary bg-gradient-to-r from-primary/10 to-orange-50 ring-1 ring-primary/15 shadow-sm"
                              : "text-slate-600 hover:text-dark hover:bg-slate-50"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span className="text-base">{link.icon}</span>
                            <span>{link.name}</span>
                            {isActive && (
                              <motion.div
                                className="ml-auto w-2 h-2 rounded-full bg-primary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                {/* Dark Mode in mobile drawer */}
                <motion.div
                  className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between"
                  custom={navLinks.length}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Interface Mode
                  </span>
                  <button
                    onClick={() => setDarkMode((d) => !d)}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-all border border-slate-200"
                  >
                    {darkMode ? (
                      <>
                        <Sun size={16} className="text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon size={16} />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Sound Effects in mobile drawer */}
                <motion.div
                  className="p-4 pt-0 flex items-center justify-between"
                  custom={navLinks.length + 1}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Sound Effects
                  </span>
                  <button
                    onClick={toggleMute}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-all border border-slate-200"
                  >
                    {soundMuted ? (
                      <>
                        <VolumeX size={16} className="text-red-500" />
                        <span>Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} className="text-brand-orange" />
                        <span>Enabled</span>
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Ambient Music in mobile drawer */}
                <motion.div
                  className="p-4 pt-0 flex items-center justify-between"
                  custom={navLinks.length + 2}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Ambient Music
                  </span>
                  <button
                    onClick={toggleAmbient}
                    className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl transition-all border ${
                      ambientPlaying
                        ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                    }`}
                  >
                    <Music size={16} />
                    <span>{ambientPlaying ? "Playing" : "Play"}</span>
                  </button>
                </motion.div>

                {/* Admin Button in mobile */}
                <motion.div
                  className="p-4 pt-0"
                  custom={navLinks.length + 1}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    to="/admin/login"
                    onMouseEnter={() => prefetchPath("/admin/login")}
                    onTouchStart={() => prefetchPath("/admin/login")}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
