const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";


export function setToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // auth
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),

  // projects
  myProjects: () => request("/projects/my"),
  createProject: (payload) => request("/projects", { method: "POST", body: payload }),
  joinTester: (projectId) => request(`/projects/${projectId}/join-tester`, { method: "POST" }),

  // bugs
  listBugs: (projectId) => request(`/projects/${projectId}/bugs`),
  createBug: (projectId, payload) =>
    request(`/projects/${projectId}/bugs`, { method: "POST", body: payload }),
  assignBugToMe: (bugId) => request(`/bugs/${bugId}/assign-to-me`, { method: "POST" }),
  setBugStatus: (bugId, payload) =>
    request(`/bugs/${bugId}/status`, { method: "POST", body: payload }),
};
