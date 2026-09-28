import { useEffect, useRef } from "react";
import { playClick, playHover } from "../utils/soundEffects";

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rotation = useRef(0);
  const speed = useRef(0);
  const isHoveringRef = useRef(false);
  const isClickingRef = useRef(false);
  const isVisibleRef = useRef(false);

  const particlesRef = useRef([]);
  const sparksRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Disable on coarse pointer devices (touchscreens/mobiles)
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    let lastX = -100;
    let lastY = -100;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // Direct, zero-lag mousemove handler (no React state updates)
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      mousePos.current.x = x;
      mousePos.current.y = y;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (dot) dot.style.opacity = "1";
        if (ring) ring.style.opacity = "1";
        if (canvas) canvas.style.opacity = "1";
      }

      // 0ms instant hardware pointer tracking
      if (dot) {
        dot.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      speed.current = Math.min(dist * 0.3, 10);
      lastX = x;
      lastY = y;

      // Efficient stardust trail particles (capped to 18 for max FPS)
      if (dist > 5 && particlesRef.current.length < 18) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          size: Math.random() * 2.2 + 1.2,
          alpha: 0.8,
          color: Math.random() > 0.4 ? "#FF9933" : "#10B981",
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.2,
        });
      }

      // Fast hover check without layout thrashing
      const target = e.target;
      const clickable = target?.closest(
        'button, a, input, select, textarea, [role="button"], label, .clickable, [onclick]',
      );
      const isHoverNow = Boolean(clickable);

      if (isHoverNow !== isHoveringRef.current) {
        isHoveringRef.current = isHoverNow;
        if (isHoverNow) {
          playHover();
          if (ring) {
            ring.style.transformOrigin = "center center";
            ring.style.width = "54px";
            ring.style.height = "54px";
            ring.style.marginLeft = "-5px";
            ring.style.marginTop = "-5px";
          }
          if (dot) {
            dot.style.background = "#10B981";
            dot.style.boxShadow = "0 0 10px #10B981";
          }
        } else {
          if (ring) {
            ring.style.width = "44px";
            ring.style.height = "44px";
            ring.style.marginLeft = "0px";
            ring.style.marginTop = "0px";
          }
          if (dot) {
            dot.style.background = "#FF9933";
            dot.style.boxShadow = "0 0 8px rgba(255, 153, 51, 0.9)";
          }
        }
      }
    };

    const handleMouseDown = (e) => {
      isClickingRef.current = true;
      playClick();
      if (dot) {
        dot.style.transform = `translate3d(${e.clientX - 5}px, ${e.clientY - 5}px, 0) scale(1.4)`;
      }
      if (ring) {
        ring.style.transform = `translate3d(${ringPos.current.x - 22}px, ${ringPos.current.y - 22}px, 0) scale(0.85)`;
      }

      // Snappy spark burst
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const vel = Math.random() * 2.8 + 1.8;
        sparksRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel,
          size: Math.random() * 2 + 1.2,
          alpha: 1.0,
          color: i % 2 === 0 ? "#FF9933" : "#10B981",
        });
      }
    };

    const handleMouseUp = (e) => {
      isClickingRef.current = false;
      if (dot) {
        dot.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0) scale(1)`;
      }
      if (ring) {
        ring.style.transform = `translate3d(${ringPos.current.x - 22}px, ${ringPos.current.y - 22}px, 0) scale(1)`;
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
      if (canvas) canvas.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (dot) dot.style.opacity = "1";
      if (ring) ring.style.opacity = "1";
      if (canvas) canvas.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // 60/120 FPS high-refresh animation loop
    const render = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Ultra-snappy ease (0.32): follows seamlessly without dragging or latency
      ringPos.current.x += (mx - ringPos.current.x) * 0.32;
      ringPos.current.y += (my - ringPos.current.y) * 0.32;

      rotation.current += 1.4 + speed.current * 0.6;
      speed.current *= 0.92;

      if (ring) {
        const scaleStr = isClickingRef.current ? " scale(0.85)" : "";
        ring.style.transform = `translate3d(${ringPos.current.x - 22}px, ${ringPos.current.y - 22}px, 0)${scaleStr}`;
      }
      if (svgRef.current) {
        svgRef.current.style.transform = `rotate(${rotation.current}deg)`;
      }

      // Draw stardust & sparks on canvas without heavy blur filters
      if (
        ctx &&
        canvas &&
        (particlesRef.current.length > 0 || sparksRef.current.length > 0)
      ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.04;
          p.size *= 0.96;

          if (p.alpha <= 0.02 || p.size <= 0.3) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = sparksRef.current.length - 1; i >= 0; i--) {
          const s = sparksRef.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.12; // gravity
          s.alpha -= 0.045;

          if (s.alpha <= 0.02) {
            sparksRef.current.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = s.alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (
        ctx &&
        canvas &&
        particlesRef.current.length === 0 &&
        sparksRef.current.length === 0
      ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", resizeCanvas);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
      {/* High-performance Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full opacity-0 transition-opacity duration-200"
      />

      {/* Rotating Civic Mandala Reticle (Snappy, Zero-CSS-Lag Trailing) */}
      <div
        ref={ringRef}
        className="absolute rounded-full pointer-events-none opacity-0 will-change-transform"
        style={{
          width: 44,
          height: 44,
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 0.2s, width 0.15s, height 0.15s",
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 44 44"
          className="w-full h-full will-change-transform"
          style={{
            filter: "drop-shadow(0 0 4px rgba(255, 153, 51, 0.45))",
          }}
        >
          {/* Concentric Dashed Ring */}
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="#FF9933"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* Inner Civic Compass Ring */}
          <circle
            cx="22"
            cy="22"
            r="12"
            fill="rgba(255, 153, 51, 0.08)"
            stroke="#F59E0B"
            strokeWidth="1"
            opacity="0.9"
          />

          {/* 8 Cardinal & Diagonal Spokes (Ashoka Chakra / Sacred Mandala geometry) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="22"
              y1="4"
              x2="22"
              y2="8"
              stroke="#FFA500"
              strokeWidth={deg % 90 === 0 ? "1.8" : "1.2"}
              strokeLinecap="round"
              transform={`rotate(${deg} 22 22)`}
            />
          ))}
        </svg>
      </div>

      {/* Core Glowing Precision Pointer Dot (Instant 0ms Hardware Tracking) */}
      <div
        ref={dotRef}
        className="absolute rounded-full pointer-events-none opacity-0 will-change-transform"
        style={{
          width: 8,
          height: 8,
          background: "#FF9933",
          boxShadow: "0 0 8px rgba(255, 153, 51, 0.9)",
          transform: "translate3d(-100px, -100px, 0)",
          transition: "opacity 0.2s, background 0.15s, box-shadow 0.15s",
        }}
      />
    </div>
  );
};

export default CustomCursor;
