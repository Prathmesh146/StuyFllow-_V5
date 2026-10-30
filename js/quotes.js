/* ============================================================
   STUDYFLOW V4 FLAGSHIP  |  js/quotes.js
   Daily Motivation Engine — 50 Curated Quotes (100% Offline)
   ============================================================ */
'use strict';

const Quotes = (() => {

    const QUOTES = [
        { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
        { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Your limitation—it's only your imagination.", author: "Unknown" },
        { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
        { text: "Great things never come from comfort zones.", author: "Unknown" },
        { text: "Dream it. Wish it. Do it.", author: "Unknown" },
        { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
        { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
        { text: "Dream bigger. Do bigger.", author: "Unknown" },
        { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
        { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
        { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
        { text: "Little things make big days.", author: "Unknown" },
        { text: "It's going to be hard, but hard is not impossible.", author: "Unknown" },
        { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
        { text: "Sometimes we're tested not to show our weaknesses but to discover our strengths.", author: "Unknown" },
        { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
        { text: "Dream, believe, achieve.", author: "Unknown" },
        { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
        { text: "Excellence is not a skill. It is an attitude.", author: "Ralph Marston" },
        { text: "Stay focused, go after your dreams and keep moving toward your goals.", author: "LL Cool J" },
        { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
        { text: "Strive for progress, not perfection.", author: "Unknown" },
        { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
        { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
        { text: "Knowledge is power.", author: "Francis Bacon" },
        { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
        { text: "Learning is a treasure that will follow its owner everywhere.", author: "Chinese Proverb" },
        { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
        { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
        { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
        { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
        { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
        { text: "Our greatest glory is not in never failing, but in rising every time we fall.", author: "Confucius" },
        { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
        { text: "You will never always be motivated. You have to learn to be disciplined.", author: "Unknown" },
        { text: "Consistency is the key to achieving and maintaining momentum.", author: "Darren Hardy" },
        { text: "Every champion was once a contender who refused to give up.", author: "Rocky Balboa" }
    ];

    function _getTodayQuote() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - start) / 86400000);
        return QUOTES[Math.abs(dayOfYear) % QUOTES.length];
    }

    function render() {
        const card = document.getElementById('quote-card');
        if (!card) return;
        const q = _getTodayQuote();
        card.innerHTML = `
            <div class="quote-icon">💡</div>
            <blockquote class="quote-text">"${q.text}"</blockquote>
            <cite class="quote-author">— ${q.author}</cite>
        `;
        card.classList.remove('hidden');
    }

    return { render };
})();