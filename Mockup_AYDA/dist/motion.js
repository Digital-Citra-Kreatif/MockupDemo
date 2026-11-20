/* AYDA motion: Lenis smooth scroll + GSAP ScrollTrigger entrance animations.
   Preloader dan indikator scroll hero tidak disentuh di sini. */
(() => {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger) return; // CDN gagal: konten tetap tampil normal.

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const EASE = "expo.out";
  const SOFT = "power3.out";
  const START = "top 86%";
  const isPreloading = () => root.classList.contains("is-preloading");

  /* ---------- Helpers ---------- */
  const radiusOf = (element) => getComputedStyle(element).borderTopLeftRadius || "0px";
  const clip = (top, right, bottom, left, radius) => `inset(${top} ${right} ${bottom} ${left} round ${radius})`;

  function enter(targets, vars, trigger, start = START) {
    const list = gsap.utils.toArray(targets);
    if (!list.length) return null;
    return gsap.from(list, {
      duration: 1.1,
      ease: SOFT,
      ...vars,
      scrollTrigger: { trigger: trigger || list[0], start, once: true },
    });
  }

  function splitHeading(element, { trigger, start = START, stagger = .11, delay = 0 } = {}) {
    if (!element) return;
    if (!SplitText) {
      enter(element, { y: 40, opacity: 0, duration: 1.2, delay }, trigger, start);
      return;
    }
    SplitText.create(element, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 115,
        duration: 1.25,
        ease: EASE,
        stagger,
        delay,
        scrollTrigger: { trigger: trigger || element, start, once: true },
      }),
    });
  }

  /* Gambar di dalam frame: frame terbuka (clip-path) + gambar zoom out. */
  function mediaReveal(frame, image, { trigger, from = "bottom", delay = 0, scale = 1.28 } = {}) {
    if (!frame) return null;
    const r = radiusOf(frame);
    const hidden = {
      bottom: clip("100%", "0%", "0%", "0%", r),
      right: clip("0%", "100%", "0%", "0%", r),
      left: clip("0%", "0%", "0%", "100%", r),
    }[from];
    const tl = gsap.timeline({
      delay,
      scrollTrigger: { trigger: trigger || frame, start: START, once: true },
      onStart: () => frame.classList.add("motion-lock"),
      onComplete: () => {
        frame.classList.remove("motion-lock");
        gsap.set([frame, image].filter(Boolean), { clearProps: "clipPath,transform" });
      },
    });
    tl.fromTo(frame, { clipPath: hidden }, { clipPath: clip("0%", "0%", "0%", "0%", r), duration: 1.35, ease: "expo.inOut" });
    if (image) tl.from(image, { scale, duration: 1.8, ease: EASE }, 0);
    return tl;
  }

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;

  function setupLenis() {
    if (!Lenis) return () => {};
    lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: 1, autoRaf: false });
    const raf = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    if (isPreloading()) lenis.stop();

    // Tautan anchor ikut dihaluskan, tetap menghormati scroll-margin-top.
    const onClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const hash = link.getAttribute("href");
      const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      event.preventDefault();
      const offset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      lenis.scrollTo(hash === "#top" ? 0 : target, { offset: -offset, duration: 1.35 });
      history.pushState(null, "", hash);
      if (target.tabIndex >= 0 || target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
    };
  }

  /* ---------- Hero (main setelah preloader selesai) ---------- */
  function setupHero() {
    const heroTitle = $("#hero-title");
    const description = $(".hero-description");
    const photo = $(".hero-photo");
    let played = false;
    let heroTl = null;

    const build = (lines) => {
      // Saat re-split (font/resize) SplitText memindahkan waktu tween lama ke yang baru,
      // jadi timeline hanya di-pause bila hero belum mulai diputar.
      heroTl?.kill();
      const tl = gsap.timeline({ paused: !played });
      tl.fromTo(photo, { scale: 1.14 }, { scale: 1, duration: 2.2, ease: "power3.out" }, 0)
        .from(lines, { yPercent: 115, duration: 1.3, ease: EASE, stagger: .12 }, .15)
        .fromTo(description, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: SOFT }, .45);
      heroTl = tl;
      return tl;
    };

    if (SplitText) {
      SplitText.create(heroTitle, {
        type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
        onSplit: (self) => build(self.lines),
      });
    } else {
      build(heroTitle);
    }

    const play = () => {
      if (played) return;
      played = true;
      lenis?.start();
      if (window.scrollY < window.innerHeight * .8) heroTl?.play();
      else heroTl?.progress(1);
    };

    if (!isPreloading()) play();
    else {
      const observer = new MutationObserver(() => {
        if (isPreloading()) return;
        observer.disconnect();
        play();
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    }

    // Parallax ringan saat hero digulir keluar.
    gsap.to(".hero-visual", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ---------- Section entrances ---------- */
  function setupSections() {
    /* Judul section: baris demi baris naik dari mask. */
    [
      ".about h2", "#theme-title", ".categories .section-heading", ".prizes .section-heading",
      "#pathway-title", ".judges .section-heading", "#scoring-title", ".entry .section-heading",
      ".schedule-grid h2", ".gallery-heading h2", "#news-title", ".closing h2",
    ].forEach((selector) => splitHeading($(selector)));

    /* Tentang */
    enter(".partner", { y: 30, opacity: 0, delay: .25 });
    const aboutFigure = $(".about-figure");
    if (aboutFigure) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: aboutFigure, start: START, once: true } });
      tl.from(aboutFigure, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" })
        .from(".about-photo-frame img", { scale: 1.3, duration: 1.9, ease: EASE, clearProps: "transform" }, 0);
    }
    setupCounters();

    /* Tema */
    const themePhoto = $(".theme-photo");
    if (themePhoto) {
      gsap.set(themePhoto, { scale: 1.16 });
      gsap.from(themePhoto, {
        scale: 1.42, duration: 2.2, ease: EASE,
        scrollTrigger: { trigger: ".theme-stage", start: "top 80%", once: true },
      });
      gsap.fromTo(themePhoto, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".theme-stage", start: "top bottom", end: "bottom top", scrub: true },
      });
    }
    enter(".theme-context", { y: 24, opacity: 0, delay: .35 }, "#theme-title");
    enter(".theme-info > *", { y: 46, opacity: 0, stagger: .14 }, ".theme-info");

    /* Kategori */
    $$(".category-card").forEach((card, index) => {
      const frame = $(".reveal-frame", card);
      mediaReveal(frame, $("img", card), { trigger: ".category-grid", delay: index * .16 });
      enter($$(".reveal-frame > div > *, .category-arrow", card), {
        y: 30, opacity: 0, stagger: .08, delay: .55 + index * .16,
      }, ".category-grid");
    });
    enter(".section-note", { y: 20, opacity: 0 });

    /* Hadiah */
    const prize = $(".prize-feature");
    if (prize) {
      mediaReveal(prize, null, { from: "right" });
      enter(".gold-prize > *", { y: 34, opacity: 0, stagger: .1, delay: .5 }, prize);
      const trophy = $(".prize-trophy");
      gsap.timeline({ scrollTrigger: { trigger: prize, start: START, once: true } })
        .from(trophy, { yPercent: 18, rotate: -8, opacity: 0, duration: 1.6, ease: EASE, delay: .35 })
        .to(trophy, { yPercent: -2.5, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
    enter(".prize-list > div", { y: 36, opacity: 0, stagger: .12, delay: .2 }, ".prize-list");

    /* Pathway: tiap langkah "tergambar" dari kiri ke kanan. */
    enter(".pathway-steps li", {
      clipPath: "inset(-1rem 100% -1rem -1rem)",
      duration: 1.3, ease: "expo.inOut", stagger: .22, clearProps: "clipPath",
    }, ".pathway-steps");
    enter(".pathway-steps li > *", { x: -24, opacity: 0, stagger: .1, delay: .3 }, ".pathway-steps");

    /* Juri: kedua panel dianimasikan bersama agar tab yang tersembunyi tidak tertinggal. */
    enter(".judge-panel-title", { y: 24, opacity: 0, stagger: .1 }, ".judge-panels");
    $$(".judge-grid").forEach((grid) => {
      const portraits = $$(".judge-portrait", grid);
      gsap.from(portraits, {
        clipPath: "inset(100% 0% 0% 0% round .8rem)",
        duration: 1.3, ease: "expo.inOut", stagger: .12, clearProps: "clipPath",
        scrollTrigger: { trigger: ".judge-panels", start: START, once: true },
      });
      gsap.from($$(".judge-portrait img:first-child", grid), {
        scale: 1.25, duration: 1.8, ease: EASE, stagger: .12, clearProps: "transform",
        scrollTrigger: { trigger: ".judge-panels", start: START, once: true },
      });
      enter($$("h4, article > p", grid), { y: 18, opacity: 0, stagger: .06, delay: .5 }, ".judge-panels");
    });
    $(".judge-tabs")?.addEventListener("click", () => requestAnimationFrame(() => ScrollTrigger.refresh()));

    /* Penilaian */
    enter(".scoring-intro p", { y: 24, opacity: 0, delay: .3 }, "#scoring-title");
    const segments = $$(".score-segment");
    if (segments.length) {
      gsap.timeline({ scrollTrigger: { trigger: ".score-figure", start: "top 80%", once: true } })
        .from(segments, {
          opacity: 0, scale: .55, rotate: -40, svgOrigin: "180 180",
          duration: 1.1, ease: "back.out(1.5)", stagger: .08, clearProps: "transform,opacity",
        })
        .from(".score-center", { opacity: 0, scale: .8, duration: .9, ease: EASE }, .35)
        .from(".score-figure figcaption", { opacity: 0, y: 14, duration: .8, ease: SOFT }, .6);
    }
    enter(".score-criteria > *", { y: 34, opacity: 0, stagger: .14 }, ".score-criteria");

    /* Cara ikut */
    enter(".entry-steps li", { y: 60, opacity: 0, duration: 1.2, stagger: .12, ease: EASE }, ".entry-steps");
    enter(".entry-steps li > span", { scale: .4, opacity: 0, duration: 1, stagger: .12, delay: .25, ease: "back.out(2)" }, ".entry-steps");
    enter(".entry-status", { y: 30, opacity: 0 });

    /* Jadwal */
    enter(".schedule-grid .lead", { y: 20, opacity: 0, delay: .3 }, ".schedule-grid h2");
    enter(".schedule-list li", { x: -32, opacity: 0, duration: 1, stagger: .09 }, ".schedule-list");

    /* Pemenang */
    enter(".gallery-controls", { y: 20, opacity: 0, delay: .3 }, ".gallery-heading");
    enter(".winner-card", { x: 90, opacity: 0, duration: 1.4, ease: EASE, stagger: .1 }, ".winner-gallery");

    /* Berita */
    const feature = $(".story-feature");
    if (feature) {
      mediaReveal($(".reveal-frame", feature), $("img", feature), { trigger: feature });
      enter($$(".reveal-frame > div > *, .category-arrow", feature), { y: 30, opacity: 0, stagger: .1, delay: .6 }, feature);
    }
    enter(".story-side > *", { y: 34, opacity: 0, stagger: .12, delay: .2 }, ".story-side");

    /* Penutup */
    const closing = $(".closing");
    if (closing) {
      gsap.fromTo(".closing-backdrop", { scale: 1.22 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: closing, start: "top bottom", end: "bottom bottom", scrub: true },
      });
      gsap.timeline({ scrollTrigger: { trigger: closing, start: "top 75%", once: true } })
        .from(".closing-guides .guide-grid", { scaleX: 0, transformOrigin: "50% 50%", duration: 1.6, ease: "expo.inOut" })
        .from(".closing-guides path:not([class])", { scaleY: 0, transformOrigin: "50% 0%", duration: 1.6, ease: "expo.inOut" }, .15)
        .from(".closing-guides .guide-marks", { opacity: 0, duration: .8 }, 1);
      enter(".closing .button", { y: 30, opacity: 0, scale: .94, delay: .45 }, ".closing h2");
    }

    /* Footer */
    enter(".footer-grid > div", { y: 36, opacity: 0, stagger: .1 }, ".footer-grid", "top 92%");
    enter(".footer-meta", { opacity: 0, y: 16, delay: .4 }, ".footer-grid", "top 92%");
  }

  function setupCounters() {
    const statistics = $(".statistics");
    if (!statistics) return;
    const items = $$(":scope > div", statistics);
    const tl = gsap.timeline({ scrollTrigger: { trigger: statistics, start: START, once: true } });
    tl.from(items, { y: 44, opacity: 0, duration: 1.1, ease: SOFT, stagger: .12 });
    items.forEach((item, index) => {
      const value = $("dd", item);
      const total = Number(value.textContent);
      if (!Number.isFinite(total)) return;
      value.setAttribute("aria-label", value.textContent);
      const counter = { n: 0 };
      tl.to(counter, {
        n: total, duration: 1.6, ease: "power2.out",
        onUpdate: () => { value.textContent = Math.round(counter.n); },
      }, .15 + index * .12);
    });
  }

  /* ---------- Aksesibilitas: elemen yang difokus langsung tampil penuh ---------- */
  function revealOnFocus({ target }) {
    for (const trigger of ScrollTrigger.getAll()) {
      const element = trigger.trigger;
      const animation = trigger.animation;
      if (!animation || trigger.vars.scrub || !element?.contains) continue;
      if (element.contains(target) || target.contains(element)) animation.progress(1);
    }
  }

  /* ---------- Init ---------- */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const teardownLenis = setupLenis();
    setupHero();
    setupSections();
    document.addEventListener("focusin", revealOnFocus);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh);
    return () => {
      document.removeEventListener("focusin", revealOnFocus);
      teardownLenis();
    };
  });
})();
