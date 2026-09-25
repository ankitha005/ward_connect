import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  Phone,
  MapPin,
  ChevronRight,
  Loader2,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DIRECTORY_DATA } from "../data/directoryData";

const QUICK_QUERIES = [
  {
    label: "🛣️ Report Pothole",
    text: "How do I report a road pothole or footpath repair in my area?",
  },
  {
    label: "👷 Ward Engineer",
    text: "Who is the concerned official for water supply and drainage in my ward?",
  },
  {
    label: "🚨 Emergency Numbers",
    text: "What are the emergency helpline numbers for police, fire, BESCOM and ambulance?",
  },
  {
    label: "🗑️ Garbage Timings",
    text: "What are the door-to-door garbage collection timings and segregation rules?",
  },
  {
    label: "ಕನ್ನಡದಲ್ಲಿ ಮಾಹಿತಿ",
    text: "ನಮಸ್ಕಾರ, ನಮ್ಮ ವಾರ್ಡ್‌ನಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ?",
  },
  {
    label: "📜 Welfare Schemes",
    text: "What are the latest government welfare schemes available for citizens?",
  },
];

export default function AIChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 **Namaskara!** I am **Sahaya AI**, your 24/7 Intelligent Ward Civic Assistant.\n\nI can assist you with filing grievances, tracking status, reaching ward officials, or learning about municipal services in English & ಕನ್ನಡ!",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // Build a plain-text summary of the ward directory for AI context
  const buildWardContext = () => {
    const groups = {};
    DIRECTORY_DATA.forEach((d) => {
      if (!groups[d.group]) groups[d.group] = [];
      groups[d.group].push(`  - ${d.name} (${d.role}): ${d.phone}`);
    });
    return Object.entries(groups)
      .map(([group, items]) => `### ${group}\n${items.join("\n")}`)
      .join("\n\n");
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: "ai",
        text: "👋 **Chat reset.** How can I assist you with your ward or civic issue?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const fetchAiResponse = async (userQuery, currentHistory) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userQuery,
          history: currentHistory.slice(-6),
          wardContext: buildWardContext(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
      return "🤖 **Sahaya Civic Assistant**:\nSorry, I could not connect to the municipal server. Please try again shortly or contact BBMP Sahaya at **1533**.";
    } catch (err) {
      console.error("Chat API Error:", err);
      return "🤖 **Sahaya Civic Assistant**:\nI'm temporarily unable to reach the cloud AI. For urgent assistance, please dial:\n- **BBMP Control Room**: 1533\n- **Police Emergency**: 112\n- **BESCOM**: 1912\n- Or submit a grievance directly at [File New Complaint](/complaints).";
    }
  };

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if (!query.trim()) return;

    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (typeof textToSend !== "string") setInput("");

    setIsTyping(true);
    const replyText = await fetchAiResponse(query, newMessages);
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setIsTyping(false);
  };

  // Custom markdown link renderer to use SPA routing
  const markdownComponents = {
    a: ({ href, children }) => {
      const isInternal = href && href.startsWith("/");
      return (
        <a
          href={href}
          onClick={(e) => {
            if (isInternal) {
              e.preventDefault();
              navigate(href);
            }
          }}
          className="inline-flex items-center gap-1 font-bold text-brand-orange hover:underline bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60"
        >
          {children}
          {isInternal ? <ChevronRight size={11} /> : <ExternalLink size={11} />}
        </a>
      );
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-[360px] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-brand-orange/40 overflow-hidden flex flex-col mb-4 ring-1 ring-black/5"
          >
            {/* Top Header */}
            <div className="bg-gradient-to-r from-brand-orange via-orange-500 to-brand-green p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                    Sahaya AI Assistant{" "}
                    <Sparkles size={14} className="text-amber-200" />
                  </h3>
                  <p className="text-[10px] text-white/90 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />{" "}
                    Smart Ward Intelligence • 24/7 Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors text-white text-xs"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="bg-slate-100/90 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldAlert size={12} className="text-red-500" />
                Helpline: <strong>1533</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/complaints")}
                  className="text-brand-orange hover:underline flex items-center gap-0.5"
                >
                  + New Complaint
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => navigate("/directory")}
                  className="text-brand-green hover:underline flex items-center gap-0.5"
                >
                  Ward Officials
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="text-[10px] font-extrabold text-brand-orange uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" /> Sahaya
                        Assistant
                      </div>
                    )}
                    <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed overflow-hidden break-words">
                      <ReactMarkdown components={markdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${msg.sender === "user" ? "text-white/80" : "text-slate-400"}`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2
                      size={14}
                      className="animate-spin text-brand-orange"
                    />{" "}
                    Consulting ward intelligence database...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Queries Chips */}
            <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto custom-scrollbar">
              {QUICK_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className="shrink-0 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/60 px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about potholes, ward officers, garbage..."
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
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-brand-orange to-brand-green text-white px-5 py-3.5 rounded-full shadow-2xl shadow-brand-orange/40 border-2 border-white/40 hover:shadow-brand-orange/60 transition-all"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
        <Bot size={24} />
        <span className="font-extrabold text-sm tracking-wide pr-1">
          {isOpen ? "Close Assistant" : "24/7 AI Assistant"}
        </span>
      </motion.button>
    </div>
  );
}
