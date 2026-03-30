export function Pulse({ color = "var(--green)", size = 8 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: color, boxShadow: `0 0 6px ${color}`,
      animation: "pulse 1.5s ease-in-out infinite", flexShrink: 0
    }} />
  );
}

export function Badge({ children, color = "var(--green)" }) {
  return (
    <span style={{
      background: color + "22", border: `1px solid ${color}`,
      color, borderRadius: 4, padding: "2px 8px",
      fontSize: 10, letterSpacing: 1
    }}>
      {children}
    </span>
  );
}

export function Card({ children, style = {}, accent = false }) {
  return (
    <div style={{
      background: "var(--bg3)",
      border: `1px solid ${accent ? "var(--gold)" : "var(--border)"}`,
      borderRadius: 8, padding: 16, ...style
    }}>
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const variants = {
    primary:   { background: "var(--bg3)", border: "1px solid var(--green)", color: "var(--green)" },
    gold:      { background: "#2A1A00",    border: "1px solid var(--gold)",  color: "var(--gold)" },
    danger:    { background: "#2A0F0F",    border: "1px solid var(--red)",   color: "var(--red)" },
    ghost:     { background: "transparent",border: "1px solid #2A2A2A",      color: "var(--muted)" },
    solid:     { background: "var(--green-dim)", border: "none",             color: "var(--green)" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 6, padding: "10px 16px",
        fontSize: 11, letterSpacing: 1,
        transition: "all .15s", opacity: disabled ? .45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ color: "var(--green)", fontSize: 10, letterSpacing: 3, marginBottom: 10, marginTop: 4 }}>
      {children}
    </div>
  );
}

export function Divider() {
  return <div style={{ borderTop: "1px solid #1A1A1A", margin: "20px 0" }} />;
}
