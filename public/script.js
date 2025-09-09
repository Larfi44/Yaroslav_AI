// ---------- Config (replace locally if testing) ----------
const API_URL = '/api/server';
const MODEL = 'mistralai/mistral-7b-instruct:free';

// ---------- Browser Check ----------
(function() {
    const ua = navigator.userAgent;
    if (/YaBrowser|Edg|MSIE|Trident/.test(ua)) {
        document.body.innerHTML = `
            <div style="position: fixed; inset: 0; background: #111; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px; font-family: sans-serif;">
                <h2 style="margin-bottom: 15px;">Yandex browser and Microsoft Edge is blocked due the sanctions from Yarik Studio.</h2>
                <p style="margin-bottom: 20px;">Please, try another browser. If need, type in tech support.</p>
                <p style="margin-bottom: 25px; font-style: italic;">Яндекс Браузер и Microsoft Edge заблокированы из-за санкций со стороны Yarik Studio. Пожалуйста, попробуйте другой браузер. Если нужно, напишите в техподдержку.</p>
                <button id="blocked-support-btn" class="btn-primary" style="width: auto; padding: 10px 20px;">Tech support</button>
            </div>
        `;
        document.getElementById('blocked-support-btn').addEventListener('click', () => {
            window.open('https://larfi44.github.io/Yarik_Studio.github.io/support.html', '_blank');
        });
        throw new Error("Browser blocked"); // Stop further script execution
    }
})();

// ---------- LocalStorage keys ----------
const LS_KEY = 'yaroslav_ai_chats_v1';
const LS_SETTINGS = 'yaroslav_ai_settings_v1';
const MAX_MESSAGES_PER_CHAT = 50;

