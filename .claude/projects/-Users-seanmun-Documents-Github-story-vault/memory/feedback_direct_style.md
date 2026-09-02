---
name: feedback-direct-style
description: "Sean wants click-level step-by-step instructions — one action per numbered step, exact URLs/menus/commands, what success looks like; no prose summaries"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 52faca79-125f-4d90-8d35-8ebe713012ae
  modified: 2026-09-02T01:43:14.051Z
---

Sean asked (Aug 2026): "Be more direct. Use bullets and numbers, specific instructions." Then again, frustrated (Sep 2026): "These are horrible instructions. Give me precise step by step instructions. WHAT DO I NEED TO DO."

**Why:** Grouped instructions like "set env vars in the dashboard" are too abstract — he wants literal click paths: which URL, which menu item, what to type, what he should see when it worked. Compound steps and background context read as noise.

**How to apply:** One physical action per numbered step ("Click X", "Paste Y", "Run Z"). Include the exact URL for every browser step and the exact command for every terminal step. After risky/ambiguous steps, add "You should see: ...". Never bundle two actions in one step. Keep the why to zero or one short line at the top.
