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

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    throw new Error('Image must be a valid base64 data URL.');
  }
  return { base64Body: match[2] };
}

function esc(str) {
  return (str || '').replace(/"/g, '\\"');
}

function buildNewsMarkdown({ title, summary, content, authors, tags, date }) {
  const frontmatter = [
    '---',
    `title: "${esc(title)}"`,
    `date: ${date}`,
    `summary: "${esc(summary)}"`,
    'authors:',
    ...(authors.length ? authors.map(a => `- ${a}`) : ['- admin']),
    'tags:',
    ...(tags.length ? tags.map(t => `- ${t}`) : ['- news']),
    'featured: false',
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${content}\n`;
}

async function githubRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'news-submission-handler',
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
      summary,
      content,
      authors,
      tags,
      accessKey,
      imageDataUrl,
    } = body || {};

    if (!title || !content || !accessKey) {
      return json(res, 400, { error: 'Missing required fields (title, content, accessKey).' });
    }

    if (accessKey !== process.env.FORM_ACCESS_KEY) {
      return json(res, 401, { error: 'Invalid access key.' });
    }

    const slug = slugify(title);
    if (!slug) {
      return json(res, 400, { error: 'Title produced an invalid slug.' });
    }

    const date = new Date().toISOString().split('T')[0];
    const postDir = `content/post/${slug}`;
    const markdownPath = `${postDir}/index.md`;

    const authorsList = Array.isArray(authors) ? authors.filter(Boolean) : [];
    const tagsList = Array.isArray(tags) ? tags.filter(Boolean) : [];

    const markdown = buildNewsMarkdown({
      title,
      summary: summary || '',
      content,
      authors: authorsList,
      tags: tagsList,
      date,
    });

    const repo = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
    const defaultBranch = repo.default_branch;

    const baseRef = await githubRequest(
      `/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
    );

    const branchName = `news-submission/${slug}-${Date.now()}`;
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
      message: `Add news post: ${title}`,
    });

    if (imageDataUrl) {
      const { base64Body } = parseDataUrl(imageDataUrl);
      await createOrUpdateFile({
        path: `${postDir}/featured.jpg`,
        contentBase64: base64Body,
        branch: branchName,
        message: `Add featured image for news: ${title}`,
      });
    }

    const pr = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: {
        title: `Add news: ${title}`,
        head: branchName,
        base: defaultBranch,
        body: `Automated news submission: **${title}**\nPath: \`${postDir}/\`\n\nPlease review and merge.`,
        draft: true,
      },
    });

    return json(res, 200, { success: true, prUrl: pr.html_url, branch: branchName, slug });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error.' });
  }
};
