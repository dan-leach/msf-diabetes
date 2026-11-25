---
name: GitHub review workflow
description: User's branch and pull-request workflow for this project.
---

Push development changes to a development branch, not directly to main. The user prefers to create the PR on GitHub.

**Why:** The user wants a final AI-free code review step before changes reach main.

**How to apply:** Keep development work on its branch. Leave PR creation and the final review on GitHub to the user; do not merge or push changes directly to main.

Remind the user to update the versioning in `fetchConfig.js` when working on a new version.

**Why:** The user asked for this reminder for future version work.

**How to apply:** Raise the reminder when starting work on a new version.
