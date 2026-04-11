const CIRCUMFERENCE = 2 * Math.PI * 43; // ≈ 270.18

// ── Audio ────────────────────────────────────
const SFX = {
  start:  new Audio('../sounds/start_sound.mp3'),
  stop:   new Audio('../sounds/stop_count_sound.mp3'),
  button: new Audio('../sounds/button_sound2.mp3'),
};

let volume = 0.75;

function playSound(sfx) {
  const audio = SFX[sfx];
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

const STRINGS = {
  es: {
    'setup-title':      'Configurar Sesión',
    'setup-subtitle':   '¿Listo para trabajar?',
    'label-focus':      'Enfoque',
    'label-break':      'Descanso',
    'label-cycles':     'Ciclos',
    'btn-start':        'Iniciar Sesión',
    'mode-focus':       'ENFOQUE',
    'mode-break':       'DESCANSO',
    'break-subtitle':   'Hora de descansar',
    'btn-pause':        'Pausar',
    'btn-resume':       'Reanudar',
    'btn-stop':         'Detener',
    'settings-title':   'Configuración',
    'settings-theme':   'Tema',
    'settings-language':'Idioma',
    'settings-volume':  'Volumen',
  },
  en: {
    'setup-title':      'Setup Session',
    'setup-subtitle':   'Ready for some deep work?',
    'label-focus':      'Focus',
    'label-break':      'Break',
    'label-cycles':     'Cycles',
    'btn-start':        'Start Session',
    'mode-focus':       'FOCUS',
    'mode-break':       'BREAK',
    'break-subtitle':   'Time to rest',
    'btn-pause':        'Pause',
    'btn-resume':       'Resume',
    'btn-stop':         'Stop',
    'settings-title':   'Settings',
    'settings-theme':   'Theme',
    'settings-language':'Language',
    'settings-volume':  'Volume',
  }
};

const state = {
  focusMin: 25,
  breakMin: 5,
  cycles: 4,
  currentCycle: 0,
  view: 'home',
  prevView: 'home',
  lang: 'es',
  timeLeft: 0,
  totalTime: 0,
  isPaused: false,
  wasRunningBeforeSettings: false,
  timer: null
};

// ── View switching ──────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  state.view = name;
}

// ── Formatting ──────────────────────────────
function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

// ── Timer ring update ───────────────────────
function updateDisplay() {
  const timeStr = formatTime(state.timeLeft);
  const progress = state.totalTime > 0 ? state.timeLeft / state.totalTime : 1;
  const offset = CIRCUMFERENCE * (1 - progress);

  if (state.view === 'focus') {
    document.getElementById('focus-timer').textContent = timeStr;
    document.getElementById('focus-ring').setAttribute('stroke-dashoffset', offset);
  } else if (state.view === 'break') {
    document.getElementById('break-timer').textContent = timeStr;
    document.getElementById('break-ring').setAttribute('stroke-dashoffset', offset);
  }
}

function updateCycleIndicator() {
  const text = `${state.currentCycle + 1} / ${state.cycles}`;
  document.getElementById('focus-cycle-indicator').textContent = text;
  document.getElementById('break-cycle-indicator').textContent = text;
}

// ── Timer core ──────────────────────────────
function startTimer() {
  clearInterval(state.timer);
  state.isPaused = false;
  resetPauseButton();
  state.timer = setInterval(() => {
    if (state.isPaused) return;
    state.timeLeft--;
    updateDisplay();
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      onTimerEnd();
    }
  }, 1000);
}

function onTimerEnd() {
  playSound('stop');
  if (state.view === 'focus') {
    // Always do break after focus
    beginBreak();
  } else if (state.view === 'break') {
    state.currentCycle++;
    if (state.currentCycle < state.cycles) {
      beginFocus();
    } else {
      // All cycles done → back to home
      state.currentCycle = 0;
      clearInterval(state.timer);
      showView('home');
    }
  }
}

// ── Session control ─────────────────────────
function beginFocus() {
  state.timeLeft = state.focusMin * 60;
  state.totalTime = state.focusMin * 60;
  updateCycleIndicator();
  showView('focus');
  updateDisplay();
  startTimer();
}

function beginBreak() {
  state.timeLeft = state.breakMin * 60;
  state.totalTime = state.breakMin * 60;
  updateCycleIndicator();
  showView('break');
  updateDisplay();
  startTimer();
}

