/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/subjects.js
   Delegated Event Handling, DocumentFragment Chapter Rendering,
   Socratic Thinking Coach ("Challenge Me") & Mastered Lock
   ============================================================ */
'use strict';

const Subjects = (() => {
    let _activeSubject  = null;
    let _editingSubject = null;
    let _subjects       = [];
    let _chapters       = [];
    let _progressCache  = {};
    let _delegationInit = false;

    /* Challenge Me State */
    let _chChapter = null;
    let _chPool    = [];
    let _chIndex   = 0;
    let _chScores  = [];

    const SUB_TASKS = [
        { key: 'taught',    label: 'Taught in Class',          icon: '🎓' },
        { key: 'classwork', label: 'Classwork / Notebook Done', icon: '📝' },
        { key: 'homework',  label: 'Homework Submitted',        icon: '📤' },
        { key: 'revision',  label: 'Revision Done',             icon: '🔄' }
    ];

    async function loadProgress() {
        const all = await DB.getAll('chapterProgress');
        _progressCache = {};
        for (let i = 0; i < all.length; i++) {
            _progressCache[all[i].chapterId] = all[i];
        }
    }

    function calcSubjectProgress(subjectId) {
        const chaps = _chapters.filter(c => c.subjectId === subjectId);
        if (!chaps.length) return 0;
        const total = chaps.length * 4;
        let completed = 0;
        for (let i = 0; i < chaps.length; i++) {
            const prog = _progressCache[chaps[i].id];
            if (prog) {
                if (prog.taught)    completed++;
                if (prog.classwork) completed++;
                if (prog.homework)  completed++;
                if (prog.revision)  completed++;
            }
        }
        return total ? Math.round((completed / total) * 100) : 0;
    }

    /* ══════════════════════════════════════════
       1. ONE-TIME DELEGATED LISTENERS
    ══════════════════════════════════════════ */
    function _bindDelegationOnce() {
        if (_delegationInit) return;
        _delegationInit = true;

        /* Subject Grid Delegation */
        document.getElementById('subject-grid')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.subject-edit-btn');
            if (editBtn) {
                e.stopPropagation();
                openEditSubjectModal(Number(editBtn.dataset.subjectId));
                return;
            }
            const card = e.target.closest('.subject-card[data-subject-id]');
            if (card) openPanel(Number(card.dataset.subjectId));
        });

        /* Chapter List Delegation inside Slide-Over Panel */
        document.getElementById('chapter-list')?.addEventListener('click', async (e) => {
            const item = e.target.closest('.chapter-item[data-chapter-id]');
            if (!item) return;
            const chapId = Number(item.dataset.chapterId);
            const ch = _chapters.find(c => c.id === chapId);
            if (!ch) return;

            /* Delete Custom Chapter */
            if (e.target.closest('.del-chap-btn')) {
                e.stopPropagation();
                await DB.del('chapters', ch.id);
                await DB.del('chapterProgress', ch.id);
                _chapters = _chapters.filter(c => c.id !== ch.id);
                await renderChapterList(_activeSubject.id);
                await renderGrid();
                Dashboard.render();
                App.showToast('🗑 Custom chapter deleted.', 'info');
                return;
            }

            /* Accordion Expand/Collapse */
            if (e.target.closest('.chapter-header')) {
                const isOpen = item.classList.contains('expanded');
                document.querySelectorAll('#chapter-list .chapter-item.expanded').forEach(el => el.classList.remove('expanded'));
                if (!isOpen) item.classList.add('expanded');
                return;
            }

            /* 4-Step Sub-Task Toggle */
            const subRow = e.target.closest('.sub-task-row');
            if (subRow) {
                await handleSubCheck(subRow, ch, item);
                return;
            }

            /* Challenge Me Button */
            if (e.target.closest('.challenge-me-btn')) {
                openChallenge(ch);
                return;
            }

            /* Mastered Toggle Button */
            if (e.target.closest('.mastered-toggle-btn')) {
                const cur = _progressCache[ch.id] || { chapterId: ch.id };
                const done4 = SUB_TASKS.every(st => cur[st.key]);
                if (!done4 || (cur.challengeBest || 0) < 80) {
                    App.showToast('🔒 Complete all 4 chapter steps AND score 80%+ in "Challenge Me" first!', 'error');
                    return;
                }
                cur.mastered   = !cur.mastered;
                cur.masteredAt = cur.mastered ? new Date().toISOString() : null;
                await DB.put('chapterProgress', cur);
                _progressCache[ch.id] = cur;
                if (cur.mastered) {
                    Dashboard.launchConfetti();
                    App.showToast(`⭐ "${ch.name}" Mastered! +100 ISRO XP!`, 'success');
                }
                await DB.syncXP();
                await renderChapterList(_activeSubject.id, ch.id);
                renderGrid();
            }
        });
    }

    /* ══════════════════════════════════════════
       2. SUBJECT GRID (Batched)
    ══════════════════════════════════════════ */
    async function renderGrid() {
        _bindDelegationOnce();
        const [subjects, chapters] = await Promise.all([
            DB.getAll('subjects'),
            DB.getAll('chapters'),
            loadProgress()
        ]);
        _subjects = subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
        _chapters = chapters;

        const grid = document.getElementById('subject-grid');
        if (!grid) return;

        const frag = document.createDocumentFragment();
        for (let i = 0; i < _subjects.length; i++) {
            const subj  = _subjects[i];
            const pct   = calcSubjectProgress(subj.id);
            const chaps = _chapters.filter(c => c.subjectId === subj.id);
            const masteredCount = chaps.filter(c => _progressCache[c.id]?.mastered).length;
            frag.appendChild(buildSubjectCard(subj, pct, chaps.length, masteredCount));
        }
        grid.replaceChildren(frag);
    }

    function buildSubjectCard(subj, pct, chapCount, masteredCount) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.style.setProperty('--subject-color', subj.color);
        card.setAttribute('data-subject-id', subj.id);

        card.innerHTML = `
            <button class="subject-edit-btn" data-subject-id="${subj.id}" title="Edit Subject" aria-label="Edit ${escapeHtml(subj.name)}">✏️</button>
            <span class="subject-card-icon">${subj.icon}</span>
            <div class="subject-card-name">${escapeHtml(subj.name)}</div>
            <div class="subject-card-book">${escapeHtml(subj.subtitle || 'Subject Hub')}</div>
            <div class="subject-card-progress">
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" style="width:${pct}%; background:${subj.color}"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:6px;">
                    <span class="subject-card-chap-count">${chapCount} chaps · ⭐ ${masteredCount}</span>
                    <span class="subject-card-pct" style="color:${subj.color}">${pct}%</span>
                </div>
            </div>
        `;
        return card;
    }

    /* ══════════════════════════════════════════
       3. EDIT & DELETE SUBJECT (With Undo)
    ══════════════════════════════════════════ */
    function openEditSubjectModal(subjectId) {
        _editingSubject = _subjects.find(s => s.id === subjectId);
        if (!_editingSubject) return;

        const s = _editingSubject;
        document.getElementById('es-name').value     = s.name;
        document.getElementById('es-subtitle').value = s.subtitle || '';
        document.getElementById('es-icon').value     = s.icon || '📖';
        document.getElementById('es-color').value    = s.color || '#7C6FFF';

        const delBtn = document.getElementById('es-delete-btn');
        if (delBtn) delBtn.classList.toggle('hidden', !s.isCustom && s.id <= 7);

        document.getElementById('edit-subject-overlay')?.classList.remove('hidden');
    }

    function closeEditSubjectModal() {
        document.getElementById('edit-subject-overlay')?.classList.add('hidden');
        _editingSubject = null;
    }

    async function submitEditSubject() {
        if (!_editingSubject) return;
        const name     = document.getElementById('es-name')?.value.trim();
        const subtitle = document.getElementById('es-subtitle')?.value.trim() || '';
        const icon     = document.getElementById('es-icon')?.value.trim() || _editingSubject.icon;
        const color    = document.getElementById('es-color')?.value || _editingSubject.color;

        if (!name) { App.showToast('⚠️ Subject name is required.', 'error'); return; }

        await DB.put('subjects', { ..._editingSubject, name, subtitle, icon, color });
        closeEditSubjectModal();
        App.showToast(`✅ "${name}" updated!`, 'success');
        await renderGrid();
        await Dashboard.render();
    }

    async function deleteSubjectWithUndo() {
        if (!_editingSubject) return;
        const subj = { ..._editingSubject };
        const subChaps = _chapters.filter(c => c.subjectId === subj.id);
        const allTasks = await DB.getAll('tasks');
        const linkedTasks = allTasks.filter(t => t.subjectId === subj.id);
        const savedProgress = subChaps.map(c => _progressCache[c.id]).filter(Boolean);

        await DB.del('subjects', subj.id);
        for (const ch of subChaps) {
            await DB.del('chapters', ch.id);
            await DB.del('chapterProgress', ch.id);
        }
        for (const t of linkedTasks) {
            await DB.put('tasks', {
                ...t,
                isGeneral: true,
                category: 'other',
                subjectId: null,
                chapterId: null,
                formerSubject: subj.name
            });
        }

        closeEditSubjectModal();
        await renderGrid();
        await Dashboard.render();

        App.showUndoToast(`🗑 Deleted "${subj.name}".`, async () => {
            await DB.put('subjects', subj);
            for (const ch of subChaps) await DB.put('chapters', ch);
            for (const pr of savedProgress) await DB.put('chapterProgress', pr);
            for (const t of linkedTasks) await DB.put('tasks', t);
            await renderGrid();
            await Dashboard.render();
            App.showToast(`↩️ Restored "${subj.name}"!`, 'success');
        });
    }

    /* ══════════════════════════════════════════
       4. SUBJECT PANEL & CHAPTER ACCORDION
    ══════════════════════════════════════════ */
    async function openPanel(subjectId, expandChapterId = null) {
        _bindDelegationOnce();
        if (!_subjects.length || !_chapters.length) {
            [_subjects, _chapters] = await Promise.all([DB.getAll('subjects'), DB.getAll('chapters')]);
        }
        _activeSubject = _subjects.find(s => s.id === subjectId);
        if (!_activeSubject) return;

        await loadProgress();
        const subj = _activeSubject;

        document.getElementById('panel-subject-name').textContent = subj.name;
        document.getElementById('panel-subject-book').textContent = subj.subtitle || 'Subject Hub';
        document.getElementById('panel-subject-icon').textContent = subj.icon;

        const pct  = calcSubjectProgress(subjectId);
        const fill = document.getElementById('panel-progress-fill');
        const txt  = document.getElementById('panel-progress-pct');
        if (fill) { fill.style.width = `${pct}%`; fill.style.background = subj.color; }
        if (txt)  { txt.textContent  = `${pct}%`; txt.style.color = subj.color; }

        await renderChapterList(subjectId, expandChapterId);

        const panel    = document.getElementById('subject-panel');
        const backdrop = document.getElementById('panel-backdrop');
        panel?.classList.add('panel-open');
        backdrop?.classList.remove('hidden');
        requestAnimationFrame(() => backdrop?.classList.add('backdrop-visible'));
    }

    function closePanel() {
        const panel    = document.getElementById('subject-panel');
        const backdrop = document.getElementById('panel-backdrop');
        panel?.classList.remove('panel-open');
        backdrop?.classList.remove('backdrop-visible');
        setTimeout(() => backdrop?.classList.add('hidden'), 260);
        _activeSubject = null;
    }

    async function renderChapterList(subjectId, expandChapterId = null) {
        const chapters = _chapters
            .filter(c => c.subjectId === subjectId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const list = document.getElementById('chapter-list');
        if (!list) return;

        const frag = document.createDocumentFragment();
        for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            frag.appendChild(buildChapterItem(ch, ch.id === expandChapterId));
        }
        list.replaceChildren(frag);
    }

    function buildChapterItem(ch, startExpanded = false) {
        const prog       = _progressCache[ch.id] || {};
        const completed  = SUB_TASKS.filter(st => prog[st.key]).length;
        const isAll4Done = completed === 4;
        const bestScore  = prog.challengeBest || 0;
        const canMaster  = isAll4Done && bestScore >= 80;
        const isMastered = Boolean(prog.mastered);
        const pctRing    = Math.round((completed / 4) * 100);

        const item = document.createElement('div');
        item.className = `chapter-item ${isAll4Done ? 'chapter-complete' : ''} ${startExpanded ? 'expanded' : ''}`;
        item.setAttribute('data-chapter-id', ch.id);

        item.innerHTML = `
            <div class="chapter-header">
                <div class="chapter-mini-progress">
                    <div class="chapter-mini-ring"></div>
                    <div class="chapter-mini-fill" style="border-top-color:${isAll4Done ? 'var(--success)' : 'var(--primary)'}; transform:rotate(${-90 + (pctRing / 100) * 360}deg);"></div>
                    <span class="chapter-mini-num">${completed}/4</span>
                </div>
                <div class="chapter-name">${escapeHtml(ch.name)} ${isMastered ? '⭐' : ''}</div>
                ${ch.isCustom ? '<button class="icon-btn btn-xs del-chap-btn" title="Delete custom chapter">🗑</button>' : ''}
                <svg class="chapter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="chapter-body">
                <div class="chapter-tasks">
                    ${SUB_TASKS.map(st => `
                        <div class="sub-task-row ${prog[st.key] ? 'sub-done' : ''}" data-key="${st.key}" data-chapter-id="${ch.id}">
                            <div class="sub-checkbox ${prog[st.key] ? 'checked' : ''}">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span class="sub-task-icon">${st.icon}</span>
                            <span class="sub-task-label">${st.label}</span>
                        </div>
                    `).join('')}
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding-top:10px; margin-top:4px; border-top:1px dashed var(--border-md);">
                        <button type="button" class="btn btn-sm btn-primary challenge-me-btn">
                            🧠 Challenge Me ${bestScore ? `(${bestScore}%)` : ''}
                        </button>
                        <button type="button" class="btn btn-sm ${isMastered ? 'btn-success' : 'btn-ghost'} mastered-toggle-btn">
                            ${isMastered ? '⭐ Mastered (+100 XP)' : (canMaster ? '🔓 Mark Mastered' : '🔒 Mastered Locked')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        return item;
    }

    async function handleSubCheck(row, ch, itemEl) {
        const chapterId = ch.id;
        const key       = row.dataset.key;

        const prog = _progressCache[chapterId] ? { ..._progressCache[chapterId] } : { chapterId };
        prog[key]  = !prog[key];
        _progressCache[chapterId] = prog;

        /* Instant UI Toggle on Current Frame */
        const cb = row.querySelector('.sub-checkbox');
        cb?.classList.toggle('checked', prog[key]);
        cb?.classList.add('just-checked');
        row.classList.toggle('sub-done', prog[key]);

        const completed  = SUB_TASKS.filter(st => prog[st.key]).length;
        const isAll4Done = completed === 4;
        const pctRing    = Math.round((completed / 4) * 100);
        itemEl.classList.toggle('chapter-complete', isAll4Done);
        const ring = itemEl.querySelector('.chapter-mini-fill');
        if (ring) {
            ring.style.borderTopColor = isAll4Done ? 'var(--success)' : 'var(--primary)';
            ring.style.transform = `rotate(${-90 + (pctRing / 100) * 360}deg)`;
        }
        const num = itemEl.querySelector('.chapter-mini-num');
        if (num) num.textContent = `${completed}/4`;

        if (_activeSubject) {
            const pct = calcSubjectProgress(_activeSubject.id);
            document.getElementById('panel-progress-fill').style.width = `${pct}%`;
            document.getElementById('panel-progress-pct').textContent  = `${pct}%`;
        }

        await DB.put('chapterProgress', prog);
        if (prog[key]) {
            const streak = await DB.updateStreak();
            App.updateStreakUI(streak);
        }
        DB.syncXP();
        renderGrid();
        Dashboard.render();
    }

    async function addCustomChapter(name) {
        if (!_activeSubject) return;
        const allChaps = await DB.getAll('chapters');
        const maxId    = allChaps.reduce((m, c) => Math.max(m, Number(c.id) || 0), 82);
        const subChaps = allChaps.filter(c => c.subjectId === _activeSubject.id);
        const maxOrd   = subChaps.reduce((m, c) => Math.max(m, Number(c.order) || 0), 0);

        const newChap = {
            id:        maxId + 1,
            subjectId: _activeSubject.id,
            name,
            order:     maxOrd + 1,
            isCustom:  true
        };
        await DB.put('chapters', newChap);
        _chapters.push(newChap);
        await renderChapterList(_activeSubject.id, newChap.id);
        await renderGrid();
        App.showToast('✏️ Custom chapter added!', 'success');
    }

    /* ══════════════════════════════════════════
       5. SOCRATIC THINKING COACH ("CHALLENGE ME")
    ══════════════════════════════════════════ */
    function openChallenge(chapter) {
        _chChapter = chapter;
        const bank = (window.SF_CHALLENGES && SF_CHALLENGES.bank) ? SF_CHALLENGES.bank : {};
        const gen  = (window.SF_CHALLENGES && SF_CHALLENGES.generic) ? SF_CHALLENGES.generic : {};

        const cleanTitle = chapter.name.includes('—')
            ? chapter.name.split('—')[1].trim()
            : chapter.name.replace(/^[०-९0-9]+\.\s*/, '').trim();

        let rawPool = bank[chapter.id];
        if (!rawPool) {
            if (chapter.subjectId === 1) {
                rawPool = chapter.name.toLowerCase().startsWith('poetry') ? gen.poetry : gen.prose;
            } else if (chapter.subjectId === 2) {
                rawPool = gen.hindi;
            } else if (chapter.subjectId === 3) {
                rawPool = gen.marathi;
            } else {
                rawPool = gen.any;
            }
        }

        _chPool = (rawPool || []).map(([q, ans, whatif], idx) => ({
            idx,
            q:      q.replace(/\{t\}/g, cleanTitle),
            ans:    ans.replace(/\{t\}/g, cleanTitle),
            whatif: whatif.replace(/\{t\}/g, cleanTitle)
        })).sort(() => Math.random() - 0.5);

        _chIndex  = 0;
        _chScores = [];

        document.getElementById('challenge-overlay')?.classList.remove('hidden');
        _renderChallengeStep();
    }

    function _renderChallengeStep() {
        const item = _chPool[_chIndex];
        if (!item) return;

        document.getElementById('challenge-step-indicator').textContent = `Question ${_chIndex + 1} of ${_chPool.length}`;
        document.getElementById('challenge-chapter-title').textContent  = _chChapter.name;
        document.getElementById('challenge-question-text').textContent  = item.q;

        const input  = document.getElementById('challenge-input');
        const revBtn = document.getElementById('challenge-reveal-btn');
        const solBox = document.getElementById('challenge-solution-box');
        const actRow = document.getElementById('challenge-action-row');

        input.value      = '';
        revBtn.disabled  = true;
        solBox.classList.add('hidden');
        actRow.classList.remove('hidden');
        input.focus();

        document.getElementById('challenge-strong-ans').textContent = item.ans;
        document.getElementById('challenge-whatif-ans').textContent = item.whatif;
    }

    async function _rateCurrentQuestion(score) {
        const item = _chPool[_chIndex];
        _chScores.push(score);

        const mistakes = (await DB.getSetting('sf_mistakes')) || [];
        const mKey = `${_chChapter.id}#${item.idx}`;
        const existingIdx = mistakes.findIndex(m => m.key === mKey);

        if (score === 0) {
            const entry = {
                key: mKey,
                chapterId: _chChapter.id,
                subjectId: _chChapter.subjectId,
                chapterName: _chChapter.name,
                q: item.q,
                ans: item.ans
            };
            if (existingIdx >= 0) mistakes[existingIdx] = entry;
            else mistakes.push(entry);
            await DB.setSetting('sf_mistakes', mistakes);
        } else if (score === 1 && existingIdx >= 0) {
            mistakes.splice(existingIdx, 1);
            await DB.setSetting('sf_mistakes', mistakes);
        }

        if (_chIndex + 1 < _chPool.length) {
            _chIndex++;
            _renderChallengeStep();
        } else {
            await _finishChallenge();
        }
    }

    async function _finishChallenge() {
        const sum = _chScores.reduce((a, b) => a + b, 0);
        const pct = Math.round((sum / (_chPool.length || 1)) * 100);

        const prog = (await DB.get('chapterProgress', _chChapter.id)) || { chapterId: _chChapter.id };
        prog.challengeBest = Math.max(prog.challengeBest || 0, pct);
        prog.challengeAt   = new Date().toISOString();

        const all4Done = SUB_TASKS.every(st => prog[st.key]);
        if (pct >= 80 && all4Done) {
            prog.mastered   = true;
            prog.masteredAt = new Date().toISOString();
        }

        await DB.put('chapterProgress', prog);
        _progressCache[_chChapter.id] = prog;
        await DB.syncXP();

        document.getElementById('challenge-overlay')?.classList.add('hidden');
        if (pct >= 80) {
            Dashboard.launchConfetti();
            App.showToast(`🏆 Challenge Passed (${pct}%)! ${all4Done ? 'Chapter Mastered (+100 XP)!' : 'Tick all 4 steps to unlock Mastered.'}`, 'success');
        } else {
            App.showToast(`🧠 Scored ${pct}% (80% required). Missed questions logged in Mistake Notebook!`, 'info');
        }

        if (_activeSubject) await renderChapterList(_activeSubject.id, _chChapter.id);
        await renderGrid();
    }

    function init() {
        _bindDelegationOnce();
        document.getElementById('panel-back')?.addEventListener('click', closePanel);
        document.getElementById('panel-backdrop')?.addEventListener('click', closePanel);

        document.getElementById('panel-add-task-btn')?.addEventListener('click', () => {
            const sid = _activeSubject?.id || null;
            closePanel();
            setTimeout(() => QuickAdd.open(sid), 220);
        });

        document.getElementById('add-custom-chapter-btn')?.addEventListener('click', () => {
            document.getElementById('custom-chapter-name').value = '';
            document.getElementById('chapter-modal-overlay')?.classList.remove('hidden');
        });
        document.getElementById('chapter-modal-close')?.addEventListener('click', () => {
            document.getElementById('chapter-modal-overlay')?.classList.add('hidden');
        });
        document.getElementById('chapter-cancel')?.addEventListener('click', () => {
            document.getElementById('chapter-modal-overlay')?.classList.add('hidden');
        });
        document.getElementById('chapter-submit')?.addEventListener('click', async () => {
            const name = document.getElementById('custom-chapter-name')?.value.trim();
            if (!name) { App.showToast('⚠️ Enter a chapter name.', 'error'); return; }
            document.getElementById('chapter-modal-overlay')?.classList.add('hidden');
            await addCustomChapter(name);
        });

        document.getElementById('es-close')?.addEventListener('click', closeEditSubjectModal);
        document.getElementById('es-cancel')?.addEventListener('click', closeEditSubjectModal);
        document.getElementById('es-submit')?.addEventListener('click', submitEditSubject);
        document.getElementById('es-delete-btn')?.addEventListener('click', deleteSubjectWithUndo);
        document.querySelectorAll('#es-color-presets .color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('es-color').value = btn.dataset.color;
            });
        });

        document.getElementById('challenge-close')?.addEventListener('click', () => {
            document.getElementById('challenge-overlay')?.classList.add('hidden');
        });
        document.getElementById('challenge-input')?.addEventListener('input', (e) => {
            document.getElementById('challenge-reveal-btn').disabled = e.target.value.trim().length < 10;
        });
        document.getElementById('challenge-reveal-btn')?.addEventListener('click', () => {
            document.getElementById('challenge-action-row')?.classList.add('hidden');
            document.getElementById('challenge-solution-box')?.classList.remove('hidden');
        });
        document.getElementById('challenge-stuck-btn')?.addEventListener('click', () => _rateCurrentQuestion(0));
        document.querySelectorAll('#challenge-solution-box [data-score]').forEach(btn => {
            btn.addEventListener('click', () => _rateCurrentQuestion(Number(btn.dataset.score)));
        });
    }

    async function getSubjectsWithProgress() {
        [_subjects, _chapters] = await Promise.all([DB.getAll('subjects'), DB.getAll('chapters'), loadProgress()]);
        return _subjects.map(s => ({
            ...s,
            progress: calcSubjectProgress(s.id),
            chapterCount: _chapters.filter(c => c.subjectId === s.id).length
        }));
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return {
        init,
        renderGrid,
        openPanel,
        closePanel,
        openChallenge,
        getSubjectsWithProgress
    };
})();