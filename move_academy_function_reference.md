# Move Academy - Technical Function Reference
## Complete Arguments, Capabilities & IDs Guide

This document shows **EXACTLY** what you need to call each function, including all arguments, required capabilities, object IDs, and prerequisites.

---

## 📋 QUICK REFERENCE LEGEND

**Argument Types:**
- `String` = Text data
- `vector<u8>` = Byte array (often for URLs)
- `u64` = 64-bit unsigned integer
- `ID` = Object identifier (32 bytes)
- `address` = Wallet address
- `&mut` = Mutable reference (shared object)
- `&` = Immutable reference

**Object Types:**
- `Shared` = Accessible by anyone, lives on-chain
- `Owned` = Belongs to specific address
- `Cap` = Capability (proof of ownership/permission)

---

## 🎓 TEACHER FUNCTIONS

### 1. CREATE COURSE

**Function:** `create_course`

```move
entry fun create_course(
    registry: &mut CourseRegistry,
    title: String,
    description: String,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `registry` | `&mut CourseRegistry` | Shared registry object | `0x1a2b3c...` (shared object ID) |
| `title` | `String` | Course name | `"Introduction to Move Programming"` |
| `description` | `String` | Course overview | `"Learn Move from scratch with hands-on..."` |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided by system |

**Prerequisites:**
- ✅ Wallet connected
- ✅ Gas fees available
- ❌ No special permissions needed

**Returns/Creates:**
1. **Course Object** (shared)
   - ID: Generated on-chain (e.g., `0xabc123...`)
   - Status: `published = false`
   - `lesson_count = 0`

2. **CourseOwnerCap** (owned by caller)
   - ID: Generated on-chain
   - Contains: `course_id` pointing to the Course

**Blockchain Output:**
```json
{
  "events": [
    {
      "type": "CourseCreated",
      "course_id": "0xabc123...",
      "title": "Introduction to Move Programming",
      "creator": "0x789def..."
    }
  ],
  "created_objects": [
    "0xabc123..." // Course (shared)
    "0xdef456..." // CourseOwnerCap (owned)
  ]
}
```

**Frontend Call Example:**
```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::create_course`,
  arguments: [
    tx.object(COURSE_REGISTRY_ID), // Shared object
    tx.pure("Introduction to Move Programming"), // String
    tx.pure("Learn Move from scratch..."), // String
  ],
});

const result = await signAndExecuteTransactionBlock({
  transactionBlock: tx,
  options: { showEffects: true, showEvents: true }
});

// Extract created objects
const courseId = result.effects.created[0].reference.objectId;
const ownerCapId = result.effects.created[1].reference.objectId;

// Store these IDs for later use!
```

---

### 2. PUBLISH COURSE

**Function:** `publish_course`

```move
entry fun publish_course(
    course: &mut Course,
    cap: &CourseOwnerCap,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `course` | `&mut Course` | The course to publish | `0xabc123...` (from create_course) |
| `cap` | `&CourseOwnerCap` | Ownership proof | `0xdef456...` (received in create) |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Must own the CourseOwnerCap with matching `course_id`
- ✅ Course must NOT already be published
- ❌ No minimum lesson requirement

**Validation Checks:**
```move
assert!(object::id(course) == cap.course_id, ENotAuthorized);
assert!(!course.published, ECourseAlreadyPublished);
```

**State Changes:**
- `course.published` → `true`
- `course.updated_at` → current epoch

**Frontend Call Example:**
```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::publish_course`,
  arguments: [
    tx.object(courseId), // Shared Course object
    tx.object(ownerCapId), // Owned CourseOwnerCap
  ],
});

await signAndExecuteTransactionBlock({ transactionBlock: tx });
```

---

### 3. UPDATE COURSE

**Function:** `update_course`

```move
entry fun update_course(
    course: &mut Course,
    cap: &CourseOwnerCap,
    title: String,
    description: String,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `course` | `&mut Course` | Course to update | `0xabc123...` |
| `cap` | `&CourseOwnerCap` | Ownership proof | `0xdef456...` |
| `title` | `String` | New title | `"Advanced Move Programming"` |
| `description` | `String` | New description | `"Updated course content..."` |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Must own matching CourseOwnerCap
- ❌ No restrictions on published/unpublished

**Frontend Call Example:**
```typescript
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::update_course`,
  arguments: [
    tx.object(courseId),
    tx.object(ownerCapId),
    tx.pure("Advanced Move Programming"),
    tx.pure("Updated description..."),
  ],
});
```

