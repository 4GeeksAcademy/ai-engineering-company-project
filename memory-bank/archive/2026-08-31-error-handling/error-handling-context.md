# Error Handling Project Context

## Purpose

This document is a standalone requirements handoff for an agent that will plan and implement the error-handling project. It covers only the error-handling assignment described in the authoritative source:

[4Geeks Academy — Error Handling](https://github.com/4GeeksAcademy/ai-engineering-syllabus/blob/main/content/projects/ai-eng-error-handling/README.md)

The planning agent must inspect the actual application before choosing files, abstractions, or implementation details. This document defines the required outcomes; it does not replace repository-specific analysis.

## Project Goal

Audit the existing company platform and apply a coherent error-handling strategy across its Next.js frontend, FastAPI backend, and Python scripts. The finished system must fail predictably, communicate problems clearly, protect sensitive information, and always give users a way forward.

This is a cross-cutting resilience and error-communication project. It is not a new feature.

## Repository Scope and Constraints

- Work in the existing fork of the company monorepo selected at the beginning of the course.
- Do not create a new repository or generate new boilerplate.
- Do not add features or refactor code unrelated to error handling.
- Preserve established architecture, conventions, public interfaces, and successful behavior unless an error-handling requirement necessitates a change.
- Inspect the repository before planning; do not assume that example paths or layouts match the actual checkout.
- The assignment recommends a `feature/error-handling-audit` branch and clear commits, followed by a pull request or repository submission. Perform Git mutations only when the user authorizes them.

## Core Requirements

- No error should crash the application or leave the user in an undefined state.
- Every asynchronous frontend operation must visibly represent loading, success, and error states.
- User-facing errors must be written in plain language. Never show raw stack traces, exception messages, status codes, or JSON parsing errors.
- Every user-facing error must offer a clear next action, such as retrying, returning home, navigating elsewhere, or contacting support.
- Catch exceptions at the specific operation that can fail. Avoid one broad `try/catch` or `try/except` around an entire function.
- Never include sensitive or internal information in error output sent to a client.
- Do not silently swallow failures.

## Required Initial Audit

Before changing application code, scan the repository and prepare a prioritized audit report. Each finding should include:

- severity: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`;
- file path and line number or range;
- category;
- concise description of the problem;
- brief suggested correction.

Audit for these categories:

1. **Missing error handling:** asynchronous work, file I/O, parsing, or other fallible operations without appropriate handling.
2. **Overly broad catch:** large `try/catch` or `try/except` blocks that obscure which operation failed.
3. **Silent failure:** empty catch blocks, ignored failures, or constructs such as bare `except: pass`.
4. **Raw error exposure:** exception text, stack traces, HTTP status codes, or parsing messages reaching users or API clients.
5. **Sensitive data leaks:** error responses or logs that may include credentials, secrets, connection strings, internal paths, personal data, or raw payloads.
6. **Missing frontend states:** data-fetching components without explicit loading, fulfilled, and rejected states.
7. **Missing call to action:** error UI that explains a problem but gives the user no recovery or exit path.
8. **Incorrect script exit behavior:** critical script failures that still exit with status code `0` or do not set an explicit failure code.

Use the audit findings to create a file-specific implementation plan. Prioritize higher-severity issues and shared error contracts while keeping every change within scope.

## Frontend Requirements — Next.js and TypeScript

- Find every frontend `fetch` call and other asynchronous API operation.
- Add narrowly scoped `try/catch` handling around each fallible operation where needed.
- Implement three observable states for every asynchronous data-fetching flow:
  - **Loading:** show a spinner, skeleton, or other meaningful progress indicator.
  - **Fulfilled:** render the successful result.
  - **Rejected:** show a human-readable explanation and a clear call to action.
- Replace raw messages such as `Error 500`, stack traces, and parsing exceptions with safe, useful explanations.
- Provide an appropriate recovery action, such as retry, navigation, or support guidance.
- Use `finally` where appropriate so loading state is reliably cleared after success or failure.
- Use optional chaining (`?.`) when accessing potentially absent nested values.
- Provide safe defaults or fallbacks for values that may be `null` or `undefined` during rendering.
- Ensure retries actually repeat the intended operation and reset stale error or loading state correctly.

## Backend Requirements — Python and FastAPI

- Review every route handler and relevant service operation for correct exception boundaries.
- Catch exceptions close to the operation that can fail instead of wrapping entire functions in broad handlers.
- Return appropriate HTTP statuses, including `400`, `404`, `422`, and `500`, according to the failure.
- Return clean, structured JSON error bodies that frontend consumers can handle consistently.
- Do not send Python tracebacks, raw exception details, secret values, database connection strings, internal paths, or other sensitive data to clients.
- Handle failures from every external API or third-party service call, including LLM calls where present.
- Preserve expected FastAPI errors and distinguish client-caused failures from unexpected server failures.
- Retain useful, sanitized server-side diagnostics without exposing them in the client response.

## Python Script Requirements

- Wrap fallible file I/O and CSV parsing operations in appropriately scoped `try/except` blocks.
- Print informative critical-error messages to `stderr`.
- Exit with a nonzero status, normally `sys.exit(1)`, when a critical error prevents successful completion.
- Validate inputs before processing and handle missing or malformed data defensively.
- Do not emit misleading success output after a failed or partial operation.

## Logging and Information Safety

- Review `console.error`, `print`, logger calls, exception formatting, and API serialization.
- Remove or sanitize output that could expose secrets, credentials, personal data, connection strings, internal paths, raw payloads, or unnecessary implementation details.
- Keep enough sanitized context in developer-facing logs to diagnose failures.
- Do not protect sensitive data by silently discarding the error.

## Acceptance Criteria

- All asynchronous frontend operations implement visible loading, fulfilled, and rejected states.
- All user-facing errors are human-readable and offer an appropriate next action.
- `try/catch` and `try/except` blocks are scoped to specific risky operations rather than entire functions.
- Loading state is reliably cleaned up, with `finally` used where appropriate.
- Optional chaining and safe fallbacks prevent realistic null or undefined rendering failures.
- FastAPI routes return structured, sanitized errors with correct HTTP statuses.
- All external backend calls have explicit failure handling.
- No client-visible output contains stack traces, secrets, personal data, connection strings, internal paths, or raw exception details.
- Python scripts handle input, file, and parsing failures; critical failures write to `stderr` and exit nonzero.
- Sensitive or excessively detailed `console.error`, `print`, and logging output is removed or sanitized.
- No unrelated feature or refactoring work is included.

## Planning and Validation Guidance

The planning agent should first map the frontend, backend, scripts, shared error contracts, and existing tests. It should identify repository conventions that can be extended instead of introducing unnecessary new abstractions.

Implementation and validation should be treated as one task. Add focused tests for new or corrected error behavior using the repository's existing testing patterns. Relevant cases may include:

- successful operations;
- loading state before completion;
- rejected requests, timeouts, non-2xx responses, and malformed responses;
- retry after a failed frontend request;
- expected FastAPI client errors versus unexpected internal failures;
- sanitization of client-visible response bodies;
- missing, empty, inaccessible, or malformed script inputs;
- script `stderr` output and nonzero exit status on critical failure;
- cleanup of loading and transient state on every path.

Run the narrowest relevant tests first, followed by applicable type checks, lint checks, builds, integration tests, or smoke tests. Record the exact checks and results. Do not claim a test or validation passed unless it was actually run successfully.

The implementation plan must be grounded in the repository as found and should name the concrete files, behaviors, dependencies, tests, and edge cases involved.
