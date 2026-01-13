import React, { useEffect, useMemo, useState } from "react";
import { api, setToken, clearToken, getToken } from "./api";
import "./App.css";

function Badge({ children, variant = "neutral" }) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}

function Button({ children, variant = "primary", size = "md", ...props }) {
  return (
    <button className={`btn btn--${variant} btn--${size}`} {...props}>
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className="input" {...props} />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <textarea className="textarea" {...props} />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select className="select" {...props}>
        {children}
      </select>
    </label>
  );
}

export default function App() {
  // auth
  const [mode, setMode] = useState(getToken() ? "app" : "login"); // login | register | app
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("Test");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  // projects
  const [projects, setProjects] = useState([]); // [{ role, project }]
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectRepoUrl, setNewProjectRepoUrl] = useState("");
  const [joinProjectId, setJoinProjectId] = useState("");
  const [selected, setSelected] = useState(null); // { role, project }

  // bugs
  const [bugs, setBugs] = useState([]);

  // create bug (TST)
  const [bugSeverity, setBugSeverity] = useState("HIGH");
  const [bugPriority, setBugPriority] = useState("P1");
  const [bugDescription, setBugDescription] = useState("");
  const [bugCommitUrl, setBugCommitUrl] = useState("");

  // fix per-bug drafts (MP)
  const [fixDrafts, setFixDrafts] = useState({});
  // { [bugId]: { fixCommitUrl: "", comment: "" } }

  const isAuthed = useMemo(() => Boolean(getToken()), []);
  const appTitle = "Bug Tracker";

  async function loadMe() {
    setError("");
    try {
      const data = await api.me();
      setMe(data.user);
      setMode("app");
      await loadProjects();
    } catch (e) {
      setMe(null);
      clearToken();
      setMode("login");
      setError(e.message);
    }
  }

  async function loadProjects() {
    setError("");
    try {
      const data = await api.myProjects();
      setProjects(data.projects || []);
    } catch (e) {
      setProjects([]);
      setError(e.message);
    }
  }

  async function loadBugs(projectId) {
    setError("");
    try {
      const data = await api.listBugs(projectId);
      setBugs(data.bugs || []);
    } catch (e) {
      setBugs([]);
      setError(e.message);
    }
  }

  async function onSelectProject(p) {
    setSelected(p);
    setBugs([]);
    setBugDescription("");
    setBugCommitUrl("");
    setFixDrafts({});
    setError("");

    if (p.role === "MP") {
      await loadBugs(p.project.id);
    }
  }

  useEffect(() => {
    if (getToken()) loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      await loadMe();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.register({ email, password, name });
      setToken(data.token);
      await loadMe();
    } catch (e2) {
      setError(e2.message);
    }
  }

  function onLogout() {
    clearToken();
    setMe(null);
    setProjects([]);
    setSelected(null);
    setBugs([]);
    setFixDrafts({});
    setMode("login");
    setError("");
  }

  const selectedRole = selected?.role;
  const selectedProject = selected?.project;

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar__left">
          <div className="logo">
            <div className="logo__mark">🪲</div>
            <div className="logo__text">
              <div className="logo__title">{appTitle}</div>
              <div className="logo__sub">SPA • REST • Prisma • GitHub validation</div>
            </div>
          </div>
        </div>

        <div className="topbar__right">
          {mode === "app" && me ? (
            <div className="userchip">
              <div className="userchip__meta">
                <div className="userchip__name">{me.name || "User"}</div>
                <div className="userchip__email">{me.email}</div>
              </div>
              <Button variant="ghost" onClick={loadMe} title="Refresh /me">
                Refresh
              </Button>
              <Button variant="danger" onClick={onLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="userchip">
              <Badge variant={isAuthed ? "ok" : "neutral"}>{isAuthed ? "Token set" : "Logged out"}</Badge>
            </div>
          )}
        </div>
      </header>

      <main className="content">
        {error ? (
          <div className="alert alert--error">
            <div className="alert__title">Something went wrong</div>
            <div className="alert__body">{error}</div>
          </div>
        ) : null}

        {(mode === "login" || mode === "register") && (
          <div className="auth">
            <div className="card auth__card">
              <div className="card__header">
                <h2 className="card__title">{mode === "login" ? "Welcome back" : "Create account"}</h2>
                <p className="card__subtitle">
                  {mode === "login"
                    ? "Log in to manage projects, bugs and fixes."
                    : "Register to join a project as MP or TST."}
                </p>
              </div>

              <div className="card__body">
                {mode === "register" ? (
                  <form className="stack" onSubmit={onRegister}>
                    <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="row row--end">
                      <Button variant="ghost" type="button" onClick={() => setMode("login")}>
                        I already have an account
                      </Button>
                      <Button type="submit">Register</Button>
                    </div>
                  </form>
                ) : (
                  <form className="stack" onSubmit={onLogin}>
                    <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="row row--end">
                      <Button variant="ghost" type="button" onClick={() => setMode("register")}>
                        Create account
                      </Button>
                      <Button type="submit">Login</Button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card__footer">
                <div className="hint">
                  Tip: folosește conturile tale <Badge variant="neutral">MP</Badge> și <Badge variant="neutral">TST</Badge>{" "}
                  ca să vezi permisiunile diferite.
                </div>
              </div>
            </div>

            <div className="auth__side">
              <div className="card card--glass">
                <div className="card__header">
                  <h3 className="card__title">Flow-ul aplicației</h3>
                </div>
                <div className="card__body">
                  <ol className="steps">
                    <li>Login / Register</li>
                    <li>My Projects (MP/TST)</li>
                    <li>MP vede bugs, își alocă, marchează FIXED</li>
                    <li>TST raportează bug cu commit valid</li>
                    <li>GitHub API validează commit-urile</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "app" && me && (
          <div className="grid">
            {/* LEFT: Projects */}
            <section className="card">
              <div className="card__header card__header--row">
                <div>
                  <h3 className="card__title">My Projects</h3>
                  <p className="card__subtitle">Selectează un proiect ca să vezi bug-urile / să raportezi.</p>
                </div>
                <Button variant="ghost" onClick={loadProjects}>
                  Refresh
                </Button>
              </div>

              <div className="card__body">
                {projects.length === 0 ? (
                  <div className="empty">
                    <div className="empty__emoji">📭</div>
                    <div className="empty__title">No projects yet</div>
                    <div className="empty__text">Creează un proiect sau fă join ca tester.</div>
                  </div>
                ) : (
                  <div className="list">
                    {projects.map((p) => {
                      const isActive = selectedProject?.id === p.project.id;
                      const roleVariant = p.role === "MP" ? "ok" : "neutral";
                      return (
                        <button
                          key={p.project.id}
                          className={`listitem ${isActive ? "listitem--active" : ""}`}
                          onClick={() => onSelectProject(p)}
                        >
                          <div className="listitem__top">
                            <div className="listitem__title">{p.project.name}</div>
                            <Badge variant={roleVariant}>{p.role}</Badge>
                          </div>
                          <div className="listitem__sub">{p.project.repoUrl}</div>
                          <div className="listitem__meta">ID: {p.project.id}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="split">
                  <div className="card card--soft">
                    <div className="card__header">
                      <h4 className="card__title">Create project</h4>
                      <p className="card__subtitle">Creator devine automat MP.</p>
                    </div>
                    <div className="card__body">
                      <div className="stack">
                        <Input
                          label="Project name"
                          placeholder="My Project"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        <Input
                          label="Repo URL"
                          placeholder="https://github.com/facebook/react"
                          value={newProjectRepoUrl}
                          onChange={(e) => setNewProjectRepoUrl(e.target.value)}
                        />
                        <Button
                          onClick={async () => {
                            try {
                              setError("");
                              await api.createProject({ name: newProjectName, repoUrl: newProjectRepoUrl });
                              setNewProjectName("");
                              setNewProjectRepoUrl("");
                              await loadProjects();
                            } catch (e) {
                              setError(e.message);
                            }
                          }}
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="card card--soft">
                    <div className="card__header">
                      <h4 className="card__title">Join as tester</h4>
                      <p className="card__subtitle">Introdu Project ID.</p>
                    </div>
                    <div className="card__body">
                      <div className="stack">
                        <Input
                          label="Project ID"
                          placeholder="cmk..."
                          value={joinProjectId}
                          onChange={(e) => setJoinProjectId(e.target.value)}
                        />
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            try {
                              setError("");
                              await api.joinTester(joinProjectId);
                              setJoinProjectId("");
                              await loadProjects();
                            } catch (e) {
                              setError(e.message);
                            }
                          }}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT: Selected project actions */}
            <section className="card">
              <div className="card__header">
                <h3 className="card__title">Project Workspace</h3>
                <p className="card__subtitle">
                  {selectedProject ? "Acțiuni în funcție de rol." : "Selectează un proiect din stânga."}
                </p>
              </div>

              <div className="card__body">
                {!selectedProject ? (
                  <div className="empty">
                    <div className="empty__emoji">🧭</div>
                    <div className="empty__title">No project selected</div>
                    <div className="empty__text">Alege un proiect pentru a vedea bug-urile sau pentru a raporta.</div>
                  </div>
                ) : (
                  <>
                    <div className="projectHeader">
                      <div>
                        <div className="projectHeader__name">{selectedProject.name}</div>
                        <div className="projectHeader__repo">{selectedProject.repoUrl}</div>
                      </div>
                      <div className="projectHeader__badges">
                        <Badge variant={selectedRole === "MP" ? "ok" : "neutral"}>{selectedRole}</Badge>
                        <Badge variant="neutral">Bugs: {bugs.length}</Badge>
                      </div>
                    </div>

                    {selectedRole === "MP" && (
                      <>
                        <div className="row row--between">
                          <h4 className="sectionTitle">Bugs</h4>
                          <Button variant="ghost" onClick={() => loadBugs(selectedProject.id)}>
                            Refresh bugs
                          </Button>
                        </div>

                        {bugs.length === 0 ? (
                          <div className="empty empty--small">
                            <div className="empty__emoji">🧊</div>
                            <div className="empty__title">No bugs</div>
                            <div className="empty__text">Testerii pot raporta bug-uri cu commit valid.</div>
                          </div>
                        ) : (
                          <div className="bugList">
                            {bugs.map((b) => {
                              const draft = fixDrafts[b.id] || { fixCommitUrl: "", comment: "" };

                              return (
                                <div key={b.id} className="bugCard">
                                  <div className="bugCard__top">
                                    <div className="bugCard__title">{b.description}</div>
                                    <div className="bugCard__tags">
                                      <Badge variant="neutral">{b.severity}</Badge>
                                      <Badge variant="neutral">{b.priority}</Badge>
                                      <Badge
                                        variant={b.status === "FIXED" ? "ok" : b.status === "ASSIGNED" ? "warn" : "neutral"}
                                      >
                                        {b.status}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="bugCard__meta">
                                    <div className="mono">Bug ID: {b.id}</div>
                                    <div className="mono">Commit: {b.commitUrlReported}</div>
                                    <div className="mono">
                                      Assigned: {b.assignedTo ? (b.assignedTo.name || b.assignedTo.email) : "—"}
                                    </div>
                                  </div>

                                  <div className="bugCard__actions">
                                    <Button
                                      variant="secondary"
                                      onClick={async () => {
                                        try {
                                          setError("");
                                          await api.assignBugToMe(b.id);
                                          await loadBugs(selectedProject.id);
                                        } catch (e) {
                                          setError(e.message);
                                        }
                                      }}
                                    >
                                      Assign to me
                                    </Button>
                                  </div>

                                  <div className="fixBox">
                                    <Input
                                      label="Fix commit URL (GitHub commit link)"
                                      placeholder="https://github.com/OWNER/REPO/commit/..."
                                      value={draft.fixCommitUrl}
                                      onChange={(e) =>
                                        setFixDrafts((prev) => ({
                                          ...prev,
                                          [b.id]: { ...draft, fixCommitUrl: e.target.value },
                                        }))
                                      }
                                    />
                                    <Input
                                      label="Comment"
                                      placeholder="Fixed NPE in auth..."
                                      value={draft.comment}
                                      onChange={(e) =>
                                        setFixDrafts((prev) => ({
                                          ...prev,
                                          [b.id]: { ...draft, comment: e.target.value },
                                        }))
                                      }
                                    />
                                    <div className="row row--end">
                                      <Button
                                        variant="primary"
                                        onClick={async () => {
                                          try {
                                            setError("");
                                            await api.setBugStatus(b.id, {
                                              status: "FIXED",
                                              fixCommitUrl: draft.fixCommitUrl,
                                              comment: draft.comment,
                                            });

                                            setFixDrafts((prev) => {
                                              const copy = { ...prev };
                                              delete copy[b.id];
                                              return copy;
                                            });

                                            await loadBugs(selectedProject.id);
                                          } catch (e) {
                                            setError(e.message);
                                          }
                                        }}
                                      >
                                        Mark FIXED
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {selectedRole === "TST" && (
                      <div className="card card--soft">
                        <div className="card__header">
                          <h4 className="card__title">Report a bug</h4>
                          <p className="card__subtitle">Commit-ul este validat prin GitHub API.</p>
                        </div>
                        <div className="card__body">
                          <div className="stack">
                            <div className="split2">
                              <Select label="Severity" value={bugSeverity} onChange={(e) => setBugSeverity(e.target.value)}>
                                <option>LOW</option>
                                <option>MEDIUM</option>
                                <option>HIGH</option>
                                <option>CRITICAL</option>
                              </Select>

                              <Select label="Priority" value={bugPriority} onChange={(e) => setBugPriority(e.target.value)}>
                                <option>P1</option>
                                <option>P2</option>
                                <option>P3</option>
                                <option>P4</option>
                              </Select>
                            </div>

                            <TextArea
                              label="Description"
                              rows={3}
                              placeholder="Steps to reproduce / expected / actual..."
                              value={bugDescription}
                              onChange={(e) => setBugDescription(e.target.value)}
                            />

                            <Input
                              label="Commit URL reported"
                              placeholder="https://github.com/OWNER/REPO/commit/..."
                              value={bugCommitUrl}
                              onChange={(e) => setBugCommitUrl(e.target.value)}
                            />

                            <div className="row row--end">
                              <Button
                                onClick={async () => {
                                  try {
                                    setError("");
                                    await api.createBug(selectedProject.id, {
                                      severity: bugSeverity,
                                      priority: bugPriority,
                                      description: bugDescription,
                                      commitUrlReported: bugCommitUrl,
                                    });
                                    setBugDescription("");
                                    setBugCommitUrl("");
                                    alert("Bug created!");
                                  } catch (e) {
                                    setError(e.message);
                                  }
                                }}
                              >
                                Create bug
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        <span className="footer__muted">© {new Date().getFullYear()} Bug Tracker • Proiect Tehnologii Web</span>
      </footer>
    </div>
  );
}
