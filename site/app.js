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
      for (const tr of section.querySelectorAll(".item")) {
        const on = catOn && (!term || tr.dataset.text.includes(term));
        tr.hidden = !on;
        if (on) visible++;
      }
      section.hidden = !catOn || (filter === "all" && term && visible === 0);
      section.querySelector(".empty").hidden = !(catOn && visible === 0 && term && filter !== "all");
      section.querySelector("[data-count]").textContent = visible;
      visibleTotal += visible;
    }
    noResults.hidden = visibleTotal > 0;
    const vc = document.getElementById("visible-count");
    if (vc) vc.textContent = `${visibleTotal} shown`;
    const url = new URL(location.href);
    term ? url.searchParams.set("q", term) : url.searchParams.delete("q");
    filter !== "all" ? url.searchParams.set("cat", filter) : url.searchParams.delete("cat");
    history.replaceState(null, "", url);
  };

  const resort = () => {
    const key = sort.value;
    for (const tbody of document.querySelectorAll(".list")) {
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
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
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
