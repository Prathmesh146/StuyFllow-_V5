/* ============================================================
   STUDYFLOW V4 FLAGSHIP  |  js/themes.js
   Time-Synced Biomes (Morning Dew · Deep Focus · Cosmic Aurora),
   Live IST Header Clock, 4-Year Indian Festival Calendar Sync,
   Exam Urgency Engine & March 11 Birthday Fireworks Easter Egg
   ============================================================ */
'use strict';

const Themes = (() => {

    let _clockTimer = null;

    /* ════════════════════════════════════════════
       1. FESTIVAL PALETTES (Matched to main.css vars)
    ════════════════════════════════════════════ */
    const FESTIVALS = [
        {
            name: 'Ganeshotsav', emoji: '🐘',
            vars: {
                '--bg': '#170D02', '--surface': 'rgba(43, 24, 0, 0.85)', '--surface-solid': '#2B1800', '--surface-2': '#3A2000',
                '--primary': '#FF8C00', '--primary-light': '#FFB703', '--accent': '#FFD700',
                '--festival-accent': '#FF8C00'
            },
            banner: 'Ganpati Bappa Morya! Start every study session with a calm mind. 🐘🪔'
        },
        {
            name: 'Diwali', emoji: '🪔',
            vars: {
                '--bg': '#0D0800', '--surface': 'rgba(28, 17, 2, 0.86)', '--surface-solid': '#1A1000', '--surface-2': '#261800',
                '--primary': '#FF9F1C', '--primary-light': '#FFD166', '--accent': '#FFD700',
                '--festival-accent': '#FFB020'
            },
            banner: 'Happy Diwali! May your hard work and knowledge shine bright. 🪔✨'
        },
        {
            name: 'Holi', emoji: '🎨',
            vars: {
                '--bg': '#0F021F', '--surface': 'rgba(30, 5, 56, 0.84)', '--surface-solid': '#1A0030', '--surface-2': '#280548',
                '--primary': '#FF2D78', '--primary-light': '#FF70A6', '--accent': '#00F5D4',
                '--festival-accent': '#FF2D78'
            },
            banner: 'Happy Holi! Colours of joy and focus! 🎨🌈'
        },
        {
            name: 'Independence Day', emoji: '🇮🇳',
            vars: {
                '--primary': '#FF9933', '--accent': '#138808', '--festival-accent': '#FF9933'
            },
            banner: 'Jai Hind! Happy Independence Day — Build for Bharat, Aim for ISRO! 🇮🇳🚀'
        },
        {
            name: 'Republic Day', emoji: '🇮🇳',
            vars: {
                '--primary': '#FF9933', '--accent': '#138808', '--festival-accent': '#FF9933'
            },
            banner: 'Happy Republic Day! Jai Hind! 🇮🇳'
        },
        {
            name: 'Navratri', emoji: '💃',
            vars: {
                '--primary': '#D946EF', '--accent': '#F59E0B', '--festival-accent': '#D946EF'
            },
            banner: 'Subh Navratri! Jai Mata Di! 💃✨'
        },
        {
            name: 'Dussehra', emoji: '🏹',
            vars: {
                '--primary': '#F97316', '--accent': '#EAB308', '--festival-accent': '#F97316'
            },
            banner: 'Happy Dussehra! Discipline and truth always triumph. 🏹'
        },
        {
            name: 'Makar Sankranti', emoji: '🪁',
            vars: {
                '--primary': '#F59E0B', '--accent': '#38BDF8', '--festival-accent': '#F59E0B'
            },
            banner: 'Tilgul ghya, god god bola! Happy Makar Sankranti! 🪁☀️'
        },
        {
            name: 'Gudi Padwa', emoji: '🪅',
            vars: {
                '--primary': '#F97316', '--accent': '#10B981', '--festival-accent': '#F97316'
            },
            banner: 'गुढीपाडव्याच्या हार्दिक शुभेच्छा! Happy Gudi Padwa! 🪅🌅'
        }
    ];

    /* 4-Year Lunar & Fixed Calendar (2025–2029) */
    const LUNAR_FESTIVALS = {
        'Ganeshotsav': { 2025: [8,27], 2026: [9,14], 2027: [9,4],  2028: [8,23], 2029: [9,11] },
        'Diwali':      { 2025: [10,20],2026: [11,8], 2027: [10,29],2028: [10,17],2029: [11,5]  },
        'Holi':        { 2025: [3,14], 2026: [3,3],  2027: [3,22], 2028: [3,11], 2029: [3,1]   },
        'Navratri':    { 2025: [9,22], 2026: [10,11],2027: [9,30], 2028: [9,19], 2029: [10,8]  },
        'Dussehra':    { 2025: [10,2], 2026: [10,20],2027: [10,9], 2028: [9,27], 2029: [10,17] },
        'Gudi Padwa':  { 2025: [3,30], 2026: [3,19], 2027: [4,7],  2028: [3,27], 2029: [3,16]  }
    };

    const FIXED_FESTIVALS = {
        'Independence Day': { month: 8,  day: 15, duration: 1 },
        'Republic Day':     { month: 1,  day: 26, duration: 1 },
        'Makar Sankranti':  { month: 1,  day: 14, duration: 2 }
    };

    /* ════════════════════════════════════════════
       2. TIME-SYNCED BIOMES & LIVE IST CLOCK
    ════════════════════════════════════════════ */
    function syncBiomeAndClock() {
        const now = new Date();

        /* 1. Update Live Header Clock */
        const clockEl = document.getElementById('digital-clock');
        const dateEl  = document.getElementById('digital-date');
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            }).toUpperCase();
        }
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
            });
        }

        /* 2. Check Biome Mode (URL param or saved mode or Auto) */
        const html = document.documentElement;
        let savedMode = 'auto';
        try {
            const urlBiome = new URLSearchParams(window.location.search).get('biome');
            if (urlBiome && ['morning', 'focus', 'cosmic'].includes(urlBiome)) {
                savedMode = urlBiome;
            } else {
                savedMode = localStorage.getItem('sf_biome_mode') || 'auto';
            }
        } catch (_) {}

        const h = now.getHours();
        let activeBiome = 'cosmic';
        let activeTheme = 'dark';

        if (savedMode === 'auto') {
            if (h >= 5 && h < 12) {
                activeBiome = 'morning';
                activeTheme = 'light';
            } else if (h >= 12 && h < 18) {
                activeBiome = 'focus';
                activeTheme = 'dark';
            } else {
                activeBiome = 'cosmic';
                activeTheme = 'dark';
            }
        } else if (savedMode === 'morning' || savedMode === 'light') {
            activeBiome = 'morning';
            activeTheme = 'light';
        } else if (savedMode === 'focus') {
            activeBiome = 'focus';
            activeTheme = 'dark';
        } else {
            activeBiome = 'cosmic';
            activeTheme = 'dark';
        }

        html.setAttribute('data-biome', activeBiome);
        html.setAttribute('data-theme', activeTheme);

        const biomeBadge = document.getElementById('biome-badge');
        if (biomeBadge) {
            const labels = {
                morning: '🌅 Morning Dew Biome',
                focus:   '🎯 Deep Focus Biome',
                cosmic:  '🌌 Cosmic Aurora Biome'
            };
            biomeBadge.textContent = `${labels[activeBiome] || labels.cosmic}${savedMode === 'auto' ? ' (Auto)' : ''}`;
        }
    }

    function cycleBiome() {
        const order = ['auto', 'cosmic', 'morning', 'focus'];
        let cur = 'auto';
        try { cur = localStorage.getItem('sf_biome_mode') || 'auto'; } catch (_) {}
        const next = order[(order.indexOf(cur) + 1) % order.length];
        try {
            localStorage.setItem('sf_biome_mode', next);
            localStorage.setItem('sf_theme', next === 'morning' ? 'light' : 'dark');
        } catch (_) {}
        syncBiomeAndClock();
        const names = {
            auto:    '🔄 Auto Time-Synced Biome',
            cosmic:  '🌌 Cosmic Aurora (Dark)',
            morning: '🌅 Morning Dew (High-Contrast Light)',
            focus:   '🎯 Deep Focus (Slate Dark)'
        };
        if (window.App && App.showToast) App.showToast(`Theme: ${names[next]}`, 'info');
    }

    /* ════════════════════════════════════════════
       3. FESTIVAL & BIRTHDAY ENGINE
    ════════════════════════════════════════════ */
    function _clearFestivalVars() {
        const styleEl = document.getElementById('sf-theme-vars');
        if (styleEl) styleEl.textContent = '';
        document.getElementById('festival-banner')?.remove();
        document.documentElement.removeAttribute('data-festival');
    }

    function _isFestivalToday(name, y, m, d) {
        if (FIXED_FESTIVALS[name]) {
            const f = FIXED_FESTIVALS[name];
            return m === f.month && d >= f.day && d < (f.day + f.duration);
        }
        if (LUNAR_FESTIVALS[name] && LUNAR_FESTIVALS[name][y]) {
            const [fm, fd] = LUNAR_FESTIVALS[name][y];
            const start = new Date(y, fm - 1, fd);
            const curr  = new Date(y, m - 1, d);
            const diff  = Math.round((curr - start) / 86400000);
            const span  = (name === 'Ganeshotsav') ? 10 : (name === 'Navratri' ? 8 : (name === 'Diwali' ? 4 : 1));
            return diff >= 0 && diff <= span;
        }
        return false;
    }

    function applyFestivalTheme() {
        _clearFestivalVars();
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const d = now.getDate();

        /* March 11 Birthday Check for Prathmesh! */
        if (m === 3 && d === 11) {
            _showBanner('🎂 Happy Birthday Prathmesh! Keep aiming for ISRO and shining bright! 🚀✨', '🎉');
            setTimeout(() => {
                if (window.Dashboard && Dashboard.launchConfetti) Dashboard.launchConfetti();
            }, 600);
        }

        for (const fest of FESTIVALS) {
            if (_isFestivalToday(fest.name, y, m, d)) {
                let styleEl = document.getElementById('sf-theme-vars');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'sf-theme-vars';
                    document.head.appendChild(styleEl);
                }
                const rules = Object.entries(fest.vars).map(([k, v]) => `${k}:${v};`).join('\n  ');
                styleEl.textContent = `:root {\n  ${rules}\n}`;
                _showBanner(fest.banner, fest.emoji);
                document.documentElement.setAttribute('data-festival', fest.name);
                return fest.name;
            }
        }
        return null;
    }

    function _showBanner(text, emoji) {
        document.getElementById('festival-banner')?.remove();
        const banner = document.createElement('div');
        banner.id = 'festival-banner';
        banner.className = 'festival-banner';
        banner.innerHTML = `
            <span class="festival-banner-emoji">${emoji}</span>
            <span class="festival-banner-text">${text}</span>
            <button class="festival-banner-close" aria-label="Dismiss">✕</button>
        `;
        banner.querySelector('.festival-banner-close')?.addEventListener('click', () => banner.remove());
        document.getElementById('app-header')?.after(banner);
    }

    /* ════════════════════════════════════════════
       4. EXAM DANGER LEVEL UI
    ════════════════════════════════════════════ */
    function applyExamDanger(daysUntilExam) {
        const widget = document.getElementById('exam-countdown-widget');
        const body   = document.body;
        const styleEl = document.getElementById('sf-exam-danger-vars');

        body.classList.remove('exam-warning', 'exam-danger');
        widget?.classList.remove('pulse-warning', 'pulse-danger');
        if (styleEl) styleEl.textContent = '';

        if (daysUntilExam === null || daysUntilExam === undefined || daysUntilExam > 7) return;

        if (daysUntilExam <= 3) {
            body.classList.add('exam-danger');
            widget?.classList.add('pulse-danger');
        } else {
            body.classList.add('exam-warning');
            widget?.classList.add('pulse-warning');
        }
    }

    async function init() {
        syncBiomeAndClock();
        if (_clockTimer) clearInterval(_clockTimer);
        _clockTimer = setInterval(syncBiomeAndClock, 1000);

        applyFestivalTheme();

        try {
            const exams = await DB.getExams();
            const today = DB.todayStr();
            const activeOrUpcoming = exams.filter(e => (e.endDate || e.date) >= today);
            if (activeOrUpcoming.length > 0) {
                activeOrUpcoming.sort((a, b) => (a.startDate || a.date).localeCompare(b.startDate || b.date));
                const nearest = activeOrUpcoming[0];
                const start = nearest.startDate || nearest.date;
                const days = start <= today ? 0 : Math.ceil((new Date(start + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
                applyExamDanger(days);
            }
        } catch (_) {}
    }

    return {
        init,
        syncBiomeAndClock,
        cycleBiome,
        applyFestivalTheme,
        applyExamDanger
    };
})();