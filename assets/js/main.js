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

// Custom calendar implementation
async function initCustomCalendar() {
  const gridEl = document.getElementById("calendarGrid");
  const monthLabelEl = document.getElementById("calendarMonthLabel");
  const upcomingEl = document.getElementById("calendarUpcoming");
  const prevBtn = document.getElementById("calPrev");
  const nextBtn = document.getElementById("calNext");

  if (!gridEl || !monthLabelEl || !upcomingEl || !prevBtn || !nextBtn) return;

  // Replace this with your Outlook ICS link
  const ICS_URL = "/.netlify/functions/calendar-proxy";

  let currentDate = new Date();
  let allEvents = [];

  function escapeHtml(str = "") {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function parseICSDate(value) {
    if (!value) return null;

    // YYYYMMDD
    if (/^\d{8}$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      return new Date(year, month, day);
    }

    // YYYYMMDDTHHMMSSZ
    if (/^\d{8}T\d{6}Z$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      const hour = Number(value.slice(9, 11));
      const min = Number(value.slice(11, 13));
      const sec = Number(value.slice(13, 15));
      return new Date(Date.UTC(year, month, day, hour, min, sec));
    }

    // YYYYMMDDTHHMMSS
    if (/^\d{8}T\d{6}$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      const hour = Number(value.slice(9, 11));
      const min = Number(value.slice(11, 13));
      const sec = Number(value.slice(13, 15));
      return new Date(year, month, day, hour, min, sec);
    }

    return null;
  }

  function classifyEvent(title = "") {
    const t = title.toLowerCase();
    if (
      t.includes("practice") ||
      t.includes("training") ||
      t.includes("workout")
    ) {
      return "practice";
    }
    if (
      t.includes("meet") ||
      t.includes("qualifier") ||
      t.includes("championship") ||
      t.includes("invite") ||
      t.includes("series")
    ) {
      return "meet";
    }
    return "other";
  }

  function parseICS(icsText) {
    const normalized = icsText.replace(/\r\n/g, "\n").replace(/\n /g, "");
    const blocks = normalized.split("BEGIN:VEVENT").slice(1);

    return blocks.map(block => {
      const endIndex = block.indexOf("END:VEVENT");
      const body = endIndex >= 0 ? block.slice(0, endIndex) : block;
      const lines = body.split("\n");

      const event = {
        title: "",
        location: "",
        start: null,
        end: null,
        description: ""
      };

      for (const line of lines) {
        if (line.startsWith("SUMMARY:")) {
          event.title = line.replace("SUMMARY:", "").trim();
        } else if (line.startsWith("LOCATION:")) {
          event.location = line.replace("LOCATION:", "").trim();
        } else if (line.startsWith("DESCRIPTION:")) {
          event.description = line.replace("DESCRIPTION:", "").trim();
        } else if (line.startsWith("DTSTART")) {
          const value = line.split(":")[1];
          event.start = parseICSDate(value);
        } else if (line.startsWith("DTEND")) {
          const value = line.split(":")[1];
          event.end = parseICSDate(value);
        }
      }

      event.type = classifyEvent(event.title);
      return event;
    }).filter(e => e.title && e.start);
  }

  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function formatDate(date) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function eventsForDay(day) {
    return allEvents.filter(event => sameDay(event.start, day));
  }

  function renderUpcoming() {
    const now = new Date();
    const upcoming = allEvents
      .filter(e => e.start >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.start - b.start)
      .slice(0, 8);

    if (!upcoming.length) {
      upcomingEl.innerHTML = `<div class="calendarEmpty">No upcoming events found.</div>`;
      return;
    }

    upcomingEl.innerHTML = upcoming.map(event => `
      <div class="calendarUpcomingItem">
        <strong>${escapeHtml(event.title)}</strong>
        <div class="calendarUpcomingMeta">${formatDate(event.start)}</div>
        ${event.location ? `<div class="calendarUpcomingMeta">${escapeHtml(event.location)}</div>` : ""}
      </div>
    `).join("");
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthLabelEl.textContent = currentDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const startDay = new Date(firstOfMonth);
    startDay.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const endDay = new Date(lastOfMonth);
    endDay.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      .map(day => `<div class="calendarDayHead">${day}</div>`)
      .join("");

    let cells = "";
    const today = new Date();

    for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const dayEvents = eventsForDay(day).slice(0, 3);

      const otherMonth = day.getMonth() !== month ? " is-other-month" : "";
      const todayClass = sameDay(day, today) ? " is-today" : "";

      cells += `
        <div class="calendarCell${otherMonth}${todayClass}">
          <div class="calendarDate">${day.getDate()}</div>
          ${dayEvents.map(event => `
            <div 
                class="calendarEvent calendarEvent--${event.type}" 
                data-title="${escapeHtml(event.title)}"
                data-date="${event.start.toISOString()}"
                data-location="${escapeHtml(event.location || "")}"
                >
                ${escapeHtml(event.title)}
            </div>
          `).join("")}
        </div>
      `;
    }

    gridEl.innerHTML = dayHeaders + cells;
    renderUpcoming();
  }

  document.addEventListener("click", function (e) {
  const el = e.target.closest(".calendarEvent");
  if (!el) return;

  const title = el.dataset.title;
  const date = new Date(el.dataset.date);
  const location = el.dataset.location;

  alert(
    `${title}\n\n` +
    `Date: ${date.toLocaleDateString()}\n` +
    (location ? `Location: ${location}\n` : "") 
  );
});

  async function loadCalendar() {
    try {
      const res = await fetch(ICS_URL);
      const text = await res.text();
      allEvents = parseICS(text).sort((a, b) => a.start - b.start);
      renderCalendar();
    } catch (err) {
      console.error("Calendar load failed:", err);
      gridEl.innerHTML = `<div class="calendarEmpty" style="grid-column:1/-1; padding:16px;">Could not load calendar.</div>`;
      upcomingEl.innerHTML = `<div class="calendarEmpty">Could not load upcoming events.</div>`;
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
  });

  await loadCalendar();
}

initCustomCalendar();


function startSeasonCountdown() {
  const el = document.getElementById("seasonCountdown");
  if (!el) return;

  // Countdown to June 1st (local time)
  const now = new Date();
  const targetYear = now.getMonth() > 5 ? now.getFullYear() + 1 : now.getFullYear(); // if past June, use next year
  const target = new Date(targetYear, 4, 18, 0, 0, 0); // Month is 0-based: 5 = June

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

function initGalleryTabs() {
  const tabs = document.querySelectorAll("[data-gallery-tab]");
  const photosPanel = document.getElementById("galleryPhotos");
  const videosPanel = document.getElementById("galleryVideos");

  if (!tabs.length || !photosPanel || !videosPanel) return;

  function setActive(which) {
    tabs.forEach(tab => {
      const isActive = tab.dataset.galleryTab === which;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    photosPanel.classList.toggle("is-active", which === "photos");
    videosPanel.classList.toggle("is-active", which === "videos");
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActive(tab.dataset.galleryTab);
    });
  });

  setActive("photos");
}

function initGalleryScroll() {
  const buttons = document.querySelectorAll("[data-scroll-target]");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.scrollTarget;
      const direction = Number(button.dataset.direction || 1);
      const track = document.getElementById(targetId);

      if (!track) return;

      const scrollAmount = track.clientWidth * 0.8;
      track.scrollBy({
        left: scrollAmount * direction,
        behavior: "smooth"
      });
    });
  });
}

initGalleryTabs();
initGalleryScroll();


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