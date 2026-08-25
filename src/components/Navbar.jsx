import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Shield, ExternalLink, Sparkles, ChevronDown, Moon, Sun } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.svg'
import WeatherWidget from './WeatherWidget'
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const location = useLocation()
  const navRef = useRef(null)

  const isHomePage = location.pathname === '/'
  const isSolid = !isHomePage || scrolled

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [darkMode])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setIsOpen(false) }, [location])

  const navLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Schemes', path: '/schemes', icon: '📋' },
    { name: 'Complaints', path: '/complaints', icon: '📝' },
    { name: 'Projects', path: '/projects', icon: '🏗️' },
    { name: 'Directory', path: '/directory', icon: '📖' },
    { name: 'Announcements', path: '/announcements', icon: '📢' },
    { name: 'Activity', path: '/activity', icon: '⚡' },
    { name: 'Gallery', path: '/gallery', icon: '🖼️' },
    { name: 'Track', path: '/track', icon: '🔍' },
    { name: 'Volunteer', path: '/volunteer', icon: '🤝' },
    { name: 'Survey', path: '/survey', icon: '📊' },
  ]

  const linkVariants = {
    hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 15 } },
    tap: { scale: 0.95 },
  }

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
    visible: (i) => ({
      opacity: 1, x: 0, filter: 'blur(0px)',
      transition: { delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  }

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
        className={`fixed top-1 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          isSolid
            ? 'bg-white/95 backdrop-blur-3xl shadow-[0_15px_40px_-5px_rgba(220,38,38,0.15)] border-b-2 border-red-600'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
        style={{
          WebkitBackdropFilter: isSolid ? 'blur(20px) saturate(200%)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center">

            {/* Logo Section */}
            <div className="flex-1 flex justify-start">
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="relative"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Glow ring */}
                  <div className={`absolute -inset-2.5 rounded-[2rem] blur-xl transition-all duration-700 animate-pulse ${
                    isSolid
                      ? 'bg-brand-orange/30 group-hover:bg-brand-orange/60'
                      : 'bg-orange-500/40 group-hover:bg-orange-400/80'
                  }`} />
                  <div className={`relative p-2 rounded-xl transition-all duration-500 transform group-hover:scale-110 ${
                    isSolid
                      ? 'bg-gradient-to-br from-orange-50 to-white ring-2 ring-brand-orange/30 shadow-lg'
                      : 'bg-white/10 ring-1 ring-white/30 backdrop-blur-sm'
                  }`}>
                    <img
                      src={logo}
                      alt="Bengaluru Civic Portal Logo"
                      className="relative h-10 w-auto object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                    />
                  </div>
                </motion.div>

                <div className="hidden sm:flex flex-col">
                  <motion.div
                    className={`text-xl font-black tracking-tight leading-tight transition-colors duration-300 uppercase ${
                      isSolid ? 'text-slate-900' : 'text-white drop-shadow-md'
                    }`}
                    whileHover={{ letterSpacing: '0.04em' }}
                  >
                    Bengaluru{' '}
                    <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                      Civic Wards
                    </span>
                  </motion.div>
                  <div className={`flex items-center gap-1.5 transition-colors duration-300 ${
                    isSolid ? 'text-slate-500' : 'text-white/80'
                  }`}>
                    <Sparkles className="w-3 h-3 text-brand-orange" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                      Official Civic Platform
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-none justify-end">
              <div className={`flex items-center gap-1 p-1.5 rounded-[1.5rem] transition-all duration-500 shadow-inner ${
                isSolid
                  ? 'bg-slate-100/80 ring-2 ring-orange-100'
                  : 'bg-black/20 ring-1 ring-white/20 backdrop-blur-md'
              }`}>
                {navLinks.filter(l => ['Home', 'Complaints', 'Announcements', 'Projects', 'Volunteer', 'Survey'].includes(l.name)).map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={({ isActive }) =>
                      `relative px-3 py-2 text-[12px] xl:text-[13px] font-bold rounded-full transition-all duration-300 uppercase tracking-wide shrink-0 ${
                        isActive
                          ? isSolid
                            ? 'text-brand-orange'
                            : 'text-white'
                          : isSolid
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-white/80 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div layoutId="nav-active-pill" className={`absolute inset-0 rounded-xl ${isSolid ? 'bg-white shadow-sm ring-1 ring-brand-orange/20' : 'bg-brand-orange/40 border border-brand-orange'}`} transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
                        )}
                        {hoveredLink === link.name && !isActive && (
                          <motion.div layoutId="nav-hover-glow" className={`absolute inset-0 rounded-xl ${isSolid ? 'bg-brand-orange/10' : 'bg-white/15'}`} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        )}
                        <span className="relative z-10">{link.name}</span>
                        {isActive && (
                          <motion.div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1" initial={{ scale: 0 }} animate={{ scale: 1 }}>
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
                  <button className={`relative px-3 py-2 text-[12px] xl:text-[13px] font-bold rounded-full transition-all duration-300 uppercase tracking-wide flex items-center gap-1 focus:outline-none ${isSolid ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}>
                    More <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute top-10 right-0 w-48 opacity-0 translate-y-3 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl shadow-black/10 border border-slate-100 p-2 flex flex-col z-[60] group-hover:pointer-events-auto pointer-events-none">
                    {navLinks.filter(l => !['Home', 'Complaints', 'Announcements', 'Projects', 'Volunteer', 'Survey'].includes(l.name)).map(link => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-200 uppercase tracking-wide ${
                            isActive ? 'text-brand-orange bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            {/* Admin CTA + Mobile Toggle */}
            <div className="flex-1 flex items-center gap-2 md:gap-3 justify-end">
              <WeatherWidget />
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={() => setDarkMode(d => !d)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border hidden md:flex ${
                  isSolid
                    ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    : 'bg-white/15 border-white/20 text-white hover:bg-white/25'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun size={16} className="text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {/* Admin Button */}
              <Link
                to="/admin/login"
                className="hidden lg:inline-flex group relative items-center gap-2 overflow-hidden"
              >
                <motion.div
                  className="relative flex items-center gap-2 bg-gradient-to-r from-brand-orange via-orange-500 to-brand-green text-white font-black uppercase tracking-wider text-sm px-6 py-3 rounded-xl shadow-[0_10px_20px_rgba(255,153,51,0.3)] border border-orange-400"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 15px 35px -5px rgba(255, 153, 51, 0.6)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  </div>
                  <Shield className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Admin</span>
                  <ExternalLink className="w-3 h-3 relative z-10 opacity-60" />
                </motion.div>
              </Link>

              {/* Mobile Toggle Button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden relative p-3 rounded-2xl transition-all duration-300 shadow-md ${
                  isSolid
                    ? 'text-slate-900 bg-white hover:bg-orange-50 ring-1 ring-orange-200'
                    : 'text-white bg-black/20 hover:bg-white/20 ring-1 ring-white/30 backdrop-blur-md'
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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute top-full left-3 right-3 lg:hidden bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/15 border border-white/40 mt-2 max-h-[80vh] overflow-y-auto custom-scrollbar"
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
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-[15px] font-semibold rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'text-primary bg-gradient-to-r from-primary/10 to-orange-50 ring-1 ring-primary/15 shadow-sm'
                              : 'text-slate-600 hover:text-dark hover:bg-slate-50'
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
                                transition={{ type: 'spring', stiffness: 500 }}
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
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Interface Mode</span>
                  <button
                    onClick={() => setDarkMode(d => !d)}
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
  )
}

export default Navbar
