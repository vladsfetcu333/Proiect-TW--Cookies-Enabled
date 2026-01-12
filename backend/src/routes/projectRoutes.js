/**
 * Project routes:
 * - create project (creator becomes MP)
 * - join project as tester (TST)
 */
const express = require("express");
const { prisma } = require("../prismaClient");
const { authRequired } = require("../middleware/authRequired");
const { requireMpInProject } = require("../middleware/requireMpInProject");


const router = express.Router();

/**
 * POST /projects
 * Body: { name, repoUrl }
 * Auth: required
 * Result: creates project + membership MP for creator
 */
router.post("/", authRequired, async (req, res) => {
  try {
    const { name, repoUrl } = req.body;

    if (!name || !repoUrl) {
      return res.status(400).json({ message: "name and repoUrl are required." });
    }

    const project = await prisma.project.create({
      data: {
        name,
        repoUrl,
        createdByUserId: req.userId,
        members: {
          create: {
            userId: req.userId,
            role: "MP",
          },
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /projects/:id/join-tester
 * Auth: required
 * Result: current user becomes TST (if not already member)
 */
router.post("/:id/join-tester", authRequired, async (req, res) => {
  try {
    const projectId = req.params.id;

    // ensure project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // check membership
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: req.userId },
      },
    });

    if (existing) {
      return res.status(409).json({ message: `Already a member (${existing.role}).` });
    }

    const membership = await prisma.projectMember.create({
      data: {
        projectId,
        userId: req.userId,
        role: "TST",
      },
    });

    return res.status(201).json({ membership });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});
/**
 * PATCH /projects/:id
 * Body can include: { name?, repoUrl? }
 * Only MP in project
 */
router.patch("/:id", authRequired, requireMpInProject("id"), async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, repoUrl } = req.body;

    if (!name && !repoUrl) {
      return res.status(400).json({ message: "Provide at least one field: name or repoUrl." });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name ? { name } : {}),
        ...(repoUrl ? { repoUrl } : {}),
      },
    });

    return res.json({ project: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});


module.exports = { projectRoutes: router };