function uid() { return 'id_' + Math.random().toString(36).slice(2,10); }
function saveChats(chats) { localStorage.setItem(LS_KEY, JSON.stringify(chats)); }
function loadChats() { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') || []; } catch(e) { return []; } }
function saveSettings(s) { localStorage.setItem(LS_SETTINGS, JSON.stringify(s)); }
function loadSettings() { try { return JSON.parse(localStorage.getItem(LS_SETTINGS) || 'null') || {}; } catch(e) { return {}; } }

// ---------- DOM references ----------
const chatsEl = document.getElementById('chats');
const chatArea = document.getElementById('chat-area');
const newChatBtn = document.getElementById('new-chat');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const modeStandardBtn = document.getElementById('mode-standard');
const modeFastBtn = document.getElementById('mode-fast');

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.querySelector('.sidebar'); // Assuming .sidebar is the correct class

const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('ui-close-settings');
const langBtns = document.querySelectorAll('.lang-btn');
const userNameInput = document.getElementById('user-name');
const aboutYouInput = document.getElementById('about-you');
const supportBtn = document.getElementById('support-btn');
const overlay = document.getElementById('overlay');
const langBadge = document.getElementById('lang-badge');

// Onboarding DOM refs
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingUserNameInput = document.getElementById('onboarding-user-name');
const onboardingAboutYouInput = document.getElementById('onboarding-about-you');
const onboardingLangBtns = document.querySelectorAll('.onboarding-lang-btn');
const onboardingSaveBtn = document.getElementById('onboarding-save');
const onboardingSupportBtn = document.getElementById('onboarding-support-btn');

const themeBtns = document.querySelectorAll('.theme-btn');


// UI text elements for localization
const ui = {
    chats: document.getElementById('ui-chats'),
    new: document.getElementById('ui-new'),
    developed: document.getElementById('ui-developed'),
    settings: document.getElementById('ui-settings'),
    settingsTitle: document.getElementById('ui-settings-title'),
    languageLabel: document.getElementById('ui-language-label'),
    whatName: document.getElementById('ui-what-name'),
    aboutLabel: document.getElementById('ui-about-label'),
    supportBtn: document.getElementById('support-btn'),
    closeSettingsBtn: document.getElementById('ui-close-settings'),
    standard: document.getElementById('ui-standard'),
    fast: document.getElementById('ui-fast'),
    themeLabel: document.getElementById('ui-theme-label'),
    themeLightOnboarding: document.getElementById('ui-theme-light-onboarding'),
    themeDarkOnboarding: document.getElementById('ui-theme-dark-onboarding'),
    themeAutoOnboarding: document.getElementById('ui-theme-auto-onboarding'),
    themeLightSettings: document.getElementById('ui-theme-light-settings'),
    themeDarkSettings: document.getElementById('ui-theme-dark-settings'),
    themeAutoSettings: document.getElementById('ui-theme-auto-settings'),
    onboardingSupportBtn: document.getElementById('ui-onboarding-support-btn'),
};

const TRANSLATIONS = {
    en: {
        chats: 'Chats',
        new: 'New',
        developed: 'Developed by <a href="https://larfi44.github.io/Yarik_Studio.github.io/ru/index.html" target="_blank">Yarik Studio</a>',
        settings: 'Settings',
        settingsTitle: 'Settings',
        languageLabel: 'Language',
        whatName: "What should AI call you?",
        aboutLabel: 'About you (optional)',
        supportBtn: 'Tech support',
        standard: 'Standard',
        fast: 'Fast',
        themeLabel: 'Theme',
        themeLight: 'Light',
        themeDark: 'Dark',
        themeAuto: 'Auto',
        close: 'Close',
        yourNamePlaceholder: 'Your name (e.g. Yaroslav)',
        aboutYouPlaceholder: 'Write something about yourself...',
    },
    ru: {
        chats: 'Чаты',
        new: 'Новый',
        developed: 'Разработано <a href="https://larfi44.github.io/Yarik_Studio.github.io/ru/index.html" target="_blank">Yarik Studio</a>',
        settings: 'Настройки',
        settingsTitle: 'Настройки',
        languageLabel: 'Язык',
        whatName: 'Как ИИ должен к вам обращаться?',
        aboutLabel: 'О вас (опционально)',
        supportBtn: 'Техподдержка',
        standard: 'Стандартный',
        fast: 'Быстрый',
        themeLabel: 'Тема',
        themeLight: 'Светлая',
        themeDark: 'Темная',
        themeAuto: 'Авто',
        close: 'Закрыть',
        yourNamePlaceholder: 'Ваше имя (например, Ярослав)',
        aboutYouPlaceholder: 'Напишите что-нибудь о себе...',
    }
};

// ---------- state ----------
let chats = [];
let settings = {};
let activeChatId = null;
let lastMessageTime = 0;
let recognition = null;
let isListening = false;


// ---------- UI rendering ----------
function renderUIStrings() {
    const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;
    ui.chats.textContent = t.chats;
    ui.new.textContent = t.new;
    ui.developed.innerHTML = t.developed;
    ui.settings.textContent = t.settings;
    ui.settingsTitle.textContent = t.settingsTitle;
    ui.languageLabel.textContent = t.languageLabel;
    ui.whatName.textContent = t.whatName;
    ui.aboutLabel.textContent = t.aboutLabel;
    ui.supportBtn.textContent = t.supportBtn;
    ui.standard.textContent = t.standard;
    ui.fast.textContent = t.fast;
    ui.themeLabel.textContent = t.themeLabel;
    ui.themeLightOnboarding.textContent = t.themeLight;
    ui.themeDarkOnboarding.textContent = t.themeDark;
    ui.themeAutoOnboarding.textContent = t.themeAuto;
    ui.themeLightSettings.textContent = t.themeLight;
    ui.themeDarkSettings.textContent = t.themeDark;
    ui.themeAutoSettings.textContent = t.themeAuto;
    ui.closeSettingsBtn.textContent = t.close;
    // placeholder
    userInput.placeholder = settings.language === 'ru' ? 'Введите ваше сообщение...' : 'Type your message here...';
    userNameInput.placeholder = t.yourNamePlaceholder;
    aboutYouInput.placeholder = t.aboutYouPlaceholder;
    // language badge
    langBadge.textContent = settings.language === 'ru' ? 'RU' : 'EN';
    // update active state for lang buttons
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === settings.language));
}

