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