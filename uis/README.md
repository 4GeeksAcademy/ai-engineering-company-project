# `uis` folder

This folder contains **all the user interfaces** related to the company for the cross-functional AI Engineering project (for example: web applications, internal dashboards, customer portals, Streamlit/Gradio apps, etc.).

Each subfolder inside `uis/` must correspond to **one specific user interface** (for example: `website`, `backoffice`) and include its own technical and functional documentation.

- **Main purpose**: to centralize in a single place all the frontend applications that support the company's use cases.
- **Recommendation**: document in this file (or in sub-READMEs) the applications you add, their objective, the technology used, and how to run them.

> _Spanish version: [README.es.md](./README.es.md)._

## Run Locally (Codespaces)

Use this command from the repository root to serve the landing page:

```bash
npx --yes serve uis -l 5500
```

Then open `http://localhost:5500` (or the forwarded port URL in Codespaces).

## Files Added For Form Evaluation

- [application.html](application.html): standalone patient application/sign-up form using semantic HTML and Tailwind.
- [validation.js](validation.js): client-side validation logic (real-time checks, specific errors, submit prevention, success simulation).
