/* Thai Dinh Chinh — Portfolio
   Vanilla JS: mobile nav, ⌘K command palette, system map, flow draw, scroll reveal,
   project filters, case-study TOC, contact form (FormSubmit), page transitions, scroll-top. */
(function () {
  "use strict";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.classList.contains("reduce-motion");

  // Pages live at the root and in work/, so build links from the brand link ("index.html" or "../index.html")
  const brandLink = $(".nav .brand");
  const base = brandLink ? brandLink.getAttribute("href").replace(/index\.html$/, "") : "";

  /* ---------- Mobile nav ---------- */
  const navInner = $(".nav-inner");
  const burger = $(".nav-burger");
  if (burger && navInner) {
    burger.addEventListener("click", () => {
      const open = navInner.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (!navInner.contains(e.target)) { navInner.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
    $$(".nav-links a").forEach((a) => a.addEventListener("click", () => navInner.classList.remove("open")));
  }

  /* ---------- Command palette (⌘K / Ctrl K) ---------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const icSearch = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const EMAIL = "lucian03.forwork@gmail.com";
  const cmds = [
    { k: "/home", d: "Home", g: "page", href: "index.html" },
    { k: "/case-studies", d: "All case studies", g: "page", href: "portfolio.html" },
    { k: "/work rofarez", d: "Rofarez · IoT security products", g: "case", href: "work/rofarez.html" },
    { k: "/work gametamin", d: "Gametamin · live games lifecycle", g: "case", href: "work/gametamin.html" },
    { k: "/work pacific-link", d: "Pacific Link · STEM programs", g: "case", href: "work/pacific-link.html" },
    { k: "/work fpt-software", d: "FPT Software · e-recording platform", g: "case", href: "work/fpt-software.html" },
    { k: "/work outline", d: "Outline · multiplayer game engine", g: "case", href: "work/outline.html" },
    { k: "/work electratech", d: "Electratech · IoT smart power outlet", g: "case", href: "work/electratech.html" },
    { k: "/resume", d: "Full resume", g: "page", href: "resume.html" },
    { k: "/download-cv", d: "CV as PDF", g: "file", href: "assets/files/CV_ThaiDinhChinh.pdf", download: true },
    { k: "/writing", d: "Short notes on decisions and teams", g: "page", href: "blog.html" },
    { k: "/contact", d: "Contact form and details", g: "page", href: "contact.html" },
    { k: "/copy-email", d: EMAIL, g: "action", copy: EMAIL },
  ];
  const navInnerEl = $(".nav-inner");
  if (navInnerEl) {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cmd-trigger";
    trigger.setAttribute("aria-label", "Search or jump to a page");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML = icSearch + '<span class="cmd-label">Search</span><span class="kbd">' + (isMac ? "⌘ K" : "Ctrl K") + "</span>";
    navInnerEl.insertBefore(trigger, $(".nav-cta", navInnerEl) || null);

    const pal = document.createElement("div");
    pal.className = "cmdk";
    pal.setAttribute("role", "dialog");
    pal.setAttribute("aria-modal", "true");
    pal.setAttribute("aria-label", "Search or jump to a page");
    pal.innerHTML = '<div class="cmdk-box"><div class="cmdk-in">' + icSearch +
      '<input type="text" placeholder="Search" autocomplete="off" spellcheck="false" aria-label="Search pages and actions" aria-controls="cmdk-list" role="combobox" aria-expanded="true"></div>' +
      '<ul id="cmdk-list" role="listbox" aria-label="Results"></ul>' +
      '<div class="cmdk-foot"><span>↑↓ select · Enter open · Esc close</span><span class="cmdk-note" aria-live="polite"></span></div></div>';
    document.body.appendChild(pal);

    const input = $("input", pal), list = $("ul", pal), note = $(".cmdk-note", pal);
    let sel = 0, shown = cmds, lastFocus = null;
    const render = () => {
      const term = input.value.trim().toLowerCase().replace(/^\//, "");
      shown = cmds.filter((c) => !term || (c.k + " " + c.d).toLowerCase().includes(term));
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length
        ? shown.map((c, i) => '<li role="option" id="cmdk-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span class="k">' + c.k + '</span><span class="d">' + c.d + '</span><span class="g">' + c.g + "</span></li>").join("")
        : '<li class="empty">No match. Try /work or /resume</li>';
      if (shown.length) input.setAttribute("aria-activedescendant", "cmdk-" + sel); else input.removeAttribute("aria-activedescendant");
      const on = $('[aria-selected="true"]', list); if (on) on.scrollIntoView({ block: "nearest" });
    };
    const open = () => { lastFocus = document.activeElement; pal.classList.add("open"); input.value = ""; sel = 0; note.textContent = ""; render(); input.focus(); };
    const close = () => { pal.classList.remove("open"); if (lastFocus && lastFocus.focus) lastFocus.focus(); };
    const run = (i) => {
      const c = shown[i]; if (!c) return;
      if (c.copy) {
        const ok = () => { note.textContent = "Email copied"; note.className = "cmdk-note ok"; };
        const fail = () => { note.textContent = c.copy; note.className = "cmdk-note"; };
        try { navigator.clipboard.writeText(c.copy).then(ok, fail); } catch (e) { fail(); }
        return;
      }
      const a = document.createElement("a");
      a.href = base + c.href;
      if (c.download) a.setAttribute("download", "");
      document.body.appendChild(a); a.click(); a.remove();
      close();
    };
    trigger.addEventListener("click", open);
    pal.addEventListener("click", (e) => { if (e.target === pal) close(); });
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    list.addEventListener("mousemove", (e) => { const li = e.target.closest("li[data-i]"); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
    list.addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) run(+li.dataset.i); });
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("open") ? close() : open(); }
    });
  }

  /* ---------- Domain map (hero) ----------
     Four isometric blocks grow and shrink in turn. The orange block is the one rising;
     when it reaches its peak, orange hands over to the next block in the cycle.
     Hover or focus pauses the cycle, a click or Enter pins a domain. */
  const iso = $("[data-iso]");
  const isoCap = $("[data-iso-caption]");
  if (iso) {
    const S = 30, OX = 200, OY = 70, W = 2, CYCLE = 6000, MIN_H = 0.5, AMP = 1.2;
    const COS = Math.cos(Math.PI / 6);
    const P = (x, y, z) => [OX + (x - y) * COS * S, OY + (x + y) * 0.5 * S - z * S];
    const pts = (a) => a.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const blocks = $$(".blk", iso).map((g) => ({
      g, x: +g.dataset.x, y: +g.dataset.y, order: +g.dataset.order,
      l: $(".l", g), r: $(".r", g), t: $(".t", g), label: $("text", g),
    }));
    const byOrder = blocks.slice().sort((a, b) => a.order - b.order);
    const n = byOrder.length;
    const heightAt = (b, t) => {
      const ph = (((t / CYCLE) - b.order / n) % 1 + 1) % 1;
      return MIN_H + AMP * (0.5 - 0.5 * Math.cos(2 * Math.PI * ph));
    };
    const draw = (b, h) => {
      const { x, y } = b;
      b.t.setAttribute("points", pts([P(x, y, h), P(x + W, y, h), P(x + W, y + W, h), P(x, y + W, h)]));
      b.l.setAttribute("points", pts([P(x, y + W, h), P(x + W, y + W, h), P(x + W, y + W, 0), P(x, y + W, 0)]));
      b.r.setAttribute("points", pts([P(x + W, y, h), P(x + W, y + W, h), P(x + W, y + W, 0), P(x + W, y, 0)]));
      const c = P(x + W / 2, y + W / 2, h);
      b.label.setAttribute("x", c[0].toFixed(1)); b.label.setAttribute("y", (c[1] + 4).toFixed(1));
    };
    let current = null;
    const setOn = (b) => {
      if (b === current) return;
      current = b;
      blocks.forEach((o) => o.g.classList.toggle("on", o === b));
      if (isoCap) isoCap.innerHTML = "<b>" + b.g.getAttribute("aria-label") + "</b> · " + b.g.dataset.cap;
    };
    // The block that peaked last hands over to the next one, which is now rising.
    const rising = (t) => byOrder[(Math.floor(((((t / CYCLE) - 0.5) % 1 + 1) % 1) * n) + 1) % n];

    let clock = CYCLE * 0.5 + 1, last = null, paused = false, pinned = null, visible = true, raf = 0;
    const frame = (now) => {
      raf = 0;
      if (last !== null && !paused) clock += now - last;
      last = now;
      blocks.forEach((b) => draw(b, heightAt(b, clock)));
      setOn(pinned || rising(clock));
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && !reduceMotion) { last = null; raf = requestAnimationFrame(frame); } };

    if (reduceMotion) {
      blocks.forEach((b) => draw(b, MIN_H + AMP * (0.35 + 0.15 * b.order)));
      setOn(byOrder[1]);
    } else {
      start();
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }).observe(iso);
      }
      document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
      iso.addEventListener("pointerenter", () => { paused = true; });
      iso.addEventListener("pointerleave", () => { paused = false; pinned = null; });
      iso.addEventListener("focusin", () => { paused = true; });
      iso.addEventListener("focusout", (e) => { if (!iso.contains(e.relatedTarget)) { paused = false; pinned = null; } });
    }
    const pin = (g) => {
      const b = blocks.find((o) => o.g === g); if (!b) return;
      pinned = b; setOn(b);
    };
    iso.addEventListener("click", (e) => { const g = e.target.closest(".blk"); if (g) pin(g); });
    iso.addEventListener("keydown", (e) => {
      const g = e.target.closest(".blk");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pin(g); }
    });
  }

  const isoHint = $(".iso-hint");
  if (isoHint) {
    if (reduceMotion) isoHint.textContent = "Select a domain";
    else if (window.matchMedia("(hover: none)").matches) isoHint.textContent = "Tap a domain";
  }

  /* ---------- Flow diagram: draw once when it scrolls into view, then a work item travels along it ---------- */
  const flow = $("[data-flow]");
  if (flow) {
    if (reduceMotion) $$(".flow-dot", flow).forEach((d) => d.remove());
    else if ("IntersectionObserver" in window) {
      const fio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          flow.classList.add("play"); fio.disconnect();
          const motion = $(".flow-dot animateMotion", flow);
          if (motion && motion.beginElementAt) motion.beginElementAt(0.7);
        });
      }, { threshold: 0.6 });
      fio.observe(flow);
    } else flow.classList.add("play");
  }

  /* ---------- Stat figures count up the first time they are seen ---------- */
  const counters = $$(".stat .num").map((el) => {
    const node = el.firstChild;
    if (!node || node.nodeType !== 3 || !/^\s*[\d.,]+\s*$/.test(node.nodeValue)) return null;
    const raw = node.nodeValue.trim();
    return { node, raw, value: parseFloat(raw.replace(/,/g, "")), decimals: (raw.split(".")[1] || "").length, comma: raw.includes(",") };
  }).filter(Boolean);
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const fmt = (c, v) => c.comma ? Math.round(v).toLocaleString("en-US") : v.toFixed(c.decimals);
    const run = (c) => {
      const t0 = performance.now(), dur = 900;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        c.node.nodeValue = fmt(c, c.value * e);
        if (p < 1) requestAnimationFrame(step); else c.node.nodeValue = c.raw;
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        counters.filter((c) => en.target.contains(c.node)).forEach(run);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    $$(".stat").forEach((s) => cio.observe(s));
  }

  /* ---------- Timeline: the rail fills as you scroll past each role ---------- */
  const timelines = $$(".timeline");
  if (timelines.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const mark = window.innerHeight * 0.6;
      timelines.forEach((tl) => {
        const r = tl.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (mark - r.top) / Math.max(1, r.height)));
        tl.style.setProperty("--p", p.toFixed(3));
        $$(".tl-item", tl).forEach((it) => it.classList.toggle("passed", it.getBoundingClientRect().top + 28 < mark));
      });
    };
    timelines.forEach((tl) => tl.classList.add("is-live"));
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Project filters ---------- */
  const filterBar = $("[data-filters]");
  if (filterBar) {
    const items = $$("[data-tags]");
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      $$("button", filterBar).forEach((b) => b.classList.toggle("active", b === btn));
      const f = btn.dataset.filter;
      items.forEach((it) => {
        const tags = it.dataset.tags.split(/\s+/);
        it.classList.toggle("is-hidden", !(f === "all" || tags.includes(f)));
      });
    });
  }

  /* ---------- Case study TOC ---------- */
  const tocLinks = $$(".cs-toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove("active"));
          const a = map.get(en.target.id); if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io2.observe(s); });
  }

  /* ---------- Contact form → FormSubmit (AJAX, falls back to a normal POST) ---------- */
  const form = $("#contact-form");
  const thanks = $("#contact-thanks");
  function showThanks() {
    if (!form || !thanks) return;
    form.hidden = true; thanks.hidden = false;
    thanks.classList.add("reveal", "in");
    thanks.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  if (form) {
    const submitBtn = $("#cf-submit", form);
    const status = $(".form-status", form);
    if (/[?&]sent=1/.test(location.search)) showThanks();   // no-JS path returns here via _next
    $$("[data-reset-form]").forEach((b) => b.addEventListener("click", () => {
      form.reset(); thanks.hidden = true; form.hidden = false; status.textContent = ""; status.className = "form-status";
      history.replaceState(null, "", location.pathname);
    }));
    form.addEventListener("submit", async (e) => {
      // native validation first (form has novalidate so we can style messages ourselves)
      if (!form.checkValidity()) {
        e.preventDefault();
        const bad = form.querySelector(":invalid");
        status.className = "form-status err";
        status.textContent = bad && bad.type === "email" ? "Please enter a valid email address." : "Please fill in your name, email and message.";
        if (bad) bad.focus();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint || !window.fetch) return;            // let the browser POST normally
      e.preventDefault();
      // honeypot: silently drop bots
      if ((form.elements._honey || {}).value) { showThanks(); return; }
      const subject = ($("#cf-subject", form).value || "New message").trim();
      form.elements._subject.value = `[dinhchinh.work] ${subject}`;
      submitBtn.classList.add("is-loading"); submitBtn.disabled = true;
      status.textContent = ""; status.className = "form-status";
      try {
        const fd = new FormData(form);
        fd.delete("_next");                                // AJAX: no redirect
        const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: fd });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success === "true" || data.success === true)) { showThanks(); form.reset(); }
        else throw new Error(data.message || `HTTP ${res.status}`);
      } catch (err) {
        status.className = "form-status err";
        status.innerHTML = "Couldn't send right now. Please try again, or email me directly at <a href=\"mailto:" + form.dataset.to + "\">" + form.dataset.to + "</a>.";
      } finally {
        submitBtn.classList.remove("is-loading"); submitBtn.disabled = false;
      }
    });
  }

  /* ---------- Navigation progress bar ---------- */
  const bar = $(".progress");
  const prog = {
    t: 0,
    start() { if (!bar) return; clearTimeout(this.t); bar.classList.add("active"); bar.style.width = "35%"; this.t = setTimeout(() => (bar.style.width = "75%"), 300); },
    done() { if (!bar) return; clearTimeout(this.t); bar.style.width = "100%"; this.t = setTimeout(() => { bar.classList.remove("active"); setTimeout(() => (bar.style.width = "0"), 350); }, 180); },
  };
  if (bar) {
    if (document.readyState === "complete") prog.done();
    else { bar.classList.add("active"); bar.style.width = "70%"; window.addEventListener("load", () => prog.done(), { once: true }); }
  }

  /* ---------- Page transitions ---------- */
  // Native cross-document View Transitions are declared in CSS (@view-transition). Other browsers get
  // the CSS-only enter animation (html.vt-fallback, set in <head>) plus this JS fade-out before navigating.
  const nativeVT = "CSSViewTransitionRule" in window;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;          // in-page anchor
    if (!/\.html?$|\/$/.test(url.pathname)) return;                        // files (pdf, images)
    prog.start();
    if (nativeVT || reduceMotion) return;                                 // browser animates (or shouldn't)
    e.preventDefault();
    root.classList.add("page-leave");
    setTimeout(() => { location.href = url.href; }, 240);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted) { root.classList.remove("page-leave"); prog.done(); } });

  /* ---------- Scroll-to-top ---------- */
  const st = $(".scroll-top");
  if (st) {
    const onScroll = () => st.classList.toggle("show", window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    st.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Copy link (share) ---------- */
  $$("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        if (navigator.share) { await navigator.share({ title: document.title, url }); return; }
        await navigator.clipboard.writeText(url);
        const old = btn.innerHTML; btn.textContent = "Link copied";
        setTimeout(() => (btn.innerHTML = old), 1600);
      } catch (e) {}
    });
  });

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
