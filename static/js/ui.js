// UI Controls

import { gameState } from './gameState.js';
import { FEATURES } from './config.js';

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
    gameState.nightModeEnabled = isNightMode;
    const toggle = document.getElementById('night-mode-toggle');
    if (toggle) {
        toggle.checked = isNightMode;
    }
}

function saveNightMode(isNightMode) {
    localStorage.setItem('nightMode', isNightMode);
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const nightModeToggle = document.getElementById('night-mode-toggle');

    // Load preferences
    loadDarkMode();
    if (FEATURES.NIGHT_MODE) {
        loadNightMode();
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

    // Handle night mode toggle
    if (FEATURES.NIGHT_MODE && nightModeToggle) {
        nightModeToggle.addEventListener('change', (e) => {
            const isNightMode = e.target.checked;
            gameState.nightModeEnabled = isNightMode;
            saveNightMode(isNightMode);
        });
    }
}