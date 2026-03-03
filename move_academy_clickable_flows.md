# Move Academy - Interactive Clickable User Flows

## 🗺️ Complete Navigation Map

This document shows **every click/action** and **where it leads you** in the Move Academy platform.

---

## 🎓 TEACHER NAVIGATION FLOW

### 🏠 Teacher Dashboard (Starting Point)

```
┌─────────────────────────────────────────┐
│      TEACHER DASHBOARD                  │
├─────────────────────────────────────────┤
│ [Create New Course]         ───────────┐│
│ [My Courses]                ──────────┐││
│ [Analytics]                 ─────────┐│││
│ [Profile Settings]          ────────┐││││
└─────────────────────────────────────┼┼┼┼┘
                                      ││││
                                      ││││
    ┌─────────────────────────────────┘│││
    │                                  │││
    ▼                                  │││
┌─────────────────────────────────┐   │││
│   CREATE COURSE PAGE            │   │││
├─────────────────────────────────┤   │││
│ Input: Course Title             │   │││
│ Input: Description              │   │││
│ [Create Course Button]  ────────┼───┼┼┼─────┐
└─────────────────────────────────┘   │││     │
                                      │││     │
                                      │││     ▼
                    ┌─────────────────┘││   Contract Call:
                    │                  ││   create_course()
                    ▼                  ││   ↓
            ┌──────────────────┐       ││   Receives CourseOwnerCap NFT
            │  MY COURSES      │       ││   Course created in DRAFT
            ├──────────────────┤       ││   ↓
            │ Course 1 [DRAFT] │◄──────┘│   Redirects to ▼
            │ Course 2 [LIVE]  │        │
            │ Course 3 [DRAFT] │        │
            │                  │        │
            │ Click any ────────────────┼─────────┐
            └──────────────────┘        │         │
                                        │         │
                ┌───────────────────────┘         │
                │                                 │
                ▼                                 ▼
        ┌────────────────┐              ┌──────────────────────────┐
        │   ANALYTICS    │              │   COURSE EDIT PAGE       │
        ├────────────────┤              ├──────────────────────────┤
        │ Total Students │              │ Course: "Intro to Move"  │
        │ Completions    │              │ Status: [DRAFT] 🔴       │
        │ Avg Scores     │              ├──────────────────────────┤
        │ Revenue        │              │ [Edit Details]  ─────┐   │
        │                │              │ [Add Lesson]  ───────┼─┐ │
        │ Filter by:     │              │ [Add Exercise] ──────┼─┼┐│
        │ └─ Course ▼    │              │ [Preview Course] ────┼─┼┼┤
        │ └─ Date Range  │              │ [PUBLISH COURSE] 🚀 ─┼─┼┼┼┤
        └────────────────┘              └──────────────────────┼─┼┼┼┘
                                                               │ │││
        ┌──────────────────────────────────────────────────────┘ │││
        │                                                         │││
        ▼                                                         │││
    ┌─────────────────────────────┐                             │││
    │  EDIT COURSE DETAILS        │                             │││
    ├─────────────────────────────┤                             │││
    │ Title: [____________]       │                             │││
    │ Description: [_________]    │                             │││
    │ [Save Changes] ──────────┐  │                             │││
    └──────────────────────────┼──┘                             │││
                               │                                │││
                               ▼                                │││
                        Contract Call:                          │││
                        update_course()                         │││
                        ↓                                       │││
                        Returns to Course Edit Page            │││
                                                                │││
        ┌───────────────────────────────────────────────────────┘││
        │                                                        ││
        ▼                                                        ││
    ┌─────────────────────────────────┐                         ││
    │   CREATE LESSON PAGE            │                         ││
    ├─────────────────────────────────┤                         ││
    │ Lesson Title: [__________]      │                         ││
    │ Order: [_]                      │                         ││
    │                                 │                         ││
    │ Content Upload:                 │                         ││
    │ [Upload to Walrus] ──────────┐  │                         ││
    │   ↓ Returns Walrus Blob ID   │  │                         ││
    │   content_uri stored          │  │                         ││
    │                               │  │                         ││
    │ Quiz Upload:                  │  │                         ││
    │ [Upload Quiz JSON] ───────────┼─┐│                         ││
    │   ↓ Returns Walrus Blob ID   │ ││                         ││
    │   quiz_uri stored             │ ││                         ││
    │                               │ ││                         ││
    │ [Create Lesson] ──────────────┼─┼┼────────┐                ││
    └───────────────────────────────┘ │││        │                ││
                                      │││        ▼                ││
                                      │││   Contract Call:        ││
                                      │││   create_lesson()       ││
                                      │││   ↓                     ││
                                      │││   Lesson created        ││
                                      │││   lesson_count++        ││
                                      │││   ↓                     ││
                                      │││   Redirects back to     ││
                                      │││   Course Edit Page      ││
                                      │││   (now shows new lesson)││
                                      │││                         ││
        ┌─────────────────────────────┘││                         ││
        │                              ││                         ││
        │ ┌────────────────────────────┘│                         ││
        │ │                             │                         ││
        │ │ ┌───────────────────────────┘                         ││
        │ │ │                                                     ││
        │ │ │  ┌──────────────────────────────────────────────────┘│
        │ │ │  │                                                   │
        ▼ ▼ ▼  ▼                                                   ▼
    All paths return to COURSE EDIT PAGE showing:          ┌────────────────┐
    ┌──────────────────────────────────┐                   │ PUBLISH COURSE │
    │ Course: "Intro to Move"          │                   ├────────────────┤
    │ Status: [DRAFT] 🔴               │                   │ Confirm:       │
    ├──────────────────────────────────┤                   │ ✓ 10 Lessons   │
    │ 📚 LESSONS (10)                  │                   │ ✓ All have     │
    │ ├─ 1. Variables [Edit][+Ex]     │                   │   quizzes      │
    │ ├─ 2. Functions [Edit][+Ex]     │                   │ ✓ Content      │
    │ ├─ 3. Structs   [Edit][+Ex]     │                   │   uploaded     │
    │ └─ ...                           │                   │                │
    │                                  │                   │ [Publish Now]  │
    │ 💪 EXERCISES (25 total)          │                   └────┬───────────┘
    │ ├─ Lesson 1: 3 exercises        │                        │
    │ ├─ Lesson 2: 2 exercises        │                        ▼
    │ └─ ...                           │                   Contract Call:
    │                                  │                   publish_course()
    │ [Add Lesson][PUBLISH COURSE]🚀   │                   ↓
    └──────────────────────────────────┘                   Course.published = true
                                                           ↓
        Click [+Ex] or [Add Exercise]:                    SUCCESS PAGE
                ↓                                          ├─ Share link
    ┌─────────────────────────────────┐                   ├─ [View Live Course]
    │   CREATE EXERCISE PAGE          │                   └─ [Back to Dashboard]
    ├─────────────────────────────────┤
    │ Lesson: "Variables and Types"   │
    │                                 │
    │ Exercise Title: [__________]    │
    │                                 │
    │ Exercise Content:               │
    │ [Upload Exercise JSON] ──────┐  │
    │   ↓ Interactive problems      │  │
    │   ↓ Code challenges           │  │
    │   ↓ Walrus blob ID            │  │
    │                               │  │
    │ Max Score: [100]              │  │
    │ Mastery Threshold: [80]       │  │
    │                               │  │
    │ [Create Exercise] ────────────┼──┼────┐
    └───────────────────────────────┘  │    │
                                       │    ▼
                                       │   Contract Call:
                                       │   create_exercise()
                                       │   ↓
                                       │   Returns to Course Edit Page
                                       │   Exercise count updated
                                       │
        Click [Edit] on any lesson:    │
                ↓                      │
    ┌─────────────────────────────────┐│
    │   EDIT LESSON PAGE              ││
    ├─────────────────────────────────┤│
    │ Title: [Update title]           ││
    │ Content: [Re-upload to Walrus]  ││
    │ Quiz: [Update quiz]             ││
    │ [Save Changes] ──────────────────┼┘
    └─────────────────────────────────┘
                ↓
           Contract Call:
           update_lesson()
                ↓
           Returns to Course Edit Page
```