function renderChatsList() {
    chatsEl.innerHTML = '';
    chats.forEach(c => {
        const item = document.createElement('div');
        item.className = 'chat-item' + (c.id === activeChatId ? ' active' : '');
        item.dataset.id = c.id;

        const title = document.createElement('div');
        title.className = 'chat-title';
        title.textContent = c.title || (settings.language === 'ru' ? 'Без названия' : 'Untitled');

        const actions = document.createElement('div');
        actions.className = 'chat-actions';
        const renameBtn = document.createElement('button');
        renameBtn.className = 'small-btn';
        renameBtn.title = settings.language === 'ru' ? 'Переименовать' : 'Rename';
        renameBtn.innerHTML = '<i class="fa fa-pen"></i>';
        const delBtn = document.createElement('button');
        delBtn.className = 'small-btn';
        delBtn.title = settings.language === 'ru' ? 'Удалить' : 'Delete';
        delBtn.innerHTML = '<i class="fa fa-trash"></i>';

        actions.appendChild(renameBtn);
        actions.appendChild(delBtn);

        item.appendChild(title);
        item.appendChild(actions);

        item.addEventListener('click', (e) => {
            if (e.target.closest('.small-btn')) return;
            activeChatId = c.id;
            renderChatsList();
            renderActiveChat();
        });

        renameBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const newTitle = prompt(settings.language === 'ru' ? 'Переименовать чат' : 'Rename chat', c.title || '');
            if (newTitle !== null) {
                c.title = newTitle.trim() || (settings.language === 'ru' ? 'Без названия' : 'Untitled');
                saveChats(chats);
                renderChatsList();
                renderActiveChat();
            }
        });

        delBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (!confirm(settings.language === 'ru' ? 'Удалить этот чат?' : 'Delete this chat?')) return;
            chats = chats.filter(x => x.id !== c.id);
            if (!chats.length) {
                const id = uid();
                chats.push({ id, title: settings.language === 'ru' ? 'Новый чат' : 'New chat', messages: [{ role: 'assistant', content: settings.language === 'ru' ? 'Привет! Меня зовут Yaroslav AI! Чем могу помочь?' : "Hello! My name is Yaroslav AI! How can I help you today?", ts: Date.now() }], createdAt: Date.now() });
            }
            if (activeChatId === c.id) activeChatId = chats[0].id;
            saveChats(chats);
            renderChatsList();
            renderActiveChat();
        });

        chatsEl.appendChild(item);
    });
}

function ensureActiveChat() {
    if (!chats.find(c => c.id === activeChatId)) activeChatId = chats.length > 0 ? chats[0].id : null;
    return chats.find(c => c.id === activeChatId);
}

function createTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'typing-indicator';
    const img = document.createElement('img');
    img.src = 'img/logo%20(dark).svg';
    img.alt = 'loading';
    const txt = document.createElement('div');
    txt.textContent = settings.language === 'ru' ? 'Yaroslav AI думает...' : 'Yaroslav AI is thinking...';
    wrap.appendChild(img);
    wrap.appendChild(txt);
    return wrap;
}

