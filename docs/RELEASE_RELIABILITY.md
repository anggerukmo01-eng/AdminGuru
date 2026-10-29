# Release reliability fixes — 29 October 2026

Base: b3fa205d7daa54b0aecd7544e9c828b873658670. Separate from PR #10 (Prota/Promes).

## Behavior
- Bulk grade drafts use the same canonical cell keys when read and written. Existing F0-0/S0 draft keys are normalized when read.
- An explicit blank is a draft tombstone. Saving removes the matching assessment, including legacy TP1 records; untouched blanks do not delete records. Zero remains a real grade.
- An empty column-fill prompt cannot silently become zero.
- Date-only records use the device local calendar date.
- Ctrl/Cmd+K reuses the search dialog and leaves an already open form intact. Closing a modal restores focus if its opener still exists.
- AI timeouts cover response bodies. Authentication/payment failures, malformed/empty replies, stream errors and timeouts do not retry. Transient HTTP/network failures can retry before streamed content is emitted. Incomplete streams fail rather than save a successful document.
- AI preview/history/export share the existing semantic document normalizer and native DOCX engine. Custom system prompts stay unchanged; format instructions are appended to the user prompt.
- Truncated drafts do not automatically download. Manual DOCX/Dropbox exports retain an explicit warning. Export failure retains the document and displays an error.
- Results retain their own titles. History records the class active when generation began.

## Validation
- Added unit regressions for draft recovery/migration, zero, repeated saves, explicit clears, legacy TP1, scope isolation and blank column-fill.
- Added real-browser regressions for search Esc/focus/modal preservation and grade editing, navigation, reload, deletion and weighted calculation.
- Existing AI tests exercise stalled response bodies, auth retries, UTF-8 and stream errors.
- Existing Word browser tests exercise real DOCX bytes, formatting controls, truncation, history and mocked Dropbox binary upload.
- Local shell/Node/Chromium is unavailable in this session. JavaScript syntax and isolated grade behavior were executed in the orchestration V8 runtime. GitHub Actions is the source of full-suite results; do not equate publication/merge with a passing suite.

## Manual follow-up
Use synthetic data in a separate browser profile. Test sticky grade identities and editable columns at 390px, 768px and 1440px, light/dark themes, 200% zoom and Android keyboard visibility. Verify one authorized live AI request separately from the mocked CI suite. Word pagination may differ across viewers. No live API keys or external uploads are used by the tests.
