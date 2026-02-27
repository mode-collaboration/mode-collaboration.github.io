---
title: Muographic Image Upsampling with Machine Learning for Built Infrastructure
  Applications

# Authors
# A YAML list of author names
# If you created a profile for a user (e.g. the default `admin` user at `content/authors/admin/`), 
# write the username (folder name) here, and it will be replaced with their full name and linked to their profile.
authors:
- William O’Donnell
- David Mahon
- Guangliang Yang
- Simon Gardner

# Author notes (such as 'Equal Contribution')
# A YAML list of notes for each author in the above `authors` list
author_notes: []

date: '2025-01-01'

# Date to publish webpage (NOT necessarily Bibtex publication's date).
publishDate: '2026-02-26T21:21:49.691927Z'

# Publication type.
# A single CSL publication type but formatted as a YAML list (for Hugo requirements).
publication_types:
- article-journal

# Publication name and optional abbreviated publication name.
publication: '*Particles*'
publication_short: ''

doi: 10.3390/particles8010033

abstract: The civil engineering industry faces a critical need for innovative non-destructive
  evaluation methods, particularly for ageing critical infrastructure, such as bridges,
  where current techniques fall short. Muography, a non-invasive imaging technique,
  constructs three-dimensional density maps by detecting the interactions of naturally
  occurring cosmic-ray muons within the scanned volume. Cosmic-ray muons offer both
  deep penetration capabilities due to their high momenta and inherent safety due
  to their natural source. However, the technology’s reliance on this natural source
  results in a constrained muon flux, leading to prolonged acquisition times, noisy
  reconstructions, and challenges in image interpretation. To address these limitations,
  we developed a two-model deep learning approach. First, we employed a conditional
  Wasserstein Generative Adversarial Network with Gradient Penalty (cWGAN-GP) to perform
  predictive upsampling of undersampled muography images. Using the Structural Similarity
  Index Measure (SSIM), 1-day sampled images were able to match the perceptual qualities
  of a 21-day image, while the Peak Signal-to-Noise Ratio (PSNR) indicated a noise
  improvement to that of 31 days worth of sampling. A second cWGAN-GP model, trained
  for semantic segmentation, was developed to quantitatively assess the upsampling
  model’s impact on each of the features within the concrete samples. This model was
  able to achieve segmentation of rebar grids and tendon ducts embedded in the concrete,
  with respective Dice–Sørensen accuracy coefficients of 0.8174 and 0.8663. This model
  also revealed an unexpected capability to mitigate—and in some cases entirely remove—z-plane
  smearing artifacts caused by the muography’s inherent inverse imaging problem. Both
  models were trained on a comprehensive dataset generated through Geant4 Monte Carlo
  simulations designed to reflect realistic civil infrastructure scenarios. Our results
  demonstrate significant improvements in both acquisition speed and image quality,
  marking a substantial step toward making muography more practical for reinforced
  concrete infrastructure monitoring applications.

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
  url: https://www.mdpi.com/2571-712X/8/1/33
---

Add the **full text** or **supplementary notes** for the publication here using Markdown formatting.
