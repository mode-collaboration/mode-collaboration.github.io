const REQUIRED_ENV = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'FORM_ACCESS_KEY', 'BASE_DIRECTORY'];

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

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    throw new Error('Image must be a valid base64 data URL.');
  }

  const mimeType = match[1].toLowerCase();
  const base64Body = match[2];

  const extMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };

  const extension = extMap[mimeType];
  if (!extension) {
    throw new Error('Unsupported image type. Use jpg, png, gif, or webp.');
  }

  return { extension, base64Body };
}

function buildMarkdown({ name, role, affiliation, bio, email, socialLinks, imagePath }) {
  const cleanLinks = (socialLinks || '')
    .split(/\r?\n|,/)
    .map((link) => link.trim())
    .filter(Boolean);

  const linksBlock = cleanLinks.length
    ? cleanLinks.map((link) => `- ${link}`).join('\n')
    : '-';

  return `---\nname: "${name.replace(/"/g, '\\"')}"\nrole: "${role.replace(/"/g, '\\"')}"\naffiliation: "${affiliation.replace(/"/g, '\\"')}"\nemail: "${email.replace(/"/g, '\\"')}"\nimage: "${imagePath}"\n---\n\n${bio}\n\n## Social Links\n${linksBlock}\n`;
}

async function githubRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'profile-submission-handler',
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
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
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
      name,
      role,
      affiliation,
      bio,
      email,
      socialLinks,
      accessKey,
      imageDataUrl,
    } = body || {};

    if (!name || !role || !affiliation || !bio || !email || !accessKey || !imageDataUrl) {
      return json(res, 400, { error: 'Missing required fields.' });
    }

    if (accessKey !== process.env.FORM_ACCESS_KEY) {
      return json(res, 401, { error: 'Invalid access key.' });
    }

    const slug = slugify(name);
    if (!slug) {
      return json(res, 400, { error: 'Name produced an invalid slug.' });
    }

    const { extension, base64Body } = parseDataUrl(imageDataUrl);
    const imagePath = `${process.env.BASE_DIRECTORY}/members_pics/${slug}.${extension}`;
    const markdownPath = `${process.env.BASE_DIRECTORY}/members/${slug}.md`;

    const markdown = buildMarkdown({
      name,
      role,
      affiliation,
      bio,
      email,
      socialLinks,
      imagePath,
    });

    const repo = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
    const defaultBranch = repo.default_branch;

    const baseRef = await githubRequest(
      `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
    );

    const branchName = `member-submission/${slug}-${Date.now()}`;
    await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/refs`, {
      method: 'POST',
      body: {
        ref: `refs/heads/${branchName}`,
        sha: baseRef.object.sha,
      },
    });

    await createOrUpdateFile({
      path: imagePath,
      contentBase64: base64Body,
      branch: branchName,
      message: `Add member image: ${name}`,
    });

    await createOrUpdateFile({
      path: markdownPath,
      contentBase64: Buffer.from(markdown, 'utf8').toString('base64'),
      branch: branchName,
      message: `Add member profile: ${name}`,
    });

    const pr = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: {
        title: `Add member: ${name}`,
        head: branchName,
        base: defaultBranch,
        body: 'Automated profile submission. Please review and merge manually.',
        draft: true,
      },
    });

    return json(res, 200, { success: true, prUrl: pr.html_url, branch: branchName, slug });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error.' });
  }
};