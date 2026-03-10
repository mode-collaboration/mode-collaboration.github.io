const GITHUB_API_BASE = 'https://api.github.com';

function toTitleSlug(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
}

function toAuthorId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

function stripDataUrlPrefix(dataUrl) {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

function detectAvatarExtension(mimeType = '', filename = '') {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  return 'jpg';
}

function socialEntryFromUrl(url) {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return { icon: 'github', icon_pack: 'fab', link: url };
  if (lower.includes('linkedin.com')) return { icon: 'linkedin', icon_pack: 'fab', link: url };
  if (lower.includes('twitter.com') || lower.includes('x.com')) return { icon: 'x-twitter', icon_pack: 'fab', link: url };
  return { icon: 'link', icon_pack: 'fas', link: url };
}

function buildAuthorMarkdown({ name, authorId, role, affiliation, bio, email, socialLinks }) {
  const socialEntries = [
    { icon: 'envelope', icon_pack: 'fas', link: `mailto:${email}` },
    ...socialLinks.map(socialEntryFromUrl)
  ];

  const socialYaml = socialEntries
    .map((entry) => `  - icon: ${entry.icon}\n    icon_pack: ${entry.icon_pack}\n    link: "${entry.link}"`)
    .join('\n');

  return `---
title: "${name}"
authors:
  - "${authorId}"
superuser: false
role: "${role}"
role_rank: 3
organizations:
  - name: "${affiliation}"
    url: ""
bio: "${bio.replace(/"/g, '\\"')}"
interests: []
education:
  courses: []
social:
${socialYaml}
highlight_name: true
user_groups:
  - "Researchers"
---
`;
}

async function githubRequest(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }

  return response.status === 204 ? null : response.json();
}

async function createFile({ owner, repo, branch, path, contentBase64, message }) {
  return githubRequest(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch
    })
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { GITHUB_OWNER, GITHUB_REPO, FORM_ACCESS_KEY, GITHUB_TOKEN } = process.env;
  if (!GITHUB_OWNER || !GITHUB_REPO || !FORM_ACCESS_KEY || !GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing required environment variables' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const {
      name,
      role,
      affiliation,
      bio,
      email,
      socialLinks = [],
      accessKey,
      avatarDataUrl,
      avatarFilename,
      avatarMimeType
    } = payload;

    if (!name || !role || !affiliation || !bio || !email || !accessKey || !avatarDataUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    if (accessKey !== FORM_ACCESS_KEY) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid access key' }) };
    }

    const slug = toTitleSlug(name);
    const authorId = toAuthorId(name);
    const avatarExt = detectAvatarExtension(avatarMimeType, avatarFilename);
    const markdownContent = buildAuthorMarkdown({
      name,
      authorId,
      role,
      affiliation,
      bio,
      email,
      socialLinks: Array.isArray(socialLinks) ? socialLinks : []
    });

    const repoInfo = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
    const baseBranch = repoInfo.default_branch;
    const baseRef = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${baseBranch}`);

    const branch = `submission/${slug}-${Date.now()}`;
    await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: baseRef.object.sha
      })
    });

    const authorPath = `content/authors/${slug}/_index.md`;
    const avatarPath = `content/authors/${slug}/avatar.${avatarExt}`;

    await createFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch,
      path: authorPath,
      contentBase64: Buffer.from(markdownContent, 'utf8').toString('base64'),
      message: `Add team member profile: ${name}`
    });

    await createFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch,
      path: avatarPath,
      contentBase64: stripDataUrlPrefix(avatarDataUrl),
      message: `Add avatar for ${name}`
    });

    const pr = await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title: `Add team member: ${name}`,
        head: branch,
        base: baseBranch,
        body: `Automated profile submission for **${name}**.\n\nPlease review the new author entry and avatar.`,
        draft: true
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile submitted successfully',
        pullRequestUrl: pr.html_url,
        slug,
        branch
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unexpected error' })
    };
  }
};
