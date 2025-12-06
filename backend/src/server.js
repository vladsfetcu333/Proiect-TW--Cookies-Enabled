const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let projects = [
  { id: 1, name: "Proiect demo", description: "Primul proiect" }
];

let bugs = [
  {
    id: 1,
    title: "Bug demo",
    description: "bug de test",
    status: "OPEN",
    projectId: 1,
    commitLink: null
  }
];

app.get("/", (req, res) => {
  res.json({ message: "BugTracker Pro API is running" });
});

app.get("/api/projects", (req, res) => {
  res.json(projects);
});

app.post("/api/projects", (req, res) => {
  const { name, description } = req.body;
  const newProject = {
    id: projects.length + 1,
    name,
    description: description || ""
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});
app.get("/api/bugs", (req, res) => {
  const { projectId } = req.query;
  let result = bugs;
  if (projectId) {
    result = bugs.filter(b => b.projectId === Number(projectId));
  }
  res.json(result);
});

app.post("/api/bugs", (req, res) => {
  const { title, description, projectId } = req.body;
  const newBug = {
    id: bugs.length + 1,
    title,
    description,
    status: "OPEN",
    projectId: Number(projectId),
    commitLink: null
  };
  bugs.push(newBug);
  res.status(201).json(newBug);
});

app.patch("/api/bugs/:id", (req, res) => {
  const bugId = Number(req.params.id);
  const bug = bugs.find(b => b.id === bugId);
  if (!bug) {
    return res.status(404).json({ error: "Bug not found" });
  }

  const { status, commitLink } = req.body;
  if (status) bug.status = status;
  if (commitLink) bug.commitLink = commitLink;

  res.json(bug);
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
