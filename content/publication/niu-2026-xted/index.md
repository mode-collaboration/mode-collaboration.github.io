---
title: "xTED: Cross-Domain Adaptation via Diffusion-Based Trajectory Editing"

date: 2026-01-08

publishDate: 2025-01-08T00:00:00.000000Z

authors: ["Haoyi Niu", "Qimao Chen", "Tenglong Liu", "Jianxiong Li", "Guyue Zhou", "Yi Zhang", "Jianming Hu", "Xianyuan Zhan"]

author_notes:
- "Equal contribution"
- "Equal contribution"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["paper-conference"]

abstract: "Reusing pre-collected data from different domains is an appealing solution for decision-making tasks, especially when data in the target domain are limited. Existing cross-domain policy transfer methods mostly aimatlearning domain correspon dences or corrections to facilitate policy learning, such as learning task/domain-specific discriminators, representations, or policies. This design philosophy often results in heavy model architectures or task/domain-specific modeling, lacking flexibility. This reality makes us wonder: can we directly bridge the domain gaps universally at the data level, instead of relying on complex downstream cross-domain policy transfer procedures? In this study, we propose the Cross-Domain Trajectory EDiting (xTED) framework that employs a specially designed diffusion model for cross-domain trajectory adaptation. Our proposed model architecture effectively captures the intricate dependencies among states, actions, and rewards, as well as the dynamics patterns within target data. Edited by adding noises and denoising with the pre-trained diffusion model, source domain trajectories can be transformed to align with target domain properties while preserving original semantic information. This process effectively corrects underlying domain gaps, enhancing state realism and dynamics reliability in source data, and allowing flexible integration with various single domain and cross-domain downstream policy learning methods. Despite its simplicity, xTED demonstrates superior performance in extensive simulation and real-robot experiments."

featured: false

publication: "*International Conference on Autonomous Agents and Multi-Agent Systems (AAMAS 2026)*"

url_pdf: "https://arxiv.org/abs/2409.08687"

url_code: "https://github.com/t6-thu/xTED"

links:
- name: Website
  url: https://t6-thu.github.io/xTED/

projects: 
  - Algorithms  
  - Robotics

tags:
  - Algorithms
  - Robotics
---

