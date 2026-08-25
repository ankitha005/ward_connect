import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardSignature, Activity, Route, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react'
import useComplaintsStore from '../../store/complaintsStore'
import { BANGALORE_WARDS_DATA } from '../../data/bangaloreWardsData'

const SURVEY_QUESTIONS = [
  {
    id: 'roadQuality',
    title: 'Road & Pavement Quality',
    desc: 'How would you rate the current condition of roads and footpaths in your immediate area?',
    options: ['Excellent', 'Good', 'Needs Minor Repair', 'Poor / Potholes Active'],
    icon: <Route size={24} className="text-slate-400" />
  },
  {
    id: 'safety',
    title: 'Ward Safety & Lighting',
    desc: 'Do you feel the street lighting and general safety in our ward is adequate?',
    options: ['Very Safe', 'Adequate', 'Needs More Streetlights', 'Unsafe at Night'],
    icon: <ShieldAlert size={24} className="text-slate-400" />
  },
  {
    id: 'priorityArea',
    title: 'Top Priority for 2026',
    desc: 'What should be the #1 priority focus for the ward administration in the upcoming months?',
    options: ['Better Garbage Collection', 'Drinking Water Availability', 'Park & Greenery Development', 'Drainage / Flood Management'],
    icon: <Activity size={24} className="text-slate-400" />
  }
]

export default function Survey() {
  const addSurveyResponse = useComplaintsStore(s => s.addSurveyResponse)
  const [step, setStep] = useState(0) // 0 to SURVEY_QUESTIONS.length - 1
  const [submitted, setSubmitted] = useState(false)
  
  const [answers, setAnswers] = useState({})
  const [citizenInfo, setCitizenInfo] = useState({ name: '', ward: 'Chamrajapet' })

  const currentQ = SURVEY_QUESTIONS[step]

  const handleSelectOption = (opt) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))
  }

  const handleNext = () => {
    if (step < SURVEY_QUESTIONS.length) {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    setStep(s => s - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!citizenInfo.name) return
    
    addSurveyResponse({
      citizen: citizenInfo,
      responses: answers
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tight">Feedback Captured</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            Thank you for participating! Your insights directly help our ward leadership prioritize the right projects.
          </p>
          <Link to="/" className="inline-block bg-brand-green text-white font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:shadow-green-200 transition-all">
            Return Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-12 relative overflow-hidden flex flex-col justify-center">
      <div className="max-w-3xl w-full mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100/50 border border-green-200 text-brand-green font-black text-xs uppercase tracking-widest mb-4">
            <ClipboardSignature size={14} /> Official Initiative
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight mb-3">
            Ward Development <span className="text-brand-green">Survey</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Your opinion matters. Take this 1-minute survey to help us shape the future development goals for our locality.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 max-w-md mx-auto mb-10">
          {[...SURVEY_QUESTIONS, { id: 'final' }].map((_, idx) => (
            <div key={idx} className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <motion.div 
                className="h-full bg-brand-green"
                initial={{ width: 0 }}
                animate={{ width: step >= idx ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100 min-h-[400px] flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step < SURVEY_QUESTIONS.length ? (
              <motion.div 
                key={currentQ.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                    {currentQ.icon}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">{currentQ.title}</h2>
                  <p className="text-slate-500 font-medium">{currentQ.desc}</p>
                </div>

                <div className="space-y-3 mt-auto">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id] === opt
                    return (
                      <button 
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 font-bold transition-all ${
                          isSelected 
                            ? 'border-brand-green bg-green-50 text-brand-green' 
                            : 'border-slate-100 bg-white text-slate-600 hover:border-green-200 hover:bg-green-50/30'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="final"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Final Step</h2>
                  <p className="text-slate-500 font-medium">Please provide your basic details to validate this survey response.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Name</label>
                    <input type="text" required
                      value={citizenInfo.name} onChange={e => setCitizenInfo(c => ({...c, name: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-brand-green focus:ring-1 focus:ring-brand-green"
                      placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ward</label>
                    <select 
                      value={citizenInfo.ward} onChange={e => setCitizenInfo(c => ({...c, ward: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-brand-green"
                    >
                      {BANGALORE_WARDS_DATA.map(w => (
                        <option key={w.slNo} value={w.constituency}>
                          {w.constituency} ({w.corp} Corp — #{w.slNo})
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <button 
              onClick={handleBack}
              className={`flex items-center gap-2 font-bold px-4 py-2 ${step === 0 ? 'invisible' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            
            {step < SURVEY_QUESTIONS.length ? (
              <button 
                onClick={handleNext}
                disabled={!answers[currentQ.id]}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={!citizenInfo.name}
                className="flex items-center gap-2 bg-brand-green text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all disabled:opacity-50"
              >
                Submit Survey <CheckCircle2 size={16} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
