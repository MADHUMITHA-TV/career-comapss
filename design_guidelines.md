# Career Compass - Design Guidelines

## Design Approach

**Selected Approach**: Design System - Material Design + Linear Influence

**Rationale**: Career Compass is a productivity tool focused on data presentation, analysis, and user efficiency. Material Design provides excellent patterns for data-dense interfaces, cards, and progressive disclosure, while Linear's typography and spacing refinement adds modern polish.

**Key Principles**:
- Clarity over decoration - students need quick, scannable insights
- Data hierarchy - scores, gaps, and recommendations must be immediately visible
- Progressive disclosure - complex analysis revealed logically
- Trust through professionalism - clean, reliable interface builds confidence

---

## Typography

**Font Families** (via Google Fonts):
- Primary: Inter (body text, UI elements, data)
- Accent: Space Grotesk (headings, scores, emphasis)

**Type Scale**:
- Hero/Display: text-5xl to text-6xl, font-bold (Space Grotesk)
- Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-2xl, font-semibold
- Card Titles: text-lg to text-xl, font-medium
- Body Text: text-base (16px), font-normal
- Labels/Captions: text-sm, font-medium
- Match Scores: text-4xl to text-5xl, font-bold (prominent display)
- Chat Messages: text-base, font-normal

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6 to p-8
- Section spacing: mb-8, mb-12, mb-16
- Card gaps: gap-6
- Form field spacing: space-y-4
- Dashboard grid gaps: gap-6

**Grid System**:
- Dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (analysis cards)
- Job Analysis Page: Two-column split (lg:grid-cols-2) - left: job details, right: results
- Gap Analysis: Single column with card grid for missing skills
- Max container width: max-w-7xl mx-auto

**Page Structure**:
- All authenticated pages: Sidebar navigation (fixed left, w-64) + main content area
- Homepage (unauthenticated): Centered hero with form, max-w-4xl

---

## Component Library

### Navigation
**Sidebar** (Dashboard & authenticated pages):
- Fixed left sidebar, full height, w-64
- Logo at top with p-6
- Navigation items with icon + label, py-3 px-4, rounded-lg
- Active state: distinct treatment
- Bottom: user profile section

**Top Bar** (optional for breadcrumbs/actions):
- h-16, flex items-center justify-between, px-8
- Breadcrumbs on left, actions on right

### Cards & Containers

**Analysis Result Cards**:
- Rounded corners (rounded-xl)
- Shadow (shadow-md)
- Padding: p-6 to p-8
- Border (border subtle)

**Match Score Display**:
- Large centered score (text-5xl, font-bold)
- Progress bar below score (h-3, rounded-full)
- Label above: "Match Score" (text-sm, uppercase, tracking-wide)
- Supporting text below: interpretation (text-base)

**Gap Analysis Cards** (missing skills):
- Grid layout: grid-cols-1 md:grid-cols-2 gap-4
- Each skill card: p-4, rounded-lg, border
- Icon + skill name + brief description
- Compact, scannable format

### Forms

**Job Description Input**:
- Textarea: min-h-48, rounded-lg, p-4, border
- Character count indicator (text-sm, text-right)
- Clear label above (text-sm, font-medium, mb-2)

**Resume Upload**:
- Drag-and-drop zone OR paste area (toggle tabs)
- Dashed border when empty, solid when active
- Upload icon + instructional text centered
- File name display when uploaded

**Chat Interface**:
- Messages container: max-h-96 to max-h-screen, overflow-y-auto
- User messages: right-aligned, rounded-2xl, px-4 py-3, max-w-md
- AI responses: left-aligned, rounded-2xl, px-4 py-3, max-w-2xl
- Input: sticky bottom, flex with textarea + send button
- Textarea auto-resize, max-h-32

### Buttons

**Primary Actions**: px-6 py-3, rounded-lg, font-medium, text-base
**Secondary Actions**: px-6 py-3, rounded-lg, font-medium, border
**Icon Buttons**: p-2, rounded-lg (for actions in cards)

### Data Display

**Recommendations List**:
- Numbered list (1, 2, 3) or bullet points
- Each recommendation: p-4, mb-3, rounded-lg, border-l-4 (accent border)
- Title (font-semibold) + description (text-sm)

**History Table/Cards**:
- Card-based on mobile, table on desktop (md:table)
- Each history item shows: date, job title, match score, quick actions
- Hover states for interactivity

---

## Page-Specific Layouts

**Homepage (Unauthenticated)**:
- Hero section: centered, max-w-4xl, px-6, py-20
- Headline: text-5xl, font-bold, mb-4
- Subheadline: text-xl, mb-12
- Two-step form: Job description → Resume (progressive)
- CTA button: prominent, centered
- NO background image - focus on clean form interaction

**Dashboard**:
- Sidebar navigation (left)
- Main content: px-8 py-6
- Stats overview: grid-cols-1 md:grid-cols-3, gap-6 (total analyses, avg score, recent activity)
- Recent analyses: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Each analysis card: clickable, shows job title, company, score, date

**Job Analysis Results Page**:
- Split layout: lg:grid-cols-2, gap-8
- Left column: Job details (title, description summary, requirements list)
- Right column: Match score (large display) + key insights + action buttons
- Below: tabs for Gap Analysis, Recommendations, Full Details

**Q&A Chat Page**:
- Chat interface takes full content area
- Suggested questions (chips/pills) when empty: "What skills for data science?" etc.
- Messages scroll independently, input fixed at bottom

**Authentication Pages**:
- Centered card: max-w-md, mx-auto, mt-20
- Form fields: space-y-4
- Logo at top, centered
- Social login options (if implemented): grid-cols-2, gap-3

---

## Interactions

**Loading States**:
- Skeleton loaders for cards (shimmer effect)
- Spinner for form submissions (inline with button)
- Progress indicator for multi-step analysis

**Empty States**:
- Centered icon + message + CTA
- "No analyses yet - Upload your first job description"
- Illustrative icon (document, search, etc.)

**Animations**: Minimal
- Card hover: subtle lift (transform: translateY(-2px))
- Button interactions: built-in component states
- Page transitions: simple fade (100-200ms)
- NO scroll animations, parallax, or distracting motion

---

## Images

**Logo**: Simple icon + wordmark in sidebar and authentication pages
**Empty State Illustrations**: Optional abstract icons for "no results" states (use icon library)
**NO Hero Images**: Homepage focuses on the form - no decorative imagery
**Profile Pictures**: User avatar in sidebar (circular, w-10 h-10)

---

## Responsive Behavior

- Mobile: Single column, sidebar becomes drawer (hamburger menu)
- Tablet: Two-column grids where appropriate
- Desktop: Full multi-column layouts, fixed sidebar
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)