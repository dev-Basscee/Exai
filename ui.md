name Build a mobile-first, installable PWA called "ExamPredict AI" — a study companion 
that shows students AI-predicted exam questions ranked by frequency and difficulty, 
with detailed explanations. Use React, Tailwind CSS, and shadcn/ui components. 
Clean, modern, student-friendly design — not corporate/enterprise looking. 
Use a calm primary color (indigo or teal), plenty of whitespace, rounded cards, 
and clear typography hierarchy.

## Screens needed:

### 1. Workspace Dashboard (home screen after login)
- Header with app name/logo and a "+ New Workspace" button
- Grid/list of course workspace cards (e.g. "CHEM 201", "Contract Law"), each showing: 
  course name, number of uploads, number of predicted questions found, 
  last updated date, and a status badge (Processing / Ready / Needs Material)
- Empty state when no workspaces exist yet, with a friendly illustration-style 
  prompt to create the first one

### 2. New Workspace / Upload screen
- Simple form: workspace name input
- Two distinct drag-and-drop upload zones side by side (stack on mobile):
  - "Past Questions" zone (icon: document with clock/repeat icon)
  - "Study Material / Notes" zone (icon: book/notebook icon)
- Accepted file types shown clearly (PDF, JPG, PNG, DOCX)
- Uploaded files appear as a list under each zone with filename, file size, 
  and a small status icon (uploading / done / error), with a remove button
- Prominent "Analyze My Material" button at the bottom, disabled until at 
  least one file is uploaded in each zone
- After clicking analyze, show a processing state: a card with an animated 
  progress indicator and rotating status text ("Reading your documents...", 
  "Finding repeated questions...", "Ranking by difficulty...")

### 3. Predictions List screen (main results view for a workspace)
- Sticky header showing workspace name and a sort/filter bar with pill buttons: 
  "Recommended", "Most Frequent", "Hardest", and a search input
- List of predicted question cards, each showing:
  - Question text (truncated to 2 lines with "..." if long)
  - A frequency badge (e.g. "Appeared 6/8 years" with a small repeat icon)
  - A difficulty badge (Easy/Medium/Hard, color-coded green/amber/red)
  - Topic tag (small pill, e.g. "Thermodynamics")
  - A bookmark/star icon to mark as "hard for me"
  - Tapping the card expands or navigates to the detail view
- Subtle count summary at top: "24 predicted questions from 8 years of past papers"

### 4. Question Detail / Explanation view
- Back button to predictions list
- Question text prominently displayed at top, with frequency + difficulty badges
- "Years this appeared in" shown as small chips (2019, 2021, 2022...)
- Expandable/collapsible section showing the original question variants 
  (how it was worded differently across years) — collapsed by default
- Detailed explanation section below, nicely formatted with headings, 
  paragraphs, and possibly bullet points for structured answers
- A small subtle label indicating grounding source, e.g. "Based on your 
  uploaded notes" vs "Includes general knowledge" (small icon + tooltip)
- Bottom action bar: "Mark as Reviewed" and "Mark as Still Hard" toggle buttons

### 5. Bottom navigation (mobile) / sidebar (desktop)
- Icons: Home/Workspaces, current workspace Predictions, Profile/Settings
- Include a small "Install App" prompt banner that can be dismissed, 
  styled as a subtle card, not a native browser popup

## General requirements:
- Fully responsive: mobile-first, but should look good on tablet/desktop too
- Use skeleton loading states for cards while data is loading
- Use realistic placeholder data (fake course names, fake questions like 
  "Explain the process of photosynthesis" or "Discuss the elements of a 
  valid contract", fake frequency/difficulty values) so the UI is easy 
  to preview and demo
- Include subtle empty states and error states (e.g. "No predictions yet — 
  upload past questions to get started")
- Keep components modular so I can wire up real data later: separate 
  WorkspaceCard, UploadZone, PredictionCard, QuestionDetail, and 
  BottomNav components 