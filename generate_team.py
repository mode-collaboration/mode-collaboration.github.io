#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
import unicodedata
from pathlib import Path
from typing import List, Tuple, Set

# ----------------------------
# CONFIG
# ----------------------------
BASE_DIR = Path("content/authors")
OVERWRITE = True
AVATAR_SRC = Path("/Users/noorekainatsyeda/Downloads/air-dream-website/avatar.jpg")

# ----------------------------
# FULL TEAM LIST
# ----------------------------
PEOPLE: List[Tuple[str, str]] = [
    ("Tommaso Dorigo", "INFN and Università of Padova"),
    ("Pablo De Castro Manzano", "INFN and Università of Padova"),
    ("Federica Fanzago", "INFN and Università of Padova"),
    ("Giles Strong", "INFN and Università of Padova"),
    ("Mia Tosi", "INFN and Università of Padova"),
    ("Andrea Giammanco", "Université catholique de Louvain"),
    ("Zahraa Daher", "Université catholique de Louvain"),
    ("Maxime Lagrange", "Université catholique de Louvain"),
    ("Pietro Vischia", "Universidad de Oviedo and ICTEA"),
    ("Julien Donini", "Université Clermont Auvergne"),
    ("Federico Nardi", "Université Clermont Auvergne (joint with Università di Padova)"),
    ("Andrey Ustyuzhanin", "Higher School of Economics of Moscow"),
    ("Alexey Boldyrev", "Higher School of Economics of Moscow"),
    ("Denis Derkach", "Higher School of Economics of Moscow"),
    ("Fedor Ratnikov", "Higher School of Economics of Moscow"),
    ("Pablo Martínez Ruíz del Árbol", "Instituto de Física de Cantabria"),
    ("Jan Kieseler", "Karlsruher Institut für Technologie"),
    ("Jingjing Pan", "Karlsruher Institut für Technologie"),
    ("Atilim Gunes Baydin", "University of Oxford"),
    ("Kyle Cranmer", "New York University"),
    ("Gilles Louppe", "Université de Liège"),
    ("Anastasios Belias", "GSI/FAIR"),
    ("Claudius Krause", "HEPHY Vienna (OeAW)"),
    ("Christian Glaser", "Uppsala Universitet"),
    ("Lukas Heinrich", "TU-München"),
    ("Patrick Stowell", "Sheffield University"),
    ("Haitham Zaraket", "Lebanese University"),
    ("Nicolas Gauger", "University of Kaiserslautern-Landau"),
    ("Max Aehle", "University of Kaiserslautern-Landau"),
    ("Long Chen", "University of Kaiserslautern-Landau"),
    ("Ralf Keidel", "University of Kaiserslautern-Landau"),
    ("Tobias Kortus", "University of Kaiserslautern-Landau"),
    ("Alexander Schilling", "University of Kaiserslautern-Landau"),
    ("Lisa Kusch", "Eindhoven University of Technology"),
    ("Peter Elmer", "Princeton University"),
    ("Gordon Watts", "University of Washington"),
    ("Ryan Roussel", "SLAC"),
    ("Fredrik Sandin", "Lulea University of Technology"),
    ("Francesco Ferranti", "Lulea University of Technology"),
    ("Marcus Liwicki", "Lulea University of Technology"),
    ("Xabier Cid Vidal", "IGFAE and Universidad de Santiago de Compostela"),
    ("María Pereira Martínez", "IGFAE and Universidad de Santiago de Compostela"),
    ("Sarjeeta Gami", "ISER"),
    ("Ann Lee", "Carnegie Mellon University"),
    ("Luca Masserano", "Carnegie Mellon University"),
    ("Tousik Samoui", "IISER Kolkata"),
    ("Kalina Dimitrova", "Sofia University"),
    ("Venelin Kozhuharov", "Sofia University"),
    ("Peicho Petkov", "Sofia University"),
    ("Christian Haack", "ControlExpert GmbH"),
    ("Claudio Kopper", "FAU Erlangen-Nürnberg"),
    ("Oliver Janik", "FAU Erlangen-Nürnberg"),
    ("Stephen M. Casey", "NASA"),
    ("Vassil Vassilev", "Princeton University"),
    ("Xuemei Gu", "Jena University"),
    ("Sarah Barnes", "DLR Institute for the Protection of Maritime Infrastructures"),
    ("Jean-Marco Alameddine", "DLR Institute for the Protection of Maritime Infrastructures"),
    ("Ángel Bueno", "DLR Institute for the Protection of Maritime Infrastructures"),
    ("Felix Sattler", "DLR Institute for the Protection of Maritime Infrastructures"),
    ("Hamza Hanif", "Simon Fraser University"),
    ("Zlatan Dimitrov", "Adastra and Gate Institute"),
    ("Florian Bury", "University of Bristol"),
    ("Carlo Mancini-Terracciano", "Università di Roma Sapienza"),
    ("Lorenzo Arsini", "Università di Roma Sapienza"),
    ("Andrea Santamaría García", "University of Liverpool"),
]

