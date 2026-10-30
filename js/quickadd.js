/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/quickadd.js
   Zero Duplicate Listeners, Create & Edit Tasks, New Subject,
   Off-Thread Canvas Photo Compression (<=500KB)
   ============================================================ */
'use strict';

const QuickAdd = (() => {

    let _subjectTaskPriority = 'normal';
    let _generalTaskPriority = 'normal';
    let _compressedImageData = null;
    let _editingTaskId       = null;
    let _fabOpen             = false;

    function openFabMenu() {
        const menu     = document.getElementById('fab-menu');
        const backdrop = document.getElementById('fab-backdrop');
        const icon     = document.getElementById('fab-icon-svg');
        if (!menu) return;
        _fabOpen = true;
        menu.classList.remove('hidden');
        menu.classList.add('fab-menu-open');
        backdrop?.classList.remove('hidden');
        backdrop?.classList.add('fab-backdrop-visible');
        if (icon) icon.style.transform = 'rotate(45deg)';
    }

    function closeFabMenu() {
        const menu     = document.getElementById('fab-menu');
        const backdrop = document.getElementById('fab-backdrop');
        const icon     = document.getElementById('fab-icon-svg');
        if (!menu) return;
        _fabOpen = false;
        menu.classList.remove('fab-menu-open');
        backdrop?.classList.remove('fab-backdrop-visible');
        if (icon) icon.style.transform = '';
        menu.classList.add('hidden');
        backdrop?.classList.add('hidden');
    }

    function toggleFabMenu() {
        _fabOpen ? closeFabMenu() : openFabMenu();
    }

    async function openSubjectTask(prefilledSubjectId = null, editTask = null) {
        closeFabMenu();
        _editingTaskId       = editTask ? editTask.id : null;
        _subjectTaskPriority = editTask ? editTask.priority : 'normal';
        _compressedImageData = editTask ? editTask.imageData : null;

        const heading = document.getElementById('qa-modal-heading') || document.querySelector('#quickadd-sheet .modal-title');
        if (heading) heading.textContent = editTask ? '✏️ Edit Subject Task' : '📝 Task with Subject';

        document.getElementById('qa-title').value = editTask ? editTask.title : '';
        document.getElementById('qa-notes').value = editTask ? (editTask.notes || '') : '';
        document.getElementById('qa-date').value  = editTask ? (editTask.dueDate || DB.todayStr()) : DB.todayStr();
        document.getElementById('qa-subject-error')?.classList.add('hidden');

        await populateSubjectSelect('qa-subject', editTask ? editTask.subjectId : prefilledSubjectId);
        if (editTask && editTask.chapterId) {
            document.getElementById('qa-chapter').value = editTask.chapterId;
        }

        _syncPriorityUI('prio-normal', 'prio-urgent', _subjectTaskPriority);
        _renderImagePreview();

        document.getElementById('quickadd-overlay')?.classList.remove('hidden');
        setTimeout(() => document.getElementById('qa-title')?.focus(), 120);
    }

    function closeSubjectTask() {
        document.getElementById('quickadd-overlay')?.classList.add('hidden');
        _editingTaskId = null;
        _compressedImageData = null;
    }

    async function submitSubjectTask() {
        const title  = document.getElementById('qa-title')?.value.trim();
        const subjId = Number(document.getElementById('qa-subject')?.value);
        const chapId = Number(document.getElementById('qa-chapter')?.value) || null;
        const date   = document.getElementById('qa-date')?.value || DB.todayStr();
        const notes  = document.getElementById('qa-notes')?.value.trim();

        if (!title)  { App.showToast('⚠️ Please enter a task title.', 'error'); return; }
        if (!subjId) { document.getElementById('qa-subject-error')?.classList.remove('hidden'); return; }

        let record = {
            title,
            subjectId: subjId,
            chapterId: chapId,
            dueDate:   date,
            priority:  _subjectTaskPriority,
            status:    'pending',
            notes:     notes || null,
            imageData: _compressedImageData || null,
            isGeneral: false,
            createdAt: new Date().toISOString()
        };

        if (_editingTaskId) {
            const old = await DB.get('tasks', _editingTaskId);
            if (old) record = { ...old, ...record, id: _editingTaskId };
        }

        await DB.put('tasks', record);
        closeSubjectTask();
        App.showToast(_editingTaskId ? '✅ Task updated!' : '✅ Task added!', 'success');
        await App.refresh();
    }

    function openGeneralTask(editTask = null) {
        closeFabMenu();
        _editingTaskId       = editTask ? editTask.id : null;
        _generalTaskPriority = editTask ? editTask.priority : 'normal';

        document.getElementById('gt-title').value    = editTask ? editTask.title : '';
        document.getElementById('gt-category').value = editTask ? (editTask.category || 'general') : 'general';
        document.getElementById('gt-date').value     = editTask ? (editTask.dueDate || DB.todayStr()) : DB.todayStr();
        document.getElementById('gt-notes').value    = editTask ? (editTask.notes || '') : '';

        _syncPriorityUI('gt-prio-normal', 'gt-prio-urgent', _generalTaskPriority);
        document.getElementById('general-task-overlay')?.classList.remove('hidden');
        setTimeout(() => document.getElementById('gt-title')?.focus(), 120);
    }

    function closeGeneralTask() {
        document.getElementById('general-task-overlay')?.classList.add('hidden');
        _editingTaskId = null;
    }

    async function submitGeneralTask() {
        const title    = document.getElementById('gt-title')?.value.trim();
        const category = document.getElementById('gt-category')?.value || 'general';
        const date     = document.getElementById('gt-date')?.value || DB.todayStr();
        const notes    = document.getElementById('gt-notes')?.value.trim();

        if (!title) { App.showToast('⚠️ Please enter a task title.', 'error'); return; }

        let record = {
            title,
            subjectId: null,
            chapterId: null,
            dueDate:   date,
            priority:  _generalTaskPriority,
            status:    'pending',
            notes:     notes || null,
            imageData: null,
            isGeneral: true,
            category,
            createdAt: new Date().toISOString()
        };

        if (_editingTaskId) {
            const old = await DB.get('tasks', _editingTaskId);
            if (old) record = { ...old, ...record, id: _editingTaskId };
        }

        await DB.put('tasks', record);
        closeGeneralTask();
        App.showToast(_editingTaskId ? '📌 General task updated!' : '📌 General task added!', 'success');
        await App.refresh();
    }

    function openEditTask(task) {
        if (!task) return;
        if (task.isGeneral) openGeneralTask(task);
        else openSubjectTask(task.subjectId, task);
    }

    function openNewSubject() {
        closeFabMenu();
        document.getElementById('ns-name').value     = '';
        document.getElementById('ns-subtitle').value = '';
        document.getElementById('ns-icon').value     = '📖';
        document.getElementById('ns-color').value    = '#7C6FFF';
        document.getElementById('new-subject-overlay')?.classList.remove('hidden');
        setTimeout(() => document.getElementById('ns-name')?.focus(), 120);
    }

    function closeNewSubject() {
        document.getElementById('new-subject-overlay')?.classList.add('hidden');
    }

    async function submitNewSubject() {
        const name     = document.getElementById('ns-name')?.value.trim();
        const subtitle = document.getElementById('ns-subtitle')?.value.trim() || '';
        const icon     = document.getElementById('ns-icon')?.value.trim() || '📖';
        const color    = document.getElementById('ns-color')?.value || '#7C6FFF';

        if (!name) { App.showToast('⚠️ Enter a subject name.', 'error'); return; }

        const existing = await DB.getAll('subjects');
        const maxId  = existing.reduce((m, s) => Math.max(m, Number(s.id) || 0), 9);
        const maxOrd = existing.reduce((m, s) => Math.max(m, Number(s.order) || 0), 9);

        await DB.put('subjects', {
            id: maxId + 1,
            name, subtitle, icon, color,
            order: maxOrd + 1,
            isCustom: true
        });

        closeNewSubject();
        App.showToast(`📚 "${name}" created!`, 'success');
        await Subjects.renderGrid();
        App.navigate('subjects');
    }

    async function populateSubjectSelect(selectId, prefilledId = null) {
        const subjects = await DB.getAll('subjects');
        subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
        const sel = document.getElementById(selectId);
        if (!sel) return;

        const frag = document.createDocumentFragment();
        const defOpt = document.createElement('option');
        defOpt.value = '';
        defOpt.textContent = '— Select Subject —';
        frag.appendChild(defOpt);

        for (let i = 0; i < subjects.length; i++) {
            const s = subjects[i];
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.icon} ${s.name}`;
            frag.appendChild(opt);
        }
        sel.replaceChildren(frag);

        if (prefilledId) {
            sel.value = prefilledId;
            await populateChapterSelect('qa-chapter', prefilledId);
        } else {
            const ch = document.getElementById('qa-chapter');
            if (ch) { ch.innerHTML = '<option value="">Select Chapter</option>'; ch.disabled = true; }
        }
    }

    async function populateChapterSelect(selectId, subjectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        if (!subjectId) {
            sel.innerHTML = '<option value="">Select Chapter</option>';
            sel.disabled = true;
            return;
        }

        const chapters = await DB.getByIndex('chapters', 'subjectId', Number(subjectId));
        chapters.sort((a, b) => (a.order || 0) - (b.order || 0));

        const frag = document.createDocumentFragment();
        const defOpt = document.createElement('option');
        defOpt.value = '';
        defOpt.textContent = 'Select Chapter';
        frag.appendChild(defOpt);

        for (let i = 0; i < chapters.length; i++) {
            const c = chapters[i];
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = (c.isCustom ? '✏️ ' : '') + c.name;
            frag.appendChild(opt);
        }
        sel.replaceChildren(frag);
        sel.disabled = chapters.length === 0;
    }

    function _syncPriorityUI(normalId, urgentId, val) {
        document.getElementById(normalId)?.classList.toggle('active', val === 'normal');
        document.getElementById(urgentId)?.classList.toggle('active', val === 'urgent');
    }

    function _renderImagePreview() {
        const preview = document.getElementById('image-preview-area');
        if (!preview) return;
        if (_compressedImageData) {
            preview.className = 'image-preview-filled';
            preview.innerHTML = `
                <img src="${_compressedImageData}" alt="Attached photo" />
                <button type="button" class="image-remove-btn" id="image-remove-btn">✕</button>
            `;
            document.getElementById('image-remove-btn')?.addEventListener('click', (ev) => {
                ev.stopPropagation();
                _compressedImageData = null;
                _renderImagePreview();
            });
        } else {
            preview.className = 'image-preview-empty';
            preview.innerHTML = `<span>📷 Tap to attach a photo (≤500KB)</span>`;
        }
    }

    function compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_W = 1000, MAX_H = 750;
                    let w = img.width, h = img.height;
                    if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
                    if (h > MAX_H) { w = Math.round(w * MAX_H / h); h = MAX_H; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    let quality = 0.75;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    while (dataUrl.length * 0.75 > 500 * 1024 && quality > 0.2) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(dataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function init() {
        document.getElementById('nav-quickadd')?.addEventListener('click', toggleFabMenu);
        document.getElementById('fab-backdrop')?.addEventListener('click', closeFabMenu);

        document.getElementById('fam-subject-task')?.addEventListener('click', () => openSubjectTask());
        document.getElementById('fam-general-task')?.addEventListener('click', () => openGeneralTask());
        document.getElementById('fam-add-subject')?.addEventListener('click', openNewSubject);

        /* Priority listeners bound strictly ONCE */
        document.getElementById('prio-normal')?.addEventListener('click', () => {
            _subjectTaskPriority = 'normal';
            _syncPriorityUI('prio-normal', 'prio-urgent', 'normal');
        });
        document.getElementById('prio-urgent')?.addEventListener('click', () => {
            _subjectTaskPriority = 'urgent';
            _syncPriorityUI('prio-normal', 'prio-urgent', 'urgent');
        });
        document.getElementById('gt-prio-normal')?.addEventListener('click', () => {
            _generalTaskPriority = 'normal';
            _syncPriorityUI('gt-prio-normal', 'gt-prio-urgent', 'normal');
        });
        document.getElementById('gt-prio-urgent')?.addEventListener('click', () => {
            _generalTaskPriority = 'urgent';
            _syncPriorityUI('gt-prio-normal', 'gt-prio-urgent', 'urgent');
        });

        document.getElementById('quickadd-close')?.addEventListener('click', closeSubjectTask);
        document.getElementById('qa-cancel')?.addEventListener('click', closeSubjectTask);
        document.getElementById('qa-subject')?.addEventListener('change', async (e) => {
            document.getElementById('qa-subject-error')?.classList.add('hidden');
            await populateChapterSelect('qa-chapter', e.target.value);
        });
        document.getElementById('qa-submit')?.addEventListener('click', submitSubjectTask);

        document.getElementById('image-upload-wrap')?.addEventListener('click', () => {
            document.getElementById('qa-image')?.click();
        });
        document.getElementById('qa-image')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            _compressedImageData = await compressImage(file);
            _renderImagePreview();
        });

        document.getElementById('gt-close')?.addEventListener('click', closeGeneralTask);
        document.getElementById('gt-cancel')?.addEventListener('click', closeGeneralTask);
        document.getElementById('gt-submit')?.addEventListener('click', submitGeneralTask);

        document.getElementById('ns-close')?.addEventListener('click', closeNewSubject);
        document.getElementById('ns-cancel')?.addEventListener('click', closeNewSubject);
        document.getElementById('ns-submit')?.addEventListener('click', submitNewSubject);
        document.querySelectorAll('#color-presets .color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('ns-color').value = btn.dataset.color;
            });
        });
    }

    return {
        init,
        open: openSubjectTask,
        openSubjectTask,
        openGeneralTask,
        openEditTask,
        openNewSubject,
        closeFabMenu
    };
})();