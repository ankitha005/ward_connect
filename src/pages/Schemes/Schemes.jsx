import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowRight, UserCircle, GraduationCap, Briefcase, HeartPulse, Tractor, X, CheckCircle2, Navigation2, FileText } from 'lucide-react'
import { useState } from 'react'

const Schemes = () => {
  const [filter, setFilter] = useState('All')
  const [selectedScheme, setSelectedScheme] = useState(null)

  const categories = [
    { name: 'All', icon: <Search size={16} /> },
    { name: 'Farmers', icon: <Tractor size={16} /> },
    { name: 'Students', icon: <GraduationCap size={16} /> },
    { name: 'Women', icon: <HeartPulse size={16} /> },
    { name: 'Health', icon: <HeartPulse size={16} /> },
    { name: 'Business', icon: <Briefcase size={16} /> },
  ]

  const schemes = [
    { 
      id: 1,
      title: 'Pradhan Mantri Awas Yojana (Urban)', 
      category: 'General', 
      benefits: 'Home loan subsidies up to ₹2.67 Lakhs for constructing, purchasing or renovating a house.', 
      eligibility: 'EWS (Annual income up to ₹3L), LIG (₹3L-₹6L), and MIG categories. Must not own a pucca house anywhere in India.', 
      img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600',
      details: 'PMAY-U ensures "Housing for All" by providing central assistance to implementing agencies through States/UTs. Beneficiaries receive a direct interest subsidy (CLSS) on housing loans from banks.',
      documents: ['Aadhaar Card', 'Income Certificate', 'PAN Card', 'Bank Account Details'],
      url: 'https://pmaymis.gov.in/'
    },
    { 
      id: 2,
      title: 'PM Kisan Samman Nidhi', 
      category: 'Farmers', 
      benefits: '₹6,000 annual financial assistance deposited directly into bank accounts in 3 equal installments of ₹2,000.', 
      eligibility: 'All landholding farmer families across the country, subject to certain exclusion criteria related to higher income status.', 
      img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=600',
      details: 'A central sector scheme with 100% funding from Government of India. It aims to supplement the financial needs of farmers in procuring various inputs to ensure proper crop health and appropriate yields.',
      documents: ['Aadhaar Card', 'Land holding documents (RTC)', 'Bank Passbook'],
      url: 'https://pmkisan.gov.in/'
    },
    { 
      id: 3,
      title: 'Sukanya Samriddhi Yojana (SSY)', 
      category: 'Women', 
      benefits: 'High-interest tax-free savings account (currently 8.2%) dedicated to the education and marriage expenses of girl children.', 
      eligibility: 'Parents or legal guardians of a girl child under 10 years of age. Maximum 2 accounts per family.', 
      img: 'https://images.unsplash.com/photo-1536640712247-c0502019a281?auto=format&fit=crop&q=80&w=600',
      details: 'Part of the "Beti Bachao Beti Padhao" campaign, SSY allows deposits up to ₹1.5 Lakhs annually, qualifying for Section 80C tax benefits. The account matures 21 years after opening.',
      documents: ['Girl Child\'s Birth Certificate', 'Parent\'s Identity & Address Proof'],
      url: 'https://www.nsiindia.gov.in/'
    },
    { 
      id: 4,
      title: 'PM Mudra Yojana', 
      category: 'Business', 
      benefits: 'Collateral-free loans up to ₹10 Lakhs categorized into Shishu (₹50K), Kishore (₹5L) and Tarun (₹10L).', 
      eligibility: 'Any Indian citizen running a non-corporate, non-farm small/micro enterprise involved in income generation.', 
      img: 'https://images.unsplash.com/photo-1454160249fb0-f19277636e08?auto=format&fit=crop&q=80&w=600',
      details: 'MUDRA (Micro Units Development & Refinance Agency) supports the "Fund the Unfunded" initiative. It provides financial support to small manufacturing units, shopkeepers, fruit/vegetable sellers, and artisans.',
      documents: ['Aadhaar/PAN', 'Business License/Registration', 'Project Report for larger loans'],
      url: 'https://www.mudra.org.in/'
    },
    { 
      id: 5,
      title: 'Ayushman Bharat (PM-JAY)', 
      category: 'Health', 
      benefits: 'Cashless health insurance cover of up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.', 
      eligibility: 'Vulnerable and low-income families identified by the Socio-Economic Caste Census (SECC) 2011 data.', 
      img: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600',
      details: 'The world\'s largest government-funded healthcare program. It covers 3 days of pre-hospitalization, 15 days of post-hospitalization expenses, diagnostics, and medicines.',
      documents: ['Aadhaar Card', 'Ration Card', 'Active Mobile Number'],
      url: 'https://pmjay.gov.in/'
    },
    { 
      id: 6,
      title: 'PM SVANidhi', 
      category: 'Business', 
      benefits: 'Initial working capital collateral-free loan of ₹10,000, which can be enhanced to ₹20,000 and ₹50k on timely repayment.', 
      eligibility: 'Street vendors, hawkers, and informal merchants operating in urban areas.', 
      img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600',
      details: 'Launched during the pandemic to help street vendors resume their livelihoods. The scheme incentivizes digital transactions through cashback and provides high interest subsidies (7%).',
      documents: ['Vending Certificate / ID Card', 'Aadhaar Card linked to Mobile'],
      url: 'https://pmsvanidhi.mohua.gov.in/'
    },
  ]

  const filteredSchemes = filter === 'All' ? schemes : schemes.filter(s => s.category === filter)

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-dark mb-4">Govt Scheme Explorer</h1>
          <p className="text-slate-500 font-medium text-lg">Detailed information, eligibility, and application steps for major government welfare schemes.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setFilter(cat.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                filter === cat.name 
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Scheme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchemes.map((scheme) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 group flex flex-col cursor-pointer"
            >
              <div className="h-56 overflow-hidden relative">
                <img src={scheme.img} alt={scheme.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                  {scheme.category}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-xl font-extrabold text-dark mb-4 group-hover:text-primary transition-colors leading-tight">{scheme.title}</h3>
                <div className="space-y-4 mb-8 flex-grow">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 line-clamp-1">Key Benefits</div>
                    <p className="text-sm text-slate-600 font-medium line-clamp-2">{scheme.benefits}</p>
                  </div>
                </div>
                <button className="w-full btn-outline border-slate-200 text-primary hover:!bg-primary hover:!text-white hover:!border-primary flex items-center justify-center gap-2 group/btn font-bold">
                  View Full Details <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Scheme Detail Modal */}
      <AnimatePresence>
        {selectedScheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" onClick={() => setSelectedScheme(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col relative"
            >
              {/* Header Image */}
              <div className="h-48 md:h-64 relative shrink-0">
                <img src={selectedScheme.img} alt={selectedScheme.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors backdrop-blur">
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-primary/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm mb-3 inline-block backdrop-blur-sm">
                    {selectedScheme.category} Scheme
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{selectedScheme.title}</h2>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 md:p-10 flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  
                  {/* Left Col (Main Text) */}
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-dark flex items-center gap-2 mb-3">
                        <FileText size={20} className="text-primary" /> About the Scheme
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium text-[15px]">{selectedScheme.details}</p>
                    </section>
                    
                    <section className="bg-green-50/50 border border-green-100 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-green-800 flex items-center gap-2 mb-3">
                        <CheckCircle2 size={20} className="text-green-600" /> Key Benefits
                      </h3>
                      <p className="text-green-700 leading-relaxed font-medium">{selectedScheme.benefits}</p>
                    </section>

                    <section className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-3">
                        <UserCircle size={20} className="text-amber-600" /> Eligibility Criteria
                      </h3>
                      <p className="text-amber-700 leading-relaxed font-medium">{selectedScheme.eligibility}</p>
                    </section>
                  </div>

                  {/* Right Col (Required Docs & Action) */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
                      <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 mb-4">Required Documents</h3>
                      <ul className="space-y-3">
                        {selectedScheme.documents.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                             <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" /> {doc}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-center text-white">
                      <Navigation2 size={32} className="mx-auto mb-4 text-primary" />
                      <h3 className="font-bold text-lg mb-2">Ready to Apply?</h3>
                      <p className="text-xs text-slate-400 font-medium mb-6">You can apply directly online through the official government portal.</p>
                      <a href={selectedScheme.url} target="_blank" rel="noopener noreferrer" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary/20 block text-center">
                        Visit Official Website
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Schemes
