import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp, MapPin, Phone, ShieldAlert, FileText, Fingerprint, Star, ThumbsUp } from 'lucide-react'
import useComplaintsStore from '../../store/complaintsStore'
import { BANGALORE_WARDS_DATA } from '../../data/bangaloreWardsData'

const WARD_LABELS = Object.fromEntries(
  BANGALORE_WARDS_DATA.map(w => [w.constituency, `${w.constituency} (${w.corp} Corp — #${w.slNo})`])
)

const STATUS_CONFIG = {
  'Pending':     { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Clock size={16} /> },
  'In Progress': { color: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500',  icon: <AlertCircle size={16} /> },
  'Resolved':    { color: 'bg-green-100 text-green-700 border-green-200',dot: 'bg-green-500', icon: <CheckCircle2 size={16} /> },
  'Rejected':    { color: 'bg-red-100 text-red-600 border-red-200',      dot: 'bg-red-500',   icon: <XCircle size={16} /> },
}

export default function TrackComplaint() {
  const complaints = useComplaintsStore(s => s.complaints)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('id') // 'id' | 'voter'
  const [voterId, setVoterId] = useState('')
  const [ward, setWard] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [ratings, setRatings] = useState({}) // complaintId -> { stars, submitted }
  const [hoverRating, setHoverRating] = useState({}) // complaintId -> hoveredStar

  const handleSearch = () => {
    setNotFound(false); setResult(null)
    if (mode === 'id') {
      const found = complaints.find(c => c.id.toLowerCase() === search.trim().toLowerCase())
      found ? setResult([found]) : setNotFound(true)
    } else {
      const found = complaints.filter(c =>
        c.voterId.toLowerCase() === voterId.trim().toLowerCase() && c.ward === ward
      )
      found.length ? setResult(found) : setNotFound(true)
    }
  }

  const display = result ?? []

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-16 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 border border-slate-300 text-slate-700 font-black text-xs uppercase tracking-widest mb-4">
            <Search size={14} /> Live Status Tracker
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
            Track Your <span className="text-gradient-brand">Complaint</span>
          </h1>
          <p className="text-slate-600 font-medium max-w-xl mx-auto">
            Stay updated on the progress of your grievance. Enter your Complaint Reference ID or Voter details below.
          </p>
        </div>

        {/* Search Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10"
        >
          {/* Toggle */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 w-fit mx-auto border border-slate-100">
            {['id', 'voter'].map(m => (
              <button key={m} onClick={() => { setMode(m); setResult(null); setNotFound(false) }}
                className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === m 
                  ? 'bg-white shadow-md text-brand-orange' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}>
                {m === 'id' ? 'Complaint ID' : 'Voter Details'}
              </button>
            ))}
          </div>

          {mode === 'id' ? (
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" size={20} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all font-mono font-bold text-slate-700 tracking-wider text-lg"
                  placeholder="e.g. BRC-2026-ABC..."
                />
              </div>
              <button onClick={handleSearch} className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-slate-300 transition-all active:scale-95">
                Track
              </button>
            </div>
          ) : (
            <div className="space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Fingerprint size={14}/> Voter ID Number</label>
                <input value={voterId} onChange={e => setVoterId(e.target.value.toUpperCase())} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all font-mono font-bold text-slate-700 tracking-wider" 
                  placeholder="e.g. ABC1234567" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><MapPin size={14}/> Select Ward</label>
                <select value={ward} onChange={e => setWard(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all font-bold text-slate-700">
                  <option value="">-- Choose Ward --</option>
                  {BANGALORE_WARDS_DATA.map(w => (
                    <option key={w.slNo} value={w.constituency}>
                      {w.constituency} ({w.corp} Corp — #{w.slNo})
                    </option>
                  ))}
                </select>
              </div>
              <button onClick={handleSearch} disabled={!voterId || !ward} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 mt-2">
                Find Complaints
              </button>
            </div>
          )}
        </motion.div>

        {/* Not Found */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center text-red-600 font-bold flex items-center justify-center gap-2 max-w-2xl mx-auto shadow-sm">
              <ShieldAlert size={20} /> We couldn't find any complaints matching those details.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-6">
          {display.map((c, idx) => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG['Pending']
            const isOpen = expanded === c.id
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                
                {/* Header (Always Visible) */}
                <div 
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{c.category}</div>
                      <div className="text-xs font-bold text-slate-400">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="font-mono font-black text-slate-800 text-2xl tracking-tight">{c.id}</div>
                    <div className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-1.5"><MapPin size={14}/> {WARD_LABELS[c.ward]}</div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-5">
                    <span className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border ${statusCfg.color}`}>
                      {statusCfg.icon} {c.status}
                    </span>
                    <div className={`p-2 rounded-full border transition-all ${isOpen ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'}`}>
                      <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8">
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Priority Level</span>
                            <span className={`font-black uppercase ${c.priority === 'Urgent' ? 'text-red-500' : c.priority === 'High' ? 'text-orange-500' : 'text-slate-700'}`}>{c.priority}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Specific Area</span>
                            <span className="font-bold text-slate-700 line-clamp-1">{c.area || 'Not Specified'}</span>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Contact Mobile</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1.5"><Phone size={14} className="text-green-600"/> +91 {c.mobile}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"><FileText size={14}/> Complaint Description</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{c.description}</p>
                          {c.photoData && (
                            <div className="mt-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Attached Evidence</span>
                              <img src={c.photoData} alt="Complaint" className="h-32 w-auto object-cover rounded-xl shadow-sm border border-slate-200" />
                            </div>
                          )}
                        </div>

                        {/* Timeline Visualization */}
                        <div>
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6"><Clock size={14}/> Status Timeline</span>
                          <div className="relative pl-6 space-y-8">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-5 left-8 w-[2px] bg-slate-200 rounded-full" />
                            
                            {c.statusHistory.map((historyItem, i) => {
                              const isLast = i === c.statusHistory.length - 1
                              const hCfg = STATUS_CONFIG[historyItem.status] || STATUS_CONFIG['Pending']
                              
                              return (
                                <div key={i} className="relative flex gap-6 z-10">
                                  {/* Dot */}
                                  <div className={`w-5 h-5 mt-0.5 shrink-0 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${isLast ? hCfg.dot : 'bg-slate-300'}`}>
                                    {isLast && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className={`bg-white p-4 rounded-2xl border ${isLast ? hCfg.color.split(' ')[2] : 'border-slate-100'} shadow-sm flex-1`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                      <h4 className={`font-black uppercase tracking-wide text-sm ${isLast ? hCfg.color.split(' ')[1] : 'text-slate-600'}`}>{historyItem.status}</h4>
                                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md w-fit">
                                        {new Date(historyItem.date).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>
                                    {historyItem.note ? (
                                      <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{historyItem.note}</p>
                                    ) : (
                                      <p className="text-xs font-semibold text-slate-400 italic">No additional notes provided by administration.</p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Feedback / Rating (only for Resolved) */}
                        {c.status === 'Resolved' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5"
                          >
                            {ratings[c.id]?.submitted ? (
                              <div className="flex flex-col items-center gap-2 py-2">
                                <ThumbsUp size={28} className="text-green-500" />
                                <p className="font-black text-green-700 text-base">Thank you for your feedback!</p>
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={20} fill={s <= (ratings[c.id]?.stars || 0) ? '#f59e0b' : 'none'} stroke={s <= (ratings[c.id]?.stars || 0) ? '#f59e0b' : '#d1d5db'} />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-3">Rate the Resolution Quality</p>
                                <div className="flex gap-2 mb-4">
                                  {[1,2,3,4,5].map(star => (
                                    <button
                                      key={star}
                                      onMouseEnter={() => setHoverRating(h => ({ ...h, [c.id]: star }))}
                                      onMouseLeave={() => setHoverRating(h => ({ ...h, [c.id]: 0 }))}
                                      onClick={() => setRatings(r => ({ ...r, [c.id]: { ...r[c.id], stars: star } }))}
                                      className="transition-transform hover:scale-125"
                                    >
                                      <Star
                                        size={28}
                                        fill={(hoverRating[c.id] || ratings[c.id]?.stars || 0) >= star ? '#f59e0b' : 'none'}
                                        stroke={(hoverRating[c.id] || ratings[c.id]?.stars || 0) >= star ? '#f59e0b' : '#d1d5db'}
                                      />
                                    </button>
                                  ))}
                                </div>
                                <button
                                  disabled={!ratings[c.id]?.stars}
                                  onClick={() => setRatings(r => ({ ...r, [c.id]: { ...r[c.id], submitted: true } }))}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2 rounded-xl disabled:opacity-40 transition-all"
                                >
                                  Submit Rating
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