---

## 📚 STUDENT NAVIGATION FLOW

### 🏠 Student Dashboard (Starting Point)

```
┌─────────────────────────────────────────┐
│      STUDENT DASHBOARD                  │
├─────────────────────────────────────────┤
│ [Browse Courses]            ───────────┐│
│ [My Learning]               ──────────┐││
│ [Certificates]              ─────────┐│││
│ [Profile]                   ────────┐││││
└─────────────────────────────────────┼┼┼┼┘
                                      ││││
        ┌─────────────────────────────┘│││
        │                              │││
        ▼                              │││
┌──────────────────────────┐          │││
│   COURSE CATALOG         │          │││
├──────────────────────────┤          │││
│ Search: [__________] 🔍  │          │││
│ Filter:                  │          │││
│ └─ Topic ▼               │          │││
│ └─ Difficulty ▼          │          │││
│ └─ Duration ▼            │          │││
│                          │          │││
│ 📘 Intro to Move         │          │││
│    Creator: @alice       │          │││
│    10 lessons · 25 ex    │          │││
│    [View Course] ────────┼──┐       │││
│                          │  │       │││
│ 📗 Advanced Sui          │  │       │││
│    Creator: @bob         │  │       │││
│    [View Course] ────────┼──┼─┐     │││
│                          │  │ │     │││
│ 📙 DeFi with Move        │  │ │     │││
│    [View Course] ────────┼──┼─┼─┐   │││
└──────────────────────────┘  │ │ │   │││
                              │ │ │   │││
        ┌─────────────────────┘ │ │   │││
        │     ┌─────────────────┘ │   │││
        │     │     ┌─────────────┘   │││
        │     │     │                 │││
        ▼     ▼     ▼                 │││
┌────────────────────────────────┐    │││
│   COURSE DETAILS PAGE          │    │││
├────────────────────────────────┤    │││
│ 📘 Intro to Move Programming   │    │││
│ By: @alice                     │    │││
│ ⭐⭐⭐⭐⭐ (150 students)        │    │││
│                                │    │││
│ 📋 DESCRIPTION                 │    │││
│ Learn Move from scratch...     │    │││
│                                │    │││
│ 📚 CURRICULUM (10 lessons)     │    │││
│ ├─ 1. Variables & Types        │    │││
│ ├─ 2. Functions                │    │││
│ ├─ 3. Structs & Resources      │    │││
│ └─ ...                         │    │││
│                                │    │││
│ [START LEARNING] 🚀 ───────────┼────┼───┐
│ [Preview Lesson 1]  ───────────┼────┼───┼─┐
└────────────────────────────────┘    │   │ │
                                      │   │ │
        ┌─────────────────────────────┘   │ │
        │                                 │ │
        ▼                                 │ │
┌────────────────────────────────┐        │ │
│   LESSON PAGE                  │        │ │
├────────────────────────────────┤        │ │
│ Course: Intro to Move          │        │ │
│ Lesson 1/10: Variables & Types │        │ │
│ ━━━━━━━━━━░░░░░░░░░░ 10%      │        │ │
│                                │        │ │
│ 📖 CONTENT                     │        │ │
│ [Video Player] ◄────────────┐  │        │ │
│ Fetches from Walrus URI     │  │        │ │
│                             │  │        │ │
│ [Text Content Below]        │  │        │ │
│ Variables in Move are...    │  │        │ │
│                             │  │        │ │
│ 💪 EXERCISES (3)            │  │        │ │
│ ├─ Exercise 1: Declare var  │  │        │ │
│ │  Status: Not Started      │  │        │ │
│ │  [Start] ───────────────┐ │  │        │ │
│ │                         │ │  │        │ │
│ ├─ Exercise 2: Type system│ │  │        │ │
│ │  [Start] ───────────────┼─┼┐ │        │ │
│ │                         │ ││ │        │ │
│ └─ Exercise 3: Mutations  │ ││ │        │ │
│    [Start] ───────────────┼─┼┼┐│        │ │
│                           │ │││││        │ │
│ 📝 QUIZ                   │ │││││        │ │
│ [Take Quiz] ──────────────┼─┼┼┼┼┼─┐      │ │
│                           │ ││││││ │     │ │
│ [◄ Previous] [Next Lesson►]│ ││││││ │     │ │
└───────────────────────────┘ ││││││ │     │ │
                              ││││││ │     │ │
    ┌─────────────────────────┘│││││ │     │ │
    │                          │││││ │     │ │
    ▼                          │││││ │     │ │
┌────────────────────────────┐ │││││ │     │ │
│   EXERCISE INTERFACE       │ │││││ │     │ │
├────────────────────────────┤ │││││ │     │ │
│ Exercise 1: Declare Var    │ │││││ │     │ │
│ ━━━━━━━━━━░░░░░░░░░░       │ │││││ │     │ │
│ Best Score: 0/100          │ │││││ │     │ │
│ Attempts: 0                │ │││││ │     │ │
│ Mastery: 80 required       │ │││││ │     │ │
│                            │ │││││ │     │ │
│ PROBLEM:                   │ │││││ │     │ │
│ Declare a variable...      │ │││││ │     │ │
│                            │ │││││ │     │ │
│ [Code Editor]              │ │││││ │     │ │
│ let x = ____;              │ │││││ │     │ │
│                            │ │││││ │     │ │
│ [Hint] (0 used) ────────┐  │ │││││ │     │ │
│ [Submit Solution] ───────┼──┼─┼┼┼┼┼─┐     │ │
└─────────────────────────┘  │ │││││ │     │ │
                             │ │││││ │     │ │
                             ▼ │││││ │     │ │
                    Frontend validation││││ │     │ │
                             ↓ │││││ │     │ │
                    ┌──────────┐││││ │     │ │
                    │ RESULTS  │││││ │     │ │
                    ├──────────┤││││ │     │ │
                    │ Score: 85│││││ │     │ │
                    │ ✓ Correct│││││ │     │ │
                    │          │││││ │     │ │
                    │ [Submit  │││││ │     │ │
                    │ to Chain]│││││ │     │ │
                    └────┬─────┘││││ │     │ │
                         │      ││││ │     │ │
                         ▼      ││││ │     │ │
                    Contract Call:││││ │     │ │
                    submit_exercise()││ │     │ │
                    ↓              ││││ │     │ │
                    - Attempts++   ││││ │     │ │
                    - Best score = 85││ │     │ │
                    - MASTERED! ✓  ││││ │     │ │
                    ↓              ││││ │     │ │
                    Event: ExerciseMastered
                    ↓              ││││ │     │ │
                    Updates UI:    ││││ │     │ │
                    ┌──────────────┐│││ │     │ │
                    │ 🎉 MASTERED! ││││ │     │ │
                    │ Score: 85/100││││ │     │ │
                    │ [Next Ex] ───┼┼──┘     │ │
                    │ [Retry] ─────┼┼────┐   │ │
                    │ [Back to     ││││  │   │ │
                    │  Lesson] ────┼┼┼┼──┼───┘ │
                    └──────────────┘│││  │     │
                                    │││  │     │
         All 3 exercises lead here ││┼──┘     │
         when mastered:             ││└────────┘
                    ↓               ││
         Auto-triggers: ────────────┘│
         complete_lesson()            │
                    ↓                 │
         Creates Progress NFT         │
         Marks lesson complete        │
         Emits LessonCompleted       │
                    ↓                 │
         Returns to Lesson Page with: │
         ✓ Lesson 1 COMPLETED         │
         [Next Lesson ►] ─────────────┘
                    ↓
         Goes to Lesson 2 Page
         (same structure)


                    OR Manual Path:
                    ┌─────────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │   QUIZ PAGE      │
            ├──────────────────┤
            │ Q1: What is...   │
            │ ( ) Option A     │
            │ (•) Option B     │
            │ ( ) Option C     │
            │                  │
            │ Q2: ...          │
            │ ...              │
            │                  │
            │ [Submit Quiz] ───┼────┐
            └──────────────────┘    │
                                    ▼
                           Frontend grades quiz
                                    ↓
                           Score calculated (0-100)
                                    ↓
                           Shows results:
                           ┌──────────────────┐
                           │ Quiz Results     │
                           ├──────────────────┤
                           │ Score: 92/100    │
                           │ ✓ Passed!        │
                           │                  │
                           │ [Submit to Chain]│
                           └────┬─────────────┘
                                │
                                ▼
                       Contract Call:
                       complete_lesson(score=92)
                                ↓
                       Creates Progress NFT
                       Marks lesson complete
                                ↓
                       Emits: LessonCompleted
                                ↓
                       If last lesson:
                       Emits: CourseCompleted 🎉
                                ↓
                       Redirects to Course Progress Page


                ┌───────────────────┘ (from Dashboard)
                │
                ▼
        ┌──────────────────────┐
        │   MY LEARNING        │
        ├──────────────────────┤
        │ 📘 Intro to Move     │
        │    ━━━━━━━━━━ 100%  │
        │    ✓ 10/10 Complete  │
        │    🏆 [Get Cert] ────┼────┐
        │                      │    │
        │ 📗 Advanced Sui      │    │
        │    ━━━━━░░░░░ 40%   │    │
        │    4/10 Complete     │    │
        │    [Continue] ───────┼────┼─┐
        │                      │    │ │
        │ 📙 DeFi with Move    │    │ │
        │    ━░░░░░░░░░ 5%     │    │ │
        │    [Continue] ───────┼────┼─┼─┐
        └──────────────────────┘    │ │ │
                                    │ │ │
              ┌─────────────────────┘ │ │
              │                       │ │
              ▼                       │ │
      ┌──────────────────────┐       │ │
      │ CERTIFICATE REQUEST  │       │ │
      ├──────────────────────┤       │ │
      │ Course: Intro to Move│       │ │
      │ Status: ✓ Complete   │       │ │
      │                      │       │ │
      │ Certificate Design:  │       │ │
      │ [Upload Image] ──┐   │       │ │
      │ ↓ Uploads to     │   │       │ │
      │   Walrus         │   │       │ │
      │ ↓ Gets image_url │   │       │ │
      │                  │   │       │ │
      │ [Claim Cert] ────┼───┼───┐   │ │
      └──────────────────┘   │   │   │ │
                             │   │   │ │
                             ▼   │   │ │
                    Contract Call:   │ │
                    issue_certificate()│
                             ↓   │   │ │
                    Validates 100%│   │ │
                    Creates Certificate NFT
                    Soulbound = true│ │
                             ↓   │   │ │
                    Transfers to wallet
                             ↓   │   │ │
                    Emits: CertificateIssued
                             ↓   │   │ │
                    Success Page:│   │ │
                    ┌──────────────┐ │ │
                    │ 🎓 SUCCESS!  │ │ │
                    │              │ │ │
                    │ Certificate  │ │ │
                    │ in wallet!   │ │ │
                    │              │ │ │
                    │ [View NFT]   │ │ │
                    │ [Share] 🔗   │ │ │
                    │ [Dashboard]──┼─┼─┼───► Back to Dashboard
                    └──────────────┘ │ │
                                     │ │
                ┌────────────────────┘ │
                │                      │
                │  ┌───────────────────┘
                │  │
                ▼  ▼
        Goes back to specific lesson
        in that course where student
        left off


            ┌────────────────┘ (from Dashboard)
            │
            ▼
    ┌──────────────────────┐
    │   MY CERTIFICATES    │
    ├──────────────────────┤
    │ 🎓 Intro to Move     │
    │    Earned: Jan 2026  │
    │    [View] [Share]    │
    │                      │
    │ 🎓 Rust Basics       │
    │    Earned: Dec 2025  │
    │    [View] [Share] ───┼────┐
    └──────────────────────┘    │
                                │
                                ▼
                    ┌──────────────────────┐
                    │ CERTIFICATE DETAIL   │
                    ├──────────────────────┤
                    │ [Certificate Image]  │
                    │                      │
                    │ Course: Rust Basics  │
                    │ Student: 0x123...    │
                    │ Date: Dec 15, 2025   │
                    │ ID: 0xabc...         │
                    │ Soulbound: Yes 🔒    │
                    │                      │
                    │ [Download PNG]       │
                    │ [Share on Twitter]   │
                    │ [Share on LinkedIn]  │
                    │ [Copy Link]          │
                    │ [Verify on Chain] ───┼──► Opens block explorer
                    └──────────────────────┘
```

