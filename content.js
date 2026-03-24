(() => {
  const HOME_PATHS = new Set(["/", "/home"]);

  function isHomeFeedPage() {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    return HOME_PATHS.has(path);
  }

  function removeExistingGate() {
    const existing = document.getElementById("tfb-feed-gate");
    if (existing) existing.remove();
  }

  function hideHomeTimeline() {
    const timeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');
    if (timeline) {
      timeline.style.display = "none";
    }

    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    if (!primaryColumn) return;

    const blockerTargets = primaryColumn.querySelectorAll('section, [data-testid="cellInnerDiv"]');
    blockerTargets.forEach((node) => {
      node.style.display = "none";
    });

    if (!document.getElementById("tfb-feed-gate")) {
      const gate = document.createElement("div");
      gate.id = "tfb-feed-gate";
      gate.innerHTML = `
        <h2>Feed blocked</h2>
        <p>Your home feed is hidden so you can focus.</p>
        <div class="tfb-actions">
          <a href="/notifications">Open Notifications</a>
          <a href="/messages">Open Messages</a>
        </div>
      `;
      primaryColumn.prepend(gate);
    }
  }

  function unhideTimeline() {
    removeExistingGate();
    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    if (!primaryColumn) return;
    primaryColumn.querySelectorAll('section, [data-testid="cellInnerDiv"]').forEach((node) => {
      node.style.display = "";
    });
    const timeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');
    if (timeline) timeline.style.display = "";
  }

  function apply() {
    if (isHomeFeedPage()) {
      hideHomeTimeline();
    } else {
      unhideTimeline();
    }
  }

  const observer = new MutationObserver(() => {
    apply();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("popstate", apply);
  window.addEventListener("hashchange", apply);

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    setTimeout(apply, 0);
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    setTimeout(apply, 0);
    return result;
  };

  apply();
})();
