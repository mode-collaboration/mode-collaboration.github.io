document.addEventListener("DOMContentLoaded", function () {
  const keys = ["prof", "res", "phd", "alumni"];
  const sectionKeys = {
    prof: "people-professors",
    res: "people-research",
    phd: "people-phd",
    alumni: "people-alumni",
  };

  function findSection(key) {
    return (
      document.getElementById(key) ||
      document.getElementById("section-" + key) ||
      document.querySelector(`section[id*="${key}"], div[id*="${key}"]`)
    );
  }

  function hideAll() {
    Object.values(sectionKeys).forEach((k) => {
      const el = findSection(k);
      if (el) el.style.display = "none";
    });
    document.querySelectorAll(".people-tab").forEach((b) => b.classList.remove("active"));
  }

  function show(which) {
    hideAll();
    const sec = findSection(sectionKeys[which]);
    if (sec) sec.style.display = "block";
    const btn = document.getElementById("tab-" + which);
    if (btn) btn.classList.add("active");
  }
  keys.forEach((k) => {
    const btn = document.getElementById("tab-" + k);
    if (btn) btn.addEventListener("click", () => show(k));
  });

  // Important: release CSS "pre-hide"
  document.documentElement.classList.add("people-tabs-ready");

  // default tab
});