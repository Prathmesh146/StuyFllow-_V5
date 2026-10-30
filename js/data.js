/* ============================================================
   STUDYFLOW V4 FLAGSHIP  |  js/data.js
   Complete NCERT Grade 9 Seed Data (9 Subjects, 82 Chapters),
   User Backup Data, Manual Previous-DB Merge Loader, Routine
   Matrix Schedule, 60-Day Roadmap & Socratic Question Bank
   ============================================================ */
'use strict';

const SF_DATA = {};

/* 1. ISRO Mission Ranks */
SF_DATA.ranks = [
    { xp: 0,    emoji: '🛸', name: 'Aeronautical Trainee' },
    { xp: 500,  emoji: '🚀', name: 'Payload Specialist' },
    { xp: 1500, emoji: '🛰️', name: 'Orbital Engineer' },
    { xp: 3000, emoji: '🌌', name: 'Flight Director' },
    { xp: 5000, emoji: '⭐', name: 'ISRO Mission Commander' }
];

/* 2. Daily Routine Matrix (IST) */
SF_DATA.routine = [
    { s: '05:00', e: '06:30', label: 'Morning Wake Up & Prep',            type: 'fixed', icon: '🌅' },
    { s: '06:30', e: '07:00', label: 'Morning Free Buffer',               type: 'soft',  icon: '☕' },
    { s: '07:00', e: '15:00', label: 'School & TATA Magic Van Commute',   type: 'fixed', icon: '🏫', days: [1, 2, 3, 4, 5, 6] },
    { s: '15:00', e: '16:00', label: 'Return Home, Lunch & Rest',         type: 'fixed', icon: '🍲' },
    { s: '16:00', e: '18:00', label: 'Prime Study Window I (Heavy Slot)', type: 'study', icon: '⭐' },
    { s: '18:00', e: '19:00', label: 'Shri Swami Samarth Kendra Aarti',   type: 'fixed', icon: '🪔' },
    { s: '19:00', e: '20:00', label: 'Prime Study Window II (Light Slot)',type: 'study', icon: '⭐' },
    { s: '20:00', e: '21:00', label: 'Dinner & Revision Buffer',          type: 'soft',  icon: '🍽️' },
    { s: '21:00', e: '22:30', label: 'Bhajan at Kendra (Harmonium)',      type: 'soft',  icon: '🎶' },
    { s: '22:30', e: '05:00', label: 'Deep Sleep & Recovery',             type: 'fixed', icon: '🌙' }
];