function pauseTimer(view) {
  state.isPaused = !state.isPaused;
  const S = STRINGS[state.lang];
  const icon = document.getElementById(view + '-pause-icon');
  const text = document.getElementById(view + '-pause-text');
  icon.textContent = state.isPaused ? 'play_arrow' : 'pause';
  text.textContent = state.isPaused ? S['btn-resume'] : S['btn-pause'];
}

function resetPauseButton() {
  const S = STRINGS[state.lang];
  ['focus', 'break'].forEach(v => {
    const icon = document.getElementById(v + '-pause-icon');
    const text = document.getElementById(v + '-pause-text');
    if (icon) icon.textContent = 'pause';
    if (text) text.textContent = S['btn-pause'];
  });
}

function stopSession() {
  clearInterval(state.timer);
  state.currentCycle = 0;
  state.isPaused = false;
  resetPauseButton();
  showView('home');
}

// ── Input adjusters ─────────────────────────
document.querySelectorAll('.btn-up, .btn-down').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    const min = parseInt(btn.dataset.min);
    const max = parseInt(btn.dataset.max);
    const suffix = btn.dataset.suffix;
    let val = parseInt(input.dataset.value);

    val += btn.classList.contains('btn-up') ? 1 : -1;
    val = Math.max(min, Math.min(max, val));

    input.dataset.value = val;
    input.value = val + suffix;

    if (targetId === 'input-focus') state.focusMin = val;
    else if (targetId === 'input-break') state.breakMin = val;
    else if (targetId === 'input-cycles') state.cycles = val;
    saveSettings();
  });
});

// ── Button wiring ───────────────────────────
document.getElementById('btn-start').addEventListener('click', () => {
  playSound('start');
  state.currentCycle = 0;
  beginFocus();
});

document.getElementById('focus-pause').addEventListener('click', () => { playSound('button'); pauseTimer('focus'); });
document.getElementById('focus-stop').addEventListener('click', () => { playSound('button'); stopSession(); });

document.getElementById('break-pause').addEventListener('click', () => { playSound('button'); pauseTimer('break'); });
document.getElementById('break-stop').addEventListener('click', () => { playSound('button'); stopSession(); });

// ── Settings navigation ─────────────────────
function openSettings() {
  state.prevView = state.view;
  // Auto-pause timer if it's running
  if ((state.view === 'focus' || state.view === 'break') && !state.isPaused) {
    state.isPaused = true;
    state.wasRunningBeforeSettings = true;
    const icon = document.getElementById(state.view + '-pause-icon');
    const text = document.getElementById(state.view + '-pause-text');
    if (icon) icon.textContent = 'play_arrow';
    if (text) text.textContent = STRINGS[state.lang]['btn-resume'];
  } else {
    state.wasRunningBeforeSettings = false;
  }
  showView('settings');
}

function closeSettings() {
  showView(state.prevView);
}

document.getElementById('home-settings-btn').addEventListener('click', () => { playSound('button'); openSettings(); });
document.getElementById('focus-settings-btn').addEventListener('click', () => { playSound('button'); openSettings(); });
document.getElementById('break-settings-btn').addEventListener('click', () => { playSound('button'); openSettings(); });
document.getElementById('settings-back-btn').addEventListener('click', () => { playSound('button'); closeSettings(); });

// ── Language system ─────────────────────────
function applyLang(lang) {
  state.lang = lang;
  const S = STRINGS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.textContent !== undefined) el.textContent = S[el.dataset.i18n] ?? el.textContent;
  });
  // Keep pause buttons in sync with current paused state
  ['focus', 'break'].forEach(v => {
    const text = document.getElementById(v + '-pause-text');
    if (text) text.textContent = state.isPaused ? S['btn-resume'] : S['btn-pause'];
  });
  // Update lang button styles
  const esBtn = document.getElementById('lang-es');
  const enBtn = document.getElementById('lang-en');
  const activeClass = ['bg-gradient-to-br', 'from-primary', 'to-primary-container', 'text-white', 'font-bold'];
  const inactiveClass = ['bg-surface-container', 'text-on-surface', 'font-medium'];
  if (lang === 'es') {
    esBtn.classList.add(...activeClass);    esBtn.classList.remove(...inactiveClass);
    enBtn.classList.remove(...activeClass); enBtn.classList.add(...inactiveClass);
  } else {
    enBtn.classList.add(...activeClass);    enBtn.classList.remove(...inactiveClass);
    esBtn.classList.remove(...activeClass); esBtn.classList.add(...inactiveClass);
  }
}

