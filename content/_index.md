---
# Leave the homepage title empty to use the site title
title:
date: 2026-02-26
type: landing

sections:
  - block: hero
    content:
      title: 
      image:
        filename: mode_logo.svg
      text: |
        <div style="margin-top: 100px;">

        The **Machine-learning Optimized Design of Experiments** (MODE) is a collaboration of physicists and computer scientists who target the use of differentiable programming in design optimization of experiments in various fields of applied sciences and engineering.

        </div>
  - block: markdown
    content:
      title: ""
      text: |-
        The MODE collaboration involves in design optimization of detectors for particle physics applications, extending from fundamental research at accelerators, in space, and in nuclear physics and neutrino facilities, to industrial applications employing the technology of radiation detection. We aim to develop modular, customizable, and scalable, fully differentiable pipelines for the end-to-end optimization of articulated objective functions that model in full the true goals of experimental particle physics endeavours, to ensure optimal detector performance, analysis potential, and cost-effectiveness. 

        The main goal of our activities is to develop an architecture that can be adapted to the above use cases but will also be customizable to any other experimental endeavour employing particle detection at its core. We welcome suggestions, as well as interest in joining our effort, by researchers focusing on use cases for which this technology can be of benefit. 

          <font size=2>
        <p style="color: #2E64FE;">

        The above program is supported as an <a href="http://www.pd.infn.it/%7Edorigo/eoi_jenas.pdf">expression of interest </a>  by the <a href="http://nupecc.org/jenaa/?display=eois">Jenna Group </a>.
        </p>
        </font>

        <div style="text-align:center; font-weight:700;">MAILING LIST</div>


        If you are interested in information about MODE (including, but not limited to, the announcement of our yearly workshop and the opening of MODE-related PhD/postdoc positions), or if you want to post such advertisement yourself, you can join our <a href="ttps://e-groups.cern.ch/e-groups/Egroup.do?egroupId=10710684">mode-info mailing list </a>!
 

  - block: collection
    id: news
    content:
      title: Latest News
      text: ""
      count: 2
      filters:
        folders:
          - post
    design:
      view: compact
      columns: '1'
  - block: markdown
    content:
      title: ""
      text: |-
        For all news, visit the [News archive](/news/) page.
  - block: collection
    content:
      title: Latest Publications
      text: ""
      count: 5
      filters:
        folders:
          - publication
        publication_type: 'article-journal'
    design:
      view: citation
      columns: '1'

    
  - block: markdown
    content:
      title:
      subtitle:
      text: |
        {{% cta cta_link="./people/" cta_text="Meet the Collaborators →" style="text" %}}
    design:
      columns: '1'
  - block: contact
    id: contact
    content:
      title: Contact
      subtitle: 'Get in touch with MODE Collaboration'
      text: |
        **Scientific Coordinator**  
        Prof. Pietro Vischia  

        **Email:** pietro (dot) vischia (at) cern (dot) ch  
        **Office tel.:** +34 985 106 252  
        **Mobile tel.:** +34 (six)(six)(six) (nine)(eight)(six) (six)(one)(six)  

        **Snail mail:**  
        Departamento de Física, edificio de Geología,  
        C/ Jesús Arías Velasco s/n,  
        33005 Oviedo, Principado de Asturias, España.

        ---

        **Steering Board**  
        The whole Steering Board can be reached by writing to:  mode-collaboration-sb(at)cern(dot)ch

      autolink: false
    design:
      columns: '1'
---

---
