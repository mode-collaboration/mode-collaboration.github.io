---
title: Submit Profile
summary: Submit your team profile for review.
slug: submit
type: landing
---

<div class="submit-profile-page">
  <p>Use this form to submit your profile. A draft pull request will be opened automatically for maintainers to review.</p>

  <form id="submit-profile-form">
    <label for="name">Name *</label>
    <input id="name" name="name" type="text" required />

    <label for="role">Role *</label>
    <input id="role" name="role" type="text" required />

    <label for="affiliation">Affiliation *</label>
    <input id="affiliation" name="affiliation" type="text" required />

    <label for="bio">Bio *</label>
    <textarea id="bio" name="bio" rows="4" required></textarea>

    <label for="email">Email *</label>
    <input id="email" name="email" type="email" required />

    <label for="social_links">Social links (comma-separated URLs)</label>
    <input id="social_links" name="social_links" type="text" placeholder="https://github.com/yourname, https://www.linkedin.com/in/yourname" />

    <label for="avatar">Avatar image (jpg/png) *</label>
    <input id="avatar" name="avatar" type="file" accept="image/*" required />

    <label for="access_key">Access key *</label>
    <input id="access_key" name="access_key" type="password" required />

    <button type="submit" id="submit-btn">Submit</button>
  </form>

  <p id="submit-status" aria-live="polite"></p>
</div>

<script>
  const form = document.getElementById('submit-profile-form');
  const statusEl = document.getElementById('submit-status');
  const submitBtn = document.getElementById('submit-btn');

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read avatar file.'));
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusEl.textContent = 'Submitting profile...';
    submitBtn.disabled = true;

    try {
      const avatarFile = document.getElementById('avatar').files[0];
      if (!avatarFile) {
        throw new Error('Avatar image is required.');
      }

      const avatarDataUrl = await fileToDataUrl(avatarFile);
      const payload = {
        name: document.getElementById('name').value.trim(),
        role: document.getElementById('role').value.trim(),
        affiliation: document.getElementById('affiliation').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        email: document.getElementById('email').value.trim(),
        socialLinks: document
          .getElementById('social_links')
          .value
          .split(',')
          .map((link) => link.trim())
          .filter(Boolean),
        accessKey: document.getElementById('access_key').value,
        avatarDataUrl,
        avatarFilename: avatarFile.name,
        avatarMimeType: avatarFile.type
      };

      const response = await fetch('https://mode-demo-github-io.vercel.app/api/submit-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed.');
      }

      statusEl.innerHTML = `Submitted successfully. Draft PR: <a href="${result.pullRequestUrl}" target="_blank" rel="noopener">${result.pullRequestUrl}</a>`;
      form.reset();
    } catch (error) {
      statusEl.textContent = error.message || 'Submission failed.';
    } finally {
      submitBtn.disabled = false;
    }
  });
</script>

<style>
  .submit-profile-page {
    max-width: 740px;
  }

  #submit-profile-form {
    display: grid;
    gap: 0.75rem;
  }

  #submit-profile-form input,
  #submit-profile-form textarea,
  #submit-profile-form button {
    font: inherit;
    padding: 0.6rem;
  }

  #submit-profile-form button {
    width: fit-content;
    cursor: pointer;
  }

  #submit-status {
    margin-top: 1rem;
    font-weight: 600;
  }
</style>
