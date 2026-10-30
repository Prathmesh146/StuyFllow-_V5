/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/focus.js
   Drift-Free Timestamp Timer (15/25/50/5m) + Zero-Leak Cached
   Web Audio Synthesizer (Deep Space · Lofi Rain · 40Hz Gamma)
   ============================================================ */
'use strict';

const Focus = (() => {

    let _durationMins = 25;
    let _totalSecs    = 25 * 60;
    let _remaining    = 25 * 60;
    let _endTimestamp = null;
    let _timerId      = null;
    let _running      = false;
    let _taskTitle    = '';

    /* Zero-Leak Web Audio State */
    let _audioCtx          = null;
    let _masterGain        = null;
    let _cachedRainBuffer  = null;
    let _activeNodes       = [];

    const el = (id) => document.getElementById(id);

    function _fmt(secs) {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function _updateDisplay() {
        const timeEl = el('focus-time');
        if (timeEl) timeEl.textContent = _fmt(_remaining);

        const arc = el('focus-arc');
        const pct = 1 - (_remaining / (_totalSecs || 1));
        if (arc) arc.style.strokeDashoffset = 339 * (1 - pct);

        document.title = _running
            ? `⏱ ${_fmt(_remaining)} — StudyFlow Focus`
            : 'StudyFlow — Grade 9 Academic Operating System';
    }

    function _tick() {
        if (!_running || !_endTimestamp) return;
        const left = Math.max(0, Math.round((_endTimestamp - Date.now()) / 1000));
        if (left !== _remaining) {
            _remaining = left;
            _updateDisplay();
        }
        if (_remaining <= 0) {
            _clearTimer();
            _running = false;
            _onComplete();
        }
    }

    function _clearTimer() {
        if (_timerId) { clearInterval(_timerId); _timerId = null; }
    }

    async function _onComplete() {
        _playChime();
        const startBtn = el('focus-start');
        if (startBtn) startBtn.textContent = '▶ Start Again';

        if (_durationMins > 5) {
            const log = (await DB.getSetting('sf_focusLog')) || [];
            log.push({ at: new Date().toISOString(), minutes: _durationMins, task: _taskTitle });
            await DB.setSetting('sf_focusLog', log.slice(-1000));
            await DB.updateStreak();
            await DB.syncXP();
            await Dashboard.render();
            Dashboard.launchConfetti();
            App.showToast(`🎉 ${_durationMins}m Focus Complete! +${Math.round(_durationMins * 1.6)} ISRO XP!`, 'success');
        } else {
            App.showToast('🧘 5m Break Finished! Ready for your next sprint.', 'info');
        }
    }

    function _toggleStart() {
        const btn = el('focus-start');
        if (_running) {
            _clearTimer();
            _running = false;
            if (btn) btn.textContent = '▶ Resume';
        } else {
            if (_remaining <= 0) _remaining = _totalSecs;
            _endTimestamp = Date.now() + (_remaining * 1000);
            _running = true;
            _timerId = setInterval(_tick, 250);
            if (btn) btn.textContent = '⏸ Pause';
        }
        _updateDisplay();
    }

    function _reset() {
        _clearTimer();
        _running   = false;
        _remaining = _totalSecs;
        _updateDisplay();
        const btn = el('focus-start');
        if (btn) btn.textContent = '▶ Start';
    }

    /* ══════════════════════════════════════════
       ZERO-LEAK WEB AUDIO SYNTHESIZER
    ══════════════════════════════════════════ */
    function _ensureAudio() {
        try {
            if (!_audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return null;
                _audioCtx   = new Ctx();
                _masterGain = _audioCtx.createGain();
                _masterGain.gain.value = Number(el('audio-volume-slider')?.value || 0.4);
                _masterGain.connect(_audioCtx.destination);
            }
            if (_audioCtx.state === 'suspended') _audioCtx.resume();
            return _audioCtx;
        } catch (_) {
            return null;
        }
    }

    function _stopAudio() {
        while (_activeNodes.length > 0) {
            const node = _activeNodes.pop();
            try { if (typeof node.stop === 'function') node.stop(); } catch (_) {}
            try { if (typeof node.disconnect === 'function') node.disconnect(); } catch (_) {}
        }
    }

    function _startTrack(trackName) {
        _stopAudio();
        if (!trackName || trackName === 'off') return;

        const ctx = _ensureAudio();
        if (!ctx) return;

        if (trackName === 'space') {
            [60, 65, 90].forEach(freq => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.value = 0.22;
                osc.connect(gain);
                gain.connect(_masterGain);
                osc.start();
                _activeNodes.push(osc, gain);
            });
        } else if (trackName === 'rain') {
            /* Reuse cached 2-second buffer so CPU never regenerates noise */
            if (!_cachedRainBuffer) {
                const bufSize = ctx.sampleRate * 2;
                _cachedRainBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const data = _cachedRainBuffer.getChannelData(0);
                for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            }
            const noise  = ctx.createBufferSource();
            noise.buffer = _cachedRainBuffer;
            noise.loop   = true;

            const filter = ctx.createBiquadFilter();
            filter.type  = 'lowpass';
            filter.frequency.value = 780;

            noise.connect(filter);
            filter.connect(_masterGain);
            noise.start();
            _activeNodes.push(noise, filter);
        } else if (trackName === 'binaural') {
            const merger = ctx.createChannelMerger(2);
            const oscL   = ctx.createOscillator();
            const oscR   = ctx.createOscillator();
            const gain   = ctx.createGain();
            oscL.frequency.value = 200;
            oscR.frequency.value = 240;
            gain.gain.value = 0.18;

            oscL.connect(merger, 0, 0);
            oscR.connect(merger, 0, 1);
            merger.connect(gain);
            gain.connect(_masterGain);
            oscL.start();
            oscR.start();
            _activeNodes.push(oscL, oscR, merger, gain);
        }
    }

    function _playChime() {
        try {
            const ctx = _ensureAudio();
            if (!ctx) return;
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(528, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.28, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.15);
            osc.onended = () => {
                try { osc.disconnect(); gain.disconnect(); } catch (_) {}
            };
        } catch (_) {}
    }

    async function open() {
        const overlay = el('focus-overlay');
        if (!overlay) return;
        _reset();

        const tasks   = await DB.getAll('tasks');
        const pending = tasks.filter(t => t.status !== 'done');
        pending.sort((a, b) => (a.priority === 'urgent' ? -1 : 1));
        _taskTitle = pending[0] ? pending[0].title : 'Deep NCERT Syllabus Focus';
        const titleEl = el('focus-task-title');
        if (titleEl) titleEl.textContent = `🎯 Target: ${_taskTitle}`;

        overlay.classList.remove('hidden');
        document.body.classList.add('focus-mode-active');
    }

    function close() {
        _clearTimer();
        _stopAudio();
        _running = false;
        document.title = 'StudyFlow — Grade 9 Academic Operating System';
        el('focus-overlay')?.classList.add('hidden');
        document.body.classList.remove('focus-mode-active');
    }

    function init() {
        el('focus-btn')?.addEventListener('click', open);
        el('focus-close')?.addEventListener('click', close);
        el('focus-start')?.addEventListener('click', _toggleStart);
        el('focus-reset')?.addEventListener('click', _reset);

        el('focus-duration-pills')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip[data-mins]');
            if (!btn) return;
            document.querySelectorAll('#focus-duration-pills .chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _durationMins = Number(btn.dataset.mins) || 25;
            _totalSecs    = _durationMins * 60;
            _reset();
        });

        el('audio-track-pills')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip[data-track]');
            if (!btn) return;
            document.querySelectorAll('#audio-track-pills .chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _startTrack(btn.dataset.track);
        });

        el('audio-volume-slider')?.addEventListener('input', (e) => {
            if (_masterGain) _masterGain.gain.value = Number(e.target.value);
        });
    }

    return { init, open, close };
})();