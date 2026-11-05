/* ColorBlind Helper — page behaviour: navigation, hero comparison lens,
   contrast sample, contact form, privacy table of contents. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 4); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (menuBtn && nav) {
    var setMenu = function (open, focusBtn) {
      menuBtn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (!open && focusBtn) menuBtn.focus();
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (m) {
      if (m.matches) setMenu(false);
    });
  }

  /* ---------- Scroll spy for in-page navigation ---------- */
  function spy(links, attr) {
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute(attr)] = a; });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      sections.forEach(function (s) { if (visible[s.id] && !current) current = s.id; });
      links.forEach(function (a) {
        if (a.getAttribute(attr) === current) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }
  spy(Array.prototype.slice.call(document.querySelectorAll("[data-spy]")), "data-spy");
  spy(Array.prototype.slice.call(document.querySelectorAll("[data-toc]")), "data-toc");

  /* ---------- Hero comparison lens ---------- */
  var lens = document.querySelector("[data-lens]");
  if (lens) {
    var base = lens.querySelector("[data-lens-base]");
    var range = lens.querySelector("[data-lens-range]");
    var tag = lens.querySelector("[data-lens-tag]");
    var what = document.querySelector("[data-lens-what]");

    // Build the simulated layer from the same markup so the two halves always match.
    var sim = base.cloneNode(true);
    sim.classList.add("lens-layer--sim");
    sim.removeAttribute("data-lens-base");
    base.after(sim);

    var NAMES = { protanopia: "Protanopia", deuteranopia: "Deuteranopia", tritanopia: "Tritanopia", monochromacy: "Monochromacy" };
    var NOTES = {
      protanopia: "A sample status page where meaning lives only in color. Drag the divider to compare. With protanopia, red darkens toward olive-brown, so “Blocked” and “On track” look alike and the two chart lines blur together.",
      deuteranopia: "A sample status page where meaning lives only in color. Drag the divider to compare. With deuteranopia, the green “On track” and red “Blocked” squares turn into near-identical yellow-browns, and the two chart lines look the same.",
      tritanopia: "A sample status page where meaning lives only in color. Drag the divider to compare. With tritanopia, blue “In review” and green “On track” drift toward similar teals, and the amber “At risk” shifts toward pink.",
      monochromacy: "A sample status page where meaning lives only in color. Drag the divider to compare. With no hue at all, every status square becomes a grey of similar weight, and the red error border looks like any other outline."
    };

    var setSplit = function (v) {
      lens.style.setProperty("--split", v + "%");
    };
    var setMode = function (mode) {
      lens.style.setProperty("--lens-filter", 'url("#cbh-' + mode + '")');
      tag.textContent = NAMES[mode] + " (simulated)";
      if (what) what.textContent = NOTES[mode];
    };

    range.addEventListener("input", function () { setSplit(range.value); });
    document.querySelectorAll('input[name="lens-mode"]').forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) setMode(r.value); });
    });
    var checked = document.querySelector('input[name="lens-mode"]:checked');
    setMode(checked ? checked.value : "deuteranopia");
    range.setAttribute("aria-valuetext", "Divider at 50 percent");
    range.addEventListener("change", function () {
      range.setAttribute("aria-valuetext", "Divider at " + range.value + " percent");
    });

    // One orchestrated entrance: the divider sweeps in from the right.
    if (!reduceMotion) {
      setSplit(100);
      var start = null, from = 100, to = 50, dur = 1300;
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var step = function (ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        setSplit(from + (to - from) * ease(t));
        if (t < 1 && !userMoved) requestAnimationFrame(step);
      };
      var userMoved = false;
      range.addEventListener("input", function () { userMoved = true; }, { once: true });
      setTimeout(function () { requestAnimationFrame(step); }, 450);
    } else {
      setSplit(50);
    }
  }

  /* ---------- Contrast sample ---------- */
  var lab = document.querySelector("[data-contrast]");
  if (lab) {
    var cr = lab.querySelector("[data-cl-range]");
    var sample = lab.querySelector("[data-cl-sample]");
    var ratioEl = lab.querySelector("[data-cl-ratio]");
    var hexEl = lab.querySelector("[data-cl-hex]");
    var verdicts = lab.querySelector("[data-cl-verdicts]");
    var CHECK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var CROSS = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
    var lin = function (c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var hex = function (v) { var h = v.toString(16).padStart(2, "0"); return "#" + h + h + h; };

    var update = function () {
      var v = parseInt(cr.value, 10);
      var L = lin(v);
      var ratio = 1.05 / (L + 0.05); // against white (#fff, luminance 1)
      var shown = Math.floor(ratio * 10) / 10; // round down so we never overstate a pass
      sample.style.color = hex(v);
      ratioEl.textContent = shown.toFixed(1);
      hexEl.textContent = hex(v).toUpperCase();
      cr.setAttribute("aria-valuetext", hex(v).toUpperCase() + ", contrast " + shown.toFixed(1) + " to 1");
      var tests = [
        ["AA body text", 4.5],
        ["AA large text", 3],
        ["AAA body text", 7]
      ];
      verdicts.innerHTML = tests.map(function (t) {
        var pass = ratio >= t[1];
        return '<li class="verdict ' + (pass ? "verdict--pass" : "verdict--fail") + '">' +
          (pass ? CHECK : CROSS) + (pass ? "Passes " : "Fails ") + t[0] + "</li>";
      }).join("");
    };
    cr.addEventListener("input", update);
    update();
  }

  /* ---------- Copy to clipboard ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("[data-copy-label]");
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function (ok) {
        label.textContent = ok ? "Copied" : "Press Ctrl+C";
        setTimeout(function () { label.textContent = "Copy"; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        ta.remove(); btn.focus();
        done(ok);
      }
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var TO = "Sanghvim175@gmail.com";
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("[data-submit]");
    var submitLabel = form.querySelector("[data-submit-label]");
    var fields = {
      name: form.querySelector("#cf-name"),
      email: form.querySelector("#cf-email"),
      message: form.querySelector("#cf-message")
    };
    var OK_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="#146c35" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ERR_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5l8 14.5H2z" fill="none" stroke="#a3162a" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 8v4" stroke="#a3162a" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14.6" r="1.1" fill="#a3162a"/></svg>';

    var rules = {
      name: function (v) { return v.trim() ? "" : "Enter your name."; },
      email: function (v) {
        if (!v.trim()) return "Enter your email address so Mihir can reply.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@example.com.";
      },
      message: function (v) {
        if (!v.trim()) return "Write a message.";
        return v.trim().length < 10 ? "Add a bit more detail (at least 10 characters)." : "";
      }
    };

    var showError = function (key, msg) {
      var input = fields[key];
      var err = document.getElementById(input.id + "-err");
      err.querySelector("span").textContent = msg;
      err.classList.toggle("is-visible", !!msg);
      if (msg) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    };
    var validate = function (key) {
      var msg = rules[key](fields[key].value);
      showError(key, msg);
      return msg;
    };

    Object.keys(fields).forEach(function (key) {
      var touched = false;
      fields[key].addEventListener("blur", function () { if (fields[key].value) { touched = true; validate(key); } });
      fields[key].addEventListener("input", function () {
        if (touched || fields[key].getAttribute("aria-invalid") === "true") validate(key);
      });
    });

    var showStatus = function (kind, title, html) {
      status.className = "form-status form-status--" + kind;
      status.innerHTML = (kind === "ok" ? OK_ICON : ERR_ICON) + "<div><strong>" + title + "</strong><p>" + html + "</p></div>";
      status.hidden = false;
      status.focus();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = Object.keys(fields).filter(function (k) { return validate(k); });
      if (errors.length) {
        showStatus("err", errors.length === 1 ? "One field needs attention" : errors.length + " fields need attention",
          "Fix the highlighted fields, then select Write email again.");
        return;
      }
      var topic = form.querySelector("#cf-topic").value;
      var subject = "ColorBlind Helper: " + topic;
      var body = fields.message.value.trim() + "\n\n—\n" + fields.name.value.trim() + "\nReply to: " + fields.email.value.trim();
      var href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      submit.disabled = true;
      submitLabel.innerHTML = '<span class="spinner" aria-hidden="true"></span> Opening your email app…';
      window.location.href = href;

      setTimeout(function () {
        submit.disabled = false;
        submitLabel.textContent = "Write email";
        showStatus("ok", "Your email is ready to send",
          "Your email app should now show the message, addressed to " + TO + ". Press send there to deliver it. " +
          'If nothing opened, <a href="' + href.replace(/"/g, "&quot;") + '">try again</a> or copy the address from the panel beside this form.');
      }, 900);
    });
  }
})();