---

### 4. CREATE LESSON

**Function:** `create_lesson`

```move
entry fun create_lesson(
    lesson_registry: &mut LessonRegistry,
    course: &mut Course,
    cap: &CourseOwnerCap,
    title: String,
    content_uri: vector<u8>,
    quiz_uri: vector<u8>,
    order: u64,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `lesson_registry` | `&mut LessonRegistry` | Global lesson registry | `0x1f2e3d...` (shared) |
| `course` | `&mut Course` | Parent course | `0xabc123...` |
| `cap` | `&CourseOwnerCap` | Ownership proof | `0xdef456...` |
| `title` | `String` | Lesson name | `"Variables and Data Types"` |
| `content_uri` | `vector<u8>` | Walrus blob ID | `b"https://walrus.site/blob/0x987..."` |
| `quiz_uri` | `vector<u8>` | Quiz metadata URI | `b"https://walrus.site/blob/0x654..."` |
| `order` | `u64` | Sequence number | `1` (first lesson) |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Must own matching CourseOwnerCap
- ✅ Content must be uploaded to Walrus first
- ❌ Order doesn't need to be sequential (can skip numbers)

**Workflow:**
```
1. Upload lesson content to Walrus → Get blob_id_1
2. Upload quiz JSON to Walrus → Get blob_id_2
3. Call create_lesson with both blob IDs
```

**Content URI Format:**
```
Walrus URL: https://walrus.site/blob/0x123abc...
Or IPFS: ipfs://QmXyz...
Or any URL: https://yourdomain.com/lesson.json
```

**Returns/Creates:**
- **Lesson Object** (shared)
  - ID: Generated (e.g., `0x111222...`)
  - Linked to course via `course_id`
  - `order` field for sorting

**State Changes:**
- `course.lesson_count++`
- `course.updated_at` updated
- Lesson added to `lesson_registry.course_lessons[course_id]`

**Frontend Call Example:**
```typescript
// Step 1: Upload to Walrus first
const contentBlob = await uploadToWalrus(lessonContent);
const quizBlob = await uploadToWalrus(quizData);

// Step 2: Create lesson on-chain
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::create_lesson`,
  arguments: [
    tx.object(LESSON_REGISTRY_ID),
    tx.object(courseId),
    tx.object(ownerCapId),
    tx.pure("Variables and Data Types"),
    tx.pure(Array.from(new TextEncoder().encode(contentBlob.url))),
    tx.pure(Array.from(new TextEncoder().encode(quizBlob.url))),
    tx.pure(1), // order
  ],
});

const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
const lessonId = result.effects.created[0].reference.objectId;
```

---

### 5. CREATE EXERCISE

**Function:** `create_exercise`

```move
entry fun create_exercise(
    ex_registry: &mut ExerciseRegistry,
    lesson: &Lesson,
    cap: &CourseOwnerCap,
    title: String,
    exercise_uri: vector<u8>,
    max_score: u64,
    mastery_threshold: u64,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `ex_registry` | `&mut ExerciseRegistry` | Global exercise registry | `0x2a3b4c...` (shared) |
| `lesson` | `&Lesson` | Parent lesson | `0x111222...` (from create_lesson) |
| `cap` | `&CourseOwnerCap` | Course ownership proof | `0xdef456...` |
| `title` | `String` | Exercise name | `"Practice: Variable Declaration"` |
| `exercise_uri` | `vector<u8>` | Exercise data URL | `b"https://walrus.site/blob/0x333..."` |
| `max_score` | `u64` | Maximum points | `100` |
| `mastery_threshold` | `u64` | Score needed to master | `80` (80% required) |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Must own CourseOwnerCap for the course that contains this lesson
- ✅ Exercise content uploaded to Walrus first
- ✅ `mastery_threshold` ≤ `max_score`

**Validation Checks:**
```move
assert!(lesson.course_id == cap.course_id, ENotAuthorized);
```

**Exercise URI Format (JSON Example):**
```json
{
  "type": "code_challenge",
  "question": "Declare a variable named 'count' of type u64",
  "starter_code": "// Write your code here\n",
  "test_cases": [
    { "input": "", "expected": "let count: u64" }
  ],
  "hints": [
    "Remember to use 'let' keyword",
    "Type annotation uses colon syntax"
  ],
  "solution": "let count: u64 = 0;"
}
```

**Returns/Creates:**
- **Exercise Object** (shared)
  - ID: Generated (e.g., `0x444555...`)
  - Linked to lesson via `lesson_id`

**Frontend Call Example:**
```typescript
// Upload exercise to Walrus
const exerciseData = {
  type: "multiple_choice",
  question: "What keyword declares a variable?",
  options: ["let", "var", "const", "mut"],
  correct: 0,
  hints: ["Think about immutability"]
};

