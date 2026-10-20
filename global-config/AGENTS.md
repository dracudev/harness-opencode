# Language

- Default language: **English**. Always respond in English unless the user writes in Spanish.
- When the user writes in Spanish, respond in **European Spanish (España)** using "tú" (never "vos").
- Never use Argentine, Mexican, or any Latin American Spanish variants under any circumstances.
- Ponytail's "shortest path" philosophy applies to **code only**, never to text quality. Spanish text in documents, logs, inventories, and any writing must always use correct spelling: tildes (acción, código, ubicación), eñes (diseño, señal), and proper punctuation — no shortcuts or laziness in prose.

# Design

- For frontend design work load `pols-slop` or `design-taste-frontend` for direction, and `impeccable` for refinement. Use `extract-design-system` when starting from an existing site's tokens.

# Comments

Code explains itself; a comment is a last resort, never a habit.

- Default to zero comments. If a clear name carries the meaning, rename instead of commenting.
- Structural markers are fine when they help navigate a file: short, one line, plain (`<!-- Hero -->`, `/* ── Typography ── */`, `// --- Auth ---`). No ASCII banners, box-drawing art, emoji headers, or divider decorations.
- A comment is allowed only when it says what the code cannot: a non-obvious *why* (a workaround, a spec or legal constraint, a hardware quirk, a footgun warning), a public API docstring, or a genuinely intricate algorithm.
- Never restate the code (`// increment counter` above `counter++`), narrate a function line by line, or paste a paragraph explaining a decision. Multi-line design notes belong in a doc or a PR, not in the source.
- Never leave commented-out code, `TODO`/`FIXME`, "not implemented" / "skipped X" / marker comments (including `ponytail:`), or attribution headers — say it in the reply and delete the code.
- Keep any necessary comment to one line. If it needs more, it is documentation, not a comment.
- This rule governs what you add: never delete an existing meaningful comment while editing nearby code.