/* 3. 60-Day Heavy + Light Master Study Roadmap */
SF_DATA.masterSchedule = [
    { day: 1,  isSunday: false, heavy: { sub: 'Science',     title: 'Ch 4 — Describing Motion Around Us' },          light: { sub: 'English', title: 'Prose 1 — How I Taught My Grandmother to Read' } },
    { day: 2,  isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 1 — The World of Numbers' },                 light: { sub: 'Hindi',   title: 'Ch 1 — दो बैलों की कथा' } },
    { day: 3,  isSunday: false, heavy: { sub: 'Social Science', title: 'Ch 1 — Understanding Social Science' },       light: { sub: 'Marathi', title: '१. सर्वात्मका शिवसुंदरा' } },
    { day: 4,  isSunday: false, heavy: { sub: 'Science',     title: 'Ch 2 — The Building Blocks of Life' },           light: { sub: 'English', title: 'Prose 2 — The Pot Maker' } },
    { day: 5,  isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 2 — The Use of Coordinates' },                light: { sub: 'Hindi',   title: 'Ch 2 — राम-लक्ष्मण-परशुराम संवाद' } },
    { day: 6,  isSunday: false, heavy: { sub: 'Social Science', title: "Ch 2 — Shaping of the Earth's Surface" },     light: { sub: 'Marathi', title: '२. संतवाणी — भेटीलागी जीवा' } },
    { day: 7,  isSunday: true,  title: 'Sunday Rule: Backlog Clearance & Formula Revision', desc: 'Clear any pending homework from the week and test yourself with Challenge Me.' },
    { day: 8,  isSunday: false, heavy: { sub: 'Science',     title: 'Ch 6 — How Forces Affect Motion' },              light: { sub: 'IT',      title: 'Part A · Unit 1 — Communication Skills' } },
    { day: 9,  isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 3 — Introduction to Linear Polynomials' },    light: { sub: 'English', title: 'Prose 3 — Winds of Change' } },
    { day: 10, isSunday: false, heavy: { sub: 'Social Science', title: 'Ch 3 — Atmosphere and Climate' },             light: { sub: 'Hindi',   title: 'Ch 3 — रीढ़ की हड्डी (एकांकी)' } },
    { day: 11, isSunday: false, heavy: { sub: 'Science',     title: 'Ch 8 — Journey Inside the Atom' },               light: { sub: 'Marathi', title: '३. बेटा, मी ऐकतो आहे!' } },
    { day: 12, isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 4 — Exploring Algebraic Identities' },        light: { sub: 'IT',      title: 'Part A · Unit 2 — Self-Management Skills' } },
    { day: 13, isSunday: false, heavy: { sub: 'Social Science', title: 'Ch 6 — Understanding Democracy' },            light: { sub: 'English', title: 'Poetry 1 — Bharat Our Land' } },
    { day: 14, isSunday: true,  title: 'Sunday Rule: Active Recall & Spaced Repetition', desc: 'Review 3D Flashcards and complete pending notebook exercises.' },
    { day: 15, isSunday: false, heavy: { sub: 'Science',     title: 'Ch 5 — Exploring Mixtures and Their Separation' },light: { sub: 'Hindi',  title: 'Ch 4 — घर की याद' } },
    { day: 16, isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 6 — Measuring Space: Perimeter and Area' },   light: { sub: 'Marathi', title: '४. जी. आय. पी. रेल्वे' } },
    { day: 17, isSunday: false, heavy: { sub: 'Social Science', title: 'Ch 4 — Early Humans and Civilization' },      light: { sub: 'English', title: 'Prose 4 — Vitamin-M' } },
    { day: 18, isSunday: false, heavy: { sub: 'Science',     title: 'Ch 3 — Tissues in Action' },                     light: { sub: 'IT',      title: 'Part B · Unit 3 — Digital Documentation' } },
    { day: 19, isSunday: false, heavy: { sub: 'Mathematics', title: 'Ch 7 — Introduction to Probability' },           light: { sub: 'Hindi',   title: 'Ch 10 — ऐसी भी बातें होती हैं' } },
    { day: 20, isSunday: false, heavy: { sub: 'Science',     title: 'Ch 9 — Atomic Foundations of Matter' },          light: { sub: 'Marathi', title: '६. ऑलिंपिक वर्तुळांचा गोफ' } },
    { day: 21, isSunday: true,  title: 'Sunday Rule: Mistake Notebook & PT Mock Review', desc: 'Re-test weak chapters in Thinking Coach until 80%+ Mastery is unlocked.' }
];

const SEED = {
    subjects: [
        { id: 1, name: 'English',                subtitle: 'Kaveri',                     icon: '📘', color: '#4A9EFF', order: 1 },
        { id: 2, name: 'Hindi',                  subtitle: 'Ganga (गंगा)',               icon: '🪷', color: '#FF6B6B', order: 2 },
        { id: 3, name: 'Marathi',                subtitle: 'Aksharbharti (अक्षरभारती)', icon: '📖', color: '#A78BFA', order: 3 },
        { id: 4, name: 'Science',                subtitle: 'Exploration',                icon: '🔬', color: '#00D4AA', order: 4 },
        { id: 5, name: 'Mathematics',            subtitle: 'Ganita Manjari',             icon: '📐', color: '#7C6FFF', order: 5 },
        { id: 6, name: 'Social Science',         subtitle: 'Understanding Society',      icon: '🌍', color: '#FFA502', order: 6 },
        { id: 7, name: 'Information Technology', subtitle: 'Code 402',                   icon: '💻', color: '#06B6D4', order: 7 }
    ],

    chapters: [
        /* English — Kaveri (subjectId: 1) */
        { id:  1, subjectId: 1, name: 'Prose 1 — How I Taught My Grandmother to Read', order:  1, isCustom: false },
        { id:  2, subjectId: 1, name: 'Prose 2 — The Pot Maker',                       order:  2, isCustom: false },
        { id:  3, subjectId: 1, name: 'Prose 3 — Winds of Change',                     order:  3, isCustom: false },
        { id:  4, subjectId: 1, name: 'Prose 4 — Vitamin-M',                           order:  4, isCustom: false },
        { id:  5, subjectId: 1, name: 'Prose 5 — The World of Limitless Possibilities',order:  5, isCustom: false },
        { id:  6, subjectId: 1, name: 'Prose 6 — Twin Melodies',                       order:  6, isCustom: false },
        { id:  7, subjectId: 1, name: 'Prose 7 — Carrier of Words',                    order:  7, isCustom: false },
        { id:  8, subjectId: 1, name: 'Prose 8 — Follow That Dream',                   order:  8, isCustom: false },
        { id:  9, subjectId: 1, name: 'Poetry 1 — Bharat Our Land',                    order:  9, isCustom: false },
        { id: 10, subjectId: 1, name: 'Poetry 2 — Gifts of Grace: Honouring Our Vocations', order: 10, isCustom: false },
        { id: 11, subjectId: 1, name: 'Poetry 3 — Canvas of Soil',                     order: 11, isCustom: false },
        { id: 12, subjectId: 1, name: 'Poetry 4 — I Cannot Remember My Mother',        order: 12, isCustom: false },
        { id: 13, subjectId: 1, name: 'Poetry 5 — Nine Gold Medals',                   order: 13, isCustom: false },
        { id: 14, subjectId: 1, name: 'Poetry 6 — A Friend Found in Music',            order: 14, isCustom: false },
        { id: 15, subjectId: 1, name: 'Poetry 7 — Words',                              order: 15, isCustom: false },
        { id: 16, subjectId: 1, name: 'Poetry 8 — Believe in Yourself',                order: 16, isCustom: false },

        /* Hindi — Ganga (subjectId: 2) */
        { id: 17, subjectId: 2, name: 'Chapter 1 — दो बैलों की कथा',                  order:  1, isCustom: false },
        { id: 18, subjectId: 2, name: 'Chapter 2 — राम-लक्ष्मण-परशुराम संवाद',        order:  2, isCustom: false },
        { id: 19, subjectId: 2, name: 'Chapter 3 — रीढ़ की हड्डी (एकांकी)',            order:  3, isCustom: false },
        { id: 20, subjectId: 2, name: 'Chapter 4 — घर की याद',                         order:  4, isCustom: false },
        { id: 21, subjectId: 2, name: 'Chapter 5 — झाँसी की रानी',                     order:  5, isCustom: false },
        { id: 22, subjectId: 2, name: 'Chapter 6 — भारति, जय, विजयकरे',               order:  6, isCustom: false },
        { id: 23, subjectId: 2, name: 'Chapter 7 — रैदास के पद',                       order:  7, isCustom: false },
        { id: 24, subjectId: 2, name: 'Chapter 8 — मैं और मेरा देश',                   order:  8, isCustom: false },
        { id: 25, subjectId: 2, name: 'Chapter 9 — आखिरी चट्टान तक',                  order:  9, isCustom: false },
        { id: 26, subjectId: 2, name: 'Chapter 10 — ऐसी भी बातें होती हैं',            order: 10, isCustom: false },
        { id: 27, subjectId: 2, name: 'Chapter 11 — संवादहीन',                         order: 11, isCustom: false },
        { id: 28, subjectId: 2, name: 'Chapter 12 — क्या लिखूँ',                       order: 12, isCustom: false },

        /* Marathi — Aksharbharti (subjectId: 3) */
        { id: 29, subjectId: 3, name: '१. सर्वात्मका शिवसुंदरा (प्रार्थना)',           order:  1, isCustom: false },
        { id: 30, subjectId: 3, name: '२. संतवाणी — भेटीलागी जीवा / संतकृपा झाली',   order:  2, isCustom: false },
        { id: 31, subjectId: 3, name: '३. बेटा, मी ऐकतो आहे!',                        order:  3, isCustom: false },
        { id: 32, subjectId: 3, name: '४. जी. आय. पी. रेल्वे',                        order:  4, isCustom: false },
        { id: 33, subjectId: 3, name: '(स्थूलवाचन) काझीरंगा',                         order:  5, isCustom: false },
        { id: 34, subjectId: 3, name: '५. व्यायामाचे महत्त्व (कविता)',                 order:  6, isCustom: false },
        { id: 35, subjectId: 3, name: '६. ऑलिंपिक वर्तुळांचा गोफ',                   order:  7, isCustom: false },
        { id: 36, subjectId: 3, name: '७. दिव्याच्या शोधामागचे दिव्य',                order:  8, isCustom: false },
        { id: 37, subjectId: 3, name: '८. सखू आजी',                                    order:  9, isCustom: false },
        { id: 38, subjectId: 3, name: '(स्थूलवाचन) हास्यचित्रांतली मुलं',             order: 10, isCustom: false },
        { id: 39, subjectId: 3, name: '९. उजाड उघडे माळरानही (कविता)',                 order: 11, isCustom: false },
        { id: 40, subjectId: 3, name: '१०. कुलूप',                                     order: 12, isCustom: false },
        { id: 41, subjectId: 3, name: '११. आभाळातल्या पाऊलवाटा',                       order: 13, isCustom: false },
        { id: 42, subjectId: 3, name: '१२. पुन्हा एकदा (कविता)',                       order: 14, isCustom: false },

        /* Science — Exploration (subjectId: 4) */
        { id: 43, subjectId: 4, name: 'Chapter 1 — Exploration: Entering the World of Secondary Science', order:  1, isCustom: false },
        { id: 44, subjectId: 4, name: 'Chapter 2 — The Building Blocks of Life',       order:  2, isCustom: false },
        { id: 45, subjectId: 4, name: 'Chapter 3 — Tissues in Action',                 order:  3, isCustom: false },
        { id: 46, subjectId: 4, name: 'Chapter 4 — Describing Motion Around Us',       order:  4, isCustom: false },
        { id: 47, subjectId: 4, name: 'Chapter 5 — Exploring Mixtures and Their Separation', order: 5, isCustom: false },
        { id: 48, subjectId: 4, name: 'Chapter 6 — How Forces Affect Motion',          order:  6, isCustom: false },
        { id: 49, subjectId: 4, name: 'Chapter 7 — Work, Energy, and Simple Machines', order:  7, isCustom: false },
        { id: 50, subjectId: 4, name: 'Chapter 8 — Journey Inside the Atom',           order:  8, isCustom: false },
        { id: 51, subjectId: 4, name: 'Chapter 9 — Atomic Foundations of Matter',      order:  9, isCustom: false },
        { id: 52, subjectId: 4, name: 'Chapter 10 — Sound Waves: Characteristics and Applications', order: 10, isCustom: false },
        { id: 53, subjectId: 4, name: 'Chapter 11 — Reproduction: How Life Continues', order: 11, isCustom: false },
        { id: 54, subjectId: 4, name: 'Chapter 12 — Patterns in Life: Diversity and Classification', order: 12, isCustom: false },
        { id: 55, subjectId: 4, name: 'Chapter 13 — Earth as a System: Energy, Matter, and Life', order: 13, isCustom: false },

        /* Mathematics — Ganita Manjari (subjectId: 5) */
        { id: 56, subjectId: 5, name: 'Chapter 1 — The World of Numbers',              order:  1, isCustom: false },
        { id: 57, subjectId: 5, name: 'Chapter 2 — The Use of Coordinates',            order:  2, isCustom: false },
        { id: 58, subjectId: 5, name: 'Chapter 3 — Introduction to Linear Polynomials',order:  3, isCustom: false },
        { id: 59, subjectId: 5, name: 'Chapter 4 — Exploring Algebraic Identities',    order:  4, isCustom: false },
        { id: 60, subjectId: 5, name: "Chapter 5 — I'm Up and Down, and Round and Round", order: 5, isCustom: false },
        { id: 61, subjectId: 5, name: 'Chapter 6 — Measuring Space: Perimeter and Area', order: 6, isCustom: false },
        { id: 62, subjectId: 5, name: 'Chapter 7 — The Mathematics of Maybe: Introduction to Probability', order: 7, isCustom: false },
        { id: 63, subjectId: 5, name: 'Chapter 8 — Exploring Sequences and Progressions', order: 8, isCustom: false },

        /* Social Science (subjectId: 6) */
        { id: 64, subjectId: 6, name: 'Chapter 1 — Understanding Social Science',      order:  1, isCustom: false },
        { id: 65, subjectId: 6, name: "Chapter 2 — Shaping of the Earth's Surface",    order:  2, isCustom: false },
        { id: 66, subjectId: 6, name: 'Chapter 3 — Atmosphere and Climate',            order:  3, isCustom: false },
        { id: 67, subjectId: 6, name: 'Chapter 4 — Early Humans and Beginning of Civilization', order: 4, isCustom: false },
        { id: 68, subjectId: 6, name: 'Chapter 5 — State and Society up to 1000 CE',   order:  5, isCustom: false },
        { id: 69, subjectId: 6, name: 'Chapter 6 — Understanding Democracy',           order:  6, isCustom: false },
        { id: 70, subjectId: 6, name: 'Chapter 7 — Elections',                         order:  7, isCustom: false },
        { id: 71, subjectId: 6, name: 'Chapter 8 — Building Blocks in Economics: The Problem of Choice', order: 8, isCustom: false },
        { id: 72, subjectId: 6, name: 'Chapter 9 — The Price Puzzle: What Drives the Market', order: 9, isCustom: false },

        /* Information Technology — Code 402 (subjectId: 7) */
        { id: 73, subjectId: 7, name: 'Part A · Unit 1 — Communication Skills',         order:  1, isCustom: false },
        { id: 74, subjectId: 7, name: 'Part A · Unit 2 — Self-Management Skills',        order:  2, isCustom: false },
        { id: 75, subjectId: 7, name: 'Part A · Unit 3 — Basic ICT Skills',              order:  3, isCustom: false },
        { id: 76, subjectId: 7, name: 'Part A · Unit 4 — Entrepreneurial Skills',        order:  4, isCustom: false },
        { id: 77, subjectId: 7, name: 'Part A · Unit 5 — Green Skills',                  order:  5, isCustom: false },
        { id: 78, subjectId: 7, name: 'Part B · Unit 1 — Introduction to IT-ITeS Industry', order: 6, isCustom: false },
        { id: 79, subjectId: 7, name: 'Part B · Unit 2 — Data Entry and Keyboarding Skills', order: 7, isCustom: false },
        { id: 80, subjectId: 7, name: 'Part B · Unit 3 — Digital Documentation',         order:  8, isCustom: false },
        { id: 81, subjectId: 7, name: 'Part B · Unit 4 — Electronic Spreadsheet',        order:  9, isCustom: false },
        { id: 82, subjectId: 7, name: 'Part B · Unit 5 — Digital Presentation',          order: 10, isCustom: false }
    ]
};

/* ─────────────────────────────────────────────────────────────
   PREVIOUS DATABASE BACKUP (23 Tasks + 9 Subjects)
   Can be restored automatically on empty first boot OR merged
   manually anytime via loadPreviousDatabase().
   ───────────────────────────────────────────────────────────── */
const BACKUP = {
    subjects: [
        { id: 1, name: 'English',                subtitle: 'Kaveri',                          icon: '📘', color: '#4A9EFF', order: 1 },
        { id: 2, name: 'Hindi',                  subtitle: 'Ganga (गंगा)',                    icon: '🪷', color: '#FF6B6B', order: 2 },
        { id: 3, name: 'Marathi',                subtitle: 'Aksharbharti (अक्षरभारती)',      icon: '📖', color: '#A78BFA', order: 3 },
        { id: 4, name: 'Science',                subtitle: 'Exploration',                     icon: '🔬', color: '#00D4AA', order: 4 },
        { id: 5, name: 'Mathematics',            subtitle: 'Ganita Manjari',                  icon: '📐', color: '#7C6FFF', order: 5 },
        { id: 6, name: 'Social Science',         subtitle: 'Understanding Society',           icon: '🌍', color: '#FFA502', order: 6 },
        { id: 7, name: 'Information Technology', subtitle: 'Code 402',                        icon: '💻', color: '#06B6D4', order: 7 },
        { id: 8, name: 'Art And Craft',          subtitle: '',                                icon: '🎨', color: '#ffa502', order: 8, isCustom: true },
        { id: 9, name: 'Physics Wallah',         subtitle: 'PW Lecture Viewinig Completion',  icon: '📖', color: '#06b6d4', order: 9, isCustom: true }
    ],
    chapters: SEED.chapters,
    tasks: [
        { title: 'Notes And NCERT Exercise 6.2 Questions', subjectId: 5, chapterId: 61, dueDate: '2026-07-31', priority: 'urgent', status: 'done',    notes: '',   imageData: null, createdAt: '2026-07-30T16:05:56.903Z', id: 1 },
        { title: 'Revise Chapter 6',                        subjectId: 4, chapterId: 48, dueDate: '2026-08-01', priority: 'normal', status: 'done',    notes: '',   imageData: null, createdAt: '2026-08-01T03:05:47.209Z', id: 2 },
        { title: 'Read And Revise The Chapter',             subjectId: 2, chapterId: 26, dueDate: '2026-08-03', priority: 'normal', status: 'pending', notes: "The Chapter Highlights The Life Of Famous Indian Singer Lata Mangeshkar(Also Knows as India's Kokila) And The Life Struggles Of Her In A Podcast With Yatindra Mishra", imageData: null, createdAt: '2026-08-01T03:47:10.668Z', id: 3 },
        { title: 'Exercise And Pause And Ponder',           subjectId: 4, chapterId: 51, dueDate: '2026-08-02', priority: 'urgent', status: 'done',    notes: '',   imageData: null, createdAt: '2026-08-02T08:02:47.955Z', id: 4 },
        { title: 'Revise Maths For The Upcoming Weekly Test', subjectId: 5, chapterId: null, dueDate: '2026-08-02', priority: 'urgent', status: 'done', notes: '',   imageData: null, createdAt: '2026-08-02T13:12:06.020Z', id: 6 },
        { title: 'ESP32 Project',                           subjectId: 7, chapterId: null, dueDate: '2026-08-02', priority: 'normal', status: 'done',   notes: '',   imageData: null, createdAt: '2026-08-02T15:16:02.812Z', id: 7 },
        { title: 'Internal Assesment',                      subjectId: 2, chapterId: null, dueDate: '2026-08-03', priority: 'urgent', status: 'pending', notes: '',  imageData: null, createdAt: '2026-08-03T14:11:10.541Z', id: 8 },
        { title: 'Intermediate Examination Prep',           subjectId: null, chapterId: null, dueDate: '2026-09-25', priority: 'normal', status: 'pending', notes: null, imageData: null, isGeneral: true, category: 'reminder', createdAt: '2026-08-03T15:49:31.143Z', id: 9 },
        { title: 'ESP 32 Project PD Git Link',              subjectId: 7, chapterId: null, dueDate: '2026-08-04', priority: 'urgent', status: 'done',   notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-03T15:51:21.527Z', id: 10 },
        { title: 'Independence Day Speech',                 subjectId: null, chapterId: null, dueDate: '2026-08-14', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: true, category: 'general', createdAt: '2026-08-04T10:05:44.927Z', id: 11 },
        { title: 'Exercise 6.3',                            subjectId: 5, chapterId: 61, dueDate: '2026-08-05', priority: 'urgent', status: 'done',    notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-04T10:30:42.976Z', id: 12 },
        { title: 'ESP32 Arduino Code Change',               subjectId: null, chapterId: null, dueDate: '2026-08-04', priority: 'urgent', status: 'done', notes: null, imageData: null, isGeneral: true, category: 'reminder', createdAt: '2026-08-04T15:43:56.719Z', id: 13 },
        { title: 'Hindi Exercise',                          subjectId: 2, chapterId: 28, dueDate: '2026-08-04', priority: 'urgent', status: 'done',    notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-04T15:45:04.157Z', id: 14 },
        { title: 'Motor Driver Assembly',                   subjectId: null, chapterId: null, dueDate: '2026-08-05', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: true, category: 'reminder', createdAt: '2026-08-05T13:51:59.271Z', id: 15 },
        { title: 'End Of Chapter Exercise',                 subjectId: 5, chapterId: 61, dueDate: '2026-08-10', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:52:47.851Z', id: 16 },
        { title: 'Teachers Notes',                          subjectId: 5, chapterId: 62, dueDate: '2026-08-05', priority: 'urgent', status: 'done',    notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:53:23.965Z', id: 17 },
        { title: 'Lab Journal',                             subjectId: 5, chapterId: null, dueDate: '2026-08-07', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:53:59.950Z', id: 18 },
        { title: 'Chapter Exercise',                        subjectId: 1, chapterId: 4,  dueDate: '2026-08-05', priority: 'urgent', status: 'done',    notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:54:36.674Z', id: 19 },
        { title: 'Poem Exercise',                           subjectId: 1, chapterId: 12, dueDate: '2026-08-05', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:55:02.249Z', id: 20 },
        { title: 'Notebook Completion',                     subjectId: 1, chapterId: null, dueDate: '2026-08-05', priority: 'urgent', status: 'done',  notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:55:23.945Z', id: 21 },
        { title: 'Exercise Completion',                     subjectId: 7, chapterId: 80, dueDate: '2026-08-05', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T13:56:07.045Z', id: 22 },
        { title: 'Chemistry Practice Sheet',                subjectId: 4, chapterId: 51, dueDate: '2026-08-07', priority: 'normal', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-05T14:57:06.952Z', id: 23 },
        { title: 'Internal Assessment Speech',              subjectId: 1, chapterId: null, dueDate: '2026-08-06', priority: 'urgent', status: 'pending', notes: null, imageData: null, isGeneral: false, createdAt: '2026-08-06T14:29:39.853Z', id: 24 }
    ],
    streak: [
        { id: 'main', count: 6, best: 6, lastActiveDate: '2026-08-06' }
    ],
    settings: [
        { key: 'examCountdowns', value: [
            { name: 'RT 02',                      date: '2026-08-24', id: 'msettvvz2ve0it8j8jk' },
            { name: 'PT-2',                       date: '2026-09-01', id: 'msg6dga0s8yalvykba'  },
            { name: 'Completion Form Submission', date: '2026-08-20', id: 'mshnul2gnl6a9ozhr7' }
        ]},
        { key: 'seeded_v2', value: true }
    ],
    chapterProgress: []
};

/* ─────────────────────────────────────────────────────────────
   4. SOCRATIC THINKING COACH QUESTION BANK (SF_CHALLENGES)
   ───────────────────────────────────────────────────────────── */
const SF_CHALLENGES = {
    bank: {
        43: [
            ['A friend says: "I saw it happen once, so it is a scientific fact." What is missing before it counts as science?',
             'Repeatability, controlled variables, and measurements that others can verify independently.',
             'What if a hundred people saw it, but nobody measured anything?'],
            ['Why do scientists change only one variable at a time in an experiment?',
             'So any change in the outcome can be linked directly to that single variable.',
             'Can you think of a real-world test where keeping everything else constant is difficult?'],
            ['Why must every measurement have both a unit and an idea of accuracy?',
             'A number without a unit is ambiguous, and accuracy tells others how much to trust the instrument.',
             'What goes wrong if one engineering team uses metres and another uses feet?']
        ],
        44: [
            ['Why is the cell called the basic unit of life? Give one strong reason and one edge case.',
             'All living organisms are made of cells and every life process happens inside cells. Viruses are the classic edge case because they lack cellular structure and need a host cell to reproduce.',
             'Does the existence of viruses change how we define "living"?'],
            ['What is the deepest difference between prokaryotic and eukaryotic cells?',
             'Eukaryotes have a membrane-bound nucleus and specialized organelles, allowing division of biochemical labour.',
             'What would a cell lose if it had no internal compartments at all?'],
            ['If a cell suddenly lost its mitochondria, which cellular processes would stop first?',
             'ATP energy-dependent tasks like active transport, protein synthesis, and movement would fail first.',
             'Which cells in the human body have the highest concentration of mitochondria?']
        ],
        46: [
            ['A runner completes one full lap of a 400 m track. What are her distance and displacement?',
             'Distance is 400 m; displacement is 0 m because start and end positions coincide.',
             'Can the magnitude of displacement ever be greater than distance travelled?'],
            ['A car moves at a steady 60 km/h around a circular turn. Is its velocity constant?',
             'No. Velocity is a vector (speed + direction). Because direction is constantly changing, the car is accelerating.',
             'Where is the acceleration vector pointing during circular motion?'],
            ['On a distance-time graph, what does an upward-curving line represent?',
             'Increasing slope means increasing speed, which indicates positive acceleration.',
             'What would a horizontal flat line on a distance-time graph mean?']
        ],
        48: [
            ['Why do passengers lurch forward when a TATA Magic van or bus brakes suddenly?',
             'By Newton’s First Law (Inertia of Motion), the lower body slows with the vehicle while the upper body continues moving forward.',
             'How does a seatbelt use time to reduce the force experienced by the passenger?'],
            ['A heavy truck and a small car collide head-on. Which experiences the greater force?',
             'Both experience the exact same magnitude of force (Newton’s Third Law), but the smaller mass of the car suffers a much larger acceleration (a = F/m).',
             'Why do modern vehicles have crumple zones instead of rigid steel fronts?']
        ],
        51: [
            ['Wood burns in an open dish and the remaining ash weighs much less than the original wood. Was mass destroyed?',
             'No. By the Law of Conservation of Mass, carbon dioxide and water vapour escaped into the air. In a sealed vessel total mass remains unchanged.',
             'How would you design a simple school lab setup to prove the gas has mass?']
        ],
        56: [
            ['Is 0.999… (repeating forever) strictly equal to 1? Prove it algebraically.',
             'Yes. Let x = 0.999… Then 10x = 9.999… Subtracting gives 9x = 9, so x = 1.',
             'What does this show about decimal representations of real numbers?'],
            ['Why is √2 irrational? State the core contradiction in the proof.',
             'Assuming √2 = p/q in lowest terms implies both p and q are even, contradicting that p/q had no common factors.',
             'Why does that proof fail if you try it on √4?']
        ],
        61: [
            ['Two rectangles have the exact same perimeter but different areas. Which shape maximizes the area?',
             'Perimeter sums the sides while area multiplies them. A square maximizes the area for any given 4-sided perimeter.',
             'If you can bend a wire into any closed 2D shape, which shape gives the maximum area?'],
            ['If every side of a triangle is doubled, what happens to its perimeter and its area?',
             'Perimeter doubles (2×), while area quadruples (2² = 4×) because area scales with the square of linear dimensions.',
             'What happens to the volume of a cube if its edge length is doubled?']
        ]
    },
    generic: {
        prose: [
            ['In your own words, state the central idea of "{t}". What is the strongest counter-perspective a reader could raise?',
             'A strong answer states the core theme in 1–2 sentences, backs it with a specific scene from the chapter, and addresses an alternative viewpoint.',
             'If the ending of "{t}" changed, would the central message still stand?'],
            ['Pick the key character or narrator in "{t}". What motivates them, and what obstacle tests their character?',
             'Name the clear motivation, the main conflict, and cite a concrete turning point from the text.',
             'What decision in the chapter reveals the character’s true values?']
        ],
        poetry: [
            ['Beneath the surface imagery, what is the deeper emotion or truth of the poem "{t}"?',
             'Separate the literal description from the deeper philosophical message, quoting one key image or metaphor.',
             'How does the mood shift from the opening lines to the final stanza?']
        ],
        hindi: [
            ['"{t}" पाठ का मुख्य भाव अपने शब्दों में स्पष्ट कीजिए और पाठ से एक ठोस उदाहरण दीजिए।',
             'अच्छे उत्तर में लेखक का मूल संदेश, पात्रों का दृष्टिकोण और आज के जीवन से उसका संबंध शामिल होता है।',
             'यदि इस पाठ की परिस्थिति आज के समय में होती, तो परिणाम क्या होता?']
        ],
        marathi: [
            ['"{t}" या पाठाचा/कवितेचा मध्यवर्ती विचार स्वतःच्या शब्दांत लिहा आणि पाठातील एका प्रसंगाचा संदर्भ द्या.',
             'उत्तम उत्तरात मुख्य आशय, लेखकाचा किंवा कवीचा दृष्टिकोन आणि त्यातून मिळणारा संदेश स्पष्ट केलेला असतो.',
             'या पाठातील शिकवण तुमच्या दैनंदिन जीवनात कुठे लागू पडते?']
        ],
        any: [
            ['Explain the core concept of "{t}" as if teaching a Grade 8 student. Where is the most common point of confusion?',
             'Use clear, jargon-free logic, state the fundamental rule or formula, and give one real-world application.',
             'What breaks or fails if the main assumption of "{t}" is removed?'],
            ['What is the #1 mistake students make in exam questions on "{t}", and how do you guard against it?',
             'Identify a specific conceptual trap, unit error, or sign mistake, and state a verification step.',
             'Can you construct a quick example that tests that exact trap?']
        ]
    }
};

/* ─────────────────────────────────────────────────────────────
   5. INITIAL RESTORE & MANUAL PREVIOUS-DB LOADER
   ───────────────────────────────────────────────────────────── */
async function restoreBackup() {
    try {
        const existingTasks = await DB.getAll('tasks');
        const alreadyRestored = await DB.getSetting('restored_v1');

        if ((existingTasks && existingTasks.length > 0) || alreadyRestored) {
            /* Ensure all 82 NCERT chapters exist even if user DB was partially seeded */
            const chaps = await DB.getAll('chapters');
            if (!chaps || chaps.length < 82) {
                for (const ch of SEED.chapters) await DB.put('chapters', ch);
            }
            return;
        }

        console.log('[StudyFlow] First launch: seeding database with user backup…');
        await DB.importBackup(BACKUP, 'merge');
        await DB.setSetting('restored_v1', true);
        await DB.setSetting('seeded_v2', true);
    } catch (err) {
        console.error('[StudyFlow] restoreBackup error:', err);
    }
}

async function seedDatabase() {
    const seeded = await DB.getSetting('seeded_v2');
    const subjs  = await DB.getAll('subjects');
    if (seeded && subjs && subjs.length > 0) return;

    for (const subj of BACKUP.subjects) await DB.put('subjects', subj);
    for (const ch of SEED.chapters)     await DB.put('chapters', ch);

    const streak = await DB.get('streak', 'main');
    if (!streak) {
        await DB.put('streak', { id: 'main', count: 0, best: 0, lastActiveDate: null });
    }
    await DB.setSetting('seeded_v2', true);
}

/* Manual trigger so user can always merge their previous 23-task DB anytime */
async function loadPreviousDatabase() {
    const res = await DB.importBackup(BACKUP, 'merge');
    return res;
}

window.SF_DATA        = SF_DATA;
window.SF_CHALLENGES  = SF_CHALLENGES;
window.SEED           = SEED;
window.BACKUP         = BACKUP;
window.loadPreviousDatabase = loadPreviousDatabase;