const exerciseBlob = await uploadToWalrus(exerciseData);

// Create on-chain
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::create_exercise`,
  arguments: [
    tx.object(EXERCISE_REGISTRY_ID),
    tx.object(lessonId),
    tx.object(ownerCapId),
    tx.pure("Practice: Variable Declaration"),
    tx.pure(Array.from(new TextEncoder().encode(exerciseBlob.url))),
    tx.pure(100), // max_score
    tx.pure(80),  // mastery_threshold
  ],
});
```

---

### 6. UPDATE LESSON

**Function:** `update_lesson`

```move
entry fun update_lesson(
    lesson: &mut Lesson,
    course: &Course,
    cap: &CourseOwnerCap,
    title: String,
    content_uri: vector<u8>,
    quiz_uri: vector<u8>,
    _ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `lesson` | `&mut Lesson` | Lesson to update | `0x111222...` |
| `course` | `&Course` | Parent course | `0xabc123...` |
| `cap` | `&CourseOwnerCap` | Ownership proof | `0xdef456...` |
| `title` | `String` | New title | `"Variables and Types (Updated)"` |
| `content_uri` | `vector<u8>` | New content URL | `b"https://walrus.site/blob/0x999..."` |
| `quiz_uri` | `vector<u8>` | New quiz URL | `b"https://walrus.site/blob/0x888..."` |

**Prerequisites:**
- ✅ Cap must own the course
- ✅ Lesson must belong to that course

**Validation Checks:**
```move
assert!(object::id(course) == cap.course_id, ENotAuthorized);
assert!(lesson.course_id == object::id(course), ENotAuthorized);
```

---

## 📚 STUDENT FUNCTIONS

### 7. SUBMIT EXERCISE

**Function:** `submit_exercise`

```move
entry fun submit_exercise(
    progress_registry: &mut ProgressRegistry,
    ex_registry: &ExerciseRegistry,
    course: &Course,
    lesson: &Lesson,
    exercise: &Exercise,
    score: u64,
    hints_used: u64,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `progress_registry` | `&mut ProgressRegistry` | Global progress tracker | `0x3b4c5d...` (shared) |
| `ex_registry` | `&ExerciseRegistry` | Exercise registry | `0x2a3b4c...` (shared) |
| `course` | `&Course` | Parent course | `0xabc123...` |
| `lesson` | `&Lesson` | Parent lesson | `0x111222...` |
| `exercise` | `&Exercise` | Exercise being submitted | `0x444555...` |
| `score` | `u64` | Points earned | `85` (out of 100) |
| `hints_used` | `u64` | Number of hints used | `2` |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Course must be published
- ✅ Exercise must belong to the lesson
- ❌ No prior completion required

**Validation Checks:**
```move
assert!(course.published, ECourseNotPublished);
assert!(exercise.lesson_id == lesson_id, EInvalidExercise);
```

**State Changes:**
1. **Attempts tracking:**
   - `student_exercise_attempts[student][exercise_id]++`

2. **Best score tracking:**
   - If `score > previous_best`:
     - `student_exercise_best[student][exercise_id] = score`

3. **Mastery tracking:**
   - If `score >= exercise.mastery_threshold`:
     - Add to `student_completed_exercises[student][lesson_id]`
     - Emit `ExerciseMastered` event

4. **Auto-completion:**
   - If ALL exercises in lesson are mastered:
     - Auto-calls `complete_lesson()` internally
     - Student doesn't need separate transaction!

**Frontend Workflow:**
```typescript
// 1. Fetch exercise from Walrus
const exerciseData = await fetch(exercise.exercise_uri);

// 2. Student solves exercise in UI
const studentAnswer = userCodeEditor.getValue();

// 3. Grade locally (or via backend)
const result = gradeExercise(exerciseData, studentAnswer);
// result = { score: 85, correct: true }

// 4. Submit to blockchain
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::submit_exercise`,
  arguments: [
    tx.object(PROGRESS_REGISTRY_ID),
    tx.object(EXERCISE_REGISTRY_ID),
    tx.object(courseId),
    tx.object(lessonId),
    tx.object(exerciseId),
    tx.pure(result.score), // 85
    tx.pure(hintsUsedCount), // 2
  ],
});

