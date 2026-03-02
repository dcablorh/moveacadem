

# Move Academy -- Complete Rebuild with Walrus Integration and Full Contract Coverage

This plan implements the detailed user flow spec you provided, integrates Walrus HTTP API for blob storage/reading, and restructures the entire frontend to match the exact screen-by-screen design.

---

## 1. Walrus Integration Layer

Create `src/lib/walrus.ts` with helper functions:

- **`PUBLISHER_URL`** and **`AGGREGATOR_URL`** constants (Walrus testnet endpoints: `https://publisher.walrus-testnet.walrus.space` and `https://aggregator.walrus-testnet.walrus.space`)
- **`storeBlob(data: string | File, epochs?: number)`** -- PUT to `$PUBLISHER/v1/blobs?epochs=N`, returns the blob ID from the `newlyCreated.blobObject.blobId` or `alreadyCertified.blobId` response
- **`readBlob(blobId: string)`** -- GET from `$AGGREGATOR/v1/blobs/{blobId}`, returns text content
- **`getBlobUrl(blobId: string)`** -- returns the aggregator URL for direct linking/embedding

This replaces the current pattern where creators manually paste URIs. Instead, creators will upload content directly and the app stores the resulting blob ID on-chain.

---

## 2. Restructured Navigation and Routing

**Update `Navbar.tsx`:**
- Add "My Learning" nav link (visible when wallet connected)
- Reorder: Home | Courses | My Learning | Create | Certificates | Profile

**Update `App.tsx` routing:**
- Add `/my-learning` route for the student progress dashboard
- Keep existing routes

---

## 3. Screen-by-Screen Implementation

### Screen 1: Home / Discover (`Index.tsx`)

Add tabs: **Discover | My Learning | Certificates** (as per spec). The Discover tab shows published courses only (`course.published === true`). My Learning and Certificates tabs link to their respective pages. Show per-course progress bar if the student has started.

### Screen 2: Courses Page with Creator Dashboard (`Courses.tsx`)

Enhance the existing "My Courses" tab:
- Each owned course card shows: title, description, lesson_count, published status, created/updated time
- Add a **"Manage Course"** button (links to `/course/{id}`) and **"View as Student"** button
- Keep the "Create New Course" prominent button

### Screen 3: Create Course (`CreatePage.tsx`)

Keep mostly as-is. After successful creation, auto-navigate to the new course's manage page using the course ID from the transaction result.

### Screen 4: Course Detail / Manage Course (`CourseDetail.tsx`)

This is the biggest change. Split the view based on whether the user is the owner:

**Owner View (has CourseOwnerCap):**
- Metadata section with inline edit (title, description) -- calls `update_course`
- Publish button -- calls `publish_course` (disabled if already published)
- Lessons list ordered by `lesson.order`, each row shows:
  - Title, order, content preview link, quiz preview link
  - **"Edit Lesson"** button (opens inline edit form calling `update_lesson` with Walrus upload)
  - **"Add Exercise"** button (opens inline form)
  - **"View Lesson"** link
- **"Add New Lesson"** button with Walrus-powered form:
  - Title input
  - Content file/text upload (stored to Walrus, blob ID used as `content_uri`)
  - Quiz file/text upload (stored to Walrus, blob ID used as `quiz_uri`)
  - Order input
  - Calls `create_lesson` with Walrus blob URLs as the URI bytes
- **Add Exercise inline form** per lesson:
  - Title, exercise content upload (to Walrus), max_score, mastery_threshold
  - Calls `create_exercise`

**Student View:**
- Course header with progress summary (`get_completion_count / lesson_count`)
- Lessons list with completion status per lesson
- Each lesson shows exercise count from `ExerciseRegistry`
- "Start Lesson" / "Continue" button per lesson
- Certificate claim banner when course is complete

### Screen 5: Lesson Detail (`LessonView.tsx`)

