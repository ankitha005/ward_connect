import { useState, useRef, useEffect, useCallback } from "react";
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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Languages,
  CheckCircle2,
  FileText,
  Search,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DIRECTORY_DATA } from "../data/directoryData";
import { playNotification, playPop, playClick } from "../utils/soundEffects";

const QUICK_QUERIES_EN = [
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
    label: "💧 Water Disruption",
    text: "How do I report drinking water supply disruption or pipe burst to BWSSB?",
  },
  {
    label: "💡 Streetlight Defect",
    text: "How do I lodge a complaint for non-working streetlights?",
  },
  {
    label: "📜 Welfare Schemes",
    text: "What are the latest government welfare schemes available for citizens?",
  },
  {
    label: "🔍 Track Complaint",
    text: "Where can I track the live status of my grievance ticket?",
  },
];

const QUICK_QUERIES_KN = [
  {
    label: "🛣️ ರಸ್ತೆ ಗುಂಡಿ ದೂರು",
    text: "ನಮ್ಮ ಬಡಾವಣೆಯಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ ಅಥವಾ ಕಾಲುದಾರಿ ದುರಸ್ತಿ ಬಗ್ಗೆ ದೂರು ನೀಡುವುದು ಹೇಗೆ?",
  },
  {
    label: "👷 ವಾರ್ಡ್ ಇಂಜಿನಿಯರ್",
    text: "ನಮ್ಮ ವಾರ್ಡ್‌ನ ಜಲಮಂಡಳಿ ಮತ್ತು ರಸ್ತೆ ಕಾಮಗಾರಿ ಇಂಜಿನಿಯರ್ ಯಾರು?",
  },
  {
    label: "🚨 ತುರ್ತು ನಂಬರ್‌ಗಳು",
    text: "ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ, ಬೆಸ್ಕಾಂ ಮತ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು ಯಾವುವು?",
  },
  {
    label: "🗑️ ಕಸ ಸಂಗ್ರಹಣೆ ಸಮಯ",
    text: "ಮನೆ ಮನೆ ಕಸ ಸಂಗ್ರಹಣೆ ಸಮಯ ಮತ್ತು ಕಸ ವಿಂಗಡಣೆ ನಿಯಮಗಳು ಏನು?",
  },
  {
    label: "💧 ನೀರು ಸರಬರಾಜು ಸಮಸ್ಯೆ",
    text: "ಕುಡಿಯುವ ನೀರು ವ್ಯತ್ಯಯ ಅಥವಾ ಪೈಪ್ ಸೋರಿಕೆ ಬಗ್ಗೆ ಜಲಮಂಡಳಿಗೆ ದೂರು ನೀಡುವುದು ಹೇಗೆ?",
  },
  {
    label: "💡 ಬೀದಿ ದೀಪ ದುರಸ್ತಿ",
    text: "ರಸ್ತೆಯಲ್ಲಿ ಬೆಳಗದ ಬೀದಿ ದೀಪಗಳ ಬಗ್ಗೆ ದೂರು ದಾಖಲಿಸುವುದು ಹೇಗೆ?",
  },
  {
    label: "📜 ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು",
    text: "ಸರ್ಕಾರದ ಗ್ಯಾರಂಟಿ ಯೋಜನೆಗಳು (ಗೃಹ ಜ್ಯೋತಿ, ಗೃಹ ಲಕ್ಷ್ಮಿ) ಮತ್ತು ಸೌಲಭ್ಯಗಳ ವಿವರವೇನು?",
  },
  {
    label: "🔍 ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    text: "ನನ್ನ ದೂರಿನ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುವುದು?",
  },
];

