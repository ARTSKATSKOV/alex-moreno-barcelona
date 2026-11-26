# GitHub Issues & Milestones Guide (AI Agent Operating Manual)

> **Purpose:** Feed this file to any AI dev agent at the start of a new chat so all work in `ARTSKATSKOV/alex-moreno-barcelona` is consistently tracked through GitHub Issues, Milestones, and Project status updates.

---

## 1. Repository Context

- **Repository:** `ARTSKATSKOV/alex-moreno-barcelona`
- **Default branch:** `master`
- **Tooling:** Use GitHub MCP tools (`list_issues`, `issue_read`, `issue_write`, `add_issue_comment`, etc.) or the `gh` CLI (`gh issue`, `gh api`, `gh project`). Always prefer whichever is authenticated and available in the current session.

---

## 2. Core Discipline Rules (Non-Negotiable)

1. **No untracked work.** Every feature, bug fix, refactor, or significant doc/config change must map to a GitHub Issue.
2. **Search before creating.** Always list/search open issues first so you never create duplicates.
3. **One issue = one shippable unit.** Keep issues small and verifiable. Split multi-phase plans into one **Milestone** containing focused child issues.
4. **Always assign a Milestone and Labels.** Never leave an issue uncategorized. If no matching milestone exists, create one (or ask the user to confirm the milestone name).
5. **Link every commit to an issue.**
   - Partial progress: `Refs #<id>`
   - Completing an issue: `Closes #<id>` or `Fixes #<id>`
6. **Capture scope creep as new issues.** If you spot an unrelated bug, TODO, or improvement while coding, open a separate issue for it instead of silently expanding the current task or forgetting it.
7. **Update before closing.** Before closing an issue, post a concise closing summary (what changed, commit SHA, verification results) and verify all acceptance criteria checkboxes are checked.
8. **Keep Milestones accurate.** Whenever you close an issue, check its Milestone progress. When all issues in a Milestone are closed, notify the user and close the Milestone.

---

## 3. Standard Agent Workflow

### A. At the Start of Every Session / Task

1. Inspect active milestones and open issues:
   - Check which issue matches the user's request.
   - If **an issue exists**: read it (`issue_read` / `gh issue view <id>`), post a brief comment noting work has started, and move its GitHub Project status to **In Progress**.
   - If **no issue exists**: create one using the templates in Section 4, attach the right **Milestone** and **Labels**, add it to the GitHub Project (if linked), and set status to **In Progress**.
2. Confirm acceptance criteria before writing code.

### B. During Implementation

- Update task checkboxes inside the issue body as sub-tasks finish (for multi-step issues).
- Post a short comment if requirements change, a trade-off is made, or a blocker occurs.
- If you discover out-of-scope bugs or follow-up ideas, log them as new issues in the backlog (with labels + milestone) and link them (`Related to #<id>`).

### C. At Task Completion

1. Run verification (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` as applicable).
2. Commit with a clear message referencing the issue:
   - `feat(schedule): add full-week toggle (Closes #12)`
   - `fix(header): add aria-label to mobile bookings button (Fixes #15)`
3. Post a closing comment on the issue:
   ```markdown
   ### Done

   - **Commit:** `<sha>`
   - **Summary:** <1–3 bullet points of what changed>
   - **Verification:** `npm test` (passed), `npx tsc --noEmit` (0 errors), `npm run build` (ok)
   ```
4. Close the issue (or move it to **In Review** if waiting on PR/user review) and update the GitHub Project status to **Done**.
5. Check the parent **Milestone**:
   - Report remaining open issues in the milestone.
   - If `open_issues == 0`, close the milestone (or ask the user before closing if more issues are planned).

---

## 4. Issue Naming & Templates

### Title Format

Use `[Area] Imperative action`:

- `[Schedule] Add full-week toggle and studio/outdoor filters`
- `[SEO] Replace default preview with 1200x630 website snapshot`
- `[Bug] Mobile header My Bookings button missing aria-label`
- `[Docs] Document local development and deployment env vars`

### Feature / Enhancement Template

```markdown
## Context

Why are we doing this? Link any related plan doc (e.g. `IMPLEMENTATION_IMPROVEMENTS.MD`) or issue.

## Scope & Acceptance Criteria

- [ ] Criterion 1 (observable, testable outcome)
- [ ] Criterion 2
- [ ] Tests / verification updated

## Out of Scope

- Anything intentionally deferred to a separate issue

## Verification

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm test`
- [ ] `npm run build`
```

### Bug Template

```markdown
## Problem

What is broken and where does it occur (file, viewport, route)?

## Steps to Reproduce

1. ...
2. ...

## Expected vs. Actual

- **Expected:** ...
- **Actual:** ...

## Acceptance Criteria

- [ ] Root cause fixed
- [ ] Regression test added (if applicable)
```

---

## 5. Labels & Milestones Convention

### Labels

Use the repository's labels consistently (combine **Type** + **Area** when helpful):

| Category                    | Labels                                                             |
| :-------------------------- | :----------------------------------------------------------------- |
| **Type (existing)**         | `enhancement`, `bug`, `documentation`, `accessibility`, `question` |
| **Area (create as needed)** | `frontend`, `backend`, `seo`, `analytics`, `qa`, `infra`           |
| **Priority (optional)**     | `priority:high`, `priority:medium`, `priority:low`                 |

### Milestones

Group issues into clear, outcome-driven Milestones (e.g. `M1: Frontend V2 Polish`, `M2: SEO, Metadata & Analytics`, `M3: Backend Booking & Auth`):

- Every active issue must belong to a Milestone (except quick standalone hotfixes, which can still attach to the current release milestone).
- Always include a short **description** and optional **due date** when creating a Milestone.
- Keep Milestone progress visible by closing completed issues promptly and never leaving stale done issues open.

---

## 6. Quick `gh` CLI Cheatsheet (for Agents)

```powershell
# List open issues and milestones
gh issue list --state open
gh api repos/ARTSKATSKOV/alex-moreno-barcelona/milestones --jq '.[] | "#\(.number) \(.title) (\(.closed_issues)/\(.open_issues + .closed_issues) done)"'

# Create a milestone
gh api repos/ARTSKATSKOV/alex-moreno-barcelona/milestones -f title="M3: Backend & Auth" -f description="Persistent bookings and authentication"

# Create an issue with labels and milestone
gh issue create --title "[Area] Short summary" --label "enhancement" --milestone "M3: Backend & Auth" --body-file -

# Comment on and close an issue
gh issue comment 12 --body "Completed in commit abc1234. Verified with npm test & npm run build."
gh issue close 12

# Close a completed milestone (replace <number>)
gh api -X PATCH repos/ARTSKATSKOV/alex-moreno-barcelona/milestones/<number> -f state="closed"
```

---

## 7. New-Chat Kickoff Prompt (Copy-Paste)

Paste this at the start of any new AI dev session:

> Read `GITHUB_ISSUES_GUIDE.md` and follow it strictly for this session. Before coding, check open GitHub issues and active milestones in `ARTSKATSKOV/alex-moreno-barcelona`, create or update the relevant issue, link commits to it, and update the issue + milestone status when done.
