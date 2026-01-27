---
title: "Discrete Diffusion for Reflective Vision-Language-Action Models in Autonomous Driving"

date: 2026-01-27

publishDate: 2026-01-27T00:00:00Z

authors: ["Pengxiang Li", "Yinan Zheng", "Yue Wang", "HuiminWang", "Hang Zhao", "jingjing Liu", "Xianyuan Zhan", "Kun Zhan", "XianPeng Lang"]

# author_notes:
# - "Equal contribution"
# - "Equal contribution"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["conference"]

abstract: "End-to-End (E2E) solutions have emerged as a mainstream approach for autonomous driving systems, with Vision-Language-Action (VLA) models representing a new paradigm that leverages pre-trained multimodal knowledge from Vision-Language Models (VLMs) to interpret and interact with complex real-world environments. However, these methods remain constrained by the limitations of imitation learning, which struggles to inherently encode physical rules during training. Existing approaches often rely on complex rule-based post-refinement, employ reinforcement learning that remains largely limited to simulation, or utilize diffusion guidance that requires computationally expensive gradient calculations. To address these challenges, we introduce ReflectDrive, a novel learning-based framework that integrates a reflection mechanism for safe trajectory generation via discrete diffusion. We first discretize the two-dimensional driving space to construct an action codebook, enabling the use of pre-trained Diffusion Language Models for planning tasks through fine-tuning. Central to our approach is a safety-aware reflection mechanism that performs iterative self-correction without gradient computation. Our method begins with goal-conditioned trajectory generation to model multi-modal driving behaviors. Based on this, we apply local search methods to identify unsafe tokens and determine feasible solutions, which then serve as safe anchors for inpainting-based regeneration. Evaluated on the NAVSIM benchmark, ReflectDrive demonstrates significant advantages in safety-critical trajectory generation, offering a scalable and reliable solution for autonomous driving systems."

featured: false

publication: "*In the 14th International Conference on Learning Representations (ICLR 2026)*"

url_pdf: "https://openreview.net/pdf?id=XJxXSMLDoZ"

# url_code: ""

links:
# - name: Website
#   url: 

projects: 
  - Algorithms
  - Robotics

tags:
  - Algorithms
  - Robotics

image:
  placement: 1
  caption: ""
  focal_point: "Smart"
  preview_only: false
  alt_text:
---


