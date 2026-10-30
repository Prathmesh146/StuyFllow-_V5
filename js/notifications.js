/* ============================================================
   STUDYFLOW V4 (60-FPS EDITION)  |  js/notifications.js
   7:15 PM IST Daily Reminder (Post-Kendra Aarti Study Window)
   ============================================================ */
'use strict';

const Notifications = (() => {
    let _timerId = null;

    async function requestPermission() {
        try {
            if (!('Notification' in window)) return false;
            if (Notification.permission === 'granted') return true;
            if (Notification.permission === 'denied')  return false;
            const res = await Notification.requestPermission();
            return res === 'granted';
        } catch (_) {
            return false;
        }
    }

    function scheduleReminder() {
        if (_timerId) clearTimeout(_timerId);

        const now    = new Date();
        const target = new Date();
        target.setHours(19, 15, 0, 0); // 7:15 PM IST (Right after 6-7 PM Kendra Aarti)

        if (now >= target) target.setDate(target.getDate() + 1);
        const ms = target.getTime() - now.getTime();

        _timerId = setTimeout(async () => {
            if (await requestPermission()) {
                try {
                    new Notification('🚀 StudyFlow — 7:15 PM Focus Window', {
                        body: 'Aarti complete! Your Evening Prime Study Window is open. Let\'s crush today\'s homework!',
                        tag:  'studyflow-daily-reminder'
                    });
                } catch (_) {}
            }
            scheduleReminder();
        }, ms);
    }

    async function init() {
        const savedOn = await DB.getSetting('sf_reminderOn');
        const btn = document.getElementById('notif-btn');
        if (savedOn && ('Notification' in window) && Notification.permission === 'granted') {
            scheduleReminder();
            btn?.classList.add('active');
        }
    }

    async function handleBtnClick() {
        const granted = await requestPermission();
        const btn = document.getElementById('notif-btn');
        if (granted) {
            scheduleReminder();
            await DB.setSetting('sf_reminderOn', true);
            btn?.classList.add('active');
            App.showToast('🔔 7:15 PM (Post-Aarti) daily reminder active!', 'success');
        } else {
            App.showToast('🔕 Enable browser notifications to receive reminders.', 'error');
        }
    }

    return { init, handleBtnClick };
})();