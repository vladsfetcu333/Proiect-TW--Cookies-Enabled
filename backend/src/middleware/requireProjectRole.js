/**
 * Require a specific role (or roles) for a user in a project.
 */
const { prisma } = require("../prismaClient");

/**
 * Usage: requireProjectRole({ projectIdParam: "id", roles: ["MP"] })
 */
function requireProjectRole({ projectIdParam, roles }) {
  return async (req, res, next) => {
    try {
      const projectId = req.params[projectIdParam];
      if (!projectId) {
        return res.status(400).json({ message: "Missing project id." });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: req.userId },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: "Not a member of this project." });
      }

      if (!roles.includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions." });
      }

      req.projectRole = membership.role;
      return next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error." });
    }
  };
}

module.exports = { requireProjectRole };
