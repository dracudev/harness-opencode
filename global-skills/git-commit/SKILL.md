---
name: git-commit
description: Commit staged or working changes with a short conventional message in English. Use only when the user explicitly asks to commit.
license: MIT
allowed-tools: Bash
---

# Git Commit

Only run this when the user asked for a commit in the current message. Never commit as a side effect of finishing a task.

## Message

```
<type>(<scope>): <summary>
```

- English, imperative mood, lowercase summary, no trailing period.
- One line. A second line only if the why is not visible in the diff.
- Under 72 characters.
- No emoji, no body, no footers, no `Co-Authored-By`, no "generated with" lines.

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Breaking change: `feat(api)!: ...`.

Scope is the module or area, not the file name: `fix(auth): reject expired refresh tokens`.

## Steps

1. `git status --porcelain` and `git diff` to see what actually changed.
2. Stage only the files that belong to the change. Never stage `.env`, keys, secrets, `node_modules` or build output.
3. Commit with a single `-m`.
4. Never push unless the user asked for it in the same message.

## Safety

- Never `--no-verify`, `--force`, `git reset --hard` or amend published commits.
- If a hook fails, fix the cause and make a new commit.
