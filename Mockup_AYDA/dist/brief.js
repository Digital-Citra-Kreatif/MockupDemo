/* Design brief modal: floating bulb button opens a dialog with two tabs. */
(() => {
  const fab = document.querySelector(".brief-fab");
  const dialog = document.querySelector(".brief-dialog");
  if (!fab || !dialog || typeof dialog.showModal !== "function") return;

  const tabs = [...dialog.querySelectorAll(".brief-tab")];
  const panels = [...dialog.querySelectorAll(".brief-panel")];
  const body = dialog.querySelector(".brief-body");

  function select(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.id !== tab.getAttribute("aria-controls"); });
    body.scrollTop = 0;
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      select(next);
      next.focus();
    });
  });

  fab.addEventListener("click", () => {
    dialog.showModal();
    fab.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  });
  dialog.querySelector(".brief-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    fab.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    fab.focus();
  });
})();
