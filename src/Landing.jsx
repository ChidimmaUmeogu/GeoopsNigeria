import { Pulse } from "./ui";

export default function Landing({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden"
    }}>
      {/* Scanline */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "rgba(74,222,128,0.04)", animation: "scanline 7s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.025) 2px,rgba(0,0,0,.025) 4px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "fadeUp .8s ease", maxWidth: 480, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 12 }}>
          <Pulse /><span style={{ color: "var(--green)", fontSize: 10, letterSpacing: 3 }}>SYSTEM ONLINE</span><Pulse />
        </div>

        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(52px,12vw,96px)", color: "#fff", letterSpacing: 5, lineHeight: 1, animation: "glow 3s ease-in-out infinite" }}>
          GEOOPS
        </h1>
        <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px,6vw,52px)", color: "var(--green)", letterSpacing: 7, margin: "0 0 6px" }}>
          NIGERIA
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 10, letterSpacing: 2, marginBottom: 48 }}>
          GEOSPATIAL INTELLIGENCE DIVISION · FIELD ANALYST TRAINING
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { role: "student",    label: "FIELD ANALYST",    sub: "Student mission terminal",            color: "var(--green)", icon: "◉" },
            { role: "instructor", label: "MISSION CONTROL",  sub: "Instructor verification hub",         color: "var(--gold)",  icon: "◈" },
            { role: "projector",  label: "COMMAND DISPLAY",  sub: "Live leaderboard · projector view",   color: "var(--blue)",  icon: "◧" },
          ].map(({ role, label, sub, color, icon }) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              style={{
                background: "transparent", border: `1px solid ${color}35`,
                borderRadius: 8, padding: "18px 22px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 16,
                transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = color + "12"; e.currentTarget.style.borderColor = color; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = color + "35"; }}
            >
              <span style={{ color, fontFamily: "var(--display)", fontSize: 28, width: 28, textAlign: "center" }}>{icon}</span>
              <span style={{ width: 3, height: 32, background: color, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ color, fontFamily: "var(--display)", fontSize: 22, letterSpacing: 2 }}>{label}</div>
                <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 2 }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        <p style={{ color: "#1A3A2A", fontSize: 10, marginTop: 48, letterSpacing: 2 }}>
          NAU · DEPT. GEOGRAPHY & METEOROLOGY · ECOSYNTHRA LAB
        </p>
      </div>
    </div>
  );
}
