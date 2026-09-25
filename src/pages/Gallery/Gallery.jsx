import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Images,
  Star,
  Columns2,
} from "lucide-react";
import useComplaintsStore from "../../store/complaintsStore";

const WARD_LABELS = {
  chamrajapet: "Chamrajapet",
  jayanagar: "Jayanagar",
};

// ─── Before/After drag slider ──────────────────────────────────
function BeforeAfterSlider({ before, after }) {
  const [sliderX, setSliderX] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100),
    );
    setSliderX(pct);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* AFTER image (base layer) */}
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* BEFORE image (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderX}%` }}
      >
        <img
          src={before}
          alt="Before"
          className="absolute inset-0 w-full h-64 object-cover"
          style={{ width: `${(100 / sliderX) * 100}%`, maxWidth: "none" }}
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute inset-y-0 flex flex-col items-center pointer-events-none"
        style={{ left: `${sliderX}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-0.5 flex-1 bg-white/90 shadow-xl" />
        <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-slate-200 -my-1">
          <Columns2 size={16} className="text-slate-500" />
        </div>
        <div className="w-0.5 flex-1 bg-white/90 shadow-xl" />
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        BEFORE
      </div>
      <div className="absolute top-3 right-3 bg-success/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
        AFTER ✓
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────
function Lightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {item.before && item.after ? (
            <BeforeAfterSlider before={item.before} after={item.after} />
          ) : (
            <img
              src={item.after || item.images?.[0]}
              alt={item.title}
              className="w-full h-72 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {item.category}
              </span>
              {item.ward && (
                <span className="text-xs text-slate-500">
                  {WARD_LABELS[item.ward] || item.ward}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">
              {item.title}
            </h3>
            {item.story && (
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.story}
              </p>
            )}
            {item.before && item.after && (
              <p className="mt-4 text-xs text-slate-500 font-medium">
                💡 Drag the slider left and right to compare before and after!
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Gallery ─────────────────────────────────────────────
export default function Gallery() {
  const { beforeAfter } = useComplaintsStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  // Combine Before/After & Standalone into one unified gallery feed
  const allItems = beforeAfter.map((item) => ({
    ...item,
    displayType: item.before && item.after ? "before-after" : "activity",
  }));

  const categories = [
    "All",
    ...new Set(allItems.map((i) => i.category).filter(Boolean)),
  ];
  const filtered = allItems.filter(
    (i) => activeFilter === "All" || i.category === activeFilter,
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20">
      {/* ── Header ── */}
      <div className="text-center max-w-3xl mx-auto px-4 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-5">
            <Star size={12} className="text-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              Development Showcase
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Work Done, <span className="text-primary">Proven</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Real transformations in our ward — every resolved issue and
            community event, right here.
          </p>
        </motion.div>

        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                activeFilter === cat
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                  : "border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Images size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white">
              No showcase items yet
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              When complaints are resolved with before/after photos, they appear
              here automatically.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(item)}
                className="break-inside-avoid bg-slate-900 border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10 group"
              >
                {/* Thumbnail */}
                {item.before && item.after ? (
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.before}
                      alt="Before"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <img
                      src={item.after}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-90 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-3">
                      <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        BEFORE
                      </span>
                      <ArrowRight size={16} className="text-white/60" />
                      <span className="bg-success/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        AFTER
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-primary/80 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Drag to Compare
                    </div>
                  </div>
                ) : (
                  <div className="h-52 overflow-hidden">
                    <img
                      src={item.images?.[0] || item.after}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Card Info */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                      {item.category}
                    </span>
                    {item.ward && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {WARD_LABELS[item.ward] || item.ward}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.story && (
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2 font-medium leading-relaxed">
                      {item.story}
                    </p>
                  )}
                  <div className="text-[11px] text-slate-600 font-medium mt-3">
                    {new Date(item.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <Lightbox item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
