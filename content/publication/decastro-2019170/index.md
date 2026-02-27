---
title: 'INFERNO: Inference-Aware Neural Optimisation'

# Authors
# A YAML list of author names
# If you created a profile for a user (e.g. the default `admin` user at `content/authors/admin/`), 
# write the username (folder name) here, and it will be replaced with their full name and linked to their profile.
authors:
- Pablo de Castro
- Tommaso Dorigo

# Author notes (such as 'Equal Contribution')
# A YAML list of notes for each author in the above `authors` list
author_notes: []

date: '2019-01-01'

# Date to publish webpage (NOT necessarily Bibtex publication's date).
publishDate: '2026-02-26T21:18:15.250702Z'

# Publication type.
# A single CSL publication type but formatted as a YAML list (for Hugo requirements).
publication_types:
- article-journal

# Publication name and optional abbreviated publication name.
publication: '*Computer Physics Communications*'
publication_short: ''

doi: https://doi.org/10.1016/j.cpc.2019.06.007

abstract: Complex computer simulations are commonly required for accurate data modelling
  in many scientific disciplines, making statistical inference challenging due to
  the intractability of the likelihood evaluation for the observed data. Furthermore,
  sometimes one is interested on inference drawn over a subset of the generative model
  parameters while taking into account model uncertainty or misspecification on the
  remaining nuisance parameters. In this work, we show how non-linear summary statistics
  can be constructed by minimising inference-motivated losses via stochastic gradient
  descent such that they provide the smallest uncertainty for the parameters of interest.
  As a use case, the problem of confidence interval estimation for the mixture coefficient
  in a multi-dimensional two-component mixture model (i.e. signal vs background) is
  considered, where the proposed technique clearly outperforms summary statistics
  based on probabilistic classification, a commonly used alternative which does not
  account for the presence of nuisance parameters.

# Summary. An optional shortened abstract.
summary: ''

tags:
- Likelihood-free inference
- High energy physics
- Neural networks
- Nuisance parameters

# Display this page in a list of Featured pages?
featured: false

# Links
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

# Publication image
# Add an image named `featured.jpg/png` to your page's folder then add a caption below.
image:
  caption: ''
  focal_point: ''
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects: ['internal-project']` links to `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects: []
links:
- name: URL
  url: https://www.sciencedirect.com/science/article/pii/S0010465519301948
---

Add the **full text** or **supplementary notes** for the publication here using Markdown formatting.
