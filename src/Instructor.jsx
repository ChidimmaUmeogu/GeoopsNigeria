import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, get, onValue, update, remove } from "firebase/database";
import { MISSIONS, getRank } from "./data";
import { Pulse, Badge, Card, Btn, SectionLabel, Divider } from "./ui";

const INSTRUCTOR_PIN = "2026";

export default function InstructorView() {
  const [authed, setAuthed]       = useState(false);
  const [pin, setPin]             = useState("");
  const [pinErr, setPinErr]       = useState(false);
  const [tab, setTab]             = useState("queue");
  const [queue, setQueue]         = useState([]);
  const [roster, setRoster]       = useState([]);
  const [session, setSession]     = useState(null);
  const [missionIdx, setMission]  = useState(0);
  const [intelText, setIntel]     = useState("");
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    if (!authed) return;
    const unsubQ = onValue(ref(db, "queue"), snap => {
      const d = snap.val() || {};
      setQueue(Object.values(d).filter(i => i.status === "pending").sort((a,b) => a.submittedAt - b.submittedAt));
    });
    const unsubR = onValue(ref(db, "roster"), snap => {
      const d = snap.val() || {};
      setRoster(Object.values(d).sort((a,b) => (b.score||0)-(a.score||0)));
    });
    const unsubS = onValue(ref(db, "session/current"), snap => setSession(snap.val()));
    return () => { unsubQ(); unsubR(); unsubS(); };
  }, [authed]);

  function auth() {
    if (pin === INSTRUCTOR_PIN) { setAuthed(true); setPinErr(false); }
    else { setPinErr(true); setPin(""); }
  }

  async function startMission() {
    const m = MISSIONS[missionIdx];
    await set(ref(db, "session/current"), { missionId: m.id, startedAt: Date.now() });
    await set(ref(db, "queue"), {});
    await set(ref(db, "session/intel"), { text: "", droppedAt: 0 });
  }

  async function endMission() {
    await remove(ref(db, "session/current"));
    await set(ref(db, "session/intel"), { text: "", droppedAt: 0 });
  }

  async function approve(item) {
    const key = `${item.studentId}_${item.taskId}`;
    const mission = MISSIONS.find(m => m.id === item.missionId);
    const pts = item.isBonus ? mission.bonus.points : (mission.tasks.find(t => t.id === item.taskId)?.points || 0);

    // update student approved + score
    const stuSnap = await get(ref(db, `students/${item.studentId}`));
    const stu = stuSnap.val() || {};
    const newScore = (stu.score || 0) + pts;
    await update(ref(db, `students/${item.studentId}`), {
      [`approved/${item.taskId}`]: true,
      score: newScore
    });
    // update roster score
    await update(ref(db, `roster/${item.studentId}`), {
      score: newScore,
      rank: getRank(newScore).label
    });
    // remove from queue
    await remove(ref(db, `queue/${key}`));
  }

  async function reject(item) {
    const key = `${item.studentId}_${item.taskId}`;
    await update(ref(db, `queue/${key}`), { status: "rejected" });
    // remove pending flag on student
    await update(ref(db, `students/${item.studentId}/pending`), { [item.taskId]: null });
  }

  async function dropIntel() {
    if (!intelText.trim()) return;
    setSending(true);
    await set(ref(db, "session/intel"), { text: intelText.trim(), droppedAt: Date.now() });
    setIntel(""); setSending(false);
  }

  async function clearIntel() {
    await set(ref(db, "session/intel"), { text: "", droppedAt: 0 });
  }

  async function clearAll() {
    if (!confirm("Reset ALL student data, roster and queue? This cannot be undone.")) return;
    await set(ref(db, "students"), {});
    await set(ref(db, "roster"), {});
    await set(ref(db, "queue"), {});
  }

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 320, textAlign: "center", animation: "fadeUp .6s ease" }}>
        <h2 style={{ fontFamily: "var(--display)", color: "var(--gold)", fontSize: 36, letterSpacing: 3, marginBottom: 24 }}>MISSION CONTROL</h2>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && auth()}
          placeholder="INSTRUCTOR PIN"
          style={{
            width: "100%", background: "var(--bg3)", border: `1px solid ${pinErr ? "var(--red)" : "#2A1A00"}`,
            borderRadius: 6, padding: "12px", color: "#fff", fontSize: 14, outline: "none",
            textAlign: "center", letterSpacing: 6, marginBottom: 12,
            animation: pinErr ? "shake .3s ease" : "none"
          }} />
        {pinErr && <p style={{ color: "var(--red)", fontSize: 11, marginBottom: 8 }}>Incorrect PIN</p>}
        <Btn variant="gold" onClick={auth} style={{ width: "100%", padding: 14, fontFamily: "var(--display)", fontSize: 20, letterSpacing: 3 }}>AUTHENTICATE</Btn>
        <p style={{ color: "#1A3A2A", fontSize: 10, marginTop: 16 }}>Default PIN: 1234</p>
      </div>
    </div>
  );

  const activeMission = session ? MISSIONS.find(m => m.id === session.missionId) : null;

  // ── MAIN ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <div style={{ background: "#100800", borderBottom: "1px solid var(--gold)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--display)", color: "var(--gold)", fontSize: 22, letterSpacing: 2 }}>MISSION CONTROL</span>
          {activeMission && <Badge color="var(--green)">{activeMission.id} ACTIVE</Badge>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {queue.length > 0 && (
            <span style={{ background: "var(--red)", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: "bold", animation: "pulse 1s infinite" }}>
              {queue.length}
            </span>
          )}
          <Pulse color="var(--gold)" />
          <span style={{ color: "var(--gold)", fontSize: 10 }}>LIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1A1A1A" }}>
        {[
          ["queue", `VERIFY (${queue.length})`],
          ["roster", `ROSTER (${roster.length})`],
          ["control", "CONTROL"],
        ].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px 8px", background: tab === t ? "var(--bg3)" : "transparent",
            border: "none", borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent",
            color: tab === t ? "var(--gold)" : "var(--muted)", fontSize: 10, letterSpacing: 1, cursor: "pointer"
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ── VERIFY QUEUE ── */}
        {tab === "queue" && (
          <>
            <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 16 }}>Approve to post points live to the leaderboard.</p>
            {queue.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--green-dim)", padding: 60 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 28, letterSpacing: 3 }}>QUEUE CLEAR</div>
                <div style={{ fontSize: 11, marginTop: 8 }}>No pending submissions</div>
              </div>
            ) : queue.map((item, i) => {
              const mission = MISSIONS.find(m => m.id === item.missionId);
              const taskLabel = item.isBonus ? mission?.bonus.label : mission?.tasks.find(t => t.id === item.taskId)?.label;
              const pts = item.isBonus ? mission?.bonus.points : mission?.tasks.find(t => t.id === item.taskId)?.points;
              return (
                <Card key={i} style={{ marginBottom: 12, animation: "fadeUp .3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>{item.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 2 }}>{item.studentId}</div>
                    </div>
                    <Badge color={item.isBonus ? "var(--gold)" : "var(--green)"}>{item.isBonus ? "BONUS +" + pts : pts + " pts"}</Badge>
                  </div>
                  <div style={{ color: "var(--text)", fontSize: 12, lineHeight: 1.5, marginBottom: 14, paddingTop: 8, borderTop: "1px solid #1A1A1A" }}>
                    {taskLabel}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn variant="solid" onClick={() => approve(item)} style={{ flex: 1 }}>✓ APPROVE</Btn>
                    <Btn variant="danger" onClick={() => reject(item)} style={{ flex: 1 }}>✗ REJECT</Btn>
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {/* ── ROSTER ── */}
        {tab === "roster" && (
          <>
            <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 16 }}>Live ranking of all registered analysts.</p>
            {roster.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--green-dim)", padding: 60 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 28, letterSpacing: 3 }}>NO ANALYSTS YET</div>
              </div>
            ) : roster.map((s, i) => {
              const rank = getRank(s.score || 0);
              return (
                <div key={s.studentId} style={{
                  background: "var(--bg3)", border: "1px solid #1A1A1A",
                  borderRadius: 6, padding: "11px 14px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12
                }}>
                  <span style={{ color: "var(--muted)", fontSize: 12, width: 24 }}>#{i + 1}</span>
                  <span style={{ fontSize: 16 }}>{rank.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 12 }}>{s.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 10 }}>{s.studentId}</div>
                  </div>
                  <span style={{ color: rank.color, fontFamily: "var(--display)", fontSize: 22 }}>{s.score || 0}</span>
                </div>
              );
            })}
          </>
        )}

        {/* ── CONTROL ── */}
        {tab === "control" && (
          <>
            <SectionLabel>SESSION CONTROL</SectionLabel>

            {!activeMission ? (
              <Card style={{ marginBottom: 20 }}>
                <label style={{ display: "block", color: "var(--muted)", fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>SELECT MISSION</label>
                <select value={missionIdx} onChange={e => setMission(+e.target.value)}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", marginBottom: 16 }}>
                  {MISSIONS.map((m, i) => <option key={m.id} value={i}>{m.id}: {m.code}</option>)}
                </select>
                <Btn variant="solid" onClick={startMission} style={{ width: "100%", padding: 14, fontFamily: "var(--display)", fontSize: 20, letterSpacing: 2 }}>
                  ▶ INITIATE MISSION
                </Btn>
              </Card>
            ) : (
              <Card accent style={{ marginBottom: 20 }}>
                <div style={{ color: "var(--green)", fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>ACTIVE MISSION</div>
                <div style={{ color: "#fff", fontFamily: "var(--display)", fontSize: 22, marginBottom: 4 }}>{activeMission.code}</div>
                <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 16 }}>{activeMission.topic} · {activeMission.aoi}</div>
                <Btn variant="danger" onClick={endMission} style={{ width: "100%", padding: 12, fontFamily: "var(--display)", fontSize: 18, letterSpacing: 2 }}>
                  ■ END MISSION
                </Btn>
              </Card>
            )}

            <Divider />
            <SectionLabel>⚡ INTEL DROP</SectionLabel>
            <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 12, lineHeight: 1.6 }}>Push a mid-session scenario update to all student screens instantly.</p>

            <textarea value={intelText} onChange={e => setIntel(e.target.value)}
              placeholder="e.g. INTEL UPDATE: Flood extent expanded — extend your AOI 10km north..."
              style={{ width: "100%", background: "var(--bg3)", border: "1px solid #2A1A00", borderRadius: 6, padding: "12px", color: "#fff", fontSize: 12, outline: "none", resize: "vertical", minHeight: 90, marginBottom: 10, lineHeight: 1.6 }} />

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="gold" onClick={dropIntel} disabled={sending || !intelText.trim()} style={{ flex: 2, padding: 12 }}>
                {sending ? "SENDING..." : "⚡ DROP INTEL"}
              </Btn>
              <Btn variant="ghost" onClick={clearIntel} style={{ flex: 1, padding: 12 }}>CLEAR</Btn>
            </div>

            <Divider />
            <SectionLabel>⚠ DANGER ZONE</SectionLabel>
            <Btn variant="danger" onClick={clearAll} style={{ width: "100%", padding: 12 }}>RESET ALL DATA</Btn>
            <p style={{ color: "var(--muted)", fontSize: 10, marginTop: 6 }}>Clears all students, roster and queue. Use at start of new semester.</p>
          </>
        )}
      </div>
    </div>
  );
}
