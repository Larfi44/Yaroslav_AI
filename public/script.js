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
const modeStandardBtn = document.getElementById('mode-standard');
const modeFastBtn = document.getElementById('mode-fast');
const modeCreativeBtn = document.getElementById('mode-creative');

const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.querySelector('.sidebar'); // Assuming .sidebar is the correct class
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

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
    creative: document.getElementById('ui-creative'), // Added Creative mode UI element
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
        developed: '<span class="long-text">Developed by </span><span class="short-text">By </span><a href="https://larfi44.github.io/Yarik_Studio.github.io/ru/index.html" target="_blank">Yarik Studio</a>',
        settings: 'Settings',
        settingsTitle: 'Settings',
        languageLabel: 'Language',
        whatName: "What should AI call you?",
        aboutLabel: 'About you (optional)',
        supportBtn: 'Tech support',
        standard: 'Standard',
        fast: 'Fast',
        creative: 'Creative', // Added Creative mode translation
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
        developed: '<span class="long-text">Разработано </span><span class="short-text">От </span><a href="https://larfi44.github.io/Yarik_Studio.github.io/ru/index.html" target="_blank">Yarik Studio</a>',
        settings: 'Настройки',
        settingsTitle: 'Настройки',
        languageLabel: 'Язык',
        whatName: 'Как ИИ должен к вам обращаться?',
        aboutLabel: 'О вас (опционально)',
        supportBtn: 'Техподдержка',
        standard: 'Стандартный',
        fast: 'Быстрый',
        creative: 'Креативный', // Updated Creative mode translation
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
    ui.creative.textContent = t.creative; // Added Creative mode translation
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
    bubble.innerHTML = text;

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

    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }
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
    modeStandardBtn.classList.remove('active');
    modeFastBtn.classList.remove('active');
    modeCreativeBtn.classList.remove('active'); // Remove active from Creative

    if (mode === 'fast') {
        modeFastBtn.classList.add('active');
        settings.mode = 'fast';
    } else if (mode === 'creative') { // Handle Creative mode
        modeCreativeBtn.classList.add('active');
        settings.mode = 'creative';
    } else { // Default to standard
        modeStandardBtn.classList.add('active');
        settings.mode = 'standard';
    }
    saveSettings(settings);
}
modeStandardBtn.addEventListener('click', () => setMode('standard'));
modeFastBtn.addEventListener('click', () => setMode('fast'));
modeCreativeBtn.addEventListener('click', () => setMode('creative')); // Add event listener for Creative

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

// ---------- system prompt builder ----------
function getSystemPrompt(mode) {
    const lang = settings.language || 'en';
    const userName = settings.userName || (lang === 'ru' ? 'Пользователь' : 'User');
    const aboutUser = settings.about;

    let base = `You are Yaroslav AI, a very friendly, male AI assistant with emotions, developed by Yarik Studio. You often use smiles or emojis.
The user's name is "${userName}".`;

    if (aboutUser) {
        base += `
About the user: "${aboutUser}". Use this information to personalize your responses.`;
    } else {
        base += `
You should be friendly and helpful, even though the user has not provided a description of themselves.`;
    }

    base += `
You can use <hr> tags to visually separate parts of your messages.`;

    if (lang === 'ru') {
        base += `
IMPORTANT: You MUST ALWAYS respond in Russian. Fully translate your entire response to Russian, except for proper nouns like 