// append message bubble to DOM (name above message, copy button close to bubble)
function appendMessageToDOM(isUser, text, ts) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message ' + (isUser ? 'user-message' : 'ai-message');

    // name row - above the bubble
    const nameRow = document.createElement('div');
    nameRow.className = 'name-row';

    if (isUser) {
        nameRow.textContent = settings.userName || (settings.language === 'ru' ? 'Вы' : 'You');
    } else {
        const logo = document.createElement('img');
        logo.src = 'img/Yaroslav%20AI.svg';
        logo.className = 'ai-logo';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = 'Yaroslav AI';
        nameRow.appendChild(logo);
        nameRow.appendChild(nameSpan);
    }
    wrapper.appendChild(nameRow);

    // msg-row: bubble + copy button (close)
    const row = document.createElement('div');
    row.className = 'msg-row';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy';
    copyBtn.type = 'button';
    copyBtn.title = settings.language === 'ru' ? 'Копировать сообщение' : 'Copy message';
    copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(() => { copyBtn.innerHTML = '<i class="fa fa-copy"></i>'; }, 1000);
        } catch (e) { alert(settings.language === 'ru' ? 'Не удалось скопировать' : 'Copy failed'); }
    });

    // push bubble then copy (copy is close to message)
    row.appendChild(bubble);
    row.appendChild(copyBtn);
    wrapper.appendChild(row);

    // Insert before typing indicator if exists
    const typingInd = document.getElementById('typing-ind');
    if (typingInd) chatArea.insertBefore(wrapper, typingInd);
    else chatArea.appendChild(wrapper);

    // reliable scroll: scrollIntoView + RAF fallback
    try {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (e) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
}

// ---------- events: new chat ----------
newChatBtn.addEventListener('click', () => {
    const id = uid();
    const defaultTitle = settings.language === 'ru' ? 'Новый чат' : 'New chat';
    const newChat = { id, title: defaultTitle, messages: [{ role: 'assistant', content: settings.language === 'ru' ? 'Привет! Меня зовут Yaroslav AI! Чем могу помочь?' : "Hello! My name is Yaroslav AI! How can I help you today?", ts: Date.now() }], createdAt: Date.now() };
    chats.unshift(newChat);
    activeChatId = id;
    saveChats(chats);
    renderChatsList();
    renderActiveChat();
});

// ---------- settings panel handling ----------
function openSettingsPanel() {
    settingsPanel.style.display = 'block';
    settingsPanel.setAttribute('aria-hidden', 'false');
    overlay.style.display = 'block';
    userNameInput.value = settings.userName || '';
    aboutYouInput.value = settings.about || '';
    setTimeout(() => userNameInput.focus(), 120);
    // mark active lang button
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === settings.language));
}
function closeSettingsPanel() {
    settingsPanel.style.display = 'none';
    settingsPanel.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    saveSettings(settings);
    renderUIStrings();
    renderChatsList();
    renderActiveChat();
}

settingsBtn.addEventListener('click', () => {
    if (settingsPanel.style.display === 'block') closeSettingsPanel(); else openSettingsPanel();
});

if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}
overlay.addEventListener('click', () => closeSettingsPanel());
closeSettingsBtn.addEventListener('click', () => closeSettingsPanel());

langBtns.forEach(b => {
    b.addEventListener('click', () => {
        settings.language = b.dataset.lang;
        // toggle active class visually immediately
        langBtns.forEach(bb => bb.classList.toggle('active', bb === b));
        saveSettings(settings);
        renderUIStrings();
        renderChatsList();
        renderActiveChat();
        // Update speech recognition language
        if (recognition) {
            recognition.stop();
            isListening = false;
            voiceBtn.classList.remove('listening');
        }
        initSpeechRecognition();
    });
});

supportBtn.addEventListener('click', () => {
    window.open('https://larfi44.github.io/Yarik_Studio.github.io/support.html', '_blank');
});

userNameInput.addEventListener('input', () => {
    if (userNameInput.value.length > 30) userNameInput.value = userNameInput.value.slice(0,30);
});

userNameInput.addEventListener('change', () => {
    const val = userNameInput.value.trim();
    settings.userName = val ? val.slice(0,30) : (settings.language === 'ru' ? 'Вы' : 'You');
    saveSettings(settings);
    renderChatsList();
    renderActiveChat();
});

