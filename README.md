# NEXORA

> **Think less. Do more.**

NEXORA is an agentic personal command center that turns unstructured, natural-language requests into prioritized plans and actionable deep-work execution flows. 

Built for the **Build, Ship, Shape: Amazon Developer Hackathon**, NEXORA delivers a simulated, next-generation conversational operating experience for personal and student productivity—reasoning dynamically about urgency, time constraints, and task dependencies.

---

## 1. Overview

Students and knowledge workers regularly juggle competing deadlines, fragmented tasks, and unpredictable schedules. When overloaded, the friction of manual task planning often causes decision fatigue and procrastination.

**NEXORA** acts as a decisive executive co-pilot. You speak or type your current reality in plain language, and NEXORA synthesizes your situation into structured focus blocks with clear rationale, immediate next actions, and an integrated distraction-free execution environment.

---

## 2. Problem

- **Cognitive Overload**: Deciding *what* to work on, in what order, and for how long drains energy before actual work starts.
- **Fragile Planning**: Traditional to-do apps require manual date picking, priority tagging, and static list maintenance.
- **Context Loss**: When an urgent interruption happens or a task finishes early, users must manually recalculate their schedule.
- **Disconnect Between Planning & Doing**: Task lists lack execution timers and momentum feedback.

---

## 3. Solution

NEXORA combines:
1. **Conversational Situational Understanding**: Ingests messy, natural language (e.g., *"I have Maths tomorrow, a DBMS assignment due Friday, and two hours tonight"*).
2. **Deterministic & Adaptive Reasoning Engine**: Extracts deadlines, time budgets, subjects, and urgency scores to produce an optimal schedule with explicit "Why this order?" explanations.
3. **Execution State Transition**: Shifts directly from command center into an immersive, single-task Focus Mode with countdown timers, subtask checkpoints, and progress tracking.
4. **Active Session Memory**: Remembers completed tasks across page reloads and responds intelligently to follow-up prompts (e.g., *"What should I do next?"*, *"I finished Maths"*, *"I only have 30 minutes"*).

---

## 4. Key Features

- **Conversational Command Center**: Type or speak via browser Speech Recognition.
- **Featured Demo Scenario**: Instant one-click demonstration of multi-task urgency reasoning.
- **Visual Sequence Timeline**: Priority tags, urgency scores, duration allocations, and subtask milestones.
- **"Why This Order?" Rationalization Panel**: Transparent algorithmic reasoning showing why urgent deliverables preempt lower-consequence backlog items.
- **Editable Schedules**: Change durations (+/- 5m increments) or remove tasks to fit real-time constraints.
- **Deep Focus Mode**: Ambient distraction-free interface with active countdown timers, pause/resume, skip, and task completion.
- **Micro-Celebrations**: Confetti celebrations and momentum metrics upon completing milestones.
- **Session Summary**: Quantitative recap of focus time, tasks completed, completion rate, and next operational recommendations.
- **Persistent State**: Full `localStorage` persistence keeping session context active across reloads.
- **Dual-Mode Engine**: 100% offline, zero-failure deterministic local engine out-of-the-box, with an optional server-side LLM provider bridge.

---

## 5. How the Agentic Workflow Works

```
                     +----------------------------+
                     | Natural-Language Input     |
                     | (Voice or Text)            |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Intent & Context Extraction|
                     | - Deadlines & Urgency      |
                     | - Available Time Budget    |
                     | - Subject & Category       |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Schedule Synthesis Engine  |
                     | - Time Allocation Logic    |
                     | - Cognitive Load Balancing |
                     | - Restorative Intervals    |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Structured Plan Generation |
                     | - Timeline Sequencing      |
                     | - Transparent Reasoning    |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Focus Execution State      |
                     | - Live Timers & Progress   |
                     | - Checkpoint Auditing      |
                     +--------------+-------------+
                                    |
                                    v
                     +----------------------------+
                     | Context Feedback Loop      |
                     | - Session Memory Update    |
                     | - Adaptive Next-Action Rec |
                     +----------------------------+
```

---

## 6. Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React Server Components & API routes)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom dark-first palette & glass surfaces)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual Effects**: [canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Speech Integration**: Native Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with safe SSR and fallback handling

---

## 7. Local Setup

### Prerequisites
- Node.js `18.17.0` or later (tested on Node v22.23.2)
- npm `9.x` or later

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Amazon-Hackathon-NEXORA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

5. Run the production build test:
   ```bash
   npm run build
   ```

---

## 8. Environment Variables

NEXORA operates completely out-of-the-box using its deterministic local reasoning engine. Zero API keys are required for full functionality.

To optionally connect an external LLM provider, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configurable keys:

```ini
AI_PROVIDER=local       # 'local' | 'openai' | 'anthropic'
OPENAI_API_KEY=         # Your API key (server-side only)
OPENAI_MODEL=gpt-4o-mini
```

---

## 9. Demo Flow

Follow this script to experience the full end-to-end journey:

1. **Launch**: Open NEXORA at `http://localhost:3000`. Notice the `"READY"` status and clean obsidian command-center aesthetic.
2. **Execute Demo Prompt**: Click **"Try the demo scenario"** (or paste: *"I have Maths tomorrow, a DBMS assignment due Friday, and I have two hours tonight. Help me decide what to do."*).
3. **Inspect the Plan**:
   - Notice the extracted context: `120 mins available`, `High Urgency`.
   - Observe the intelligent timeline: Primary Mathematics focus (80 mins) due tomorrow, short reset interval (10 mins), secondary DBMS setup (20 mins), and final review (10 mins).
   - Read the **"Why this order?"** explanation card.
4. **Edit Plan (Optional)**: Click **"Edit Plan"** to adjust task durations or remove items.
5. **Start Focus Mode**: Click **"Start Plan"**.
   - Watch the countdown timer start running.
   - Click sub-checkpoints to mark progress.
   - Test **Pause** and **Resume**.
6. **Complete Task**: Click **"Complete Task"**.
   - Confetti triggers.
   - The session advances immediately to the next task.
7. **Return to Command Center**: Click **"Return to Command Center"**.
   - Notice the header badge: `"Session context active (1 done)"`.
8. **Follow-Up Queries**:
   - Click or type: `"What should I do next?"` &rarr; NEXORA recommends the next uncompleted task.
   - Type: `"I only have 30 minutes"` &rarr; NEXORA dynamically compresses remaining task blocks.
   - Type: `"Move DBMS to tomorrow"` &rarr; NEXORA moves the assignment and re-prioritizes your evening.
9. **Finish Sprint**: When all tasks complete, the **"Momentum unlocked."** summary screen recaps focus metrics and sets up your next objective.

---

## 10. Future Improvements

- Bi-directional Google Calendar and Notion task syncing.
- Ambient audio generators (binaural beats, white noise, lofi synth).
- Multi-day roadmap projection and semester exam calendars.
- Wearable biometric integration for fatigue-responsive break pacing.

---

## 11. Hackathon Context

This project was developed for the **Build, Ship, Shape: Amazon Developer Hackathon**. 

It embodies the concept of an ambient, conversational personal agent that turns open-ended human intent into structured execution workflows without friction or decision paralysis.

---

## License

MIT License. Designed and built with craft for the developer hackathon.