const txResult = await signAndExecuteTransactionBlock({ 
  transactionBlock: tx,
  options: { showEvents: true }
});

// 5. Check for mastery
const masteredEvent = txResult.events.find(e => 
  e.type.includes('ExerciseMastered')
);

if (masteredEvent) {
  showConfetti("Exercise Mastered! 🎉");
}

// 6. Check for auto-completion
const completedEvent = txResult.events.find(e => 
  e.type.includes('LessonCompleted')
);

if (completedEvent) {
  alert("All exercises mastered! Lesson completed automatically!");
  redirectToNextLesson();
}
```

**Events Emitted:**
```json
{
  "ExerciseSubmitted": {
    "student": "0x789def...",
    "exercise_id": "0x444555...",
    "lesson_id": "0x111222...",
    "score": 85,
    "attempts": 3,
    "hints_used": 2
  },
  // If mastered:
  "ExerciseMastered": {
    "student": "0x789def...",
    "exercise_id": "0x444555...",
    "lesson_id": "0x111222...",
    "score": 85
  },
  // If all exercises in lesson mastered:
  "LessonCompleted": {
    "student": "0x789def...",
    "lesson_id": "0x111222...",
    "course_id": "0xabc123...",
    "score": 85
  }
}
```

---

### 8. COMPLETE LESSON (Manual)

**Function:** `complete_lesson`

```move
entry fun complete_lesson(
    progress_registry: &mut ProgressRegistry,
    course: &Course,
    lesson: &Lesson,
    score: u64,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `progress_registry` | `&mut ProgressRegistry` | Progress tracker | `0x3b4c5d...` |
| `course` | `&Course` | Parent course | `0xabc123...` |
| `lesson` | `&Lesson` | Lesson to complete | `0x111222...` |
| `score` | `u64` | Quiz score (0-100) | `92` |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Course must be published
- ✅ Lesson must belong to course
- ✅ Score must be ≤ 100
- ✅ Lesson must NOT already be completed by this student

**Validation Checks:**
```move
assert!(score <= 100, EInvalidScore);
assert!(course.published, ECourseNotPublished);
assert!(lesson.course_id == object::id(course), EInvalidLesson);
assert!(!vector::contains(completed_lessons, &lesson_id), EAlreadyCompleted);
```

**State Changes:**
1. Add lesson to `student_progress[student][course_id]`
2. Create **Progress NFT** and transfer to student
3. Increment `progress_registry.total_completions`
4. If last lesson → Emit `CourseCompleted` event

**Returns/Creates:**
- **Progress Object** (owned by student)
  - Contains: student address, lesson_id, course_id, score, timestamp

**Frontend Call Example:**
```typescript
// After student takes quiz
const quizScore = calculateQuizScore(answers); // 92

const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::complete_lesson`,
  arguments: [
    tx.object(PROGRESS_REGISTRY_ID),
    tx.object(courseId),
    tx.object(lessonId),
    tx.pure(quizScore), // 92
  ],
});

const result = await signAndExecuteTransactionBlock({ 
  transactionBlock: tx,
  options: { showEffects: true, showEvents: true }
});

// Check if course completed
const courseCompleted = result.events.find(e => 
  e.type.includes('CourseCompleted')
);

if (courseCompleted) {
  showModal("🎉 Course Complete! Claim your certificate!");
}

