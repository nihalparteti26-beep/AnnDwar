# AnnDwar Multilingual Version

This version preserves the original AnnDwar application and adds a language selector for major Indian languages.

## Languages
English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia and Assamese.

## Run on Windows
1. Open this exact folder in VS Code (the folder containing `package.json`).
2. Open Terminal.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

The archive includes the original `node_modules` from the working Windows project, so do not delete `node_modules` before the first test.

If npm reports that dependencies are missing, run `npm install` once and then `npm run dev`.

## Multilingual behavior
- Hindi and English use AnnDwar's existing native UI copy.
- The other listed Indian languages use Google Translate in the browser, with English as the stable source language.
- The selected language is stored in localStorage and restored on refresh.
- The language selector is available on the login screen and the main navigation.
