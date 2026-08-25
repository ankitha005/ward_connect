import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Camera, MapPin, Send, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useComplaintsStore from '../store/complaintsStore'

const QuickReportWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-72 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_20px_60px_rgba(249,115,22,0.3)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">Quick Action</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1 transition-all">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-4 leading-relaxed">
              Report an urgent issue or view the latest activities in Bengaluru Municipal Wards.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setIsOpen(false); navigate('/complaints') }}
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary hover:to-orange-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Camera size={18} /> File a Grievance
              </button>
              <button
                onClick={() => { setIsOpen(false); navigate('/activity') }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Navigation size={18} /> View Ward Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(249,115,22,0.4)] text-white relative border-2 border-white/20 transition-all ${
          isOpen ? 'bg-slate-800 rotate-45' : 'bg-gradient-to-tr from-primary to-orange-400'
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity pointer-events-none" />
        <Plus size={32} strokeWidth={2.5} />
      </motion.button>
    </div>
  )
}

export default QuickReportWidget
