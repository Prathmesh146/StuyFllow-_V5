/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/bot.js
   Instant 0ms Offline Pattern-Matching StudyFlow Helper Bot
   ============================================================ */
'use strict';

const Bot = (() => {

    const KB = [
        {
            patterns: [/add.*(task|homework|work)/i, /how.*add/i, /create.*task/i, /edit.*task/i],
            response: `📝 **Adding & Editing Tasks:**\n• Click **+ (Add)** to create a **Task with Subject**, **General Task**, or **New Subject**.\n• Click any task card → **✏️ Edit** to update it, or **🗑 Delete** (with a 9-second **Undo** toast!).`
        },
        {
            patterns: [/backup/i, /export/i, /restore/i, /previous.*db/i, /old.*data/i, /merge/i],
            response: `💾 **Backup & Previous DB Manager:**\nClick the **Upload ↑** icon in the top header!\n• **Download Current Backup:** Saves a full \`.json\` file.\n• **Merge Previous Database:** Restores your earlier 23 tasks & 9 subjects without deleting current progress.\n• **Smart Merge / Replace File:** Upload any \`.json\` backup.`
        },
        {
            patterns: [/challenge/i, /mastered/i, /thinking.*coach/i, /lock/i],
            response: `🧠 **Chapter Mastery & Thinking Coach:**\nOpen **Subjects** → click a Subject → expand any Chapter:\n1. Tick all 4 steps (*Taught, Classwork, Homework, Revision*).\n2. Pass **🧠 Challenge Me** with **80%+**.\n3. Click **⭐ Mastered** for **+100 ISRO XP**!`
        },
        {
            patterns: [/xp/i, /rank/i, /isro/i, /mission/i, /badge/i, /rover/i],
            response: `🚀 **ISRO Mission Control:**\n• Subject Task = **+20 XP** (Urgent = **+35 XP**)\n• Chapter Step = **+10 XP** | Mastered Chapter = **+100 XP**\n• Ranks: *Aeronautical Trainee (0) → Payload Specialist (500) → Orbital Engineer (1500) → Flight Director (3000) → ISRO Mission Commander (5000+)*!`
        },
        {
            patterns: [/flashcard/i, /active.*recall/i, /flip/i],
            response: `🃏 **3D Active Recall Flashcards:**\nOpen the **Flashcards** tab → **+ Create Flashcard**.\nClick any subject deck to flip cards in 3D and rate **Hard (1d)**, **Good (3d)**, or **Easy (7d)**.`
        },
        {
            patterns: [/routine/i, /kendra/i, /aarti/i, /bhajan/i, /schedule/i],
            response: `🗓️ **Routine Matrix (IST):**\nMaps your daily blocks (Morning Prep, School & Van Commute, **6–7 PM Kendra Aarti**, and **9–10:30 PM Bhajan**) and highlights your **Prime Study Windows** with your top priority task.`
        },
        {
            patterns: [/focus/i, /pomodoro/i, /timer/i, /sound/i, /audio/i, /binaural/i],
            response: `⏱️ **Zen Focus Chamber & Web Audio Synth:**\nClick the **⏱️ Clock icon** in the header.\nPick **15m, 25m, 50m, or 5m Break**, and toggle **🌌 Deep Space**, **🌧️ Lofi Rain**, or **🧠 40Hz Gamma Binaural** offline audio!`
        },
        {
            patterns: [/theme/i, /biome/i, /dark/i, /light/i, /aurora/i],
            response: `🌗 **Time-Synced Biomes:**\nClick the **Sun/Moon** button in the header to cycle:\n• **Auto Time-Synced**\n• **🌌 Cosmic Aurora (Dark)**\n• **🌅 Morning Dew (High-Contrast Light)**\n• **🎯 Deep Focus**`
        }
    ];

    const HELP_TEXT = `🤖 **StudyFlow Offline Guide**\nAsk me about:\n• **Backup & Previous DB Merge**\n• **Challenge Me & Mastered Lock**\n• **ISRO Ranks, XP & Rover**\n• **3D Flashcards & Routine Matrix**\n• **Pomodoro & 40Hz Gamma Audio**`;

    function _reply(input) {
        const text = input.trim();
        if (!text || /^help$/i.test(text)) return HELP_TEXT;
        for (let i = 0; i < KB.length; i++) {
            if (KB[i].patterns.some(p => p.test(text))) return KB[i].response;
        }
        return HELP_TEXT;
    }

    function _md(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
    }

    function _addMsg(text, role) {
        const log = document.getElementById('bot-log');
        if (!log) return;
        const d = document.createElement('div');
        d.className = `bot-message bot-${role}`;
        d.innerHTML = _md(text);
        log.appendChild(d);
        log.scrollTop = log.scrollHeight;
    }

    function _send() {
        const inp = document.getElementById('bot-input');
        const txt = inp?.value.trim();
        if (!txt) return;
        inp.value = '';
        _addMsg(txt, 'user');
        requestAnimationFrame(() => _addMsg(_reply(txt), 'bot'));
    }

    function init() {
        const panel = document.getElementById('bot-panel');
        const toggle = () => {
            if (!panel) return;
            const hidden = panel.classList.toggle('hidden');
            if (!hidden && document.getElementById('bot-log')?.childElementCount === 0) {
                _addMsg(HELP_TEXT, 'bot');
            }
        };
        document.getElementById('bot-toggle')?.addEventListener('click', toggle);
        document.getElementById('bot-close')?.addEventListener('click', toggle);
        document.getElementById('bot-send')?.addEventListener('click', _send);
        document.getElementById('bot-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); _send(); }
        });
    }

    return { init };
})();