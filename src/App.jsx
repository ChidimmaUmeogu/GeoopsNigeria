import { useState, useEffect } from "react";
import "./index.css";
import Landing    from "./Landing";
import Student    from "./Student";
import Instructor from "./Instructor";
import Projector  from "./Projector";

export default function App() {
  const [role, setRole] = useState(null);

  // Allow ?view=projector or ?view=instructor in URL for quick access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    if (v) setRole(v);
  }, []);

  if (!role)       return <Landing onSelect={setRole} />;
  if (role === "student")    return <Student />;
  if (role === "instructor") return <Instructor />;
  if (role === "projector")  return <Projector />;
  return <Landing onSelect={setRole} />;
}
