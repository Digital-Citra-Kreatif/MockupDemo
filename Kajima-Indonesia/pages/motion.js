// Kajima Indonesia · Step 6 Animate v3 — micro animation layer.
// v2: counters start from 0 (years too); hero heading is covered by the sky/skyline/sections on scroll;
// CTA + footer slide up over the last section on every page that has the CTA.
// v3: smooth scrolling with Lenis (loaded before this file); scroll-linked effects update in the same
// frame as the scroll so the hero and the footer cover glide instead of stepping.
// Shared by the homepage (index.html) and every inner page. Load after the page's own scripts.
// Tags elements automatically, so the Step 5 markup stays unchanged. Does nothing when the
// visitor prefers reduced motion; without JS the page renders as designed.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('motion');
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ease = k => 1 - Math.pow(1 - k, 3);

  // ---------- 0. smooth scrolling (Lenis) ----------
  const lenis = window.Lenis ? new Lenis({ lerp: .085, wheelMultiplier: .9, smoothWheel: true }) : null;
  if (lenis) {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // in-page links glide too, clearing the sticky header
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'), id = a && a.getAttribute('href');
      const t = id && id.length > 1 && document.querySelector(id);
      if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -88, duration: 1.4 }); history.replaceState(null, '', id);
    });
    // modal and mobile drawer scroll on their own; page scroll pauses while they are open
    $$('.modal .box, .drawer').forEach(el => el.setAttribute('data-lenis-prevent', ''));
    new MutationObserver(() => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start()))
      .observe(document.body, { attributes: true, attributeFilter: ['style'] });
  }
  // run fn on every scroll frame: in step with Lenis when it is on, otherwise once per animation frame
  const onScrollFrame = fn => {
    if (lenis) { lenis.on('scroll', fn); return; }
    let busy = false;
    addEventListener('scroll', () => { if (!busy) { busy = true; requestAnimationFrame(() => { busy = false; fn(); }); } }, { passive: true });
  };

  // ---------- 1. headlines rise word by word ----------
  const split = (el, d0) => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(' '); return; }
          const w = document.createElement('span'), s = document.createElement('span');
          w.className = 'w'; s.textContent = p; w.append(s); frag.append(w); words.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
    words.forEach((s, i) => s.style.setProperty('--i', i));
    if (d0) el.style.setProperty('--d0', d0);
    el.classList.remove('rv', 'd1', 'd2', 'd3', 'in');
    el.classList.add('m-words');
  };
  const heroTitles = $$('.hero h1, .pg-hero h1');
  heroTitles.forEach(el => split(el, '.1s'));
  requestAnimationFrame(() => requestAnimationFrame(() => heroTitles.forEach(el => el.classList.add('m-in'))));
  const titles = $$('main h2.disp, main h2.h2, .sky .copy h2, .statement p.disp').filter(el => !el.closest('.hero, .pg-hero'));
  titles.forEach(el => split(el));

  // ---------- 2. reveal on scroll (auto-tagged) ----------
  const GROUPS = ['.head > *', '.facts > div', '.g2 > *', '.g3 > *', '.g4 > *', '.rows > *', '.num > li', '.tl-list > li',
    '.ms > li', '.letters > div', '.acc > details', '.chan > *', '.dl > div', '.prose > *', '.org > .node', '.org .kids > .node',
    '.split > *', '.tl-era > .era', '.cert', 'main .note', '.ftr .cols > div', '.ftr .base', '.chips', '.tabs', '.ms-ctrl'];
  const skip = el => el.closest('.rv, .hero, .pg-hero, .hdr, .drawer, .works, .m-words') || el.querySelector('.rv') || el.classList.contains('m-words');
  let cands = [...new Set(GROUPS.flatMap(s => $$(s)))].filter(el => !skip(el) && !el.classList.contains('ph'));
  cands = cands.filter(el => !cands.some(c => c !== el && el.contains(c)));   // innermost wins, no double motion
  cands.forEach(el => el.classList.add('m-up'));
  const phs = $$('main .ph, .ftr .ph').filter(el => !el.closest('.pg-hero, .statement, .m-up') && !skip(el));
  phs.forEach(el => el.classList.add('m-clip'));

  const onReveal = (es, obs) => {
    es.filter(e => e.isIntersecting).sort((a, b) => a.target.compareDocumentPosition(b.target) & 2 ? 1 : -1).forEach((e, k) => {
      const el = e.target, i = Math.min(k, 6);
      el.style.setProperty('--i', i);
      el.classList.add('m-in');
      obs.unobserve(el);
      // hand the element back to its own hover/transition rules once the entrance is over
      setTimeout(() => { el.classList.remove('m-up', 'm-clip', 'm-fade'); el.style.removeProperty('--i'); }, 1300 + i * 75);
    });
  };
  const reveal = new IntersectionObserver(onReveal, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  cands.forEach(el => reveal.observe(el));
  // v5 fix: a clipped photo has zero visible area until it is revealed, so its ratio never reaches .12;
  // watch those with threshold 0 instead
  const revealClip = new IntersectionObserver(onReveal, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  phs.forEach(el => revealClip.observe(el));

  // one-shot "in view" flags for compound pieces (headings, photo bands, diagrams, rules)
  $$('.steps, .facts').forEach(el => el.classList.add('m-line'));
  const once = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('m-in'); once.unobserve(e.target);
  }), { threshold: .2 });
  [...titles, ...$$('.career, .sky, .coord, .org, .steps, .facts, .proof')].forEach(el => once.observe(el));

  // ---------- 3. numbers count up from 0 (years too) ----------
  $$('.cnt').forEach(c => { c.textContent = '0'; });                       // homepage 210+: its own counter starts from 0
  const counters = $$('.proof b, .facts b, .gstats b').filter(b => !b.querySelector('.cnt')).map(b => {
    const tn = [...b.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!tn) return null;
    const src = tn.textContent, raw = src.match(/[\d,]+/)[0], to = +raw.replace(/,/g, '');
    const fmt = v => raw.includes(',') ? v.toLocaleString('en-US') : String(v);
    tn.textContent = src.replace(raw, fmt(0));                              // show 0 until it comes into view
    return { b, tn, src, raw, to, fmt };
  }).filter(Boolean);
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const c = counters.find(x => x.b === e.target), t0 = performance.now(), d = c.to > 999 ? 1800 : 1500;
    const step = t => { const k = Math.min((t - t0) / d, 1); c.tn.textContent = c.src.replace(c.raw, c.fmt(Math.round(c.to * ease(k)))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  counters.forEach(c => cio.observe(c.b));

  // ---------- 4. timeline line draws with scroll ----------
  const lists = $$('.tl-list');
  const onScroll = () => {
    lists.forEach(l => {
      const r = l.getBoundingClientRect(); if (!r.height) return;
      l.style.setProperty('--p', Math.min(Math.max((innerHeight * .75 - r.top) / r.height, 0), 1).toFixed(3));
    });
  };
  if (lists.length) { onScrollFrame(onScroll); addEventListener('resize', onScroll); onScroll(); }

  // ---------- 5. tabs and filters: new content fades up ----------
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  $$('[data-tab]').forEach(bt => bt.addEventListener('click', () => setTimeout(() => {
    const box = bt.closest('[data-tabs]'); if (!box) return;
    box.querySelectorAll('[data-panel]:not([hidden])').forEach(p => { restart(p, 'm-swap'); p.dispatchEvent(new Event('scroll')); onScroll(); });
  })));
  $$('[data-filter]').forEach(c => c.addEventListener('click', () => setTimeout(() => {
    $$('[data-cat]').filter(k => !k.hidden).forEach((k, i) => { k.style.setProperty('--i', Math.min(i, 8)); restart(k, 'm-swap-i'); });
  })));

  // ---------- 6. accordion opens and closes with height ----------
  $$('.acc details').forEach(d => {
    const sum = d.querySelector('summary'), body = d.querySelector('.body'); if (!sum || !body) return;
    let anim = null;
    sum.addEventListener('click', e => {
      e.preventDefault(); if (anim) anim.cancel();
      const pb = getComputedStyle(body).paddingBottom;
      if (!d.open) {
        d.open = true;
        const h = body.scrollHeight + 'px';
        anim = body.animate([{ height: '0px', paddingBottom: '0px', opacity: 0 }, { height: h, paddingBottom: pb, opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
        anim.onfinish = () => { anim = null; };
      } else {
        const h = body.offsetHeight + 'px';
        anim = body.animate([{ height: h, paddingBottom: pb, opacity: 1 }, { height: '0px', paddingBottom: '0px', opacity: 0 }], { duration: 340, easing: 'cubic-bezier(.4,0,.2,1)' });
        anim.onfinish = () => { d.open = false; anim = null; };
      }
    });
  });

  // ---------- 7. scroll covers (v2) ----------
  // Hero: the heading stays put while the sky, the skyline and the sections below scroll up over it.
  // Inner pages do the same with their banner title, so every hero behaves alike.
  const hero = document.querySelector('.hero, .pg-hero'), heroTitle = hero && hero.querySelector('.h-title, .pg-hero > .in');
  // CTA + footer slide up over the last section (pages that have the CTA only): the section holds
  // still once its bottom meets the bottom of the screen, and the footer covers it.
  const foot = document.querySelector('body > footer'), main = document.querySelector('main');
  const under = foot && foot.querySelector('.sky') && main ? [...main.children].filter(el => el.tagName === 'SECTION').pop() : null;
  if (heroTitle) hero.classList.add('m-stay');
  if (under) { under.classList.add('m-under'); foot.classList.add('m-over'); }
  const onCover = () => {
    if (heroTitle) {
      const y = Math.min(Math.max(-hero.getBoundingClientRect().top, 0), hero.offsetHeight);
      heroTitle.style.transform = y ? `translate3d(0,${y.toFixed(1)}px,0)` : '';
    }
    if (under) {
      const t = Math.min(Math.max(innerHeight - foot.getBoundingClientRect().top, 0), foot.offsetHeight);
      under.style.transform = t ? `translate3d(0,${t.toFixed(1)}px,0)` : '';
    }
  };
  if (heroTitle || under) {
    onScrollFrame(onCover);
    addEventListener('resize', onCover); onCover();
  }

  // ---------- 8. small details ----------
  $$('.drawer > *').forEach((el, i) => el.style.setProperty('--i', i));
  const idx = document.getElementById('wIdx');
  if (idx) new MutationObserver(() => restart(idx, 'm-roll')).observe(idx, { childList: true, characterData: true, subtree: true });
})();
