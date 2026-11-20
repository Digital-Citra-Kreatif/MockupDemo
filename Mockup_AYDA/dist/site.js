const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const topLink = document.querySelector(".to-top");
const categorySection = document.querySelector("#kategori");
const mobile = window.matchMedia("(max-width: 850px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const navSections = [...nav.querySelectorAll('a[href^="#"]')].map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
}));
let lastScrollTop = Math.max(window.scrollY, 0);
let headerFrame = 0;

function setMenu(isOpen) {
  menu.setAttribute("aria-expanded", String(isOpen));
  menu.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
  header.classList.toggle("is-open", isOpen);
}

function updateHeader() {
  const scrollTop = Math.max(window.scrollY, 0);
  const travel = scrollTop - lastScrollTop;
  if (scrollTop <= 1) {
    header.classList.remove("is-sticky");
    lastScrollTop = scrollTop;
  } else if (Math.abs(travel) >= 6) {
    if (!header.classList.contains("is-open")) {
      header.classList.toggle("is-sticky", travel < 0 && scrollTop >= header.offsetHeight);
    }
    lastScrollTop = scrollTop;
  }
  const readingLine = window.innerHeight * .37;
  const current = navSections.find(({ section }) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= readingLine && bounds.bottom > readingLine;
  });
  for (const item of navSections) {
    if (item === current) item.link.setAttribute("aria-current", "location");
    else item.link.removeAttribute("aria-current");
  }
  topLink.hidden = categorySection.getBoundingClientRect().top > window.innerHeight * .45;
}

menu.hidden = false;
menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") === "false"));
nav.addEventListener("click", (event) => {
  if (mobile.matches && event.target.closest("a")) setMenu(false);
});
header.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !header.classList.contains("is-open")) return;
  event.preventDefault();
  setMenu(false);
  menu.focus();
});
mobile.addEventListener("change", () => setMenu(false));
window.addEventListener("scroll", () => {
  if (headerFrame) return;
  headerFrame = requestAnimationFrame(() => {
    headerFrame = 0;
    updateHeader();
  });
}, { passive: true });
window.addEventListener("resize", updateHeader);
updateHeader();

const marquee = document.querySelector(".marquee");
const marqueeWindow = marquee.querySelector(".marquee-window");
const marqueeCycle = marquee.querySelector(".marquee-cycle");
const marqueeGroup = marquee.querySelector(".marquee-group");
let marqueeCopy = null;
let marqueeRepeats = 0;

function updateMarquee() {
  const running = !reduceMotion.matches;
  marquee.classList.toggle("is-running", running);
  const sequenceWidth = marqueeGroup.getBoundingClientRect().width;
  const repeats = running && sequenceWidth > 0 ? Math.ceil(marqueeWindow.clientWidth / sequenceWidth) : 0;

  if (repeats !== marqueeRepeats) {
    marqueeCopy?.remove();
    marqueeCycle.replaceChildren(marqueeGroup);
    for (let index = 1; index < repeats; index += 1) {
      const repeat = marqueeGroup.cloneNode(true);
      repeat.setAttribute("aria-hidden", "true");
      marqueeCycle.append(repeat);
    }
    if (repeats) {
      marqueeCopy = marqueeCycle.cloneNode(true);
      marqueeCopy.setAttribute("aria-hidden", "true");
      marqueeCycle.after(marqueeCopy);
    }
    marqueeRepeats = repeats;
  }
  if (repeats) marquee.style.setProperty("--marquee-duration", `${marqueeCycle.offsetWidth / 36}s`);
}

if ("IntersectionObserver" in window) {
  const marqueeObserver = new IntersectionObserver(([entry]) => {
    marquee.classList.toggle("is-offscreen", !entry.isIntersecting);
  });
  marqueeObserver.observe(marquee);
}
reduceMotion.addEventListener("change", updateMarquee);
const marqueeResize = new ResizeObserver(updateMarquee);
marqueeResize.observe(marqueeWindow);
marqueeResize.observe(marqueeGroup);
updateMarquee();

const tabList = document.querySelector(".judge-tabs");
const tabs = Array.from(tabList.querySelectorAll("button"));
const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
let activeJudgeTab = 0;
tabList.setAttribute("role", "tablist");

function selectJudgeTab(index, moveFocus = false) {
  activeJudgeTab = index;
  tabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  updateJudgeLayout();
  if (moveFocus) tabs[index].focus();
}