document.getElementById('lang-es').addEventListener('click', () => { playSound('button'); applyLang('es'); saveSettings(); });
document.getElementById('lang-en').addEventListener('click', () => { playSound('button'); applyLang('en'); saveSettings(); });

// Init: Spanish by default
applyLang('es');

// ── Theme system ────────────────────────────
const THEMES = {
  noqui: {
    pet:                      '../img/ñoqui.gif',
    primary:                  '#805449',
    primaryContainer:         '#fec4b5',
    onPrimary:                '#fff7f6',
    surface:                  '#fff9ec',
    surfaceContainerLowest:   '#ffffff',
    surfaceContainerLow:      '#fbf3db',
    surfaceContainer:         '#f6eed3',
    surfaceContainerHigh:     '#f0e8cb',
    surfaceContainerHighest:  '#ebe3c2',
    tertiaryContainer:        '#fde9e8',
    onSurface:                '#37331c',
    onSurfaceVariant:         '#655f46',
    onTertiaryContainer:      '#635555',
    borderColor:              '#ffffff',
    ringTrack:                '#ebe3c2',
  },
  chloe: {
    pet:                      null, // TODO: add chloe pet
    primary:                  '#031926',
    primaryContainer:         '#7871A4',
    onPrimary:                '#F2EEF7',
    surface:                  '#A799B7',
    surfaceContainerLowest:   '#F2EEF7',
    surfaceContainerLow:      '#7871A4',
    surfaceContainer:         '#A799B7',
    surfaceContainerHigh:     '#ffff',
    surfaceContainerHighest:  '#A799B7',
    tertiaryContainer:        '#9888A5',
    onSurface:                '#031926',
    onSurfaceVariant:         '#031926',
    onTertiaryContainer:      '#F2EEF7',
    borderColor:              '#A799B7',
    ringTrack:                '#A799B7',
  },
  max: {
    pet:                      null, // TODO: add max pet
    primary:                  '#0094c6',
    primaryContainer:         '#005e7c',
    onPrimary:                '#e0f4ff',
    surface:                  '#040f16',
    surfaceContainerLowest:   '#000022',
    surfaceContainerLow:      '#001242',
    surfaceContainer:         '#001e54',
    surfaceContainerHigh:     '#002a6e',
    surfaceContainerHighest:  '#005e7c',
    tertiaryContainer:        '#001242',
    onSurface:                '#d0eef8',
    onSurfaceVariant:         '#7ab8d0',
    onTertiaryContainer:      '#7ab8d0',
    borderColor:              '#001242',
    ringTrack:                '#005e7c',
  },
  black: {
    pet:                      null, // TODO: add black pet
    primary:                  '#725ac1',
    primaryContainer:         '#8d86c9',
    onPrimary:                '#f7ece1',
    surface:                  '#15161b',
    surfaceContainerLowest:   '#18161e',
    surfaceContainerLow:      '#201e28',
    surfaceContainer:         '#282632',
    surfaceContainerHigh:     '#322f3e',
    surfaceContainerHighest:  '#3c3948',
    tertiaryContainer:        '#1a1730',
    onSurface:                '#f7ece1',
    onSurfaceVariant:         '#cac4ce',
    onTertiaryContainer:      '#cac4ce',
    borderColor:              '#201e28',
    ringTrack:                '#3c3948',
  },
};

