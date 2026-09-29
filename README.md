# Kanji Slideshow — Next.js + React

A web-based Kanji learning application built with **Next.js and React**. Users can upload a `.pptx` file containing Kanji characters, practice them in a **randomized slideshow**, and record their answers as **Maru (Correct), Batsu (Incorrect), or Not Attended**.

The application automatically generates the **Kanji reading (Hiragana) and meaning (English/Hindi)** using AI and provides a final score with downloadable results in **PDF, Excel, and CSV** formats.

---

## Features

### 📂 PowerPoint Upload

* Upload `.pptx` files directly from the browser.
* The uploaded PowerPoint file is **not stored on the server**.
* The file remains only in the browser's memory during the session.
* Slide text is extracted and used to create the Kanji practice set.
* Slide number text such as `112 / 126` is automatically ignored.

### 🎲 Randomized Slideshow

* Kanji slides are displayed in a **random order**.
* Users can configure how many seconds each Kanji should be displayed.
* The slideshow automatically moves to the next Kanji when the timer expires.
* A **Pause/Resume** option is available.
* The slideshow can be restarted when required.

### ✅ Answer Selection

For every Kanji, the user can select:

* **○ Maru — Correct**
* **× Batsu — Incorrect**
* **Not Attended**

After selecting an answer, the application automatically moves to the next slide.

If the timer expires without the user selecting an answer, the Kanji is automatically marked as **Not Attended**.

### 🤖 AI-Generated Reading and Meaning

The application automatically generates:

* **Reading:** Hiragana
* **Meaning:** English / Hindi

AI processing uses:

1. **Google Gemini** as the primary provider.
2. **Groq** as a fallback provider if Gemini fails.

If the PowerPoint contains speaker notes in the following format:

```text
reading | meaning
```

the application uses the provided values instead of calling the AI.

Example:

```text
にほん | Japan
```

If speaker notes are not available, the Kanji is sent to the AI service for automatic processing.

AI requests are processed in groups of **40 Kanji** to improve efficiency and reduce unnecessary API requests.

### 📊 Final Results

After all slides have been completed, the application displays an Answers page containing:

* Total Kanji
* Correct answers
* Incorrect answers
* Not Attended
* Score percentage
* Kanji
* Reading
* Meaning
* Answer status

### 📄 PDF Export

Users can download their final results as a PDF.

The PDF includes:

* User name
* Date
* Kanji
* Reading
* Meaning
* Answer status
* Score summary

The generated filename follows this format:

```text
Kanji Answers - <name>.pdf
```

The PDF is downloaded directly without opening the browser print dialog.

> **Note:** The PDF is generated as an image-based document, so its text cannot be selected or copied.

### 📊 Excel and CSV Export

Results can also be downloaded as:

```text
Kanji Result - <name>.xlsx
Kanji Result - <name>.csv
```

The exported data contains the Kanji, reading, meaning, and answer status.

CSV files include a UTF-8 BOM so that Japanese characters display correctly when opened in Excel.

### 🔐 Session Cleanup

Application data is cleared when:

* The user logs out.
* The page is refreshed.
* The browser tab is closed.
* The current session ends.

Any ongoing AI generation requests are also cancelled when the session is terminated.

---

# Setup

### 1. Install Dependencies

Clone the project and install the required packages:

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

---

# Environment Variables

Create a `.env.local` file in the project root, in the same directory as `package.json`.

Example:

```env
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
```

Do not add quotes around the API keys.

### API Providers

| Variable         | Provider      | Example   |
| ---------------- | ------------- | --------- |
| `GEMINI_API_KEY` | Google Gemini | `AIza...` |
| `GROQ_API_KEY`   | Groq          | `gsk_...` |

At least one API key is required.

If both keys are configured:

```text
Gemini → Retry → Groq fallback
```

Optional model configuration can also be provided:

```env
GEMINI_MODEL=your-model-name
GROQ_MODEL=your-model-name
```

After changing `.env.local`, restart the development server:

```bash
Ctrl + C
npm run dev
```

---

# PowerPoint Format

The recommended PowerPoint format is:

* Each slide should contain the **Kanji character or word**.
* Speaker notes are optional.
* If speaker notes are available, use:

```text
reading | meaning
```

Example:

```text
にほん | Japan
```

If notes are empty, the application automatically generates the reading and meaning using AI.

Slide-number text such as:

```text
112 / 126
```

is automatically removed.

### Important

The application extracts **text from the PowerPoint**.

It does not currently process Kanji that exists only inside:

* Images
* Screenshots
* Scanned documents

---

# How to Use

### Step 1 — Login

Enter your name and click **Login**.

### Step 2 — Upload PowerPoint

Upload a `.pptx` file and configure the number of seconds each Kanji should remain on screen.

### Step 3 — Start Slideshow

Click:

**Start Slideshow**

The Kanji will appear in random order.

### Step 4 — Answer

For every Kanji, select one of:

```text
○ Maru
× Batsu
Not Attended
```

Selecting an answer immediately moves the slideshow to the next Kanji.

If the timer expires without an answer, the application records:

```text
Not Attended
```

### Step 5 — Review Results

After the final Kanji, the Answers page displays the complete result including:

* Score
* Reading
* Meaning
* Answer status

