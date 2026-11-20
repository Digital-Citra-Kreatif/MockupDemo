/* AYDA preloader: sembilan titik membentuk logo AYDA Awards. */
(() => {
  const root = document.documentElement;
  const el = document.getElementById("preloader");
  if (!el) { root.classList.remove("is-preloading"); return; }

  const NS = "http://www.w3.org/2000/svg";
  const svg = el.querySelector(".preloader-art");
  const mark = svg.querySelector(".pl-mark");
  const core = svg.querySelector(".pl-core");
  const dotsLayer = svg.querySelector(".pl-dots");
  const linesLayer = svg.querySelector(".pl-lines");
  const defs = svg.querySelector("defs");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let finished = false;
  let fallback;

  function showPage(animateHero) {
    root.classList.remove("is-preloading");
    if (animateHero && (!location.hash || location.hash === "#top")) {
      root.classList.add("has-entered");
    }
    el.setAttribute("aria-hidden", "true");
  }

  function finish(animateHero = false) {
    if (finished) return;
    finished = true;
    clearTimeout(fallback);
    showPage(animateHero);
    if (el.classList.contains("is-revealing")) {
      el.remove();
      return;
    }

    el.classList.add("is-done");
    el.addEventListener("transitionend", (event) => {
      if (event.target === el && event.propertyName === "opacity") el.remove();
    });
    setTimeout(() => el.remove(), 380);
  }

  if (motion.matches || !el.animate) {
    root.classList.remove("is-preloading");
    el.remove();
    return;
  }

  // Posisi akhir mengikuti logo (koordinat file logo 529×214).
  // grid = posisi awal pada susunan 3×3 (kolom, baris).
  const nodes = [
    { color: "#d71920", grid: [0, 0], to: [114, 10] },  // merah — puncak
    { color: "#ee7d22", grid: [1, 0], to: [180, 23] },  // oranye — kanan atas
    { color: "#f2d21b", grid: [2, 0], to: [49, 36] },   // kuning — kiri atas
    { color: "#5cb246", grid: [0, 1], to: [10, 79] },   // hijau — kiri
    { color: "#9fc93c", grid: [1, 1], to: [134, 71] },  // hijau muda — tengah
    { color: "#2a87c8", grid: [2, 1], to: [129, 115] }, // biru
    { color: "#3d5ba9", grid: [0, 2], to: [109, 156] }, // biru baja
    { color: "#2e3192", grid: [1, 2], to: [116, 203] }, // biru tua — dasar
    { color: "#8a16d0", grid: [2, 2], to: [188, 106] }, // ungu — kanan
  ];
  // Garis antar-titik (indeks pada array nodes).
  const edges = [
    [2, 0], [0, 1], [2, 3], [2, 4], [1, 4], [1, 8], [3, 4], [4, 8],
    [3, 5], [5, 8], [5, 6], [3, 6], [3, 7], [6, 7], [8, 7],
  ];

  const GRID_CENTER = [264, 107];
  const GAP = 44;
  const gridPos = (n) => [GRID_CENTER[0] + (n.grid[0] - 1) * GAP, GRID_CENTER[1] + (n.grid[1] - 1) * GAP];
  const easeOut = "cubic-bezier(.22, 1, .36, 1)";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const dots = nodes.map((n) => {
    const g = document.createElementNS(NS, "g");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "8.6");
    c.setAttribute("fill", n.color);
    g.appendChild(c);
    const [x, y] = gridPos(n);
    g.style.transform = `translate(${x}px, ${y}px)`;
    dotsLayer.appendChild(g);
    return { g, c };
  });

  const lines = edges.map(([a, b], i) => {
    const A = nodes[a].to, B = nodes[b].to;
    const grad = document.createElementNS(NS, "linearGradient");
    grad.id = `pl-g${i}`;
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("x1", A[0]); grad.setAttribute("y1", A[1]);
    grad.setAttribute("x2", B[0]); grad.setAttribute("y2", B[1]);
    grad.innerHTML = `<stop offset="0" stop-color="${nodes[a].color}"/><stop offset="1" stop-color="${nodes[b].color}"/>`;
    defs.appendChild(grad);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", A[0]); l.setAttribute("y1", A[1]);
    l.setAttribute("x2", B[0]); l.setAttribute("y2", B[1]);
    l.setAttribute("pathLength", "1");
    l.setAttribute("stroke", `url(#pl-g${i})`);
    linesLayer.appendChild(l);
    return l;
  });

  const heroPhoto = document.querySelector(".hero-photo");
  const heroReady = typeof heroPhoto?.decode === "function"
    ? Promise.race([heroPhoto.decode().catch(() => {}), wait(1500)])
    : Promise.resolve();

  async function closeLogo() {
    el.classList.add("is-closing");
    mark.style.transformOrigin = `${core.getAttribute("cx")}px ${core.getAttribute("cy")}px`;
    const collapse = mark.animate(
      [{ scale: 1, opacity: 1 }, { opacity: 1, offset: .5 }, { scale: .06, opacity: 0 }],
      { duration: 340, easing: "cubic-bezier(.55, 0, .3, 1)", fill: "forwards" }
    );
    core.animate([{ scale: .55, opacity: 0 }, { scale: 1, opacity: 1 }],
      { duration: 165, delay: 155, easing: easeOut, fill: "both" });
    await collapse.finished;
    if (finished) return;

    showPage(true);
    const overlay = el.getBoundingClientRect();
    const dot = core.getBoundingClientRect();
    const x = dot.left + dot.width / 2 - overlay.left;
    const y = dot.top + dot.height / 2 - overlay.top;
    const startRadius = dot.width / 2;
    const endRadius = Math.hypot(Math.max(x, overlay.width - x), Math.max(y, overlay.height - y)) + 2;
    el.style.setProperty("--iris-x", `${x}px`);
    el.style.setProperty("--iris-y", `${y}px`);
    el.style.setProperty("--iris-radius", `${startRadius}px`);
    el.classList.add("is-revealing");

    const started = performance.now();
    function expand(now) {
      if (finished) return;
      const progress = Math.min((now - started) / 600, 1);
      const eased = progress ** 2 * (3 - 2 * progress);
      el.style.setProperty("--iris-radius", `${startRadius + (endRadius - startRadius) * eased}px`);
      if (progress < 1) requestAnimationFrame(expand);
      else finish();
    }
    requestAnimationFrame(expand);
  }

  async function run() {
    const appear = dots.map(({ c }, index) => c.animate(
      [{ scale: .76, opacity: 0 }, { scale: 1, opacity: 1 }],
      { duration: 280, delay: index * 17, easing: easeOut, fill: "backwards" }
    ));
    await Promise.all(appear.map((animation) => animation.finished));
    await wait(100);
    if (finished) return;

    dots.forEach(({ g }, index) => {
      const [gx, gy] = gridPos(nodes[index]);
      const [tx, ty] = nodes[index].to;
      g.animate(
        [{ transform: `translate(${gx}px, ${gy}px)` }, { transform: `translate(${tx}px, ${ty}px)` }],
        { duration: 510, delay: index * 17, easing: "cubic-bezier(.65, 0, .24, 1)", fill: "forwards" }
      );
    });
    await wait(505);
    if (finished) return;

    const draw = lines.map((line, index) => line.animate(
      [{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1 }],
      { duration: 350, delay: index * 10, easing: easeOut, fill: "both" }
    ));
    el.classList.add("is-formed");
    await Promise.all([heroReady, ...draw.map((animation) => animation.finished)]);
    await wait(105);
    if (!finished) await closeLogo();
  }

  motion.addEventListener("change", () => finish(), { once: true });
  fallback = setTimeout(() => finish(true), 3300);
  run().catch(() => finish());
})();
