# Chinese README Design

## Goal

Add a Chinese README for the repository while preserving the existing English `README.md` as the default landing document.

## Scope

- Add a new `README.zh-CN.md` file.
- Add a top-level cross-reference link in `README.md` pointing to the Chinese README.
- Add a top-level cross-reference link in `README.zh-CN.md` pointing back to the English README.
- Keep both files aligned in structure and feature description.

## Chosen Approach

Use two separate README files instead of a single bilingual document.

### Why

- Keeps GitHub's default repository landing page in English.
- Gives Chinese readers a dedicated document with better readability.
- Avoids one oversized bilingual file.
- Makes cross-linking simple and explicit.

## Rejected Alternatives

### Single bilingual `README.md`

Rejected because it would make the main README longer and harder to scan.

### Chinese as primary `README.md`

Rejected because the repository currently presents itself in English and changing the default landing page would be a broader documentation decision.

## Content Plan

`README.zh-CN.md` will mirror the existing `README.md` sections:

- title and summary
- install
- prerequisites
- quick start
- sub-skills
- scenes prompt format
- FAQ
- contributing
- license

The translation should stay semantically faithful to the English version. It may use natural Chinese phrasing, but it should not introduce new behavior, commands, or requirements.

## Cross-Reference Placement

Add a single short line near the top of each file:

- `README.md` links to `README.zh-CN.md`
- `README.zh-CN.md` links to `README.md`

This should appear before the main body content so language switching is immediate.

## Validation

After editing:

- verify both files exist
- verify each file contains a link to the other
- verify the Chinese README retains the same major headings as the English README

## Risks

- Documentation drift between languages over time.

## Mitigation

- Keep section order aligned.
- Keep the Chinese file intentionally close to the English file in structure.
