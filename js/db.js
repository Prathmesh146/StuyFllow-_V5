/* ============================================================
   STUDYFLOW V4 FLAGSHIP  |  js/db.js
   Dynamic IndexedDB Engine, Local IST Dates, Safe Merge/Replace
   Backup Suite, Auto Safety Snapshot & Idempotent ISRO XP Sync
   ============================================================ */
'use strict';

const DB = (() => {
    const DB_NAME = 'StudyFlowDB_v2';
    const REQUIRED_STORES = [
        'subjects',
        'chapters',
        'chapterProgress',
        'tasks',
        'streak',
        'settings',
        'flashcards'
    ];

    let _db = null;
    let _safetyTimer = null;

    /* ══════════════════════════════════════════
       1. LOCAL IST DATE UTILITIES (No UTC Drift)
    ══════════════════════════════════════════ */
    function fmtDate(d) {
        const dt = (d instanceof Date) ? d : new Date(d);
        if (isNaN(dt.getTime())) return todayStr();
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function todayStr() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /* ══════════════════════════════════════════
       2. FLEXIBLE DATABASE OPEN & STORE UPGRADE
    ══════════════════════════════════════════ */
    function _createMissingStores(db) {
        if (!db.objectStoreNames.contains('subjects')) {
            const s = db.createObjectStore('subjects', { keyPath: 'id' });
            s.createIndex('order', 'order', { unique: false });
        }
        if (!db.objectStoreNames.contains('chapters')) {
            const c = db.createObjectStore('chapters', { keyPath: 'id', autoIncrement: true });
            c.createIndex('subjectId', 'subjectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('chapterProgress')) {
            db.createObjectStore('chapterProgress', { keyPath: 'chapterId' });
        }
        if (!db.objectStoreNames.contains('tasks')) {
            const t = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            t.createIndex('subjectId', 'subjectId', { unique: false });
            t.createIndex('dueDate',   'dueDate',   { unique: false });
            t.createIndex('status',    'status',    { unique: false });
            t.createIndex('priority',  'priority',  { unique: false });
        }
        if (!db.objectStoreNames.contains('streak')) {
            db.createObjectStore('streak', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('flashcards')) {
            const fc = db.createObjectStore('flashcards', { keyPath: 'id', autoIncrement: true });
            fc.createIndex('subjectId', 'subjectId', { unique: false });
            fc.createIndex('dueDate',   'dueDate',   { unique: false });
        }
    }

    function init() {
        return new Promise((resolve, reject) => {
            if (_db) { resolve(_db); return; }

            /* Open without version number first so any existing DB version opens cleanly */
            const req = indexedDB.open(DB_NAME);

            req.onupgradeneeded = (e) => {
                _createMissingStores(e.target.result);
            };

            req.onsuccess = (e) => {
                const db = e.target.result;
                const missing = REQUIRED_STORES.some(name => !db.objectStoreNames.contains(name));

                if (!missing) {
                    _db = db;
                    _requestPersistentStorage();
                    resolve(_db);
                    return;
                }

                /* If an older version is missing a store (e.g. flashcards), bump version +1 safely */
                const nextVersion = db.version + 1;
                db.close();

                const upReq = indexedDB.open(DB_NAME, nextVersion);
                upReq.onupgradeneeded = (ev) => {
                    _createMissingStores(ev.target.result);
                };
                upReq.onsuccess = (ev) => {
                    _db = ev.target.result;
                    _requestPersistentStorage();
                    resolve(_db);
                };
                upReq.onerror = (ev) => reject(ev.target.error);
            };

            req.onerror = (e) => reject(e.target.error);
        });
    }

    function _requestPersistentStorage() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                navigator.storage.persist().catch(() => {});
            }
        } catch (_) {}
    }

    /* ══════════════════════════════════════════
       3. CORE TRANSACTION & CRUD HELPERS
    ══════════════════════════════════════════ */
    function _tx(store, mode, fn) {
        return new Promise((resolve, reject) => {
            if (!_db) { reject(new Error('Database not initialised')); return; }
            const tx = _db.transaction(store, mode);
            const st = tx.objectStore(store);
            let req;
            try {
                req = fn(st);
            } catch (err) {
                try { tx.abort(); } catch (_) {}
                reject(err);
                return;
            }
            if (mode === 'readonly') {
                req.onsuccess = () => resolve(req.result);
                req.onerror   = () => reject(req.error);
            } else {
                tx.oncomplete = () => {
                    _scheduleSafetySnapshot();
                    resolve(req ? req.result : undefined);
                };
                tx.onerror = () => reject(tx.error || (req && req.error));
                tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
            }
        });
    }

    function getAll(storeName) {
        return _tx(storeName, 'readonly', s => s.getAll());
    }

    function get(storeName, key) {
        return _tx(storeName, 'readonly', s => s.get(key));
    }

    function getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            if (!_db) { resolve([]); return; }
            const tx  = _db.transaction(storeName, 'readonly');
            const st  = tx.objectStore(storeName);
            const idx = st.index(indexName);
            const req = idx.getAll(value);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror   = () => reject(req.error);
        });
    }

    function put(storeName, data) {
        return _tx(storeName, 'readwrite', s => s.put(data));
    }

    function del(storeName, key) {
        return _tx(storeName, 'readwrite', s => s.delete(key));
    }

    /* ─── Settings Helpers ─── */
    function getSetting(key) {
        return get('settings', key).then(r => (r ? r.value : null)).catch(() => null);
    }

    function setSetting(key, value) {
        return put('settings', { key, value });
    }

    /* ══════════════════════════════════════════
       4. EXAM COUNTDOWN HELPERS (Multi-Day Aware)
    ══════════════════════════════════════════ */
    async function getExams() {
        const v = await getSetting('examCountdowns');
        if (!Array.isArray(v)) return [];
        return v.map(e => ({
            ...e,
            startDate: e.startDate || e.date,
            endDate:   e.endDate   || e.startDate || e.date,
            date:      e.date      || e.startDate
        }));
    }

    async function saveExam(examObj) {
        const exams = await getExams();
        if (!examObj.id) {
            examObj.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        }
        const start = examObj.startDate || examObj.date;
        const end   = examObj.endDate && examObj.endDate >= start ? examObj.endDate : start;
        const normalized = {
            id:        examObj.id,
            name:      examObj.name,
            date:      start,
            startDate: start,
            endDate:   end
        };
        const idx = exams.findIndex(e => e.id === normalized.id);
        if (idx >= 0) exams[idx] = normalized;
        else exams.push(normalized);
        await setSetting('examCountdowns', exams);
        return normalized;
    }

    async function deleteExam(examId) {
        const exams = await getExams();
        await setSetting('examCountdowns', exams.filter(e => e.id !== examId));
    }

    /* ══════════════════════════════════════════
       5. STREAK ENGINE (Effective Streak + Best)
    ══════════════════════════════════════════ */
    async function getStreak() {
        const s = await get('streak', 'main') || { id: 'main', count: 0, best: 0, lastActiveDate: null };
        const today = todayStr();
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        const yesterday = fmtDate(yDate);

        const isAlive = (s.lastActiveDate === today || s.lastActiveDate === yesterday);
        const effectiveCount = isAlive ? (s.count || 0) : 0;
        const best = Math.max(s.best || 0, s.count || 0);

        return {
            id: 'main',
            count: effectiveCount,
            rawCount: s.count || 0,
            best,
            lastActiveDate: s.lastActiveDate || null
        };
    }

    async function updateStreak() {
        const today = todayStr();
        const raw = await get('streak', 'main') || { id: 'main', count: 0, best: 0, lastActiveDate: null };

        if (raw.lastActiveDate === today) {
            return getStreak();
        }

        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        const yesterday = fmtDate(yDate);

        if (raw.lastActiveDate === yesterday) {
            raw.count = (raw.count || 0) + 1;
        } else {
            raw.count = 1;
        }

        raw.best = Math.max(raw.best || 0, raw.count);
        raw.lastActiveDate = today;
        await put('streak', raw);
        return getStreak();
    }

    /* ══════════════════════════════════════════
       6. IDEMPOTENT ISRO XP & GAMIFICATION SYNC
    ══════════════════════════════════════════ */
    async function syncXP() {
        const [tasks, subjects, progress, focusLog, xpRecord] = await Promise.all([
            getAll('tasks'),
            getAll('subjects'),
            getAll('chapterProgress'),
            getSetting('sf_focusLog'),
            getSetting('sf_xp')
        ]);

        const awarded = (xpRecord && xpRecord.awarded) ? { ...xpRecord.awarded } : {};
        let total = 0;
        const tracks = {
            Logic: 0,
            Discovery: 0,
            Language: 0,
            Society: 0,
            Tech: 0,
            Creative: 0,
            Focus: 0
        };

        const subjMap = {};
        for (const s of subjects) subjMap[s.id] = s.name.toLowerCase();

        function getTrackForSubject(subjectId) {
            const name = subjMap[subjectId] || '';
            if (name.includes('math')) return 'Logic';
            if (name.includes('science') || name.includes('physics') || name.includes('chem') || name.includes('bio')) return 'Discovery';
            if (name.includes('english') || name.includes('hindi') || name.includes('marathi') || name.includes('sanskrit')) return 'Language';
            if (name.includes('social') || name.includes('hist') || name.includes('geo')) return 'Society';
            if (name.includes('tech') || name.includes('it') || name.includes('comp') || name.includes('code')) return 'Tech';
            if (name.includes('art') || name.includes('draw') || name.includes('craft')) return 'Creative';
            return 'Focus';
        }

        /* 1. Completed Tasks */
        for (const t of tasks) {
            if (t.status === 'done') {
                const key = `t:${t.id}`;
                const pts = t.isGeneral ? 10 : (t.priority === 'urgent' ? 35 : 20);
                awarded[key] = pts;
                const trk = t.isGeneral ? 'Focus' : getTrackForSubject(t.subjectId);
                tracks[trk] = (tracks[trk] || 0) + pts;
            }
        }

        /* 2. Chapter Progress Subtasks & Mastered Status */
        const chapters = await getAll('chapters');
        const chapSubjMap = {};
        for (const c of chapters) chapSubjMap[c.id] = c.subjectId;

        for (const p of progress) {
            const trk = getTrackForSubject(chapSubjMap[p.chapterId]);
            ['taught', 'classwork', 'homework', 'revision'].forEach(step => {
                if (p[step]) {
                    const key = `s:${p.chapterId}:${step}`;
                    awarded[key] = 10;
                    tracks[trk] = (tracks[trk] || 0) + 10;
                }
            });
            if (p.mastered) {
                const mKey = `m:${p.chapterId}`;
                awarded[mKey] = 100;
                tracks[trk] = (tracks[trk] || 0) + 100;
            }
        }

        /* 3. Completed Focus Sessions */
        if (Array.isArray(focusLog)) {
            for (const sess of focusLog) {
                if (sess && sess.at) {
                    const fKey = `f:${sess.at}`;
                    const pts = Math.round((sess.minutes || 25) * 1.6);
                    awarded[fKey] = pts;
                    tracks.Focus += pts;
                }
            }
        }

        total = Object.values(awarded).reduce((sum, v) => sum + (Number(v) || 0), 0);

        const ranks = (window.SF_DATA && SF_DATA.ranks) ? SF_DATA.ranks : [
            { xp: 0,    emoji: '🛸', name: 'Aeronautical Trainee' },
            { xp: 500,  emoji: '🚀', name: 'Payload Specialist' },
            { xp: 1500, emoji: '🛰️', name: 'Orbital Engineer' },
            { xp: 3000, emoji: '🌌', name: 'Flight Director' },
            { xp: 5000, emoji: '⭐', name: 'ISRO Mission Commander' }
        ];

        let currentRank = ranks[0];
        let nextRank = null;
        for (let i = 0; i < ranks.length; i++) {
            if (total >= ranks[i].xp) {
                currentRank = ranks[i];
                nextRank = ranks[i + 1] || null;
            }
        }

        const pctToNext = nextRank
            ? Math.min(100, Math.round(((total - currentRank.xp) / (nextRank.xp - currentRank.xp)) * 100))
            : 100;

        const updatedXP = { total, awarded, tracks, rank: currentRank, nextRank, pctToNext };
        await setSetting('sf_xp', updatedXP);
        _updateHeaderMissionUI(updatedXP);
        return updatedXP;
    }

    function _updateHeaderMissionUI(xpInfo) {
        if (!xpInfo) return;
        const emojiEl = document.getElementById('rank-emoji');
        const nameEl  = document.getElementById('rank-name');
        const xpEl    = document.getElementById('xp-count');
        const barEl   = document.getElementById('xp-bar-fill');

        if (emojiEl) emojiEl.textContent = xpInfo.rank.emoji;
        if (nameEl)  nameEl.textContent  = xpInfo.rank.name.replace('Aeronautical ', '').replace('ISRO ', '');
        if (xpEl)    xpEl.textContent    = `${xpInfo.total} XP`;
        if (barEl)   barEl.style.width   = `${ Math.max(8, xpInfo.pctToNext) }%`;
    }

    /* ══════════════════════════════════════════
       7. EXPORT, SAFE MERGE & REPLACE RESTORE
    ══════════════════════════════════════════ */
    async function exportAll() {
        const [subjects, chapters, chapterProgress, tasks, streak, settings, flashcards] = await Promise.all([
            getAll('subjects'),
            getAll('chapters'),
            getAll('chapterProgress'),
            getAll('tasks'),
            getAll('streak'),
            getAll('settings'),
            getAll('flashcards')
        ]);
        return {
            app: 'StudyFlow',
            format: 4,
            exportedAt: new Date().toISOString(),
            subjects,
            chapters,
            chapterProgress,
            tasks,
            streak,
            settings,
            flashcards
        };
    }

    async function downloadBackup(customPrefix = 'studyflow-backup') {
        const data = await exportAll();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${customPrefix}-${todayStr()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        await setSetting('sf_lastBackupAt', new Date().toISOString());
        return data;
    }

    /* Import / Restore Backup in 'merge' (non-destructive) or 'replace' mode */
    async function importBackup(data, mode = 'merge') {
        if (!data || (!Array.isArray(data.tasks) && !Array.isArray(data.subjects))) {
            throw new Error('Invalid backup file: missing tasks or subjects array.');
        }

        if (mode === 'replace') {
            /* Clear and write fresh */
            const stores = ['subjects', 'chapters', 'chapterProgress', 'tasks', 'streak', 'settings', 'flashcards'];
            for (const stName of stores) {
                if (!Array.isArray(data[stName])) continue;
                const existing = await getAll(stName);
                const keyField = stName === 'chapterProgress' ? 'chapterId' : (stName === 'settings' ? 'key' : 'id');
                for (const item of existing) {
                    if (item[keyField] !== undefined) await del(stName, item[keyField]);
                }
                for (const record of data[stName]) {
                    await put(stName, record);
                }
            }
            await setSetting('restored_v1', true);
            await setSetting('seeded_v2', true);
            await syncXP();
            return { mode: 'replace', importedTasks: (data.tasks || []).length };
        }

        /* DEFAULT: NON-DESTRUCTIVE SMART MERGE */
        const existingSubjects = await getAll('subjects');
        const existingChapters = await getAll('chapters');
        const existingTasks    = await getAll('tasks');
        const existingProgress = await getAll('chapterProgress');

        /* 1. Merge Subjects */
        if (Array.isArray(data.subjects)) {
            for (const s of data.subjects) {
                if (!s || !s.name) continue;
                const found = existingSubjects.find(ex => ex.id === s.id);
                if (!found) {
                    await put('subjects', s);
                    existingSubjects.push(s);
                }
            }
        }

        /* 2. Merge Chapters */
        if (Array.isArray(data.chapters)) {
            for (const c of data.chapters) {
                if (!c || !c.name) continue;
                const found = existingChapters.find(ex => ex.id === c.id);
                if (!found) {
                    await put('chapters', c);
                    existingChapters.push(c);
                }
            }
        }

        /* 3. Merge Chapter Progress with boolean OR */
        if (Array.isArray(data.chapterProgress)) {
            for (const cp of data.chapterProgress) {
                if (!cp || !cp.chapterId) continue;
                const cur = existingProgress.find(ex => ex.chapterId === cp.chapterId) || { chapterId: cp.chapterId };
                const merged = {
                    ...cur,
                    ...cp,
                    taught:        Boolean(cur.taught    || cp.taught),
                    classwork:     Boolean(cur.classwork || cp.classwork),
                    homework:      Boolean(cur.homework  || cp.homework),
                    revision:      Boolean(cur.revision  || cp.revision),
                    mastered:      Boolean(cur.mastered  || cp.mastered),
                    challengeBest: Math.max(cur.challengeBest || 0, cp.challengeBest || 0)
                };
                await put('chapterProgress', merged);
            }
        }

        /* 4. Merge Tasks (skip exact duplicates by title + dueDate + subjectId) */
        let addedTasks = 0;
        if (Array.isArray(data.tasks)) {
            let maxTaskId = existingTasks.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0);
            for (const incoming of data.tasks) {
                if (!incoming || !incoming.title) continue;
                const duplicate = existingTasks.find(ex =>
                    ex.id === incoming.id ||
                    (ex.title.trim().toLowerCase() === incoming.title.trim().toLowerCase() &&
                     (ex.dueDate || '') === (incoming.dueDate || '') &&
                     (ex.subjectId || null) === (incoming.subjectId || null))
                );

                if (duplicate) {
                    /* If incoming task is marked done and local was pending, keep done state */
                    if (incoming.status === 'done' && duplicate.status !== 'done') {
                        duplicate.status = 'done';
                        duplicate.completedAt = incoming.completedAt || new Date().toISOString();
                        await put('tasks', duplicate);
                    }
                } else {
                    const newId = incoming.id && !existingTasks.some(e => e.id === incoming.id)
                        ? Number(incoming.id)
                        : (++maxTaskId);
                    const cleanTask = {
                        ...incoming,
                        id: newId,
                        status: incoming.status === 'done' ? 'done' : 'pending',
                        priority: incoming.priority === 'urgent' ? 'urgent' : 'normal'
                    };
                    await put('tasks', cleanTask);
                    existingTasks.push(cleanTask);
                    addedTasks++;
                }
            }
        }

        /* 5. Merge Streak (keep highest count & latest date) */
        if (Array.isArray(data.streak) && data.streak[0]) {
            const incStreak = data.streak[0];
            const curStreak = await get('streak', 'main') || { id: 'main', count: 0, best: 0, lastActiveDate: null };
            const laterDate = (!curStreak.lastActiveDate || (incStreak.lastActiveDate && incStreak.lastActiveDate > curStreak.lastActiveDate))
                ? incStreak.lastActiveDate
                : curStreak.lastActiveDate;
            await put('streak', {
                id: 'main',
                count: Math.max(curStreak.count || 0, incStreak.count || 0),
                best:  Math.max(curStreak.best || 0, incStreak.best || 0, incStreak.count || 0),
                lastActiveDate: laterDate
            });
        }

        /* 6. Merge Settings & Exam Countdowns */
        if (Array.isArray(data.settings)) {
            for (const st of data.settings) {
                if (!st || !st.key || st.key === 'sf_xp') continue;
                if (st.key === 'examCountdowns' && Array.isArray(st.value)) {
                    for (const ex of st.value) await saveExam(ex);
                } else {
                    const existingVal = await getSetting(st.key);
                    if (existingVal === null || existingVal === undefined) {
                        await setSetting(st.key, st.value);
                    }
                }
            }
        }

        /* 7. Merge Flashcards */
        if (Array.isArray(data.flashcards)) {
            const existingCards = await getAll('flashcards');
            for (const fc of data.flashcards) {
                if (!fc || !fc.question) continue;
                const dup = existingCards.some(e => e.question.trim().toLowerCase() === fc.question.trim().toLowerCase());
                if (!dup) await put('flashcards', fc);
            }
        }

        await syncXP();
        return { mode: 'merge', importedTasks: addedTasks };
    }

    /* ─── Automatic LocalStorage Safety Snapshot ─── */
    function _scheduleSafetySnapshot() {
        if (_safetyTimer) clearTimeout(_safetyTimer);
        _safetyTimer = setTimeout(async () => {
            try {
                const tasks = await getAll('tasks');
                const progress = await getAll('chapterProgress');
                if (tasks.length === 0 && progress.length === 0) return;
                const compactTasks = tasks.map(({ imageData, ...rest }) => rest);
                const snap = {
                    savedAt: new Date().toISOString(),
                    date: todayStr(),
                    tasks: compactTasks,
                    chapterProgress: progress
                };
                localStorage.setItem('sf_safety_v4', JSON.stringify(snap));
            } catch (_) {}
        }, 1500);
    }

    return {
        init,
        getAll,
        get,
        getByIndex,
        put,
        del,
        getSetting,
        setSetting,
        getStreak,
        updateStreak,
        syncXP,
        todayStr,
        fmtDate,
        getExams,
        saveExam,
        deleteExam,
        exportAll,
        downloadBackup,
        importBackup
    };
})();