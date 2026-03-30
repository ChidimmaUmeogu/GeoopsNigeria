import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, set, get, onValue, update } from "firebase/database";
import { MISSIONS, getRank, fmt } from "./data";
import { Pulse, Badge, Card, Btn, SectionLabel } from "./ui";

export default function StudentView() {
  const [screen, setScreen]           = useState("register");
  const [name, setName]               = useState("");
  const [studentId, setStudentId]     = useState("");
  const [activeMission, setMission]   = useState(null);
  const [timeLeft, setTimeLeft]       = useState(0);
  const [checked, setChecked]         = useState({});
  const [pending, setPending]         = useState({});
  const [approved, setApproved]       = useState({});
  const [score, setScore]             = useState(0);
  const [intelDrop, setIntelDrop]     = useState(null);
  const [error, setError]             = useState("");
  const [joining, setJoining]         = useState(false);
  const timerRef = useRef(null);
  const studentRef = useRef(null);

  // Listen for approvals + intel once in mission
  useEffect(() => {
    if (screen !== "mission" || !studentId) return;
    const sRef = ref(db, `students/${studentId}`);
    const unsub = onValue(sRef, snap => {
      const data = snap.val();
      if (!data) return;
      setApproved(data.approved || {});
      setScore(data.score || 0);
    });
    const intelRef = ref(db, "session/intel");
    const unsubIntel = onValue(intelRef, snap => {
      const v = snap.val();
      setIntelDrop(v?.text && v.text.trim() ? v.text : null);
    });
    return () => { unsub(); unsubIntel(); };
  }, [screen, studentId]);

  // Countdown timer — synced to session startedAt
  useEffect(() => {
    if (screen !== "mission" || !activeMission) return;
    const tick = () => {
      get(ref(db, "session/current")).then(snap => {
        const sess = snap.val();
        if (!sess) { setScreen("complete"); return; }
        const elapsed = Math.floor((Date.now() - sess.startedAt) / 1000);
        const left = Math.max(0, activeMission.duration * 60 - elapsed);
        setTimeLeft(left);
        if (left === 0) setScreen("complete");
      });
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, activeMission]);

  async function join() {
    if (!name.trim() || !studentId.trim()) { setError("Enter your name and student ID."); return; }
    setJoining(true); setError("");
    try {
      const sessSnap = await get(ref(db, "session/current"));
      const sess = sessSnap.val();
      if (!sess) { setError("No active mission yet. Wait for your instructor."); setJoining(false); return; }
      const mission = MISSIONS.find(m => m.id === sess.missionId);
      if (!mission) { setError("Mission not found."); setJoining(false); return; }

      // register student
      const existing = (await get(ref(db, `students/${studentId}`))).val();
      if (!existing) {
        await set(ref(db, `students/${studentId}`), {
          name, studentId, missionId: mission.id,
          pending: {}, approved: {}, score: 0, registeredAt: Date.now()
        });
        // add to roster
        const rosterSnap = await get(ref(db, `roster/${studentId}`));
        if (!rosterSnap.val()) {
          await set(ref(db, `roster/${studentId}`), { name, studentId, score: 0, rank: "FIELD ANALYST" });
        }
      }

      studentRef.current = studentId;
      setMission(mission);
      const elapsed = Math.floor((Date.now() - sess.startedAt) / 1000);
      setTimeLeft(Math.max(0, mission.duration * 60 - elapsed));
      setScreen("mission");
    } catch (e) {
      setError("Connection error. Check your internet and try again.");
    }
    setJoining(false);
  }

  async function submitTask(taskId, isBonus = false) {
    if (pending[taskId] || approved[taskId]) return;
    setPending(p => ({ ...p, [taskId]: true }));

    const queueItem = {
      studentId, name, taskId, isBonus,
      missionId: activeMission.id,
      submittedAt: Date.now(), status: "pending"
    };
    const key = `${studentId}_${taskId}`;
    await set(ref(db, `queue/${key}`), queueItem);
    await update(ref(db, `students/${studentId}/pending`), { [taskId]: true });
  }

  const mission = activeMission;
  const timerColor = timeLeft < 300 ? "var(--red)" : timeLeft < 600 ? "var(--gold)" : "var(--green)";

  // ── REGISTER ──────────────────────────────────────────────────────────────
  if (screen === "register") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, animation: "fadeUp .6s ease" }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 38, color: "var(--green)", letterSpacing: 3 }}>FIELD ANALYST</h2>
          <p style={{ color: "var(--muted)", fontSize: 10, letterSpacing: 2, marginTop: 4 }}>REGISTER TO JOIN ACTIVE MISSION</p>
        </div>

        {[
          { label: "FULL NAME", val: name, set: setName, ph: "e.g. Adaeze Okonkwo" },
          { label: "STUDENT ID", val: studentId, set: setStudentId, ph: "e.g. NAU/2021/GEO/042" },
        ].map(({ label, val, set: setter, ph }) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ display: "block", color: "var(--green)", fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>{label}</label>
            <input value={val} onChange={e => setter(e.target.value)}
              onKeyDown={e => e.key === "Enter" && join()}
              placeholder={ph}
              style={{ width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "12px 14px", color: "#fff", fontSize: 12, outline: "none" }} />
          </div>
        ))}

        {error && <p style={{ color: "var(--red)", fontSize: 11, marginBottom: 12, animation: "shake .3s ease" }}>{error}</p>}

        <button onClick={join} disabled={joining} style={{
          width: "100%", background: "var(--green-dim)", border: "none", borderRadius: 6,
          padding: "15px", color: "var(--green)", fontFamily: "var(--display)", fontSize: 22,
          letterSpacing: 3, cursor: joining ? "wait" : "pointer", opacity: joining ? .6 : 1
        }}>
          {joining ? "CONNECTING..." : "DEPLOY TO MISSION"}
        </button>
      </div>
    </div>
  );

  // ── COMPLETE ──────────────────────────────────────────────────────────────
  if (screen === "complete") return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: "var(--display)", fontSize: 56, color: "var(--green)", letterSpacing: 4, animation: "popIn .5s ease" }}>MISSION COMPLETE</div>
      <div style={{ color: "var(--gold)", fontSize: 18 }}>Your score: <strong>{score} pts</strong></div>
      <div style={{ color: "var(--muted)", fontSize: 11 }}>Await instructor verification for final points.</div>
    </div>
  );

  // ── MISSION ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 80 }}>

      {/* Sticky header */}
      <div style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)", padding: "10px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--green)", fontSize: 10, letterSpacing: 1 }}>{name}</div>
            <div style={{ color: "var(--muted)", fontSize: 9 }}>{studentId}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 34, color: timerColor, letterSpacing: 2, lineHeight: 1 }}>{fmt(timeLeft)}</div>
            <div style={{ color: "var(--muted)", fontSize: 8, letterSpacing: 1 }}>REMAINING</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--gold)", fontFamily: "var(--display)", fontSize: 30 }}>{score}</div>
            <div style={{ color: "var(--muted)", fontSize: 8 }}>PTS</div>
          </div>
        </div>
      </div>

      {/* Intel drop */}
      {intelDrop && (
        <div style={{ background: "#1A0F00", borderBottom: "1px solid var(--gold)", padding: "10px 16px", fontSize: 11, color: "var(--gold)", animation: "slideIn .4s ease", display: "flex", gap: 8, alignItems: "center" }}>
          <span>⚡</span><span>{intelDrop}</span>
        </div>
      )}

      <div style={{ padding: 16 }}>
        {/* Mission header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <Badge>{mission.id}</Badge>
            <Badge color="var(--muted)">{mission.mode}</Badge>
            <Badge color="var(--muted)">{mission.aoi}</Badge>
          </div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 26, color: "#fff", letterSpacing: 2, marginBottom: 4 }}>{mission.code}</h2>
          <p style={{ color: "var(--muted)", fontSize: 10 }}>{mission.topic}</p>
        </div>

        {/* Briefing */}
        <Card style={{ marginBottom: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
          {mission.briefing}
        </Card>

        {/* Tip */}
        <div style={{ borderLeft: "3px solid var(--green-dim)", paddingLeft: 12, marginBottom: 22, fontSize: 11, color: "var(--green)", lineHeight: 1.6, fontStyle: "italic" }}>
          💡 {mission.tip}
        </div>

        {/* Tasks */}
        <SectionLabel>MISSION TASKS</SectionLabel>
        {mission.tasks.map(task => {
          const isApproved = approved[task.id];
          const isPending  = pending[task.id] && !isApproved;
          const isChecked  = checked[task.id];
          return (
            <div key={task.id} style={{
              background: isApproved ? "#0A2016" : "var(--bg3)",
              border: `1px solid ${isApproved ? "var(--green)" : isPending ? "var(--gold)" : "#1A2A1A"}`,
              borderRadius: 7, padding: "12px 14px", marginBottom: 9,
              display: "flex", alignItems: "flex-start", gap: 12, transition: "all .3s"
            }}>
              <input type="checkbox" checked={!!isChecked || !!isApproved} onChange={e => setChecked(p => ({ ...p, [task.id]: e.target.checked }))}
                disabled={isApproved || isPending}
                style={{ marginTop: 3, accentColor: "var(--green)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: isApproved ? "var(--green)" : "#CBD5E1", fontSize: 12, lineHeight: 1.5 }}>{task.label}</div>
                <div style={{ color: "var(--gold)", fontSize: 10, marginTop: 4 }}>{task.points} pts</div>
              </div>
              {isApproved ? (
                <span style={{ color: "var(--green)", fontSize: 10, flexShrink: 0 }}>✓ APPROVED</span>
              ) : isPending ? (
                <span style={{ color: "var(--gold)", fontSize: 10, animation: "pulse 1.2s infinite", flexShrink: 0 }}>PENDING…</span>
              ) : isChecked ? (
                <Btn variant="primary" onClick={() => submitTask(task.id)} style={{ padding: "5px 10px", fontSize: 10, flexShrink: 0 }}>SUBMIT</Btn>
              ) : null}
            </div>
          );
        })}

        {/* Bonus */}
        <div style={{
          background: approved.bonus ? "#1A1200" : "var(--bg3)",
          border: `1px solid ${approved.bonus ? "var(--gold)" : "#2A1800"}`,
          borderRadius: 7, padding: "12px 14px", marginTop: 6,
          display: "flex", alignItems: "flex-start", gap: 12
        }}>
          <input type="checkbox" checked={!!checked.bonus || !!approved.bonus} onChange={e => setChecked(p => ({ ...p, bonus: e.target.checked }))}
            disabled={approved.bonus || pending.bonus} style={{ marginTop: 3, accentColor: "var(--gold)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--gold)", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>⭐ BONUS OBJECTIVE</div>
            <div style={{ color: "#CBD5E1", fontSize: 12, lineHeight: 1.5 }}>{mission.bonus.label}</div>
            <div style={{ color: "var(--gold)", fontSize: 10, marginTop: 4 }}>+{mission.bonus.points} pts</div>
          </div>
          {approved.bonus ? (
            <span style={{ color: "var(--gold)", fontSize: 10, flexShrink: 0 }}>✓ APPROVED</span>
          ) : pending.bonus ? (
            <span style={{ color: "var(--gold)", fontSize: 10, animation: "pulse 1.2s infinite", flexShrink: 0 }}>PENDING…</span>
          ) : checked.bonus ? (
            <Btn variant="gold" onClick={() => submitTask("bonus", true)} style={{ padding: "5px 10px", fontSize: 10, flexShrink: 0 }}>SUBMIT</Btn>
          ) : null}
        </div>
      </div>
    </div>
  );
}
