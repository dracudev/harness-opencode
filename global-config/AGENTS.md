# Language

- Default language: **English**. Always respond in English unless the user writes in Spanish.
- When the user writes in Spanish, respond in **European Spanish (España)** using "tú" (never "vos").
- Never use Argentine, Mexican, or any Latin American Spanish variants under any circumstances.
- Ponytail's "shortest path" philosophy applies to **code only**, never to text quality. Spanish text in documents, logs, inventories, and any writing must always use correct spelling: tildes (acción, código, ubicación), eñes (diseño, señal), and proper punctuation — no shortcuts or laziness in prose.

# Design

- For frontend design work load `pols-slop` or `design-taste-frontend` for direction, and `impeccable` for refinement. Use `extract-design-system` when starting from an existing site's tokens.

# Code

- Write the smallest complete change that solves the task. No abstraction, option or "for later" code nobody asked for.
- Prefer the standard library and the dependencies the project already has. Never add one for a few lines.
- One job per function. Side effects at the edges: not in the middle of a render, a parser or a query builder.
- Validate at trust boundaries: user input, network, files, money, auth. Never swallow an error or leave a bare `catch` that hides the cause.
- Leave no dead code, unused export, debug log or commented-out block.
- The project's existing style is not automatically right. Follow it when it is sound; do not copy known bad patterns for the sake of consistency. If the codebase is poor, write the new code well and say what you did differently.
- Verify with the project's own tests, build or linter before claiming something works. "It should work" is not a result.
- If a project has a `.codegraph/` directory and the codegraph MCP is active, use it for structural queries. Never run `codegraph init` unless asked.

# Git

- Never commit, push, create a branch or stash unless the user asks for it in that message.
- When asked: `<type>(<scope>): <summary>` in English, imperative, one line. A second line only when the why is not obvious from the diff.
- No emoji, no body, no footers, no `Co-Authored-By`, no "generated with" lines.
- Stage only the files that belong to the change.
- Never `--no-verify`, never force push, never rewrite published history.

# Documentation

- Markdown: one H1, short sections. No intro that restates the title, no "In this section", no emoji headers, no ornamental dividers.
- Tables for repeated data. Fenced code blocks with a language tag. Commands must be copy-pasteable.
- Write decisions, constraints and the why. What the code does is already in the code.
- READMEs: what it is, how to run it, what it needs. No badge walls, no marketing prose.

# Comments

Code explains itself; a comment is a last resort, never a habit.

- Default to zero comments. If a clear name carries the meaning, rename instead of commenting.
- Structural markers are fine when they help navigate a file: short, one line, plain (`<!-- Hero -->`, `/* ── Typography ── */`, `// --- Auth ---`). No ASCII banners, box-drawing art, emoji headers, or divider decorations.
- A comment is allowed only when it says what the code cannot: a non-obvious *why* (a workaround, a spec or legal constraint, a hardware quirk, a footgun warning), a public API docstring, or a genuinely intricate algorithm.
- Never restate the code (`// increment counter` above `counter++`), narrate a function line by line, or paste a paragraph explaining a decision. Multi-line design notes belong in a doc or a PR, not in the source.
- Never leave commented-out code, `TODO`/`FIXME`, "not implemented" / "skipped X" / marker comments (including `ponytail:`), or attribution headers — say it in the reply and delete the code.
- Keep any necessary comment to one line. If it needs more, it is documentation, not a comment.
- This rule governs what you add: never delete an existing meaningful comment while editing nearby code.
