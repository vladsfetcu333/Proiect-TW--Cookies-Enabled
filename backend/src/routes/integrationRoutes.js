/**
 * External integrations routes (GitHub)
 */
const express = require("express");
const {
  fetchRepoInfo,
  validateCommit,
  listCommits,
} = require("../services/githubService");

const router = express.Router();

router.get("/github/repo-info", async (req, res) => {
  try {
    const { repoUrl } = req.query;
    if (!repoUrl) return res.status(400).json({ message: "repoUrl is required." });

    const result = await fetchRepoInfo(repoUrl);
    if (!result.ok) return res.status(400).json({ message: result.error });

    return res.json(result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/github/validate-commit", async (req, res) => {
  try {
    const { repoUrl, commitUrl } = req.query;
    if (!repoUrl || !commitUrl) {
      return res.status(400).json({ message: "repoUrl and commitUrl are required." });
    }

    const result = await validateCommit(repoUrl, commitUrl);
    if (!result.ok) return res.status(400).json({ message: result.error });

    return res.json(result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/github/commits", async (req, res) => {
  try {
    const { repoUrl, limit } = req.query;
    if (!repoUrl) return res.status(400).json({ message: "repoUrl is required." });

    const result = await listCommits(repoUrl, limit);
    if (!result.ok) return res.status(400).json({ message: result.error });

    return res.json({ commits: result.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = { integrationRoutes: router };
