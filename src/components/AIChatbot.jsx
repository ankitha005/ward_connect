import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Sparkles, Bot, User, HelpCircle, Phone, MapPin, ChevronRight, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { DIRECTORY_DATA } from '../data/directoryData'

const QUICK_QUERIES = [
  { label: '🛣️ Report Road/Pothole Issue', text: 'How do I report a pothole or road maintenance issue?' },
  { label: '👷 Who is my Ward Engineer?', text: 'Who is the concerned official for water supply and drainage in my ward?' },
  { label: '📞 Emergency Contact Numbers', text: 'What are the emergency helpline numbers for electricity and police?' },
  { label: '📋 Latest Government Schemes', text: 'How can I check eligibility for government schemes?' },
  { label: '🗑️ Garbage & Sanitation', text: 'What is the timing for daily garbage collection vehicles?' },
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Namaste! I am your **24/7 AI Civic Assistant** for Bengaluru Municipal Wards. Ask me anything about complaint filing, ward officials, or government schemes!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, isTyping])

  // Build a plain-text summary of the ward directory for AI context
  const buildWardContext = () => {
    const groups = {}
    DIRECTORY_DATA.forEach(d => {
      if (!groups[d.group]) groups[d.group] = []
      groups[d.group].push(`  - ${d.name} (${d.role}): ${d.phone}`)
    })
    return Object.entries(groups)
      .map(([group, items]) => `### ${group}\n${items.join('\n')}`)
      .join('\n\n')
  }

  const fetchAiResponse = async (userQuery) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userQuery,
          wardContext: buildWardContext()
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
      return "🤖 **AI Civic Intelligence**:\nSorry, I am currently disconnected from the municipal server. Please try again later.";
    } catch (err) {
      console.error(err);
      return "🤖 **AI Civic Intelligence**:\nSorry, there was an error processing your request.";
    }
  }


  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input
    if (!query.trim()) return

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (typeof textToSend !== 'string') setInput('')
    
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 900)) // Simulate AI response delay
    
    const replyText = await fetchAiResponse(query)
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
    setIsTyping(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border-2 border-brand-orange overflow-hidden flex flex-col mb-4"
          >
            {/* Top Header */}
            <div className="bg-gradient-to-r from-brand-orange to-brand-green p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Bot size={22} className="text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                    AI Civic Assistant <Sparkles size={14} className="text-amber-200" />
                  </h3>
                  <p className="text-[10px] text-white/80 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> 24/7 Ward Intelligence Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[82%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-orange to-brand-green text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}>
                    {msg.sender === 'ai' && (
                      <div className="text-[10px] font-extrabold text-brand-orange uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" /> AI Assistant
                      </div>
                    )}
                    <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed overflow-hidden">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <div className={`text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-white/80' : 'text-slate-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2 size={14} className="animate-spin text-brand-orange" /> AI is consulting municipal knowledge base...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Queries Chips */}
            <div className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto custom-scrollbar">
              {QUICK_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className="shrink-0 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/60 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI about potholes, officers, schemes..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-dark outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-orange to-brand-green text-white flex items-center justify-center shadow-md shadow-brand-orange/20 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-brand-orange to-brand-green text-white px-5 py-3.5 rounded-full shadow-2xl shadow-brand-orange/40 border-2 border-white/40 hover:shadow-brand-orange/60 transition-all"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
        <Bot size={24} className="animate-bounce" />
        <span className="font-extrabold text-sm tracking-wide pr-1">
          {isOpen ? 'Close Assistant' : '24/7 AI Assistant'}
        </span>
      </motion.button>
    </div>
  )
}