---

## 🔄 CROSS-USER INTERACTIONS

### Scenario: Student shares progress, Teacher sees analytics

```
STUDENT SIDE:                           TEACHER SIDE:
┌──────────────┐                        ┌──────────────┐
│ Completes    │                        │ Dashboard    │
│ Lesson 5     │                        │ Auto-updates │
└──────┬───────┘                        └───────▲──────┘
       │                                        │
       ▼                                        │
Contract emits:                                 │
LessonCompleted event ──────────────────────────┘
       │                                        
       │                                   Teacher clicks:
       ▼                                   [View Analytics]
Student's Progress                              │
updated in                                      ▼
ProgressRegistry                    ┌──────────────────────┐
       │                            │ COURSE ANALYTICS     │
       │                            ├──────────────────────┤
       │                            │ Active Students: 47  │
       │                            │ Avg Progress: 65%    │
       │                            │                      │
       │                            │ Lesson Completion:   │
       │                            │ L1: ███████ 95%      │
       │                            │ L2: ██████░ 87%      │
       │                            │ L3: █████░░ 76%      │
       │                            │ L4: ████░░░ 68%      │
       │                            │ L5: ███░░░░ 54% ◄─── Updated!
       │                            │                      │
       │                            │ Drop-off Point: L5   │
       │                            │ [View Details] ──────┼──┐
       │                            └──────────────────────┘  │
       │                                                      │
       ▼                                                      ▼
Student sees:                              ┌──────────────────────┐
┌──────────────────┐                       │ LESSON 5 DETAILS     │
│ ✓ Lesson 5 Done  │                       ├──────────────────────┤
│ Progress NFT in  │                       │ Students: 25/47      │
│ wallet           │                       │ Avg Score: 78%       │
│                  │                       │ Avg Time: 45 min     │
│ [Next Lesson ►]  │                       │                      │
└──────────────────┘                       │ Common mistakes:     │
                                           │ - Borrows (12 errors)│
                                           │ - Syntax (8 errors)  │
                                           │                      │
                                           │ [Edit Lesson] ───────┼──► Can improve content
                                           └──────────────────────┘
```

