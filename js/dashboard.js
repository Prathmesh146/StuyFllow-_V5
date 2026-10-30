/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/dashboard.js
   Parallel IndexedDB Reads, DocumentFragment Batching, Single
   Delegated Event Listeners, Multi-Day Exams, Overdue Drawer,
   Heavy+Light Pairing, Routine Matrix (IST) & 90-Day Heatmap
   ============================================================ */
'use strict';

const Dashboard = (() => {

    let _roadmapDayOffset = 0;
    let _doneListOpen     = false;
    let _overdueOpen      = false;
    let _delegationBound  = false;
    let _cachedTasks      = [];
    let _cachedSubjects   = [];
    let _cachedChapters   = [];

    /* ══════════════════════════════════════════
       1. ONE-TIME DELEGATED EVENT HANDLER
    ══════════════════════════════════════════ */
    function _bindDelegationOnce() {
        if (_delegationBound) return;
        const dashView = document.getElementById('view-dashboard');
        if (!dashView) return;
        _delegationBound = true;

        dashView.addEventListener('click', (e) => {
            /* 1. Task Checkbox Toggle */
            const checkWrap = e.target.closest('.task-checkbox-wrap');
            if (checkWrap) {
                e.stopPropagation();
                const card = checkWrap.closest('.task-card');
                const taskId = Number(card?.dataset.taskId);
                const task = _cachedTasks.find(t => t.id === taskId);
                if (task) {
                    const cb = checkWrap.querySelector('.task-checkbox');
                    toggleTaskDone(task, card, cb);
                }
                return;
            }

            /* 2. Task Card Click -> Detail Modal */
            const card = e.target.closest('.task-card');
            if (card) {
                const taskId = Number(card.dataset.taskId);
                const task = _cachedTasks.find(t => t.id === taskId);
                if (task) {
                    const subj = _cachedSubjects.find(s => s.id === task.subjectId);
                    const chap = _cachedChapters.find(c => c.id === task.chapterId);
                    openTaskDetail(task, subj, chap);
                }
                return;
            }

            /* 3. Subject Overview Row Click */
            const subjRow = e.target.closest('.subject-overview-item[data-subject-id]');
            if (subjRow) {
                const sid = Number(subjRow.dataset.subjectId);
                App.navigate('subjects');
                setTimeout(() => Subjects.openPanel(sid), 160);
                return;
            }

            /* 4. Overdue Drawer Toggle */
            if (e.target.closest('#overdue-toggle-btn')) {
                _overdueOpen = !_overdueOpen;
                document.getElementById('overdue-drawer')?.classList.toggle('hidden', !_overdueOpen);
                const btn = document.getElementById('overdue-toggle-btn');
                if (btn) btn.textContent = _overdueOpen ? 'Hide Backlog ▲' : 'View Backlog ▼';
                return;
            }

            /* 5. Completed Tasks Accordion Toggle */
            if (e.target.closest('#done-today-toggle')) {
                _doneListOpen = !_doneListOpen;
                document.getElementById('tasks-done-today')?.classList.toggle('hidden', !_doneListOpen);
                return;
            }

            /* 6. Roadmap Day Prev / Next */
            if (e.target.closest('#rm-prev-day')) {
                _roadmapDayOffset--;
                renderPriorityPairing();
                return;
            }
            if (e.target.closest('#rm-next-day')) {
                _roadmapDayOffset++;
                renderPriorityPairing();
                return;
            }

            /* 7. Exam Countdown Buttons */
            if (e.target.closest('#set-exam-btn') || e.target.closest('#exam-manage-btn')) {
                ExamModal.open();
            }
        });
    }

    /* ══════════════════════════════════════════
       2. PARALLEL DATA FETCH & BATCHED RENDER
    ══════════════════════════════════════════ */
    async function render() {
        _bindDelegationOnce();
        const today = DB.todayStr();

        const [tasks, subjects, chapters, chapterProgress, streak, exams] = await Promise.all([
            DB.getAll('tasks'),
            DB.getAll('subjects'),
            DB.getAll('chapters'),
            DB.getAll('chapterProgress'),
            DB.getStreak(),
            DB.getExams()
        ]);

        _cachedTasks    = tasks;
        _cachedSubjects = subjects;
        _cachedChapters = chapters;

        const subjMap = new Map(subjects.map(s => [s.id, s]));
        const chapMap = new Map(chapters.map(c => [c.id, c]));

        setGreeting();
        Quotes.render();

        /* Single-pass task partitioning */
        const todayTasks   = [];
        const overdueTasks = [];
        const pendingTasks = [];
        const pendingGen   = [];
        const allPending   = [];
        const doneTasks    = [];
        let scheduledTodayCount = 0;
        let scheduledTodayDone  = 0;

        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            const isDone = t.status === 'done';

            if (t.dueDate === today) {
                scheduledTodayCount++;
                if (isDone) scheduledTodayDone++;
            }

            if (isDone) {
                doneTasks.push(t);
            } else {
                allPending.push(t);
                if (t.dueDate && t.dueDate < today) overdueTasks.push(t);
                if (t.dueDate === today) {
                    todayTasks.push(t);
                } else if (t.isGeneral) {
                    pendingGen.push(t);
                } else {
                    pendingTasks.push(t);
                }
            }
        }

        /* Update Stat Numbers */
        setText('stat-today',    todayTasks.length);
        setText('stat-pending',  allPending.length);
        setText('stat-done',     doneTasks.length);
        setText('today-badge',   todayTasks.length);
        setText('pending-badge', pendingTasks.length);
        setText('general-badge', pendingGen.length);
        setText('done-badge',    doneTasks.length);

        /* Progress Rings */
        renderWeeklyRing(tasks);
        renderSyllabusRing(chapters, chapterProgress);

        /* Sections */
        renderOverdueBacklog(overdueTasks, subjMap, chapMap);
        renderPriorityPairing();
        renderTaskSection('tasks-today',   'today-empty',   todayTasks,   subjMap, chapMap);
        renderTaskSection('tasks-pending', 'pending-empty', pendingTasks, subjMap, chapMap);
        renderTaskSection('tasks-general', 'general-empty', pendingGen,   subjMap, chapMap);
        renderDoneSection(doneTasks, subjMap, chapMap);

        /* Right-Column Intelligence */
        renderRoutineMatrix(allPending);
        renderSubjectOverview(subjects, chapters, chapterProgress, tasks);
        renderHeatmap(tasks);
        renderExamCountdownSync(exams, today);

        /* Gold Star Perfect Day Banner */
        const goldBadge = document.getElementById('gold-badge');
        if (goldBadge) {
            const isPerfect = scheduledTodayCount > 0 && scheduledTodayDone === scheduledTodayCount;
            goldBadge.classList.toggle('hidden', !isPerfect);
        }

        App.updateStreakUI(streak);
        DB.syncXP();
    }

    /* ══════════════════════════════════════════
       3. PROGRESS RINGS
    ══════════════════════════════════════════ */
    function renderWeeklyRing(tasks) {
        const now = new Date();
        const dow = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startStr = DB.fmtDate(startOfWeek);
        const endStr   = DB.fmtDate(endOfWeek);

        let total = 0, done = 0;
        for (let i = 0; i < tasks.length; i++) {
            const d = tasks[i].dueDate;
            if (d && d >= startStr && d <= endStr) {
                total++;
                if (tasks[i].status === 'done') done++;
            }
        }
        const pct = total ? Math.round((done / total) * 100) : 0;
        _setRing('weekly-ring-fill', 'weekly-ring-pct', pct);
    }

    function renderSyllabusRing(chapters, chapterProgress) {
        const totalSteps = (chapters.length || 82) * 4;
        let doneSteps = 0;
        for (let i = 0; i < chapterProgress.length; i++) {
            const p = chapterProgress[i];
            if (p.taught)    doneSteps++;
            if (p.classwork) doneSteps++;
            if (p.homework)  doneSteps++;
            if (p.revision)  doneSteps++;
        }
        const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
        _setRing('syllabus-ring-fill', 'syllabus-ring-pct', pct);
    }

    function _setRing(circleId, textId, pct) {
        const circ   = 99.9;
        const filled = (pct / 100) * circ;
        const ring   = document.getElementById(circleId);
        const txt    = document.getElementById(textId);
        const color  = pct >= 80 ? '#2ED573' : pct >= 40 ? '#7C6FFF' : '#00D4AA';

        if (ring) {
            ring.setAttribute('stroke-dasharray', `${filled} ${circ - filled}`);
            ring.setAttribute('stroke', color);
        }
        if (txt) {
            txt.textContent = `${pct}%`;
            txt.style.color = color;
        }
    }

    /* ══════════════════════════════════════════
       4. OVERDUE BACKLOG & PRIORITY PAIRING
    ══════════════════════════════════════════ */
    function renderOverdueBacklog(overdueTasks, subjMap, chapMap) {
        const banner  = document.getElementById('overdue-alert-banner');
        const drawer  = document.getElementById('overdue-drawer');
        const list    = document.getElementById('overdue-items-list');
        const countEl = document.getElementById('overdue-count-text');
        if (!banner || !list) return;

        if (overdueTasks.length === 0) {
            banner.classList.add('hidden');
            drawer?.classList.add('hidden');
            return;
        }

        banner.classList.remove('hidden');
        if (countEl) {
            countEl.textContent = `You have ${overdueTasks.length} unfinished task${overdueTasks.length > 1 ? 's' : ''} from earlier days.`;
        }

        const sorted = [...overdueTasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
        const frag = document.createDocumentFragment();
        for (let i = 0; i < sorted.length; i++) {
            const t = sorted[i];
            frag.appendChild(buildTaskCard(t, subjMap.get(t.subjectId), chapMap.get(t.chapterId)));
        }
        list.replaceChildren(frag);
    }

    function renderPriorityPairing() {
        const sched = (window.SF_DATA && SF_DATA.masterSchedule) ? SF_DATA.masterSchedule : [];
        if (!sched.length) return;

        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        const idx  = ((dayOfYear + _roadmapDayOffset) % sched.length + sched.length) % sched.length;
        const item = sched[idx];

        const badge = document.getElementById('rm-day-badge');
        const box   = document.getElementById('priority-pair-container');
        if (badge) badge.textContent = _roadmapDayOffset === 0 ? `Day ${item.day} (Today)` : `Day ${item.day}`;
        if (!box) return;

        if (item.isSunday) {
            box.innerHTML = `
                <div class="pair-slot glass-subcard" style="grid-column: 1 / -1;">
                    <span class="pair-tag" style="background:var(--warning-dim); color:var(--warning);">🔄 Sunday Buffer</span>
                    <p class="pair-title">${escapeHtml(item.title)}</p>
                    <p style="font-size:12px; color:var(--text-secondary)">${escapeHtml(item.desc)}</p>
                </div>
            `;
        } else {
            box.innerHTML = `
                <div class="pair-slot glass-subcard">
                    <span class="pair-tag tag-heavy">🔬 Heavy · ${escapeHtml(item.heavy.sub)}</span>
                    <p class="pair-title">${escapeHtml(item.heavy.title)}</p>
                </div>
                <div class="pair-slot glass-subcard">
                    <span class="pair-tag tag-light">📘 Light · ${escapeHtml(item.light.sub)}</span>
                    <p class="pair-title">${escapeHtml(item.light.title)}</p>
                </div>
            `;
        }
    }

    /* ══════════════════════════════════════════
       5. ROUTINE MATRIX & 90-DAY HEATMAP
    ══════════════════════════════════════════ */
    function renderRoutineMatrix(pendingTasks) {
        const timeline = document.getElementById('routine-timeline');
        const nowText  = document.getElementById('routine-now-text');
        const nextText = document.getElementById('routine-next-text');
        const badgeEl  = document.getElementById('routine-prime-left');
        if (!timeline) return;

        const routine = (window.SF_DATA && SF_DATA.routine) ? SF_DATA.routine : [];
        const now     = new Date();
        const curMins = now.getHours() * 60 + now.getMinutes();
        const dow     = now.getDay();

        const toMins = (hm) => {
            const parts = hm.split(':');
            return Number(parts[0]) * 60 + Number(parts[1]);
        };

        let currentBlock = null;
        let remainingStudyMins = 0;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < routine.length; i++) {
            const b = routine[i];
            if (b.days && !b.days.includes(dow)) continue;

            const sM = toMins(b.s);
            const eM = toMins(b.e);
            const isNow = (eM <= sM) ? (curMins >= sM || curMins < eM) : (curMins >= sM && curMins < eM);
            if (isNow) currentBlock = b;

            if (b.type === 'study') {
                if (isNow) remainingStudyMins += Math.max(0, eM - curMins);
                else if (curMins < sM) remainingStudyMins += (eM - sM);
            }

            const row = document.createElement('div');
            row.className = `routine-row ${isNow ? 'routine-active' : ''} ${b.type === 'study' ? 'routine-study' : ''}`;
            row.innerHTML = `
                <span class="routine-time">${b.s} – ${b.e}</span>
                <span class="routine-label">${b.icon} ${escapeHtml(b.label)}</span>
                ${isNow ? '<span class="count-badge" style="background:var(--accent);color:#000;">NOW</span>' : ''}
            `;
            frag.appendChild(row);
        }
        timeline.replaceChildren(frag);

        if (badgeEl) badgeEl.textContent = `${(remainingStudyMins / 60).toFixed(1)}h Prime Left`;

        const urgentTask = [...pendingTasks].sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
            return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        })[0];

        if (nowText && currentBlock) {
            nowText.textContent = `Now: ${currentBlock.icon} ${currentBlock.label} (${currentBlock.s}–${currentBlock.e})`;
        }
        if (nextText) {
            if (currentBlock && currentBlock.type === 'study' && urgentTask) {
                nextText.innerHTML = `🎯 <strong>Active Prime Target:</strong> ${escapeHtml(urgentTask.title)}`;
            } else if (urgentTask) {
                nextText.innerHTML = `📌 Next Study Target: ${escapeHtml(urgentTask.title)}`;
            } else {
                nextText.textContent = '✨ All urgent tasks cleared for this slot!';
            }
        }
    }

    function renderHeatmap(tasks) {
        const grid   = document.getElementById('heatmap-grid');
        const months = document.getElementById('heatmap-months');
        const badge  = document.getElementById('heatmap-total-badge');
        if (!grid) return;

        const countsByDate = {};
        for (let i = 0; i < tasks.length; i++) {
            const t = tasks[i];
            if (t.status === 'done') {
                const k = t.completedAt ? DB.fmtDate(new Date(t.completedAt)) : (t.dueDate || DB.todayStr());
                countsByDate[k] = (countsByDate[k] || 0) + 1;
            }
        }

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);

        const frag = document.createDocumentFragment();
        const monthLabels = [];
        let totalCompleted90 = 0;

        for (let col = 0; col < 13; col++) {
            const colEl = document.createElement('div');
            colEl.className = 'heatmap-col';

            for (let row = 0; row < 7; row++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + col * 7 + row);
                const dStr = DB.fmtDate(d);
                const c = countsByDate[dStr] || 0;
                totalCompleted90 += c;

                if (row === 0 && (col === 0 || d.getDate() <= 7)) {
                    monthLabels.push(d.toLocaleDateString('en-IN', { month: 'short' }));
                }

                const lvl = c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : 3;
                const cell = document.createElement('div');
                cell.className = `hm-cell hm-lvl-${lvl}`;
                cell.title = `${c} task${c !== 1 ? 's' : ''} completed on ${dStr}`;
                colEl.appendChild(cell);
            }
            frag.appendChild(colEl);
        }
        grid.replaceChildren(frag);

        if (months) {
            months.innerHTML = [...new Set(monthLabels)].map(m => `<span>${m}</span>`).join('');
        }
        if (badge) badge.textContent = `${totalCompleted90} done in 90d`;
    }

    /* ══════════════════════════════════════════
       6. EXAM COUNTDOWN (Multi-Day Aware)
    ══════════════════════════════════════════ */
    function renderExamCountdownSync(exams, today) {
        const inner = document.getElementById('exam-countdown-inner');
        if (!inner) return;

        const active = (exams || [])
            .filter(e => (e.endDate || e.date) >= today)
            .sort((a, b) => (a.startDate || a.date).localeCompare(b.startDate || b.date));

        if (active.length === 0) {
            inner.innerHTML = `
                <div class="exam-placeholder">
                    <span>🎯</span>
                    <span>No exam set — </span>
                    <button id="set-exam-btn" class="exam-link-btn">Set countdown</button>
                </div>
            `;
            Themes.applyExamDanger(null);
            return;
        }

        const nearest   = active[0];
        const start     = nearest.startDate || nearest.date;
        const end       = nearest.endDate   || start;
        const isOngoing = today >= start && today <= end;
        const daysLeft  = isOngoing ? 0 : Math.ceil((new Date(start + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);

        Themes.applyExamDanger(daysLeft);

        const urgencyColor = isOngoing || daysLeft <= 3 ? '#FF4757' : daysLeft <= 7 ? '#FFA502' : '#7C6FFF';
        const statusText   = isOngoing ? '🔥 ONGOING!' : daysLeft === 0 ? 'TODAY!' : daysLeft === 1 ? 'Tomorrow!' : `${daysLeft} days`;
        const dateRangeStr = start !== end ? `${formatDate(start)} – ${formatDate(end)}` : formatDate(start);

        let chipsHtml = '';
        if (active.length > 1) {
            chipsHtml = '<div class="exam-other-chips">' + active.slice(1, 4).map(e => {
                const s = e.startDate || e.date;
                const d = Math.max(0, Math.ceil((new Date(s + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000));
                return `<span class="exam-chip">${escapeHtml(e.name)} · ${d}d</span>`;
            }).join('') + '</div>';
        }

        inner.innerHTML = `
            <div class="exam-countdown-main">
                <div class="exam-count-number" style="color:${urgencyColor}">${statusText}</div>
                <div class="exam-count-label">${isOngoing ? 'Active:' : 'until'} <strong>${escapeHtml(nearest.name)}</strong></div>
                <div class="exam-count-date">${dateRangeStr}</div>
            </div>
            ${chipsHtml}
            <button class="exam-manage-btn" id="exam-manage-btn" title="Manage Exam Countdowns">⚙️</button>
        `;
    }

    /* ══════════════════════════════════════════
       7. TASK LISTS & CARD BUILDER (Zero Listeners)
    ══════════════════════════════════════════ */
    function renderTaskSection(containerId, emptyId, tasks, subjMap, chapMap) {
        const container = document.getElementById(containerId);
        const emptyEl   = document.getElementById(emptyId);
        if (!container) return;

        const today = DB.todayStr();
        const sorted = [...tasks].sort((a, b) => {
            const aOver = a.dueDate && a.dueDate < today ? 1 : 0;
            const bOver = b.dueDate && b.dueDate < today ? 1 : 0;
            if (aOver !== bOver) return bOver - aOver;
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
            return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        });

        const frag = document.createDocumentFragment();
        if (emptyEl) {
            emptyEl.classList.toggle('hidden', sorted.length > 0);
            frag.appendChild(emptyEl);
        }

        for (let i = 0; i < sorted.length; i++) {
            const t = sorted[i];
            frag.appendChild(buildTaskCard(t, subjMap.get(t.subjectId), chapMap.get(t.chapterId)));
        }
        container.replaceChildren(frag);
    }

    function renderDoneSection(doneTasks, subjMap, chapMap) {
        const container = document.getElementById('tasks-done-today');
        if (!container) return;

        const recentDone = [...doneTasks]
            .sort((a, b) => (b.completedAt || b.dueDate || '').localeCompare(a.completedAt || a.dueDate || ''))
            .slice(0, 20);

        const frag = document.createDocumentFragment();
        for (let i = 0; i < recentDone.length; i++) {
            const t = recentDone[i];
            frag.appendChild(buildTaskCard(t, subjMap.get(t.subjectId), chapMap.get(t.chapterId)));
        }
        container.replaceChildren(frag);
    }

    function buildTaskCard(task, subj, chap) {
        const today    = DB.todayStr();
        const isUrgent = task.priority === 'urgent';
        const isDone   = task.status === 'done';

        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${isDone ? 'task-done' : ''} ${task.isGeneral ? 'task-general' : ''}`;
        card.setAttribute('data-task-id', task.id);
        card.setAttribute('role', 'listitem');

        let dateBadge = '';
        if (task.dueDate) {
            const isOverdue = !isDone && task.dueDate < today;
            const isToday   = task.dueDate === today;
            const cls   = isOverdue ? 'tag-overdue' : isToday ? 'tag-today' : '';
            const label = isOverdue ? `⚠️ Overdue (${formatDate(task.dueDate)})` : isToday ? '📅 Today' : `📅 ${formatDate(task.dueDate)}`;
            dateBadge = `<span class="task-tag ${cls}">${label}</span>`;
        }

        let subjBadge = '';
        if (task.isGeneral) {
            const catLabels = { general: '📋 General', personal: '🙋 Personal', reminder: '⏰ Reminder', shopping: '🛒 Shopping', other: '🔖 Other' };
            const label = task.formerSubject ? `📌 from ${escapeHtml(task.formerSubject)}` : (catLabels[task.category] || '📋 General');
            subjBadge = `<span class="task-tag task-tag-general">${label}</span>`;
        } else if (subj) {
            subjBadge = `<span class="task-tag tag-subject" style="color:${subj.color}; background:${hexToRgba(subj.color,0.12)}; border-color:${hexToRgba(subj.color,0.3)}">${subj.icon} ${escapeHtml(subj.name)}</span>`;
        }

        const thumb = task.imageData ? `<img class="task-thumb" src="${task.imageData}" alt="Task photo" loading="lazy" />` : '';

        card.innerHTML = `
            <div class="task-checkbox-wrap">
                <div class="task-checkbox ${isDone ? 'checked' : ''}" role="checkbox" aria-checked="${isDone}" tabindex="0">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
            <div class="task-body">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${subjBadge}
                    ${chap ? `<span class="task-tag">${escapeHtml(truncate(chap.name, 34))}</span>` : ''}
                    ${dateBadge}
                    ${isUrgent ? '<span class="task-tag tag-urgent">🔴 Urgent</span>' : ''}
                    ${isDone   ? '<span class="task-tag tag-done">✅ Done</span>' : ''}
                </div>
            </div>
            ${thumb}
        `;

        return card;
    }

    /* ══════════════════════════════════════════
       8. OPTIMISTIC TASK TOGGLE & DETAIL MODAL
    ══════════════════════════════════════════ */
    async function toggleTaskDone(task, card, checkbox) {
        const wasDone = task.status === 'done';
        task.status = wasDone ? 'pending' : 'done';
        task.completedAt = !wasDone ? new Date().toISOString() : null;

        /* Instant <1ms Visual Feedback on Current Frame */
        if (checkbox) {
            checkbox.classList.toggle('checked', !wasDone);
            checkbox.classList.add('just-checked');
        }
        if (card) card.classList.toggle('task-done', !wasDone);

        await DB.put('tasks', task);

        if (!wasDone) {
            const streak = await DB.updateStreak();
            App.updateStreakUI(streak);
            const pts = task.isGeneral ? 10 : (task.priority === 'urgent' ? 35 : 20);
            App.showToast(`🎯 Task Done! +${pts} ISRO XP`, 'success');
        }

        /* Defer full DOM re-partition so check-pop animation runs at 60 FPS */
        setTimeout(() => {
            requestAnimationFrame(() => {
                render();
                Search.refresh();
            });
        }, 180);
    }

    function openTaskDetail(task, subj, chap) {
        const overlay   = document.getElementById('task-detail-overlay');
        const titleEl   = document.getElementById('detail-title');
        const body      = document.getElementById('task-detail-body');
        const deleteBtn = document.getElementById('task-delete-btn');
        const editBtn   = document.getElementById('task-edit-btn');
        if (!overlay) return;

        titleEl.textContent = task.title;
        const today = DB.todayStr();
        const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

        body.innerHTML = `
            <div class="detail-info-grid">
                <div class="detail-field">
                    <span class="detail-field-label">Category</span>
                    <span class="detail-field-value">${task.isGeneral ? '📌 General Task' : '📝 Academic Subject Task'}</span>
                </div>
                ${subj ? `<div class="detail-field"><span class="detail-field-label">Subject</span><span class="detail-field-value">${subj.icon} ${escapeHtml(subj.name)}</span></div>` : ''}
                ${chap ? `<div class="detail-field"><span class="detail-field-label">Chapter</span><span class="detail-field-value">${escapeHtml(chap.name)}</span></div>` : ''}
                <div class="detail-field">
                    <span class="detail-field-label">Due Date</span>
                    <span class="detail-field-value" style="color:${isOverdue ? 'var(--danger)' : 'inherit'}">${task.dueDate ? formatDate(task.dueDate) : 'No date'}${isOverdue ? ' ⚠️ Overdue' : ''}</span>
                </div>
                <div class="detail-field">
                    <span class="detail-field-label">Priority & Status</span>
                    <span class="detail-field-value">${task.priority === 'urgent' ? '🔴 Urgent' : '🟢 Normal'} · ${task.status === 'done' ? '✅ Completed' : '⏳ Pending'}</span>
                </div>
                ${task.notes ? `<div class="detail-field"><span class="detail-field-label">Notes</span><span class="detail-field-value" style="white-space:pre-wrap">${escapeHtml(task.notes)}</span></div>` : ''}
                ${task.imageData ? `<div class="detail-image"><img src="${task.imageData}" alt="Attached image" /></div>` : ''}
            </div>
        `;

        overlay.classList.remove('hidden');

        if (editBtn) {
            editBtn.onclick = () => {
                overlay.classList.add('hidden');
                QuickAdd.openEditTask(task);
            };
        }

        deleteBtn.onclick = async () => {
            const backupCopy = { ...task };
            await DB.del('tasks', task.id);
            overlay.classList.add('hidden');
            await render();
            Search.refresh();
            App.showUndoToast('🗑 Task deleted.', async () => {
                await DB.put('tasks', backupCopy);
                await render();
                Search.refresh();
                App.showToast('↩️ Task restored!', 'success');
            });
        };

        document.getElementById('task-detail-close').onclick  = () => overlay.classList.add('hidden');
        document.getElementById('task-detail-close2').onclick = () => overlay.classList.add('hidden');
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add('hidden'); };
    }

    /* ══════════════════════════════════════════
       9. SUBJECT OVERVIEW BARS
    ══════════════════════════════════════════ */
    function renderSubjectOverview(subjects, chapters, chapterProgress, tasks) {
        const container = document.getElementById('subject-overview');
        if (!container) return;

        const progMap = new Map(chapterProgress.map(p => [p.chapterId, p]));
        const sorted  = [...subjects].sort((a, b) => (a.order || 0) - (b.order || 0));
        const frag    = document.createDocumentFragment();

        for (let i = 0; i < sorted.length; i++) {
            const s = sorted[i];
            const subChaps = chapters.filter(c => c.subjectId === s.id);
            const subTasks = tasks.filter(t => t.subjectId === s.id);
            let total = subChaps.length * 4 + subTasks.length;
            let done  = subTasks.filter(t => t.status === 'done').length;

            for (let j = 0; j < subChaps.length; j++) {
                const p = progMap.get(subChaps[j].id);
                if (p) {
                    if (p.taught)    done++;
                    if (p.classwork) done++;
                    if (p.homework)  done++;
                    if (p.revision)  done++;
                }
            }
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            const item = document.createElement('div');
            item.className = 'subject-overview-item';
            item.setAttribute('data-subject-id', s.id);
            item.innerHTML = `
                <span class="sub-ov-icon">${s.icon}</span>
                <div class="sub-ov-body">
                    <div class="sub-ov-name">${escapeHtml(s.name)}</div>
                    <div class="sub-ov-bar">
                        <div class="sub-ov-fill" style="width:${pct}%; background:${s.color}"></div>
                    </div>
                </div>
                <span class="sub-ov-pct" style="color:${s.color}">${pct}%</span>
            `;
            frag.appendChild(item);
        }
        container.replaceChildren(frag);
    }

    /* ══════════════════════════════════════════
       10. 60-FPS CONFETTI & HELPERS
    ══════════════════════════════════════════ */
    function launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        const colors = ['#7C6FFF', '#00D4AA', '#FFD700', '#FF6B6B', '#2ED573', '#FFA502'];
        const particles = Array.from({ length: 70 }, () => ({
            x: Math.random() * canvas.width,
            y: -15,
            r: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            speed: Math.random() * 3.5 + 1.8
        }));
        let frame = 0;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 3, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 3);
                ctx.stroke();
                p.y += p.speed;
                p.tilt += Math.sin(frame * 0.05) * 0.3;
            }
            if (++frame < 110) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(draw);
    }

    function setGreeting() {
        const h  = new Date().getHours();
        const el = document.getElementById('greeting-text');
        if (!el) return;
        if (h < 5)       el.textContent = 'Late Night Focus, Prathmesh! 🌙';
        else if (h < 12) el.textContent = 'Good Morning, Prathmesh! 🌅';
        else if (h < 17) el.textContent = 'Good Afternoon, Prathmesh! ☀️';
        else if (h < 21) el.textContent = 'Good Evening, Prathmesh! 🌇';
        else             el.textContent = 'Good Night, Prathmesh! 🌌';
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function formatDate(str) {
        if (!str) return '';
        return new Date(str + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function truncate(s, n) {
        return (s && s.length > n) ? s.slice(0, n) + '…' : (s || '');
    }

    function hexToRgba(hex, alpha) {
        if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(124,111,255,${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    return { render, buildTaskCard, toggleTaskDone, openTaskDetail, launchConfetti };
})();

/* ══════════════════════════════════════════
   EXAM COUNTDOWN MODAL
══════════════════════════════════════════ */
const ExamModal = (() => {

    async function open() {
        const exams   = await DB.getExams();
        const today   = DB.todayStr();
        const listEl  = document.getElementById('existing-exams-list');
        const wrapEl  = document.getElementById('existing-exams-wrap');
        const overlay = document.getElementById('exam-modal-overlay');

        if (listEl && exams.length > 0) {
            wrapEl?.classList.remove('hidden');
            const frag = document.createDocumentFragment();
            exams.sort((a, b) => (a.startDate || a.date).localeCompare(b.startDate || b.date)).forEach(e => {
                const start = e.startDate || e.date;
                const end   = e.endDate   || start;
                const isOngoing = today >= start && today <= end;
                const daysLeft  = isOngoing ? 0 : Math.ceil((new Date(start + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
                const row = document.createElement('div');
                row.className = 'existing-exam-row';
                row.innerHTML = `
                    <span class="existing-exam-name">${e.name}</span>
                    <span class="existing-exam-date">${start}${end !== start ? ' → ' + end : ''}</span>
                    <span class="existing-exam-days" style="color:${isOngoing || daysLeft <= 3 ? '#FF4757' : '#FFA502'}">
                        ${isOngoing ? '🔥 ONGOING' : (daysLeft >= 0 ? daysLeft + 'd' : 'Done')}
                    </span>
                    <button class="existing-exam-del" data-id="${e.id}" aria-label="Delete">🗑</button>
                `;
                row.querySelector('.existing-exam-del').addEventListener('click', async () => {
                    await DB.deleteExam(e.id);
                    await Dashboard.render();
                    open();
                });
                frag.appendChild(row);
            });
            listEl.replaceChildren(frag);
        } else {
            wrapEl?.classList.add('hidden');
        }

        ['exam-name-input', 'exam-date-input', 'exam-end-date-input', 'exam-custom-name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById('exam-custom-wrap')?.classList.add('hidden');
        overlay?.classList.remove('hidden');
    }

    function close() {
        document.getElementById('exam-modal-overlay')?.classList.add('hidden');
    }

    function init() {
        document.getElementById('exam-modal-close')?.addEventListener('click', close);
        document.getElementById('exam-cancel')?.addEventListener('click', close);
        document.getElementById('exam-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'exam-modal-overlay') close();
        });

        document.getElementById('exam-name-input')?.addEventListener('change', (e) => {
            document.getElementById('exam-custom-wrap')?.classList.toggle('hidden', e.target.value !== 'custom');
        });

        document.getElementById('exam-submit')?.addEventListener('click', async () => {
            let name = document.getElementById('exam-name-input')?.value;
            if (name === 'custom') name = document.getElementById('exam-custom-name')?.value.trim();
            const startDate = document.getElementById('exam-date-input')?.value;
            const endDate   = document.getElementById('exam-end-date-input')?.value || startDate;

            if (!name)      { App.showToast('⚠️ Please select or enter an exam name.', 'error'); return; }
            if (!startDate) { App.showToast('⚠️ Please select the exam date.', 'error'); return; }

            await DB.saveExam({ name, date: startDate, startDate, endDate });
            close();
            await Dashboard.render();
            App.showToast(`🎯 Exam "${name}" saved!`, 'success');
        });
    }

    return { open, close, init };
})();