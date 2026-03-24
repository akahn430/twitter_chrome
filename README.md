# Twitter Feed Blocker (Chrome Extension)

A Chrome extension that hides distracting X/Twitter surfaces and keeps you focused on:

- Notifications (`/notifications`)
- Messages / chat (`/messages`)
- Profile (`/<your_handle>`)
- Settings (`/settings`)

## What is blocked

- Home feed timeline
- Post prompt / composer text box
- Right-rail discovery content (news, trending, live)
- Profile pages (so clicking a name from chat won't open profile content)
- Left sidebar/nav items except **Notifications**, **Chat**, **Profile**, and **Settings**
- The **More** option in the left sidebar

## Chat list on "home"

Yes. The extension is configured to redirect Home (`/` and `/home`) to `/messages`, so your chat list opens immediately.

If you want to disable this, edit `content.js` and set:

```js
const REDIRECT_HOME_TO_MESSAGES = false;
```

## Install in Chrome

### Option A: Load unpacked directly from this repo

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `twitter_chrome`.

### Option B: Build a distributable ZIP locally

Run:

```bash
./scripts/package.sh
```

This generates local artifacts (not committed):

- `dist/twitter-feed-blocker-chrome.zip`
- `build/twitter-feed-blocker/` (staging folder)

Then unzip `dist/twitter-feed-blocker-chrome.zip` and load that unzipped folder via **Load unpacked**.

## Notes

- Binary artifacts are intentionally not checked into git.
- If X/Twitter changes its DOM structure, selectors may need updates.