---

## 📱 MOBILE APP NAVIGATION

### Quick Actions from Home Screen

```
┌────────────────────────────┐
│    MOBILE APP HOME         │
├────────────────────────────┤
│ 👤 Profile     [≡] Menu    │
├────────────────────────────┤
│ Continue Learning:         │
│ ┌────────────────────────┐ │
│ │ 📘 Intro to Move       │ │
│ │ Lesson 7/10            │ │
│ │ ━━━━━━━░░░ 70%        │ │
│ │ [Continue] ────────────┼─┼──► Goes to Lesson 7
│ └────────────────────────┘ │
│                            │
│ Quick Actions:             │
│ [📚 Browse]    [💪 Practice]  [🏆 Certs]
│     │              │            │
│     │              │            └───► Certificates Page
│     │              │
│     │              └────► Exercise Practice Mode:
│     │                    ┌──────────────────┐
│     │                    │ PRACTICE MODE    │
│     │                    ├──────────────────┤
│     │                    │ Random exercises │
│     │                    │ from courses     │
│     │                    │ you're taking    │
│     │                    │                  │
│     │                    │ [Start] ─────────┼──► Random exercise
│     │                    └──────────────────┘
│     │
│     └────► Browse Catalog (same as desktop)
│
│ Notifications: (2) ────────┼──┐
└────────────────────────────┘  │
                                │
                                ▼
                    ┌──────────────────┐
                    │ NOTIFICATIONS    │
                    ├──────────────────┤
                    │ 🎉 Course Complete!
                    │ "Intro to Move"  │
                    │ [Claim Cert] ────┼──► Certificate flow
                    │                  │
                    │ 📢 New lesson added
                    │ to "Advanced Sui"│
                    │ [View] ──────────┼──► Goes to lesson
                    └──────────────────┘
```

