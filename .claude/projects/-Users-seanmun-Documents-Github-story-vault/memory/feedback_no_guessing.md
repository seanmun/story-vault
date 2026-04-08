---
name: No speculative changes
description: Never make code changes based on guesses — diagnose first, recommend, then wait for approval before changing anything
type: feedback
---

Do NOT make speculative code changes. Always:
1. Identify the root cause with evidence
2. Explain the issue and proposed fix
3. Wait for approval before touching any code

**Why:** Guessing at fixes and pushing changes caused frustration and potentially broke things further. Unverified changes are destructive.

**How to apply:** When something fails, investigate first (read logs, check data, trace the code path). Present findings. Only write code after Sean confirms the approach.
