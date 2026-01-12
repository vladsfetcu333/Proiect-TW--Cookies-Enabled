/**
 * GitHub integration service (external API)
 * Uses GitHub REST API v3
 */

function parseGitHubRepoUrl(repoUrl) {
  // supports:
  // https://github.com/OWNER/REPO
  // https://github.com/OWNER/REPO.git
  try {
    const u = new URL(repoUrl);
    if (u.hostname !== "github.com") return null;

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    return { owner, repo };
  } catch {
    return null;
  }
}

function parseGitHubCommitHash(commitUrl) {
  // supports:
  // https://github.com/OWNER/REPO/commit/HASH
  try {
    const u = new URL(commitUrl);
    if (u.hostname !== "github.com") return null;

    const parts = u.pathname.split("/").filter(Boolean);
    // [OWNER, REPO, "commit", HASH]
    if (parts.length < 4) return null;
    if (parts[2] !== "commit") return null;

    const hash = parts[3];
    if (!hash || hash.length < 6) return null;

    return hash;
  } catch {
    return null;
  }
}

function isAscii(str) {
  return /^[\x00-\x7F]*$/.test(str);
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bug-tracker-student-app",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token && isAscii(token)) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  return headers;
}

async function fetchRepoInfo(repoUrl) {
  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed) {
    return { ok: false, error: "Invalid GitHub repoUrl format." };
  }

  const { owner, repo } = parsed;
  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: githubHeaders(),
  });

  if (!resp.ok) {
    return { ok: false, error: `GitHub repo not found or not accessible (status ${resp.status}).` };
  }

  const data = await resp.json();
  return {
    ok: true,
    data: {
      full_name: data.full_name,
      private: data.private,
      html_url: data.html_url,
      default_branch: data.default_branch,
      description: data.description,
      stargazers_count: data.stargazers_count,
      open_issues_count: data.open_issues_count,
    },
  };
}

async function validateCommit(repoUrl, commitUrl) {
  const parsedRepo = parseGitHubRepoUrl(repoUrl);
  if (!parsedRepo) return { ok: false, error: "Invalid GitHub repoUrl format." };

  const hash = parseGitHubCommitHash(commitUrl);
  if (!hash) return { ok: false, error: "Invalid GitHub commitUrl format." };

  const { owner, repo } = parsedRepo;

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${hash}`, {
    headers: githubHeaders(),
  });

  if (!resp.ok) {
    return { ok: false, error: `Commit not found in repo (status ${resp.status}).` };
  }

  const data = await resp.json();
  return {
    ok: true,
    data: {
      sha: data.sha,
      html_url: data.html_url,
      message: data.commit?.message,
      author: data.commit?.author?.name,
      date: data.commit?.author?.date,
    },
  };
}

async function listCommits(repoUrl, limit = 10) {
  const parsed = parseGitHubRepoUrl(repoUrl);
  if (!parsed) return { ok: false, error: "Invalid GitHub repoUrl format." };

  const { owner, repo } = parsed;
  const n = Math.max(1, Math.min(Number(limit) || 10, 30));

  const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${n}`, {
    headers: githubHeaders(),
  });

  if (!resp.ok) {
    return { ok: false, error: `Could not list commits (status ${resp.status}).` };
  }

  const data = await resp.json();
  return {
    ok: true,
    data: data.map((c) => ({
      sha: c.sha,
      html_url: c.html_url,
      message: c.commit?.message,
      author: c.commit?.author?.name,
      date: c.commit?.author?.date,
    })),
  };
}

module.exports = {
  parseGitHubRepoUrl,
  parseGitHubCommitHash,
  fetchRepoInfo,
  validateCommit,
  listCommits,
};
