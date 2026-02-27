---
title: Differentiable Deep Learning Surrogate Models Applied to the Optimization of
  the IFMIF-DONES Facility

# Authors
# A YAML list of author names
# If you created a profile for a user (e.g. the default `admin` user at `content/authors/admin/`), 
# write the username (folder name) here, and it will be replaced with their full name and linked to their profile.
authors:
- Galo Gallardo Romero
- Guillermo Rodríguez-Llorente
- Lucas Magariños Rodríguez
- Rodrigo Morant Navascués
- Nikita Khvatkin Petrovsky
- Rubén Lorenzo Ortega
- Roberto Gómez-Espinosa Martín

# Author notes (such as 'Equal Contribution')
# A YAML list of notes for each author in the above `authors` list
author_notes: []

date: '2025-01-01'

# Date to publish webpage (NOT necessarily Bibtex publication's date).
publishDate: '2026-02-26T21:21:49.712315Z'

# Publication type.
# A single CSL publication type but formatted as a YAML list (for Hugo requirements).
publication_types:
- article-journal

# Publication name and optional abbreviated publication name.
publication: '*Particles*'
publication_short: ''

doi: 10.3390/particles8010021

abstract: One of the primary challenges for future nuclear fusion power plants is
  understanding how neutron irradiation affects reactor materials. To tackle this
  issue, the IFMIF-DONES project aims to build a facility capable of generating a
  neutron source in order to irradiate different material samples. This will be achieved
  by colliding a deuteron beam with a lithium jet. In this work, within the DONES-FLUX
  project, deep learning surrogate models are applied to the design and optimization
  of the IFMIF-DONES linear accelerator. Specifically, neural operators are employed
  to predict deuteron beam envelopes along the longitudinal axis of the accelerator
  and neutron irradiation effects at the end, after the beam collision. This approach
  has resulted in models that are able of approximating complex simulations with high
  accuracy (less than 17% percentage error for the worst case) and significantly reduced
  inference time (ranging from 2 to 6 orders of magnitude) while being differentiable.
  The substantial speed-up factors enable the application of online reinforcement
  learning algorithms, and the differentiable nature of the models allows for seamless
  integration with differentiable programming techniques, facilitating the solving
  of inverse problems to find the optimal parameters for a given objective. Overall,
  these results demonstrate the synergy between deep learning models and differentiable
  programming, offering a promising collaboration among physicists and computer scientists
  to further improve the design and optimization of IFMIF-DONES and other accelerator
  facilities. This research will lay the foundations for future projects, where optimization
  efforts with differentiable programming will be performed.

# Summary. An optional shortened abstract.
summary: ''

tags: []

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
  url: https://www.mdpi.com/2571-712X/8/1/21
---

Add the **full text** or **supplementary notes** for the publication here using Markdown formatting.