function applyTheme(name) {
  const t = THEMES[name];
  if (!t) return;

  // CSS overrides
  document.getElementById('theme-style').textContent = `
    .bg-surface                  { background-color: ${t.surface} !important; }
    .bg-surface-container-low    { background-color: ${t.surfaceContainerLow} !important; }
    .bg-surface-container-lowest { background-color: ${t.surfaceContainerLowest} !important; }
    .bg-surface-container        { background-color: ${t.surfaceContainer} !important; }
    .bg-surface-container-high   { background-color: ${t.surfaceContainerHigh} !important; }
    .bg-surface-container-highest{ background-color: ${t.surfaceContainerHighest} !important; }
    .bg-tertiary-container       { background-color: ${t.tertiaryContainer} !important; }
    .bg-primary-container        { background-color: ${t.primaryContainer} !important; }
    .text-primary                { color: ${t.primary} !important; }
    .text-on-surface             { color: ${t.onSurface} !important; }
    .text-on-surface-variant     { color: ${t.onSurfaceVariant} !important; }
    .text-on-primary             { color: ${t.onPrimary} !important; }
    .text-on-tertiary-container  { color: ${t.onTertiaryContainer} !important; }
    .from-primary                { --tw-gradient-from: ${t.primary} !important; }
    .to-primary-container        { --tw-gradient-to: ${t.primaryContainer} !important; }
    .border-white                { border-color: ${t.borderColor} !important; }
    input[type="range"]::-webkit-slider-thumb { background: ${t.primary} !important; }
    input[type="range"]::-moz-range-thumb     { background: ${t.primary} !important; }
  `;

  // SVG track circles
  document.getElementById('focus-track').setAttribute('stroke', t.ringTrack);
  document.getElementById('break-track').setAttribute('stroke', t.ringTrack);

  // Break ring (solid stroke)
  document.getElementById('break-ring').setAttribute('stroke', t.primary);

  // Focus ring gradient stops
  const stops = document.querySelectorAll('#timerGradient stop');
  if (stops[0]) stops[0].setAttribute('stop-color', t.primary);
  if (stops[1]) stops[1].setAttribute('stop-color', t.primaryContainer);

  // Pet mascot
  const petImg = document.getElementById('pet-image');
  if (t.pet) {
    petImg.src = t.pet;
    petImg.style.display = '';
  } else {
    petImg.style.display = 'none';
  }
}

// Theme button click handler
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('button');
    const name = btn.dataset.theme;
    applyTheme(name);

    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.remove('bg-gradient-to-br', 'from-primary', 'to-primary-container', 'text-white', 'font-bold', 'active-theme');
      b.classList.add('bg-surface-container-high', 'text-on-surface', 'font-medium');
    });
    btn.classList.remove('bg-surface-container-high', 'text-on-surface', 'font-medium');
    btn.classList.add('bg-gradient-to-br', 'from-primary', 'to-primary-container', 'text-white', 'font-bold', 'active-theme');
    saveSettings();
  });
});

// Volume slider
document.getElementById('volume-slider').addEventListener('input', e => {
  volume = e.target.value / 100;
  saveSettings();
});

// ── Persistence ─────────────────────────────
function saveSettings() {
  localStorage.setItem('dorodoro', JSON.stringify({
    theme:     document.querySelector('.theme-btn.active-theme')?.dataset.theme ?? 'noqui',
    lang:      state.lang,
    volume:    Math.round(volume * 100),
    focusMin:  state.focusMin,
    breakMin:  state.breakMin,
    cycles:    state.cycles,
  }));
}

function loadSettings() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem('dorodoro')); } catch (_) {}
  if (!saved) return;

  // Theme
  if (saved.theme) {
    applyTheme(saved.theme);
    document.querySelectorAll('.theme-btn').forEach(b => {
      const active = b.dataset.theme === saved.theme;
      b.classList.toggle('bg-gradient-to-br',        active);
      b.classList.toggle('from-primary',             active);
      b.classList.toggle('to-primary-container',     active);
      b.classList.toggle('text-white',               active);
      b.classList.toggle('font-bold',                active);
      b.classList.toggle('active-theme',             active);
      b.classList.toggle('bg-surface-container-high',!active);
      b.classList.toggle('text-on-surface',          !active);
      b.classList.toggle('font-medium',              !active);
    });
  }

  // Language
  if (saved.lang) applyLang(saved.lang);

  // Volume
  if (saved.volume != null) {
    volume = saved.volume / 100;
    document.getElementById('volume-slider').value = saved.volume;
  }

  // Timer inputs
  function setInput(id, val, suffix) {
    const input = document.getElementById(id);
    input.dataset.value = val;
    input.value = val + suffix;
  }
  if (saved.focusMin) { state.focusMin = saved.focusMin; setInput('input-focus',  saved.focusMin, ' min'); }
  if (saved.breakMin) { state.breakMin = saved.breakMin; setInput('input-break',  saved.breakMin, ' min'); }
  if (saved.cycles)   { state.cycles   = saved.cycles;   setInput('input-cycles', saved.cycles,   '');     }
}

loadSettings();
