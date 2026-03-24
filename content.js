(() => {
  const HOME_PATHS = new Set(["/", "/home"]);
  const NON_PROFILE_ROUTES = new Set([
    "/",
    "/home",
    "/explore",
    "/notifications",
    "/messages",
    "/bookmarks",
    "/lists",
    "/compose",
    "/i",
    "/settings",
    "/search-advanced",
    "/tos",
    "/privacy",
    "/help"
  ]);

  // Set to true to use Messages as your effective homepage.
  // This gives you your chat list right away without opening the Messages tab manually.
  const REDIRECT_HOME_TO_MESSAGES = true;

  function getPath() {
    return window.location.pathname.replace(/\/$/, "") || "/";
  }

  function isHomeFeedPage() {
    return HOME_PATHS.has(getPath());
  }

  function isProfilePage() {
    const path = getPath();
    if (NON_PROFILE_ROUTES.has(path)) return false;
    if (path.startsWith("/messages") || path.startsWith("/notifications")) return false;

    // Match simple profile routes like /username and /username/with_replies.
    // Exclude obvious non-profile app sections.
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return false;
    const first = `/${segments[0]}`;
    if (NON_PROFILE_ROUTES.has(first)) return false;

    return /^[A-Za-z0-9_]{1,15}$/.test(segments[0]);
  }

  function removeExistingGate() {
    const existing = document.getElementById("tfb-feed-gate");
    if (existing) existing.remove();
  }

  function hideRightRail() {
    document
      .querySelectorAll('[data-testid="sidebarColumn"], [aria-label="Timeline: Trending now"], [aria-label="Timeline: Explore"]')
      .forEach((node) => {
        node.style.display = "none";
      });

    document
      .querySelectorAll('section[aria-labelledby*="accessible-list"], div[aria-label*="trending" i], div[aria-label*="live" i], div[aria-label*="news" i]')
      .forEach((node) => {
        node.style.display = "none";
      });
  }

  function hidePostComposer() {
    document
      .querySelectorAll('[data-testid="tweetTextarea_0"], [data-testid="tweetButtonInline"], [aria-label="Post text"], [aria-label="Tweet text"], [data-testid="toolBar"]')
      .forEach((node) => {
        const root = node.closest('article, div[data-testid="cellInnerDiv"], form') || node;
        root.style.display = "none";
      });
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
        <p>Home feed, post box, trending/news/live, and profile views are hidden.</p>
        <div class="tfb-actions">
          <a href="/notifications">Open Notifications</a>
          <a href="/messages">Open Messages</a>
        </div>
      `;
      primaryColumn.prepend(gate);
    }
  }

  function hideProfilePage() {
    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    if (primaryColumn) {
      primaryColumn.style.display = "none";
    }

    const messagePane = document.querySelector('[data-testid="DMDrawer"], [data-testid="DmActivity"]');
    if (messagePane) {
      messagePane.style.display = "";
    }
  }

  function unhideTimeline() {
    removeExistingGate();
    const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
    if (primaryColumn) {
      primaryColumn.style.display = "";
      primaryColumn.querySelectorAll('section, [data-testid="cellInnerDiv"]').forEach((node) => {
        node.style.display = "";
      });
    }

    document.querySelectorAll('[data-testid="sidebarColumn"]').forEach((node) => {
      node.style.display = "";
    });

    const timeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');
    if (timeline) timeline.style.display = "";
  }

  function maybeRedirectHomeToMessages() {
    if (!REDIRECT_HOME_TO_MESSAGES) return;
    if (!isHomeFeedPage()) return;
    window.location.replace("/messages");
  }

  function apply() {
    maybeRedirectHomeToMessages();

    if (isProfilePage()) {
      hideProfilePage();
      hideRightRail();
      return;
    }

    if (isHomeFeedPage()) {
      hideHomeTimeline();
      hidePostComposer();
      hideRightRail();
    } else {
      unhideTimeline();
      if (getPath().startsWith("/messages")) {
        hideRightRail();
      }
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
