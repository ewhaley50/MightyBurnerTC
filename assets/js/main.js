// Mobile nav toggle + close on link click
(function () {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  if (!toggle || !menu) return;

  function setOpen(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    setOpen(!isOpen);
  });

  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setOpen(false);
  });

  // Close menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
})();




function startSeasonCountdown() {
  const el = document.getElementById("seasonCountdown");
  if (!el) return;

  // Countdown to June 1st (local time)
  const now = new Date();
  const targetYear = now.getMonth() > 5 ? now.getFullYear() + 1 : now.getFullYear(); // if past June, use next year
  const target = new Date(targetYear, 5, 1, 0, 0, 0); // Month is 0-based: 5 = June

  function tick() {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      el.textContent = "Season is live!";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    el.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
  }

  tick();
  setInterval(tick, 1000);
}

startSeasonCountdown();



function initRecordsTabs() {
  const tabs = document.querySelectorAll(".tab[data-tab]");
  const panels = {
    women: document.getElementById("recordsWomen"),
    men: document.getElementById("recordsMen")
  };

  if (!tabs.length || !panels.women || !panels.men) return;

  function setActive(which) {
    tabs.forEach(t => {
      const active = t.dataset.tab === which;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });

    panels.women.classList.toggle("is-active", which === "women");
    panels.men.classList.toggle("is-active", which === "men");
  }

  tabs.forEach(t => {
    t.addEventListener("click", () => setActive(t.dataset.tab));
  });

  setActive("women"); // default
}

initRecordsTabs();