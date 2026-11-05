/* ColorBlind Helper — site-wide color vision preview.
   Applies an SVG color-matrix filter to the root element (see site.css)
   and keeps the chosen mode across pages with localStorage. */
(function () {
  "use strict";

  var KEY = "cbh-vision";
  var MODES = {
    normal: "Normal vision",
    protanopia: "Protanopia",
    deuteranopia: "Deuteranopia",
    tritanopia: "Tritanopia",
    monochromacy: "Monochromacy"
  };

  var root = document.documentElement;
  var toggle = document.querySelector("[data-vision-toggle]");
  var panel = document.querySelector("[data-vision-panel]");
  var scrim = document.querySelector("[data-vision-scrim]");
  var bar = document.querySelector("[data-vision-bar]");
  var live = document.querySelector("[data-vision-live]");
  if (!toggle || !panel) return;

  var radios = panel.querySelectorAll('input[name="vision"]');
  var lastFocus = null;

  function read() {
    var v = root.getAttribute("data-vision");
    return MODES[v] ? v : "normal";
  }

  function save(mode) {
    try {
      if (mode === "normal") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* storage unavailable: preview still works for this page */ }
  }

  function render(mode) {
    var label = MODES[mode];
    document.querySelectorAll("[data-vision-label]").forEach(function (el) { el.textContent = label; });
    document.querySelectorAll("[data-vision-bar-label]").forEach(function (el) { el.textContent = label; });
    radios.forEach(function (r) { r.checked = r.value === mode; });
    document.querySelectorAll("[data-vision-reset]").forEach(function (b) {
      if (b.closest("[data-vision-panel]")) b.disabled = mode === "normal";
    });
    if (bar) bar.hidden = mode === "normal";
  }

  function set(mode, opts) {
    if (!MODES[mode]) mode = "normal";
    root.setAttribute("data-vision", mode);
    save(mode);
    render(mode);
    // Drop a ?vision= param once the user changes mode so the URL doesn't lie.
    if (location.search.indexOf("vision=") > -1 && window.history && history.replaceState) {
      var url = new URL(location.href);
      url.searchParams.delete("vision");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    if (live && !(opts && opts.silent)) {
      live.textContent = mode === "normal"
        ? "Vision preview off. Showing normal vision."
        : "Now previewing " + MODES[mode] + ", simulated.";
    }
  }

  function isOpen() { return !panel.hidden; }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    panel.hidden = false;
    if (scrim) scrim.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    var checked = panel.querySelector('input[name="vision"]:checked') || radios[0];
    checked.focus();
  }

  function close(returnFocus) {
    if (!isOpen()) return;
    panel.hidden = true;
    if (scrim) scrim.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (returnFocus) (lastFocus && document.contains(lastFocus) ? lastFocus : toggle).focus();
  }

  toggle.addEventListener("click", function () {
    if (isOpen()) close(true);
    else { open(); lastFocus = toggle; }
  });

  radios.forEach(function (r) {
    r.addEventListener("change", function () { set(r.value); });
    // Clicking or pressing Enter on an option confirms the choice and closes.
    r.addEventListener("click", function (e) {
      if (e.detail > 0) close(true); // pointer click (not arrow-key selection)
    });
    r.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); set(r.value); close(true); }
    });
  });

  document.querySelectorAll("[data-vision-reset]").forEach(function (b) {
    b.addEventListener("click", function () {
      set("normal");
      if (b.closest("[data-vision-panel]")) close(true);
      else toggle.focus();
    });
  });

  document.querySelectorAll("[data-vision-open], [data-vision-change]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      open(); // the header is sticky, so the panel is always in view
      lastFocus = b;
    });
  });

  if (scrim) scrim.addEventListener("click", function () { close(true); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) { e.preventDefault(); close(true); }
  });

  document.addEventListener("pointerdown", function (e) {
    if (!isOpen()) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    if (e.target.closest && e.target.closest("[data-vision-open], [data-vision-change]")) return;
    close(false);
  });

  // Keep focus inside the panel while it's open (it behaves like a small dialog).
  panel.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(
      panel.querySelectorAll('input[name="vision"]:checked, button:not([disabled])'),
      function (el) { return el.offsetParent !== null; }
    );
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Sync between tabs.
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) {
      var v = e.newValue && MODES[e.newValue] ? e.newValue : "normal";
      root.setAttribute("data-vision", v);
      render(v);
    }
  });

  var initial = read();
  if (initial !== "normal") save(initial); // persists a mode that arrived via ?vision=
  render(initial);
})();