// Progress NFT is in created objects
const progressNFT = result.effects.created[0].reference.objectId;
```

---

### 9. ISSUE CERTIFICATE

**Function:** `issue_certificate`

```move
entry fun issue_certificate(
    cert_registry: &mut CertificateRegistry,
    progress_registry: &ProgressRegistry,
    course: &Course,
    image_url: vector<u8>,
    ctx: &mut TxContext
)
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `cert_registry` | `&mut CertificateRegistry` | Certificate tracker | `0x4c5d6e...` (shared) |
| `progress_registry` | `&ProgressRegistry` | Progress tracker | `0x3b4c5d...` (shared) |
| `course` | `&Course` | Completed course | `0xabc123...` |
| `image_url` | `vector<u8>` | Certificate design URL | `b"https://walrus.site/blob/0xcert..."` |
| `ctx` | `&mut TxContext` | Transaction context | Auto-provided |

**Prerequisites:**
- ✅ Course must be published
- ✅ Student must have completed ALL lessons (100%)
- ✅ Student must NOT already have certificate for this course
- ✅ Certificate image uploaded to Walrus first

**Validation Checks:**
```move
assert!(course.published, ECourseNotPublished);
assert!(
    is_course_completed(progress_registry, course, student),
    ECourseNotCompleted
);
assert!(!table::contains(student_certs, course_id), ECertificateAlreadyIssued);
```

**Completion Check Logic:**
```move
// Student must have completed ALL lessons
vector::length(completed_lessons) == course.lesson_count
```

**Returns/Creates:**
- **Certificate Object** (soulbound, owned by student)
  - Contains: student, course_id, title, timestamp, image_url
  - **Cannot be transferred!** (`soulbound: true`)

**Frontend Workflow:**
```typescript
// 1. Generate certificate image
const certImage = await generateCertificate({
  studentName: userName,
  courseTitle: course.title,
  date: new Date(),
  signature: "Move Academy"
});

// 2. Upload to Walrus
const certBlob = await uploadToWalrus(certImage);

// 3. Issue on-chain
const tx = new TransactionBlock();
tx.moveCall({
  target: `${PACKAGE_ID}::academy::issue_certificate`,
  arguments: [
    tx.object(CERTIFICATE_REGISTRY_ID),
    tx.object(PROGRESS_REGISTRY_ID),
    tx.object(courseId),
    tx.pure(Array.from(new TextEncoder().encode(certBlob.url))),
  ],
});

const result = await signAndExecuteTransactionBlock({ 
  transactionBlock: tx,
  options: { showEffects: true }
});

// Certificate NFT created
const certificateId = result.effects.created[0].reference.objectId;

// Show in wallet immediately
displayNFT(certificateId);
```

**Certificate Metadata (NFT Display):**
```json
{
  "name": "Move Academy Certificate - Introduction to Move",
  "description": "Official certificate of completion...",
  "image": "https://walrus.site/blob/0xcert...",
  "attributes": [
    { "trait_type": "Course", "value": "Introduction to Move" },
    { "trait_type": "Student", "value": "0x789def..." },
    { "trait_type": "Date", "value": "2026-01-15" },
    { "trait_type": "Soulbound", "value": "Yes" }
  ]
}
```

---

## 🔍 VIEW FUNCTIONS (Read-Only)

### 10. IS_LESSON_COMPLETED

**Function:** `is_lesson_completed`

```move
public fun is_lesson_completed(
    registry: &ProgressRegistry,
    student: address,
    course_id: ID,
    lesson_id: ID,
): bool
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `registry` | `&ProgressRegistry` | Progress registry | `0x3b4c5d...` |
| `student` | `address` | Student address | `0x789def...` |
| `course_id` | `ID` | Course identifier | `0xabc123...` |
| `lesson_id` | `ID` | Lesson identifier | `0x111222...` |

**Returns:** `bool` (true if completed)

**Frontend Call Example:**
```typescript
// Read-only view function (no transaction needed)
const completed = await provider.devInspectTransactionBlock({
  sender: studentAddress,
  transactionBlock: {
    kind: 'moveCall',
    target: `${PACKAGE_ID}::academy::is_lesson_completed`,
    arguments: [
      PROGRESS_REGISTRY_ID,
      studentAddress,
      courseId,
      lessonId
    ]
  }
});

