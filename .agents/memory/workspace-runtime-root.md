---
name: Workspace runtime root
description: The API package runs with its package directory as the working directory, so shared workspace paths need explicit resolution.
---

Resolve the coding workspace relative to the repository/artifact location rather than assuming the API process starts at repository root. Keep `ORBIT_WORKSPACE_ROOT` available as an explicit override.

**Why:** Package-scoped workflow commands set the process working directory to the API artifact, which can silently create a second nested workspace.

**How to apply:** Verify the resolved path through the workspace endpoint after restarting the API, and keep runtime-created project files under the web artifact’s workspace directory.