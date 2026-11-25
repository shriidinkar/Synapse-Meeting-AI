# Synapse Meeting AI

**Autonomous Meeting Intelligence & Action Engine**

Synapse converts raw meeting transcripts into structured, grounded meeting records—including executive summaries, locked-in decisions, assigned action items, normalized deadlines, and follow-up recommendations—while proactively detecting incomplete or ambiguous items for interactive resolution and exporting directly to major calendar platforms.

---

## Key Features

- **Zero-Hallucination Grounding**: Every extracted decision, action item, and summary point is backed by an exact verbatim quote, speaker attribution, and timestamp from the source transcript. Clicking any citation highlights and scrolls directly to the corresponding line in the Transcript Source Inspector.
- **Interactive Ambiguity & Clarification Resolver**:
  - Automatically flags tasks with missing owners (`missing_owner`), fuzzy dates (`vague_deadline`), unclear deliverables (`underspecified_scope`), conflicting statements (`conflicting_statements`), or missing dependencies.
  - Offers 1-click contextual resolution suggestions or custom natural-language resolution inputs that update assignees and normalize ISO 8601 deadlines in real time.
  - Generates ready-to-send Slack/Email clarification messages for team outreach.
- **Structured Meeting Outcomes**:
  - **Executive Summary**: Narrative overview, meeting sentiment/dynamic classification, key discussion topics, and participant accountability metrics.
  - **Decisions Log**: Searchable and filterable commitments with decision-makers, impact areas, and rationale.
  - **Action Items & Deadlines**: Interactive task list with status toggles, assignee/priority/status filters, and inline task creation or editing.
  - **Follow-Ups & Next Steps**: Recommended checkpoints, external communications, approvals needed, and open questions.
- **Multi-Platform Calendar & Productivity Exports**:
  - **Google Calendar**: Direct pre-filled web event creation links and `.ics` bundle export.
  - **Microsoft Outlook / Office 365**: Direct Outlook Web compose deeplinks and `.ics` download.
  - **Apple Calendar & Universal RFC 5545 `.ics`**: Single-task or bundled `.ics` downloads with configurable `VALARM` reminders.
  - **Markdown (`.md`), CSV (`.csv`), and JSON (`.json`)**: Export meeting summaries and structured task tables for Notion, Docs, Jira, Linear, or spreadsheets.
- **Flexible Transcript Ingestion**: Paste raw transcripts, drag-and-drop or upload `.txt`, `.vtt`, `.srt`, `.md`, or `.json` files, or load built-in sample meetings.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express (`server.ts` with Vite middleware in development)
- **AI Engine**: `@google/genai` SDK (`gemini-3.8-flash`) with strict JSON schema output (`responseSchema`)

---

## Project Structure

```text
├── server.ts                         # Express server, API routes, & Vite dev middleware
├── index.html                        # HTML entry point & metadata
├── package.json                      # Scripts & dependencies
├── .env.example                      # Environment variable template
└── src/
    ├── App.tsx                       # Main application state & orchestration
    ├── main.tsx                      # React root mount
    ├── index.css                     # Tailwind CSS entry
    ├── types/
    │   └── meeting.ts                # TypeScript interfaces for analyses, tasks, & citations
    ├── data/
    │   └── sampleTranscripts.ts      # Built-in sample meeting transcripts
    ├── utils/
    │   ├── calendarExport.ts         # Google Calendar, Outlook Web, & RFC 5545 .ics generators
    │   └── exportFormats.ts          # Markdown & CSV export formatters
    └── components/
        ├── Header.tsx                # Navigation bar & global export menu
        ├── TranscriptInput.tsx       # Transcript input, file upload, & sample selector
        ├── AmbiguityResolver.tsx     # Interactive clarification & outreach draft panel
        ├── ActionItemsView.tsx       # Filterable tasks list & per-task calendar links
        ├── DecisionsView.tsx         # Searchable decisions log
        ├── SummaryView.tsx           # Executive summary, key topics, & participant metrics
        ├── FollowUpsView.tsx         # Follow-up recommendations & sync scheduling
        ├── TranscriptViewer.tsx      # Searchable transcript inspector with quote highlighting
        ├── CalendarExportModal.tsx   # Bulk calendar export modal with task selection
        └── EditTaskModal.tsx         # Create/edit action item modal
```

---

## Getting Started

### Prerequisites

- **Node.js** (v20+ recommended)
- A valid **Gemini API Key**

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and set your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   APP_URL="http://localhost:3000"
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```
   The Express server and Vite frontend will start on `http://localhost:3000`.

4. **Build and run in production**:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

---

## Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express + Vite development server via `tsx server.ts` |
| `npm run start` | Runs `tsx server.ts` |
| `npm run build` | Builds the frontend production bundle to `dist/` using Vite |
| `npm run preview` | Previews the production Vite build |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Removes `dist/` and compiled build artifacts |

---

## Server API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status and whether `GEMINI_API_KEY` is configured. |
| `POST` | `/api/analyze-transcript` | Accepts `{ transcript, meetingDate, meetingTitle }` and returns a structured `MeetingAnalysis` JSON object with grounded citations and ambiguity flags. |
| `POST` | `/api/resolve-ambiguity` | Accepts `{ actionItem, userResolution, meetingDate }` and returns an updated `ActionItem` with resolved fields and normalized ISO deadline. |
| `POST` | `/api/generate-clarification-draft` | Accepts `{ actionItem, meetingTitle }` and returns a ready-to-send Slack/Email inquiry asking for missing task details. |
