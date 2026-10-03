---
name: Headless chat smoke tests
description: Workspace-specific notes for interactive checks using Chromium's DevTools Protocol.
---

The workspace has Chromium available for headless browser checks, and the installed Node runtime can drive its DevTools Protocol with the built-in WebSocket API.

**Why:** A CDP `Page.reload` command can return before the new React page has hydrated. A test may then assert against the previous document or interact before state and local storage are ready.

**How to apply:** After reloads, wait for the new document and the expected app state to render before making assertions or clicking controls.