# ----------------------------
# ROLE SETS
# ----------------------------
PI_PROFESSORS: Set[str] = {
    "Tommaso Dorigo", "Julien Donini", "Andrey Ustyuzhanin", "Kyle Cranmer",
    "Gilles Louppe", "Christian Glaser", "Lukas Heinrich", "Haitham Zaraket",
    "Nicolas Gauger", "Ralf Keidel", "Lisa Kusch", "Peter Elmer", "Gordon Watts",
    "Fredrik Sandin", "Francesco Ferranti", "Marcus Liwicki", "Xabier Cid Vidal",
    "Venelin Kozhuharov", "Peicho Petkov", "Claudio Kopper", "Xuemei Gu",
    "Carlo Mancini-Terracciano", "Andrea Santamaría García", "Ryan Roussel"
}

PHD_CANDIDATE: Set[str] = {
    "Zahraa Daher", "Luca Masserano", "Sarjeeta Gami", "Jingjing Pan",
    "María Pereira Martínez", "Tousik Samoui", "Kalina Dimitrova",
    "Oliver Janik", "Hamza Hanif", "Florian Bury", "Lorenzo Arsini"
}

AFFILIATED_RESEARCHER: Set[str] = {
    "Pablo De Castro Manzano", "Federica Fanzago", "Giles Strong", "Mia Tosi",
    "Andrea Giammanco", "Pietro Vischia", "Federico Nardi", "Alexey Boldyrev",
    "Denis Derkach", "Fedor Ratnikov", "Anastasios Belias", "Claudius Krause",
    "Patrick Stowell", "Max Aehle", "Long Chen", "Tobias Kortus", "Ann Lee",
    "Alexander Schilling", "Stephen M. Casey", "Vassil Vassilev", "Sarah Barnes",
    "Jean-Marco Alameddine", "Ángel Bueno", "Felix Sattler", "Jan Kieseler",
    "Atilim Gunes Baydin", "Pablo Martínez Ruíz del Árbol", "Christian Haack"
}

COLLABORATOR: Set[str] = {
    "Maxime Lagrange", "Zlatan Dimitrov"
}

MASTER_STUDENT: Set[str] = set()
BSC_STUDENT: Set[str] = set()

# ----------------------------
# HELPERS
# ----------------------------
def role_and_rank(name: str) -> tuple[str, int]:
    if name in PI_PROFESSORS: return "Principal Investigator/Professor", 1
    if name in AFFILIATED_RESEARCHER: return "Affiliated Researcher", 2
    if name in PHD_CANDIDATE: return "PhD Candidate", 3
    if name in MASTER_STUDENT: return "Master Student", 4
    if name in BSC_STUDENT: return "BSc Student", 5
    return "Collaborator", 6

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).lower()
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")

def make_index_md(title: str, slug: str, affiliation: str, role: str, rank: int) -> str:
    return f"""---
title: "{title}"
authors:
- "{slug}"
superuser: false
role: "{role}"
role_rank: {rank}
organizations:
- name: "{affiliation}"
  url: ""
bio: ""
interests: []
education:
  courses: []
social: []
highlight_name: true
user_groups:
- "{role}"
---

{{style="text-align: justify;"}}
"""

def main():
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    if not AVATAR_SRC.exists():
        print(f"Error: {AVATAR_SRC} not found.")
        return

    for name, aff in PEOPLE:
        slug = slugify(name)
        role, rank = role_and_rank(name)
        
        person_dir = BASE_DIR / slug
        person_dir.mkdir(parents=True, exist_ok=True)
        
        index_path = person_dir / "_index.md"
        index_path.write_text(make_index_md(name, slug, aff, role, rank), encoding="utf-8")
        shutil.copyfile(AVATAR_SRC, person_dir / "avatar.jpg")
        print(f"[OK] {name} -> {role}")

if __name__ == "__main__":
    main()