---

## 🎯 COMPLETE CLICK MAP

### Every Possible Action → Destination

#### TEACHER ACTIONS:
1. **[Create New Course]** → Create Course Form → `create_course()` → Course Edit Page
2. **[My Courses]** → Course List → Click course → Course Edit Page
3. **[Add Lesson]** → Lesson Form → Upload to Walrus → `create_lesson()` → Back to Course Edit
4. **[Add Exercise]** → Exercise Form → Upload to Walrus → `create_exercise()` → Back to Course Edit
5. **[Edit Details]** → Edit Form → `update_course()` → Back to Course Edit
6. **[Edit Lesson]** → Edit Form → `update_lesson()` → Back to Course Edit
7. **[Publish Course]** → Confirmation → `publish_course()` → Success Page → Dashboard
8. **[Analytics]** → Analytics Dashboard → Filter/drill down → Detailed views
9. **[View Live Course]** → Student view of course → Can test learning experience

#### STUDENT ACTIONS:
1. **[Browse Courses]** → Course Catalog → Filter/search → Course Details
2. **[View Course]** → Course Details Page → Syllabus preview
3. **[Start Learning]** → Lesson 1 Page → Content + Exercises
4. **[Start Exercise]** → Exercise Interface → Submit → `submit_exercise()` → Results
5. **[Take Quiz]** → Quiz Interface → Submit → `complete_lesson()` → Next Lesson
6. **[Next Lesson]** → Next Lesson Page → Continue learning
7. **[Previous]** → Previous Lesson Page → Review content
8. **[My Learning]** → Active Courses → Click → Resume at last lesson
9. **[Get Certificate]** → Upload design → `issue_certificate()` → Success → Certificate in wallet
10. **[Certificates]** → Certificate Gallery → View/Share individual certificates
11. **[Continue]** → Last incomplete lesson in course
12. **[Hint]** → Shows hint text → Can still submit
13. **[Retry Exercise]** → Reloads exercise → Can improve score