aboutYouInput.addEventListener('change', () => {
    settings.about = aboutYouInput.value.slice(0,444);
    saveSettings(settings);
});

// ---------- mode toggle ----------
function setMode(mode) {
    if (mode === 'fast') {
        modeFastBtn.classList.add('active');
        modeStandardBtn.classList.remove('active');
        settings.mode = 'fast';
    } else {
        modeStandardBtn.classList.add('active');
        modeFastBtn.classList.remove('active');
        settings.mode = 'standard';
    }
    saveSettings(settings);
}
modeStandardBtn.addEventListener('click', () => setMode('standard'));
modeFastBtn.addEventListener('click', () => setMode('fast'));

// ---------- theme switcher ----------
function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', prefersDark);
    } else {
        document.body.classList.toggle('dark-theme', theme === 'dark');
    }
}

function setTheme(theme) {
    settings.theme = theme;
    saveSettings(settings);
    applyTheme(theme);

    themeBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
    });
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (settings.theme === 'auto') {
        applyTheme('auto');
    }
});

// ---------- Voice Input (Speech Recognition) ----------
function initSpeechRecognition() {
    voiceBtn.style.display = 'flex'; // Always show
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Speech not supported in this browser';
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = settings.language === 'ru' ? 'ru-RU' : 'en-US';

    recognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.innerHTML = '<i class="fa fa-stop"></i>';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendBtn.click();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fa fa-microphone"></i>';
        // Optional: Show alert for errors like 'no-speech' or 'not-allowed'
        if (event.error === 'not-allowed') {
            alert(settings.language === 'ru' ? 'Микрофон недоступен. Разрешите доступ.' : 'Microphone not allowed. Please grant permission.');
        }
    };

    recognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fa fa-microphone"></i>';
    };

    voiceBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
}

// ---------- system prompt builder ----------
function getSystemPrompt(mode) {
    const lang = settings.language || 'en';
    const userName = settings.userName || (lang === 'ru' ? 'Пользователь' : 'User');
    const aboutUser = settings.about || 'No information provided.';

    let base = `You are Yaroslav AI, a very friendly, male AI assistant developed by Yarik Studio. You understand emotions and often use smiles or emojis.
The user's name is "${userName}".
About the user: "${aboutUser}". Use this information to personalize your responses.`;

    if (lang === 'ru') {
        base += `
IMPORTANT: You MUST ALWAYS respond in Russian.
When the user writes in Russian, you should correct their grammar if you notice mistakes.`;
    } else {
        base += `
IMPORTANT: You MUST ALWAYS respond in English.`;
    }

    if (mode === 'fast') {
        return base + '\nIn FAST mode: provide a short, concise, and quick answer. Use fewer tokens.';
    } else {
        return base + '\nIn STANDARD mode: answer clearly and helpfully with moderate length; include emojis occasionally.';
    }
}


