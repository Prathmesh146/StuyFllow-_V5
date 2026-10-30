/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/search.js
   Parallel Promise.all Search, Single Delegated Click Handler,
   All 5 Filter Chips Working (Including General) & Chapter Jump
   ============================================================ */
'use strict';

const Search = (() => {
    let _debounce = null;
    let _activeFilters = new Set();
    let _delegationBound = false;
    let _tasks = [], _subjects = [], _chapters = [];

    function _bindDelegationOnce() {
        if (_delegationBound) return;
        const container = document.getElementById('search-results');
        if (!container) return;
        _delegationBound = true;

        container.addEventListener('click', (e) => {
            const checkWrap = e.target.closest('.task-checkbox-wrap');
            if (checkWrap) {
                e.stopPropagation();
                const card = checkWrap.closest('.task-card');
                const task = _tasks.find(t => t.id === Number(card?.dataset.taskId));
                if (task) Dashboard.toggleTaskDone(task, card, checkWrap.querySelector('.task-checkbox'));
                return;
            }
            const card = e.target.closest('.task-card');
            if (card) {
                const task = _tasks.find(t => t.id === Number(card.dataset.taskId));
                if (task) {
                    const subj = _subjects.find(s => s.id === task.subjectId);
                    const chap = _chapters.find(c => c.id === task.chapterId);
                    Dashboard.openTaskDetail(task, subj, chap);
                }
                return;
            }
            const chapRow = e.target.closest('.subject-overview-item[data-chapter-id]');
            if (chapRow) {
                const sid = Number(chapRow.dataset.subjectId);
                const cid = Number(chapRow.dataset.chapterId);
                App.navigate('subjects');
                setTimeout(() => Subjects.openPanel(sid, cid), 160);
            }
        });
    }

    async function render() {
        _bindDelegationOnce();
        [_tasks, _subjects, _chapters] = await Promise.all([
            DB.getAll('tasks'),
            DB.getAll('subjects'),
            DB.getAll('chapters')
        ]);

        const subjMap = new Map(_subjects.map(s => [s.id, s]));
        const chapMap = new Map(_chapters.map(c => [c.id, c]));

        const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
        const container = document.getElementById('search-results');
        if (!container) return;

        if (!query && _activeFilters.size === 0) {
            container.innerHTML = `
                <div class="search-placeholder" id="search-placeholder">
                    <div class="empty-icon-wrap" style="font-size:2.5rem">🔍</div>
                    <p class="empty-title">Start typing or tap a filter chip</p>
                    <p class="empty-sub">Searches across tasks, 82 NCERT chapters &amp; subjects</p>
                </div>
            `;
            return;
        }

        const today = DB.todayStr();
        const matchedTasks = _tasks.filter(task => {
            if (query) {
                const subj = subjMap.get(task.subjectId);
                const chap = chapMap.get(task.chapterId);
                const blob = `${task.title} ${task.notes || ''} ${subj ? subj.name : ''} ${chap ? chap.name : ''}`.toLowerCase();
                if (!blob.includes(query)) return false;
            }
            if (_activeFilters.has('pending') && task.status === 'done')     return false;
            if (_activeFilters.has('done')    && task.status !== 'done')     return false;
            if (_activeFilters.has('today')   && task.dueDate !== today)     return false;
            if (_activeFilters.has('urgent')  && task.priority !== 'urgent') return false;
            if (_activeFilters.has('general') && !task.isGeneral)            return false;
            return true;
        });

        const matchedChapters = query
            ? _chapters.filter(c => c.name.toLowerCase().includes(query)).slice(0, 12)
            : [];

        if (matchedTasks.length === 0 && matchedChapters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon-wrap">🔍</div>
                    <p class="empty-title">No results found</p>
                    <p class="empty-sub">Try different keywords or filter chips</p>
                </div>
            `;
            return;
        }

        const frag = document.createDocumentFragment();
        for (let i = 0; i < matchedTasks.length; i++) {
            const t = matchedTasks[i];
            frag.appendChild(Dashboard.buildTaskCard(t, subjMap.get(t.subjectId), chapMap.get(t.chapterId)));
        }

        for (let i = 0; i < matchedChapters.length; i++) {
            const chap = matchedChapters[i];
            const subj = subjMap.get(chap.subjectId);
            const row  = document.createElement('div');
            row.className = 'subject-overview-item';
            row.setAttribute('data-subject-id', chap.subjectId);
            row.setAttribute('data-chapter-id', chap.id);
            row.innerHTML = `
                <span class="sub-ov-icon">${subj ? subj.icon : '📖'}</span>
                <div class="sub-ov-body">
                    <div class="sub-ov-name">${chap.name}</div>
                    <div style="font-size:12px; color:var(--text-muted)">${subj ? subj.name : 'Subject'} · Tap to open chapter</div>
                </div>
                <span class="count-badge">Chapter →</span>
            `;
            frag.appendChild(row);
        }

        container.replaceChildren(frag);
    }

    function init() {
        _bindDelegationOnce();
        const input    = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');

        input?.addEventListener('input', () => {
            clearBtn?.classList.toggle('hidden', !input.value);
            clearTimeout(_debounce);
            _debounce = setTimeout(render, 140);
        });

        clearBtn?.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.add('hidden');
            _activeFilters.clear();
            _syncChips();
            render();
        });

        document.querySelectorAll('#filter-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const f = chip.dataset.filter;
                if (_activeFilters.has(f)) _activeFilters.delete(f);
                else {
                    if (f === 'done')    _activeFilters.delete('pending');
                    if (f === 'pending') _activeFilters.delete('done');
                    _activeFilters.add(f);
                }
                _syncChips();
                render();
            });
        });
    }

    function _syncChips() {
        document.querySelectorAll('#filter-chips .chip').forEach(c => {
            c.classList.toggle('active', _activeFilters.has(c.dataset.filter));
        });
    }

    function refresh() {
        if (document.getElementById('view-search')?.classList.contains('active')) render();
    }

    return { init, render, refresh };
})();