#### SHARED/UTILITY:
1. **[Profile]** → Settings → Edit name, preferences, wallet address
2. **[Share]** → Social media → Twitter, LinkedIn, Discord integrations
3. **[Download]** → PNG/PDF of certificate → Saves to device
4. **[Verify on Chain]** → Block explorer → Shows transaction/NFT details
5. **[Search]** → Filter results → Click result → Details page
6. **[Filter dropdown]** → Apply filter → Updates results list
7. **[≡ Menu]** → Sidebar → All navigation options
8. **[🔔 Notifications]** → Notification center → Click → Relevant page

---

## 🚀 USER JOURNEY EXAMPLES WITH CLICKS

### Example 1: Teacher Creates First Course (17 clicks)

```
1. Click [Create New Course]
2. Type title, description
3. Click [Create Course]
   → Blockchain transaction
   → Receive CourseOwnerCap
4. Click [Add Lesson]
5. Type lesson title
6. Click [Upload Content] → Select file → Walrus upload
7. Click [Upload Quiz] → Select file → Walrus upload
8. Click [Create Lesson]
   → Blockchain transaction
9. Repeat steps 4-8 for 9 more lessons (90 clicks total)
10. Click [Add Exercise] (for Lesson 1)
11. Type exercise details
12. Click [Upload Exercise] → Walrus upload
13. Enter max score, threshold
14. Click [Create Exercise]
    → Blockchain transaction
15. Repeat steps 10-14 for all exercises (multiple times)
16. Click [Publish Course]
17. Confirm publication
    → Blockchain transaction
    → Course goes live!

Total: ~17 clicks for basic course, more with exercises
```