// ---------- sendToAI with robust handling (do NOT save error messages into chat history) ----------
async function sendToAI(userMessage) {
    const chat = ensureActiveChat();
    if (!chat) return;

    if (chat.messages.length >= MAX_MESSAGES_PER_CHAT) {
        alert('The maximum number of messages for this chat has been reached.');
        return;
    }

    // push user message into history
    chat.messages.push({ role: 'user', content: userMessage, ts: Date.now() });
    saveChats(chats);
    appendMessageToDOM(true, userMessage);

    // show typing indicator (create if missing)
    let typingInd = document.getElementById('typing-ind');
    if (!typingInd) {
        typingInd = createTypingIndicator();
        typingInd.id = 'typing-ind';
        chatArea.appendChild(typingInd);
    }
    typingInd.style.display = 'flex';
    chatArea.scrollTop = chatArea.scrollHeight;

    // prepare payload (include recent messages as context)
    const recent = chat.messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
    const payload = {
        model: MODEL,
        messages: [
            { role: 'system', content: getSystemPrompt(settings.mode || 'standard') },
            ...recent
        ]
    };

    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // parse response text (safer for error reporting)
        const text = await resp.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

        if (!resp.ok) {
            const errMsg = (data && data.error && data.error.message) ? data.error.message : `Request failed: ${resp.status} ${resp.statusText}`;
            let shown = '⚠️ API Error: ' + errMsg;
            if (errMsg && errMsg.toLowerCase().includes('user not found')) {
                shown += settings.language==='ru' ? `\n(Причины: неверный ключ, ключ не активирован, или OpenRouter блокирует публичные фронтенд-запросы.)` : `\n(Possible causes: wrong API key, key not activated, or OpenRouter blocks public front-end requests.)`;
                shown += settings.language==='ru' ? `\nРешение: проверьте ключ или используйте сервер-прокси.` : `\nFix: check your key or use a server-side proxy.`;
            }
            appendMessageToDOM(false, shown);
            typingInd.style.display = 'none';
            return;
        }

        if (!data || !data.choices || !data.choices.length || !data.choices[0].message) {
            const fallback = data && data.error && data.error.message ? data.error.message : 'No assistant response was returned.';
            appendMessageToDOM(false, '⚠️ API: ' + fallback);
            typingInd.style.display = 'none';
            return;
        }

        // assistant reply
        const assistantText = data.choices[0].message.content || '';
        appendMessageToDOM(false, assistantText);

        // save assistant message into history
        chat.messages.push({ role: 'assistant', content: assistantText, ts: Date.now() });
        saveChats(chats);

    } catch (err) {
        appendMessageToDOM(false, '⚠️ Network/Error: ' + (err.message || err));
    } finally {
        const t = document.getElementById('typing-ind');
        if (t) t.style.display = 'none';
        requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
    }
}

// ---------- send button wiring ----------
sendBtn.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastMessageTime < 10000) {
        alert('You can send a message every 10 seconds.');
        return;
    }
    lastMessageTime = now;

    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = '';
    sendToAI(text);
});

userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

// ---------- render active chat ----------
function renderActiveChat() {
    const chat = ensureActiveChat();
    chatArea.innerHTML = '';
    if (!chat) return;

    chat.messages.forEach(m => {
        appendMessageToDOM(m.role === 'user', m.content, m.ts || Date.now());
    });
    // attach typing placeholder
    const typing = createTypingIndicator();
    typing.style.display = 'none';
    typing.id = 'typing-ind';
    chatArea.appendChild(typing);
    // reliable scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
    requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; });
    renderChatsList();
}

