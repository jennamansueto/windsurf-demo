// UI Controls
import { gameState, generateStars } from './gameState.js';

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
    if (isNightMode) {
        document.documentElement.setAttribute('data-theme', 'night');
        document.getElementById('dark-mode-toggle').checked = false;
        generateStars();
    }
}

function setNightMode(enabled) {
    gameState.nightMode = enabled;
    localStorage.setItem('nightMode', enabled);
    if (enabled) {
        document.documentElement.setAttribute('data-theme', 'night');
        document.getElementById('dark-mode-toggle').checked = false;
        localStorage.setItem('darkMode', false);
        generateStars();
    } else {
        const isDarkMode = document.getElementById('dark-mode-toggle').checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    }
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const nightModeToggle = document.getElementById('night-mode-toggle');

    // Load preferences
    loadDarkMode();
    loadNightMode();

    // Toggle settings panel
    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
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
        if (isDarkMode) {
            nightModeToggle.checked = false;
            setNightMode(false);
        }
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });

    // Handle night mode toggle
    nightModeToggle.addEventListener('change', (e) => {
        setNightMode(e.target.checked);
    });
}