### Example 2: Student Completes Full Course (45+ clicks)

```
1. Click [Browse Courses]
2. Click filter/search
3. Click course card [View Course]
4. Click [Start Learning]
   → Goes to Lesson 1
5. Watch video, read content
6. Click [Start Exercise 1]
7. Solve problem
8. Click [Submit Solution]
   → Blockchain transaction
9. Click [Next Exercise]
10. Repeat 7-9 for all exercises
11. Click [Take Quiz]
12. Answer questions
13. Click [Submit Quiz]
    → Blockchain transaction (complete_lesson)
14. Click [Next Lesson]
    → Goes to Lesson 2
15. Repeat steps 5-14 for all 10 lessons (10 × ~8 clicks = 80 clicks)
16. After last lesson, see "Course Complete!" message
17. Click [My Learning]
18. Click [Get Certificate]
19. Click [Upload Image] → Select design → Walrus upload
20. Click [Claim Certificate]
    → Blockchain transaction (issue_certificate)
21. Click [Share on Twitter]
    → Opens share dialog
22. Post to social media!

Total: ~85+ clicks for full course completion
```

### Example 3: Quick Exercise Practice (5 clicks)

```
1. Open app
2. Click [💪 Practice]
3. Random exercise loads
4. Solve and click [Submit]
   → Blockchain transaction
5. Click [Next Exercise]
   → Repeat for more practice

Total: ~5 clicks per exercise
```