const isCompleted = completed.results[0].returnValues[0][0]; // boolean
```

---

### 11. IS_COURSE_COMPLETED

**Function:** `is_course_completed`

```move
public fun is_course_completed(
    registry: &ProgressRegistry,
    course: &Course,
    student: address,
): bool
```

**Arguments Required:**

| Argument | Type | Description | Example |
|----------|------|-------------|---------|
| `registry` | `&ProgressRegistry` | Progress registry | `0x3b4c5d...` |
| `course` | `&Course` | Course object | `0xabc123...` |
| `student` | `address` | Student address | `0x789def...` |

**Returns:** `bool` (true if 100% complete)

---

### 12. GET_COMPLETION_COUNT

**Function:** `get_completion_count`

```move
public fun get_completion_count(
    registry: &ProgressRegistry,
    course: &Course,
    student: address,
): u64
```

**Returns:** Number of lessons completed (0 to lesson_count)

---

### 13. IS_EXERCISE_MASTERED

**Function:** `is_exercise_mastered`

```move
public fun is_exercise_mastered(
    registry: &ProgressRegistry,
    student: address,
    lesson_id: ID,
    exercise_id: ID
): bool
```

**Returns:** `bool` (true if score ≥ mastery_threshold)

---

### 14. GET_EXERCISE_BEST

**Function:** `get_exercise_best`

```move
public fun get_exercise_best(
    registry: &ProgressRegistry,
    student: address,
    exercise_id: ID
): u64
```

**Returns:** Best score achieved (0 if never attempted)

---

### 15. HAS_CERTIFICATE

**Function:** `has_certificate`

```move
public fun has_certificate(
    registry: &CertificateRegistry,
    student: address,
    course_id: ID,
): bool
```

**Returns:** `bool` (true if certificate issued)

---

## 📦 OBJECT ID REFERENCE

### Global Shared Objects (Created in `init`)

These IDs are **constant** for the lifetime of the contract:

```typescript
// After deployment, store these IDs:
const PACKAGE_ID = "0x..."; // Package address
const COURSE_REGISTRY_ID = "0x..."; // Created in init()
const LESSON_REGISTRY_ID = "0x..."; // Created in init()
const PROGRESS_REGISTRY_ID = "0x..."; // Created in init()
const EXERCISE_REGISTRY_ID = "0x..."; // Created in init()
const CERTIFICATE_REGISTRY_ID = "0x..."; // Created in init()
```

### Dynamic Objects (Created by users)

These are generated during transactions:

```typescript
// Teacher creates:
const courseId = "0x..."; // From create_course()
const ownerCapId = "0x..."; // From create_course()
const lessonId = "0x..."; // From create_lesson()
const exerciseId = "0x..."; // From create_exercise()

// Student receives:
const progressNFTId = "0x..."; // From complete_lesson()
const certificateId = "0x..."; // From issue_certificate()
```

---

## 🔐 CAPABILITY REQUIREMENTS MATRIX

| Function | Requires Cap? | Which Cap? | Additional Auth |
|----------|---------------|------------|-----------------|
| `create_course` | ❌ No | - | Just wallet signature |
| `publish_course` | ✅ Yes | CourseOwnerCap | Cap.course_id must match |
| `update_course` | ✅ Yes | CourseOwnerCap | Cap.course_id must match |
| `create_lesson` | ✅ Yes | CourseOwnerCap | Cap.course_id must match |
| `create_exercise` | ✅ Yes | CourseOwnerCap | lesson.course_id must match cap |
| `update_lesson` | ✅ Yes | CourseOwnerCap | Both course and lesson must match |
| `submit_exercise` | ❌ No | - | Just wallet signature |
| `complete_lesson` | ❌ No | - | Just wallet signature |
| `issue_certificate` | ❌ No | - | Must have completed all lessons |

**Key Insight:** Only teachers need capabilities. Students just need wallet signatures!

---

## 🎯 COMPLETE TRANSACTION EXAMPLES

### Example 1: Teacher Creates Full Course

```typescript
// ============================================
// STEP 1: CREATE COURSE
// ============================================
const tx1 = new TransactionBlock();
tx1.moveCall({
  target: `${PACKAGE_ID}::academy::create_course`,
  arguments: [
    tx1.object(COURSE_REGISTRY_ID),
    tx1.pure("Introduction to Move"),
    tx1.pure("Learn Move programming from scratch"),
  ],
});

