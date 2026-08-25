import { motion } from 'framer-motion'
import { Phone, Search, ChevronRight, MapPin, ExternalLink, Layers, Building2, Map as MapIcon, Send } from 'lucide-react'
import { useState } from 'react'
import { DIRECTORY_DATA } from '../../data/directoryData'
import { BANGALORE_WARDS_DATA } from '../../data/bangaloreWardsData'
import { useNavigate } from 'react-router-dom'

// Extract unique groups
const GROUPS = [...new Set(DIRECTORY_DATA.map(d => d.group))]
const CORPS = ['All Corporations', 'Central', 'North', 'East', 'South', 'West']

const WardDirectory = () => {
  const [mainTab, setMainTab] = useState('maps') // Default to 'maps' to highlight the 33 ward maps
  const [searchTerm, setSearchTerm] = useState('')
  const [activeGroup, setActiveGroup] = useState('All')
  
  const [mapSearch, setMapSearch] = useState('')
  const [activeCorp, setActiveCorp] = useState('All Corporations')
  const navigate = useNavigate()

  // Filter logic for officials
  const filteredData = DIRECTORY_DATA.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = activeGroup === 'All' || item.group === activeGroup
    return matchesSearch && matchesGroup
  })
  const renderedGroups = GROUPS.filter(g => activeGroup === 'All' || activeGroup === g)

  // Filter logic for 33 Bangalore Wards
  const filteredWards = BANGALORE_WARDS_DATA.filter(w => {
    const matchesSearch = w.constituency.toLowerCase().includes(mapSearch.toLowerCase()) || w.corp.toLowerCase().includes(mapSearch.toLowerCase()) || w.slNo.includes(mapSearch)
    const matchesCorp = activeCorp === 'All Corporations' || w.corp === activeCorp
    return matchesSearch && matchesCorp
  })

  const getCorpColor = (corp) => {
    switch (corp) {
      case 'Central': return 'bg-red-500 text-white border-red-600'
      case 'North': return 'bg-amber-500 text-white border-amber-600'
      case 'East': return 'bg-blue-500 text-white border-blue-600'
      case 'South': return 'bg-emerald-500 text-white border-emerald-600'
      case 'West': return 'bg-purple-500 text-white border-purple-600'
      default: return 'bg-slate-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans">
      
      {/* ── HEADER & SEARCH ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-dark tracking-tight mb-4">
              {mainTab === 'maps' ? '🗺️ Bangalore Ward Maps & Directory' : '👷 Official Civic Directory'}
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-500">
              {mainTab === 'maps' 
                ? 'Explore all 33 Assembly Constituencies across 5 Municipal Corporations in Bengaluru. View official GIS maps and report ward-specific grievances.'
                : 'Department contacts, engineering officials, and administrative leadership for Bengaluru Municipal Wards.'}
            </p>

            {/* Top Tab Switcher */}
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mt-8 shadow-inner flex-wrap justify-center gap-1">
              <button
                onClick={() => setMainTab('maps')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all ${
                  mainTab === 'maps'
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-500/20 scale-102'
                    : 'text-slate-600 hover:text-dark'
                }`}
              >
                <MapIcon size={18} /> Bangalore Wards & Maps (33)
              </button>
              <button
                onClick={() => setMainTab('officials')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all ${
                  mainTab === 'officials'
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md shadow-red-500/20 scale-102'
                    : 'text-slate-600 hover:text-dark'
                }`}
              >
                <Building2 size={18} /> Ward Officers Directory
              </button>
            </div>
          </motion.div>

          {mainTab === 'maps' ? (
            <>
              {/* Search Bar for Wards */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by constituency (e.g. Jayanagar, Malleshwaram, Yelahanka)..."
                  value={mapSearch}
                  onChange={e => setMapSearch(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-dark font-medium rounded-full py-4 pl-12 pr-6 outline-none focus:border-red-500 focus:bg-white transition-all shadow-input"
                />
              </motion.div>

              {/* Corporation Filter Pills */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {CORPS.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCorp(c)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      activeCorp === c
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/20 scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'All Corporations' ? '🏙️ All Corporations (33)' : `${c} Corporation`}
                  </button>
                ))}
              </motion.div>
            </>
          ) : (
            <>
              {/* Search Bar for Officials */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, department, or role..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-dark font-medium rounded-full py-4 pl-12 pr-6 outline-none focus:border-red-500 focus:bg-white transition-all shadow-input"
                />
              </motion.div>

              {/* Filter Pills for Officials */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setActiveGroup('All')}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeGroup === 'All' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  All Contacts
                </button>
                {GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveGroup(g)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeGroup === g ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {g}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── TAB 1: 33 WARDS & CONSTITUENCIES MAPS ── */}
      {mainTab === 'maps' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark flex items-center gap-2">
                🏙️ Assembly Constituencies & GIS Maps
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Showing {filteredWards.length} of 33 constituencies. Click "View Ward Maps" to launch live geographic boundary data.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Corporations:</span>
              <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold">Central</span>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">North</span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">East</span>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">South</span>
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">West</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredWards.map((item) => (
              <motion.div
                key={item.slNo + item.constituency}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-5 border-2 border-slate-100 hover:border-red-500/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                      #{item.slNo}
                    </span>
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs ${getCorpColor(item.corp)}`}>
                      {item.corp} Corp
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-dark mb-1 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                    <MapPin size={18} className="text-red-500 shrink-0" />
                    {item.constituency}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mb-6">
                    Bangalore Municipal Jurisdiction
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <a
                    href={item.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all group-hover:scale-102"
                  >
                    <span>🗺️ View Ward Maps</span>
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => navigate(`/complaints?constituency=${encodeURIComponent(item.constituency)}&corp=${encodeURIComponent(item.corp)}`)}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-red-200 transition-colors cursor-pointer"
                  >
                    <Send size={12} /> File Issue Here
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredWards.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold text-dark">No constituencies found matching "{mapSearch}"</h3>
              <p className="text-slate-500 text-sm mt-1">Try selecting 'All Corporations' or search for names like Jayanagar, Malleshwaram, Hebbal.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DIRECTORY LISTING ── */}
      {mainTab === 'officials' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {renderedGroups.map((group, groupIdx) => {
            const itemsInGroup = filteredData.filter(d => d.group === group)
            if (itemsInGroup.length === 0) return null

            return (
              <motion.div key={group} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIdx * 0.1 }} className="mb-12">
                <h2 className="text-2xl font-black text-dark mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-600 to-amber-500 rounded-full" />
                  {group}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {itemsInGroup.map((item, i) => (
                    <motion.div
                      key={item.name + i}
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-red-500/10 transition-all group overflow-hidden relative"
                    >
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-red-600 to-amber-500 text-white shadow-inner`}>
                          <item.icon size={20} className="drop-shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-black tracking-wider uppercase text-red-600 mb-1">{item.role}</div>
                          <h3 className="font-bold text-dark leading-tight mb-3 text-[15px] line-clamp-2">{item.name}</h3>
                          
                          <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 group-hover:border-red-500/20 group-hover:bg-red-50/50">
                            <Phone size={14} className="text-red-600" />
                            {item.phone}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}

          {filteredData.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-dark">No contacts found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WardDirectory