export default function AIChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState("en"); // "en" or "kn"
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const initialWelcome = {
    en: {
      sender: "ai",
      text: "👋 **Namaskara!** I am **Sahaya AI**, your 24/7 Intelligent Ward Civic Assistant.\n\nI can assist you with filing grievances, tracking ticket status, contacting ward officials, or exploring welfare schemes in English & ಕನ್ನಡ!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      id: "init_en",
    },
    kn: {
      sender: "ai",
      text: "🙏 **ನಮಸ್ಕಾರ!** ನಾನು ನಿಮ್ಮ 24/7 ನಾಗರಿಕ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ **ಸಹಾಯ AI (Sahaya AI)**.\n\nರಸ್ತೆ ಗುಂಡಿ, ಕಸ ವಿಲೇವಾರಿ, ನೀರು ಸರಬರಾಜು, ವಾರ್ಡ್ ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕ ಮತ್ತು ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಸಂಪೂರ್ಣ ಮಾಹಿತಿಗಾಗಿ ನನ್ನನ್ನು ಕೇಳಿ!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      id: "init_kn",
    },
  };

  const [messages, setMessages] = useState([initialWelcome.en]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // Client-side cache for 0ms instant replies on repeated queries
  const aiCache = useRef(new Map());

  // Language toggle handler
  const handleToggleLanguage = (newLang) => {
    if (newLang === language) return;
    setLanguage(newLang);
    if (soundEnabled) playPop();

    // Add a polite switch banner in conversation
    const switchMsg = {
      sender: "ai",
      text:
        newLang === "kn"
          ? "🌐 **ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.**\nನಿಮ್ಮ ವಾರ್ಡ್ ಅಥವಾ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು!"
          : "🌐 **Language switched to English.**\nYou can now ask questions about ward issues, directory, or grievances in English!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      id: "lang_switch_" + Date.now(),
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  // Build a concise summary of the ward directory ONLY when needed
  const buildWardContext = (query = "") => {
    const q = query.toLowerCase();
    if (!/official|engineer|contact|phone|number|aee|corporator|directory|ಅಧಿಕಾರಿ|ಇಂಜಿನಿಯರ್|ಸಂಪರ್ಕ/i.test(q)) {
      return "";
    }
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
    if (soundEnabled) playClick();
    setMessages([initialWelcome[language]]);
  };

  // Voice Input Setup (Speech-to-Text)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice Input) ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. Google Chrome ಬಳಸಿ."
          : "Voice speech recognition is not supported in this browser. Please try Google Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "kn" ? "kn-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        if (soundEnabled) playPop();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    }
  };

  // Text-to-Speech (Read Aloud)
  const handleSpeak = (text, msgId) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown stars/brackets for smooth speaking
    const cleanText = text
      .replace(/[#*_`\[\]]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "kn" ? "kn-IN" : "en-IN";
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message to clipboard
  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    if (soundEnabled) playPop();
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const fetchAiResponse = async (userQuery, currentHistory) => {
    const cacheKey = `${language}:${userQuery.trim().toLowerCase()}`;
    if (aiCache.current.has(cacheKey)) {
      return aiCache.current.get(cacheKey);
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userQuery,
          history: currentHistory.slice(-4),
          wardContext: buildWardContext(userQuery),
          language: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.response || "";
        aiCache.current.set(cacheKey, reply);
        return reply;
      }

      return language === "kn"
        ? "🤖 **ಸಹಾಯ AI ನಾಗರಿಕ ಸಹಾಯಕ**:\nಕ್ಷಮಿಸಿ, ಪಾಲಿಕೆಯ ಸರ್ವರ್ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಬಿಬಿಎಂಪಿ ಸಹಾಯವಾಣಿ **1533** ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ನೇರವಾಗಿ **[ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)**."
        : "🤖 **Sahaya Civic Assistant**:\nSorry, I could not connect to the municipal server. Please try again shortly or contact BBMP Sahaya at **1533**.";
    } catch (err) {
      console.error("Chat API Error:", err);
      return language === "kn"
        ? "🤖 **ಸಹಾಯ AI ನಾಗರಿಕ ಸಹಾಯಕ**:\nತುರ್ತು ಸಹಾಯವಾಣಿಗಳು:\n- **ಬಿಬಿಎಂಪಿ ಕಂಟ್ರೋಲ್ ರೂಂ**: 1533\n- **ಪೊಲೀಸ್ ತುರ್ತು ಸೇವೆ**: 112\n- **ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್**: 1912\n- ಅಥವಾ ನೇರವಾಗಿ [ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)."
        : "🤖 **Sahaya Civic Assistant**:\nFor immediate civic assistance:\n- **BBMP Control Room**: 1533\n- **Police Emergency**: 112\n- **BESCOM Electricity**: 1912\n- Or report directly at [File New Complaint](/complaints).";
    }
  };

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : input;
    if (!query.trim()) return;

    if (soundEnabled) playClick();

    const userMsg = {
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      id: "u_" + Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (typeof textToSend !== "string") setInput("");

    setIsTyping(true);
    const replyText = await fetchAiResponse(query, newMessages);
    setIsTyping(false);

    // Fast typewriter streaming effect
    const replyId = "ai_" + Date.now();
    const aiMsgPlaceholder = {
      sender: "ai",
      text: "",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      id: replyId,
    };

    setMessages((prev) => [...prev, aiMsgPlaceholder]);

    const chunkSize = Math.max(4, Math.floor(replyText.length / 22));
    let currentIdx = 0;

    const streamInterval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= replyText.length) {
        clearInterval(streamInterval);
        if (soundEnabled) playNotification();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: replyText,
          };
          return updated;
        });
      } else {
        const currentText = replyText.slice(0, currentIdx);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: currentText,
          };
          return updated;
        });
      }
    }, 15);
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
          className="inline-flex items-center gap-1 font-bold text-brand-orange hover:underline bg-orange-50 px-2 py-0.5 rounded border border-orange-200 shadow-2xs hover:bg-orange-100 transition-colors"
        >
          {children}
          {isInternal ? <ChevronRight size={12} /> : <ExternalLink size={12} />}
        </a>
      );
    },
  };

  const activeQueries = language === "kn" ? QUICK_QUERIES_KN : QUICK_QUERIES_EN;

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
            className={`bg-white rounded-3xl shadow-2xl border-2 border-brand-orange/40 overflow-hidden flex flex-col mb-4 ring-1 ring-black/5 transition-all duration-300 ${
              isExpanded
                ? "w-[92vw] max-w-[680px] h-[750px] max-h-[90vh]"
                : "w-[360px] sm:w-[440px] h-[600px] max-h-[85vh]"
            }`}
          >
            {/* Top Header */}
            <div className="bg-gradient-to-r from-brand-orange via-orange-500 to-brand-green p-3.5 text-white flex items-center justify-between shadow-md">
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
                    {language === "kn" ? "24/7 ವಾರ್ಡ್ ಸಹಾಯಕ • ಸಕ್ರಿಯ" : "Smart Ward Intelligence • 24/7"}
                  </p>
                </div>
              </div>

              {/* Header Actions: Language Switch, Expand, Audio, Reset, Close */}
              <div className="flex items-center gap-1.5">
                {/* Kannada / English Toggle Pill */}
                <div className="flex items-center bg-black/20 p-0.5 rounded-full border border-white/20 text-xs font-bold mr-1">
                  <button
                    onClick={() => handleToggleLanguage("en")}
                    className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                      language === "en"
                        ? "bg-white text-brand-orange shadow-xs font-black scale-105"
                        : "text-white/80 hover:text-white"
                    }`}
                    title="Switch to English"
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleToggleLanguage("kn")}
                    className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                      language === "kn"
                        ? "bg-white text-brand-green shadow-xs font-black scale-105"
                        : "text-white/80 hover:text-white"
                    }`}
                    title="ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ"
                  >
                    ಕನ್ನಡ
                  </button>
                </div>

                {/* Sound mute toggle */}
                <button
                  onClick={() => setSoundEnabled((v) => !v)}
                  title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                  className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors text-white text-xs"
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded((v) => !v)}
                  title={isExpanded ? "Restore size" : "Expand window"}
                  className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors text-white text-xs hidden sm:flex"
                >
                  {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                {/* Reset Chat */}
                <button
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors text-white text-xs"
                >
                  <RotateCcw size={13} />
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Bar */}
            <div className="bg-slate-100 border-b border-slate-200/90 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1 text-slate-600">
                <ShieldAlert size={12} className="text-red-500" />
                BBMP: <strong className="text-red-600">1533</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/complaints")}
                  className="text-brand-orange hover:underline flex items-center gap-0.5"
                >
                  <FileText size={11} /> {language === "kn" ? "ದೂರು ಸಲ್ಲಿಸಿ" : "+ Complaint"}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => navigate("/track")}
                  className="text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Search size={11} /> {language === "kn" ? "ಟ್ರ್ಯಾಕ್ ಮಾಡಿ" : "Track"}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => navigate("/directory")}
                  className="text-brand-green hover:underline flex items-center gap-0.5"
                >
                  <Phone size={11} /> {language === "kn" ? "ಅಧಿಕಾರಿಗಳು" : "Officials"}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs font-medium leading-relaxed shadow-sm relative group ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-xs"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="text-[10px] font-extrabold text-brand-orange uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-500" /> Sahaya
                          Assistant
                        </span>
                        {/* Audio Read Aloud & Copy actions for AI messages */}
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSpeak(msg.text, msg.id || idx)}
                            title={speakingMsgId === (msg.id || idx) ? "Stop listening" : "Read aloud"}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-brand-orange transition-colors"
                          >
                            {speakingMsgId === (msg.id || idx) ? (
                              <VolumeX size={12} className="text-red-500 animate-pulse" />
                            ) : (
                              <Volume2 size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyMessage(msg.text, idx)}
                            title="Copy response"
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-brand-orange transition-colors"
                          >
                            {copiedIdx === idx ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed overflow-hidden break-words">
                      <ReactMarkdown components={markdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    <div
                      className={`text-[9px] mt-1.5 text-right font-medium ${
                        msg.sender === "user" ? "text-white/80" : "text-slate-400"
                      }`}
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
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-xs flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Loader2 size={14} className="animate-spin text-brand-orange" />
                    <span>
                      {language === "kn"
                        ? "ವಾರ್ಡ್ ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
                        : "Consulting ward intelligence database..."}
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Queries Chips in Selected Language */}
            <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto custom-scrollbar">
              {activeQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  className="shrink-0 text-[11px] font-bold bg-amber-50/90 hover:bg-amber-100 text-amber-950 border border-amber-300/60 px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-2xs"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Box with Voice Mic & Submit */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              {/* Mic Voice Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={
                  isListening
                    ? "Listening... Click to stop"
                    : language === "kn"
                    ? "ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ"
                    : "Click to speak in English / Kannada"
                }
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/40"
                    : "bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-brand-orange border border-slate-200"
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? language === "kn"
                      ? "ಮಾತನಾಡಿ, ಆಲಿಸಲಾಗುತ್ತಿದೆ..."
                      : "Listening... speak now"
                    : language === "kn"
                    ? "ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ (ಉದಾ: ರಸ್ತೆ ಗುಂಡಿ, ಕಸ, ವಾರ್ಡ್ ಅಧಿಕಾರಿ)..."
                    : "Ask about potholes, ward officers, garbage, schemes..."
                }
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
        onClick={() => {
          setIsOpen((v) => !v);
          if (soundEnabled) playClick();
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-brand-orange to-brand-green text-white px-5 py-3.5 rounded-full shadow-2xl shadow-brand-orange/40 border-2 border-white/40 hover:shadow-brand-orange/60 transition-all"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
        <Bot size={24} />
        <span className="font-extrabold text-sm tracking-wide pr-1">
          {isOpen ? "Close Assistant" : language === "kn" ? "ಸಹಾಯ AI ಸಹಾಯಕ" : "24/7 AI Assistant"}
        </span>
      </motion.button>
    </div>
  );
}
