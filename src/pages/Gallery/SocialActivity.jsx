import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Clock, MapPin, X, CheckCircle2, Info, ArrowRight, Sparkles, Filter } from 'lucide-react'
import { useState, useMemo, useRef } from 'react'
import useComplaintsStore from '../../store/complaintsStore'

function timeAgo(iso) {
  if (!iso) return 'Recently'
  const time = new Date(iso).getTime()
  if (isNaN(time)) return 'Recently'
  const diff = Date.now() - time
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const WARD_LABELS = {
  chamrajapet: 'Chamrajapet',
  jayanagar: 'Jayanagar',
}

const CATEGORY_COLORS = {
  Infrastructure: 'from-blue-500 to-indigo-600',
  Health: 'from-rose-500 to-pink-600',
  Environment: 'from-emerald-500 to-teal-600',
  Sanitation: 'from-amber-500 to-orange-600',
  Education: 'from-violet-500 to-purple-600',
  Default: 'from-primary to-orange-600',
}

function getCategoryGradient(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.Default
}

const BeforeAfterSlider = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef(null)

  const handleMove = (clientX) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setSliderPos(percent)
  }

  const onMouseMove = (e) => {
    if (isDragging) handleMove(e.clientX)
  }
  const onTouchMove = (e) => {
    if (isDragging) handleMove(e.touches[0].clientX)
  }

  return (
    <div 
      ref={sliderRef}
      className={`relative w-full h-full overflow-hidden select-none group/slider ${isDragging ? 'cursor-grabbing' : 'cursor-ew-resize'}`}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchEnd={() => setIsDragging(false)}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX) }}
    >
      {/* Before Image (Background) */}
      <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl z-0 pointer-events-none transition-opacity duration-300 group-hover/slider:opacity-0 sm:group-hover/slider:opacity-100">
        <X size={10} /> Before
      </div>

      {/* After Image (Clipped overlay) */}
      <div 
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-opacity duration-300 group-hover/slider:opacity-0 sm:group-hover/slider:opacity-100">
          <CheckCircle2 size={10} /> After
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-1 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
           <div className={`w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-slate-200 text-slate-800 absolute transition-all duration-300 ${isDragging ? 'scale-110 bg-primary border-primary text-white' : 'group-hover/slider:scale-110'}`}>
              <div className="flex gap-0.5">
                 <div className="w-[2px] h-3 bg-current rounded-full" />
                 <div className="w-[2px] h-3 bg-current rounded-full" />
                 <div className="w-[2px] h-3 bg-current rounded-full" />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

