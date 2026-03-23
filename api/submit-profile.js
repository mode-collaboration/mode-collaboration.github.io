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

// Title-case folder name: "Hamza Hanif" -> "Hamza-Hanif"
function folderName(input) {
  return input
    .trim()
    .replace(/\s+/g, '-');
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

// Map role names to role_rank values used by the Hugo Blox people block
const ROLE_RANKS = {
  'Principal Investigator/Professor': 1,
  'Affiliated Researcher': 2,
  'PhD Candidate': 3,
  'Collaborator': 4,
  'B.Sc/Master': 5,
};

// Map social icon names to icon_pack values
const ICON_PACKS = {
  envelope: 'fas',
  link: 'fas',
  'x-twitter': 'fab',
  github: 'fab',
  'google-scholar': 'ai',
  orcid: 'ai',
  researchgate: 'ai',
  linkedin: 'fab',
};

function esc(str) {
  return (str || '').replace(/"/g, '\\"');
}

function buildMarkdown({ name, role, affiliation, orgUrl, bio, interests, education, socialLinks }) {
  const slug = slugify(name);
  const roleRank = ROLE_RANKS[role] || 6;

  // Build social array (structured for Hugo Blox)
  let socialYaml = '';
  const socialItems = Array.isArray(socialLinks) ? socialLinks : [];
  if (socialItems.length) {
    socialYaml = 'social:\n' + socialItems.map(s => {
      const pack = ICON_PACKS[s.icon] || 'fas';
      const link = s.icon === 'envelope' ? `'mailto:${s.link.replace(/^mailto:/, '')}'` : s.link;
      return `- icon: ${s.icon}\n  icon_pack: ${pack}\n  link: ${link}`;
    }).join('\n');
  } else {
    socialYaml = 'social: []';
  }

  // Build interests
  let interestsYaml = '';
  const interestItems = Array.isArray(interests) ? interests.filter(Boolean) : [];
  if (interestItems.length) {
    interestsYaml = 'interests:\n' + interestItems.map(i => `- ${i}`).join('\n');
  } else {
    interestsYaml = 'interests: []';
  }

  // Build education
  let educationYaml = '';
  const eduItems = Array.isArray(education) ? education.filter(e => e.course || e.institution) : [];
  if (eduItems.length) {
    educationYaml = 'education:\n  courses:\n' + eduItems.map(e => {
      let entry = `  - course: ${e.course || ''}`;
      if (e.institution) entry += `\n    institution: ${e.institution}`;
      if (e.year) entry += `\n    year: ${e.year}`;
      return entry;
    }).join('\n');
  } else {
    educationYaml = 'education:\n  courses: []';
  }

  const frontmatter = [
    '---',
    `title: "${esc(name)}"`,
    'authors:',
    `- "${slug}"`,
    'superuser: false',
    `role: "${esc(role)}"`,
    `role_rank: ${roleRank}`,
    'organizations:',
    `- name: "${esc(affiliation)}"`,
    `  url: "${esc(orgUrl || '')}"`,
    `bio: "${esc(bio)}"`,
    interestsYaml,
    educationYaml,
    socialYaml,
    'highlight_name: true',
    'user_groups:',
    `- "${esc(role)}"`,
    '---',
  ].join('\n');

  return `${frontmatter}\n\n{style="text-align: justify;"}\n${bio}\n`;
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
      name,
      role,
      affiliation,
      orgUrl,
      bio,
      interests,
      education,
      socialLinks,
      accessKey,
      imageDataUrl,
    } = body || {};

    if (!name || !role || !accessKey) {
      return json(res, 400, { error: 'Missing required fields.' });
    }

    if (accessKey !== process.env.FORM_ACCESS_KEY) {
      return json(res, 401, { error: 'Invalid access key.' });
    }

    const slug = slugify(name);
    const folder = folderName(name);
    if (!slug || !folder) {
      return json(res, 400, { error: 'Name produced an invalid slug.' });
    }

    const authorDir = `content/authors/${folder}`;
    const markdownPath = `${authorDir}/_index.md`;

    let base64Body;
    if (imageDataUrl) {
      ({ base64Body } = parseDataUrl(imageDataUrl));
    }
    const imagePath = `${authorDir}/avatar.jpg`;

    const markdown = buildMarkdown({
      name,
      role,
      affiliation,
      orgUrl,
      bio,
      interests,
      education,
      socialLinks,
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
      path: markdownPath,
      contentBase64: Buffer.from(markdown, 'utf8').toString('base64'),
      branch: branchName,
      message: `Add/update member profile: ${name}`,
    });

    if (imageDataUrl) {
      await createOrUpdateFile({
        path: imagePath,
        contentBase64: base64Body,
        branch: branchName,
        message: `Add/update member avatar: ${name}`,
      });
    }

    const pr = await githubRequest(`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: {
        title: `Add/update member: ${name}`,
        head: branchName,
        base: defaultBranch,
        body: `Automated profile submission for **${name}**.\nFolder: \`content/authors/${folder}/\`\n\nPlease review and merge.`,
        draft: true,
      },
    });

    return json(res, 200, { success: true, prUrl: pr.html_url, branch: branchName, slug });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error.' });
  }
};