const REQUIRED_ENV = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'FORM_ACCESS_KEY'];

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function missingEnvVars() {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

async function githubRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'bib-submission-handler',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.message ? `GitHub API error: ${data.message}` : 'GitHub API request failed.';
    throw new Error(msg);
  }
  return data;
}

module.exports = async function handler(req, res) {
  const allowedOrigin = 'https://mode-demo.github.io';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return json(res, 405, { error: 'Method not allowed. Use POST.' });
    }

    const missing = missingEnvVars();
    if (missing.length) {
      return json(res, 500, { error: `Missing env vars: ${missing.join(', ')}` });
    }

    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body || '{}');
    }

    const { bibtex, accessKey } = body || {};

    if (!bibtex || !accessKey) {
      return json(res, 400, { error: 'Missing required fields (bibtex, accessKey).' });
    }

    if (accessKey !== process.env.FORM_ACCESS_KEY) {
      return json(res, 401, { error: 'Invalid access key.' });
    }

    const trimmed = bibtex.trim();
    if (!trimmed.startsWith('@')) {
      return json(res, 400, { error: 'Invalid BibTeX: must start with @article, @inproceedings, etc.' });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const bibPath = 'publications.bib';

    const repoData = await githubRequest(`/repos/${owner}/${repo}`);
    const defaultBranch = repoData.default_branch;

    // Get current publications.bib content
    const existing = await githubRequest(
      `/repos/${owner}/${repo}/contents/${bibPath}?ref=${encodeURIComponent(defaultBranch)}`
    );
    const currentContent = Buffer.from(existing.content, 'base64').toString('utf8');

    // Append new bibtex entries
    const updatedContent = currentContent.trimEnd() + '\n\n' + trimmed + '\n';

    // Create branch
    const baseRef = await githubRequest(
      `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
    );

    const timestamp = Date.now();
    const branchName = `bib-submission/${timestamp}`;
    await githubRequest(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: {
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha,
      },
    });

    // Update file
    await githubRequest(`/repos/${owner}/${repo}/contents/${bibPath}`, {
      method: 'PUT',
      body: {
        message: `Add new BibTeX entries`,
        content: Buffer.from(updatedContent, 'utf8').toString('base64'),
        branch: branchName,
        sha: existing.sha,
      },
    });

    // Create draft PR
    const pr = await githubRequest(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: {
        title: `Add new bibliography entries`,
        head: branchName,
        base: defaultBranch,
        body: `Automated BibTeX submission.\n\nNew entries appended to \`publications.bib\`.\nThe publication workflow will auto-generate individual pages after merge.\n\nPlease review and merge.`,
        draft: true,
      },
    });

    return json(res, 200, { success: true, prUrl: pr.html_url, branch: branchName });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error.' });
  }
};
