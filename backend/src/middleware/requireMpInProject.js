/**
 * Require the current user to be MP in a given project (by param name)
 */
const { prisma } = require("../prismaClient");

function requireMpInProject(projectIdParam = "id") {
  return async (req, res, next) => {
    try {
      const projectId = req.params[projectIdParam];
      if (!projectId) return res.status(400).json({ message: "Missing project id." });

      const membership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: req.userId } },
      });

      if (!membership) return res.status(403).json({ message: "Not a member of this project." });
      if (membership.role !== "MP") return res.status(403).json({ message: "Insufficient permissions." });

      return next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
  };
}

module.exports = { requireMpInProject };
