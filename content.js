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

  function addSettingsShortcut(nav) {
    if (nav.querySelector('a[href="/settings"]')) return;

    const wrapper = document.createElement("div");
    wrapper.className = "tfb-settings-item";

    const link = document.createElement("a");
    link.href = "/settings";
    link.className = "tfb-settings-link";
    link.textContent = "Settings";

    wrapper.appendChild(link);
    nav.appendChild(wrapper);
  }

  function keepSidebarOnlyCore() {
    const nav =
      document.querySelector('nav[aria-label="Primary"]') ||
      document.querySelector('nav[aria-label="Primary navigation"]');

    if (!nav) return;

    const allowedTestIds = new Set([
      "AppTabBar_Notifications_Link",
      "AppTabBar_DirectMessage_Link",
      "AppTabBar_Profile_Link"
    ]);

    nav.querySelectorAll('a[href]').forEach((link) => {
      const href = new URL(link.href, window.location.origin).pathname;
      const testId = link.getAttribute("data-testid") || "";
      const label = (link.textContent || "").trim().toLowerCase();

      const allowedByPath =
        href.startsWith("/notifications") ||
        href.startsWith("/messages") ||
        href.startsWith("/settings");

      const isProfile = testId === "AppTabBar_Profile_Link" || label === "profile";
      const isAllowed = allowedByPath || allowedTestIds.has(testId) || isProfile;
      const isMore = label === "more" || href.startsWith("/i/");

      if (!isAllowed || isMore) {
        const container = link.closest('li, div[role="button"], a') || link;
        container.style.display = "none";
      }
    });

    addSettingsShortcut(nav);

    // Hide large "Post" compose buttons in left nav area.
    nav.parentElement?.querySelectorAll('[data-testid="SideNav_NewTweet_Button"], [data-testid="tweetButton"]')
      .forEach((btn) => {
        btn.style.display = "none";
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
          <a href="/settings">Open Settings</a>
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
    keepSidebarOnlyCore();

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
