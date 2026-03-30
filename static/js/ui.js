// UI Controls
import { FEATURE_FLAGS } from './config.js';
import { gameState } from './gameState.js';

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

function loadNightMode() {
    const isNightMode = localStorage.getItem('nightMode') === 'true';
    gameState.nightMode = isNightMode;
    document.getElementById('night-mode-toggle').checked = isNightMode;
}

function saveNightMode(isNightMode) {
    localStorage.setItem('nightMode', isNightMode);
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const nightModeToggle = document.getElementById('night-mode-toggle');

    // Load dark mode preference
    loadDarkMode();

    // Night mode setup
    if (FEATURE_FLAGS.NIGHT_MODE) {
        const nightModeControl = document.getElementById('night-mode-control');
        nightModeControl.style.display = '';
        loadNightMode();

        nightModeToggle.addEventListener('change', (e) => {
            const isNightMode = e.target.checked;
            gameState.nightMode = isNightMode;
            saveNightMode(isNightMode);
        });
    } else {
        gameState.nightMode = false;
    }

    // Toggle settings panel
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();  // Prevent click from propagating to document
        settingsPanel.classList.toggle('visible');
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
        }
    });

    // Prevent game controls when interacting with settings
    settingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle dark mode toggle
    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });
}
