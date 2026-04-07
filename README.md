# Instructions

## Submission Portal

The easiest way to submit content is via the online form at:

**https://mode-demo.github.io/submission.html**

It has four tabs: **Profile**, **Bibliography**, **News**, and **Opportunities**. Each submission creates a draft PR for review.

---

## Profile Add/Update

**Option 1 (recommended):** Use the **Profile** tab at [submission.html](https://mode-demo.github.io/submission.html).

**Option 2 (manual):** Fork this repository and create a new folder with your name (e.g., `Hamza-Hanif`) in `content/authors/`. Inside that folder, add:
- Your profile information in an `_index.md` file (see `content/authors/Hamza-Hanif/_index.md` for a template)
- Your profile picture, renamed as `avatar.jpg`, `avatar.jpeg`, or `avatar.png`

Role ranks: Principal Investigator/Professor (1), Affiliated Researcher (2), PhD Candidate (3), Collaborator (4), B.Sc/Master (5).

Then push your changes and create a PR. Hamza or Pietro will merge it.

---

## Publications

**Option 1 (recommended):** Use the **Bibliography** tab at [submission.html](https://mode-demo.github.io/submission.html). Paste your BibTeX entries and they will be appended to `publications.bib`.

**Option 2 (manual):** Update the `publications.bib` file in the base directory. The GitHub Actions workflow will auto-generate individual publication pages after merge.

---

## News

**Option 1 (recommended):** Use the **News** tab at [submission.html](https://mode-demo.github.io/submission.html).

**Option 2 (manual):** Fork this repository, create a new folder in `content/post/` with a relevant name (e.g., `sixth-mode-workshop-2026`), and inside that folder create an `index.md` file. Use `content/post/fifth-mode-workshop-2025/index.md` as a template.

The homepage automatically shows the latest 2 news posts. The [News page](/news/) shows all posts.

Then push your changes and create a PR. Hamza or Pietro will merge it.

---

## Opportunities

**Option 1 (recommended):** Use the **Opportunities** tab at [submission.html](https://mode-demo.github.io/submission.html).

**Option 2 (manual):** Fork this repository, create a new folder in `content/opportunities/` (e.g., `phd-position-cern`), and inside that folder create an `index.md` with frontmatter fields: `title`, `organization`, `location`, `job_type`, `apply_url`, `deadline`, and `tags`.

The [Opportunities page](/opportunities/) shows the top 5 positions with deadlines highlighted in bold. If no opportunities exist, it displays a message directing visitors to check back or follow LinkedIn.

Then push your changes and create a PR. Hamza or Pietro will merge it.
