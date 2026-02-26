// UI Controls
import { ANALYTICS_MODE_ENABLED } from './config.js';
import { gameState } from './gameState.js';

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

// Analytics sidebar DOM references (set in initUI)
let analyticsSidebar, analyticsScore, analyticsAiConsumed, analyticsFoodEaten,
    analyticsSpeed, analyticsTimeAlive, analyticsCells, analyticsSparkline, sparklineCtx;

export function updateAnalyticsSidebar() {
    if (!ANALYTICS_MODE_ENABLED || !gameState.analytics.showSidebar || !analyticsSidebar) return;

    const totalScore = Math.floor(
        gameState.playerCells.reduce((sum, cell) => sum + cell.score, 0)
    );

    // Current speed: average velocity magnitude of all player cells
    let avgSpeed = 0;
    if (gameState.playerCells.length > 0) {
        avgSpeed = gameState.playerCells.reduce((sum, cell) => {
            return sum + Math.sqrt(cell.velocityX * cell.velocityX + cell.velocityY * cell.velocityY);
        }, 0) / gameState.playerCells.length;
    }

    const timeAliveSec = Math.floor((Date.now() - gameState.analytics.timeAliveStart) / 1000);
    const minutes = Math.floor(timeAliveSec / 60);
    const seconds = timeAliveSec % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    analyticsScore.textContent = totalScore;
    analyticsAiConsumed.textContent = gameState.analytics.aiConsumed;
    analyticsFoodEaten.textContent = gameState.analytics.foodEaten;
    analyticsSpeed.textContent = avgSpeed.toFixed(2);
    analyticsTimeAlive.textContent = timeStr;
    analyticsCells.textContent = gameState.playerCells.length;

    // Draw sparkline
    drawSparkline();
}

function drawSparkline() {
    if (!sparklineCtx || !analyticsSparkline) return;

    const history = gameState.analytics.scoreHistory;
    if (history.length < 2) return;

    const w = analyticsSparkline.width;
    const h = analyticsSparkline.height;

    sparklineCtx.clearRect(0, 0, w, h);

    const scores = history.map(entry => entry.score);
    const maxScore = Math.max(...scores, 1);
    const minScore = Math.min(...scores, 0);
    const range = maxScore - minScore || 1;

    sparklineCtx.beginPath();
    sparklineCtx.strokeStyle = '#4CAF50';
    sparklineCtx.lineWidth = 1.5;

    for (let i = 0; i < scores.length; i++) {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((scores[i] - minScore) / range) * (h - 4) - 2;
        if (i === 0) {
            sparklineCtx.moveTo(x, y);
        } else {
            sparklineCtx.lineTo(x, y);
        }
    }
    sparklineCtx.stroke();
}

export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Load dark mode preference
    loadDarkMode();

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

    // Analytics mode setup
    analyticsSidebar = document.getElementById('analytics-sidebar');
    analyticsScore = document.getElementById('analytics-score');
    analyticsAiConsumed = document.getElementById('analytics-ai-consumed');
    analyticsFoodEaten = document.getElementById('analytics-food-eaten');
    analyticsSpeed = document.getElementById('analytics-speed');
    analyticsTimeAlive = document.getElementById('analytics-time-alive');
    analyticsCells = document.getElementById('analytics-cells');
    analyticsSparkline = document.getElementById('analytics-sparkline');

    const analyticsToggleGroup = document.getElementById('analytics-toggle-group');
    const analyticsToggle = document.getElementById('analytics-toggle');

    if (!ANALYTICS_MODE_ENABLED) {
        // Hide analytics UI entirely when flag is off
        if (analyticsSidebar) analyticsSidebar.style.display = 'none';
        if (analyticsToggleGroup) analyticsToggleGroup.style.display = 'none';
        return;
    }

    // Set up sparkline canvas dimensions
    if (analyticsSparkline) {
        analyticsSparkline.width = analyticsSparkline.clientWidth || 196;
        analyticsSparkline.height = analyticsSparkline.clientHeight || 40;
        sparklineCtx = analyticsSparkline.getContext('2d');
    }

    // Wire analytics toggle
    if (analyticsToggle) {
        analyticsToggle.addEventListener('change', (e) => {
            gameState.analytics.showSidebar = e.target.checked;
            if (analyticsSidebar) {
                analyticsSidebar.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    // Move score element down so it doesn't overlap with the analytics sidebar
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
        scoreEl.style.top = '200px';
    }
}
