import React, { useEffect, useState } from "react";

function App() {
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);
  useEffect(() => {
    fetch("http://localhost:4000/api/bugs")
      .then(res => res.json())
      .then(data => setBugs(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard BugTracker Pro</h1>

      <h2>Proiecte</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            {p.id}. {p.name} – {p.description}
          </li>
        ))}
      </ul>

      <h2>Bug-uri</h2>
      <ul>
        {bugs.map(b => (
          <li key={b.id}>
            #{b.id} {b.title} – {b.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
