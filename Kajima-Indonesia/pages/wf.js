// Kajima Indonesia · Full Page v4
// Injects the hi-fi homepage chrome (alert, header + dropdowns, drawer, CTA, footer) into every page.
// Each page sets <body data-page="..." data-sub="..." data-title="..." [data-cta="off"]>.
(() => {
  const HOME = '../index.html';
  const IMG = '../assets';
  const nav = [
    ['about', 'About Us', 'corporate-profile.html', [
      ['corporate-profile', 'Corporate Profile', 'corporate-profile.html'],
      ['history', 'History', 'history.html'],
      ['ohseq', 'OHSEQ ABMS Policy', 'ohseq-abms-policy.html'],
      ['conduct', 'Code of Conduct', 'code-of-conduct.html']
    ]],
    ['network', 'Global Network', 'global-network.html'],
    ['projects', 'Projects', 'projects.html'],
    ['services', 'Services', 'core-strengths.html', [
      ['core', 'Core Strengths', 'core-strengths.html'],
      ['design', 'Design', 'design.html'],
      ['construction', 'Construction', 'construction.html']
    ]],
    ['careers', 'Careers', 'careers.html'],
    ['contact', 'Contact', 'contact.html']
  ];
  const b = document.body.dataset;
  const page = b.page || '', sub = b.sub || '', title = b.title || document.title;
  const ar = '<span class="ar">→</span>';

  const navHtml = nav.map(([k, l, h, kids]) => kids
    ? `<li class="dd"><a href="${h}" class="${k === page ? 'on' : ''}" aria-haspopup="true">${l}<span class="chev" aria-hidden="true"></span></a><ul class="sub">${kids.map(([sk, sl, sh]) => `<li><a href="${sh}" class="${sk === sub ? 'on' : ''}">${sl}</a></li>`).join('')}</ul></li>`
    : `<li><a href="${h}" class="${k === page ? 'on' : ''}">${l}</a></li>`).join('');
  const drawerHtml = nav.map(([k, l, h, kids]) => `<a class="d-link" href="${h}">${l}</a>` +
    (kids ? `<div class="d-sub">${kids.map(([, sl, sh]) => `<a href="${sh}">${sl}</a>`).join('')}</div>` : '')).join('');

  const bar = `<div class="wf-bar"><div class="wrap"><span><b>Low-fi wireframe</b> · ${title}</span><span><a href="index.html">All pages</a> · <a href="${HOME}">Homepage (hi-fi)</a></span></div></div>`;
  const alert = `<div class="alert" id="alert" role="region" aria-label="Scam alert">Beware of scams using the Kajima Indonesia name. <a href="alert-on-scam.html">Verify our official contacts</a><button class="x" type="button" aria-label="Close alert" data-close-alert>×</button></div>`;
  const hdr = `<header class="hdr" id="hdr"><div class="in">
      <a class="logo" href="${HOME}" aria-label="Kajima Indonesia home"><img class="on-light" src="${IMG}/logo-2026.png" alt="Kajima Indonesia" width="128" height="34"><img class="on-dark" src="${IMG}/logo-2026-white.png" alt="" width="128" height="34"></a>
      <nav aria-label="Main"><ul class="nav">${navHtml}</ul></nav>
      <div class="hdr-r"><span class="lang"><b>EN</b> / ID</span><a class="btn" href="contact.html#enquiry">Discuss a Project ${ar}</a><button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><i></i><i></i><i></i></button></div>
    </div></header>
    <div class="drawer" id="drawer" aria-hidden="true">${drawerHtml}<a class="btn" href="contact.html#enquiry">Discuss a Project ${ar}</a></div>`;

  const cta = b.cta === 'off' ? '' : `<section class="sky" aria-label="Contact">
      <img class="photo" src="${IMG}/img/cta-jakarta-railway.jpg" alt="Jakarta skyline at sunset with the LRT line and station" loading="lazy" width="2000" height="2667">
      <div class="copy"><h2 class="disp">Together, we build a better Indonesia</h2>
        <p>Tell us about your next factory, office or facility. Our team will get back to you.</p>
        <div class="acts"><a class="btn" href="contact.html#enquiry">Discuss a Project ${ar}</a></div></div>
    </section>`;
  const ftr = `<div class="ftr${b.cta === 'off' ? ' top-rule' : ''}"><div class="wrap">
      <div class="cols">
        <div><img class="logo" src="${IMG}/logo-2026.png" alt="Kajima Indonesia" width="136" height="36">
          <p>PT Kajima Indonesia<br>Sentral Senayan I, 4th Floor<br>Jl. Asia Afrika No. 8, Jakarta 10270, Indonesia</p>
          <div class="verify"><b>Official emails always end in @kajima.co.id.</b> Verify any request made in our name. <a href="alert-on-scam.html" style="text-decoration:underline">Read the scam alert</a></div></div>
        <div><h4>Company</h4><ul>
          <li><a href="corporate-profile.html">Corporate Profile</a></li><li><a href="history.html">History</a></li>
          <li><a href="global-network.html">Global Network</a></li><li><a href="projects.html">Projects</a></li><li><a href="careers.html">Careers</a></li></ul></div>
        <div><h4>Contact</h4><ul>
          <li><a href="tel:+62215724477">+62 21 5724477</a></li><li><a href="mailto:marketing@kajima.co.id">marketing@kajima.co.id</a></li>
          <li><a href="mailto:career@kajima.co.id">career@kajima.co.id</a></li><li><a href="contact.html#enquiry">Discuss a Project →</a></li></ul></div>
        <div><h4>Whistle Blowing System</h4><p style="margin-bottom:10px">Report bribery, gratification or conflicts of interest to our FKAP team.</p><ul>
          <li><a href="mailto:lapor@kajima.co.id">lapor@kajima.co.id</a></li><li><a href="tel:+6281119960092">+62 811 1996 0092</a></li>
          <li><a href="https://report.whistleb.com/en/kajima01">Kajima Global Hotline</a></li></ul></div>
      </div>
      <div class="base"><span>© 2026 PT Kajima Indonesia. All rights reserved.</span>
        <span><a href="ohseq-abms-policy.html">OHSEQ ABMS Policy</a> · <a href="code-of-conduct.html">Code of Conduct</a> · <a href="alert-on-scam.html">Privacy Notice</a> · <a href="https://www.kajima.co.jp/english/">Kajima Corporation</a></span></div>
    </div></div>`;

  document.body.insertAdjacentHTML('afterbegin', bar + alert + hdr);
  document.body.insertAdjacentHTML('beforeend', `<footer id="contact">${cta}${ftr}</footer>`);

  // alert close
  document.querySelector('[data-close-alert]').addEventListener('click', () => document.getElementById('alert').remove());

  // header: transparent over the page hero, solid after; header button appears past the hero
  const hdrEl = document.getElementById('hdr'), hero = document.querySelector('.pg-hero');
  const onHdr = () => {
    hdrEl.classList.toggle('solid', !hero || scrollY > 60);
    hdrEl.classList.toggle('past-hero', !hero || hero.getBoundingClientRect().bottom < 90);
  };
  addEventListener('scroll', onHdr, { passive: true }); onHdr();

  // drawer
  const burger = hdrEl.querySelector('.burger'), drawer = document.getElementById('drawer');
  const setDrawer = open => { burger.setAttribute('aria-expanded', open); drawer.classList.toggle('open', open); drawer.setAttribute('aria-hidden', !open); document.body.style.overflow = open ? 'hidden' : ''; document.body.classList.toggle('drawer-open', open); };
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));

  // tabs: <div data-tabs> buttons[data-tab] + panels[data-panel]
  document.querySelectorAll('[data-tabs]').forEach(box => {
    const btns = box.querySelectorAll('[data-tab]'), panels = box.querySelectorAll('[data-panel]');
    btns.forEach(bt => bt.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('on', x === bt));
      panels.forEach(p => { p.hidden = p.dataset.panel !== bt.dataset.tab; });
    }));
  });

  // horizontal track: [data-track-prev|next="id"] scrolls #id by one viewport of the track
  document.querySelectorAll('[data-track-prev], [data-track-next]').forEach(bt => bt.addEventListener('click', () => {
    const t = document.getElementById(bt.dataset.trackPrev || bt.dataset.trackNext);
    t.scrollBy({ left: (bt.dataset.trackPrev ? -1 : 1) * t.clientWidth, behavior: 'smooth' });
  }));

  // project filter: chips[data-filter] toggle cards[data-cat]
  document.querySelectorAll('[data-filters]').forEach(box => {
    const chips = box.querySelectorAll('[data-filter]'), cards = document.querySelectorAll('[data-cat]');
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.classList.toggle('on', x === c));
      cards.forEach(k => { k.hidden = c.dataset.filter !== 'all' && !k.dataset.cat.split(' ').includes(c.dataset.filter); });
    }));
  });
})();