// ---------- Onboarding Logic ----------
function handleOnboarding() {
    if (settings.onboardingComplete) {
        initializeApp();
        return;
    }

    const ONBOARDING_TRANSLATIONS = {
        en: {
            welcome: 'Welcome to Yaroslav AI!',
            prompt: 'Please set up your profile to get started.',
            nameLabel: 'What should AI call you?',
            aboutLabel: 'About you (optional)',
            langLabel: 'Language',
            saveButton: 'Save and Start',
            supportBtn: 'Tech support',
            themeLabel: 'Theme',
        },
        ru: {
            welcome: 'Добро пожаловать в Yaroslav AI!',
            prompt: 'Пожалуйста, настройте свой профиль для начала работы.',
            nameLabel: 'Как ИИ должен к вам обращаться?',
            aboutLabel: 'О вас (опционально)',
            langLabel: 'Язык',
            saveButton: 'Сохранить и начать',
            supportBtn: 'Техподдержка',
            themeLabel: 'Тема',
        }
    };

    const content = onboardingModal.querySelector('.onboarding-content');
    const h2 = content.querySelector('h2');
    const p = content.querySelector('p');
    const nameLabel = content.querySelector('label[for="onboarding-user-name"]');
    const aboutLabel = content.querySelector('label[for="onboarding-about-you"]');
    const langLabel = content.querySelector('.onboarding-row:nth-of-type(3) > label');
    const onboardingThemeLabel = document.getElementById('ui-onboarding-theme-label');
    const onboardingThemeBtns = document.querySelectorAll('#onboarding-modal .theme-btn');
    const onboardingSupportBtn = document.getElementById('onboarding-support-btn');


    function renderOnboardingUI(lang) {
        const t = ONBOARDING_TRANSLATIONS[lang];
        h2.textContent = t.welcome;
        p.textContent = t.prompt;
        nameLabel.textContent = t.nameLabel;
        aboutLabel.textContent = t.aboutLabel;
        langLabel.textContent = t.langLabel;
        onboardingSaveBtn.textContent = t.saveButton;
        onboardingSupportBtn.textContent = t.supportBtn;
        onboardingThemeLabel.textContent = t.themeLabel;

        const themeTranslations = TRANSLATIONS[lang] || TRANSLATIONS.en;
        ui.themeLightOnboarding.textContent = themeTranslations.themeLight;
        ui.themeDarkOnboarding.textContent = themeTranslations.themeDark;
        ui.themeAutoOnboarding.textContent = themeTranslations.themeAuto;

        onboardingUserNameInput.placeholder = themeTranslations.yourNamePlaceholder;
        onboardingAboutYouInput.placeholder = themeTranslations.aboutYouPlaceholder;
    }

    onboardingModal.style.display = 'flex';
    let selectedLang = 'en'; // Default to English
    const browserLanguage = navigator.language.toLowerCase();
    if (browserLanguage.startsWith('ru') || browserLanguage.startsWith('be')) {
        selectedLang = 'ru';
    }
    let selectedTheme = 'auto'; // Default theme

    // Set default state
    renderOnboardingUI(selectedLang);
    onboardingLangBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === selectedLang));
    onboardingThemeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === selectedTheme));


    const checkCanSave = () => {
        const name = onboardingUserNameInput.value.trim();
        onboardingSaveBtn.disabled = !(name && selectedLang);
    };

    onboardingUserNameInput.addEventListener('input', checkCanSave);

    onboardingLangBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedLang = btn.dataset.lang;
            onboardingLangBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOnboardingUI(selectedLang);
            checkCanSave();
        });
    });

    onboardingThemeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTheme = btn.dataset.theme;
            onboardingThemeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    onboardingSaveBtn.addEventListener('click', () => {
        settings.userName = onboardingUserNameInput.value.trim();
        settings.about = onboardingAboutYouInput.value.trim();
        settings.language = selectedLang;
        settings.theme = selectedTheme;
        settings.onboardingComplete = true;
        settings.mode = 'standard'; // default mode

        saveSettings(settings);
        onboardingModal.style.display = 'none';
        initializeApp();
    });

    onboardingSupportBtn.addEventListener('click', () => {
        window.open('https://larfi44.github.io/Yarik_Studio.github.io/support.html', '_blank');
    });

    checkCanSave(); // Initial check
}

// ---------- Initialization ----------
function initializeApp() {
    chats = loadChats();
    if (!chats.length) {
        const id = uid();
        chats.push({
            id,
            title: settings.language === 'ru' ? 'Новый чат' : 'New chat',
            messages: [{ role: 'assistant', content: settings.language === 'ru' ? 'Привет! Меня зовут Yaroslav AI! Чем могу помочь?' : "Hello! My name is Yaroslav AI! How can I help you today?", ts: Date.now() }],
            createdAt: Date.now()
        });
        saveChats(chats);
    }
    activeChatId = chats[0].id;

    renderUIStrings();
    setMode(settings.mode);
    setTheme(settings.theme || 'auto');
    initSpeechRecognition();
    renderChatsList();
    renderActiveChat();

    // expose basic helpers for debugging
    window.__YA = { chats, settings, saveChats, saveSettings };
}

// --- App Start ---
settings = loadSettings();
handleOnboarding();