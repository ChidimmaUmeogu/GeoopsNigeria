import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import { MISSIONS, getRank, fmt } from "./data";
import { Pulse } from "./ui";

export default function ProjectorView() {
  const [roster, setRoster]       = useState([]);
  const [session, setSession]     = useState(null);
  const [timeLeft, setTimeLeft]   = useState(0);
  const [intel, setIntel]         = useState(null);
  const [prevTop, setPrevTop]     = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubR = onValue(ref(db, "roster"), snap => {
      const d = snap.val() || {};
      const sorted = Object.values(d).sort((a,b) => (b.score||0)-(a.score||0));
      setPrevTop(roster.slice(0,3).map(s=>s.studentId));
      setRoster(sorted);
    });
    const unsubS = onValue(ref(db, "session/current"), snap => setSession(snap.val()));
    const unsubI = onValue(ref(db, "session/intel"), snap => {
      const v = snap.val();
      setIntel(v?.text?.trim() || null);
    });
    return () => { unsubR(); unsubS(); unsubI(); };
  }, []);

  // Countdown
  useEffect(() => {
    if (!session) { setTimeLeft(0); clearInterval(timerRef.current); return; }
    const m = MISSIONS.find(m => m.id === session.missionId);
    const tick = () => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      setTimeLeft(Math.max(0, m.duration * 60 - elapsed));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [session]);

  const activeMission = session ? MISSIONS.find(m => m.id === session.missionId) : null;
  const timerColor = timeLeft < 300 ? "#EF4444" : timeLeft < 600 ? "#F4A620" : "#4ADE80";
  const maxScore = roster.length > 0 ? Math.max(...roster.map(s => s.score||0), 1) : 1;

  return (
    <div style={{ minHeight: "100vh", background: "#040A06", padding: "28px 36px", overflow: "hidden", fontFamily: "var(--mono)" }}>

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "clamp(36px,5vw,64px)", color: "#4ADE80", letterSpacing: 5, lineHeight: 1, animation: "glow 3s ease-in-out infinite" }}>
            GEOOPS NIGERIA
          </div>
          <div style={{ color: "#1A5632", fontSize: 11, letterSpacing: 3, marginTop: 4 }}>
            GEOSPATIAL INTELLIGENCE DIVISION · LIVE LEADERBOARD
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {activeMission ? (
            <>
              <div style={{ fontFamily: "var(--display)", fontSize: "clamp(48px,7vw,88px)", color: timerColor, lineHeight: 1, letterSpacing: 2 }}>
                {fmt(timeLeft)}
              </div>
              <div style={{ color: "#64748B", fontSize: 11, letterSpacing: 2 }}>TIME REMAINING</div>
            </>
          ) : (
            <div style={{ color: "#1A5632", fontFamily: "var(--display)", fontSize: 30, letterSpacing: 3, paddingTop: 20 }}>STANDBY</div>
          )}
        </div>
      </div>

      {/* Mission banner */}
      {activeMission && (
        <div style={{ background: "#0A1A0F", border: "1px solid #1A5632", borderRadius: 8, padding: "10px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <Pulse /><span style={{ color: "#4ADE80", fontSize: 11, letterSpacing: 2 }}>ACTIVE:</span>
          <span style={{ color: "#fff", fontFamily: "var(--display)", fontSize: 22, letterSpacing: 2 }}>{activeMission.code}</span>
          <span style={{ color: "#64748B", fontSize: 11 }}>— {activeMission.topic} · {activeMission.aoi}</span>
        </div>
      )}

      {/* Intel drop */}
      {intel && (
        <div style={{ background: "#180E00", border: "2px solid #F4A620", borderRadius: 8, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, animation: "slideIn .5s ease" }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ color: "#F4A620", fontSize: 14, letterSpacing: .5 }}>{intel}</span>
        </div>
      )}

      {/* Leaderboard */}
      {roster.length === 0 ? (
        <div style={{ textAlign: "center", color: "#1A5632", paddingTop: 80 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 40, letterSpacing: 4 }}>AWAITING ANALYSTS</div>
          <div style={{ fontSize: 12, marginTop: 10, color: "#0F3A1A" }}>Students open the app and select Field Analyst to join</div>
        </div>
      ) : (
        <div>
          {roster.slice(0, 12).map((s, i) => {
            const rank = getRank(s.score || 0);
            const barW = Math.round(((s.score || 0) / maxScore) * 100);
            const isTop = i < 3;
            const medals = ["🥇","🥈","🥉"];
            return (
              <div key={s.studentId} style={{
                display: "flex", alignItems: "center", gap: 16,
                marginBottom: isTop ? 12 : 8,
                background: isTop ? "#0A1A0F" : "transparent",
                border: isTop ? `1px solid ${rank.color}30` : "none",
                borderRadius: 8, padding: isTop ? "12px 16px" : "6px 4px",
                transition: "all .6s ease"
              }}>
                <div style={{ width: 48, textAlign: "center", flexShrink: 0 }}>
                  {i < 3
                    ? <span style={{ fontSize: isTop ? 28 : 20 }}>{medals[i]}</span>
                    : <span style={{ color: "#2E7D52", fontFamily: "var(--display)", fontSize: 22 }}>#{i+1}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{
                      color: isTop ? "#fff" : "#94A3B8",
                      fontFamily: isTop ? "var(--display)" : "var(--mono)",
                      fontSize: isTop ? "clamp(16px,2.5vw,26px)" : 13,
                      letterSpacing: isTop ? 1 : 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>{s.name}</span>
                    <span style={{ color: rank.color, fontFamily: "var(--display)", fontSize: isTop ? "clamp(22px,3vw,34px)" : 20, marginLeft: 16, flexShrink: 0 }}>
                      {s.score || 0} <span style={{ fontSize: 11, color: "#64748B" }}>pts</span>
                    </span>
                  </div>
                  <div style={{ background: "#060D09", borderRadius: 4, height: isTop ? 10 : 5, overflow: "hidden" }}>
                    <div style={{
                      width: `${barW}%`, height: "100%",
                      background: `linear-gradient(90deg, ${rank.color}, ${rank.color}70)`,
                      borderRadius: 4, transition: "width 1s ease"
                    }} />
                  </div>
                </div>
                {isTop && (
                  <span style={{ color: rank.color, fontSize: 10, letterSpacing: 1, flexShrink: 0, display: "none", "@media(minWidth:600px)": { display: "block" } }}>
                    {rank.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 18, left: 36, right: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Pulse size={6} />
          <span style={{ color: "#1A5632", fontSize: 10, letterSpacing: 2 }}>LIVE</span>
        </div>
        <span style={{ color: "#0F2A1A", fontSize: 10, letterSpacing: 2 }}>NAU · DEPT. GEOGRAPHY & METEOROLOGY · ECOSYNTHRA LAB</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#1A5632", fontSize: 10 }}>{roster.length} ANALYSTS</span>
          <Pulse size={6} />
        </div>
      </div>
    </div>
  );
}
