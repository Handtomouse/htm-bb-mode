import React from "react";

const ACCENT = "#ff9d23";

// ===== Hardware Button Component =====
export function HwButton({
  children,
  label,
  onClick,
  disabled,
  className
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <button
      onClick={() => {
        onClick();
        setIsHovered(false);
      }}
      aria-label={label}
      className={`group flex flex-col items-center gap-1 flex-1 min-w-0 ${disabled ? "opacity-40 pointer-events-none" : ""} ${className || ""}`}
      style={{
        transition: "all 0.3s ease",
        position: "relative",
        zIndex: isHovered ? 10 : 1
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div
        className="grid place-items-center h-[88px] sm:h-[104px] w-full rounded-none border-2 backdrop-blur-sm transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(145deg, #141414 0%, #0f0f0f 25%, #0a0a0a 50%, #060606 75%, #000000 100%)",
          borderColor: isHovered ? "rgba(255,157,35,0.45)" : "rgba(255,255,255,0.3)",
          boxShadow: isPressed
            ? "inset 0 5px 10px rgba(0,0,0,0.95), inset 0 0 15px rgba(0,0,0,0.9)"
            : isHovered
            ? "0 0 12px rgba(255,157,35,0.5), 0 0 16px rgba(255,157,35,0.25), inset 0 0 10px rgba(255,157,35,0.18), inset 0 2px 5px rgba(255,255,255,0.1), inset 0 -1px 0 rgba(255,157,35,0.15)"
            : "3px 3px 8px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.08), inset 0 0 8px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,157,35,0.08)",
          transform: isPressed ? "scale(0.95)" : isHovered ? "scale(1.03)" : "scale(1)",
          transformOrigin: "center",
          padding: "2px"
        }}
        onMouseDown={(e) => {
          if (!disabled) {
            setIsPressed(true);
            e.currentTarget.style.transform = "scale(0.93)";
          }
        }}
        onMouseUp={(e) => {
          if (!disabled) {
            setIsPressed(false);
            e.currentTarget.style.transform = isHovered ? "scale(1.03)" : "scale(1)";
          }
        }}
      >
        <div
          className="h-12 sm:h-16 w-12 sm:w-16 transition-all duration-300 ease-out group-hover:[&_svg_rect]:fill-[#ff9d23] group-hover:[&_svg_rect]:stroke-[#ff9d23] group-hover:[&_svg_g]:fill-[#ff9d23] group-hover:[&_svg_g]:stroke-[#ff9d23]"
          style={{
            filter: isHovered ? "drop-shadow(0 0 4px rgba(255,157,35,0.6))" : "none"
          }}
        >
          {children}
        </div>
      </div>
      <div
        className="text-[13px] leading-none opacity-85 mt-1 font-bold transition-all duration-300"
        style={{
          letterSpacing: "0.02em",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)"
        }}
      >
        {label}
      </div>
    </button>
  );
}

// ===== Notification Dot Component =====
export function NotiDot({ pulse = false }: { pulse?: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 align-middle ${pulse ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: ACCENT,
        boxShadow: pulse ? `0 0 8px ${ACCENT}` : "none",
        animation: pulse ? "notiPulse 2s ease-in-out infinite" : "none"
      }}
    >
      <style>{`
        @keyframes notiPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
      `}</style>
    </span>
  );
}

// ===== Responsive Stage Component =====
export function ResponsiveStage({
  children,
  margin = 16
}: {
  children: React.ReactNode;
  margin?: number
}) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  const recompute = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = contentRef.current?.offsetWidth || 1;
    const ch = contentRef.current?.offsetHeight || 1;
    const s = Math.min((vw - margin * 2) / cw, (vh - margin * 2) / ch);
    setScale(Number.isFinite(s) && s > 0 ? s : 1);
  }, [margin]);

  React.useLayoutEffect(() => {
    recompute();
    if (typeof window === "undefined") return;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => recompute()) : null;
    if (contentRef.current && ro) ro.observe(contentRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("resize", recompute);
      ro?.disconnect();
    };
  }, [recompute]);

  return (
    <div className="w-screen h-screen bg-black grid place-items-center overflow-hidden">
      <div ref={contentRef} style={{ transform: `scale(${scale})`, transformOrigin: "center center", willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