---

## 🎨 UI/UX DESIGN NOTES

### Visual Indicators Throughout Navigation:

**Progress Bars Everywhere:**
- Course progress: `━━━━━━━░░░ 70%`
- Lesson progress: `━━━━━━━━━━ 100%` ✓
- Exercise mastery: `⭐⭐⭐✩✩` (3/5 stars)

**Status Badges:**
- 🔴 DRAFT (unpublished)
- 🟢 LIVE (published)
- ✓ COMPLETED (lesson done)
- 🎯 MASTERED (exercise mastered)
- 🔒 SOULBOUND (certificate)

**Notification Dots:**
- Red dot on [Notifications] when new
- Blue dot on [My Learning] when new lesson added
- Green dot on [Certificates] when ready to claim

### Smart Navigation Features:

**Breadcrumbs:**
```
Home > My Learning > Intro to Move > Lesson 7 > Exercise 2
  ↑       ↑             ↑              ↑          ↑
Click any to jump back
```

**Keyboard Shortcuts:**
- `→` Next lesson
- `←` Previous lesson
- `Space` Play/pause video
- `Enter` Submit answer
- `Ctrl+S` Save draft

**Deep Links:**
```
academy.sui/courses/0x123...
academy.sui/lessons/0x456...
academy.sui/certificates/0x789...
```
Each shareable and resumable!

---

This navigation map shows every possible click path in Move Academy. Students can jump between lessons freely, retry exercises infinitely, and always know where they are in their learning journey. Teachers have full control over content while monitoring real-time engagement. Every blockchain transaction is clearly marked, and the UI maintains state across sessions via on-chain progress tracking! 🚀

