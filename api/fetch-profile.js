/**
 * Serverless function to fetch and parse a Hugo Blox / Academic profile page.
 * Returns structured JSON that the profile-submission form can use to pre-fill fields.
 *
 * GET /api/fetch-profile?url=https://example.com/authors/someone/
 */

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

/**
 * Extract YAML front-matter values from raw HTML.
 * Hugo Blox renders structured data in predictable patterns — we parse
 * the rendered HTML rather than requiring access to source markdown.
 */
function parseProfileHtml(html) {
  const result = {};

  // Name — usually in <h1> or .portrait-title h1
  const nameMatch = html.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i);
  if (nameMatch) result.name = decodeEntities(nameMatch[1].trim());

  // Role — .portrait-title h3 or role class
  const roleMatch = html.match(/<h3[^>]*class="[^"]*portrait-title[^"]*"[^>]*>[\s\S]*?<\/h3>/i)
    || html.match(/<div[^>]*class="[^"]*portrait-title[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i);
  if (roleMatch) {
    const roleText = roleMatch[1] || roleMatch[0];
    const clean = roleText.replace(/<[^>]+>/g, '').trim();
    if (clean) result.role = clean;
  }
  // Fallback: look for role in a standalone <h3> after <h1>
  if (!result.role) {
    const h3s = html.match(/<h3[^>]*>(.*?)<\/h3>/gi);
    if (h3s && h3s.length >= 1) {
      const candidate = h3s[0].replace(/<[^>]+>/g, '').trim();
      if (candidate && candidate.length < 80) result.role = candidate;
    }
  }

  // Organization — usually a link under portrait-title or in <h3> after role
  const orgMatch = html.match(/<a[^>]*class="[^"]*portrait-[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/i)
    || html.match(/<div[^>]*class="[^"]*portrait-title[^"]*"[^>]*>[\s\S]*?<h3[^>]*>[\s\S]*?<\/h3>\s*<h3[^>]*>([\s\S]*?)<\/h3>/i);
  if (orgMatch) {
    const orgName = (orgMatch[2] || orgMatch[1] || '').replace(/<[^>]+>/g, '').trim();
    if (orgName) result.affiliation = orgName;
    if (orgMatch[1] && orgMatch[1].startsWith('http')) result.orgUrl = orgMatch[1];
  }

  // Bio — look for biography section
  const bioMatch = html.match(/class="[^"]*biography[^"]*"[\s\S]*?<p>([\s\S]*?)<\/p>/i)
    || html.match(/<div[^>]*class="[^"]*article-style[^"]*"[^>]*>\s*<p>([\s\S]*?)<\/p>/i);
  if (bioMatch) {
    result.bio = bioMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  // Email — mailto links
  const emailMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch) result.email = emailMatch[1];

  // Interests — usually in a <ul> under "Interests" heading
  const interestsSection = html.match(/interests[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (interestsSection) {
    const items = interestsSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (items) {
      result.interests = items.map(li => li.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    }
  }

  // Education — usually in a <ul> under "Education" heading
  const eduSection = html.match(/education[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (eduSection) {
    const items = eduSection[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (items) {
      result.education = items.map(li => {
        const text = li.replace(/<[^>]+>/g, '').trim();
        // Try to parse "PhD Physics, 2020" or "PhD Physics, University, 2020"
        const yearMatch = text.match(/(\d{4})\s*$/);
        const year = yearMatch ? yearMatch[1] : '';
        const rest = yearMatch ? text.slice(0, -yearMatch[0].length).replace(/,\s*$/, '') : text;
        const parts = rest.split(/,\s*/);
        return {
          course: parts[0] || '',
          institution: parts.slice(1).join(', '),
          year,
        };
      }).filter(e => e.course);
    }
  }

  // Social links — icon links in the profile
  const socialLinks = [];
  const socialRegex = /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<(?:i|svg)[^>]*class="[^"]*(?:fa[bsr]?|ai)\s+fa-([a-z\-]+)[^"]*"[^>]*>/gi;
  let match;
  while ((match = socialRegex.exec(html)) !== null) {
    const link = match[1];
    const iconName = match[2];
    const iconMap = {
      envelope: 'envelope',
      twitter: 'x-twitter',
      'x-twitter': 'x-twitter',
      github: 'github',
      'google-scholar': 'google-scholar',
      'graduation-cap': 'google-scholar',
      orcid: 'orcid',
      researchgate: 'researchgate',
      linkedin: 'linkedin',
      'linkedin-in': 'linkedin',
      link: 'link',
      globe: 'link',
    };
    const mapped = iconMap[iconName];
    if (mapped && link) {
      socialLinks.push({
        icon: mapped,
        link: mapped === 'envelope' ? link.replace(/^mailto:/, '') : link,
      });
    }
  }
  if (socialLinks.length) result.social = socialLinks;

  return result;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

module.exports = async function handler(req, res) {
  const allowedOrigin = 'https://mode-demo.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return json(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  const url = req.query && req.query.url;
  if (!url) {
    return json(res, 400, { error: 'Missing "url" query parameter.' });
  }

  // Basic URL validation
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_e) {
    return json(res, 400, { error: 'Invalid URL format.' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return json(res, 400, { error: 'URL must use http or https.' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MODE-ProfileFetcher/1.0',
        Accept: 'text/html',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return json(res, 502, { error: `Could not fetch the page (HTTP ${response.status}).` });
    }

    const html = await response.text();
    const profile = parseProfileHtml(html);

    if (!profile.name) {
      return json(res, 422, { error: 'Could not extract a profile from this page. Make sure it is a Hugo Blox / Academic author page.' });
    }

    return json(res, 200, profile);
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return json(res, 504, { error: 'The page took too long to respond.' });
    }
    return json(res, 500, { error: error.message || 'Failed to fetch profile.' });
  }
};
