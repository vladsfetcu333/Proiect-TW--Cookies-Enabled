/**
 * Bug routes:
 * - create bug (TST)
 * - list bugs for project (MP)
 * - assign to me (MP)
 * - add status update (MP)
 *
 * External service used:
 * - GitHub API validation for commit URLs
 */
const express = require("express");
const { prisma } = require("../prismaClient");
const { authRequired } = require("../middleware/authRequired");
const { requireProjectRole } = require("../middleware/requireProjectRole");
const { validateCommit } = require("../services/githubService");

const router = express.Router();

/**
 * POST /projects/:id/bugs
 * Body: { severity, priority, description, commitUrlReported }
 * Only TST in project
 */
router.post(
  "/projects/:id/bugs",
  authRequired,
  requireProjectRole({ projectIdParam: "id", roles: ["TST"] }),
  async (req, res) => {
    try {
      const projectId = req.params.id;
      const { severity, priority, description, commitUrlReported } = req.body;

      if (!severity || !priority || !description || !commitUrlReported) {
        return res.status(400).json({
          message: "severity, priority, description, commitUrlReported are required.",
        });
      }

      // Load project to get repoUrl for external validation
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      // Validate commitUrlReported using GitHub API
      const validation = await validateCommit(project.repoUrl, commitUrlReported);
      if (!validation.ok) {
        return res.status(400).json({
          message: `Invalid commitUrlReported: ${validation.error}`,
        });
      }

      const bug = await prisma.bug.create({
        data: {
          projectId,
          createdByUserId: req.userId,
          severity,
          priority,
          description,
          commitUrlReported,
          status: "OPEN",
        },
      });

      return res.status(201).json({ bug });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

/**
 * GET /projects/:id/bugs
 * Only MP in project
 */
router.get(
  "/projects/:id/bugs",
  authRequired,
  requireProjectRole({ projectIdParam: "id", roles: ["MP"] }),
  async (req, res) => {
    try {
      const projectId = req.params.id;

      const bugs = await prisma.bug.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, email: true, name: true } },
          assignedTo: { select: { id: true, email: true, name: true } },
        },
      });

      return res.json({ bugs });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
  }
);

/**
 * POST /bugs/:id/assign-to-me
 * Only MP in bug's project
 * One MP at a time (if already assigned -> 409)
 */
router.post("/bugs/:id/assign-to-me", authRequired, async (req, res) => {
  try {
    const bugId = req.params.id;

    const bug = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    // must be MP in that project
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: bug.projectId, userId: req.userId } },
    });
    if (!membership || membership.role !== "MP") {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    if (bug.assignedToUserId && bug.assignedToUserId !== req.userId) {
      return res.status(409).json({ message: "Bug already assigned to another MP." });
    }

    const updated = await prisma.bug.update({
      where: { id: bugId },
      data: { assignedToUserId: req.userId, status: "ASSIGNED" },
    });

    return res.json({ bug: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /bugs/:id/status
 * Body: { status, fixCommitUrl, comment }
 * Only MP in bug's project
 * - if status=FIXED -> fixCommitUrl required and validated via GitHub
 */
router.post("/bugs/:id/status", authRequired, async (req, res) => {
  try {
    const bugId = req.params.id;
    const { status, fixCommitUrl, comment } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required." });
    }

    const bug = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!bug) return res.status(404).json({ message: "Bug not found." });

    // must be MP in that project
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: bug.projectId, userId: req.userId } },
    });
    if (!membership || membership.role !== "MP") {
      return res.status(403).json({ message: "Insufficient permissions." });
    }

    // FIXED requires fixCommitUrl + validation against project's repo
    if (status === "FIXED") {
      if (!fixCommitUrl) {
        return res.status(400).json({ message: "fixCommitUrl is required when status is FIXED." });
      }

      const project = await prisma.project.findUnique({ where: { id: bug.projectId } });
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      const validation = await validateCommit(project.repoUrl, fixCommitUrl);
      if (!validation.ok) {
        return res.status(400).json({
          message: `Invalid fixCommitUrl: ${validation.error}`,
        });
      }
    }

    // Enforce "one MP at a time": if someone else assigned, don't allow status update
    // (Optional strictness; comment out if you don't want)
    if (bug.assignedToUserId && bug.assignedToUserId !== req.userId) {
      return res.status(409).json({ message: "Bug is assigned to another MP." });
    }

    // Update bug + create a status history record
    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: {
        status,
        // ensure assigned when moving forward
        ...(status === "ASSIGNED" ? { assignedToUserId: req.userId } : {}),
        ...(status === "FIXED" ? { assignedToUserId: bug.assignedToUserId ?? req.userId } : {}),
      },
    });

    const update = await prisma.bugStatusUpdate.create({
      data: {
        bugId,
        status,
        fixCommitUrl: fixCommitUrl || null,
        comment: comment || null,
        createdByUserId: req.userId,
      },
    });

    return res.json({ bug: updatedBug, update });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = { bugRoutes: router };
