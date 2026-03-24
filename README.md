# Twitter Feed Blocker (Chrome Extension)

A minimal Chrome extension that hides the X/Twitter **home feed** while still letting you use:

- Notifications (`/notifications`)
- Messages / chat (`/messages`)

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

## What it does

- Runs on `twitter.com` and `x.com`
- Detects when you are on Home (`/` or `/home`)
- Hides timeline/feed elements in the main column
- Shows a simple panel with quick links to Notifications and Messages

## Notes

- Binary artifacts are intentionally not checked into git.
- If X/Twitter changes its DOM structure, selectors may need updates.
