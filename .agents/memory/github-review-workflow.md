---
name: GitHub review workflow
description: User's branch and pull-request workflow for this project.
---

Push development changes to a development branch, not directly to main. The user prefers to create the PR on GitHub.

**Why:** The user wants a final AI-free code review step before changes reach main.

**How to apply:** Keep development work on its branch. Leave PR creation and the final review on GitHub to the user; do not merge or push changes directly to main.

For the next development session, create a new `v1.4` branch from the latest remote main and push that branch before making the subsequent changes. Do not create it early.

**Why:** The user specified this workflow after merging v1.3 on GitHub.

Remind the user to update the versioning in `fetchConfig.js` when working on a new version.

**Why:** The user asked for this reminder for future version work.

**How to apply:** Raise the reminder when starting work on a new version, including v1.4.
