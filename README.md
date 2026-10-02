# Kanji Slideshow

A simple **Next.js + React** Japanese Kanji learning app. Upload a
PowerPoint vocabulary file, practice Kanji in random order, review weak
words, and export results.

## Features

-   Upload `.pptx`, `.xlsx`, `.csv`, `.png`, `.jpg`, and `.webp`
-   Randomized Kanji slideshow with configurable timer
-   **Maru (〇), Batsu (☓), and Not Attended** answers
-   Flashcards, Quiz, and Listening practice
-   AI-generated **Hiragana readings and English/Hindi meanings**
-   Google Gemini with Groq fallback
-   Weak-word tracking and review
-   Export results as **PDF, Excel, and CSV**
-   Session data stays in browser memory and is cleared on
    logout/refresh/close

## Setup

``` bash
npm install
npm run dev
```

Open:

``` text
http://localhost:3000
```

## Environment Variables

Create `.env.local` in the project root:

``` env
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
```

At least one API key is required. Optional model settings:

``` env
GEMINI_MODEL=your-model-name
GROQ_MODEL=your-model-name
```

Never commit API keys to GitHub.

## PowerPoint Format

Each slide should contain a Kanji or Japanese word.

Optional speaker notes can contain:

``` text
reading | meaning
```

Example:

``` text
にほん | Japan
```

If notes are unavailable, AI generates the reading and meaning.

**Note:** Kanji inside images or scanned slides is not currently
supported.

## How It Works

1.  Login with your name.
2.  Upload your vocabulary file.
3.  Choose **Slideshow, Flashcards, Quiz, or Listening**.
4.  Practice the Kanji and mark your answers.
5.  Review weak words and final results.
6.  Download results as PDF, Excel, or CSV.

## AI Flow

``` text
Kanji
  ↓
Speaker Notes?
  ├── Yes → Use provided reading/meaning
  └── No  → Gemini
              ↓
           Retry
              ↓
         Groq fallback
```

AI requests are processed in batches to improve efficiency.

## Project Structure

``` text
app/
components/
hooks/
lib/
  ai/
services/
```

Key modules include:

-   `page.jsx` --- main application
-   `useSlideshow.js` --- slideshow logic
-   `useAnswers.js` --- AI answers and request handling
-   `pptx.js` --- PowerPoint extraction
-   `export.js` --- Excel/CSV export
-   `exportPdf.js` --- PDF export
-   `lib/ai/` --- AI providers and processing

## Limitations

-   PowerPoint images and scanned Kanji are not processed
-   AI-generated readings/meanings may need review
-   PDF exports are image-based and not text-selectable
-   Current login is a simple demo login, not production authentication

## Security

Keep API keys server-side in `.env.local` and add `.env.local` to
`.gitignore`.

For public deployment, add proper authentication, authorization, rate
limiting, validation, and usage controls.
