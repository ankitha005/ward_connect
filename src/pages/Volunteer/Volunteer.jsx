import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, UserPlus, Phone, MapPin, HandHeart, Briefcase, GraduationCap, Users } from 'lucide-react'
import useComplaintsStore from '../../store/complaintsStore'

const SKILL_AREAS = [
  { id: 'campaign', label: 'Campaigning & Outreach', icon: <Users size={18} /> },
  { id: 'social', label: 'Social Media / IT', icon: <Phone size={18} /> },
  { id: 'event', label: 'Event Management', icon: <Briefcase size={18} /> },
  { id: 'survey', label: 'Surveys & Data Collection', icon: <MapPin size={18} /> },
  { id: 'community', label: 'Community Service', icon: <HandHeart size={18} /> },
  { id: 'student', label: 'Student Wing (ABVP)', icon: <GraduationCap size={18} /> },
]

export default function Volunteer() {
  const addVolunteer = useComplaintsStore(s => s.addVolunteer)
  const [submitted, setSubmitted] = useState(false)
  
  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    ward: 'Chamrajapet',
    age: '',
    skills: []
  })

  const handleToggleSkill = (skillId) => {
    setForm(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId]
      return { ...prev, skills }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.fullName || !form.mobile || form.skills.length === 0) return
    
    addVolunteer(form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Welcome Aboard!</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            Thank you for stepping up to serve your community. Our ward coordinator will contact you shortly regarding upcoming activities.
          </p>
          <Link to="/" className="inline-block bg-brand-orange text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all">
            Return Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-16 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 border border-orange-200 text-brand-orange font-black text-xs uppercase tracking-widest mb-4">
            <UserPlus size={14} /> Join The Movement
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
            Volunteer <span className="text-gradient-brand">Registration</span>
          </h1>
          <p className="text-slate-600 font-medium max-w-xl mx-auto">
            Become an active participant in your ward's development. Register as a volunteer to help drive positive change in your community.
          </p>
        </div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
              <input type="text" required
                value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-medium text-slate-900"
                placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mobile Number *</label>
              <input type="tel" required pattern="[0-9]{10}"
                value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-medium text-slate-900"
                placeholder="10-digit number" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ward / Area</label>
              <select 
                value={form.ward} onChange={e => setForm(f => ({...f, ward: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-orange font-medium text-slate-900"
              >
                <option value="Chamrajapet">Ward 141 - Chamrajapet</option>
                <option value="Jayanagar">Ward 123 - Jayanagar</option>
                <option value="Hebbal">Ward 150 - Hebbal</option>
                <option value="Other">Other Ward</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Age</label>
              <input type="number" 
                value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all font-medium text-slate-900"
                placeholder="Your age" />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Areas of Interest (Select multiple) *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SKILL_AREAS.map(skill => {
                const isActive = form.skills.includes(skill.id)
                return (
                  <button type="button" key={skill.id}
                    onClick={() => handleToggleSkill(skill.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isActive 
                      ? 'bg-orange-50 border-brand-orange text-brand-orange shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={isActive ? 'text-brand-orange' : 'text-slate-400'}>{skill.icon}</div>
                    <span className="text-sm font-bold">{skill.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button 
             type="submit" 
             disabled={!form.fullName || !form.mobile || form.skills.length === 0}
             className="w-full bg-gradient-to-r from-brand-orange to-[#e68a2e] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:shadow-orange-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             <UserPlus size={18} /> Register as Volunteer
          </button>
        </motion.form>
      </div>
    </div>
  )
}
