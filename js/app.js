/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/app.js
   Auto-Scaffolding DOM Bridge (Works on Old OR New HTML/CSS),
   rAF-Throttled 3D Tilt Badges, Mars Rover Canvas, 3D Active
   Recall Flashcards, 60-Day Roadmap & Previous-DB Merge Suite
   ============================================================ */
'use strict';

const App = (() => {

    let _currentView    = 'dashboard';
    let _studyDeckCards = [];
    let _studyCardIdx   = 0;

    /* ══════════════════════════════════════════
       1. AUTO-SCAFFOLDING DOM BRIDGE
       Ensures all V4 Flagship modules work even if tested on
       the user's original index_2.html & CSS files first!
    ══════════════════════════════════════════ */
    function _ensureDOMScaffold() {
        /* 1. Inject lightweight fallback CSS for any new V4 widgets if old CSS is active */
        if (!document.getElementById('sf-v4-compat-css')) {
            const st = document.createElement('style');
            st.id = 'sf-v4-compat-css';
            st.textContent = `
                .mission-badge { display:inline-flex; align-items:center; gap:8px; background:var(--surface-2,#1E2636); border:1px solid var(--border-md,rgba(255,255,255,0.1)); border-radius:999px; padding:4px 10px; cursor:pointer; }
                .rank-info { display:flex; flex-direction:column; gap:2px; min-width:95px; }
                .rank-top-row { display:flex; justify-content:space-between; font-size:10.5px; font-weight:700; gap:6px; }
                .xp-count { color:var(--accent,#00D4AA); }
                .xp-bar-wrap { height:4px; background:var(--surface-3,#263048); border-radius:99px; overflow:hidden; }
                .xp-bar-fill { height:100%; background:linear-gradient(90deg,var(--primary,#7C6FFF),var(--accent,#00D4AA)); }
                .overdue-banner { background:rgba(255,165,2,0.12); border:1px solid rgba(255,165,2,0.4); border-radius:14px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
                .priority-pair-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }
                .glass-subcard { background:var(--surface-2,#1E2636); border:1px solid var(--border-md,rgba(255,255,255,0.1)); border-radius:12px; padding:12px; }
                .pair-tag { font-size:10px; font-weight:800; text-transform:uppercase; padding:2px 8px; border-radius:6px; display:inline-block; margin-bottom:4px; }
                .tag-heavy { background:rgba(0,212,170,0.14); color:#00D4AA; }
                .tag-light { background:rgba(124,111,255,0.14); color:#A69BFF; }
                .routine-now-banner { background:rgba(124,111,255,0.12); border:1px solid rgba(124,111,255,0.28); border-radius:12px; padding:10px 14px; margin-bottom:10px; }
                .routine-timeline { display:flex; flex-direction:column; gap:6px; }
                .routine-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 12px; border-radius:10px; background:var(--surface,#161B25); border:1px solid var(--border,rgba(255,255,255,0.06)); font-size:12.5px; }
                .routine-row.routine-active { border-color:var(--accent,#00D4AA); font-weight:700; }
                .routine-time { font-family:monospace; font-size:11px; color:var(--text-muted,#8895A7); min-width:88px; }
                .heatmap-months { display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted,#8895A7); margin-bottom:4px; }
                .heatmap-grid { display:grid; grid-template-columns:repeat(13,1fr); gap:4px; }
                .heatmap-col { display:flex; flex-direction:column; gap:4px; }
                .hm-cell { width:100%; aspect-ratio:1; border-radius:3px; background:var(--surface-2,#1E2636); border:1px solid rgba(255,255,255,0.05); display:inline-block; }
                .hm-lvl-1 { background:rgba(46,213,115,0.35); }
                .hm-lvl-2 { background:rgba(46,213,115,0.68); }
                .hm-lvl-3 { background:#2ED573; }
                .fc-decks-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:12px; }
                .fc-deck-tile { background:var(--surface,#161B25); border:1px solid var(--border-md,rgba(255,255,255,0.1)); border-radius:16px; padding:16px; display:flex; flex-direction:column; gap:10px; cursor:pointer; }
                .fc-scene { width:100%; height:260px; perspective:1000px; margin:14px 0; }
                .fc-card-3d { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.55s cubic-bezier(0.34,1.56,0.64,1); cursor:pointer; }
                .fc-card-3d.is-flipped { transform:rotateY(180deg); }
                .fc-card-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; border-radius:18px; background:var(--surface-2,#1E2636); border:1px solid var(--border-strong,rgba(255,255,255,0.18)); padding:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:10px; }
                .fc-card-back { transform:rotateY(180deg); border-color:var(--primary,#7C6FFF); }
                .fc-rating-row { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
                .badge-gallery-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
                .badge-3d-card { background:var(--surface,#161B25); border:1px solid var(--border-md,rgba(255,255,255,0.1)); border-radius:14px; padding:14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:4px; will-change:transform; }
                .badge-3d-card.locked { opacity:0.4; filter:grayscale(0.9); }
                .mars-canvas { width:100%; height:140px; border-radius:14px; background:#090D1A; display:block; margin-top:8px; }
                .roadmap-table { width:100%; border-collapse:collapse; font-size:12.5px; }
                .roadmap-table th, .roadmap-table td { padding:10px; border-bottom:1px solid var(--border,rgba(255,255,255,0.07)); text-align:left; }
                .challenge-card { max-width:580px; width:92%; background:var(--surface,#161B25); border:1px solid var(--border-strong,rgba(255,255,255,0.2)); border-radius:20px; padding:22px; display:flex; flex-direction:column; gap:14px; color:var(--text-primary,#EEF2FF); }
            `;
            document.head.appendChild(st);
        }

        /* 2. Inject Header Mission Badge if missing */
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('mission-badge')) {
            const mb = document.createElement('div');
            mb.id = 'mission-badge';
            mb.className = 'mission-badge';
            mb.title = 'ISRO Mission Control';
            mb.innerHTML = `
                <span id="rank-emoji">🛸</span>
                <div class="rank-info">
                    <div class="rank-top-row"><span id="rank-name">Trainee</span><span id="xp-count" class="xp-count">0 XP</span></div>
                    <div class="xp-bar-wrap"><div id="xp-bar-fill" class="xp-bar-fill" style="width:12%"></div></div>
                </div>
            `;
            headerRight.prepend(mb);
        }

        /* 3. Inject Dashboard V4 Sections if running on index_2.html */
        const dashScroll = document.querySelector('#view-dashboard .view-scroll');
        if (dashScroll && !document.getElementById('routine-matrix-card')) {
            const statsRow = document.getElementById('stats-row');
            const overHtml = document.createElement('div');
            overHtml.innerHTML = `
                <div id="overdue-alert-banner" class="overdue-banner hidden">
                    <div><strong style="color:var(--warning,#FFA502)">⚠️ Overdue Backlog Detected</strong><p id="overdue-count-text" style="font-size:12px"></p></div>
                    <button id="overdue-toggle-btn" class="btn btn-sm btn-ghost">View Backlog ▼</button>
                </div>
                <div id="overdue-drawer" class="dash-section hidden"><div id="overdue-items-list" class="task-list"></div></div>
                <section class="dash-section" id="section-roadmap-today">
                    <div class="section-header">
                        <h2 class="section-title">🧭 Today's Heavy + Light Study Pairing</h2>
                        <div style="display:flex;gap:6px;align-items:center;">
                            <button class="icon-btn" id="rm-prev-day" style="width:28px;height:28px;">◀</button>
                            <span id="rm-day-badge" class="count-badge">Today</span>
                            <button class="icon-btn" id="rm-next-day" style="width:28px;height:28px;">▶</button>
                        </div>
                    </div>
                    <div id="priority-pair-container" class="priority-pair-grid"></div>
                </section>
            `;
            statsRow?.after(overHtml);

            const tailHtml = document.createElement('div');
            tailHtml.innerHTML = `
                <section class="dash-section" id="section-done-today">
                    <div class="section-header" id="done-today-toggle" style="cursor:pointer">
                        <h2 class="section-title">✅ Completed Tasks (Tap to Toggle)</h2>
                        <span id="done-badge" class="count-badge">0</span>
                    </div>
                    <div id="tasks-done-today" class="task-list hidden"></div>
                </section>
                <section class="dash-section" id="routine-matrix-card">
                    <div class="section-header">
                        <h2 class="section-title">🗓️ Routine Matrix (IST)</h2>
                        <span id="routine-prime-left" class="count-badge">Prime Focus</span>
                    </div>
                    <div class="routine-now-banner">
                        <div id="routine-now-text" style="font-weight:700;font-size:13px"></div>
                        <div id="routine-next-text" style="font-size:12px;margin-top:2px"></div>
                    </div>
                    <div id="routine-timeline" class="routine-timeline"></div>
                </section>
                <section class="dash-section" id="heatmap-card">
                    <div class="section-header">
                        <h2 class="section-title">🟩 90-Day Study Heatmap</h2>
                        <span id="heatmap-total-badge" class="count-badge">90d</span>
                    </div>
                    <div id="heatmap-months" class="heatmap-months"></div>
                    <div id="heatmap-grid" class="heatmap-grid"></div>
                </section>
            `;
            dashScroll.querySelector('.bottom-spacer')?.before(tailHtml);
        }

        /* 4. Inject Missing Views (Roadmap, Flashcards, Mission) & Nav Buttons */
        const appMain = document.getElementById('app-main');
        if (appMain && !document.getElementById('view-flashcards')) {
            appMain.insertAdjacentHTML('beforeend', `
                <div id="view-roadmap" class="view" role="tabpanel">
                    <div class="view-scroll">
                        <div class="view-head"><h1 class="view-title">🧭 60-Day Study Roadmap</h1><p class="view-subtitle">1 Heavy + 1 Light Subject Daily Rotation</p></div>
                        <input type="search" id="roadmap-search-input" class="form-input" placeholder="Search roadmap…" style="margin-bottom:12px;" />
                        <table class="roadmap-table"><thead><tr><th>Day</th><th>Heavy</th><th>Light</th><th>Done</th></tr></thead><tbody id="roadmap-table-body"></tbody></table>
                        <div class="bottom-spacer"></div>
                    </div>
                </div>
                <div id="view-flashcards" class="view" role="tabpanel">
                    <div class="view-scroll">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <div><h1 class="view-title">🃏 Active Recall Flashcards</h1><p class="view-subtitle">3D Spaced Repetition Decks</p></div>
                            <button class="btn btn-sm btn-primary" id="fc-new-card-btn">+ New Card</button>
                        </div>
                        <div id="fc-decks-grid" class="fc-decks-grid"></div>
                        <div id="fc-study-theater" class="hidden">
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <button class="btn btn-sm btn-ghost" id="fc-exit-study-btn">← Decks</button>
                                <strong id="fc-study-deck-name">Deck</strong>
                                <span id="fc-study-counter" class="count-badge">1/1</span>
                            </div>
                            <div class="fc-scene">
                                <div id="fc-card-3d" class="fc-card-3d">
                                    <div class="fc-card-face fc-card-front"><small>QUESTION (TAP TO FLIP)</small><div id="fc-front-text" style="font-size:18px;font-weight:700;"></div></div>
                                    <div class="fc-card-face fc-card-back"><small>ANSWER</small><div id="fc-back-text" style="font-size:17px;"></div></div>
                                </div>
                            </div>
                            <div id="fc-rating-row" class="fc-rating-row hidden">
                                <button class="btn btn-sm btn-danger fc-rate-btn" data-days="1">😓 Hard (1d)</button>
                                <button class="btn btn-sm btn-ghost fc-rate-btn" data-days="3">👍 Good (3d)</button>
                                <button class="btn btn-sm btn-primary fc-rate-btn" data-days="7">⚡ Easy (7d)</button>
                            </div>
                        </div>
                        <div class="bottom-spacer"></div>
                    </div>
                </div>
                <div id="view-mission" class="view" role="tabpanel">
                    <div class="view-scroll">
                        <div class="view-head"><h1 class="view-title">🚀 ISRO Mission Control</h1><p class="view-subtitle">Ranks, Mars Rover Trajectory, 3D Medals &amp; Mistake Notebook</p></div>
                        <div class="glass-subcard" style="margin-bottom:14px;">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <span id="mission-rank-emoji" style="font-size:36px;">🛸</span>
                                <div><h2 id="mission-rank-title" style="font-size:18px;">Aeronautical Trainee</h2><p id="mission-xp-sub" style="font-size:12px;color:var(--text-secondary)"></p></div>
                            </div>
                            <div class="progress-bar-track" style="margin-top:10px;"><div id="mission-xp-bar" class="progress-bar-fill" style="width:10%"></div></div>
                        </div>
                        <div class="glass-subcard" style="margin-bottom:14px;">
                            <div style="display:flex;justify-content:space-between;"><strong>🪐 Mars Rover Syllabus Trajectory</strong><span id="mars-progress-pct" class="count-badge">0%</span></div>
                            <canvas id="mars-canvas" width="600" height="140" class="mars-canvas"></canvas>
                        </div>
                        <div id="insights-grid" class="priority-pair-grid" style="margin-bottom:14px;"></div>
                        <div class="glass-subcard" style="margin-bottom:14px;"><strong>⚡ Subject XP Tracks</strong><div id="skill-tracks-list" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div></div>
                        <div class="glass-subcard" style="margin-bottom:14px;"><strong>🏅 3D Commendation Medals</strong><div id="badge-gallery" class="badge-gallery-grid" style="margin-top:10px;"></div></div>
                        <div class="glass-subcard"><strong>📓 Mistake Notebook</strong><div id="mistake-notebook-list" class="task-list" style="margin-top:10px;"></div></div>
                        <div class="bottom-spacer"></div>
                    </div>
                </div>
            `);
        }

        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav && !document.getElementById('nav-flashcards')) {
            bottomNav.insertAdjacentHTML('beforeend', `
                <button class="nav-btn" data-view="flashcards" id="nav-flashcards" aria-label="Flashcards">
                    <span style="font-size:18px;line-height:1;">🃏</span><span>Cards</span>
                </button>
                <button class="nav-btn" data-view="mission" id="nav-mission" aria-label="Mission">
                    <span style="font-size:18px;line-height:1;">🚀</span><span>Mission</span>
                </button>
            `);
        }

        /* 5. Ensure Task Edit Button, Delete Subject Button, Focus Audio & Challenge Overlay exist */
        const detailFooter = document.querySelector('#task-detail-overlay .modal-footer');
        if (detailFooter && !document.getElementById('task-edit-btn')) {
            const eb = document.createElement('button');
            eb.id = 'task-edit-btn';
            eb.className = 'btn btn-ghost';
            eb.textContent = '✏️ Edit';
            detailFooter.prepend(eb);
        }

        const esFooter = document.querySelector('#edit-subject-overlay .modal-footer');
        if (esFooter && !document.getElementById('es-delete-btn')) {
            const db = document.createElement('button');
            db.id = 'es-delete-btn';
            db.className = 'btn btn-danger hidden';
            db.textContent = '🗑 Delete';
            esFooter.prepend(db);
        }

        const focusInner = document.querySelector('#focus-overlay .focus-inner');
        if (focusInner && !document.getElementById('focus-duration-pills')) {
            focusInner.insertAdjacentHTML('afterbegin', `
                <div class="filter-chips" id="focus-duration-pills" style="justify-content:center;">
                    <button type="button" class="chip" data-mins="15">15m</button>
                    <button type="button" class="chip active" data-mins="25">25m</button>
                    <button type="button" class="chip" data-mins="50">50m</button>
                    <button type="button" class="chip" data-mins="5">5m Break</button>
                </div>
            `);
            focusInner.insertAdjacentHTML('beforeend', `
                <div class="glass-subcard" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <small style="color:#94A3B8;font-weight:700;">🎧 OFFLINE AMBIENT SYNTH</small>
                    <div class="filter-chips" id="audio-track-pills" style="justify-content:center;">
                        <button type="button" class="chip active" data-track="off">🔇 Off</button>
                        <button type="button" class="chip" data-track="space">🌌 Space</button>
                        <button type="button" class="chip" data-track="rain">🌧️ Rain</button>
                        <button type="button" class="chip" data-track="binaural">🧠 40Hz</button>
                    </div>
                    <input type="range" id="audio-volume-slider" min="0" max="1" step="0.05" value="0.4" style="width:160px;" />
                </div>
            `);
        }

        if (!document.getElementById('challenge-overlay')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="challenge-overlay" class="focus-overlay hidden" role="dialog" aria-modal="true">
                    <button id="challenge-close" class="focus-close-btn">✕ Exit</button>
                    <div class="challenge-card">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span class="count-badge">🧠 Thinking Coach</span>
                            <span id="challenge-step-indicator" class="count-badge">1 / 3</span>
                        </div>
                        <h3 id="challenge-chapter-title"></h3>
                        <p id="challenge-question-text" style="font-size:15px;line-height:1.5;"></p>
                        <textarea id="challenge-input" class="form-input form-textarea" rows="3" placeholder="Type your answer (min 10 chars)…"></textarea>
                        <div id="challenge-action-row" style="display:flex;gap:8px;">
                            <button id="challenge-reveal-btn" class="btn btn-primary" disabled>Reveal Answer</button>
                            <button id="challenge-stuck-btn" class="btn btn-ghost">I'm stuck</button>
                        </div>
                        <div id="challenge-solution-box" class="hidden" style="display:flex;flex-direction:column;gap:10px;">
                            <div class="glass-subcard"><strong>✅ Strong Answer:</strong><p id="challenge-strong-ans" style="font-size:13px;margin-top:4px;"></p></div>
                            <div class="glass-subcard"><strong>🔭 What if…?</strong><p id="challenge-whatif-ans" style="font-size:13px;margin-top:4px;"></p></div>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                <button class="btn btn-sm btn-primary" data-score="1">🎯 Got it</button>
                                <button class="btn btn-sm btn-ghost" data-score="0.5">⚖️ Partly</button>
                                <button class="btn btn-sm btn-danger" data-score="0">❌ Missed</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="fc-modal-overlay" class="modal-overlay hidden">
                    <div class="modal-sheet modal-sheet-sm">
                        <div class="modal-header"><h2 class="modal-title">🃏 Create Flashcard</h2><button id="fc-modal-close" class="modal-close-btn">✕</button></div>
                        <div class="modal-body">
                            <div class="form-group"><label class="form-label">Subject</label><select id="fc-subject-select" class="form-select"></select></div>
                            <div class="form-group"><label class="form-label">Question</label><textarea id="fc-question-input" class="form-input form-textarea" rows="2"></textarea></div>
                            <div class="form-group"><label class="form-label">Answer</label><textarea id="fc-answer-input" class="form-input form-textarea" rows="2"></textarea></div>
                        </div>
                        <div class="modal-footer"><button id="fc-modal-cancel" class="btn btn-ghost">Cancel</button><button id="fc-modal-save" class="btn btn-primary">Save Card</button></div>
                    </div>
                </div>
            `);
        }
    }

    /* ══════════════════════════════════════════
       2. INITIALIZATION
    ══════════════════════════════════════════ */
    async function initApp() {
        try {
            _ensureDOMScaffold();
            await DB.init();
            await restoreBackup();
            await seedDatabase();
            await Themes.init();
            await DB.syncXP();

            _setupNav();
            _setupHeaderControls();
            _setupFlashcards();
            _setupRoadmap();

            QuickAdd.init();
            Search.init();
            Subjects.init();
            ExamModal.init();
            Notifications.init();
            Focus.init();
            Bot.init();

            await _renderCurrentView();
            console.log('[StudyFlow V4 60-FPS] Initialised ✓');
        } catch (err) {
            console.error('[StudyFlow] Init error:', err);
        }
    }

    /* ══════════════════════════════════════════
       3. NAVIGATION ROUTER
    ══════════════════════════════════════════ */
    function navigate(viewName) {
        _currentView = viewName;

        document.querySelectorAll('.view').forEach(v => {
            const isTarget = v.id === `view-${viewName}`;
            v.classList.toggle('active', isTarget);
            if (isTarget) {
                v.querySelector('.view-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
            const isActive = btn.dataset.view === viewName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });

        _renderCurrentView();
    }

    async function _renderCurrentView() {
        if (_currentView === 'dashboard')       await Dashboard.render();
        else if (_currentView === 'subjects')   await Subjects.renderGrid();
        else if (_currentView === 'roadmap')    await renderRoadmapView();
        else if (_currentView === 'flashcards') await renderFlashcardsView();
        else if (_currentView === 'mission')    await renderMissionView();
        else if (_currentView === 'search')     await Search.render();
    }

    function _setupNav() {
        document.getElementById('bottom-nav')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.nav-btn[data-view]');
            if (btn) navigate(btn.dataset.view);
        });
        document.getElementById('mission-badge')?.addEventListener('click', () => navigate('mission'));
        document.getElementById('logo-home-btn')?.addEventListener('click', () => {
            navigate('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ══════════════════════════════════════════
       4. DATA, BACKUP & PREVIOUS-DB MERGE SUITE
    ══════════════════════════════════════════ */
    function _setupHeaderControls() {
        document.getElementById('theme-toggle')?.addEventListener('click', () => Themes.cycleBiome());
        document.getElementById('notif-btn')?.addEventListener('click', () => Notifications.handleBtnClick());

        document.getElementById('export-btn')?.addEventListener('click', async () => {
            await DB.downloadBackup('studyflow-backup');
            showToast('💾 Backup downloaded!', 'success');
        });

        document.getElementById('import-btn')?.addEventListener('click', openDataManagerModal);

        const fileInput = document.getElementById('import-file-input');
        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const mode = fileInput.dataset.importMode || 'merge';
            const autoSafety = fileInput.dataset.autoSafety !== 'false';
            fileInput.value = '';

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (autoSafety) await DB.downloadBackup('studyflow-pre-restore-safety');
                const res = await DB.importBackup(data, mode);
                showToast(`✅ Backup ${res.mode === 'replace' ? 'replaced' : 'merged'} (${res.importedTasks} tasks)!`, 'success');
                await _renderCurrentView();
            } catch (err) {
                console.error(err);
                showToast('❌ Invalid backup JSON file.', 'error');
            }
        });
    }

    function openDataManagerModal() {
        let modal = document.getElementById('data-manager-overlay');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'data-manager-overlay';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-sheet modal-sheet-sm">
                    <div class="modal-handle"></div>
                    <div class="modal-header">
                        <h2 class="modal-title">💾 Backup & Previous DB Manager</h2>
                        <button class="modal-close-btn" id="dm-close">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="glass-subcard" style="display:flex;flex-direction:column;gap:8px;">
                            <strong>1. Save a Backup Copy</strong>
                            <p style="font-size:12px;color:var(--text-secondary)">Download all subjects, chapters, tasks, streaks, flashcards &amp; XP as a <code>.json</code> file.</p>
                            <button class="btn btn-primary" id="dm-download-btn">⬇️ Download Current Backup (.json)</button>
                        </div>
                        <div class="glass-subcard" style="display:flex;flex-direction:column;gap:8px;">
                            <strong>2. Add / Merge Previous Database (23 Tasks)</strong>
                            <p style="font-size:12px;color:var(--text-secondary)">Safely merge your earlier 23 tasks &amp; 9 subjects (Art &amp; Craft, Physics Wallah) without losing current data.</p>
                            <button class="btn btn-primary" id="dm-load-prev-btn">➕ Merge Previous Database Now</button>
                        </div>
                        <div class="glass-subcard" style="display:flex;flex-direction:column;gap:8px;">
                            <strong>3. Restore from a Backup File (.json)</strong>
                            <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;">
                                <input type="checkbox" id="dm-safety-check" checked />
                                Download a safety backup copy first
                            </label>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                <button class="btn btn-ghost" id="dm-import-merge-btn" style="flex:1;">🔀 Smart Merge File</button>
                                <button class="btn btn-danger" id="dm-import-replace-btn" style="flex:1;">⚠️ Replace All</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('#dm-close').addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

            modal.querySelector('#dm-download-btn').addEventListener('click', async () => {
                await DB.downloadBackup('studyflow-backup');
                showToast('💾 Backup downloaded!', 'success');
            });

            modal.querySelector('#dm-load-prev-btn').addEventListener('click', async () => {
                if (modal.querySelector('#dm-safety-check')?.checked) {
                    await DB.downloadBackup('studyflow-safety-before-merge');
                }
                const res = await window.loadPreviousDatabase();
                modal.classList.add('hidden');
                showToast(`✅ Previous DB merged! (${res.importedTasks} new tasks added)`, 'success');
                await _renderCurrentView();
            });

            modal.querySelector('#dm-import-merge-btn').addEventListener('click', () => {
                const inp = document.getElementById('import-file-input');
                inp.dataset.importMode = 'merge';
                inp.dataset.autoSafety = String(Boolean(modal.querySelector('#dm-safety-check')?.checked));
                modal.classList.add('hidden');
                inp.click();
            });

            modal.querySelector('#dm-import-replace-btn').addEventListener('click', () => {
                const inp = document.getElementById('import-file-input');
                inp.dataset.importMode = 'replace';
                inp.dataset.autoSafety = String(Boolean(modal.querySelector('#dm-safety-check')?.checked));
                modal.classList.add('hidden');
                inp.click();
            });
        }
        modal.classList.remove('hidden');
    }

    /* ══════════════════════════════════════════
       5. 60-DAY MASTER ROADMAP VIEW
    ══════════════════════════════════════════ */
    async function renderRoadmapView() {
        const tbody = document.getElementById('roadmap-table-body');
        if (!tbody) return;
        const query   = (document.getElementById('roadmap-search-input')?.value || '').toLowerCase().trim();
        const doneMap = (await DB.getSetting('sf_roadmapDone')) || {};
        const sched   = (window.SF_DATA && SF_DATA.masterSchedule) ? SF_DATA.masterSchedule : [];

        const frag = document.createDocumentFragment();
        for (let i = 0; i < sched.length; i++) {
            const item = sched[i];
            if (query && !JSON.stringify(item).toLowerCase().includes(query)) continue;
            const tr  = document.createElement('tr');
            const key = `rm_day_${item.day}`;
            const isDone = Boolean(doneMap[key]);

            if (item.isSunday) {
                tr.innerHTML = `
                    <td style="font-family:monospace;color:var(--warning);font-weight:700;">Day ${item.day}</td>
                    <td colspan="2"><strong>🔄 ${item.title}</strong><br><small>${item.desc}</small></td>
                    <td><input type="checkbox" ${isDone ? 'checked' : ''} data-rmkey="${key}" /></td>
                `;
            } else {
                tr.innerHTML = `
                    <td style="font-family:monospace;font-weight:700;">Day ${item.day}</td>
                    <td><span class="pair-tag tag-heavy">${item.heavy.sub}</span><div>${item.heavy.title}</div></td>
                    <td><span class="pair-tag tag-light">${item.light.sub}</span><div>${item.light.title}</div></td>
                    <td><input type="checkbox" ${isDone ? 'checked' : ''} data-rmkey="${key}" /></td>
                `;
            }
            frag.appendChild(tr);
        }
        tbody.replaceChildren(frag);
    }

    function _setupRoadmap() {
        document.getElementById('roadmap-search-input')?.addEventListener('input', renderRoadmapView);
        document.getElementById('roadmap-table-body')?.addEventListener('change', async (e) => {
            const cb = e.target.closest('input[data-rmkey]');
            if (!cb) return;
            const map = (await DB.getSetting('sf_roadmapDone')) || {};
            map[cb.dataset.rmkey] = cb.checked;
            await DB.setSetting('sf_roadmapDone', map);
            if (cb.checked) {
                await DB.updateStreak();
                showToast('🧭 Roadmap Day marked complete!', 'success');
            }
        });
    }

    /* ══════════════════════════════════════════
       6. ACTIVE RECALL 3D FLASHCARDS
    ══════════════════════════════════════════ */
    async function renderFlashcardsView() {
        const [subjects, cards] = await Promise.all([
            DB.getAll('subjects'),
            DB.getAll('flashcards')
        ]);

        if (cards.length === 0) {
            const starters = [
                { subjectId: 4, question: 'State Newton’s Second Law of Motion and its formula.', answer: 'Rate of change of momentum is directly proportional to applied force: F = ma.', dueDate: DB.todayStr() },
                { subjectId: 4, question: 'Why are mitochondria called the powerhouse of the cell?', answer: 'They generate ATP energy molecules through cellular respiration.', dueDate: DB.todayStr() },
                { subjectId: 5, question: 'Expand the algebraic identity (a + b)³.', answer: '(a + b)³ = a³ + b³ + 3ab(a + b)', dueDate: DB.todayStr() },
                { subjectId: 7, question: 'Difference between Relative and Absolute cell references?', answer: 'Relative (A1) changes when copied; Absolute ($A$1) stays locked.', dueDate: DB.todayStr() }
            ];
            for (const c of starters) {
                const id = await DB.put('flashcards', c);
                cards.push({ ...c, id });
            }
        }

        const grid    = document.getElementById('fc-decks-grid');
        const theater = document.getElementById('fc-study-theater');
        if (!grid) return;

        grid.classList.remove('hidden');
        theater?.classList.add('hidden');

        const today = DB.todayStr();
        const frag  = document.createDocumentFragment();
        const sortedSubjs = [...subjects].sort((a, b) => (a.order || 0) - (b.order || 0));

        for (let i = 0; i < sortedSubjs.length; i++) {
            const s = sortedSubjs[i];
            const sCards = cards.filter(c => Number(c.subjectId) === s.id);
            const due    = sCards.filter(c => !c.dueDate || c.dueDate <= today);

            const tile = document.createElement('div');
            tile.className = 'fc-deck-tile';
            tile.setAttribute('data-subject-id', s.id);
            tile.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:26px;">${s.icon}</span>
                    <span class="count-badge">${due.length} due · ${sCards.length} total</span>
                </div>
                <div>
                    <h3 style="font-size:16px;font-weight:700;">${s.name}</h3>
                    <p style="font-size:12px;color:var(--text-muted)">${s.subtitle || 'Active Recall Deck'}</p>
                </div>
                <button class="btn btn-sm btn-primary">Practice Deck →</button>
            `;
            tile.addEventListener('click', () => _startDeckStudy(s, sCards));
            frag.appendChild(tile);
        }
        grid.replaceChildren(frag);
    }

    function _startDeckStudy(subject, cards) {
        if (!cards.length) {
            showToast(`🃏 No cards in ${subject.name} yet! Click "+ New Card" to add one.`, 'info');
            return;
        }
        const today = DB.todayStr();
        const due   = cards.filter(c => !c.dueDate || c.dueDate <= today);
        _studyDeckCards = due.length > 0 ? due : cards;
        _studyCardIdx   = 0;

        document.getElementById('fc-decks-grid')?.classList.add('hidden');
        document.getElementById('fc-study-theater')?.classList.remove('hidden');
        document.getElementById('fc-study-deck-name').textContent = `${subject.icon} ${subject.name}`;
        _showCurrentFlashcard();
    }

    function _showCurrentFlashcard() {
        const card = _studyDeckCards[_studyCardIdx];
        if (!card) {
            showToast('🎉 Deck review complete!', 'success');
            renderFlashcardsView();
            return;
        }
        document.getElementById('fc-card-3d')?.classList.remove('is-flipped');
        document.getElementById('fc-rating-row')?.classList.add('hidden');
        document.getElementById('fc-study-counter').textContent = `${_studyCardIdx + 1} / ${_studyDeckCards.length}`;
        document.getElementById('fc-front-text').textContent    = card.question;
        document.getElementById('fc-back-text').textContent     = card.answer;
    }

    function _setupFlashcards() {
        const card3d = document.getElementById('fc-card-3d');
        card3d?.addEventListener('click', () => {
            card3d.classList.toggle('is-flipped');
            document.getElementById('fc-rating-row')?.classList.remove('hidden');
        });

        document.getElementById('fc-exit-study-btn')?.addEventListener('click', renderFlashcardsView);

        document.getElementById('fc-rating-row')?.addEventListener('click', async (e) => {
            const btn = e.target.closest('.fc-rate-btn[data-days]');
            if (!btn) return;
            const days = Number(btn.dataset.days) || 1;
            const card = _studyDeckCards[_studyCardIdx];
            if (card) {
                const next = new Date();
                next.setDate(next.getDate() + days);
                card.dueDate = DB.fmtDate(next);
                await DB.put('flashcards', card);
            }
            _studyCardIdx++;
            _showCurrentFlashcard();
        });

        document.getElementById('fc-new-card-btn')?.addEventListener('click', async () => {
            const subjects = await DB.getAll('subjects');
            const sel = document.getElementById('fc-subject-select');
            sel.innerHTML = subjects.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('');
            document.getElementById('fc-question-input').value = '';
            document.getElementById('fc-answer-input').value   = '';
            document.getElementById('fc-modal-overlay')?.classList.remove('hidden');
        });

        const closeFc = () => document.getElementById('fc-modal-overlay')?.classList.add('hidden');
        document.getElementById('fc-modal-close')?.addEventListener('click', closeFc);
        document.getElementById('fc-modal-cancel')?.addEventListener('click', closeFc);

        document.getElementById('fc-modal-save')?.addEventListener('click', async () => {
            const subjectId = Number(document.getElementById('fc-subject-select')?.value);
            const question  = document.getElementById('fc-question-input')?.value.trim();
            const answer    = document.getElementById('fc-answer-input')?.value.trim();
            if (!question || !answer) { showToast('⚠️ Enter both question and answer.', 'error'); return; }
            await DB.put('flashcards', { subjectId, question, answer, dueDate: DB.todayStr() });
            closeFc();
            showToast('🃏 Flashcard saved!', 'success');
            if (_currentView === 'flashcards') await renderFlashcardsView();
        });
    }

    /* ══════════════════════════════════════════
       7. ISRO MISSION CONTROL (rAF-Throttled 3D Tilt)
    ══════════════════════════════════════════ */
    async function renderMissionView() {
        const [xpInfo, tasks, chapters, progress, streak, focusLog, mistakes] = await Promise.all([
            DB.syncXP(),
            DB.getAll('tasks'),
            DB.getAll('chapters'),
            DB.getAll('chapterProgress'),
            DB.getStreak(),
            DB.getSetting('sf_focusLog'),
            DB.getSetting('sf_mistakes')
        ]);

        document.getElementById('mission-rank-emoji').textContent = xpInfo.rank.emoji;
        document.getElementById('mission-rank-title').textContent = xpInfo.rank.name;
        document.getElementById('mission-xp-sub').textContent = xpInfo.nextRank
            ? `${xpInfo.total} XP · ${xpInfo.nextRank.xp - xpInfo.total} XP to ${xpInfo.nextRank.name}`
            : `${xpInfo.total} XP · Maximum ISRO Commander Rank Achieved!`;
        document.getElementById('mission-xp-bar').style.width = `${xpInfo.pctToNext}%`;

        const totalSteps = (chapters.length || 82) * 4;
        let doneSteps = 0, masteredChaps = 0;
        for (let i = 0; i < progress.length; i++) {
            const p = progress[i];
            if (p.taught)    doneSteps++;
            if (p.classwork) doneSteps++;
            if (p.homework)  doneSteps++;
            if (p.revision)  doneSteps++;
            if (p.mastered)  masteredChaps++;
        }
        const syllabusPct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
        document.getElementById('mars-progress-pct').textContent = `${syllabusPct}% Syllabus`;
        _drawMarsRoverCanvas(syllabusPct);

        const tracksEl = document.getElementById('skill-tracks-list');
        if (tracksEl) {
            tracksEl.innerHTML = Object.entries(xpInfo.tracks || {}).map(([name, pts]) => {
                const w = Math.min(100, Math.round((pts / 600) * 100));
                return `
                    <div>
                        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:3px;">
                            <span>${name}</span><span style="color:var(--accent)">${pts} XP</span>
                        </div>
                        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${w}%"></div></div>
                    </div>
                `;
            }).join('');
        }

        const doneCount = tasks.filter(t => t.status === 'done').length;
        const focusArr  = Array.isArray(focusLog) ? focusLog : [];
        const totalFocusMins = focusArr.reduce((s, f) => s + (Number(f.minutes) || 0), 0);
        const insightsEl = document.getElementById('insights-grid');
        if (insightsEl) {
            insightsEl.innerHTML = `
                <div class="glass-subcard"><span class="stat-label">Best Streak</span><div class="stat-number" style="font-size:20px;">🔥 ${streak.best}d</div></div>
                <div class="glass-subcard"><span class="stat-label">Focus Time</span><div class="stat-number" style="font-size:20px;">⏱ ${totalFocusMins}m</div></div>
                <div class="glass-subcard"><span class="stat-label">Mastered Chaps</span><div class="stat-number" style="font-size:20px;">⭐ ${masteredChaps}</div></div>
                <div class="glass-subcard"><span class="stat-label">Tasks Done</span><div class="stat-number" style="font-size:20px;">✅ ${doneCount}</div></div>
            `;
        }

        /* 14 Badges with Cached-Bounds rAF 3D Tilt (Zero Layout Reflow) */
        const badges = [
            { icon: '🌱', name: 'First Launch',       desc: 'Complete 1st task',        unlocked: doneCount >= 1 },
            { icon: '⚡', name: 'Momentum X',         desc: 'Complete 10 tasks',        unlocked: doneCount >= 10 },
            { icon: '🏆', name: 'Centurion Half',     desc: 'Complete 50 tasks',        unlocked: doneCount >= 50 },
            { icon: '🔥', name: '3-Day Ignition',     desc: 'Reach a 3-day streak',     unlocked: streak.best >= 3 },
            { icon: '☄️', name: '7-Day Orbit',        desc: 'Reach a 7-day streak',     unlocked: streak.best >= 7 },
            { icon: '🌞', name: '30-Day Solar Sync',  desc: 'Reach a 30-day streak',    unlocked: streak.best >= 30 },
            { icon: '🧠', name: 'First Mastery',      desc: 'Master 1 NCERT chapter',   unlocked: masteredChaps >= 1 },
            { icon: '📚', name: '10x Scholar',        desc: 'Master 10 NCERT chapters', unlocked: masteredChaps >= 10 },
            { icon: '⏱️', name: 'Deep Work Initiate', desc: 'Finish 1 Focus session',   unlocked: focusArr.length >= 1 },
            { icon: '🧘', name: 'Zen Master',         desc: 'Finish 10 Focus sessions', unlocked: focusArr.length >= 10 },
            { icon: '🚀', name: 'Payload Specialist', desc: 'Reach 500 ISRO XP',        unlocked: xpInfo.total >= 500 },
            { icon: '🛰️', name: 'Orbital Engineer',   desc: 'Reach 1,500 ISRO XP',      unlocked: xpInfo.total >= 1500 },
            { icon: '🌌', name: 'Flight Director',    desc: 'Reach 3,000 ISRO XP',      unlocked: xpInfo.total >= 3000 },
            { icon: '⭐', name: 'Mission Commander',  desc: 'Reach 5,000 ISRO XP',      unlocked: xpInfo.total >= 5000 }
        ];

        const gallery = document.getElementById('badge-gallery');
        if (gallery) {
            const frag = document.createDocumentFragment();
            badges.forEach(b => {
                const card = document.createElement('div');
                card.className = `badge-3d-card ${b.unlocked ? '' : 'locked'}`;
                card.innerHTML = `
                    <span class="badge-3d-icon" style="font-size:28px;">${b.icon}</span>
                    <strong style="font-size:12.5px;">${b.name}</strong>
                    <span style="font-size:11px;color:var(--text-muted)">${b.desc}</span>
                `;
                let rect = null;
                let rafId = null;
                card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
                card.addEventListener('mousemove', (e) => {
                    if (!rect || rafId) return;
                    const cx = e.clientX, cy = e.clientY;
                    rafId = requestAnimationFrame(() => {
                        const x = ((cx - rect.left) / rect.width - 0.5) * 18;
                        const y = ((cy - rect.top) / rect.height - 0.5) * -18;
                        card.style.transform = `perspective(500px) rotateX(${y}deg) rotateY(${x}deg)`;
                        rafId = null;
                    });
                });
                card.addEventListener('mouseleave', () => {
                    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                    card.style.transform = '';
                });
                frag.appendChild(card);
            });
            gallery.replaceChildren(frag);
        }

        /* Mistake Notebook */
        const mistakeEl = document.getElementById('mistake-notebook-list');
        if (mistakeEl) {
            const mList = Array.isArray(mistakes) ? mistakes : [];
            if (mList.length === 0) {
                mistakeEl.innerHTML = `<div class="empty-state"><p class="empty-title">Zero pending mistakes!</p></div>`;
            } else {
                const frag = document.createDocumentFragment();
                mList.forEach(m => {
                    const div = document.createElement('div');
                    div.className = 'glass-subcard';
                    div.innerHTML = `
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <strong style="font-size:12.5px;color:var(--accent)">${m.chapterName}</strong>
                            <button class="btn btn-sm btn-primary">Practise →</button>
                        </div>
                        <p style="font-size:13px;font-weight:600;margin-top:4px;">Q: ${m.q}</p>
                        <p style="font-size:12px;color:var(--text-secondary);margin-top:3px;">✅ ${m.ans}</p>
                    `;
                    div.querySelector('button')?.addEventListener('click', () => {
                        navigate('subjects');
                        setTimeout(() => Subjects.openPanel(m.subjectId, m.chapterId), 160);
                    });
                    frag.appendChild(div);
                });
                mistakeEl.replaceChildren(frag);
            }
        }
    }

    function _drawMarsRoverCanvas(pct) {
        const canvas = document.getElementById('mars-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#090D1A');
        grad.addColorStop(1, '#2D1410');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#7C2D12';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, 104);
        ctx.quadraticCurveTo(150, 88, 300, 102);
        ctx.quadraticCurveTo(450, 116, w, 98);
        ctx.lineTo(w, h);
        ctx.fill();

        [25, 50, 75, 100].forEach(m => {
            const fx = 35 + ((w - 75) * (m / 100));
            ctx.strokeStyle = pct >= m ? '#2ED573' : '#64748B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fx, 100);
            ctx.lineTo(fx, 72);
            ctx.stroke();
            ctx.fillStyle = pct >= m ? '#2ED573' : '#94A3B8';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`${m}%`, fx - 10, 66);
        });

        const rx = 30 + ((w - 80) * (Math.min(100, Math.max(0, pct)) / 100));
        ctx.font = '22px sans-serif';
        ctx.fillText('🚜', rx - 11, 98);
    }

    /* ══════════════════════════════════════════
       8. TOASTS & STREAK UI
    ══════════════════════════════════════════ */
    function updateStreakUI(streak) {
        const countEl = document.getElementById('streak-count');
        if (countEl) countEl.textContent = streak ? streak.count : 0;
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function showUndoToast(message, onUndo) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="flex:1">${message}</span><button class="btn btn-sm btn-primary">↩️ Undo</button>`;
        let undone = false;
        toast.querySelector('button')?.addEventListener('click', () => {
            if (undone) return;
            undone = true;
            toast.remove();
            if (onUndo) onUndo();
        });
        container.appendChild(toast);
        setTimeout(() => { if (!undone) toast.remove(); }, 9000);
    }

    async function refresh() {
        await _renderCurrentView();
    }

    return {
        initApp,
        navigate,
        showToast,
        showUndoToast,
        updateStreakUI,
        refresh,
        openDataManagerModal
    };
})();

document.addEventListener('DOMContentLoaded', App.initApp);