Enhance significantly:
- **Content section:** Fetch content from Walrus using `readBlob()` and render inline (markdown/text), or show an iframe/external link
- **Quiz section:** Link to quiz URI (Walrus blob or external)
- **Exercises section (Khan-style):**
  - List all exercises for this lesson
  - Each exercise card shows: title, best score, mastery status, "Launch Exercise" link (opens Walrus URI)
  - "Submit Score" expandable form: score (0 to max_score), hints_used
  - Calls `submit_exercise` -- contract handles mastery check and auto-lesson-completion
- **Manual Lesson Completion:** "Mark Lesson Complete" button with score input, calls `complete_lesson`
- Owner actions: "Edit Lesson" button if owner (inline edit with Walrus re-upload)

### Screen 6: My Learning Page (NEW -- `MyLearningPage.tsx`)

New page at `/my-learning`:
- Courses in progress with progress bars
- Completed courses section
- Per-course: list of completed lessons with scores and dates
- "Continue Course" button
- "Claim Certificate" button (visible only if `is_course_completed() && !has_certificate()`)

### Screen 7: Claim Certificate Flow

Enhance the existing certificate claim in `CourseDetail.tsx`:
- Show completion summary before claiming
- Allow uploading a custom certificate image to Walrus (or use default)
- Call `issue_certificate` with the Walrus image URL
- Navigate to certificates page on success

### Screen 8: Certificates Page (`CertificatesPage.tsx`)

Enhance certificate cards to show:
- Course title (`certificate_course_title`)
- Issued date
- Certificate image loaded from Walrus (`certificate_image_url`)
- Soulbound badge
- Full NFT metadata (name = "Move Academy Certificate - {title}", description from contract)

---

## 4. Walrus Upload Components

Create `src/components/walrus/WalrusUploader.tsx`:
- Reusable file/text upload component
- Shows upload progress
- Returns blob ID on success
- Used in lesson creation, exercise creation, and certificate image upload

Create `src/components/walrus/WalrusContent.tsx`:
- Reusable content viewer that fetches blob by ID and renders text/markdown inline

---

## 5. Updated Hooks (`useAcademy.ts`)

Add missing hooks:
- **`useExerciseMasteryEvents()`** -- query `ExerciseMastered` events to show mastery status per exercise
- **`useExerciseSubmissionEvents(studentAddress, exerciseId)`** -- query `ExerciseSubmitted` events for best score and attempts
- **`useCourseCompletionCheck(courseId)`** -- derived check from progress data
- **`useHasCertificate(courseId)`** -- check if student already has certificate for a course

Update `useCourseLessons` and `useLessonExercises` to also return exercise counts per lesson for the course detail view.

---

## 6. Technical Details

### Walrus Endpoints (Testnet)
```text
Publisher: https://publisher.walrus-testnet.walrus.space
Aggregator: https://aggregator.walrus-testnet.walrus.space

Store:  PUT  /v1/blobs?epochs=5
Read:   GET  /v1/blobs/{blobId}
```

### File Structure Changes
```text
NEW:  src/lib/walrus.ts
NEW:  src/components/walrus/WalrusUploader.tsx
NEW:  src/components/walrus/WalrusContent.tsx
NEW:  src/pages/MyLearningPage.tsx
EDIT: src/hooks/useAcademy.ts (add mastery/certificate check hooks)
EDIT: src/pages/Index.tsx (discover tabs, published filter)
EDIT: src/pages/Courses.tsx (enhanced creator dashboard)
EDIT: src/pages/CourseDetail.tsx (owner manage vs student view, inline forms)
EDIT: src/pages/LessonView.tsx (Walrus content rendering, owner edit, mastery display)
EDIT: src/pages/CreatePage.tsx (Walrus upload integration, post-create navigation)
EDIT: src/pages/CertificatesPage.tsx (enhanced NFT metadata display)
EDIT: src/pages/ProfilePage.tsx (link to my learning)
EDIT: src/components/layout/Navbar.tsx (add My Learning link)
EDIT: src/App.tsx (add /my-learning route)
```

### Capability Enforcement
Every owner action button checks `caps?.find(c => c.course_id === courseId)` before rendering. All transaction calls pass the `CourseOwnerCap` ID. Error toasts surface contract errors (`ENotAuthorized`, `ECourseAlreadyPublished`, etc.).