const SocialActivity = () => {
  const { beforeAfter } = useComplaintsStore()
  const [selected, setSelected] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  const categories = useMemo(() => {
    const cats = new Set(beforeAfter.map(i => i.category).filter(Boolean))
    return ['All', ...cats]
  }, [beforeAfter])

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return beforeAfter
    return beforeAfter.filter(i => i.category === activeFilter)
  }, [beforeAfter, activeFilter])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ PREMIUM LIGHT HERO ══ */}
      <section className="relative overflow-hidden pt-36 pb-24 flex items-center bg-white border-b-8 border-brand-orange">
        {/* Animated BG orbs */}
        <motion.div animate={{ scale: [1,1.3,1], rotate: [0,45,0] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />
        <motion.div animate={{ scale: [1,1.5,1], x: [0,60,0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-emerald-100/50 rounded-full blur-[100px] pointer-events-none" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 border border-orange-200 text-brand-orange font-bold text-sm mb-8">
            <Sparkles size={16} className="animate-pulse" /> Live Progress Gallery
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1] uppercase">
            Our Work, <span className="text-gradient-brand">Your Results</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-slate-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Real issues. Real solutions. Documented before & after by your ward administration for full transparency.
          </motion.p>

          {/* Live count pills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { label: 'Activities Posted', val: beforeAfter.length },
              { label: 'Issues Resolved', val: beforeAfter.filter(b => !b.type).length },
              { label: 'Volunteers Engaged', val: '200+' }
            ].map((s, i) => (
              <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-2xl px-8 py-4 text-center">
                <div className="text-3xl font-black text-brand-orange">{s.val}</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FILTER CHIPS ══ */}
      {categories.length > 1 && (
        <div className="sticky top-[73px] z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            <Filter size={18} className="text-slate-400 shrink-0 mr-1" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all border shadow-sm ${
                  activeFilter === cat
                    ? 'bg-brand-orange text-white border-brand-orange shadow-orange-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ GRID ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28">
            <div className="w-28 h-28 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <Camera size={48} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Activities Yet</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">As ward activities are published and complaints are resolved with photos, they will appear here automatically.</p>
          </motion.div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="break-inside-avoid group cursor-pointer rounded-3xl overflow-hidden bg-white border border-slate-100 hover:border-orange-200 shadow-md hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-400 mb-6"
                onClick={() => setSelected(item)}
              >
                {/* Image area */}
                <div className="relative w-full overflow-hidden">
                  {item.type === 'standalone' ? (
                    <div className="relative">
                      <img
                        src={(item.images && item.images[0]) ? item.images[0] : (item.after || 'https://images.unsplash.com/photo-1544027993-37dbfe43552e?auto=format&fit=crop&q=80&w=600')}
                        alt={item.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {item.images && item.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-slate-200">
                          +{item.images.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64">
                      <BeforeAfterSlider before={item.before} after={item.after} />
                    </div>
                  )}
                  {/* Gradient overlay at bottom of image */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>

                {/* Card content */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-black text-white bg-gradient-to-r ${getCategoryGradient(item.category)} shadow-sm`}>
                      {item.category || 'Activity'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                      <Clock size={12} /> {timeAgo(item.date)}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {(item.story || item.description) && (
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 font-medium">{item.story || item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-green" /> {item.type === 'standalone' ? 'Ward Activity' : (WARD_LABELS[item.ward] || 'ADDA_360 Ward')}
                    </span>
                    <span className="text-brand-orange text-xs font-black uppercase flex items-center gap-1 group-hover:gap-2 transition-all bg-orange-50 px-3 py-1.5 rounded-lg">
                      View <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ══ CINEMA LIGHTBOX ══ */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close btn */}
              <button onClick={() => setSelected(null)}
                className="absolute top-5 right-5 z-30 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-2.5 rounded-full transition-all shadow-lg border border-white/20">
                <X size={18} />
              </button>

              {/* Image panel */}
              <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar border-r border-slate-100">
                {selected.type === 'standalone' ? (
                  <div className="p-6 flex flex-col gap-6">
                    {(selected.images && selected.images.length > 0 ? selected.images : [selected.after]).filter(Boolean).map((src, idx) => (
                      <img key={idx} src={src} alt={`slide-${idx}`}
                        className="w-full rounded-2xl shadow-md border border-slate-200 object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[500px]">
                    <BeforeAfterSlider before={selected.before} after={selected.after} />
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="md:w-80 bg-white p-8 flex flex-col overflow-y-auto">
                {/* Category badge */}
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r ${getCategoryGradient(selected.category)} mb-6 w-max shadow-md`}>
                  {selected.category || 'Activity'}
                </span>

                <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4 uppercase">{selected.title}</h2>

                {selected.story && (
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">{selected.story}</p>
                )}
                {selected.description && (
                  <div className="bg-orange-50 border-l-[6px] border-brand-orange pl-4 pr-3 py-4 rounded-r-xl mb-6 shadow-sm">
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{selected.description}</p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 bg-green-100 rounded-lg text-brand-green"><MapPin size={16} /></div>
                    <span className="text-slate-700 font-bold">
                      {selected.type === 'standalone' ? 'Ward Activity' : (WARD_LABELS[selected.ward] || 'ADDA_360 Ward')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-1.5 bg-orange-100 rounded-lg text-brand-orange"><Clock size={16} /></div>
                    <span className="text-slate-700 font-bold">{timeAgo(selected.date)}</span>
                  </div>
                  {selected.id && selected.type !== 'standalone' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Info size={16} /></div>
                      <span className="text-slate-700 font-bold">Ref: #{selected.id}</span>
                    </div>
                  )}
                  {selected.tags && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 mt-2">
                      {selected.tags.split(',').map((t, i) => (
                        <span key={i} className="bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button className="mt-auto w-full bg-brand-orange text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 transition-all">
                  Share Impact <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SocialActivity
