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

  const REDIRECT_HOME_TO_MESSAGES = true;

  function getPath() {
    return window.location.pathname.replace(/\/$/, "") || "/";
  }

  function getOwnHandle() {
    const profileLink = document.querySelector('a[data-testid="AppTabBar_Profile_Link"][href]');
    if (!profileLink) return null;
    const path = new URL(profileLink.href, window.location.origin).pathname;
    return path.split('/').filter(Boolean)[0] || null;
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

    const possibleHandle = segments[0];
    const ownHandle = getOwnHandle();
    if (ownHandle && possibleHandle.toLowerCase() === ownHandle.toLowerCase()) {
      return false;
    }

    return /^[A-Za-z0-9_]{1,15}$/.test(possibleHandle);
  }

  function removeExistingGate() {
    const existing = document.getElementById("tfb-feed-gate");
    if (existing) existing.remove();
  }

  function hideRightRail() {
    document
      .querySelectorAll('[data-testid="sidebarColumn"], [aria-label="Timeline: Trending now"], [aria-label="Timeline: Explore"], [data-testid="trend"], [data-testid="UserCell"]')
      .forEach((node) => {
        const container = node.closest('section, div[data-testid="cellInnerDiv"], aside, div') || node;
        container.style.display = "none";
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

  function ensureSidebarShortcut(nav, href, text, className) {
    if (nav.querySelector(`a[href="${href}"]`)) return;

    const wrapper = document.createElement("div");
    wrapper.className = "tfb-settings-item";

    const link = document.createElement("a");
    link.href = href;
    link.className = className;
    link.textContent = text;

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

    nav.querySelectorAll('a[href], button').forEach((item) => {
      const href = item.tagName === 'A' ? new URL(item.href, window.location.origin).pathname : '';
      const testId = item.getAttribute("data-testid") || "";
      const label = (item.textContent || item.getAttribute('aria-label') || "").trim().toLowerCase();

      const allowedByPath =
        href.startsWith("/notifications") ||
        href.startsWith("/messages") ||
        href.startsWith("/settings");

      const isProfile = testId === "AppTabBar_Profile_Link" || label === "profile";
      const isAllowed = allowedByPath || allowedTestIds.has(testId) || isProfile;
      const isMore = label === "more" || href.startsWith("/i/") || testId.includes("AppTabBar_More");
      const isLogo = label === "x" || testId.includes("TopNavBar") || href === "/home";

      if (!isAllowed || isMore || isLogo) {
        const container = item.closest('li, div[role="button"], a, button') || item;
        container.style.display = "none";
      }
    });

    ensureSidebarShortcut(nav, '/messages', 'Chat', 'tfb-settings-link');
    ensureSidebarShortcut(nav, '/settings', 'Settings', 'tfb-settings-link');

    nav.parentElement?.querySelectorAll('[data-testid="SideNav_NewTweet_Button"], [data-testid="tweetButton"], [aria-label="Post"], [aria-label="Tweet"], button[aria-label="More"], [data-testid="caret"]')
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
        <p>Home feed, post box, trending/news/live, and other profiles are hidden.</p>
        <div class="tfb-actions">
          <a href="/notifications">Open Notifications</a>
          <a href="/messages">Open Chat</a>
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