const result1 = await signAndExecuteTransactionBlock({
  transactionBlock: tx1,
  options: { showEffects: true }
});

const courseId = result1.effects.created.find(obj => 
  obj.owner === 'Shared'
).reference.objectId;

const ownerCapId = result1.effects.created.find(obj => 
  obj.owner.AddressOwner === walletAddress
).reference.objectId;

console.log("Course ID:", courseId);
console.log("Owner Cap ID:", ownerCapId);

// ============================================
// STEP 2: CREATE LESSONS (Loop)
// ============================================
const lessons = [
  {
    title: "Variables and Types",
    content: "lesson1_content.json",
    quiz: "lesson1_quiz.json",
    order: 1
  },
  {
    title: "Functions",
    content: "lesson2_content.json",
    quiz: "lesson2_quiz.json",
    order: 2
  },
  // ... more lessons
];

const lessonIds = [];

for (const lesson of lessons) {
  // Upload content to Walrus
  const contentBlob = await uploadToWalrus(
    await fetch(lesson.content).then(r => r.json())
  );
  const quizBlob = await uploadToWalrus(
    await fetch(lesson.quiz).then(r => r.json())
  );

  // Create lesson on-chain
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::academy::create_lesson`,
    arguments: [
      tx.object(LESSON_REGISTRY_ID),
      tx.object(courseId),
      tx.object(ownerCapId),
      tx.pure(lesson.title),
      tx.pure(Array.from(new TextEncoder().encode(contentBlob.url))),
      tx.pure(Array.from(new TextEncoder().encode(quizBlob.url))),
      tx.pure(lesson.order),
    ],
  });

  const result = await signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: { showEffects: true }
  });

  const lessonId = result.effects.created[0].reference.objectId;
  lessonIds.push(lessonId);
  console.log(`Lesson ${lesson.order} created:`, lessonId);
}

// ============================================
// STEP 3: CREATE EXERCISES (For each lesson)
// ============================================
const exercises = [
  {
    lessonId: lessonIds[0],
    title: "Practice: Declare Variables",
    data: { /* exercise JSON */ },
    maxScore: 100,
    threshold: 80
  },
  // ... more exercises
];

for (const ex of exercises) {
  const exBlob = await uploadToWalrus(ex.data);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::academy::create_exercise`,
    arguments: [
      tx.object(EXERCISE_REGISTRY_ID),
      tx.object(ex.lessonId),
      tx.object(ownerCapId),
      tx.pure(ex.title),
      tx.pure(Array.from(new TextEncoder().encode(exBlob.url))),
      tx.pure(ex.maxScore),
      tx.pure(ex.threshold),
    ],
  });

  await signAndExecuteTransactionBlock({ transactionBlock: tx });
}

// ============================================
// STEP 4: PUBLISH COURSE
// ============================================
const txPublish = new TransactionBlock();
txPublish.moveCall({
  target: `${PACKAGE_ID}::academy::publish_course`,
  arguments: [
    txPublish.object(courseId),
    txPublish.object(ownerCapId),
  ],
});

await signAndExecuteTransactionBlock({ transactionBlock: txPublish });

