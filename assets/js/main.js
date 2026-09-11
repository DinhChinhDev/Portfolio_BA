/* Thai Dinh Chinh — Portfolio
   Vanilla JS: theme toggle, mobile nav, cursor light on glass, scroll reveal,
   project filters, case-study TOC, contact form (FormSubmit), page transitions, scroll-top. */
(function () {
  "use strict";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Theme ---------- */
  const THEME_KEY = "tdc-theme";
  function applyTheme(t, persist) {
    root.setAttribute("data-theme", t);
    if (persist) { try { localStorage.setItem(THEME_KEY, t); } catch (e) {} }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#06080e" : "#eef1f7");
  }
  const toggle = $("#theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }
  // Follow system changes only if the user hasn't chosen explicitly
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "dark" : "light", false);
    });
  } catch (e) {}

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

  /* ---------- Cursor light on glass-hover ---------- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest(".glass-hover");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.classList.contains("reduce-motion");
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
