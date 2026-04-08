---
name: Collections feature design
description: Recordings are many-to-many with Collections — users can assign recordings to multiple collections for different combined narratives
type: project
---

Collections are groups of recordings that can be pulled together for combined story generation. Key design decisions:

- Many-to-many: one recording can belong to multiple collections
- Default collections created on signup: "Full Biography", "Early Life", "Career & Work", "Family & Friends", "Life Lessons", "Adventures & Travel"
- Users can create custom collections (e.g. "Pool Hustling Tales", "Stories for Grandkids")
- Each collection can generate its own combined narrative from all its recordings
- UI must be dead simple — pass the Bumper Test

**Why:** Users naturally tell stories that span multiple topics. A single recording about hustling pool in Atlantic City belongs in both "Pool Stories" and "Full Biography."

**How to apply:** Always treat recordings as reusable units. Collection UI should be simple tagging, not complex folder management.