function updateJudgeLayout() {
  tabList.hidden = !mobile.matches;
  panels.forEach((panel, index) => {
    panel.hidden = mobile.matches && index !== activeJudgeTab;
    if (mobile.matches) {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[index].id);
      panel.tabIndex = 0;
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-labelledby");
      panel.removeAttribute("tabindex");
    }
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectJudgeTab(index));
  tab.addEventListener("keydown", (event) => {
    const destinations = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    selectJudgeTab(destinations[event.key], true);
  });
});
selectJudgeTab(0);
mobile.addEventListener("change", updateJudgeLayout);

const scoreWheel = document.querySelector(".score-wheel");
const scoreChart = scoreWheel.querySelector(".score-chart");
const scoreLabel = scoreWheel.querySelector(".score-center span");
const scoreWeight = scoreWheel.querySelector("strong");
const scoreExplanations = [...document.querySelectorAll(".score-explanation")];
const scoreColors = ["#c6a15c", "#aa905f", "#ddcca0", "#918d81", "#afaa9d", "#c7c3b7"];
const svgNamespace = "http://www.w3.org/2000/svg";

function scorePoint(angle, radius) {
  const radians = (angle - 90) * Math.PI / 180;
  return [180 + radius * Math.cos(radians), 180 + radius * Math.sin(radians)];
}

function scoreArc(start, end, outer, inner) {
  return [
    `M ${scorePoint(start, outer)}`,
    `A ${outer} ${outer} 0 0 1 ${scorePoint(end, outer)}`,
    `L ${scorePoint(end, inner)}`,
    `A ${inner} ${inner} 0 0 0 ${scorePoint(start, inner)} Z`,
  ].join(" ");
}

let scoreAngle = 0;
const scoreSegments = scoreExplanations.map((explanation, index) => {
  const value = Number(explanation.dataset.value);
  const name = explanation.querySelector("h3").textContent;
  const nextAngle = scoreAngle + value * 3.6;
  const group = document.createElementNS(svgNamespace, "g");
  const arc = document.createElementNS(svgNamespace, "path");
  const label = document.createElementNS(svgNamespace, "text");
  const [x, y] = scorePoint((scoreAngle + nextAngle) / 2, 137);

  group.classList.add("score-segment");
  group.setAttribute("role", "button");
  group.setAttribute("aria-label", `${name}, ${value}%`);
  group.style.setProperty("--score-color", scoreColors[index]);
  arc.setAttribute("d", scoreArc(scoreAngle + .6, nextAngle - .6, 161, 109));
  label.setAttribute("x", x);
  label.setAttribute("y", y);
  label.textContent = `${value}%`;
  group.append(arc, label);
  scoreChart.append(group);

  scoreAngle = nextAngle;
  return group;
});

let selectedCriterion;
function selectCriterion(index) {
  if (selectedCriterion === index) return;
  selectedCriterion = index;
  scoreSegments.forEach((segment, position) => {
    const active = position === index;
    segment.setAttribute("aria-pressed", String(active));
    segment.setAttribute("tabindex", active ? "0" : "-1");
    segment.classList.toggle("is-active", active);
    scoreExplanations[position].classList.toggle("is-active", active);
  });
  const explanation = scoreExplanations[index];
  scoreWeight.textContent = `${explanation.dataset.value}%`;
  scoreLabel.textContent = explanation.querySelector("h3").textContent;
}

scoreSegments.forEach((segment, index) => {
  const select = () => selectCriterion(index);
  segment.addEventListener("click", select);
  segment.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") select();
  });
  segment.addEventListener("focus", select);
  segment.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select();
      return;
    }
    const shift = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key];
    if (shift === undefined) return;
    event.preventDefault();
    scoreSegments[(index + shift + scoreSegments.length) % scoreSegments.length].focus();
  });
});
selectCriterion(0);

const gallery = document.querySelector(".winner-gallery");
const controls = document.querySelector(".gallery-controls");
const [previous, next] = controls.querySelectorAll("button");

function updateGalleryControls() {
  const end = gallery.scrollWidth - gallery.clientWidth;
  previous.disabled = gallery.scrollLeft <= 1;
  next.disabled = gallery.scrollLeft >= end - 1;
}

controls.hidden = false;
controls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gallery-step]");
  if (!button) return;
  const [firstCard, secondCard] = gallery.children;
  const step = secondCard.offsetLeft - firstCard.offsetLeft;
  gallery.scrollBy({ left: step * Number(button.dataset.galleryStep), behavior: reduceMotion.matches ? "instant" : "smooth" });
});
gallery.addEventListener("scroll", updateGalleryControls, { passive: true });
new ResizeObserver(updateGalleryControls).observe(gallery);
updateGalleryControls();
