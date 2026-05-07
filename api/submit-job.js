const REQUIRED_ENV = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'FORM_ACCESS_KEY'];

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function missingEnvVars() {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function esc(str) {
  return (str || '').replace(/"/g, '\\"');
}

function buildJobMarkdown({ title, description, organization, location, jobType, applyUrl, deadline }) {
  const date = new Date().toISOString().split('T')[0];
  const lines = [
    '---',
    `title: "${esc(title)}"`,
    `date: ${date}`,
    `summary: "${esc(description.slice(0, 200))}"`,
    `organization: "${esc(organization)}"`,
    `location: "${esc(location)}"`,
    `job_type: "${esc(jobType)}"`,
    `apply_url: "${esc(applyUrl)}"`,
  ];
  if (deadline) lines.push(`deadline: "${esc(deadline)}"`);
  lines.push(
    'tags:',
    '- opportunities',
    `- ${jobType || 'position'}`,
    '---',
  );

  return lines.join('\n') + `\n\n${description}\n`;
}

async function githubRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'job-submission-handler',
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

async function createOrUpdateFile({ path, contentBase64, branch, message }) {
  let sha;
  try {
    const existing = await githubRequest(
      `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`
    );
    sha = existing.sha;
  } catch (_error) {
    sha = undefined;
  }

  return githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: {
      message,
      content: contentBase64,
      branch,
      ...(sha ? { sha } : {}),
    },
  });
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

    const {
      title,
      description,
      organization,
      location,
      jobType,
      applyUrl,
      deadline,
      accessKey,
    } = body || {};

    if (!title || !description || !accessKey) {
      return json(res, 400, { error: 'Missing required fields (title, description, accessKey).' });
    }

    if (accessKey !== process.env.FORM_ACCESS_KEY) {
      return json(res, 401, { error: 'Invalid access key.' });
    }

    const slug = slugify(title);
    if (!slug) {
      return json(res, 400, { error: 'Title produced an invalid slug.' });
    }

    const jobDir = `content/opportunities/${slug}`;
    const markdownPath = `${jobDir}/index.md`;

    const markdown = buildJobMarkdown({
      title,
      description,
      organization: organization || '',
      location: location || '',
      jobType: jobType || 'Position',
      applyUrl: applyUrl || '',
      deadline: deadline || '',
    });

    const repo = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
    const defaultBranch = repo.default_branch;

    const baseRef = await githubRequest(
      `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
    );

    const branchName = `job-submission/${slug}-${Date.now()}`;
    await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/refs`, {
      method: 'POST',
      body: {
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha,
      },
    });

    await createOrUpdateFile({
      path: markdownPath,
      contentBase64: Buffer.from(markdown, 'utf8').toString('base64'),
      branch: branchName,
      message: `Add/update job opportunity: ${title}`,
    });

    const pr = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: {
        title: `Add job opportunity: ${title}`,
        head: branchName,
        base: defaultBranch,
        body: `Automated job opportunity submission: **${title}**\nPath: \`${jobDir}/\`\n\nPlease review and merge.`,
        draft: true,
      },
    });

    return json(res, 200, { success: true, prUrl: pr.html_url, branch: branchName, slug });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error.' });
  }
};