### Step 6 — Export Results

Download the results using:

* **PDF**
* **Excel**
* **CSV**

---

# Project Structure

```text
app/
├── layout.jsx
├── globals.css
├── page.jsx
│
└── api/
    └── answers/
        └── route.js

components/
├── LoginForm
├── Header
├── UploadPanel
├── SlidePlayer
└── AnswersTable

hooks/
├── useSlideshow.js
└── useAnswers.js

services/
└── answersApi.js

lib/
├── pptx.js
├── shuffle.js
├── export.js
├── exportPdf.js
│
└── ai/
    ├── index.js
    ├── gemini.js
    ├── groq.js
    ├── prompt.js
    └── retry.js

jsconfig.json
```

### Key Modules

**`app/page.jsx`**
Main page responsible for connecting the major application components.

**`app/api/answers/route.js`**
Server-side API endpoint responsible for handling AI requests.

**`hooks/useSlideshow.js`**
Manages:

* Slideshow timer
* Next slide
* Pause/resume
* Restart
* Automatic `Not Attended` handling

**`hooks/useAnswers.js`**
Manages:

* AI-generated answers
* Answer state
* Request cancellation
* Result processing

**`lib/pptx.js`**
Extracts Kanji and speaker notes from the uploaded PowerPoint.

**`lib/shuffle.js`**
Randomizes the Kanji order.

**`lib/export.js`**
Generates Excel and CSV files.

**`lib/exportPdf.js`**
Generates the downloadable PDF.

**`lib/ai/index.js`**
Manages AI providers and batch processing.

**`lib/ai/gemini.js`**
Handles Gemini API requests and model fallback.

**`lib/ai/groq.js`**
Handles Groq API requests.

**`lib/ai/prompt.js`**
Contains the AI prompt and response-cleaning logic.

**`lib/ai/retry.js`**
Handles retries for temporary API errors such as HTTP `503`.

---

# AI Processing Flow

The AI processing flow is:

```text
Kanji extracted from PPT
        ↓
Check speaker notes
        ↓
Notes available?
   ┌────┴────┐
  Yes       No
   ↓         ↓
Use notes   Gemini
             ↓
          Retry if needed
             ↓
       Gemini successful?
        ┌────┴────┐
       Yes       No
        ↓         ↓
      Result     Groq
                  ↓
                Result
```

The application sends only the required Kanji data to the AI provider.

The complete PowerPoint file and user's name are not sent to the AI service.

---

# Security Considerations

### API Key Protection

API keys are used only on the server side.

They should never be exposed in client-side React code.

The keys should be stored in:

```text
.env.local
```

Make sure `.env.local` is included in `.gitignore`.

**Never commit API keys to GitHub or share them through screenshots or chat.**

### Current Login Implementation

The current login system is a simple name-based demo login.

It is **not intended for production authentication**.

Before deploying the application publicly, implement:

* Proper user authentication
* Authorization
* API rate limiting
* Request validation
* Usage limits
* Server-side abuse protection

Otherwise, unauthorized users could potentially consume the configured AI API quota.

### AI Data Privacy

Only the Kanji information required for generating the reading and meaning is sent to the configured AI provider.

Review the current privacy and data-retention policies of the selected AI provider before using the application with sensitive data.

---

# Troubleshooting

| Problem                               | Possible Cause / Solution                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `No API key configured`               | Check `.env.local`, verify the file location, and restart the server.                                      |
| `API key not valid`                   | Verify that the complete Gemini or Groq API key has been copied correctly.                                 |
| `Model no longer available`           | Configure a currently supported model using `GEMINI_MODEL` or `GROQ_MODEL`.                                |
| `503 / High demand`                   | The provider may be temporarily overloaded. The application retries the request and can fall back to Groq. |
| `.pptx file could not be read`        | Verify that the file is a valid `.pptx` file and not an older `.ppt` file renamed to `.pptx`.              |
| Reading/Meaning shows `-`             | Speaker notes may be empty and the AI request may have failed. Retry the AI generation.                    |
| Excel export does not work            | Run `npm install` and verify that the `xlsx` package is installed.                                         |
| PDF export does not work              | Run `npm install` and verify that `html2pdf.js` is installed.                                              |
| Japanese characters are broken in CSV | Open the CSV using Excel or another UTF-8 compatible application.                                          |

---

# Limitations

### PowerPoint Rendering

The application extracts text from the PowerPoint rather than rendering the original slides.

Therefore, the following are currently not supported:

* Slide images
* Animations
* PowerPoint transitions
* Original slide design/layout
* Kanji embedded inside images

### AI Accuracy

AI-generated readings and meanings may occasionally be incorrect.

Users should review the generated results before relying on them for study or assessment purposes.

### PDF Text

The generated PDF is image-based, so text cannot be directly selected or copied.

For editable or copyable results, use the **Excel or CSV export**.

---

# Future Improvements

Potential improvements for future versions include:

* Real user authentication
* Database-based user history
* Study progress tracking
* Kanji difficulty levels
* JLPT level filtering
* Multiple-choice answers
* OCR support for Kanji inside images
* Better AI validation
* Offline/PWA support
* Detailed performance analytics
* Admin dashboard
* Cloud deployment with usage and rate-limit controls
