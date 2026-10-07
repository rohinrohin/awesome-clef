(() => {
  const q = document.getElementById("q");
  const sort = document.getElementById("sort");
  const chips = [...document.querySelectorAll(".chip")];
  const sections = [...document.querySelectorAll(".cat")];
  const noResults = document.getElementById("no-results");
  let filter = "all";

  const apply = () => {
    const term = q.value.trim().toLowerCase();
    let visibleTotal = 0;
    for (const section of sections) {
      const catOn = filter === "all" || section.dataset.cat === filter;
      let visible = 0;
      for (const tr of section.querySelectorAll("tbody tr")) {
        const on = catOn && (!term || tr.dataset.text.includes(term));
        tr.hidden = !on;
        if (on) visible++;
      }
      section.hidden = !catOn;
      section.querySelector(".empty").hidden = !(catOn && visible === 0 && term);
      section.querySelector("[data-count]").textContent = visible;
      visibleTotal += visible;
    }
    noResults.hidden = visibleTotal > 0;
    const vc = document.getElementById("visible-count");
    if (vc) vc.textContent = `${visibleTotal} shown`;
  };

  const resort = () => {
    const key = sort.value;
    for (const tbody of document.querySelectorAll(".dir tbody")) {
      const rows = [...tbody.children];
      rows.sort((a, b) => {
        if (key === "stars") return Number(b.dataset.stars) - Number(a.dataset.stars) || a.dataset.name.localeCompare(b.dataset.name);
        if (key === "added") return b.dataset.added.localeCompare(a.dataset.added) || Number(b.dataset.stars) - Number(a.dataset.stars);
        return a.dataset.name.localeCompare(b.dataset.name);
      });
      tbody.append(...rows);
    }
  };

  q.addEventListener("input", apply);
  sort.addEventListener("change", resort);
  for (const chip of chips) {
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("is-active", c === chip));
      apply();
      if (filter !== "all") document.getElementById("controls").scrollIntoView({ block: "start" });
    });
  }

  const params = new URLSearchParams(location.search);
  if (params.get("q")) q.value = params.get("q");
  const initial = chips.find((c) => c.dataset.filter === params.get("cat"));
  if (initial) initial.click();
  else apply();
})();