console.log("✅ Course published and live!");
```

---

### Example 2: Student Completes Course Journey

```typescript
// ============================================
// STEP 1: COMPLETE EXERCISES
// ============================================
async function completeExercise(exerciseId, lessonId, courseId) {
  // Fetch exercise from Walrus
  const exercise = await fetchExerciseData(exerciseId);
  
  // Student solves in UI
  const solution = await waitForStudentSolution();
  
  // Grade locally
  const score = gradeExercise(exercise, solution);
  
  // Submit to chain
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::academy::submit_exercise`,
    arguments: [
      tx.object(PROGRESS_REGISTRY_ID),
      tx.object(EXERCISE_REGISTRY_ID),
      tx.object(courseId),
      tx.object(lessonId),
      tx.object(exerciseId),
      tx.pure(score),
      tx.pure(hintsUsed),
    ],
  });

  const result = await signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: { showEvents: true }
  });

  // Check if mastered
  const mastered = result.events.some(e => 
    e.type.includes('ExerciseMastered')
  );

  // Check if lesson auto-completed
  const lessonComplete = result.events.some(e => 
    e.type.includes('LessonCompleted')
  );

  return { mastered, lessonComplete };
}

// Complete all exercises in a lesson
for (const exId of exerciseIdsInLesson) {
  const result = await completeExercise(exId, lessonId, courseId);
  
  if (result.lessonComplete) {
    console.log("🎉 Lesson auto-completed!");
    break; // Move to next lesson
  }
}

// ============================================
// STEP 2: OR MANUAL QUIZ COMPLETION
// ============================================
async function completeLessonViaQuiz(lessonId, courseId) {
  // Take quiz in UI
  const quizScore = await takeQuiz(lessonId);
  
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::academy::complete_lesson`,
    arguments: [
      tx.object(PROGRESS_REGISTRY_ID),
      tx.object(courseId),
      tx.object(lessonId),
      tx.pure(quizScore),
    ],
  });

  const result = await signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: { showEvents: true }
  });

  // Check if course completed
  const courseComplete = result.events.some(e => 
    e.type.includes('CourseCompleted')
  );

  return courseComplete;
}

// ============================================
// STEP 3: CLAIM CERTIFICATE
// ============================================
async function claimCertificate(courseId) {
  // Generate certificate image
  const certImage = await generateCertImage({
    course: courseTitle,
    student: userName,
    date: new Date()
  });

  // Upload to Walrus
  const certBlob = await uploadToWalrus(certImage);

  // Issue on-chain
  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${PACKAGE_ID}::academy::issue_certificate`,
    arguments: [
      tx.object(CERTIFICATE_REGISTRY_ID),
      tx.object(PROGRESS_REGISTRY_ID),
      tx.object(courseId),
      tx.pure(Array.from(new TextEncoder().encode(certBlob.url))),
    ],
  });

  const result = await signAndExecuteTransactionBlock({
    transactionBlock: tx,
    options: { showEffects: true, showEvents: true }
  });

  const certId = result.effects.created[0].reference.objectId;
  
  console.log("🎓 Certificate issued:", certId);
  return certId;
}
```

---

## ⚠️ COMMON ERRORS & SOLUTIONS

| Error Code | Error Name | Cause | Solution |
|------------|------------|-------|----------|
| `1` | `ENotAuthorized` | CourseOwnerCap doesn't match course | Use correct cap for this course |
| `2` | `ECourseAlreadyPublished` | Trying to publish twice | Check `course.published` first |
| `3` | `ECourseNotPublished` | Student accessing unpublished course | Teacher must publish first |
| `4` | `EInvalidScore` | Score > 100 | Ensure score ≤ 100 |
| `5` | `EAlreadyCompleted` | Completing same lesson twice | Check completion status first |
| `6` | `EInvalidLesson` | Lesson doesn't belong to course | Verify lesson.course_id matches |
| `7` | `ECourseNotCompleted` | Claiming cert without 100% | Complete all lessons first |
| `8` | `ECertificateAlreadyIssued` | Claiming cert twice | Check if cert exists first |
| `9` | `EInvalidExercise` | Exercise doesn't belong to lesson | Verify exercise.lesson_id matches |

---

## 🎓 SUMMARY CHEAT SHEET

### Teacher Workflow IDs Needed:
```
1. create_course() 
   → Get: courseId, ownerCapId

2. create_lesson(courseId, ownerCapId)
   → Get: lessonId

3. create_exercise(lessonId, ownerCapId)
   → Get: exerciseId

4. publish_course(courseId, ownerCapId)
   → Course goes live!
```

### Student Workflow IDs Needed:
```
1. submit_exercise(courseId, lessonId, exerciseId, score)
   → Tracks progress

2. complete_lesson(courseId, lessonId, score)
   → Get: progressNFTId

3. issue_certificate(courseId)
   → Get: certificateId (soulbound!)
```

### Constant IDs (Set Once at Deploy):
```
PACKAGE_ID
COURSE_REGISTRY_ID
LESSON_REGISTRY_ID
PROGRESS_REGISTRY_ID
EXERCISE_REGISTRY_ID
CERTIFICATE_REGISTRY_ID
```

---

This reference shows **EXACTLY** what you need for every function call in Move Academy! 🚀
